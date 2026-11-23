import { VITE_APP_HOSTNAME } from "./config.js";

export function bob() {
	return JSON.stringify({
		mode: process.env.NODE_ENV,
		hostname: VITE_APP_HOSTNAME,
	});
}
