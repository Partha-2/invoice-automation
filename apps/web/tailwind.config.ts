import type { Config } from 'tailwindcss';

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: { DEFAULT: '#1A47CC', hover: '#1237A8' },
        success: { DEFAULT: '#0A6E3E', light: '#E6F5EE' },
        warning: { DEFAULT: '#A85500', light: '#FEF3E2' },
        danger: { DEFAULT: '#B8291C', light: '#FEEEEC' },
      },
      fontFamily: {
        sans: ['var(--font-plus-jakarta)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-ibm-plex-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config;