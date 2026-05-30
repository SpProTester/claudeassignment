/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Admin portal uses slate/zinc dark palette
        sidebar: {
          bg: '#0f172a',    // slate-900
          hover: '#1e293b', // slate-800
          active: '#334155', // slate-700
          border: '#1e293b',
          text: '#94a3b8',  // slate-400
          textActive: '#f8fafc', // slate-50
        },
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          500: '#7600CF',
          600: '#6d28d9',
          700: '#5b21b6',
        },
      },
    },
  },
  plugins: [],
};
