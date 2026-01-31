import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'maahi-brand': '#E00000', // BudgetCab red - primary brand color
        'maahi-accent': '#555555', // Dark gray - secondary color from logo
        'maahi-warn': '#FFC107', // Amber - accent for highlights
      },
    },
  },
  plugins: [],
};
export default config;

