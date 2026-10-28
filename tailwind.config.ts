import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gamba: {
          orange: "#FF6B00",
          darkOrange: "#E05A00",
          lightOrange: "#FFF2E6",
          black: "#111827",
          dark: "#1F2937",
          airtel: "#ED1C24",
          moov: "#0055A5",
          whatsapp: "#25D366",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
