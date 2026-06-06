/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'vendora-bg': '#0A0B0F',
        'vendora-surface': '#111318',
        'vendora-hover': '#1A1D26',
        'vendora-nested': '#21242F',
        'vendora-amber': '#F0A500',
        'vendora-text': '#E8EAF0',
        'vendora-muted': '#4A5066',
        'vendora-success': '#10B981',
        'vendora-danger': '#EF4444',
        'vendora-warning': '#F59E0B',
      },
      fontFamily: {
        'display': ['"Bebas Neue"', 'sans-serif'],
        'body': ['Syne', 'sans-serif'],
        'mono': ['"Space Mono"', 'monospace'],
      },
      borderRadius: {
        'vendora': '4px',
      },
    },
  },
  plugins: [],
}
