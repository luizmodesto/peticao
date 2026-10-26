/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        urna: {
          bg: '#e8ecef',
          dark: '#1e242b',
          screen: '#f8fafc',
          green: '#008744',
          orange: '#d9534f',
          keypad: '#2d333b',
          btnOrange: '#ea580c',
          btnGreen: '#16a34a',
          btnWhite: '#f1f5f9',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'urna-key': '0 4px 0 #0f172a, 0 6px 6px rgba(0,0,0,0.3)',
        'urna-key-active': '0 1px 0 #0f172a, 0 2px 2px rgba(0,0,0,0.3)',
        'urna-body': '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
      }
    },
  },
  plugins: [],
};
