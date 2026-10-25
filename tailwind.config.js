/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        suki: {
          canvas: "#171512",
          surface: "#201D19",
          raised: "#29241E",
          elevated: "#332C24",
          line: "#40382F",
          ivory: "#F2E9DA",
          sand: "#C8BBA7",
          muted: "#948978",
          emerald: "#78A989",
          emeraldDeep: "#315B45",
          amber: "#D6AB68",
          terracotta: "#C98268",
          champagne: "#D9C18C",
        },
      },
      boxShadow: {
        tactile:
          "0 8px 24px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,244,225,0.06)",
        "tactile-hover":
          "0 12px 30px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,244,225,0.09)",
        pill:
          "0 8px 28px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,244,225,0.10)",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.2, 0.8, 0.2, 1)",
      },
    },
  },
  plugins: [],
};
