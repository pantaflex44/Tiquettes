const configs = {
	commons: {
		VITE_APP_VERSION_RANGE: ">1.3.0",
		VITE_DEFAULT_STEPSIZE: 18,
		VITE_DEFAULT_STEPSPERROW: 13,
		VITE_DEFAULT_ROWS: 4,
		VITE_DEFAULT_ROWHEIGHT: 29,
		VITE_DEFAULT_ID: "M",
		VITE_DEFAULT_ICON: "",
		VITE_DEFAULT_TEXT: "",
		VITE_DEFAULT_DESC: "",
		VITE_DEFAULT_SHOWID: true,
		VITE_DEFAULT_SHOWICON: true,
		VITE_DEFAULT_SHOWTEXT: true,
		VITE_DEFAULT_PRINT_EMPTY: true,
		VITE_DEFAULT_PROJECT_NAME: "Nouveau projet",
		VITE_DEFAULT_PROJECT_TYPE: "R",
		VITE_ROWS_MIN: 1,
		VITE_ROWS_MAX: 15,
		VITE_HEIGHT_MIN: 10,
		VITE_HEIGHT_MAX: 50,
		VITE_ALLOWED_MODULES: [13, 18, 24],
		VITE_VREF_230V: "230V",
		VITE_VREF_400V: "400V",
		VITE_DB_SRCNAME: "Réseau",
		VITE_SOURCES: "",
		VITE_AUTO_ADD_RPS: true,
	},
	local: {
		VITE_APP_MODE: "development",
		VITE_SERVER_PORT: 5173,
		VITE_APP_BASE: "/",
		VITE_APP_LOCALE: "fr-FR",
		VITE_APP_LOCALES: "fr-FR,en-US",
		VITE_APP_HOSTNAME: "http://localhost:5173",
		VITE_APP_URL: "http://localhost:5173/",
		VITE_APP_API_URL: "http://localhost:8080/",
	},
	dev: {
		VITE_APP_MODE: "development",
		VITE_SERVER_PORT: 5173,
		VITE_APP_BASE: "/dev/",
		VITE_APP_LOCALE: "fr-FR",
		VITE_APP_LOCALES: "fr-FR,en-US",
		VITE_APP_HOSTNAME: "https://www.tiquettes.fr",
		VITE_APP_URL: "https://www.tiquettes.fr/dev/",
		VITE_APP_API_URL: "https://www.tiquettes.fr/dev/api/",
	},
	web: {
		VITE_APP_MODE: "production",
		VITE_SERVER_PORT: 5173,
		VITE_APP_BASE: "/app/",
		VITE_APP_LOCALE: "fr-FR",
		VITE_APP_LOCALES: "fr-FR,en-US",
		VITE_APP_HOSTNAME: "https://www.tiquettes.fr",
		VITE_APP_URL: "https://www.tiquettes.fr/app/",
		VITE_APP_API_URL: "https://www.tiquettes.fr/app/api/",
	},
};

export const VITE_APP_MODE = configs[process.env.NODE_ENV].VITE_APP_MODE;
export const VITE_SERVER_PORT = configs[process.env.NODE_ENV].VITE_SERVER_PORT;
export const VITE_APP_BASE = configs[process.env.NODE_ENV].VITE_APP_BASE;
export const VITE_APP_LOCALE = configs[process.env.NODE_ENV].VITE_APP_LOCALE;
export const VITE_APP_LOCALES = configs[process.env.NODE_ENV].VITE_APP_LOCALES;
export const VITE_APP_HOSTNAME =
	configs[process.env.NODE_ENV].VITE_APP_HOSTNAME;
export const VITE_APP_URL = configs[process.env.NODE_ENV].VITE_APP_URL;
export const VITE_APP_API_URL = configs[process.env.NODE_ENV].VITE_APP_API_URL;
export const VITE_APP_VERSION_RANGE = configs.commons.VITE_APP_VERSION_RANGE;
export const VITE_DEFAULT_STEPSIZE = configs.commons.VITE_DEFAULT_STEPSIZE;
export const VITE_DEFAULT_STEPSPERROW =
	configs.commons.VITE_DEFAULT_STEPSPERROW;
export const VITE_DEFAULT_ROWS = configs.commons.VITE_DEFAULT_ROWS;
export const VITE_DEFAULT_ROWHEIGHT = configs.commons.VITE_DEFAULT_ROWHEIGHT;
export const VITE_DEFAULT_ID = configs.commons.VITE_DEFAULT_ID;
export const VITE_DEFAULT_ICON = configs.commons.VITE_DEFAULT_ICON;
export const VITE_DEFAULT_TEXT = configs.commons.VITE_DEFAULT_TEXT;
export const VITE_DEFAULT_DESC = configs.commons.VITE_DEFAULT_DESC;
export const VITE_DEFAULT_SHOWID = configs.commons.VITE_DEFAULT_SHOWID;
export const VITE_DEFAULT_SHOWICON = configs.commons.VITE_DEFAULT_SHOWICON;
export const VITE_DEFAULT_SHOWTEXT = configs.commons.VITE_DEFAULT_SHOWTEXT;
export const VITE_DEFAULT_PRINT_EMPTY =
	configs.commons.VITE_DEFAULT_PRINT_EMPTY;
export const VITE_DEFAULT_PROJECT_NAME =
	configs.commons.VITE_DEFAULT_PROJECT_NAME;
export const VITE_DEFAULT_PROJECT_TYPE =
	configs.commons.VITE_DEFAULT_PROJECT_TYPE;
export const VITE_ROWS_MIN = configs.commons.VITE_ROWS_MIN;
export const VITE_ROWS_MAX = configs.commons.VITE_ROWS_MAX;
export const VITE_HEIGHT_MIN = configs.commons.VITE_HEIGHT_MIN;
export const VITE_HEIGHT_MAX = configs.commons.VITE_HEIGHT_MAX;
export const VITE_ALLOWED_MODULES = configs.commons.VITE_ALLOWED_MODULES;
export const VITE_VREF_230V = configs.commons.VITE_VREF_230V;
export const VITE_VREF_400V = configs.commons.VITE_VREF_400V;
export const VITE_DB_SRCNAME = configs.commons.VITE_DB_SRCNAME;
export const VITE_SOURCES = configs.commons.VITE_SOURCES;
export const VITE_AUTO_ADD_RPS = configs.commons.VITE_AUTO_ADD_RPS;
