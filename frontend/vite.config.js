import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import vue from '@vitejs/plugin-vue';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';

// El backend (CatalogoBulk) se publica en http://localhost:3001.
export default defineConfig({
  plugins: [
    vue({ template: { transformAssetUrls } }),
    quasar({
      sassVariables: 'src/styles/quasar-variables.scss'
    })
  ],
  css: {
    preprocessorOptions: {
      // Permite que sass resuelva '@import "src/styles/..."' desde la raíz del proyecto
      sass: {
        loadPaths: [fileURLToPath(new URL('.', import.meta.url))]
      },
      scss: {
        loadPaths: [fileURLToPath(new URL('.', import.meta.url))]
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
});
