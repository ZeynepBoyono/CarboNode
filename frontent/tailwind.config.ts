import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        carbon: {
          bg:      '#050e05',
          card:    '#0b1a0b',
          border:  '#1a3a1a',
          glow:    '#22c55e',
        },
      },
      boxShadow: {
        glow:    '0 0 20px rgba(34,197,94,0.15)',
        'glow-lg': '0 0 40px rgba(34,197,94,0.2)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}

export default config
