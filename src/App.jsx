/**
 Tiquettes - Générateur d'étiquettes pour tableaux et armoires électriques
 Copyright (C) 2024-2025 Christophe LEMOINE

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */


import { Fragment, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { satisfies } from 'compare-versions';
import sanitizeFilename from 'sanitize-filename';

import './app.css';
import * as pkg from '../package.json';
import themesList from './themes.json';
import swbIcons from './switchboard_icons.json';
import schemaFunctions from './schema_functions.json';
import { UserContext } from "./UserContext.jsx";

import Row from "./Row";
import ContentEditable from "./ContentEditable";

import newProjectIcon from './assets/new_project.svg';
import clearProjectIcon from './assets/x.svg';
import exportProjectIcon from './assets/download.svg';
import printProjectIcon from './assets/printer.svg';
import projectIcon from './assets/project.svg';
import summaryIcon from './assets/list.svg';
import schemaIcon from './assets/schema.svg';
import monitorIcon from "./assets/monitor.svg";
import nomonitorIcon from "./assets/nomonitor.svg";
import createdIcon from "./assets/created.svg";
import updatedIcon from "./assets/updated.svg";
import infoIcon from "./assets/info.svg";
import versionIcon from "./assets/versions.svg";
import cancelIcon from "./assets/cancel.svg";
import info2Icon from "./assets/info2.svg";
import numbersIcon from "./assets/numbers.svg";
import themeSettingsIcon from "./assets/theme_settings.svg";
import caretDownIcon from "./assets/caret-down.svg";
import caretUpIcon from "./assets/caret-up.svg";

import Editor from "./Editor.jsx";
import NewProjectEditor from "./NewProjectEditor.jsx";
import SummaryTab from "./SummaryTab.jsx";
import SchemaTab from "./SchemaTab.jsx";
import WelcomePopup from "./WelcomePopup.jsx";
import ThemeEditorPopup from "./ThemeEditorPopup.jsx";
import { stats_count, stats_count_json, stats_visit } from "../public/api/stats.js";
import useDocumentVisibility from "./useVisibilityChange.jsx";


function App() {
    const importRef = useRef();
    const projectRef = useRef();
    const switchboardRef = useRef();
    const monitorRef = useRef(null);

    const [testMode, setTestMode] = useState(false);
    const [tab, setTab] = useState(1);
    const [editor, setEditor] = useState(null);
    const [newProjectProperties, setNewProjectProperties] = useState(null);
    const [monitorOpened, setMonitorOpened] = useState(false);
    const [welcome, setWelcome] = useState(false);
    const [themeEditor, setThemeEditor] = useState(false);
    const [connect, setConnect] = useState(false);
    const [freeSpaceMessage, setFreeSpaceMessage] = useState("");
    const [clipboard, setClipboard] = useState(null);
    const [clipboardMode, setClipboardMode] = useState(null);
    const [subMenus, setSubMenus] = useState({ printLabelsOpened: false });

    const UIFrozen = useMemo(() => clipboard !== null, [clipboard]);

    const tabIsActive = useDocumentVisibility();
    const user = useContext(UserContext);

    const defaultPrintOptions = useMemo(() => ({
        firstPage: true,
        labels: true,
        summary: false,
        schema: false,
        freeModules: false,
        pdfOptions: {
            openWindow: true,
            autoPrint: false,
            schemaGridColor: [230, 230, 230],
            labelsCutLines: true,
            printCurrents: false,
        }
    }), []);
    const getSavedPrintOptions = () => {
        if (sessionStorage.getItem(pkg.name + '_printOptions')) {
            const merge = (a, b) => [a, b].reduce((r, o) => Object
                .entries(o)
                .reduce((q, [k, v]) => ({
                    ...q,
                    [k]: v && typeof v === 'object' ? merge(q[k] || {}, v) : v
                }), r),
                {});
            return merge(defaultPrintOptions, JSON.parse(sessionStorage.getItem(pkg.name + '_printOptions')));
        }

        return { ...defaultPrintOptions };
    }
    const [printOptions, setPrintOptions] = useState(getSavedPrintOptions());

    const defaultStepSize = parseInt(import.meta.env.VITE_DEFAULT_STEPSIZE);
    const defaultProjectName = import.meta.env.VITE_DEFAULT_PROJECT_NAME;
    const defaultNpRows = parseInt(import.meta.env.VITE_DEFAULT_ROWS);
    const defaultHRow = parseInt(import.meta.env.VITE_DEFAULT_ROWHEIGHT);
    const defaultStepsPerRows = parseInt(import.meta.env.VITE_DEFAULT_STEPSPERROW);
    const defaultTheme = themesList.filter((t) => t.default)[0];
    const defaultModuleId = import.meta.env.VITE_DEFAULT_ID;
    const defaultProjectType = import.meta.env.VITE_DEFAULT_PROJECT_TYPE;
    const defaultVRef = parseInt(import.meta.env.VITE_DEFAULT_VREF);
    const rowsMin = parseInt(import.meta.env.VITE_ROWS_MIN);
    const rowsMax = parseInt(import.meta.env.VITE_ROWS_MAX);
    const heightMin = parseInt(import.meta.env.VITE_HEIGHT_MIN);
    const heightMax = parseInt(import.meta.env.VITE_HEIGHT_MAX);

    const defaultModule = useMemo(() => ({
        id: '',
        icon: import.meta.env.VITE_DEFAULT_ICON === "" ? null : import.meta.env.VITE_DEFAULT_ICON,
        text: import.meta.env.VITE_DEFAULT_TEXT,
        desc: import.meta.env.VITE_DEFAULT_DESC,
        func: "",
        type: "",
        crb: "",
        modtype: "",
        current: "",
        sensibility: "",
        coef: 0.5,
        pole: "",
        wire: "",
        grp: "",
        parentId: "",
        kcId: "",
        free: true,
        span: 1,
        half: "none",
    }), []);

    const defaultProjectProperties = useMemo(() => ({
        name: defaultProjectName,
        npRows: defaultNpRows,
        hRow: defaultHRow,
        spr: defaultStepsPerRows,
        projectType: defaultProjectType,
        vref: defaultVRef,
        db: {
            crb: "",
            current: "30/60A",
            desc: "Disjonteur de branchement",
            free: false,
            func: "db",
            icon: "swb_puissance.svg",
            id: "DB",
            parentId: "",
            kcId: "",
            pole: "1P+N",
            wire: "16",
            grp: "",
            sensibility: "500mA",
            coef: 1,
            span: 4,
            text: "Disjonteur de branchement",
            type: "S",
        }
    }), [defaultHRow, defaultNpRows, defaultProjectName, defaultStepsPerRows, defaultProjectType, defaultVRef]);

    const createRow = useCallback((steps, rowsCount) => {
        return Array(rowsCount).fill([]).map((_, i) => Array(steps).fill({ ...defaultModule }).map((q, j) => ({
            ...q,
            id: `Q${(j + 1) + (((i + 1) * steps) - steps)}`
        })));
    }, [defaultModule]);

    const generateUUID = () => {
        let lut = [];
        for (var i = 0; i < 256; i++) {
            lut[i] = (i < 16 ? '0' : '') + (i).toString(16);
        }
        const d0 = Math.random() * 0xffffffff | 0;
        const d1 = Math.random() * 0xffffffff | 0;
        const d2 = Math.random() * 0xffffffff | 0;
        const d3 = Math.random() * 0xffffffff | 0;
        return lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff] + '-' +
            lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + '-' + lut[d1 >> 16 & 0x0f | 0x40] + lut[d1 >> 24 & 0xff] + '-' +
            lut[d2 & 0x3f | 0x80] + lut[d2 >> 8 & 0xff] + '-' + lut[d2 >> 16 & 0xff] + lut[d2 >> 24 & 0xff] +
            lut[d3 & 0xff] + lut[d3 >> 8 & 0xff] + lut[d3 >> 16 & 0xff] + lut[d3 >> 24 & 0xff];
    };

    const defaultProject = useMemo(() => ({
        prjid: generateUUID(),
        prjname: defaultProjectName,
        prjcreated: new Date(),
        prjupdated: new Date(),
        prjversion: 1,
        projectType: defaultProjectType,
        vref: defaultVRef,
        theme: defaultTheme,
        appversion: pkg.version,
        height: defaultHRow,
        stepsPerRows: defaultStepsPerRows,
        stepSize: defaultStepSize,
        rows: createRow(defaultStepsPerRows, defaultNpRows),
        db: { ...defaultProjectProperties.db },
        withDb: false,
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
    }), [defaultProjectName, defaultProjectType, defaultVRef, defaultTheme, defaultHRow, defaultStepsPerRows, defaultStepSize, createRow, defaultNpRows, defaultProjectProperties.db]);

    const setDocumentTitle = (title) => {
        const t = `${title} - ${pkg.title} ${pkg.version} pour tableaux et armoires électriques.`;
        document.title = t;
    };

    const scrollToProject = () => {
        projectRef.current && projectRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "start"
        });
        //window.scrollTo(0, 0);
    };

    const verifyVersion = (swb) => {
        if (!swb.appversion) {
            alert(`Ce projet a été réalisé avec une version inconnue de ${pkg.title}.\n\nImpossible de l'éditer.`);
            return false;
        }

        const appVersion = swb.appversion;
        if (!satisfies(appVersion, import.meta.env.VITE_APP_VERSION_RANGE)) {
            alert(`Ce projet a été réalisé avec une version trop ancienne de ${pkg.title}.\n\nVersion du projet: ${appVersion}\nVersions supportées: ${import.meta.env.VITE_APP_VERSION_RANGE}\n\nImpossible de l'éditer.`);
            return false;
        }

        return true;
    };

    const modulesAutoId = useCallback((swb) => {
        let reIndentedSwb = swb;
        let rows = reIndentedSwb.rows;

        // correction des identifiants en doublon
        let ids = [];
        rows = rows.map((row) => {
            return row.map((module) => {
                if (module.free) {
                    return {
                        ...module,
                        id: ''
                    };
                }

                const currentModuleId = module.id.trim();

                if (currentModuleId === '') {
                    let count = 1;
                    while (ids.includes(`${defaultModuleId}${count}`)) count++;

                    ids.push(`${defaultModuleId}${count}`);
                    return {
                        ...module,
                        id: `${defaultModuleId}${count}`
                    };
                }

                if (ids.includes(currentModuleId)) {
                    let sup = 1;
                    while (ids.includes(`${currentModuleId}_${sup}`)) sup++;

                    ids.push(`${currentModuleId}_${sup}`);
                    return {
                        ...module,
                        id: `${currentModuleId}_${sup}`
                    };
                }

                ids.push(currentModuleId);
                return module;
            });
        });

        return { ...reIndentedSwb, rows };
    }, [defaultModuleId]);

    const reassignAllParents = (originalId, newId) => {
        if (originalId && originalId !== newId) {
            setSwitchboard((old) => {
                let rows = old.rows.map((row) => {
                    return row.map((module) => {
                        let mm = { ...module };
                        if (module.parentId === originalId) {
                            mm = { ...mm, parentId: newId };
                        }
                        if (module.kcId === originalId) {
                            mm = { ...mm, kcId: newId };
                        }
                        return mm;
                    });
                });

                return modulesAutoId({ ...old, rows });
            });
        }
    };

    const reassignModules = () => {
        if (switchboard && confirm("Êtes-vous certain de vouloir ré-assigner automatiquement les identifiants de l'ensemble des modules définis? Cette action est irreversible.")) {
            const swb = modulesAutoId(switchboard);

            let counters = {};

            let from = {};

            // re-assign modules id
            let rows = swb.rows.map((row) => {
                return row.map((module) => {
                    if (module.free) {
                        return {
                            ...module,
                            id: ''
                        };
                    }

                    let func = (module.func ?? '').trim().toUpperCase();
                    if (func === '') func = defaultModuleId;
                    counters = { ...counters, [func]: (counters[func] ?? 0) + 1 };

                    const newModuleId = `${func}${counters[func]}`;
                    from = { ...from, [module.id]: newModuleId };

                    return {
                        ...module,
                        id: newModuleId
                    };
                });
            });

            // re-assign parents
            rows = rows.map((row) => {
                return row.map((module) => {
                    let mm = { ...module };
                    if (from[module.parentId]) {
                        mm = {
                            ...mm,
                            parentId: from[module.parentId],
                        };
                    }

                    mm = {
                        ...mm,
                        kcId: (mm.kcId ?? "").split('|')
                            .map(k => {
                                if (from[k]) return k;
                                return null
                            })
                            .filter(k => k !== null)
                            .join('|'),
                    };

                    return mm;
                });
            });

            setSwitchboard((old) => ({ ...old, rows }));
        }
    }

    const themeEngineCompatibility = (swb) => {
        let theme = swb?.theme;
        if (!theme) theme = getThemeOfFirstModuleFound(swb);

        if (!theme.name.startsWith('custom|')) {
            theme = {
                ...theme,
                name: `custom|${theme.name}`
            };
        }
        if (!theme.data) {
            theme = {
                ...theme,
                data: themesList.filter((t) => t.name === theme.name)[0].data
            };
        }
        return theme;
    }

    const getSavedSwitchboard = () => {
        if (sessionStorage.getItem(pkg.name)) {
            let swb = {
                ...defaultProject,
                ...JSON.parse(sessionStorage.getItem(pkg.name))
            };

            const theme = themeEngineCompatibility(swb);

            swb = {
                ...swb,

                // <1.5.0  : add project metas 
                // >=1.5.0 : convert data types
                prjcreated: swb.prjcreated ? new Date(swb.prjcreated) : new Date(),
                prjupdated: swb.prjupdated ? new Date(swb.prjupdated) : new Date(),
                prjversion: swb.prjversion ? parseInt(swb.prjversion) : 1,
                // <2.0.0
                projectType: swb.projectType ?? defaultProjectType,
                vref: swb.vref ? parseInt(swb.vref) : defaultVRef,
                db: { ...defaultProjectProperties.db, ...(swb.db ?? { ...defaultProjectProperties.db }) },
                withDb: swb.withDb === true || swb.withDb === false ? swb.withDb : false,
                withGroundLine: swb.withGroundLine === true || swb.withGroundLine === false ? swb.withGroundLine : false,
                schemaMonitor: swb.schemaMonitor === true || swb.schemaMonitor === false ? swb.schemaMonitor : false,
                switchboardMonitor: swb.switchboardMonitor === true || swb.switchboardMonitor === false ? swb.switchboardMonitor : false,
                summaryColumnRow: swb.summaryColumnRow === true || swb.summaryColumnRow === false ? swb.summaryColumnRow : false,
                summaryColumnPosition: swb.summaryColumnPosition === true || swb.summaryColumnPosition === false ? swb.summaryColumnPosition : false,
                summaryColumnType: swb.summaryColumnType === true || swb.summaryColumnType === false ? swb.summaryColumnType : true,
                summaryColumnId: swb.summaryColumnId === true || swb.summaryColumnId === false ? swb.summaryColumnId : true,
                summaryColumnFunction: swb.summaryColumnFunction === true || swb.summaryColumnFunction === false ? swb.summaryColumnFunction : true,
                summaryColumnLabel: swb.summaryColumnLabel === true || swb.summaryColumnLabel === false ? swb.summaryColumnLabel : true,
                summaryColumnDescription: swb.summaryColumnDescription === true || swb.summaryColumnDescription === false ? swb.summaryColumnDescription : true,
                // <2.0.5
                stepSize: swb.stepSize ?? defaultStepSize,
                // <2.1.4
                theme,
                // <2.2.2
                prjid: swb.prjid ?? generateUUID(),

            };

            //console.log("Switchboard loaded from this session.");

            return modulesAutoId({ ...swb });
        }

        //setWelcome(true);

        return { ...defaultProject };
    };

    const [switchboard, setSwitchboard] = useState(getSavedSwitchboard());

    const lastFreeId = useMemo(() => {
        let rows = switchboard.rows;

        let ids = [];
        rows.forEach((row) => {
            return row.forEach((module) => {
                ids.push(module.id);
            });
        });

        let found = '';
        let count = 1;
        while (ids.includes(`${defaultModuleId}${count}`)) count++;
        found = `${defaultModuleId}${count}`;

        return found;
    }, [switchboard, defaultModuleId]);

    const getThemeOfFirstModuleFound = (swb = null) => {
        let themeFound = null;
        for (const r of (swb ?? switchboard).rows) {
            for (const m of r) {
                if (!m.free) {
                    themeFound = m.theme;
                    break;
                }
            }
            if (themeFound) break;
        }
        return themeFound ?? defaultTheme;
    }
    const [theme, setTheme] = useState((switchboard?.theme ?? defaultTheme));

    const createProject = useCallback((name, stepsPerRows, rowsCount, height) => {
        importRef.current.value = "";

        setTheme(defaultTheme);
        setSwitchboard(() => {
            return modulesAutoId({
                ...defaultProject,
                prjid: generateUUID(),
                prjname: name,
                height: height,
                stepsPerRows,
                stepSize: defaultStepSize,
                rows: createRow(stepsPerRows, rowsCount)
            });
        });

        setClipboard(null);
        setClipboardMode(null);
        setPrintOptions({ ...defaultPrintOptions });
        setDocumentTitle(name);
        setTab(1);
        setSubMenus(old => ({ ...old, printLabelsOpened: false }));
        scrollToProject();

        stats_count('new');

    }, [defaultTheme, defaultPrintOptions, defaultStepSize, modulesAutoId, defaultProject, createRow]);

    const resetProject = useCallback(() => {
        importRef.current.value = "";

        setClipboard(null);
        setClipboardMode(null);
        setDocumentTitle(defaultProjectName);
        setPrintOptions({ ...defaultPrintOptions });
        setTheme(defaultTheme);
        setSubMenus(old => ({ ...old, printLabelsOpened: false }));

        createProject(defaultProjectName, defaultStepsPerRows, defaultNpRows, defaultHRow);
    }, [createProject, defaultHRow, defaultNpRows, defaultProjectName, defaultStepsPerRows, defaultTheme]);

    const importProjectChooseFile = () => {
        document.getElementById('importfile').click();
    }

    const importProject = (file) => {
        if (file) {
            const fileReader = new FileReader();
            fileReader.readAsText(file, 'UTF-8');
            fileReader.onload = (e) => {
                try {
                    let swb = JSON.parse(e.target.result);

                    const theme = themeEngineCompatibility(swb);
                    setTheme(theme);

                    const rows = swb.rows.map((r) => {
                        return r.map((m) => {
                            let nm = { ...m };

                            // <=1.4.0 : remove old theme definitions
                            if (nm.theme) delete nm['theme'];

                            // <=2.0.0 : add module default values fors schema definitions
                            if (nm.icon) {
                                const sic = swbIcons.filter((si) => si.filename === nm.icon);
                                if (sic.length === 1) {
                                    if (!nm.coef) nm = { ...nm, coef: sic[0].coef };
                                    //if (!nm.func) nm = {...nm, func: sic[0].func};
                                    //if (!nm.crb) nm = {...nm, crb: sic[0].crb};
                                    //if (!nm.current) nm = {...nm, current: sic[0].current};
                                }
                            }

                            // <=2.0.3 : add half module size
                            if (!nm.half) nm = { ...nm, half: "none" };

                            // <=2.2.3 : add modtype and wire property
                            if (!nm.modtype) nm = { ...nm, modtype: "" };
                            if (!nm.wire) nm = { ...nm, wire: "" };

                            // <=2.2.4 : add grp property
                            if (!nm.grp) nm = { ...nm, grp: "" };

                            return nm;
                        });
                    });
                    swb = {
                        ...defaultProject,
                        ...swb,

                        // <1.5.0
                        prjcreated: swb.prjcreated ? new Date(swb.prjcreated) : new Date(),
                        prjupdated: swb.prjupdated ? new Date(swb.prjupdated) : new Date(),
                        prjversion: swb.prjversion ? parseInt(swb.prjversion) : 1,
                        // <2.0.0
                        projectType: swb.projectType ?? defaultProjectType,
                        vref: swb.vref ? parseInt(swb.vref) : defaultVRef,
                        db: { ...defaultProjectProperties.db, ...(swb.db ?? { ...defaultProjectProperties.db }) },
                        withDb: swb.withDb === true || swb.withDb === false ? swb.withDb : false,
                        withGroundLine: swb.withGroundLine === true || swb.withGroundLine === false ? swb.withGroundLine : false,
                        schemaMonitor: swb.schemaMonitor === true || swb.schemaMonitor === false ? swb.schemaMonitor : false,
                        switchboardMonitor: swb.switchboardMonitor === true || swb.switchboardMonitor === false ? swb.switchboardMonitor : false,
                        summaryColumnRow: swb.summaryColumnRow === true || swb.summaryColumnRow === false ? swb.summaryColumnRow : false,
                        summaryColumnPosition: swb.summaryColumnPosition === true || swb.summaryColumnPosition === false ? swb.summaryColumnPosition : false,
                        summaryColumnType: swb.summaryColumnType === true || swb.summaryColumnType === false ? swb.summaryColumnType : true,
                        summaryColumnId: swb.summaryColumnId === true || swb.summaryColumnId === false ? swb.summaryColumnId : true,
                        summaryColumnFunction: swb.summaryColumnFunction === true || swb.summaryColumnFunction === false ? swb.summaryColumnFunction : true,
                        summaryColumnLabel: swb.summaryColumnLabel === true || swb.summaryColumnLabel === false ? swb.summaryColumnLabel : true,
                        summaryColumnDescription: swb.summaryColumnDescription === true || swb.summaryColumnDescription === false ? swb.summaryColumnDescription : true,
                        // <2.0.5
                        stepSize: swb.stepSize ?? defaultStepSize,
                        // <2.1.4
                        theme,
                        // <2.2.2
                        prjid: swb.prjid ?? generateUUID(),

                        rows
                    };

                    setSwitchboard(() => modulesAutoId({ ...swb }));

                    //const filename = importRef.current.value.replaceAll("\\", "/").split("/").pop();
                    //setDocumentTitle(filename);

                    setClipboard(null);
                    setClipboardMode(null);
                    setPrintOptions({ ...defaultPrintOptions });
                    setTab(1);
                    setSubMenus(old => ({ ...old, printLabelsOpened: false }));
                    scrollToProject();

                    stats_count('import');

                    // eslint-disable-next-line no-unused-vars
                } catch (err) {
                    importRef.current.value = "";
                    alert("Impossible d'importer ce projet.");
                }
            };
        } else {
            importRef.current.value = "";
            alert("Aucun projet à importer!");
        }
    };

    const exportProject = () => {
        let swb = {
            ...switchboard,
            prjversion: switchboard.prjversion ? parseInt(switchboard.prjversion) + 1 : 1,
            appversion: pkg.version,
        }

        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(swb))}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = `${pkg.title} - ${sanitizeFilename(swb.prjname ?? defaultProjectName)} - v${swb.prjversion}.json`;
        link.click();

        setSwitchboard(swb);

        stats_count('export');
    };

    const printProject = () => {
        toPdf();

        let types = ['pdf'];
        if (printOptions.labels) types.push('print_labels');
        if (printOptions.schema) types.push('print_schema');
        if (printOptions.summary) types.push('print_summary');
        stats_count(types);

        stats_count_json('themes', {
            name: theme.name,
            title: theme.group + " - " + theme.title
        });
    };

    const toPdf = () => {
        if (confirm("ATTENTION: Veuillez imprimer en 'Taille réelle' ou 'Echelle 100%'. Ne pas 'ajuster à la page' dans les paramètres d'impression sous peine de déformer vos étiquettes.")) {

            let form = document.createElement("form");
            document.body.appendChild(form);
            form.style.display = "none";
            form.name = "toPdfForm";
            form.method = 'POST';
            form.action = import.meta.env.VITE_APP_API_URL + "toPdf.php";
            if (printOptions.pdfOptions.openWindow) form.target = '_blank';

            let params = Object.fromEntries(Object.entries({
                switchboard: { value: JSON.stringify(switchboard) },
                printOptions: { value: JSON.stringify(printOptions) },
                tv: { value: JSON.stringify(pkg.version) },
                auto: { value: printOptions.pdfOptions.autoPrint ? "1" : "0" },
                isDev: { value: import.meta.env.VITE_APP_MODE === "development" ? "1" : "0" },
                schemaGridColor: { value: Array.isArray(printOptions.pdfOptions.schemaGridColor) ? printOptions.pdfOptions.schemaGridColor.join(",") : Object.values(printOptions.pdfOptions.schemaGridColor).join(",") },
                labelsCutLines: { value: printOptions.pdfOptions.labelsCutLines ? "1" : "0" },
            }).map(([key, value]) => {
                const i = document.createElement("input");
                i.type = "hidden";
                i.name = key;
                i.value = value.value;
                return [key, { ...value, input: form.appendChild(i) }];
            }));

            form.submit();

            Object.entries(params).forEach(([_, value]) => {
                form.removeChild(value.input);
            });
            params = null;

            document.body.removeChild(form);
            form = null;

            /*const url = import.meta.env.VITE_APP_API_URL + "toPdf.php?switchboard=" + encodeURIComponent(JSON.stringify(switchboard)) + "&printOptions=" + encodeURIComponent(JSON.stringify(printOptions));
            const link = document.createElement("a");
            link.href = url;
            link.target = "_blank";
            link.click();*/
        }
    };

    const editModule = (rowIndex, moduleIndex, tabPage = 'main', focus = null) => {
        let focusedInputName = focus ?? 'id';
        let currentModule = switchboard.rows[rowIndex][moduleIndex];

        // si le module à éditer n'a pas d'identifiant alors on lui donne le dernier identifiant libre
        let hasBlankId = false;
        if (!currentModule.id || currentModule.id.trim() === '') {
            currentModule = { ...currentModule, id: lastFreeId };
            hasBlankId = true;
        }

        // récupère le module précédent
        let pr = rowIndex;
        let pm = moduleIndex - 1;
        if (pm < 0) {
            pr -= 1;
            if (pr >= 0) {
                pm = switchboard.rows[pr].length - 1;
            }
        }
        let prevModule = null;
        if (pr >= 0 && pm >= 0) {
            prevModule = switchboard.rows[pr][pm];
        }

        // si le parent du module à éditer est inconnu, on propose celui du module précédent
        if (!currentModule.parentId) {
            currentModule = { ...currentModule, parentId: prevModule?.parentId };
        }
        // edition du module
        setEditor({
            rowIndex,
            moduleIndex,
            /*originalModule: {...currentModule},*/
            currentModule,
            prevModule,
            theme,
            tabPage,
            focusedInputName,
            errors: [],
            hasBlankId
        });
    };

    const applyModuleEditor = (data) => {
        setEditor((old) => ({
            ...old,
            errors: []
        }));

        const id = data.currentModule.id.trim().toUpperCase();
        const icon = data.currentModule.icon;
        const text = (data.currentModule.text ?? "").trim();
        const desc = (data.currentModule.desc ?? "").trim();
        const parentId = (data.currentModule.parentId ?? "").trim();
        const kcId = (data.currentModule.kcId ?? "").trim();
        const func = (data.currentModule.func ?? "").trim();
        const modtype = (data.currentModule.modtype ?? "").trim();
        const type = (schemaFunctions[data.currentModule.func]?.hasType ? (data.currentModule.type ?? "") : "").trim();
        const crb = (schemaFunctions[data.currentModule.func]?.hasCrb ? (data.currentModule.crb ?? "") : "").trim();
        const current = (schemaFunctions[data.currentModule.func] ? (data.currentModule.current ?? "") : "").trim();
        const sensibility = (schemaFunctions[data.currentModule.func]?.hasType ? (data.currentModule.sensibility ?? "") : "").trim();
        const coef = data.currentModule.coef ?? 0.5;
        const pole = (schemaFunctions[data.currentModule.func]?.hasPole ? (data.currentModule.pole ?? "") : "").trim();
        const wire = (schemaFunctions[data.currentModule.func]?.hasPole ? (data.currentModule.wire ?? "") : "").trim();
        const grp = (data.currentModule.grp ?? "").trim();

        if (!(/\w*/.test(id)) || id === '') {
            setEditor((old) => ({
                ...old,
                currentModule: { ...old.currentModule, id: "" },
                errors: [...old.errors, "Un identifiant valide est requis."]
            }));
            return;
        }

        if (!(/\w*/.test(text))) {
            setEditor((old) => ({
                ...old,
                currentModule: { ...old.currentModule, text: "" },
                errors: [...old.errors, "Une description valide est requise."]
            }));
            return;
        }

        if (!(/\w*/.test(desc))) {
            setEditor((old) => ({
                ...old,
                currentModule: { ...old.currentModule, desc: "" },
                errors: [...old.errors, "Une description valide est requise."]
            }));
            return;
        }

        // applique les modifications
        setSwitchboard((old) => {
            let rows = old.rows.map((row, i) => {
                if (i !== data.rowIndex) return row;

                return row.map((module, j) => {
                    if (j !== data.moduleIndex) return module;

                    return {
                        ...module,
                        free: false,
                        id,
                        icon,
                        text,
                        desc,
                        parentId,
                        kcId,
                        func,
                        crb,
                        modtype,
                        type,
                        current,
                        sensibility,
                        coef,
                        pole,
                        wire,
                        grp,
                    };
                });
            });

            return modulesAutoId({ ...old, rows });
        });

        // ré-assigne automatiquement tous les identifiants parents et contacts concernés par la modification de l'identifiant du module en cours d'édition
        reassignAllParents(data.originalModule?.id, id);

        setEditor(null);
    }

    const moduleGrow = (rowIndex, moduleIndex) => {
        const nextModuleIndex = moduleIndex + 1;

        setSwitchboard((old) => {
            const rows = old.rows.map((row, i) => {
                if (i !== rowIndex) return row;

                let deleted = false;
                let r = row.map((module, j) => {
                    if (j !== moduleIndex) {
                        if (j === nextModuleIndex && !deleted) {
                            deleted = true;
                            return null;
                        }
                        return module;
                    }
                    return { ...module, span: module.span + 1 };
                });

                return r.filter((rr) => rr !== null);
            });

            return modulesAutoId({ ...old, rows });
        });
    };

    const moduleShrink = (rowIndex, moduleIndex) => {
        const currentModule = switchboard.rows[rowIndex][moduleIndex];

        if (currentModule.span > 1) {
            setSwitchboard((old) => {
                let rows = old.rows.map((row, i) => {
                    if (i !== rowIndex) return row;

                    let r = row.map((module, j) => {
                        if (j !== moduleIndex) return module;

                        const s = module.span - 1;
                        const h = s <= 1 ? "none" : module.half;
                        return { ...module, span: s, half: h };
                    });

                    r.splice(moduleIndex + 1, 0, { ...defaultModule });

                    return r;
                });

                return modulesAutoId({ ...old, rows });
            });
        }
    };

    const moduleClear = (rowIndex, moduleIndex) => {
        const currentModule = switchboard.rows[rowIndex][moduleIndex];

        if (!currentModule.free) {
            setSwitchboard((old) => {
                let rows = old.rows.map((row, i) => {
                    if (i !== rowIndex) return row;

                    let r = row.map((module, j) => {
                        if (j !== moduleIndex) return module;

                        return { ...defaultModule, span: 1 };
                    });

                    for (let o = 0; o < currentModule.span - 1; o++) {
                        r.splice(moduleIndex + 1, 0, { ...defaultModule });
                    }

                    return r;
                });

                return modulesAutoId({ ...old, rows });
            });

        }
    };

    const moduleFocus = (rowPosition, modulePosition) => {
        const m = document.querySelector(`[data-id="${rowPosition}-${modulePosition}"]`);
        if (m) {
            m.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "nearest"
            });
            m.focus();
        }
    }

    const findThemeByName = (name, all = false) => {
        const found = themesList.filter((t) => t.name === name);
        return (all ? found : (found.length > 0 ? found[0] : null));
    }

    const updateTheme = (name) => {
        const selected = findThemeByName(name);
        if (selected) {
            setTheme(selected);
            setSwitchboard((old) => modulesAutoId({ ...old, theme: selected }));
            setTab(1);


        }
    }

    const openProjectPropertiesEditor = () => {
        setNewProjectProperties(() => ({ ...defaultProjectProperties }));
    };

    const updateProjectProperties = (data) => {
        setNewProjectProperties((old) => ({ ...old, ...data }));
    };

    const handleScrollRight = () => {
        if (switchboardRef.current.scrollLeft + 10 < switchboardRef.current.scrollWidth) {
            switchboardRef.current.scrollLeft += 10;
        } else {
            switchboardRef.current.scrollLeft = switchboardRef.current.scrollWidth;
        }
    }

    const handleScrollLeft = () => {
        if (switchboardRef.current.scrollLeft - 10 > 0) {
            switchboardRef.current.scrollLeft -= 10;
        } else {
            switchboardRef.current.scrollLeft = 0;
        }
    }

    const handleModuleGrow = (rowIndex, moduleIndex) => {
        const row = switchboard.rows[rowIndex];
        const currentModule = row[moduleIndex];
        const nextModule = (moduleIndex + currentModule.span) < switchboard.stepsPerRows ? row[moduleIndex + 1] : null;

        if (nextModule?.free === true && nextModule?.span === 1) {
            moduleGrow(rowIndex, moduleIndex);
            moduleFocus(rowIndex + 1, moduleIndex + 1);
        }
    }

    const handleModuleShrink = (rowIndex, moduleIndex) => {
        const row = switchboard.rows[rowIndex];
        const currentModule = row[moduleIndex];

        if (currentModule.span > 1) {
            moduleShrink(rowIndex, moduleIndex);
            moduleFocus(rowIndex + 1, moduleIndex + 1);
        }
    }

    const handleModuleClear = (rowIndex, moduleIndex, noConfirm = false) => {
        if (noConfirm === true || confirm("Êtes-vous certain de vouloir libérer ce module?")) {
            const row = switchboard.rows[rowIndex];
            const currentModule = row[moduleIndex];

            if (!currentModule.free) {
                moduleClear(rowIndex, moduleIndex);
                moduleFocus(rowIndex + 1, moduleIndex + 1);
            }

            return true;
        }

        return false;
    }

    const handleModuleEdit = (rowIndex, moduleIndex) => {
        editModule(rowIndex, moduleIndex);
        moduleFocus(rowIndex + 1, moduleIndex + 1);
    }

    const handleModuleMoveLeft = (rowIndex, moduleIndex) => {
        let rows = switchboard.rows;
        let row = rows[rowIndex];
        const currentModule = row[moduleIndex];
        const prevModule = (moduleIndex - 1) >= 0 ? row[moduleIndex - 1] : null;

        if ((!currentModule.free || (currentModule.free && currentModule.span > 1)) && prevModule?.free === true && prevModule?.span === 1) {
            row[moduleIndex - 1] = currentModule;
            row[moduleIndex] = prevModule;
            rows[rowIndex] = row;
            setSwitchboard((old) => {
                moduleFocus(rowIndex + 1, moduleIndex);
                return modulesAutoId({ ...old, rows });
            })
        }
    }

    const handleModuleMoveRight = (rowIndex, moduleIndex) => {
        let rows = switchboard.rows;
        let row = rows[rowIndex];
        const currentModule = row[moduleIndex];
        const nextModule = (moduleIndex + currentModule.span) < switchboard.stepsPerRows ? row[moduleIndex + 1] : null;

        if ((!currentModule.free || (currentModule.free && currentModule.span > 1)) && nextModule?.free === true && nextModule?.span === 1) {
            row[moduleIndex + 1] = currentModule;
            row[moduleIndex] = nextModule;
            rows[rowIndex] = row;
            setSwitchboard((old) => {
                moduleFocus(rowIndex + 1, moduleIndex + 2);
                return modulesAutoId({ ...old, rows });
            })
        }
    }

    const handleModuleCopyCut = (rowIndex, moduleIndex, mode) => {
        const row = switchboard.rows[rowIndex];
        const currentModule = row[moduleIndex];

        if (!currentModule.free) {
            setClipboard(currentModule);
            setClipboardMode({ rowIndex, moduleIndex, mode });
        }
    }

    const handleModuleCopy = (rowIndex, moduleIndex) => {
        handleModuleCopyCut(rowIndex, moduleIndex, 'copy');
    }

    const handleModuleCut = (rowIndex, moduleIndex) => {
        handleModuleCopyCut(rowIndex, moduleIndex, 'cut');
    }

    const handleModulePaste = (rowIndex, moduleIndex) => {
        if (!modulePasteAllowed(rowIndex, moduleIndex)) return;

        setSwitchboard((old) => {
            let deleteLength = 0;
            let addLength = 0;

            let rows = old.rows.map((row, i) => {
                let r = row.map((module, j) => {

                    if (clipboardMode.mode === 'cut' && i === clipboardMode.rowIndex && j === clipboardMode.moduleIndex) {
                        return { ...defaultModule, span: module.span };
                    }

                    if (i !== rowIndex) return module;

                    if (j === moduleIndex) {
                        deleteLength = clipboard.span - module.span;
                        addLength += module.span - clipboard.span;
                    }

                    // si le module qui va réceptionner le presse-papier est trop petit, on supprime les modules libres nécessaires pour libérer la place avant collage.
                    if (j > moduleIndex && deleteLength > 0 && module.free) {
                        deleteLength--;
                        return null;
                    }

                    if (j !== moduleIndex) return module;

                    return {
                        ...module,
                        free: clipboard.free,
                        span: clipboard.span,
                        icon: clipboard.icon,
                        text: clipboard.text,
                        desc: clipboard.desc,
                        parentId: clipboard.parentId,
                        kcId: clipboard.kcId,
                        func: clipboard.func,
                        crb: clipboard.crb,
                        modtype: clipboard.modtype,
                        type: clipboard.type,
                        current: clipboard.current,
                        sensibility: clipboard.sensibility,
                        coef: clipboard.coef,
                        pole: clipboard.pole,
                        wire: clipboard.wire,
                        grp: clipboard.grp,
                    };
                });

                r = r.filter((rr) => rr !== null);

                // si le module qui a réceptionné le presse-papier est désormais plus petit, alors on compense en ajoutant des modules libres
                if (addLength > 0) {
                    for (let al = 0; al < addLength; al++) {
                        r.splice(moduleIndex + 1, 0, { ...defaultModule });
                    }
                    addLength = 0;
                }

                return r;
            });

            return modulesAutoId({ ...old, rows });
        });

        setClipboard(null);
        setClipboardMode(null);
    }

    const modulePasteAllowed = (rowIndex, moduleIndex) => {
        if (!clipboard) return false;

        const row = switchboard.rows[rowIndex];

        const currentModule = row[moduleIndex];
        if (currentModule.span >= clipboard.span) return true;

        let allowed = true;
        let max = clipboard.span;
        let i = 0;
        while (max > 0) {
            const nextModule = (moduleIndex + clipboard.span) < switchboard.stepsPerRows ? row[moduleIndex + i] : null;
            if (!nextModule || !nextModule.free || nextModule.span !== 1) {
                allowed = false;
                break;
            }

            max -= nextModule.span;
            i++;
        }
        return allowed;
    }

    const handleCancelPaste = () => {
        setClipboard(null);
        setClipboardMode(null);
    }

    const handleModuleHalf = (rowIndex, moduleIndex, item, mode) => {
        let rows = switchboard.rows;
        let row = rows[rowIndex];
        const currentModule = row[moduleIndex];

        if (!currentModule.free && (mode === "none" || mode === "left" || mode === "right")) {
            row[moduleIndex] = {
                ...currentModule,
                half: mode
            };
            rows[rowIndex] = row;
            setSwitchboard((old) => {
                moduleFocus(rowIndex + 1, moduleIndex + 2);
                return modulesAutoId({ ...old, rows });
            })
        }
    }

    const moduleShrinkAllowed = (rowIndex, moduleIndex) => {
        const row = switchboard.rows[rowIndex];
        const currentModule = row[moduleIndex];

        return currentModule.span > 1;
    }

    const moduleGrowAllowed = (rowIndex, moduleIndex) => {
        const row = switchboard.rows[rowIndex];
        const currentModule = row[moduleIndex];
        const nextModule = (moduleIndex + currentModule.span) < switchboard.stepsPerRows ? row[moduleIndex + 1] : null;

        return (nextModule?.free === true && nextModule?.span === 1);
    }

    const moduleMoveLeftAllowed = (rowIndex, moduleIndex) => {
        const row = switchboard.rows[rowIndex];
        const currentModule = row[moduleIndex];
        const prevModule = (moduleIndex - 1) >= 0 ? row[moduleIndex - 1] : null;

        return ((!currentModule.free || (currentModule.free && currentModule.span > 1)) && prevModule?.free === true && prevModule?.span === 1);
    }

    const moduleMoveRightAllowed = (rowIndex, moduleIndex) => {
        const row = switchboard.rows[rowIndex];
        const currentModule = row[moduleIndex];
        const nextModule = (moduleIndex + currentModule.span) < switchboard.stepsPerRows ? row[moduleIndex + 1] : null;

        return ((!currentModule.free || (currentModule.free && currentModule.span > 1)) && nextModule?.free === true && nextModule?.span === 1);
    }

    const handleRowAddAfter = (rowIndex) => {
        let rows = switchboard.rows;
        if (rows.length >= rowsMax) {
            alert(`Impossible d'ajouter une nouvelle rangée.\nTaille maximum atteinte: ${rowsMax} rangées`);
            return;
        }

        const newRow = createRow(switchboard.stepsPerRows, 1);
        rows.splice(rowIndex + 1, 0, ...newRow);

        setSwitchboard((old) => modulesAutoId({ ...old, rows }));
    }

    const handleRowDelete = (rowIndex) => {
        let rows = switchboard.rows;
        rows.splice(rowIndex, 1);

        setSwitchboard((old) => modulesAutoId({ ...old, rows }));
    }

    const rowAddAllowed = () => {
        return switchboard.rows.length < rowsMax;
    }

    const rowDeleteAllowed = () => {
        return switchboard.rows.length > 1;
    }

    const printFreeModuleAllowed = () => {
        return printOptions.freeModules;
    }

    const getFilteredModulesBySchemaFuncs = () => {
        let m = {};
        switchboard.rows.forEach((row) => {
            row.forEach((module) => {
                if (Object.keys(schemaFunctions).includes(module.func)) {
                    if (!m[module.func]) m[module.func] = [];
                    m[module.func].push(module);
                }
            });
        });
        return m;
    }

    const getModuleById = (moduleId) => {
        let m = null;
        for (const row of switchboard.rows) {
            for (const module of row) {
                if (module.id === moduleId) {
                    m = module;
                    break;
                }
            }
        }
        return m;
    }

    const getModuleById2 = (moduleId) => {
        let indexes = { row: -1, module: -1 };
        let m = { module: null, indexes };

        switchboard.rows.forEach((row, ri) => {
            row.forEach((module, mi) => {
                if (!m.module && module.id === moduleId && !module.free) {
                    m = { ...m, module, indexes: { ...indexes, row: ri, module: mi } };
                }
            })
        });

        return m;
    }

    const monitor = useMemo(() => {
        if (!switchboard.switchboardMonitor) return {};

        let result = {};

        const used = switchboard.rows.map((row) => row.filter((module) => !module.free).reduce((a, b) => a + b.span, 0)).reduce((a, b) => a + b, 0);
        const total = switchboard.rows.length * switchboard.stepsPerRows;
        const percentFree = Math.round(100 - ((used / total) * 100));

        setFreeSpaceMessage(`${used} module${used > 1 ? 's' : ''} occupé${used > 1 ? 's' : ''} sur ${total} disponible${used > 1 ? 's' : ''} (${percentFree}% libre)`);

        let e_errors = (result.errors ?? [])['Enveloppe'] ?? [];
        if (percentFree < 20) {
            const e_error = `La norme NFC 15-100 impose un minimum de 20% d'emplacements libres. Vous occupez ${used} module${used > 1 ? 's' : ''} sur ${total} disponible${used > 1 ? 's' : ''} (${percentFree}% libre).`;
            if (!e_errors.includes(e_error)) e_errors.push(e_error);
        }
        if (e_errors.length > 0) result = { ...result, errors: { ...result.errors, Enveloppe: e_errors } };

        return result;
    }, [switchboard.rows, switchboard.switchboardMonitor]);
    const monitorWarningsLength = useMemo(() => Object.values(monitor.errors ?? {}).map((e) => e.flat()).length, [monitor]);

    const openWelcome = () => setWelcome(true);

    useEffect(() => {
        let t = null;

        if (!verifyVersion(switchboard)) {
            resetProject();

            if (t) clearTimeout(t);
            return;
        }

        setDocumentTitle(switchboard.prjname);

        t = setTimeout(() => {
            const savedProjectIsOutdated = sessionStorage.getItem(pkg.name) !== JSON.stringify(switchboard);
            if (savedProjectIsOutdated) {
                let updatedProject = {
                    ...switchboard,
                    prjupdated: new Date()
                };

                sessionStorage.setItem(pkg.name, JSON.stringify(updatedProject));
                setSwitchboard(updatedProject);
                setDocumentTitle(updatedProject.prjname);

                //console.log("Switchboard saved to this session.");
            }

            const printOptionsIsOutdated = sessionStorage.getItem(pkg.name + '_printOptions') !== JSON.stringify(printOptions);
            if (printOptionsIsOutdated) {
                sessionStorage.setItem(pkg.name + '_printOptions', JSON.stringify(printOptions));
            }
        }, 1000);

        return () => {
            if (t) clearTimeout(t);
        }
    }, [resetProject, switchboard, printOptions]);

    useEffect(() => {
        if (window) {
            const ovf = editor || newProjectProperties ? 'hidden' : 'auto';
            if (window.document.body.style.overflow !== ovf) window.document.body.style.overflow = ovf;
        }
    }, [editor, newProjectProperties]);

    useEffect(() => {
        if (monitorOpened) monitorRef.current.focus();
    }, [monitorOpened]);

    useEffect(() => {

        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);

        const enjoyProjectRequired = urlParams.get('enjoy') !== null;
        const newProjectRequired = urlParams.get('new') !== null;

        setTestMode(urlParams.get('test') !== null);

        if (enjoyProjectRequired && !newProjectRequired) {
            resetProject();
            openWelcome();
        }

        if (newProjectRequired && !enjoyProjectRequired) {
            resetProject();
            openProjectPropertiesEditor();
        }

        if (enjoyProjectRequired || newProjectRequired) {
            const newCurrentUrl = location.protocol + '//' + location.host + location.pathname;
            window.history.replaceState({}, document.title, newCurrentUrl);
        }

        stats_visit(false);
        const visitTimeout = setTimeout(function () {
            if (tabIsActive) stats_visit(true);
        }, 60000);

        return () => {
            clearTimeout(visitTimeout);
        }

    }, []);

    useEffect(() => {
        if (tabIsActive) stats_visit(true);
    }, [tabIsActive]);

    return (
        <div tabIndex={-1} onKeyUp={(e) => {
            if (e.key === 'Escape') {
                setClipboard(null);
                setClipboardMode(null);
            }
        }}>
            {/** TOOLBAR **/}

            <nav className={`button_group ${UIFrozen ? 'disabled' : ''}`.trim()}>
                {/*<button className={`button_group-account dropdown_container`}
                        onClick={() => {
                            if (account.currentUser) {
                            } else {
                                setConnect(true);
                            }
                        }} title={account.currentUser ? "Mon compte" : "Connexion à mon espace dans le cloud"}>
                    <img src={cloudDataConnectionIcon} width={16} height={16} alt={"Mon compte"}/>
                    <span>{account.currentUser ? "Mon compte" : "Connexion"}</span>
                    {account.currentUser && (
                        <div className="dropdown"
                             style={{left: 0, transform: 'none', rowGap: '0rem', paddingBottom: '1em'}}>
                            <div className="dropdown_header">{account.currentUser.display_name}</div>


                            <div className="dropdown_separator"></div>
                            <div className="dropdown_item menuitem" title="Mes préférences" style={{paddingBlock: 0}}>
                                <div className="menuitem_content" onClick={() => setAccountSettings(true)}>
                                    <img src={settingsIcon} width={18} height={18} alt={"Préférences"}/>
                                    <span>Préférences...</span>
                                </div>
                            </div>
                            <div className="dropdown_item menuitem" title="Se déconnecter" style={{paddingBlock: 0}}>
                                <div className="menuitem_content" onClick={() => {
                                    if (confirm("Êtes-vous certain de vouloir vous déconnecter ?")) account.logout();
                                }}>
                                    <img src={cancelIcon} width={18} height={18} alt={"Se déconnecter"}/>
                                    <span>Se déconnecter</span>
                                </div>
                            </div>
                        </div>
                    )}
                </button>*/}

                <div className="button_group-separator"></div>

                <button className={`button_group-new_project active`.trim()}
                    onClick={() => {
                        setWelcome(true);
                    }} title="Créer un nouveau projet">
                    <img src={newProjectIcon} width={16} height={16} alt={defaultProjectName} />
                    <span className={'responsive'}>Projets...</span>
                </button>

                <div className="button_group-separator"></div>

                <input id="importfile" ref={importRef} type="file" onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) importProject(e.target.files[0]);
                }} style={{ visibility: 'hidden', position: 'absolute', top: '0', left: '-500000px' }} />
                {/*<label htmlFor="importfile" className="button_group-import_project"
                       title="Importer un projet existant">
                    <img src={uploadProjectIcon} width={16} height={16} alt={"Importer"}
                         onClick={() => importProjectChooseFile()}/>
                    <span>Importer</span>
                </label>*/}

                <button className="button_group-export_project" onClick={() => {
                    exportProject();
                }} title="Exporter...">
                    <img src={exportProjectIcon} width={16} height={16} alt={"Exporter"} />
                    <span>Exporter</span>
                </button>

                <button className="button_group-print_project dropdown_container" title="Imprimer...">
                    <img src={printProjectIcon} width={16} height={16} alt={"Imprimer"} />
                    <span>Imprimer...</span>
                    <div className="dropdown">
                        <div className="dropdown_header">Options</div>
                        <div className="dropdown_item head"
                            title="Imprimer la page de garde">
                            <input id="print_firstPage" name="print_firstPage" type="checkbox"
                                checked={printOptions.firstPage}
                                onChange={(e) => setPrintOptions((old) => ({
                                    ...old,
                                    firstPage: e.target.checked
                                }))} />
                            <label htmlFor="print_firstPage">Page de garde</label>
                        </div>
                        <div className="dropdown_item head parent" title="Imprimer les étiquettes">
                            <input id="print_labels" name="print_labels" type="checkbox"
                                checked={printOptions.labels}
                                onChange={(e) => setPrintOptions((old) => ({
                                    ...old,
                                    labels: e.target.checked
                                }))} />
                            <label htmlFor="print_labels">Etiquettes</label>
                            {printOptions.labels &&
                                <img src={subMenus.printLabelsOpened ? caretUpIcon : caretDownIcon} width={16}
                                    height={16} alt={"Menu"} onClick={() => setSubMenus(old => ({
                                        ...old,
                                        printLabelsOpened: !old.printLabelsOpened
                                    }))} />}
                        </div>
                        {subMenus.printLabelsOpened && printOptions.labels && <>
                            <div className="dropdown_item"
                                title="Imprimer la décoration sur les emplacements libres de chaque rangée d'étiquettes">
                                <input id="print_free" name="print_free" type="checkbox"
                                    checked={printOptions.freeModules}
                                    onChange={(e) => setPrintOptions((old) => ({
                                        ...old,
                                        freeModules: e.target.checked
                                    }))} disabled={!printOptions.labels} />
                                <label htmlFor="print_free">Décorer les emplacements libres</label>
                            </div>
                            <div className="dropdown_item"
                                title="Imprimer les lignes de coupe pour cisailles et massicots">
                                <input id="print_pdf_labelsCutLines" name="print_pdf_labelsCutLines" type="checkbox"
                                    checked={printOptions.pdfOptions.labelsCutLines}
                                    onChange={(e) => setPrintOptions((old) => ({
                                        ...old,
                                        pdfOptions: { ...old.pdfOptions, labelsCutLines: e.target.checked }
                                    }))} disabled={!printOptions.labels} />
                                <label htmlFor="print_pdf_labelsCutLines">Imprimer les lignes de coupe</label>
                            </div>
                            <div className="dropdown_item" style={{ marginBottom: '1em' }}
                                title="Imprimer les calibres des modules pour aider à leurs mise en place (hors découpes)">
                                <input id="print_pdf_printCurrents" name="print_pdf_printCurrents" type="checkbox"
                                    checked={printOptions.pdfOptions.printCurrents}
                                    onChange={(e) => setPrintOptions((old) => ({
                                        ...old,
                                        pdfOptions: { ...old.pdfOptions, printCurrents: e.target.checked }
                                    }))} disabled={!printOptions.labels} />
                                <label htmlFor="print_pdf_printCurrents">Indiquer le calibre sous chaque module pour
                                    aider à
                                    leur installation</label>
                            </div>
                        </>}

                        <div className="dropdown_item head" title="Imprimer le schéma unifilaire">
                            <input id="print_schema" name="print_schema" type="checkbox"
                                checked={printOptions.schema}
                                onChange={(e) => setPrintOptions((old) => ({
                                    ...old,
                                    schema: e.target.checked
                                }))} />
                            <label htmlFor="print_schema">Schéma unifilaire</label>
                        </div>
                        {/*<div className="dropdown_item"
                             title="Couleur de la grille de fond">
                            <label htmlFor="print_pdf_schemaGridColor">Couleur de la grille de fond</label>
                            <input id="print_pdf_schemaGridColor" name="print_pdf_schemaGridColor" type="color"
                                   value={rgbToHex(printOptions.pdfOptions.schemaGridColor)}
                                   onChange={(e) => setPrintOptions((old) => ({
                                       ...old,
                                       pdfOptions: {...old.pdfOptions, schemaGridColor: hexToRgb(e.target.value)}
                                   }))} disabled={!printOptions.schema}/>
                        </div>*/}

                        <div className="dropdown_item head" title="Imprimer la nomenclature">
                            <input id="print_summary" name="print_summary" type="checkbox"
                                checked={printOptions.summary}
                                onChange={(e) => setPrintOptions((old) => ({
                                    ...old,
                                    summary: e.target.checked
                                }))} />
                            <label htmlFor="print_summary">Nomenclature</label>
                        </div>

                        <div className="dropdown_separator"></div>
                        <div className="dropdown_item head"
                            title="Ouvrir le document dans un nouvel onglet (désactiver cette option si votre navigateur Internet bloque toutes les fenètres popups)">
                            <input id="print_pdf_openWindow" name="print_pdf_openWindow" type="checkbox"
                                checked={printOptions.pdfOptions.openWindow}
                                onChange={(e) => setPrintOptions((old) => ({
                                    ...old,
                                    pdfOptions: { ...old.pdfOptions, openWindow: e.target.checked }
                                }))} />
                            <label htmlFor="print_pdf_openWindow">Ouvrir le document dans un nouvel onglet</label>
                        </div>
                        <div className="dropdown_item head"
                            title="Ouvrir automatiquement les propriétés d'impressions">
                            <input id="print_pdf_autoPrint" name="print_pdf_autoPrint" type="checkbox"
                                checked={printOptions.pdfOptions.autoPrint}
                                onChange={(e) => setPrintOptions((old) => ({
                                    ...old,
                                    pdfOptions: { ...old.pdfOptions, autoPrint: e.target.checked }
                                }))} />
                            <label htmlFor="print_pdf_autoPrint">Ouvrir automatiquement les propriétés
                                d&#39;impressions</label>
                        </div>

                        {/*<div className="dropdown_separator2"></div>*/}

                        <div className="dropdown_footer">
                            <div className="fakeButton" title="Lancer l&apos;impression" onClick={() => {
                                printProject();
                            }}>Lancer l&apos;impression...
                            </div>
                        </div>
                    </div>
                </button>

                <div className="button_group-separator"></div>

                <button className="button_group-clear_project" onClick={() => {
                    if (confirm("Êtes-vous certain de vouloir réinitialiser le projet?")) resetProject();
                }} title="Réinitialiser le projet">
                    <img src={clearProjectIcon} width={16} height={16} alt={"Réinitialiser"} />
                    <span>Réinitialiser</span>
                </button>

                <div className="button_group-separator"></div>
            </nav>

            {/** SWITCHBOARD PROJECT **/}

            {/** PROJECT TITLE **/}

            <h3 ref={projectRef} className={`${printOptions.labels ? 'printable' : 'notprintable'}`.trim()}>
                <img src={projectIcon} width={24} height={24} alt="Projet courant" />
                <ContentEditable
                    value={switchboard.prjname ?? defaultProjectName}
                    onChange={(value) => {
                        let v = value.trim();
                        if (v === "") v = defaultProjectName;
                        setSwitchboard((old) => ({
                            ...old,
                            prjname: v
                        }));
                    }}
                    editableStyle={{
                        fontSize: '1em',
                        fontWeight: 'bold',
                        maxWidth: '100%'
                    }}
                    editable={!UIFrozen}
                    className={"contentEditable"}
                />
            </h3>

            {/** PROJECT DETAILS **/}

            <ul className="project">
                <li title="Révision">
                    <img src={versionIcon} alt="Révision" width={16} height={16} />
                    <span>Révision {switchboard.prjversion ?? 1}</span>
                </li>
                <li title="Description">
                    <img src={infoIcon} alt="Description" width={16} height={16} />
                    <span>{switchboard.rows.length} x {switchboard.stepsPerRows} module{switchboard.stepsPerRows > 1 ? 's' : ''} / {switchboard.height}mm</span>
                </li>
                <li title="Date de création">
                    <img src={createdIcon} alt="Date de création" width={16} height={16} />
                    <span>{(switchboard.prjcreated ?? (new Date())).toLocaleString()}</span>
                </li>
                <li title="Date de modification">
                    <img src={updatedIcon} alt="Date de modification" width={16} height={16} />
                    <span>{(switchboard.prjupdated ?? (new Date())).toLocaleString()}</span>
                </li>
            </ul>

            {/** TABPAGES SELECTOR **/}

            <nav className={`tabPages ${UIFrozen ? 'disabled' : ''}`.trim()}>
                <div className={`tabPages_page ${tab === 1 ? 'selected' : ''}`.trim()}
                    onClick={() => setTab(1)}>
                    <img src={projectIcon} width={20} height={20} alt="Etiquettes" />
                    <span>Etiquettes</span>
                </div>
                <div className={`tabPages_page ${tab === 2 ? 'selected' : ''}`.trim()}
                    onClick={() => setTab(2)}>
                    <img src={schemaIcon} width={20} height={20} alt="Schéma unifilaire" />
                    <span>Schéma</span>
                </div>
                <div className={`tabPages_page ${tab === 3 ? 'selected' : ''}`.trim()}
                    onClick={() => setTab(3)}>
                    <img src={summaryIcon} width={20} height={20} alt="Nomenclature" />
                    <span>Nomenclature</span>
                </div>
            </nav>

            {/** TABPAGES **/}

            {/** SWITCHBOARD TAB **/}
            <div ref={switchboardRef}
                className={`switchboard ${tab === 1 ? 'selected' : ''} ${printOptions.labels ? 'printable' : 'notprintable'}`.trim()}
                title={freeSpaceMessage}>
                <div className="tabPageBand notprintable">
                    <div className="tabPageBandGroup">
                        <div className="tabPageBandCol">
                            <span style={{ fontSize: 'smaller', lineHeight: 1.2 }}>Thème<br />courant:</span>
                        </div>
                        <div className="tabPageBandCol">
                            <select
                                value={theme?.name ?? defaultTheme}
                                onChange={(e) => {
                                    updateTheme(e.target.value);
                                }}
                                style={{
                                    maxWidth: '100%',
                                    width: '280px',
                                    overflowX: 'hidden',
                                    whiteSpace: 'nowrap',
                                    textOverflow: 'ellipsis'
                                }}
                                disabled={UIFrozen}
                            >
                                {Object.entries(Object.groupBy(themesList, (({ group }) => group))).map((e) => {
                                    const g = e[0];
                                    const l = e[1];
                                    return <Fragment key={`themes_${g}`}>
                                        <option key={`group_${g}`} id={`group_${g}`} disabled>- {g} -</option>
                                        {l.map((t) => <option key={`theme_${t.name}`} id={`theme_${t.name}`}
                                            value={t.name}>({g}) {t.title}</option>)}
                                    </Fragment>
                                })}
                            </select>
                        </div>
                        {theme.name.startsWith('custom') && theme?.data && <div className="tabPageBandCol">
                            <button style={{ height: '34px' }}
                                title="Modifier le thème."
                                onClick={() => {
                                    setThemeEditor(true)
                                }}>
                                <img src={themeSettingsIcon} alt="Modifier le thème."
                                    width={22} height={22} />
                            </button>
                        </div>}
                    </div>

                    <div className="tabPageBandGroup">
                        <div className="tabPageBandCol">
                            <span style={{
                                fontSize: 'smaller',
                                lineHeight: 1.2
                            }}>Hauteur des<br />étiquettes:</span>
                        </div>
                        <div className="tabPageBandCol">
                            <input type="range" min={heightMin} max={heightMax} step={1}
                                style={{ width: '100px' }}
                                value={switchboard.height} onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    if (value >= heightMin) setSwitchboard((old) => ({ ...old, height: value }));
                                }} />
                        </div>
                        <div className="tabPageBandCol">
                            <span>{switchboard.height}mm</span>
                        </div>
                    </div>

                    <div className="tabPageBandGroup">
                        <div className="tabPageBandCol">
                            <span style={{
                                fontSize: 'smaller',
                                lineHeight: 1.2
                            }}>Largeur des<br />étiquettes:</span>
                        </div>
                        <div className="tabPageBandCol">
                            <select
                                value={switchboard.stepSize ?? defaultStepSize}
                                onChange={(e) => {
                                    const value = parseFloat(e.target.value);
                                    if (value === 17.5 || value === 18) setSwitchboard((old) => ({
                                        ...old,
                                        stepSize: value
                                    }));
                                }}
                                style={{
                                    maxWidth: '100%',
                                    width: 'max-content',
                                    overflowX: 'hidden',
                                    whiteSpace: 'nowrap',
                                    textOverflow: 'ellipsis'
                                }}
                                disabled={UIFrozen}
                            >
                                <option>17.5</option>
                                <option>18</option>
                            </select>
                        </div>
                        <div className="tabPageBandCol">
                            <span>mm</span>
                        </div>
                    </div>

                    <div className="tabPageBandNL"></div>

                    <div className="tabPageBandGroup">
                        <div className="tabPageBandCol">
                            <button style={{ height: '34px' }}
                                title="Ré-assigner automatiquement les identifiants des modules de l'ensemble du projet."
                                onClick={() => reassignModules()}>
                                <img src={numbersIcon} alt="Ré-assigner automatiquement les identifiants"
                                    width={22} height={22} />
                            </button>
                        </div>
                        <div className="tabPageBandCol">
                            <input type="checkbox" name="switchboardMonitorChoice" id="switchboardMonitorChoice"
                                checked={switchboard.switchboardMonitor}
                                onChange={() => setSwitchboard((old) => ({
                                    ...old,
                                    switchboardMonitor: !old.switchboardMonitor
                                }))} />
                            <label htmlFor="switchboardMonitorChoice"
                                title="Conseils et Surveillance (NFC 15-100)"
                                className={`${monitor.errors ? 'error' : ''}`}>
                                <img src={switchboard.switchboardMonitor ? monitorIcon : nomonitorIcon}
                                    alt="Conseils et Surveillance (NFC 15-100)" width={24} height={24} />
                            </label>
                        </div>
                        {switchboard.switchboardMonitor && (
                            <div className="tabPageBandCol">
                                {monitorWarningsLength > 0
                                    ? <>
                                        <span>{`${monitorWarningsLength} erreur${monitorWarningsLength > 1 ? 's' : ''} détectée${monitorWarningsLength > 1 ? 's' : ''}.`}</span>
                                        <img src={info2Icon} alt="Détails des erreurs"
                                            title="Détails des erreurs" width={16} height={16}
                                            style={{ cursor: 'pointer', padding: '4px' }}
                                            onClick={() => setMonitorOpened(old => !old)} />
                                    </>
                                    : <span>Aucune erreur détectée.</span>
                                }
                            </div>
                        )}
                    </div>
                </div>

                {switchboard.switchboardMonitor && monitorOpened && monitor.errors && (
                    <div className="tabPageBand notprintable errors" ref={monitorRef} tabIndex={-1}
                        onBlur={() => setMonitorOpened(false)}>
                        <div className="closeButton" title={"Fermer"} onClick={() => setMonitorOpened(false)}>
                            <img src={cancelIcon} width={24} height={24} alt={"Fermer"} />
                        </div>
                        <div className="tabPageBandCol" style={{
                            height: 'max-content',
                            minHeight: 'max-content',
                            maxHeight: 'max-content'
                        }}>
                            <ul>
                                {Object.entries(monitor.errors ?? {}).map(([id, errors], i) => (
                                    <li key={i} className="tabPageErrors">
                                        <div>{id}:</div>
                                        <ul>
                                            {errors.map((error, j) => <li key={j} className="tabPageError">
                                                <img src={`${import.meta.env.BASE_URL}schema_warning.svg`}
                                                    alt="Erreurs" width={16} height={16} />
                                                <span>{error}</span>
                                            </li>)}
                                        </ul>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {switchboard.rows.map((row, i) => (
                    <Row
                        key={i}
                        rowIndex={i}
                        rowPosition={i + 1}
                        items={row.map((m) => ({ ...defaultModule, ...m }))}
                        stepsPerRows={switchboard.stepsPerRows}
                        theme={theme}
                        clipboard={clipboard}
                        clipboardMode={clipboardMode}

                        style={{
                            "--w": `${switchboard.stepsPerRows * switchboard.stepSize}mm`,
                            "--h": `calc(${switchboard.height}mm + 1mm)`, // 30mm -> 117.16px
                            "--c": switchboard.stepsPerRows,
                            "--sw": `calc(${switchboard.stepSize}mm + 1px)` // 18mm -> 70.03px
                        }}

                        onScrollLeft={() => handleScrollLeft()}
                        onScrollRight={() => handleScrollRight()}

                        onModuleGrow={(moduleIndex, item, moduleRef) => handleModuleGrow(i, moduleIndex, item, moduleRef)}
                        onModuleShrink={(moduleIndex, item, moduleRef) => handleModuleShrink(i, moduleIndex, item, moduleRef)}

                        onModuleClear={(moduleIndex, item) => handleModuleClear(i, moduleIndex, item)}
                        onModuleEdit={(moduleIndex, item) => handleModuleEdit(i, moduleIndex, item)}

                        onModuleCopy={(moduleIndex, item) => handleModuleCopy(i, moduleIndex, item)}
                        onModuleCut={(moduleIndex, item) => handleModuleCut(i, moduleIndex, item)}
                        onModulePaste={(moduleIndex, item) => handleModulePaste(i, moduleIndex, item)}
                        onModuleCancelPaste={() => handleCancelPaste()}
                        modulePasteAllowed={(moduleIndex, item) => modulePasteAllowed(i, moduleIndex, item)}
                        hasClipboard={clipboard !== null}

                        onModuleMoveLeft={(moduleIndex, item, moduleRef) => handleModuleMoveLeft(i, moduleIndex, item, moduleRef)}
                        onModuleMoveRight={(moduleIndex, item, moduleRef) => handleModuleMoveRight(i, moduleIndex, item, moduleRef)}

                        onModuleHalf={(moduleIndex, item, mode) => handleModuleHalf(i, moduleIndex, item, mode)}

                        moduleShrinkAllowed={(moduleIndex, item) => moduleShrinkAllowed(i, moduleIndex, item)}
                        moduleGrowAllowed={(moduleIndex, item) => moduleGrowAllowed(i, moduleIndex, item)}
                        moduleMoveLeftAllowed={(moduleIndex, item) => moduleMoveLeftAllowed(i, moduleIndex, item)}
                        moduleMoveRightAllowed={(moduleIndex, item) => moduleMoveRightAllowed(i, moduleIndex, item)}

                        onRowAddAfter={(rowIndex) => handleRowAddAfter(rowIndex)}
                        onRowDelete={(rowIndex) => handleRowDelete(rowIndex)}

                        rowAddAllowed={() => rowAddAllowed()}
                        rowDeleteAllowed={() => rowDeleteAllowed()}

                        printFreeModuleAllowed={() => printFreeModuleAllowed()}
                    />
                ))}
            </div>

            {/** SCHEMA TAB **/}
            <SchemaTab
                tab={tab}
                switchboard={switchboard}
                setSwitchboard={setSwitchboard}
                printOptions={printOptions}
                reassignModules={reassignModules}
                getModuleById={getModuleById2}
                onEditSymbol={(rowIndex, moduleIndex) => editModule(rowIndex, moduleIndex, 'schema')}
            />

            {/** SUMMARY TAB **/}
            <SummaryTab
                tab={tab}
                switchboard={switchboard}
                setSwitchboard={setSwitchboard}
                printOptions={printOptions}
                reassignModules={reassignModules}
                getModuleById={getModuleById2}
                onEdit={(rowIndex, moduleIndex, tab, focus) => editModule(rowIndex, moduleIndex, tab, focus)}
            />

            {/** POPUPS **/}

            {editor && <Editor
                theme={theme}
                switchboard={switchboard}
                stepSize={switchboard.stepSize}
                getFilteredModulesBySchemaFuncs={getFilteredModulesBySchemaFuncs}
                getModuleById={getModuleById}
                editor={editor}
                onSetEditor={setEditor}
                onApplyModuleEditor={applyModuleEditor}
                onHandleModuleClear={handleModuleClear}
            />}

            {newProjectProperties && <NewProjectEditor
                newProjectProperties={newProjectProperties}
                onSetNewProjectProperties={setNewProjectProperties}
                rowsMin={rowsMin}
                rowsMax={rowsMax}
                heightMin={heightMin}
                heightMax={{ heightMax }}
                onCreateProject={createProject}
                onUpdateProjectProperties={updateProjectProperties}
            />}

            {welcome && <WelcomePopup
                onCancel={() => setWelcome(false)}
                onNewProject={() => {
                    setNewProjectProperties(() => ({ ...defaultProjectProperties }));
                    setWelcome(false);
                }}
                onImportProject={() => {
                    importProjectChooseFile();
                    setWelcome(false);
                }}
            />}

            {themeEditor && <ThemeEditorPopup
                switchboard={switchboard}
                stepSize={switchboard.stepSize}
                heightMin={heightMin}
                heightMax={heightMax}
                theme={theme}
                onCancel={() => setThemeEditor(false)}
                onApply={(editedTheme) => {
                    setTheme(editedTheme);
                    setSwitchboard((old) => modulesAutoId({ ...old, theme: editedTheme }));
                    setThemeEditor(false);


                }}
            />}

        </div>
    )
}

export default App
