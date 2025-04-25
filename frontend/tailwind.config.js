/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,jsx,ts,tsx,mdx}",
    ],
    theme: {
      extend: {
        colors: {
            'dark-gray': '#404040',
            'charcoal': '#1e1e1e',
            'accent-red': '#f10000',
            'accent-red-dark': '#d90000',
            'light-gray': '#d9d9d9',
            'near-black': '#0d0d0d',
            'primary-blue': '#2a90ef',
            'primary-blue-dark': '#1a7cd9',
            'dark': '#212121',
          },
          fontFamily: {
            'montserrat': ['Montserrat', 'sans-serif'],
            'roboto': ['Roboto', 'sans-serif'],
            'poppins': ['Poppins', 'sans-serif'],
          },
      },
    },
    plugins: [],
  };
  