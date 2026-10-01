import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './data/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        valuecart: {
          navy: '#12304A',
          'navy-dark': '#0B1F30',
          'navy-light': '#1A4366',
          green: '#168A5B',
          'green-dark': '#106B47',
          'green-light': '#1FB377',
          'green-accent': '#22B573',
          'green-tint': '#EAF7F0',
          'green-surface': '#F0F9F5',
          'warm-white': '#F8F7F3',
          'text-main': '#1F2933',
          'text-muted': '#64748B',
          border: '#E5E7EB',
          orange: '#F59E0B',
          'orange-light': '#FEF3C7',
          'orange-dark': '#D97706',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(18, 48, 74, 0.05)',
        'card': '0 4px 20px -2px rgba(18, 48, 74, 0.07)',
        'card-hover': '0 12px 30px -4px rgba(18, 48, 74, 0.12)',
        'float': '0 10px 30px rgba(0, 0, 0, 0.1)',
        'header': '0 2px 8px rgba(18, 48, 74, 0.06)',
      },
    },
  },
  plugins: [],
};

export default config;
