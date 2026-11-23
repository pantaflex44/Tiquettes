import { satisfies } from "compare-versions";
import * as pkg from "../../package.json" with { type: "json" };
import schemaSources from "../schema_sources.json" with { type: "json" };
import themesList from "../themes.json" with { type: "json" };
import {
	VITE_APP_VERSION_RANGE,
	VITE_AUTO_ADD_RPS,
	VITE_DEFAULT_DESC,
	VITE_DEFAULT_ICON,
	VITE_DEFAULT_ID,
	VITE_DEFAULT_PROJECT_NAME,
	VITE_DEFAULT_PROJECT_TYPE,
	VITE_DEFAULT_ROWHEIGHT,
	VITE_DEFAULT_ROWS,
	VITE_DEFAULT_STEPSIZE,
	VITE_DEFAULT_STEPSPERROW,
	VITE_DEFAULT_TEXT,
	VITE_SOURCES,
	VITE_VREF_230V,
} from "./config.js";
import { generateUUID } from "./others.js";
import { themeEngineCompatibility } from "./themes.js";

export const defaultFirstpageOptions = {
	infos: {
		// to switchboad.firstPageInfos
		from: {
			logo: null,
			name: null,
			siret: null,
			postalAddress: null,
			email: null,
			phone: null,
		},
		to: {
			name: null,
			postalAddress: null,
			email: null,
			phone: null,
		},
	},
	views: {
		// to printOptions.firstPageView
		projectName: true,
		projectVersion: true,
		projectCreated: true,
		projectUpdated: true,
		projectType: true,
		from: {
			logo: false,
			name: false,
			siret: false,
			postalAddress: false,
			email: false,
			phone: false,
		},
		to: {
			name: false,
			postalAddress: false,
			email: false,
			phone: false,
		},
	},
};

export const defaultPrintOptions = {
	lang: "fr_FR",
	firstPage: false,
	labels: true,
	summary: false,
	schema: false,
	modulelist: false,
	freeModules: false,
	pdfOptions: {
		openWindow: true,
		autoPrint: false,
		schemaGridColor: [230, 230, 230],
		labelsCutLines: true,
		printCurrents: false,
		labelsPrintFormat: "A4",
		schemaPrintFormat: "A4",
		summaryPrintFormat: "A4",
		schemaFolioStart: 1,
		firstPageView: { ...defaultFirstpageOptions.views },
	},
};

export const defaultTheme = themesList.filter((t) => t.default)[0];

export const defaultSources = (VITE_SOURCES ?? "")
	.split("|")
	.filter(
		(id) => id.trim() !== "" && Object.keys(schemaSources).includes(id.trim()),
	)
	.map((id) => ({ ...schemaSources[id], id }));

export const defaultModule = {
	id: "",
	icon: VITE_DEFAULT_ICON === "" ? null : VITE_DEFAULT_ICON,
	text: VITE_DEFAULT_TEXT,
	desc: VITE_DEFAULT_DESC,
	func: "",
	type: "",
	crb: "",
	modtype: "",
	current: "",
	vref: VITE_VREF_230V,
	sensibility: "",
	coef: 0.5,
	pole: "",
	wire: "",
	line: "",
	grp: "",
	parentId: "",
	srcId: "",
	kcId: "",
	kcType: "NO",
	kcOrder: "after",
	partialKc: false,
	onlyChilds: true,
	noAutoId: false,
	free: true,
	span: 1,
	half: "none",
	associateId: "",
};

/**
 * Créé de nouvelles rangées
 * @param {*} steps Largeur des modules
 * @param {*} rowsCount Nombre de rangées
 * @returns Liste des rangées vides nouvellement créées
 */
export const createNewRows = (steps, rowsCount) => {
	return Array(rowsCount)
		.fill([])
		.map((_, i) =>
			Array(steps)
				.fill({ ...defaultModule })
				.map((q, j) => ({
					...q,
					id: `${VITE_DEFAULT_ID}${j + 1 + ((i + 1) * steps - steps)}`,
				})),
		);
};

