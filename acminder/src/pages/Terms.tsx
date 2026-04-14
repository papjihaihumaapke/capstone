import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TERMS_SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: `By accessing or using AcMinder ("the App"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the App.`,
  },
  {
    title: '2. Description of Service',
    body: `AcMinder is a schedule management application designed to help students and professionals organise their academic and work commitments. The App provides scheduling, conflict detection, and calendar integration features.`,
  },
  {
    title: '3. User Accounts',
    body: `You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate. You are solely responsible for all activity that occurs under your account.`,
  },
  {
    title: '4. Data & Privacy',
    body: `We collect only the information necessary to provide the service, including your email address, schedule items you create, and (with your consent) read-only access to your Google Calendar. We do not sell your personal data to third parties. Calendar data is used exclusively to sync events into AcMinder. You may revoke calendar access at any time via your Google account settings.`,
  },
  {
    title: '5. Google Calendar Integration',
    body: `When you connect Google Calendar, AcMinder requests read-only permission to access your calendar events. No events are written to your Google Calendar. You can disconnect this integration at any time from the Settings screen. AcMinder's use of Google user data complies with the Google API Services User Data Policy, including the Limited Use requirements.`,
  },
  {
    title: '6. Acceptable Use',
    body: `You agree not to misuse the App. Prohibited activities include attempting to reverse engineer the App, using the App for any unlawful purpose, attempting to gain unauthorised access to any part of the service, or transmitting harmful or malicious code.`,
  },
  {
    title: '7. Intellectual Property',
    body: `All content, features, and functionality of AcMinder — including but not limited to design, text, graphics, and software — are owned by the AcMinder team and are protected by applicable intellectual property laws.`,
  },
  {
    title: '8. Disclaimers',
    body: `AcMinder is provided "as is" without warranties of any kind. We do not warrant that the App will be error-free or uninterrupted. Conflict detection is provided as a convenience tool; users remain solely responsible for managing their own schedules.`,
  },
  {
    title: '9. Limitation of Liability',
    body: `To the maximum extent permitted by law, the AcMinder team shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the App.`,
  },
  {
    title: '10. Changes to Terms',
    body: `We reserve the right to modify these terms at any time. We will notify users of significant changes via the App. Continued use of the App after changes take effect constitutes acceptance of the revised terms.`,
  },
  {
    title: '11. Contact',
    body: `If you have questions about these terms, please reach out through the App's feedback channel or contact the development team directly.`,
  },
];

export default function Terms() {
  const nav = useNavigate();

  return (
    <div className="min-h-[100dvh] bg-appbg animate-fadeIn pb-32">
      <div className="max-w-[480px] mx-auto pt-10 px-5">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            type="button"
            onClick={() => nav(-1)}
            className="w-9 h-9 rounded-btn bg-surface border border-border flex items-center justify-center cursor-pointer active:scale-95 transition-all text-dark"
          >
            <ArrowLeft size={20} />
          </button>
          <span className="text-h2 font-display text-dark">Terms & Privacy</span>
          <div className="w-9" />
        </div>

        {/* Intro */}
        <div className="bg-orange rounded-card p-5 mb-4">
          <div className="text-bodybold text-white mb-2">AcMinder Terms of Service</div>
          <div className="text-caption text-white/80 leading-relaxed font-body">
            Please read these terms carefully before using AcMinder. By using the app you agree to all terms outlined below.
          </div>
        </div>

        {/* Last updated */}
        <div className="bg-surface rounded-card border border-border p-5 mb-4 flex items-center justify-between">
          <span className="text-caption font-bold text-muted uppercase tracking-widest">Last updated</span>
          <span className="text-body font-semibold text-dark">April 10, 2026</span>
        </div>

        {/* Sections */}
        <div className="flex flex-col gap-3">
          {TERMS_SECTIONS.map((section, i) => (
            <div
              key={i}
              className="bg-surface rounded-card border border-border p-5"
            >
              <h2 className="text-bodybold text-dark mb-2">{section.title}</h2>
              <p className="text-caption text-muted leading-relaxed font-body">{section.body}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 mb-4">
          <div className="text-caption text-muted">© 2026 AcMinder. All rights reserved.</div>
        </div>
      </div>
    </div>
  );
}
