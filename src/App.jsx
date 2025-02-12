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


import {Fragment, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {satisfies} from 'compare-versions';
import sanitizeFilename from 'sanitize-filename';

import './app.css';
import * as pkg from '../package.json';
import themesList from './themes.json';
import swbIcons from './switchboard_icons.json';

import Row from "./Row";
import ContentEditable from "./ContentEditable";

import newProjectIcon from './assets/new_project.svg';
import uploadProjectIcon from './assets/upload.svg';
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

import Editor from "./Editor.jsx";
import NewProjectEditor from "./NewProjectEditor.jsx";
import SummaryTab from "./SummaryTab.jsx";
import SchemaTab from "./SchemaTab.jsx";
import WelcomePopup from "./WelcomePopup.jsx";

function App() {
    const importRef = useRef();
    const projectRef = useRef();
    const switchboardRef = useRef();

    const [tab, setTab] = useState(1);
    const [editor, setEditor] = useState(null);
    const [newProjectProperties, setNewProjectProperties] = useState(null);
    const [clipboard, setClipboard] = useState(null);
    const [monitorOpened, setMonitorOpened] = useState(false);
    const [welcome, setWelcome] = useState(false);

    const UIFrozen = useMemo(() => clipboard !== null, [clipboard]);

    const monitorRef = useRef(null);


    const defaultPrintOptions = useMemo(() => ({
        labels: true,
        summary: false,
        schema: false,
        freeModules: true,
        coverPage: true,
    }), []);
    const [printOptions, setPrintOptions] = useState({...defaultPrintOptions});

    const stepSize = parseInt(import.meta.env.VITE_DEFAULT_STEPSIZE);
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
        current: "",
        sensibility: "",
        coef: 0.5,
        pole: "",
        parentId: "",
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
            pole: "1P+N",
            sensibility: "500mA",
            coef: 1,
            span: 4,
            text: "Disjonteur de branchement",
            type: "S"
        }
    }), [defaultHRow, defaultNpRows, defaultProjectName, defaultStepsPerRows, defaultProjectType, defaultVRef]);

    const createRow = useCallback((steps, rowsCount) => {
        return Array(rowsCount).fill([]).map((_, i) => Array(steps).fill({...defaultModule}).map((q, j) => ({
            ...q,
            id: `Q${(j + 1) + (((i + 1) * steps) - steps)}`
        })));
    }, [defaultModule]);

    const defaultProject = useMemo(() => ({
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
        stepSize: stepSize,
        rows: createRow(defaultStepsPerRows, defaultNpRows),
        db: {...defaultProjectProperties.db},
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
    }), [createRow, defaultHRow, defaultNpRows, defaultProjectName, defaultStepsPerRows, defaultTheme, defaultProjectProperties.db, defaultProjectType, defaultVRef]);

    const schemaFunctions = {
        sw: {
            name: 'Interrupteur sectionneur',
            hasType: false,
            hasCrb: false,
            hasCurrent: true,
            hasPole: true,
        },
        id: {
            name: 'Interrupteur différentiel',
            hasType: true,
            hasCrb: false,
            hasCurrent: true,
            hasPole: true,
        },
        dd: {
            name: 'Disjoncteur différentiel',
            hasType: true,
            hasCrb: true,
            hasCurrent: true,
            hasPole: true,
        },
        q: {
            name: 'Disjoncteur',
            hasType: false,
            hasCrb: true,
            hasCurrent: true,
            hasPole: true,
        },
        i: {
            name: 'Interrupteur',
            hasType: false,
            hasCrb: false,
            hasCurrent: true,
            hasPole: true,
        },
        c: {
            name: 'Commande',
            hasType: false,
            hasCrb: false,
            hasCurrent: true,
            hasPole: false,
        },
        k: {
            name: 'Relai (Bobine)',
            hasType: false,
            hasCrb: false,
            hasCurrent: true,
            hasPole: false,
        },
        kc: {
            name: 'Relai (Contact)',
            hasType: false,
            hasCrb: false,
            hasCurrent: true,
            hasPole: true,
        },
        o: {
            name: 'Autre',
            hasType: false,
            hasCrb: false,
            hasCurrent: true,
            hasPole: true,
        },
    };

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

        return {...reIndentedSwb, rows};
    }, [defaultModuleId]);

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
                    counters = {...counters, [func]: (counters[func] ?? 0) + 1};

                    const newModuleId = `${func}${counters[func]}`;
                    from = {...from, [module.id]: newModuleId};

                    return {
                        ...module,
                        id: newModuleId
                    };
                });
            });

            // re-assign parents
            rows = rows.map((row) => {
                return row.map((module) => {
                    if (from[module.parentId]) {
                        return {
                            ...module,
                            parentId: from[module.parentId],
                        };
                    }
                    return module;
                });
            });

            setSwitchboard((old) => ({...old, rows}));
        }
    }

    const getSavedSwitchboard = () => {
        if (sessionStorage.getItem(pkg.name)) {
            let swb = {
                ...defaultProject,
                ...JSON.parse(sessionStorage.getItem(pkg.name))
            };

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
                db: {...defaultProjectProperties.db, ...(swb.db ?? {...defaultProjectProperties.db})},
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
                stepSize: swb.stepSize ?? stepSize,
            };

            console.log("Switchboard loaded from this session.");

            return modulesAutoId({...swb});
        }

        //setWelcome(true);

        return {...defaultProject};
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
                prjname: name,
                height: height,
                stepsPerRows,
                stepSize,
                rows: createRow(stepsPerRows, rowsCount)
            });
        });

        setClipboard(null);
        setPrintOptions({...defaultPrintOptions});
        setDocumentTitle(name);
        setTab(1);
        scrollToProject();
    }, [defaultTheme, defaultPrintOptions, modulesAutoId, defaultProject, createRow]);

    const resetProject = useCallback(() => {
        importRef.current.value = "";

        setClipboard(null);
        setDocumentTitle(defaultProjectName);
        setTheme(defaultTheme);

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

                    let theme = swb?.theme;
                    if (!theme) theme = getThemeOfFirstModuleFound(swb);
                    setTheme(theme);


                    const rows = swb.rows.map((r) => {
                        return r.map((m) => {
                            let nm = {...m};

                            // <=1.4.0 : remove old theme definitions
                            if (nm.theme) delete nm['theme'];

                            // <=2.0.0 : add module default values for schema definitions
                            if (nm.icon) {
                                const sic = swbIcons.filter((si) => si.filename === nm.icon);
                                if (sic.length === 1) {
                                    if (!nm.coef) nm = {...nm, coef: sic[0].coef};
                                    //if (!nm.func) nm = {...nm, func: sic[0].func};
                                    //if (!nm.crb) nm = {...nm, crb: sic[0].crb};
                                    //if (!nm.current) nm = {...nm, current: sic[0].current};
                                }
                            }

                            // <=2.0.3 : add half module size
                            if (!nm.half) nm = {...nm, half: "none"};

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
                        db: {...defaultProjectProperties.db, ...(swb.db ?? {...defaultProjectProperties.db})},
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
                        stepSize: swb.stepSize ?? stepSize,

                        rows
                    };

                    setSwitchboard(() => modulesAutoId({...swb}));

                    //const filename = importRef.current.value.replaceAll("\\", "/").split("/").pop();
                    //setDocumentTitle(filename);

                    setClipboard(null);
                    setPrintOptions({...defaultPrintOptions});
                    setTab(1);
                    scrollToProject();

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
            prjversion: switchboard.prjversion ? parseInt(switchboard.prjversion) + 1 : 1
        }

        const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(JSON.stringify(swb))}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = `${pkg.title} - ${sanitizeFilename(swb.prjname ?? defaultProjectName)} - v${swb.prjversion}.json`;
        link.click();

        setSwitchboard(swb);
    };

    const printProject = () => {
        if (window) {
            window.print();
        } else {
            alert("Cet appareil ne permet pas de lancer une impression.");
        }
    };

    const editModule = (rowIndex, moduleIndex, tabPage = 'main') => {
        let currentModule = switchboard.rows[rowIndex][moduleIndex];
        let hasBlankId = false;
        if (!currentModule.id || currentModule.id.trim() === '') {
            currentModule = {...currentModule, id: lastFreeId};
            hasBlankId = true;
        }

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

        setEditor({rowIndex, moduleIndex, currentModule, prevModule, theme, tabPage, errors: [], hasBlankId});
    };

    const updateModuleEditor = (data) => {
        setEditor((old) => ({...old, currentModule: {...old.currentModule, ...data}}));
    }

    const applyModuleEditor = () => {
        setEditor((old) => ({
            ...old,
            errors: []
        }));

        const id = editor.currentModule.id.trim().toUpperCase();
        const icon = editor.currentModule.icon;
        const text = (editor.currentModule.text ?? "").trim();
        const desc = (editor.currentModule.desc ?? "").trim();

        const parentId = (editor.currentModule.parentId ?? "").trim();
        const func = (editor.currentModule.func ?? "").trim();
        const type = (schemaFunctions[editor.currentModule.func]?.hasType ? (editor.currentModule.type ?? "") : "").trim();
        const crb = (schemaFunctions[editor.currentModule.func]?.hasCrb ? (editor.currentModule.crb ?? "") : "").trim();
        const current = (schemaFunctions[editor.currentModule.func] ? (editor.currentModule.current ?? "") : "").trim();
        const sensibility = (schemaFunctions[editor.currentModule.func]?.hasType ? (editor.currentModule.sensibility ?? "") : "").trim();
        const coef = editor.currentModule.coef ?? 0.5;
        const pole = (schemaFunctions[editor.currentModule.func]?.hasPole ? (editor.currentModule.pole ?? "") : "").trim();

        if (!(/\w*/.test(id)) || id === '') {
            setEditor((old) => ({
                ...old,
                currentModule: {...old.currentModule, id: ""},
                errors: [...old.errors, "Un identifiant valide est requis."]
            }));
            return;
        }

        if (!(/\w*/.test(text))) {
            setEditor((old) => ({
                ...old,
                currentModule: {...old.currentModule, text: ""},
                errors: [...old.errors, "Une description valide est requise."]
            }));
            return;
        }

        if (!(/\w*/.test(desc))) {
            setEditor((old) => ({
                ...old,
                currentModule: {...old.currentModule, desc: ""},
                errors: [...old.errors, "Une description valide est requise."]
            }));
            return;
        }

        setSwitchboard((old) => {
            let rows = old.rows.map((row, i) => {
                if (i !== editor.rowIndex) return row;

                let r = row.map((module, j) => {
                    if (j !== editor.moduleIndex) return module;

                    return {
                        ...module,
                        free: false,
                        id,
                        icon,
                        text,
                        desc,
                        parentId,
                        func,
                        crb,
                        type,
                        current,
                        sensibility,
                        coef,
                        pole,
                    };
                });

                return r;
            });

            return modulesAutoId({...old, rows});
        });

        setEditor(null);
    }

    const moduleGrow = (rowIndex, moduleIndex) => {
        const nextModuleIndex = moduleIndex + 1;

        setSwitchboard((old) => {
            let rows = old.rows.map((row, i) => {
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
                    return {...module, span: module.span + 1};
                });

                return r.filter((rr) => rr !== null);
            });

            return modulesAutoId({...old, rows});
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
                        return {...module, span: s, half: h};
                    });

                    r.splice(moduleIndex + 1, 0, {...defaultModule});

                    return r;
                });

                return modulesAutoId({...old, rows});
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

                        return {...module, ...defaultModule, span: module.span};
                    });

                    return r;
                });

                return modulesAutoId({...old, rows});
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
            setSwitchboard((old) => modulesAutoId({...old, theme: selected}));
            setTab(1);
        }
    }

    const openProjectPropertiesEditor = () => {
        setNewProjectProperties(() => ({...defaultProjectProperties}));
    };

    const updateProjectProperties = (data) => {
        setNewProjectProperties((old) => ({...old, ...data}));
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

    const handleModuleClear = (rowIndex, moduleIndex) => {
        if (confirm("Êtes-vous certain de vouloir libérer ce module?")) {
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
                return modulesAutoId({...old, rows});
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
                return modulesAutoId({...old, rows});
            })
        }
    }

    const handleModuleCopy = (rowIndex, moduleIndex) => {
        const row = switchboard.rows[rowIndex];
        const currentModule = row[moduleIndex];

        if (!currentModule.free) setClipboard(currentModule);
    }

    const handleModulePaste = (rowIndex, moduleIndex) => {
        if (!clipboard) return;
        if (!modulePasteAllowed(rowIndex, moduleIndex)) return;

        const row = switchboard.rows[rowIndex];

        const currentModule = row[moduleIndex];
        if (currentModule.span < clipboard.span) {
            for (let i = 0; i < clipboard.span - 1; i++) moduleGrow(rowIndex, moduleIndex);
        }
        if (currentModule.span > clipboard.span) {
            for (let i = 0; i < (currentModule.span - clipboard.span); i++) moduleShrink(rowIndex, moduleIndex);
        }

        setSwitchboard((old) => {
            let rows = old.rows.map((row, i) => {
                if (i !== rowIndex) return row;

                let r = row.map((module, j) => {
                    if (j !== moduleIndex) return module;

                    return {
                        ...module,
                        free: clipboard.free,
                        span: clipboard.span,
                        icon: clipboard.icon,
                        text: clipboard.text,
                        desc: clipboard.desc,
                        parentId: clipboard.parentId,
                        func: clipboard.func,
                        crb: clipboard.crb,
                        type: clipboard.type,
                        current: clipboard.current,
                        sensibility: clipboard.sensibility,
                        coef: clipboard.coef,
                        pole: clipboard.pole,
                    };
                });

                return r;
            });

            return modulesAutoId({...old, rows});
        });

        setClipboard(null);
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
                return modulesAutoId({...old, rows});
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

        setSwitchboard((old) => modulesAutoId({...old, rows}));
    }

    const handleRowDelete = (rowIndex) => {
        let rows = switchboard.rows;
        rows.splice(rowIndex, 1);

        setSwitchboard((old) => modulesAutoId({...old, rows}));
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

    const monitor = useMemo(() => {
        if (!switchboard.switchboardMonitor) return {};

        let result = {};

        const used = switchboard.rows.map((row) => row.filter((module) => !module.free).reduce((a, b) => a + b.span, 0)).reduce((a, b) => a + b, 0);
        const total = switchboard.rows.length * switchboard.stepsPerRows;
        const percentFree = Math.round(100 - ((used / total) * 100));
        result = {
            ...result,
            infos: {
                ...result.infos,
                Enveloppe: `${used} module${used > 1 ? 's' : ''} occupé${used > 1 ? 's' : ''} sur ${total} disponible${used > 1 ? 's' : ''} (${percentFree}% libre)`
            }
        };

        let e_errors = (result.errors ?? [])['Enveloppe'] ?? [];
        if (percentFree < 20) {
            const e_error = `La norme NFC 15-100 impose un minimum de 20% d'emplacements libres. Vous occupez ${used} module${used > 1 ? 's' : ''} sur ${total} disponible${used > 1 ? 's' : ''} (${percentFree}% libre).`;
            if (!e_errors.includes(e_error)) e_errors.push(e_error);
        }
        if (e_errors.length > 0) result = {...result, errors: {...result.errors, Enveloppe: e_errors}};

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

                console.log("Switchboard saved to this session.");
            }
        }, 1000);

        return () => {
            if (t) clearTimeout(t);
        }
    }, [resetProject, switchboard]);

    useEffect(() => {
        if (window) {
            window.document.body.style.overflow = editor || newProjectProperties ? 'hidden' : 'auto';
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
    }, []);

    return (
        <div tabIndex={-1} onKeyUp={(e) => {
            if (e.key === 'Escape') {
                setClipboard(null);
            }
        }}>
            {/** TOOLBAR **/}

            <nav className={`button_group ${UIFrozen ? 'disabled' : ''}`.trim()}>
                <button className={`button_group-new_project active`.trim()}
                        onClick={() => {
                            setWelcome(true);
                        }} title="Créer un nouveau projet">
                    <img src={newProjectIcon} width={16} height={16} alt={defaultProjectName}/>
                    <span>Nouveau projet</span>
                </button>

                <div className="button_group-separator"></div>

                <input id="importfile" ref={importRef} type="file" onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) importProject(e.target.files[0]);
                }} style={{visibility: 'hidden', position: 'absolute', top: '0', left: '-500000px'}}/>
                <label htmlFor="importfile" className="button_group-import_project"
                       title="Importer un projet existant">
                    <img src={uploadProjectIcon} width={16} height={16} alt={"Importer"}
                         onClick={() => importProjectChooseFile()}/>
                    <span>Importer</span>
                </label>

                <button className="button_group-export_project" onClick={() => {
                    exportProject();
                }} title="Exporter...">
                    <img src={exportProjectIcon} width={16} height={16} alt={"Exporter"}/>
                    <span>Exporter</span>
                </button>

                <button className="button_group-print_project dropdown_container" title="Imprimer...">
                    <img src={printProjectIcon} width={16} height={16} alt={"Imprimer"}/>
                    <span>Imprimer...</span>
                    <div className="dropdown">
                        <div className="dropdown_header">Options</div>
                        <div className="dropdown_item" title="Imprimer les étiquettes">
                            <input id="print_labels" name="print_labels" type="checkbox"
                                   checked={printOptions.labels}
                                   onChange={(e) => setPrintOptions((old) => ({
                                       ...old,
                                       labels: e.target.checked
                                   }))}/>
                            <label htmlFor="print_labels">Etiquettes</label>
                        </div>
                        <div className="dropdown_item"
                             title="Imprimer les emplacements libres de chaque rangée d'étiquettes"
                             style={{marginLeft: '0.5em'}}>
                            <input id="print_free" name="print_free" type="checkbox"
                                   checked={printOptions.freeModules}
                                   onChange={(e) => setPrintOptions((old) => ({
                                       ...old,
                                       freeModules: e.target.checked
                                   }))} disabled={!printOptions.labels}/>
                            <label htmlFor="print_free">Imprimer les emplacements libres</label>
                        </div>

                        <div className="dropdown_separator"></div>

                        <div className="dropdown_item" title="Imprimer le schéma unifilaire">
                            <input id="print_schema" name="print_schema" type="checkbox"
                                   checked={printOptions.schema}
                                   onChange={(e) => setPrintOptions((old) => ({
                                       ...old,
                                       schema: e.target.checked
                                   }))}/>
                            <label htmlFor="print_schema">Schéma unifilaire</label>
                        </div>
                        <div className="dropdown_item" title="Imprimer la page de garde"
                             style={{marginLeft: '0.5em'}}>
                            <input id="print_cover" name="print_cover" type="checkbox"
                                   checked={printOptions.coverPage}
                                   onChange={(e) => setPrintOptions((old) => ({
                                       ...old,
                                       coverPage: e.target.checked
                                   }))} disabled={!printOptions.schema}/>
                            <label htmlFor="print_cover">Imprimer la page de garde</label>
                        </div>

                        <div className="dropdown_separator"></div>

                        <div className="dropdown_item" title="Imprimer la nomenclature">
                            <input id="print_summary" name="print_summary" type="checkbox"
                                   checked={printOptions.summary}
                                   onChange={(e) => setPrintOptions((old) => ({
                                       ...old,
                                       summary: e.target.checked
                                   }))}/>
                            <label htmlFor="print_summary">Nomenclature</label>
                        </div>

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
                    <img src={clearProjectIcon} width={16} height={16} alt={"Réinitialiser"}/>
                    <span>Réinitialiser</span>
                </button>

                <div className="button_group-separator"></div>
            </nav>

            {/** SWITCHBOARD PROJECT **/}

            {/** PROJECT TITLE **/}

            <h3 ref={projectRef} className={`${printOptions.labels ? 'printable' : 'notprintable'}`.trim()}>
                <img src={projectIcon} width={24} height={24} alt="Projet courant"/>
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
                />
            </h3>

            {/** PROJECT DETAILS **/}

            <ul className="project">
                <li title="Révision">
                    <img src={versionIcon} alt="Révision" width={16} height={16}/>
                    <span>Révision {switchboard.prjversion ?? 1}</span>
                </li>
                <li title="Description">
                    <img src={infoIcon} alt="Description" width={16} height={16}/>
                    <span>{switchboard.rows.length} x {switchboard.stepsPerRows} module{switchboard.stepsPerRows > 1 ? 's' : ''} / {switchboard.height}mm</span>
                </li>
                <li title="Date de création">
                    <img src={createdIcon} alt="Date de création" width={16} height={16}/>
                    <span>{(switchboard.prjcreated ?? (new Date())).toLocaleString()}</span>
                </li>
                <li title="Date de modification">
                    <img src={updatedIcon} alt="Date de modification" width={16} height={16}/>
                    <span>{(switchboard.prjupdated ?? (new Date())).toLocaleString()}</span>
                </li>
            </ul>

            {/** TABPAGES SELECTOR **/}

            <nav className={`tabPages ${UIFrozen ? 'disabled' : ''}`.trim()}>
                <div className={`tabPages_page ${tab === 1 ? 'selected' : ''}`.trim()}
                     onClick={() => setTab(1)}>
                    <img src={projectIcon} width={20} height={20} alt="Etiquettes"/>
                    <span>Etiquettes</span>
                </div>
                <div className={`tabPages_page ${tab === 2 ? 'selected' : ''}`.trim()}
                     onClick={() => setTab(2)}>
                    <img src={schemaIcon} width={20} height={20} alt="Schéma unifilaire"/>
                    <span>Schéma</span>
                </div>
                <div className={`tabPages_page ${tab === 3 ? 'selected' : ''}`.trim()}
                     onClick={() => setTab(3)}>
                    <img src={summaryIcon} width={20} height={20} alt="Nomenclature"/>
                    <span>Nomenclature</span>
                </div>
            </nav>

            {/** TABPAGES **/}

            {/** SWITCHBOARD TAB **/}
            <div ref={switchboardRef}
                 className={`switchboard ${tab === 1 ? 'selected' : ''} ${printOptions.labels ? 'printable' : 'notprintable'}`.trim()}>
                <div className="tabPageBand notprintable">
                    <div className="tabPageBandGroup">
                        <div className="tabPageBandCol">
                            <span style={{fontSize: 'smaller', lineHeight: 1.2}}>Thème<br/>courant:</span>
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
                                {Object.entries(Object.groupBy(themesList, (({group}) => group))).map((e) => {
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
                    </div>

                    <div className="tabPageBandGroup">
                        <div className="tabPageBandCol">
                                    <span style={{
                                        fontSize: 'smaller',
                                        lineHeight: 1.2
                                    }}>Hauteur des<br/>étiquettes:</span>
                        </div>
                        <div className="tabPageBandCol">
                            <input type="range" min={heightMin} max={heightMax} step={1}
                                   value={switchboard.height} onChange={(e) => {
                                const value = parseInt(e.target.value);
                                if (value >= heightMin) setSwitchboard((old) => ({...old, height: value}));
                            }}/>
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
                                    }}>Largeur des<br/>étiquettes:</span>
                        </div>
                        <div className="tabPageBandCol">
                            <select
                                value={switchboard.stepSize ?? stepSize}
                                onChange={(e) => {
                                    const value = parseFloat(e.target.value);
                                    if (value === 17.5 || value === 18) setSwitchboard((old) => ({...old, stepSize: value}));
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
                            <button style={{height: '34px'}}
                                    title="Ré-assigner automatiquement les identifiants des modules de l'ensemble du projet."
                                    onClick={() => reassignModules()}>
                                <img src={numbersIcon} alt="Ré-assigner automatiquement les identifiants"
                                     width={22} height={22}/>
                            </button>
                        </div>
                        <div className="tabPageBandCol">
                            <input type="checkbox" name="switchboardMonitorChoice" id="switchboardMonitorChoice"
                                   checked={switchboard.switchboardMonitor}
                                   onChange={() => setSwitchboard((old) => ({
                                       ...old,
                                       switchboardMonitor: !old.switchboardMonitor
                                   }))}/>
                            <label htmlFor="switchboardMonitorChoice"
                                   title="Conseils et Surveillance (NFC 15-100)"
                                   className={`${monitor.errors ? 'error' : ''}`}>
                                <img src={switchboard.switchboardMonitor ? monitorIcon : nomonitorIcon}
                                     alt="Conseils et Surveillance (NFC 15-100)" width={24} height={24}/>
                            </label>
                        </div>
                        {switchboard.switchboardMonitor && (
                            <div className="tabPageBandCol">
                                {monitorWarningsLength > 0
                                    ? <>
                                        <span>{`${monitorWarningsLength} erreur${monitorWarningsLength > 1 ? 's' : ''} détectée${monitorWarningsLength > 1 ? 's' : ''}.`}</span>
                                        <img src={info2Icon} alt="Détails des erreurs"
                                             title="Détails des erreurs" width={16} height={16}
                                             style={{cursor: 'pointer', padding: '4px'}}
                                             onClick={() => setMonitorOpened(old => !old)}/>
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
                            <img src={cancelIcon} width={24} height={24} alt={"Fermer"}/>
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
                                                     alt="Erreurs" width={16} height={16}/>
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
                        items={row.map((m) => ({...defaultModule, ...m}))}
                        stepsPerRows={switchboard.stepsPerRows}
                        theme={theme}

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
                schemaFunctions={schemaFunctions}
                reassignModules={reassignModules}
                onEditSymbol={(rowIndex, moduleIndex) => editModule(rowIndex, moduleIndex, 'schema')}
            />

            {/** SUMMARY TAB **/}
            <SummaryTab
                tab={tab}
                switchboard={switchboard}
                setSwitchboard={setSwitchboard}
                printOptions={printOptions}
                schemaFunctions={schemaFunctions}
            />

            {/** POPUPS **/}

            {editor && <Editor
                theme={theme}
                switchboard={switchboard}
                stepSize={switchboard.stepSize}
                schemaFunctions={schemaFunctions}
                getFilteredModulesBySchemaFuncs={getFilteredModulesBySchemaFuncs}
                getModuleById={getModuleById}
                editor={editor}
                onSetEditor={setEditor}
                onApplyModuleEditor={applyModuleEditor}
                onUpdateModuleEditor={updateModuleEditor}
                onHandleModuleClear={handleModuleClear}
            />}

            {newProjectProperties && <NewProjectEditor
                newProjectProperties={newProjectProperties}
                onSetNewProjectProperties={setNewProjectProperties}
                rowsMin={rowsMin}
                rowsMax={rowsMax}
                heightMin={heightMin}
                heightMax={{heightMax}}
                onCreateProject={createProject}
                onUpdateProjectProperties={updateProjectProperties}
            />}

            {welcome && <WelcomePopup
                onCancel={() => setWelcome(false)}
                onNewProject={() => {
                    setNewProjectProperties(() => ({...defaultProjectProperties}));
                    setWelcome(false);
                }}
                onImportProject={() => {
                    importProjectChooseFile();
                    setWelcome(false);
                }}
            />}

        </div>
    )
}

export default App
