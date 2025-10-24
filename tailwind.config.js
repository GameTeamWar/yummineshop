/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      animation: {
        'cart-lines': 'cartLines 2s ease-in-out infinite',
        'cart-top': 'cartTop 2s ease-in-out infinite',
        'cart-wheel1': 'cartWheel1 2s ease-in-out infinite',
        'cart-wheel2': 'cartWheel2 2s ease-in-out infinite',
        'cart-wheel-stroke': 'cartWheelStroke 2s ease-in-out infinite',
        'cart-color-light': 'cartColorLight 3s ease-in-out infinite',
        'cart-color-dark': 'cartColorDark 3s ease-in-out infinite',
        'msg': 'msg 0.3s 13.7s linear forwards',
        'msg-last': 'msgLast 0.3s 14s linear forwards',
      },
    },
  },
  plugins: [],
}