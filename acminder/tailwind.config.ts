import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#F07B5A',
        background: '#FAFAF8',
        card: '#FFFFFF',
        textPrimary: '#1A1A1A',
        textSecondary: '#6B6B6B',
      },
      fontFamily: {
        display: ['Poppins', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.25s ease-out',
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        full: '9999px',
      }
    },
  },
  plugins: [],
} satisfies Config
