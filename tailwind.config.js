/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6C5CE7',
        primaryDark: '#5A47D6',
        primaryTint: '#EDE9FD',
        surface2: '#F0EDFA',
        bg: '#F5F3FC'
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Myanmar', 'sans-serif'],
        display: ['Baloo 2', 'Noto Sans Myanmar', 'sans-serif']
      }
    }
  },
  plugins: []
};
