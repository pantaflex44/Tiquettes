import {defineConfig, loadEnv} from 'vite'
import react from '@vitejs/plugin-react'
import ogPlugin from 'vite-plugin-open-graph';
import Sitemap from 'vite-plugin-sitemap';
import { VitePWA } from 'vite-plugin-pwa';
import mkcert from 'vite-plugin-mkcert'

import * as pkg from './package.json';


// https://vitejs.dev/config/

export default ({mode}) => {
    const env = loadEnv(mode, './');

    let options = {
        base: env.VITE_APP_BASE,
        plugins: [
            react(),
            VitePWA({
                registerType: 'autoUpdate',
                includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
                manifest: {
                    name: pkg.title,
                    short_name: pkg.title,
                    theme_color: '#ffffff',
                    icons: [
                        {
                            src: "pwa-64x64.png",
                            sizes: "64x64",
                            type: "image/png"
                        },
                        {
                            src: "pwa-192x192.png",
                            sizes: "192x192",
                            type: "image/png"
                        },
                        {
                            src: "pwa-512x512.png",
                            sizes: "512x512",
                            type: "image/png"
                        },
                        {
                            src: "maskable-icon-512x512.png",
                            sizes: "512x512",
                            type: "image/png",
                            purpose: "maskable"
                        }
                    ]
                },
            })
        ],
        build: {
            rollupOptions: {
                external: [
                    "sharp"
                ]
            }
        }
    };

    if (env.VITE_IS_LOCAL === "true") {
        options = {
            ...options, plugins: [
                ...options.plugins,
                mkcert(),
            ]
        };
    }

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
                    robots: [{userAgent: '*', allow: env.VITE_APP_BASE}]
                }),
            ]
        };
    }

    return defineConfig(options);
}