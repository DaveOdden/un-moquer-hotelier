/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      width: {
        'settings-card': '600px',
      },
      height: {
        'content': 'calc(100vh - 128px)',
      },
      minWidth: {
        'menu': '525px',
      },
      maxWidth: {
        'app': '1440px',
      },
      maxHeight: {
        'app': 'calc(100vh - 64px)',
      },
    },
  },
  plugins: [],
}

