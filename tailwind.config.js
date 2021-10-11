/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable global-require */
const colors = require("tailwindcss/colors");

module.exports = {
  purge: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./features/**/components/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    // './src/widgets/**/*.{js,ts,jsx,tsx}',
    "./plugins/data-sources/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.css",
  ],
  mode: "jit",
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        sans: '"Nunito", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",  "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
      },
      colors: {
        "blue-gray": colors.blueGray,
        "true-gray": colors.trueGray,
        "cool-gray": colors.coolGray,
        "warm-gray": colors.warmGray,
        sky: colors.sky,
        teal: colors.teal,
        amber: colors.amber,
      },
      flex: {
        2: "2 1 0",
      },
      cursor: {
        "cursor-help": "cursor-help",
        "ns-resize": "ns-resize",
        "ew-resize": "ew-resize",
        "ne-resize": "ne-resize",
        "nw-resize": "nw-resize",
        "sw-resize": "sw-resize",
        "se-resize": "se-resize",
      },
      outline: {
        green: ["2px solid green", "1px"],
      },
      borderWidth: {
        0.25: "0.25px",
        0.5: "0.5px",
      },
      minHeight: {
        inherit: "inherit",
        16: "4rem",
        24: "6rem",
        48: "12rem",
        "1/2": "50%",
        "1/3": "33.333333%",
        "2/3": "66.666667%",
        "1/4": "25%",
        "2/4": "50%",
        "3/4": "75%",
        "1/5": "20%",
        "2/5": "40%",
        "3/5": "60%",
        "4/5": "80%",
      },
      margin: {
        "-8.5": "-2.125rem",
        "-1.75": "-0.325rem",
      },
      height: {
        4.5: "1.125rem",
      },
      boxShadow: {
        left: "rgba(0, 0, 0, 0.24) 0px 3px 8px, rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px;",
        glow: "rgba(50, 50, 93, 0.15) 0px 50px 100px -20px, rgba(0, 0, 0, 0.1) 0px 30px 60px -30px",
        'pw-footer': "0 2px 4px 1px rgba(0, 0, 0, 0.3)",
      },
      zIndex: {
        60: 60,
      },
      animation: {
        blob: "blob 9s infinite",
      },
      keyframes: {
        blob: {
          "0%": {
            transform: "translate(0, 0) scale(1)",
          },
          "33%": {
            transform: "translate(30px, 50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
          "100%": {
            transform: "translate(0, 0) scale(1)",
          },
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    //     require('@tailwindcss/forms'),
    // require('tailwind-scrollbar-hide'),
  ],
};
