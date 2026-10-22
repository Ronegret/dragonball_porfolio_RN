import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // librerías de terceros en trozos propios: se cachean entre despliegues y se descargan en paralelo
        manualChunks: {
          react: ['react', 'react-dom'],
          motion: ['framer-motion'],
          anim: ['gsap', 'lenis', 'howler'],
        },
      },
    },
  },
})
