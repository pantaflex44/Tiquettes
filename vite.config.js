import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import ogPlugin from 'vite-plugin-open-graph';
import Sitemap from 'vite-plugin-sitemap'

import * as pkg from './package.json';


// https://vitejs.dev/config/

export default ({ mode }) => {
  const env = loadEnv(mode, './');

  let options = {
    base: env.VITE_APP_BASE,
    plugins: [
      react(),
    ]
  };

  if (mode === 'production') {
    options = {
      ...options, plugins: [
        ...options.plugins,

        ogPlugin(
          {
            basic: {
              url: env.VITE_APP_URL,
              title: pkg.title,
              type: 'website',
              image: `${env.VITE_APP_URL}og_1200x630.webp`,
              determiner: 'auto',
              description: pkg.description,
              locale: env.VITE_APP_LOCALE,
              localeAlternate: [env.VITE_APP_LOCALE],
              siteName: pkg.title,
            },
            twitter: {
              image: `${env.VITE_APP_URL}twitter_1280x640.webp`,
              card: 'summary_large_image',
              description: pkg.description,
              title: pkg.title,
              site: env.VITE_APP_URL,
              creator: pkg.author,
            },
          }
        ),

        Sitemap({
          hostname: env.VITE_APP_HOSTNAME,
          dynamicRoutes: [env.VITE_APP_BASE],
          exclude: ['/'],
          outDir: 'dist',
          changefreq: 'daily',
          priority: 1,
          lastmod: new Date(),
          generateRobotsTxt: true,
          robots: [{ userAgent: '*', allow: env.VITE_APP_BASE }]
        }),
      ]
    };
  }

  return defineConfig(options);
}