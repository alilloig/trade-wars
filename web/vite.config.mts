import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Enable minification
    minify: 'terser',
    // Enable gzip compression analysis
    reportCompressedSize: true,
    // Chunk size warning limit (500kb)
    chunkSizeWarningLimit: 500,
    // Rollup options for optimization
    rollupOptions: {
      output: {
        // Let Vite automatically split chunks for optimal loading
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Target modern browsers for smaller bundles
    target: 'es2020',
    // Source maps for production debugging (optional - remove to save space)
    sourcemap: false
  }
});
