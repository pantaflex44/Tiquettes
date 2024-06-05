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
              image: `${env.VITE_APP_URL}og.webp`,
              determiner: 'auto',
              description: pkg.description,
              locale: 'fr_FR',
              localeAlternate: ['fr_FR'],
              siteName: pkg.title,
            },
            twitter: {
              image: `${env.VITE_APP_URL}twitter.webp`,
              card: 'summary_large_image',
              description: pkg.description,
              title: pkg.title,
              site: env.VITE_APP_URL,
              creator: pkg.author,
            },
          }
        ),

        Sitemap({
          hostname: "https://pantaflex44.github.io",
          dynamicRoutes: ['/Tiquettes/'],
          exclude: ['/'],
          outDir: 'dist',
          changefreq: 'daily',
          priority: 1,
          lastmod: new Date(),
          generateRobotsTxt: true,
          robots: [{ userAgent: '*', allow: '/Tiquettes/' }]
        }),
      ]
    };
  }

  return defineConfig(options);
}