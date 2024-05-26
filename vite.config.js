import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { ViteFaviconsPlugin } from 'vite-plugin-favicon';
import ogPlugin from 'vite-plugin-open-graph';

// https://vitejs.dev/config/

export default ({ mode }) => {
  const env = loadEnv(mode, './');

  let options = {
    base: env.VITE_APP_BASE,
    plugins: [
      react(),
    ],
  };

  if (mode === 'production') {
    options = {
      ...options, plugins: [
        ...options.plugins,
        ViteFaviconsPlugin({
          logo: './public/favicon.svg',
          favicons: {
            appName: env.VITE_APP_NAME,
            appDescription: env.VITE_APP_DESCRIPTION,
            developerName: env.VITE_APP_AUTHOR,
            developerURL: env.VITE_APP_SOURCES,
            background: '#009E4D',
            theme_color: '#333',
            icons: {
              coast: false,
              yandex: false
            }
          }
        }),
        ogPlugin({
          basic: {
            url: env.VITE_APP_URL,
            title: env.VITE_APP_NAME,
            type: 'website',
            image: `${env.VITE_APP_URL}og.webp`,
            determiner: 'auto',
            description: env.VITE_APP_DESCRIPTION,
            locale: 'fr_FR',
            localeAlternate: ['fr_FR'],
            siteName: env.VITE_APP_NAME,
          },
          twitter: {
            image: `${env.VITE_APP_URL}twitter.webp`,
            card: 'summary_large_image',
            description: env.VITE_APP_DESCRIPTION,
            title: env.VITE_APP_NAME,
            site: env.VITE_APP_URL,
            creator: env.VITE_APP_AUTHOR,
          },
        })
      ]
    };
  }

  return defineConfig(options);
}