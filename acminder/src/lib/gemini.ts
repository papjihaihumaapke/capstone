import type { ScheduleItem } from '../types';

type TimingSuggestion = {
  move_item_id?: string;
  move_item_type?: ScheduleItem['type'] | 'none';
  proposed_start_time?: string;
  proposed_end_time?: string;
  reason: string;
  alternative_times?: Array<{ start_time: string; end_time: string }>;
};

export type GeminiConflictResult = {
  summary: string;
  suggestions: TimingSuggestion[];
};

function extractJsonBalanced(text: string): string | null {
  const first = text.indexOf('{');
  if (first === -1) return null;

  let inString = false;
  let escaped = false;
  let depth = 0;

  for (let i = first; i < text.length; i++) {
    const ch = text[i];

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === '\\') {
        escaped = true;
        continue;
      }
      if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }

    if (ch === '{') depth++;
    if (ch === '}') {
      depth--;
      if (depth === 0) return text.slice(first, i + 1);
      if (depth < 0) return null;
    }
  }

  // If truncated, attempt to balance by appending missing closing braces.
  if (depth > 0 && depth <= 10) {
    return text.slice(first) + '}'.repeat(depth);
  }

  return null;
}

type GeminiModel = {
  name?: string; // e.g. "models/gemini-1.5-flash"
  supportedGenerationMethods?: string[]; // e.g. ["generateContent", ...]
};

let listModelsCache: Promise<GeminiModel[]> | null = null;

function normalizeGeminiText(text: string) {
  // Common formatting from LLMs even when we ask "no markdown fences".
  return text.replace(/```(json)?/g, '').replace(/```/g, '').trim();
}

