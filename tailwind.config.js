/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        wayang: {
          brown: '#4A2C1D',
          'brown-light': '#6B422B',
          gold: '#D4A843',
          'gold-soft': '#F3E3B6',
          cream: '#FDF8EE',
          'cream-dark': '#F4EAD5',
          terracotta: '#C65D3B',
          'terracotta-dark': '#A3472A',
          charcoal: '#2B211A',
          sage: '#3D7A5A',
        },
      },
      fontFamily: {
        display: ['"Fredoka"', '"Nunito"', 'system-ui', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', '"Nunito"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 8px 24px -6px rgba(74, 44, 29, 0.12)',
        'card-hover': '0 14px 32px -8px rgba(74, 44, 29, 0.18)',
      },
    },
  },
  plugins: [],
};

