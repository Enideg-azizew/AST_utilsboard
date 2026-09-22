import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'LabAST Pro',
        short_name: 'LabAST',
        start_url: '/',
        display: 'standalone',
        background_color: '#f3f4f6',
        theme_color: '#2563eb',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      // WORKBOX CONFIGURATION - MOVED INSIDE VitePWA()
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        // Disable minification to prevent the terser error
        sourcemap: false,
        // Limit cache size to prevent timeout
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
      },
      // Optional: Disable PWA
      // devOptions: {
      //   enabled: false
      // } 
    })
  ],
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Add these build options to help with performance
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        }
      }
    }
  }
})
