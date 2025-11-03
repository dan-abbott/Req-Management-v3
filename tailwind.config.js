/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fresh: {
          green: '#3FB95A',
        },
        gray: {
          darkest: '#111618',
          dark: '#1C2224',
          mid: '#9DA2A5',
          light: '#F4F4F4',
        }
      },
      fontFamily: {
        sans: ['Suisse International', 'system-ui', 'sans-serif'],
        mono: ['Basier Square Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
