import react from "@vitejs/plugin-react";
import { glob } from "glob";
import { defineConfig, loadEnv } from "vite";
import biomePlugin from "vite-plugin-biome";
import mkcert from "vite-plugin-mkcert";
import ogPlugin from "vite-plugin-open-graph";
import { VitePWA } from "vite-plugin-pwa";
import * as pkg from "./package.json" with { type: "json" };
import {
	VITE_APP_BASE,
	VITE_APP_LOCALE,
	VITE_APP_URL,
	VITE_SERVER_PORT,
} from "./src/libs/config.js";
import { bob } from "./src/libs/essai.js";

// https://vitejs.dev/config/

export default async ({ mode }) => {
	const env = loadEnv(mode, "./");

	const _svgPreloader = () => {
		return {
			name: "no-attribute",
			async transformIndexHtml(html) {
				const images = [];
				const found = await glob(["./public/**/*.svg"]);
				for (const img of found) {
					const filename = img.split(/[\\/]/).pop();
					const filepath = `${VITE_APP_BASE}${filename}`;
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
		base: VITE_APP_BASE,
		server: {
			VITE_SERVER_PORT,
		},
		define: {
			"process.env": env,
		},
		plugins: [
			//svgPreloader(),
			{
				name: "api-handler",
				configureServer(server) {
					server.middlewares.use("/mcp", (_req, res, _next) => {
						res.writeHead(200, { "Content-Type": "application/json" });
						res.end(JSON.stringify({ url: bob() }));
					});
				},
			},
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
					url: VITE_APP_URL,
					title: pkg.title,
					type: "website",
					image: [
						{
							width: 1200,
							url: `${VITE_APP_URL}og_1200x630.webp`,
							height: 630,
							alt: "L'application Tiquettes.fr",
						},
					],
					determiner: "auto",
					description: pkg.description,
					locale: VITE_APP_LOCALE.replaceAll("-", "_"),
					localeAlternate: [VITE_APP_LOCALE.replaceAll("-", "_")],
					siteName: pkg.title,
				},
				twitter: {
					image: [
						{
							width: 1280,
							url: `${VITE_APP_URL}twitter_1280x640.webp`,
							height: 640,
							alt: "L'application Tiquettes.fr",
						},
					],
					card: "summary_large_image",
					description: pkg.description,
					title: pkg.title,
					site: VITE_APP_URL,
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
