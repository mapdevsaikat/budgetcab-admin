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
        'maahi-brand': '#2E3192',
        'maahi-accent': '#00A99D',
        'maahi-warn': '#FFC107',
      },
    },
  },
  plugins: [],
};
export default config;

