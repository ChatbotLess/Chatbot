/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ifes: {
          green: {
            50: "#edf8f1",
            100: "#d5efdd",
            200: "#afe0c1",
            300: "#7dcc9d",
            400: "#45ad72",
            500: "#00843d",
            600: "#007236",
            700: "#005a2c",
            800: "#064724",
            900: "#063b20",
            950: "#021f10",
          },
          red: {
            50: "#fff1f1",
            100: "#ffe0e0",
            200: "#ffc7c7",
            300: "#ffa0a0",
            400: "#ff6767",
            500: "#e30613",
            600: "#c80511",
            700: "#a1050e",
            800: "#850910",
            900: "#6f0e13",
            950: "#3d0307",
          },
        },
      },
      screens: {
        xs: "360px",
      },
    },
  },
  plugins: [],
}
