/**
 * Tiquettes - Générateur d'étiquettes pour tableaux et armoires électriques
 * Copyright (C) 2024-2026 Christophe LEMOINE
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

function formatURL(url, args = {}) {
	let u = url;
	if (Object.keys(args).length > 0) u += "?";
	const l = Object.keys(args)
		.map((k) => {
			return `${k}=${encodeURIComponent(args[k])}`;
		})
		.join("&");
	return u + l;
}

function fetchURL(filename, args = {}) {
	const url = formatURL(import.meta.env.VITE_APP_API_URL + filename, {
		m: import.meta.env.VITE_APP_MODE,
		...args,
	});
	fetch(url)
		.then((response) => response.text().then((text) => ({ response, text })))
		.then((data) => {
			// biome-ignore lint/correctness/noUnusedVariables: wanted
			let { response, text } = data;
			text = text.trim();
			if (text === "") text = "no content";
			/*if (import.meta.env.VITE_APP_MODE === 'development') {
                console.log(`Fetch response ${response.status} ${response.statusText} from ${url} [${text}]`)
            }*/
		})
		.catch((error) => console.error(error));
}

const isTouchScreen = () => window.matchMedia("(any-pointer:coarse)").matches;
const isMouseScreen = () => window.matchMedia("(any-pointer:fine)").matches;

/*var mobileType = {
    Android: navigator.userAgent.match(/Android/i),
    BlackBerry: navigator.userAgent.match(/BlackBerry/i),
    iOS: navigator.userAgent.match(/iPhone|iPad|iPod/i),
    Opera: navigator.userAgent.match(/Opera Mini/i),
    Windows: navigator.userAgent.match(/IEMobile/i),
    any: mobileType.Android || mobileType.BlackBerry || mobileType.iOS || mobileType.Opera || mobileType.Windows,
    type: mobileType.Android ? 'Android' : (mobileType.BlackBerry ? 'BlackBerry' : (mobileType.iOS ? 'iOS' : (mobileType.Opera ? 'Opera' : (mobileType.Windows ? 'Windows' : '')))),
};

var device = () => {
    const iPad = navigator.platform.indexOf("iPad") != -1;



}*/

const detect = () => {
	const userAgent = navigator.userAgent;

	const browsers = [
		{
			name: "Brave",
			test: () => navigator.brave && navigator.brave.isBrave !== undefined,
			versionRegex: /Chrome\/([0-9.]+)/,
		},
		{
			name: "Yandex Browser",
			test: /YaBrowser/,
			versionRegex: /YaBrowser\/([0-9.]+)/,
		},
		{ name: "Microsoft Edge", test: /Edg/, versionRegex: /Edg\/([0-9.]+)/ },
		{
			name: "Mozilla Firefox",
			test: /Firefox/,
			versionRegex: /Firefox\/([0-9.]+)/,
		},
		{
			name: "Opera",
			test: /Opera|OPR/,
			versionRegex: /(?:Opera|OPR)\/([0-9.]+)/,
		},
		{ name: "Vivaldi", test: /Vivaldi/, versionRegex: /Vivaldi\/([0-9.]+)/ },
		{
			name: "DuckDuckGo Browser",
			test: /DuckDuckGo/,
			versionRegex: /DuckDuckGo\/([0-9.]+)/,
		},
		{
			name: "Tor Browser",
			test: () => userAgent.includes("TorBrowser"),
			versionRegex: /TorBrowser\/([0-9.]+)/,
		},
		{
			name: "UC Browser",
			test: /UCBrowser/,
			versionRegex: /UCBrowser\/([0-9.]+)/,
		},
		{
			name: "Samsung Internet",
			test: /SamsungBrowser/,
			versionRegex: /SamsungBrowser\/([0-9.]+)/,
		},
		{
			name: "QQ Browser",
			test: /QQBrowser/,
			versionRegex: /QQBrowser\/([0-9.]+)/,
		},
		{
			name: "Baidu Browser",
			test: /BaiduBrowser/,
			versionRegex: /BaiduBrowser\/([0-9.]+)/,
		},
		{ name: "Amazon Silk", test: /Silk/, versionRegex: /Silk\/([0-9.]+)/ },
		{
			name: "Vivo Browser",
			test: /VivoBrowser/,
			versionRegex: /VivoBrowser\/([0-9.]+)/,
		},
		{
			name: "Miui Browser",
			test: /MiuiBrowser/,
			versionRegex: /MiuiBrowser\/([0-9.]+)/,
		},

		{
			name: "Google Chrome",
			test: /Chrome(?!.*(?:Edg|Brave|YaBrowser))/,
			versionRegex: /Chrome\/([0-9.]+)/,
		},
		{
			name: "Safari",
			test: /Safari(?!.*Chrome)/,
			versionRegex: /Version\/([0-9.]+)/,
		},
	];

	// Helper to extract version from userAgent using regex
	const getVersion = (regex) => {
		const match = userAgent.match(regex);
		return match ? match[1] : "Unknown Version";
	};

	// Function to detect the operating system
	const detectOS = () => {
		const osMatchers = [
			{ name: "Windows", regex: /Windows NT ([0-9.]+)/ },
			{ name: "MacOS", regex: /Mac OS X ([0-9._]+)/ },
			{ name: "Linux", regex: /Linux/ },
			{ name: "iOS", regex: /iPhone|iPad/ },
			{ name: "Android", regex: /Android ([0-9.]+)/ },
			{ name: "Android", regex: /Android ([0-9.]+)/ },
		];

		for (const os of osMatchers) {
			const match = navigator.userAgent.match(os.regex);
			if (match) {
				return { name: os.name, version: match[1] || "" };
			}
		}
		return { name: "Unknown OS", version: "" };
	};

	// Function to detect the device type
	const detectDeviceType = () => {
		const userAgent = navigator.userAgent.toLowerCase();
		if (/mobi|android|iphone|ipad|windows phone/i.test(userAgent))
			return "Mobile";
		if (/tablet|ipad/i.test(userAgent)) return "Tablet";
		return "Desktop";
	};

	// Detect other browsers
	for (const browser of browsers) {
		const isMatch =
			typeof browser.test === "function"
				? browser.test()
				: browser.test.test(userAgent);

		if (isMatch) {
			return {
				name: browser.name,
				version: getVersion(browser.versionRegex),
				os: detectOS(),
				deviceType: detectDeviceType(),
			};
		}
	}

	// Default fallback
	return {
		name: "Unknown Browser",
		version: "",
		os: detectOS(),
		deviceType: detectDeviceType(),
	};
};

export function statsPush(type, name = "", keys = []) {
	if (type === "screen_size") {
		type = "choice";
		name = "screen_size";
		keys = [`${screen.width}x${screen.height}`];
	}

	if (type === "screen_type") {
		type = "choice";
		name = "screen_type";
		keys = [];
		if (isTouchScreen) {
			keys.push("Touchscreen");
		}
		if (isMouseScreen) {
			keys.push("Desktop");
		}
		if (keys.length === 0) {
			return;
		}
	}

	if (type === "device_type") {
		type = "choice";
		name = "device_type";
		keys = [detect().deviceType];
	}

	if (type === "os") {
		type = "choice";
		name = "os";
		keys = [`${detect().os.name} ${detect().os.version}`.trim()];
	}

	if (type === "browser") {
		type = "choice";
		name = "browser";
		keys = [`${detect().name} ${detect().version}`.trim()];
	}

	fetchURL("stats_push.php", { type, name, keys: keys.join("|") });
}
