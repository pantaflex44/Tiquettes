import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/

export default ({ mode }) => {
  const env = loadEnv(mode, './');

  return defineConfig({
    base: env.VITE_APP_BASE,
    plugins: [react()],
  });
}