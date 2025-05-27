/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        comic: ['Comic Neue', 'cursive'],
        quicksand: ['Quicksand', 'sans-serif'],
        patrick: ['Patrick Hand', 'cursive'],
      },
    },
  },
  plugins: [],
};