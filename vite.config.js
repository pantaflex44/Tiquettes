import react from "@vitejs/plugin-react";
import { glob } from "glob";
import { defineConfig, loadEnv } from "vite";
import biomePlugin from "vite-plugin-biome";
import mkcert from "vite-plugin-mkcert";
import ogPlugin from "vite-plugin-open-graph";
import { VitePWA } from "vite-plugin-pwa";

import * as pkg from "./package.json" with { type: "json" };

// https://vitejs.dev/config/

export default async ({ mode }) => {
	const env = loadEnv(mode, "./");

	const svgPreloader = () => {
		return {
			name: "no-attribute",
			async transformIndexHtml(html) {
				const images = [];
				const found = await glob(["./public/**/*.svg"]);
				for (const img of found) {
					const filename = img.split(/[\\/]/).pop();
					const filepath = `${env.VITE_APP_BASE}${filename}`;
					const link = `<link rel="preload" as="image" href="${filepath}" fetchpriority="high" />`;
					if (!images.includes(link)) {
						images.push(link);
					}
				}

				html = html.replace(
					/<!--[\s]*SVG_PRELOADER[\s]*-->/gim,
					`<!-- START : SVG PRELOADER -->\n\t${images.join("\n\t")}\n\t<!-- END : SVG PRELOADER -->`,
				);
				return html;
			},
		};
	};

	let options = {
		base: env.VITE_APP_BASE,
		server: {
			port: env.VITE_SERVER_PORT,
		},
		plugins: [
			svgPreloader(),
			react(),
			VitePWA({
				registerType: "autoUpdate",
				includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],
				manifest: {
					name: pkg.title,
					short_name: pkg.title,
					theme_color: "#ffffff",
					icons: [
						{
							src: "pwa-64x64.png",
							sizes: "64x64",
							type: "image/png",
						},
						{
							src: "pwa-192x192.png",
							sizes: "192x192",
							type: "image/png",
						},
						{
							src: "pwa-512x512.png",
							sizes: "512x512",
							type: "image/png",
						},
						{
							src: "maskable-icon-512x512.png",
							sizes: "512x512",
							type: "image/png",
							purpose: "maskable",
						},
					],
				},
			}),
			biomePlugin({
				mode: "check",
				applyFixes: true,
				biomeAdditionalArgs: "--config-path=./biome.json",
			}),
			ogPlugin({
				basic: {
					url: env.VITE_APP_URL,
					title: pkg.title,
					type: "website",
					image: `${env.VITE_APP_URL}og_1200x630.webp`,
					determiner: "auto",
					description: pkg.description,
					locale: env.VITE_APP_LOCALE.replaceAll("-", "_"),
					localeAlternate: [env.VITE_APP_LOCALE.replaceAll("-", "_")],
					siteName: pkg.title,
				},
				twitter: {
					image: `${env.VITE_APP_URL}twitter_1280x640.webp`,
					card: "summary_large_image",
					description: pkg.description,
					title: pkg.title,
					site: env.VITE_APP_URL,
					creator: pkg.author,
				},
			}),
		],
		build: {
			rollupOptions: {
				external: ["sharp"],
				output: {
					manualChunks(id) {
						if (id.includes("node_modules")) {
							return id
								.toString()
								.split("node_modules/")[1]
								.split("/")[0]
								.toString();
						}
					},
				},
			},
		},
	};

	if (env.VITE_IS_LOCAL === "true") {
		options = {
			...options,
			plugins: [...options.plugins, mkcert()],
		};
	}

	return defineConfig(options);
};
