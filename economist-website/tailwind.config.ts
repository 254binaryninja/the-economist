import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // Enables dark mode via .dark class
  theme: {
    extend: {
      colors: {
        claude: {
          light1: "#f4ccc2", // pale peach
          light2: "#f4d1dc", // blush
          light3: "#f4d6f6", // lilac
          accent: "#cd6f47", // terra-cotta
          deep: "#602f1a", // deep brown accent
          "emerald-claude": "#50a078",
          "blue-claude": "#4a6fa5",
        },
      },
    },
  },
  plugins: [],
};

export default config;
