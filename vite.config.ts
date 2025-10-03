import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ['pdfjs-dist', 'pdf-parse'],
    include: ['groq-sdk', 'mammoth', 'react-pdftotext']
  },
  define: {
    global: 'globalThis',
  },
  build: {
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          'pdf-worker': ['pdfjs-dist'],
          'groq': ['groq-sdk'],
          'resume-parser': ['mammoth', 'react-pdftotext']
        }
      }
    },
    target: 'esnext',
    sourcemap: false,
    chunkSizeWarningLimit: 1000
  },
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cross-Origin-Opener-Policy': 'same-origin'
    }
  }
})