export const defaultProject = {
	appversion: pkg.version,

	prjid: generateUUID(),
	prjname: VITE_DEFAULT_PROJECT_NAME,
	prjcreated: new Date(),
	prjupdated: new Date(),
	prjversion: 1,
	projectType: VITE_DEFAULT_PROJECT_TYPE,

	theme: defaultTheme,

	height: VITE_DEFAULT_ROWHEIGHT,
	stepsPerRows: VITE_DEFAULT_STEPSPERROW,
	stepSize: VITE_DEFAULT_STEPSIZE,
	rows: createNewRows(VITE_DEFAULT_STEPSPERROW, VITE_DEFAULT_ROWS),

	sources: [...defaultSources],
	autoAddRps: true,
	withGroundLine: false,

	schemaMonitor: false,
	switchboardMonitor: false,

	summaryColumnRow: false,
	summaryColumnPosition: false,
	summaryColumnType: true,
	summaryColumnId: true,
	summaryColumnFunction: true,
	summaryColumnLabel: true,
	summaryColumnDescription: true,

	firstPageInfos: { ...defaultFirstpageOptions.infos },
	printOptions: { ...defaultPrintOptions },
};

/**
 * Vérifie si la version du projet est bien exploitable
 * @param {object} swb Données du tableau électrique
 * @returns True, le projet est exploitable, sinon, False
 */
export const verifyVersion = (swb) => {
	if (!swb.appversion) {
		alert(
			`Ce projet a été réalisé avec une version inconnue de ${pkg.title}.\n\nImpossible de l'éditer.`,
		);
		return false;
	}

	const appVersion = swb.appversion;
	if (!satisfies(appVersion, VITE_APP_VERSION_RANGE)) {
		alert(
			`Ce projet a été réalisé avec une version trop ancienne de ${pkg.title}.\n\nVersion du projet: ${appVersion}\nVersions supportées: ${VITE_APP_VERSION_RANGE}\n\nImpossible de l'éditer.`,
		);
		return false;
	}

	return true;
};

/**
 * Met à jour les données d'un projet en fonction de sa version initiale
 * @param {object} swb Données du tableau électrique
 * @returns Données du tableau électrique mises à jour
 */
export const autoUpdateProjectProperties = (swb) => {
	const theme = themeEngineCompatibility(swb);

	return {
		...swb,

		// <1.5.0  : add project metas
		// >=1.5.0 : convert data types
		prjcreated: swb.prjcreated ? new Date(swb.prjcreated) : new Date(),
		prjupdated: swb.prjupdated ? new Date(swb.prjupdated) : new Date(),
		prjversion: swb.prjversion ? parseInt(swb.prjversion, 10) : 1,
		// <2.0.0
		projectType: swb.projectType ?? VITE_DEFAULT_PROJECT_TYPE,
		withGroundLine:
			swb.withGroundLine === true || swb.withGroundLine === false
				? swb.withGroundLine
				: false,
		schemaMonitor:
			swb.schemaMonitor === true || swb.schemaMonitor === false
				? swb.schemaMonitor
				: false,
		switchboardMonitor:
			swb.switchboardMonitor === true || swb.switchboardMonitor === false
				? swb.switchboardMonitor
				: false,
		summaryColumnRow:
			swb.summaryColumnRow === true || swb.summaryColumnRow === false
				? swb.summaryColumnRow
				: false,
		summaryColumnPosition:
			swb.summaryColumnPosition === true || swb.summaryColumnPosition === false
				? swb.summaryColumnPosition
				: false,
		summaryColumnType:
			swb.summaryColumnType === true || swb.summaryColumnType === false
				? swb.summaryColumnType
				: true,
		summaryColumnId:
			swb.summaryColumnId === true || swb.summaryColumnId === false
				? swb.summaryColumnId
				: true,
		summaryColumnFunction:
			swb.summaryColumnFunction === true || swb.summaryColumnFunction === false
				? swb.summaryColumnFunction
				: true,
		summaryColumnLabel:
			swb.summaryColumnLabel === true || swb.summaryColumnLabel === false
				? swb.summaryColumnLabel
				: true,
		summaryColumnDescription:
			swb.summaryColumnDescription === true ||
			swb.summaryColumnDescription === false
				? swb.summaryColumnDescription
				: true,
		// <2.0.5
		stepSize: swb.stepSize ?? VITE_DEFAULT_STEPSIZE,
		// <2.1.4
		theme,
		// <2.2.2
		prjid: swb.prjid ?? generateUUID(),
		// <2.2.8
		// deprecated: withDb, db
		sources: swb.sources ?? [...defaultSources],
		// <2.2.9
		autoAddRps: swb.autoAddRps ?? VITE_AUTO_ADD_RPS,
	};
};

