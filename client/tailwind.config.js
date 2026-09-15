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
        coral: '#e73d8b',
        moss: '#456453'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' }
        }
      },
      animation: {
        float: 'float 1.8s ease-in-out infinite'
      }
    }
  },
  plugins: []
}
