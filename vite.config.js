import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { ViteFaviconsPlugin } from 'vite-plugin-favicon';

// https://vitejs.dev/config/

export default ({ mode }) => {
  const env = loadEnv(mode, './');

  return defineConfig({
    base: env.VITE_APP_BASE,
    plugins: [
      react(),
      ViteFaviconsPlugin({
        logo: './public/favicon.svg',
        favicons: {
          appName: "Tiquettes",
          appDescription: "Générateur d'étiquettes pour tableaux / armoires électriques.",
          developerName: "Christophe LEMOINE",
          developerURL: "https://github.com/pantaflex44/Tiquettes",
          background: '#009E4D',
          theme_color: '#333',
          icons: {
            coast: false,
            yandex: false
          }
        }
      })
    ],
  });
}