import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0', // Listen on all network interfaces
      port: 3000,
      strictPort: false,
      allowedHosts: env.VITE_ALLOWED_HOSTS
        ? env.VITE_ALLOWED_HOSTS.split(',').map(host => host.trim()).filter(Boolean)
        : [],
      proxy: {
        '/api': {
          target: env.VITE_PROXY_TARGET || 'http://localhost:8001',
          changeOrigin: true,
        }
      }
    }
  }
})