function safeSnippet(text: string, maxLen: number) {
  const t = text || '';
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen)}...`;
}

async function listGeminiModels(apiKey: string): Promise<GeminiModel[]> {
  if (listModelsCache) return listModelsCache;

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`;
  listModelsCache = fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })
    .then(async (res) => {
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Gemini ListModels failed (${res.status}). ${text ? `Details: ${text}` : ''}`.trim());
      }
      const json = (await res.json()) as any;
      const models = (json?.models || []) as GeminiModel[];
      return Array.isArray(models) ? models : [];
    })
    .catch((e) => {
      listModelsCache = null; // allow retry next time
      throw e;
    });

  return listModelsCache;
}

function getModelId(modelName: string) {
  // "models/gemini-1.5-flash" -> "gemini-1.5-flash"
  const parts = modelName.split('/');
  return parts[parts.length - 1] || modelName;
}

export async function generateConflictWithGemini(input: {
  apiKey: string;
  item_a: ScheduleItem;
  item_b: ScheduleItem;
  conflict_date: string; // yyyy-MM-dd
  overlap_window: { start_time: string; end_time: string };
  close_alternatives: Array<{
    move_item_id: string;
    move_item_type: ScheduleItem['type'];
    alternative_times: Array<{ start_time: string; end_time: string }>;
  }>;
  additional_conflicts?: ScheduleItem[];
}): Promise<GeminiConflictResult> {
  const { apiKey, item_a, item_b, conflict_date, overlap_window, close_alternatives, additional_conflicts = [] } = input;

  const prompt = `Scheduling conflict. DO NOT restate the date. DO NOT restate the conflicting items. Jump immediately into situational advice.

${conflict_date} | ${overlap_window.start_time}-${overlap_window.end_time}
A: ${item_a.type} "${item_a.title}" ${(item_a as any).start_time ?? (item_a as any).due_time ?? ''}-${(item_a as any).end_time ?? ''}
B: ${item_b.type} "${item_b.title}" ${(item_b as any).start_time ?? (item_b as any).due_time ?? ''}-${(item_b as any).end_time ?? ''}
${additional_conflicts.length > 0 ? `Also overlapping: ${additional_conflicts.map(c => `${c.type} "${c.title}" ${(c as any).start_time ?? (c as any).due_time ?? ''}-${(c as any).end_time ?? ''}`).join('; ')}` : ''}
${close_alternatives.length > 0 ? `Alt slots: ${JSON.stringify(close_alternatives)}` : 'No free alt slots.'}

JSON only:
{"summary":"string","suggestions":[{"move_item_id":"string?","move_item_type":"shift|class|assignment|none","proposed_start_time":"HH:MM?","proposed_end_time":"HH:MM?","reason":"string"}]}

Exactly 2 suggestions. Use alt slots if available for first suggestion. Give creative advice for second (e.g. "Ask to leave early", "Submit assignment beforehand"). If assignment involved, suggest completing it early.`.trim();

  const cleanedApiKey = apiKey.trim().replace(/^["']|["']$/g, '');
  const payload = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 700,
      responseMimeType: 'application/json',
    },
  };

  const promptHint = `Prompt length: ${prompt.length} chars.`;

  // Ask Gemini which models are available for this API key.
  // This removes the need to guess model ids (which causes 404s).
  const models = await listGeminiModels(cleanedApiKey);

  const supportedModels = models.filter((m) => {
    const methods = m.supportedGenerationMethods || [];
    return methods.includes('generateContent');
  });

  const preferredSubstrings = [
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-1.0-pro',
    'gemini-pro',
    'gemini-flash',
    'gemini',
  ];

  const ordered = preferredSubstrings
    .flatMap((s) => supportedModels.filter((m) => {
      const name = (m.name || '').toLowerCase();
      return name.includes(s) && !name.includes('tts') && !name.includes('vision') && !name.includes('embedding');
    }))
    // Deduplicate by name
    .filter((m, idx, self) => idx === self.findIndex((x) => x.name === m.name));

  const modelNameCandidates = ordered.length
    ? ordered
    : supportedModels.length
      ? supportedModels
      : models; // final fallback: try whatever is returned

  // For speed: don't try dozens of models. We only need one valid JSON response.
  const limitedCandidates = modelNameCandidates.slice(0, 4);

  const errors: Array<{ model: string; status?: number; details: string }> = [];

  for (const m of limitedCandidates) {
    if (!m.name) continue;
    const modelId = getModelId(m.name);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${encodeURIComponent(
      cleanedApiKey,
    )}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const json = (await res.json()) as any;
      const modelText: string | undefined =
        json?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).filter(Boolean).join('\n') ||
        json?.candidates?.[0]?.content?.parts?.[0]?.text;

      const normalized = modelText ? normalizeGeminiText(modelText) : '';
      // extractJsonBalanced handles nested objects correctly; fall back to raw only if balanced fails
      const extracted =
        normalized && extractJsonBalanced(normalized)
          ? extractJsonBalanced(normalized)
          : normalized.startsWith('{') && normalized.endsWith('}')
            ? normalized
            : null;

      if (!extracted) {
        const finishReason = json?.candidates?.[0]?.finishReason;

        errors.push({
          model: m.name,
          status: res.status,
          details: `No JSON object found in model output. finishReason=${finishReason ?? 'n/a'}. outputSnippet="${safeSnippet(
            normalized,
            220,
          )}".`,
        });
        continue;
      }

      try {
        const parsed = JSON.parse(extracted) as GeminiConflictResult;
        if (!parsed?.summary || !Array.isArray(parsed?.suggestions)) {
          errors.push({
            model: m.name,
            status: res.status,
            details: `JSON shape invalid. outputSnippet="${safeSnippet(extracted, 220)}".`,
          });
          continue;
        }
        return parsed;
      } catch (e: any) {
        errors.push({
          model: m.name,
          status: res.status,
          details: `Failed to parse JSON. error=${e?.message ?? 'unknown'}. outputSnippet="${safeSnippet(
            extracted,
            220,
          )}".`,
        });
        continue;
      }
    }

    const details = await res.text().catch(() => '');

    // Stop immediately on invalid key; no point retrying models.
    if (details.includes('API_KEY_INVALID') || details.includes('API key not valid')) {
      throw new Error(
        `Gemini API key is invalid. Check that \`VITE_GEMINI_API_KEY\` is correct, the key is enabled, the Generative Language API is enabled, and (if you restrict keys) that your app's domain/referrer is allowed.`,
      );
    }

    errors.push({ model: m.name, status: res.status, details: details || '(no response body)' });
  }

  const detailsJoined = errors
    .map((e) => `${e.model} (${e.status ?? 'unknown'}): ${e.details ? e.details : '(no response body)'}`)
    .join(' | ');

  throw new Error(`Gemini API failed (${promptHint}). Tried: ${detailsJoined}`.trim());
}

