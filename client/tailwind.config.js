/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        sans: ['DM Sans', 'sans-serif']
      },
      colors: {
        ink: '#17211f',
        canvas: '#f4f2ec',
        mint: '#b9f3d0',
        coral: '#ff735c',
        moss: '#456453'
      }
    }
  },
  plugins: []
}
