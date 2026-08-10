import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  // Necessário porque o site é publicado em
  // https://leoschmerega.github.io/Controle-Financeiro/ (subdiretório),
  // não na raiz do domínio.
  base: "/Controle-Financeiro/",
  plugins: [react(), tailwindcss(), svgr()],
});
