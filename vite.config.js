import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  server:{
    proxy: {
      '/tianditu': {
        target: 'http://t0.tianditu.gov.cn',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/tianditu/, '')
      }
    }
    //host:'0.0.0.0',
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
