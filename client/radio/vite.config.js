import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import * as path from "node:path";
import mkcert from "vite-plugin-mkcert";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
      react(),
      mkcert(),
  tailwindcss({})],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
})
