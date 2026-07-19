import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      // Aquí puedes mapear los colores/variables de tu style.css legado
      // para que Tailwind y tu CSS convivan con la misma paleta.
    },
  },
  plugins: [],
};

export default config;
