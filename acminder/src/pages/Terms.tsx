import { useNavigate } from 'react-router-dom';

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
    <div style={{
      minHeight: '100dvh',
      background: '#F2F3F7',
      fontFamily: '-apple-system, "SF Pro Display", sans-serif',
    }}>
      <div style={{ maxWidth: 480, margin: '0 auto', paddingBottom: 110 }}>

        {/* Status bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 20px 0' }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#0D0D0D' }}>9:41</span>
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px 0' }}>
          <button
            type="button"
            onClick={() => nav(-1)}
            style={{ width: 36, height: 36, borderRadius: 12, background: '#fff', border: '0.5px solid #F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0D0D0D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#0D0D0D' }}>Terms & Privacy</span>
          <div style={{ width: 36 }} />
        </div>

        {/* Last updated */}
        <div style={{ padding: '20px 20px 4px' }}>
          <div style={{ background: '#fff', borderRadius: 18, border: '0.5px solid #F0F0F0', padding: '16px' }}>
            <div style={{ fontSize: 13, color: '#AAAAAA', marginBottom: 6 }}>Last updated</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#0D0D0D' }}>April 10, 2026</div>
          </div>
        </div>

        {/* Intro */}
        <div style={{ padding: '12px 20px 4px' }}>
          <div style={{ background: '#E8470A', borderRadius: 18, padding: '16px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 6 }}>AcMinder Terms of Service</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
              Please read these terms carefully before using AcMinder. By using the app you agree to all terms outlined below.
            </div>
          </div>
        </div>

        {/* Sections */}
        <div style={{ padding: '12px 20px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {TERMS_SECTIONS.map((section, i) => (
            <div
              key={i}
              style={{ background: '#fff', borderRadius: 18, border: '0.5px solid #F0F0F0', padding: '16px' }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0D0D0D', marginBottom: 8 }}>{section.title}</div>
              <div style={{ fontSize: 13, color: '#555555', lineHeight: 1.65 }}>{section.body}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '20px 20px 0', textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: '#AAAAAA' }}>© 2026 AcMinder. All rights reserved.</div>
        </div>
      </div>
    </div>
  );
}
