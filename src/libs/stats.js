import { statsPush } from "../../public/api/stats";

export const sendChoice = (
	choiceName,
	keys = [],
	unique = false,
	uniqueChoices = [],
	setUniqueChoices = null,
) => {
	if (!setUniqueChoices) return;

	const ks = keys
		.map((k) => (typeof k === "string" ? k.trim() : `${k}`))
		.filter((k) => k !== null);

	if (ks.length === 0) return;

	if (unique && !uniqueChoices.includes(choiceName)) {
		setUniqueChoices((old) => [...old, choiceName]);
		statsPush("choice", choiceName, ks);
	}

	if (!unique) statsPush("choice", choiceName, ks);
};