/**
 * Corrige automatiquement les identifiants orphelins
 * @param {object} swb Données du tableau électrique
 * @returns Données du tableau électrique avec les identifiants corrigés
 */
export const autoCorrectModuleIDs = (swb) => {
	const reIndentedSwb = swb;
	let rows = reIndentedSwb.rows ?? [];
	const ids = [];
	(swb.rows ?? []).forEach((row) => {
		row.forEach((module) => {
			if (!module.free && module.id.trim() !== "") {
				ids.push(module.id.trim());
			}
		});
	});

	rows = rows.map((row) => {
		return row.map((module) => {
			if (module.free) {
				return {
					...module,
					id: "",
				};
			}

			if (module.id.trim() === "") {
				let count = 1;
				while (ids.includes(`${VITE_DEFAULT_ID}${count}`)) count++;

				ids.push(`${VITE_DEFAULT_ID}${count}`);
				return {
					...module,
					id: `${VITE_DEFAULT_ID}${count}`,
				};
			}

			return module;
		});
	});

	return { ...reIndentedSwb, rows };
};

// APP.jsx - reassignAllModules
/**
 * Modifie un identifiant.
 * @param {object} swb Données du tableau électrique
 * @param {string} originalId Identifiant original à remplacer
 * @param {string} newId Identifiant de remplacement
 * @returns Données du tableau électrique avec l'identifiant remplacé
 */
export const replaceAllModulesID = (swb, originalId, newId) => {
	if (originalId && originalId !== newId) {
		const rows = swb.rows.map((row) => {
			return row.map((module) => {
				let mm = { ...module };

				if (module.parentId === originalId) {
					mm = { ...mm, parentId: newId };
				}

				if (module.associateId === originalId) {
					mm = { ...mm, associateId: newId };
				}

				const kcId_a = (module.kcId ?? "").split("|").map((k) => k.trim());
				if (kcId_a.includes(originalId)) {
					mm = {
						...mm,
						kcId: kcId_a.map((k) => (k === originalId ? newId : k)).join("|"),
					};
				}

				return mm;
			});
		});

		return autoCorrectModuleIDs({ ...swb, rows });
	}
	return swb;
};

/**
 * Ordonne, et ré-assigne automatiquement les identifiants des modules du tableau électrique.
 * @param {object} swb Données du tableau électrique
 * @returns Données du tableau électrique contenant les rangées ré-ordonnées
 */
export const autoReassignAllModules = (swb) => {
	const correctedSwb = autoCorrectModuleIDs(swb);

	let counters = {};
	let from = {};

	// get all modules id from no auto id assignment
	const keepThem = correctedSwb.rows
		.flatMap((row) => {
			return row.map((module) => {
				if ((module.noAutoId ?? false) === true) {
					return module.id;
				}
				return null;
			});
		})
		.filter((kt) => kt !== null);

	// re-assign modules id
	let rows = correctedSwb.rows.map((row) => {
		return row.map((module) => {
			if (module.free) {
				return {
					...module,
					id: "",
				};
			}

			let newModuleId = module.id;
			if ((module.noAutoId ?? false) !== true) {
				let func = (module.func ?? "").trim().toUpperCase();
				if (func === "") func = VITE_DEFAULT_ID;

				do {
					counters = { ...counters, [func]: (counters[func] ?? 0) + 1 };
					newModuleId = `${func}${counters[func]}`;
				} while (keepThem.includes(newModuleId));
			}
			from = { ...from, [module.id]: newModuleId };

			return {
				...module,
				id: newModuleId,
			};
		});
	});

	// re-assign parents, associates and key contacts
	rows = rows.map((row) => {
		return row.map((module) => {
			let mm = { ...module };

			if (from[module.parentId]) {
				mm = {
					...mm,
					parentId: from[module.parentId],
				};
			}

			if (from[module.associateId]) {
				mm = {
					...mm,
					associateId: from[module.associateId],
				};
			}

			mm = {
				...mm,
				kcId: (mm.kcId ?? "")
					.split("|")
					.map((k) => {
						if (from[k]) return from[k];
						return null;
					})
					.filter((k) => k !== null)
					.join("|"),
			};

			return mm;
		});
	});

	return { ...swb, rows };
};

