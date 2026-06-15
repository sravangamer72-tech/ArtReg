import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#F1F5F9',
        surface: '#FFFFFF',
        navy: '#0D2B45',
        ocean: '#16537E',
        accent: '#4CA0C2',
        light: '#E6F3FA',
        success: '#2E7D5E',
        muted: '#6B7280',
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 8px rgba(0,0,0,0.06)',
        sidebar: '2px 0 12px rgba(0,0,0,0.18)',
      },
    },
  },
  plugins: [],
} satisfies Config
