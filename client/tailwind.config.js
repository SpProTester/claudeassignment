/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f5f0ff',
          100: '#ede0ff',
          200: '#ddc5ff',
          300: '#c59aff',
          400: '#a564ff',
          500: '#8b35f7',
          600: '#7600CF',
          700: '#6100a8',
          800: '#4d007d',
          900: '#3a005c',
        },
        brand: {
          DEFAULT: '#7600CF',
          dark:    '#6100a8',
          light:   '#8b35f7',
        },
        surface: {
          DEFAULT: '#ffffff',
          muted:   '#f8f4ff',
          subtle:  '#f3f4f6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card:  '0 2px 8px 0 rgba(118,0,207,0.07), 0 1px 3px 0 rgba(0,0,0,0.06)',
        'card-hover': '0 8px 24px 0 rgba(118,0,207,0.13), 0 2px 6px 0 rgba(0,0,0,0.08)',
        nav:   '0 2px 8px 0 rgba(0,0,0,0.06)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