/**
 * Indique si aucun module n'a encore été ajouté au tableau électrique
 * @param {object} swb Données du tableau électrique
 * @returns True, le tableau est vide, sinon False
 */
export const isEmptySwitchboard = (swb) => {
	let isEmpty = true;

	if (!swb?.rows) return isEmpty;

	for (let i = 0; i < swb.rows.length; i++) {
		for (let j = 0; j < swb.rows[i].length; j++) {
			if (swb.rows[i][j].free === false) {
				isEmpty = false;
				break;
			}
		}
		if (isEmpty === false) break;
	}

	return isEmpty;
};

/**
 * Retourne la liste des identifiants valides
 * @param {object} swb Données du tableau électrique
 * @returns Liste des identifiants valides
 */
export const getMemoïzedIDs = (swb) => {
	const ids = [];
	swb.rows.forEach((row) => {
		row.forEach((module) => {
			if (!module.free && module.id.trim() !== "") {
				ids.push(module.id.trim());
			}
		});
	});
	return ids;
};

/**
 * Retourne l'identifiant suivant en fonction d'un identifiant passé en paramètre
 * @param {object} swb Données du tableau électrique
 * @param {string} id Identifiant de base
 * @returns Identifiant suivant
 */
export const getNextId = (swb, id) => {
	const allMemoizedIds = getMemoïzedIDs(swb);

	if (allMemoizedIds.includes(id)) {
		const ii = id.split("_");
		let count = 1;
		while (allMemoizedIds.includes(`${ii[0]}_${count}`)) count++;
		return `${ii[0]}_${count}`;
	}
	return id;
};

/**
 * Retourne le prochain identifiant libre
 * @param {object} swb Données du tableau électrique
 * @returns Prochain identifiant non utilisé
 */
export const getLastFreeID = (swb) => {
	if (!swb?.rows) return false;

	const rows = swb.rows;

	const ids = [];
	rows.forEach((row) => {
		row.forEach((module) => {
			ids.push(module.id);
		});
	});

	let found = "";
	let count = 1;
	while (ids.includes(`${VITE_DEFAULT_ID}${count}`)) count++;
	found = `${VITE_DEFAULT_ID}${count}`;

	return found;
};

/**
 * Créé un nouveau tableau électrique
 * @param {string} name Nom du projet
 * @param {number} stepsPerRows Nombre de modules par rangée (13/18/24)
 * @param {number} rowsCount Nombre de rangées (1-15)
 * @param {number} height Hauteur d'une rangée (10-50 mm)
 * @param {number} stepSize Largeur des modules (17.5mm/18mm)
 * @param {boolean|null} printFirstpage Indique si la page de garde devra être imprimée. Null par défaut.
 * @param {object|null} infos Informations de la page de garde (defaultFirstpageOptions.infos). Null par défaut.
 * @param {object|null} views Informations relatives à l'affichage des éléments sur la page de garde (defaultFirstpageOptions.views). Null par défaut.
 * @returns Un object contenant la structure du tableau électrique et ses informations
 */
export const newProject = (
	name,
	stepsPerRows,
	rowsCount,
	height,
	stepSize,
	printFirstpage = null,
	infos = null,
	views = null,
) => {
	return autoCorrectModuleIDs({
		...defaultProject,
		prjid: generateUUID(),
		prjname: name,
		height,
		stepsPerRows,
		stepSize,
		rows: createNewRows(stepsPerRows, rowsCount),
		firstPageInfos: { ...infos },
		theme: defaultTheme,
		printOptions: {
			...defaultPrintOptions,
			firstPage: printFirstpage ?? defaultPrintOptions.firstPage,
			pdfOptions: {
				...defaultPrintOptions.pdfOptions,
				firstPageView: { ...views },
			},
		},
	});
};

/**
 * Retourne un nouveau projet par défaut
 * @returns Nouveau projet avec les données par défaut
 */
export const newDefaultProject = () => {
	return newProject(
		VITE_DEFAULT_PROJECT_NAME,
		VITE_DEFAULT_STEPSPERROW,
		VITE_DEFAULT_ROWS,
		VITE_DEFAULT_ROWHEIGHT,
		VITE_DEFAULT_STEPSIZE,
	);
};
