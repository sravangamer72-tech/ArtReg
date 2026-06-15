import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#F7F3E8',
        surface: '#EEE9D8',
        navy: '#0D2B45',
        ocean: '#16537E',
        accent: '#4CA0C2',
        light: '#E6F3FA',
        success: '#2E7D5E',
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 16px rgba(13,43,69,0.08)',
        'card-lg': '0 8px 32px rgba(13,43,69,0.14)',
        nav: '0 1px 8px rgba(13,43,69,0.06)',
      },
    },
  },
  plugins: [],
} satisfies Config
