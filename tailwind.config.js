module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      animation: {
        cartLines: 'cartLines 2s ease-in-out infinite',
        cartTop: 'cartTop 2s ease-in-out infinite',
        cartWheel1: 'cartWheel1 2s ease-in-out infinite',
        cartWheel2: 'cartWheel2 2s ease-in-out infinite',
        cartWheelStroke: 'cartWheelStroke 2s ease-in-out infinite',
      },
      keyframes: {
        cartLines: {
          '0%, 100%': { opacity: '0' },
          '8%, 92%': { opacity: '1' },
        },
        cartTop: {
          '0%': { strokeDashoffset: '-338' },
          '50%': { strokeDashoffset: '0' },
          '100%': { strokeDashoffset: '338' },
        },
        cartWheel1: {
          '0%': { transform: 'rotate(-0.25turn)' },
          '100%': { transform: 'rotate(2.75turn)' },
        },
        cartWheel2: {
          '0%': { transform: 'rotate(0.25turn)' },
          '100%': { transform: 'rotate(3.25turn)' },
        },
        cartWheelStroke: {
          '0%, 100%': { strokeDashoffset: '81.68' },
          '50%': { strokeDashoffset: '40.84' },
        },
      },
    },
  },
  plugins: [],
}
