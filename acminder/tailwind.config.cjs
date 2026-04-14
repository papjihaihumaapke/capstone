/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ── Semantic surface / text ── */
        'appbg':           '#F7F6F4',
        'surface':         '#FFFFFF',
        'primary':         '#1A1A1A',
        'secondary':       '#6B6B6B',
        'tertiary':        '#A8A8A8',
        'border':          'rgba(0,0,0,0.10)',
        'border-emphasis':  'rgba(0,0,0,0.18)',

        /* ── Brand accent ── */
        'accent':          '#6C63FF',
        'accent-light':    '#EEEDFE',

        /* ── Priority system ── */
        'priority-critical':     '#E55B45',
        'priority-critical-bg':  '#FDF1EF',
        'priority-high':         '#EF9F27',
        'priority-high-bg':      '#FEF6E4',
        'priority-medium':       '#6C63FF',
        'priority-medium-bg':    '#EEEDFE',
        'priority-low':          '#1D9E75',
        'priority-low-bg':       '#E1F5EE',
        'priority-resolved':     '#888780',
        'priority-resolved-bg':  '#F1EFE8',

        /* ── Twilio alert badges ── */
        'alert-48h':       '#EF9F27',
        'alert-24h':       '#D85A30',
        'alert-1h':        '#E24B4A',

        /* ── Legacy compat (will remove progressively) ── */
        'dark':            '#1A1A1A',
        'muted':           '#A8A8A8',
        'orange':          '#E55B45',
        'peach':           '#FDF1EF',
        'peachborder':     'rgba(229,91,69,0.25)',
        'peachtext':       '#C44030',
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'micro':   ['11px', { lineHeight: '1.3', fontWeight: '400' }],
        'caption':  ['12px', { lineHeight: '1.5', fontWeight: '400' }],
        'body':     ['14px', { lineHeight: '1.6', fontWeight: '400' }],
        'h3':       ['16px', { lineHeight: '1.3', fontWeight: '500' }],
        'h2':       ['18px', { lineHeight: '1.3', fontWeight: '500' }],
        'h1':       ['24px', { lineHeight: '1.3', fontWeight: '500' }],
        'display':  ['32px', { lineHeight: '1.3', fontWeight: '500' }],
        /* labels */
        'label':    ['12px', { lineHeight: '1.3', fontWeight: '500', letterSpacing: '0.02em' }],
      },
      fontWeight: {
        normal: '400',
        medium: '500',
      },
      borderRadius: {
        'btn':     '10px',
        'card':    '14px',
        'pill':    '100px',
        'modal':   '16px',
        'input':   '10px',
        'avatar':  '50%',
      },
      borderWidth: {
        'half': '0.5px',
        'DEFAULT': '1px',
      },
      spacing: {
        '4.5': '18px',
        '15': '60px',
      },
      width: {
        'sidebar': '240px',
        'sidebar-collapsed': '60px',
      },
      height: {
        'topnav': '64px',
        'btn': '44px',
      },
      maxWidth: {
        'card-onboarding': '480px',
      },
      boxShadow: {
        'none': 'none',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          from: { transform: 'translateX(100%)' },
          to:   { transform: 'translateX(0)' },
        },
        slideOutRight: {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(100%)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        progressBar: {
          from: { width: '0%' },
          to:   { width: '100%' },
        },
        pulseRing: {
          '0%':   { transform: 'scale(1)',   opacity: '0.6' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
      },
      animation: {
        fadeIn:         'fadeIn 0.2s ease-out',
        slideUp:        'slideUp 0.35s ease-out',
        slideInRight:   'slideInRight 0.2s ease-in-out',
        slideOutRight:  'slideOutRight 0.2s ease-in-out',
        shimmer:        'shimmer 1.5s infinite linear',
        progressBar:    'progressBar 1.5s ease-in-out',
        pulseRing:      'pulseRing 1.5s infinite ease-out',
      },
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
      },
      transitionTimingFunction: {
        'hover': 'ease-out',
        'panel': 'ease-in-out',
      },
    },
  },
  plugins: [],
}
