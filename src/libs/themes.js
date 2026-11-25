import themesList from "../themes.json" with { type: "json" };
import { defaultTheme } from "./project.js";

export const getThemeOfFirstModuleFound = (swb = null) => {
	if (!swb) return defaultTheme;

	const rows = swb?.rows ?? [];

	let themeFound = null;
	for (const r of rows) {
		for (const m of r) {
			if (!m.free) {
				themeFound = m.theme;
				break;
			}
		}
		if (themeFound) break;
	}
	return themeFound ?? defaultTheme;
};

export const themeEngineCompatibility = (swb) => {
	let theme = swb?.theme;
	if (!theme) theme = getThemeOfFirstModuleFound(swb);

	if (!(theme?.name ?? "").startsWith("custom|")) {
		theme = {
			...theme,
			name: `custom|${theme.name}`,
		};
	}
	const td = theme?.data;
	if (!td) {
		theme = {
			...theme,
			data: themesList.filter((t) => t.name === theme?.name)[0]?.data,
		};
	}
	return theme;
};
