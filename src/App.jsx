import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { satisfies } from 'compare-versions';
import sanitizeFilename from 'sanitize-filename';

import './app.css';
import * as pkg from '../package.json';
import swbIcons from './switchboard_icons.json';
import themesList from './themes.json';

import Row from "./Row";
import Popup from "./Popup";

import newProjectIcon from './assets/new_project.svg';
import uploadProjectIcon from './assets/upload.svg';
import clearProjectIcon from './assets/x.svg';
import exportProjectIcon from './assets/download.svg';
import printProjectIcon from './assets/printer.svg';
import projectIcon from './assets/project.svg';
import ContentEditable from "./ContentEditable";


function App() {
    const importRef = useRef();
    const projectRef = useRef();
    const switchboardRef = useRef();

    const [editor, setEditor] = useState(null);
    const [newProjectProperties, setNewProjectProperties] = useState(null);

    const stepSize = parseInt(import.meta.env.VITE_DEFAULT_STEPSIZE);
    const defaultProjectName = import.meta.env.VITE_DEFAULT_PROJECT_NAME;
    const defaultNpRows = parseInt(import.meta.env.VITE_DEFAULT_ROWS);
    const defaultHRow = parseInt(import.meta.env.VITE_DEFAULT_ROWHEIGHT);
    const defaultStepsPerRows = parseInt(import.meta.env.VITE_DEFAULT_STEPSPERROW);
    const defaultTheme = themesList.filter((t) => t.default)[0];
    const defaultModuleId = import.meta.env.VITE_DEFAULT_ID;
    const rowsMin = parseInt(import.meta.env.VITE_ROWS_MIN);
    const rowsMax = parseInt(import.meta.env.VITE_ROWS_MAX);
    const heightMin = parseInt(import.meta.env.VITE_HEIGHT_MIN);
    const heightMax = parseInt(import.meta.env.VITE_HEIGHT_MAX);

    const defaultModule = useMemo(() => ({
        id: `${defaultModuleId}?`,
        icon: import.meta.env.VITE_DEFAULT_ICON === "" ? null : import.meta.env.VITE_DEFAULT_ICON,
        text: import.meta.env.VITE_DEFAULT_TEXT,
        free: true,
        span: 1
    }), [defaultModuleId]);

    const defaultProjectProperties = useMemo(() => ({
        name: defaultProjectName,
        npRows: defaultNpRows,
        hRow: defaultHRow,
        spr: defaultStepsPerRows,
    }), [defaultHRow, defaultNpRows, defaultProjectName, defaultStepsPerRows]);

    const createRow = useCallback((steps, rowsCount) => {
        return Array(rowsCount).fill([]).map((_, i) => Array(steps).fill({ ...defaultModule }).map((q, j) => ({
            ...q,
            id: `Q${(j + 1) + (((i + 1) * steps) - steps)}`
        })));
    }, [defaultModule]);

    const defaultProject = useMemo(() => ({
        prjname: defaultProjectName,
        prjcreated: new Date(),
        prjupdated: new Date(),
        prjversion: 1,
        theme: defaultTheme,
        appversion: pkg.version,
        height: defaultHRow,
        stepsPerRows: defaultStepsPerRows,
        rows: createRow(defaultStepsPerRows, defaultNpRows),
    }), [createRow, defaultHRow, defaultNpRows, defaultProjectName, defaultStepsPerRows, defaultTheme]);

    const setDocumentTitle = (title) => {
        document.title = `${title} - ${pkg.title} ${pkg.version}`
    };

    const scrollToProject = () => {
        projectRef.current.scrollIntoView({
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

    const modulesAutoId = useCallback((swb, rowIndex = 0, moduleIndex = 0) => {
        let reIndentedSwb = swb;
        let jump = 0;

        let rows = reIndentedSwb.rows.map((row, i) => {
            if (i > 0) {
                const freeCount = reIndentedSwb.rows[i - 1].filter((r) => r.free).length;
                const notFreeCount = reIndentedSwb.rows[i - 1].filter((r) => !r.free).length;

                jump += freeCount + (i === rowIndex + 1 ? notFreeCount : 0);
            }

            if (i >= rowIndex) {
                return row.map((module, j) => {
                    if (((i === rowIndex && j >= moduleIndex) || (i > rowIndex)) && module.free) {
                        return {
                            ...module,
                            id: `${defaultModuleId}${j + 1 + jump}`
                        };
                    } else {
                        return module;
                    }
                });
            } else {
                return row
            }
        });

        return { ...reIndentedSwb, rows };
    }, [defaultModuleId]);

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
            };

            return modulesAutoId({ ...swb });
        }

        return { ...defaultProject };
    };

    const [switchboard, setSwitchboard] = useState(getSavedSwitchboard());

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
                rows: createRow(stepsPerRows, rowsCount)
            });
        });

        setDocumentTitle(name);
        scrollToProject();
    }, [modulesAutoId, createRow, defaultProject, defaultTheme]);

    const resetProject = useCallback(() => {
        importRef.current.value = "";

        setDocumentTitle(defaultProjectName);
        setTheme(defaultTheme);

        createProject(defaultProjectName, defaultStepsPerRows, defaultNpRows, defaultHRow);
    }, [createProject, defaultHRow, defaultNpRows, defaultProjectName, defaultStepsPerRows, defaultTheme]);

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

                    // <=1.4.0 : remove old theme definitions
                    const rows = swb.rows.map((r) => {
                        return r.map((m) => {
                            let nm = { ...m };
                            if (nm.theme) delete nm['theme'];
                            return nm;
                        });
                    });
                    swb = {
                        ...defaultProject,
                        ...swb,

                        prjcreated: swb.prjcreated ? new Date(swb.prjcreated) : new Date(),
                        prjupdated: swb.prjupdated ? new Date(swb.prjupdated) : new Date(),
                        prjversion: swb.prjversion ? parseInt(swb.prjversion) : 1,

                        rows
                    };

                    setSwitchboard(() => modulesAutoId({ ...swb }));

                    //const filename = importRef.current.value.replaceAll("\\", "/").split("/").pop();
                    //setDocumentTitle(filename);

                    scrollToProject();
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

    const editModule = (rowIndex, moduleIndex) => {
        const currentModule = switchboard.rows[rowIndex][moduleIndex];

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

        setEditor({ rowIndex, moduleIndex, currentModule, prevModule, theme, errors: [] });
    };

    const updateModuleEditor = (data) => {
        setEditor((old) => ({ ...old, currentModule: { ...old.currentModule, ...data } }));
    }

    const applyModuleEditor = () => {
        setEditor((old) => ({
            ...old,
            errors: []
        }));

        const id = editor.currentModule.id.trim().toUpperCase();
        const icon = editor.currentModule.icon;
        const text = editor.currentModule.text.trim();

        if (!(/\w*/.test(id))) {
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
                        text
                    };
                });

                return r;
            });

            return modulesAutoId({ ...old, rows });
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

                        return { ...module, span: module.span - 1 };
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

                        return { ...module, ...defaultModule, span: module.span };
                    });

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

    const handleModuleClear = (rowIndex, moduleIndex) => {
        const row = switchboard.rows[rowIndex];
        const currentModule = row[moduleIndex];

        if (!currentModule.free) {
            moduleClear(rowIndex, moduleIndex);
            moduleFocus(rowIndex + 1, moduleIndex + 1);
        }
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

        if (!currentModule.free && prevModule?.free === true && prevModule?.span === 1) {
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

        if (!currentModule.free && nextModule?.free === true && nextModule?.span === 1) {
            row[moduleIndex + 1] = currentModule;
            row[moduleIndex] = nextModule;
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

        return (!currentModule.free && prevModule?.free === true && prevModule?.span === 1);
    }

    const moduleMoveRightAllowed = (rowIndex, moduleIndex) => {
        const row = switchboard.rows[rowIndex];
        const currentModule = row[moduleIndex];
        const nextModule = (moduleIndex + currentModule.span) < switchboard.stepsPerRows ? row[moduleIndex + 1] : null;

        return (!currentModule.free && nextModule?.free === true && nextModule?.span === 1);
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

    useEffect(() => {
        let t = null;

        if (!verifyVersion(switchboard)) {
            resetProject();

            if (t) clearTimeout(t);
            return;
        }

        t = setTimeout(() => {
            const savedProjectIsOutdated = sessionStorage.getItem(pkg.name) !== JSON.stringify(switchboard);
            if (savedProjectIsOutdated) {
                let updatedProject = {
                    ...switchboard,
                    prjupdated: new Date()
                };

                sessionStorage.setItem(pkg.name, JSON.stringify(updatedProject));
                setSwitchboard(updatedProject);

                console.log("Saved for this session.");
            }
        }, 1000);

        return () => {
            if (t) clearTimeout(t);
        }
    }, [resetProject, switchboard]);

    return (
        <>
            <nav className="button_group">
                <button className="button_group-new_project" onClick={() => { openProjectPropertiesEditor(); }} title="Créer un nouveau projet">
                    <img src={newProjectIcon} width={16} height={16} alt={defaultProjectName} />
                    <span>Nouveau projet</span>
                </button>

                <div className="button_group-separator"></div>

                <input id="importfile" ref={importRef} type="file" onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) importProject(e.target.files[0]);
                }} style={{ visibility: 'hidden', position: 'absolute', top: '0', left: '-500000px' }} />
                <label htmlFor="importfile" className="button_group-import_project" title="Importer un projet existant">
                    <img src={uploadProjectIcon} width={16} height={16} alt={"Importer"} onClick={() => document.getElementById('importfile').click()} />
                    <span>Importer</span>
                </label>

                <button className="button_group-export_project" onClick={() => {
                    exportProject();
                }} title="Exporter...">
                    <img src={exportProjectIcon} width={16} height={16} alt={"Exporter"} />
                    <span>Exporter</span>
                </button>

                <button className="button_group-print_project" onClick={() => {
                    printProject();
                }} title="Imprimer...">
                    <img src={printProjectIcon} width={16} height={16} alt={"Imprimer"} />
                    <span>Imprimer...</span>
                </button>

                <div className="button_group-separator"></div>

                <button className="button_group-clear_project" onClick={() => {
                    if (confirm("Êtes-vous certain de vouloir réinitialiser le projet?")) resetProject();
                }} title="Réinitialiser le projet" >
                    <img src={clearProjectIcon} width={16} height={16} alt={"Réinitialiser"} />
                    <span>Réinitialiser</span>
                </button>

                <div className="button_group-separator"></div>
            </nav>

            <h3 ref={projectRef}>
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
                    editable={true}
                />
                <sup>v{switchboard.prjversion ?? 1}</sup>
            </h3 >

            <ul className="project">
                <li>
                    <span><u>Date de création</u>: <b>{(switchboard.prjcreated ?? (new Date())).toLocaleString()}</b></span>
                </li>
                <li>
                    <span><u>Dernière modification</u>: <b>{(switchboard.prjupdated ?? (new Date())).toLocaleString()}</b></span>
                </li>
                <li>
                    <span><u>Descriptif</u>: <b>{switchboard.rows.length}</b> rangée{switchboard.rows.length > 1 ? 's' : ''} de <b>{switchboard.stepsPerRows}</b> module{switchboard.stepsPerRows > 1 ? 's' : ''}. Hauteur des étiquettes: <b>{switchboard.height}mm</b>.</span>
                </li>
                <li className="nobefore">
                    <span><b>Thème actuel:</b></span>
                    <select
                        value={theme?.name ?? defaultTheme}
                        onChange={(e) => { updateTheme(e.target.value); }}
                    >
                        {Object.entries(Object.groupBy(themesList, (({ group }) => group))).map((e) => {
                            const g = e[0];
                            const l = e[1];
                            return <Fragment key={`themes_${g}`}>
                                <option key={`group_${g}`} id={`group_${g}`} disabled>- {g} -</option>
                                {l.map((t) => <option key={`theme_${t.name}`} id={`theme_${t.name}`} value={t.name}>{g} - {t.title}</option>)}
                            </Fragment>
                        })}
                    </select>
                </li>
            </ul>

            <div ref={switchboardRef} className="switchboard">
                {switchboard.rows.map((row, i) => (
                    <Row
                        key={i}
                        rowIndex={i}
                        rowPosition={i + 1}
                        items={row.map((m) => ({ ...defaultModule, ...m }))}
                        stepsPerRows={switchboard.stepsPerRows}
                        theme={theme}

                        style={{
                            "--w": `${switchboard.stepsPerRows * stepSize}mm`,
                            "--h": `calc(${switchboard.height}mm + 1mm)`, // 30mm -> 117.16px
                            "--c": switchboard.stepsPerRows,
                            "--sw": `calc(${stepSize}mm + 1px)` // 18mm -> 70.03px
                        }}

                        onScrollLeft={() => handleScrollLeft()}
                        onScrollRight={() => handleScrollRight()}

                        onModuleGrow={(moduleIndex, item, moduleRef) => handleModuleGrow(i, moduleIndex, item, moduleRef)}
                        onModuleShrink={(moduleIndex, item, moduleRef) => handleModuleShrink(i, moduleIndex, item, moduleRef)}

                        onModuleClear={(moduleIndex, item) => handleModuleClear(i, moduleIndex, item)}
                        onModuleEdit={(moduleIndex, item) => handleModuleEdit(i, moduleIndex, item)}

                        onModuleMoveLeft={(moduleIndex, item, moduleRef) => handleModuleMoveLeft(i, moduleIndex, item, moduleRef)}
                        onModuleMoveRight={(moduleIndex, item, moduleRef) => handleModuleMoveRight(i, moduleIndex, item, moduleRef)}

                        moduleShrinkAllowed={(moduleIndex, item) => moduleShrinkAllowed(i, moduleIndex, item)}
                        moduleGrowAllowed={(moduleIndex, item) => moduleGrowAllowed(i, moduleIndex, item)}
                        moduleMoveLeftAllowed={(moduleIndex, item) => moduleMoveLeftAllowed(i, moduleIndex, item)}
                        moduleMoveRightAllowed={(moduleIndex, item) => moduleMoveRightAllowed(i, moduleIndex, item)}

                        onRowAddAfter={(rowIndex) => handleRowAddAfter(rowIndex)}
                        onRowDelete={(rowIndex) => handleRowDelete(rowIndex)}

                        rowAddAllowed={() => rowAddAllowed()}
                        rowDeleteAllowed={() => rowDeleteAllowed()}
                    />
                ))}

            </div>

            {
                editor && (
                    <Popup
                        title={"Editer le module"}
                        showCloseButton={true}
                        onCancel={() => setEditor(null)}
                        onOk={() => applyModuleEditor()}
                    >
                        <div className="popup_row" style={{ '--left_column_size': '100px' }}>
                            <label htmlFor={`editor_id_${editor.currentModule.id.trim()}`}>Identifiant</label>
                            <input
                                type="text"
                                name="editor_id"
                                id={`editor_id_${editor.currentModule.id.trim()}`}
                                value={editor.currentModule.id}
                                onChange={(e) => updateModuleEditor({ id: e.target.value })}
                                autoFocus
                            />
                        </div>
                        <div className="popup_row" style={{ '--left_column_size': '100px' }}>
                            <div></div>
                            <label style={{ fontSize: "small", color: "#777" }}>˫ Identifiant du module précédent: <b>{editor.prevModule?.id ?? "-"}</b></label>
                        </div>

                        <div className="popup_row" style={{ '--left_column_size': '100px' }}>
                            <label htmlFor={`editor_text_${editor.currentModule.id.trim()}`}>Description</label>
                            <textarea
                                name="editor_text"
                                id={`editor_text_${editor.currentModule.id.trim()}`}
                                value={editor.currentModule.text}
                                onChange={(e) => updateModuleEditor({ text: e.target.value })}
                                rows={3}
                            />
                        </div>

                        <div className="popup_row" style={{ '--left_column_size': '100px' }}>
                            <label>Pictogramme</label>
                            <div className="radio_group">
                                {swbIcons.map((icon, i) => (
                                    <div className="radio" title={icon.title} key={i}>
                                        <input
                                            type="radio"
                                            name="editor_icon"
                                            id={`editor_icon_${editor.currentModule.id.trim()}_${icon.filename}`}
                                            value={icon.filename}
                                            checked={(icon.filename !== '' ? icon.filename : null) === editor.currentModule.icon}
                                            onChange={(e) => updateModuleEditor({ icon: e.target.value !== '' ? e.target.value : null })}
                                        />
                                        <label htmlFor={`editor_icon_${editor.currentModule.id.trim()}_${icon.filename}`}>
                                            {icon.filename ? <img src={`${import.meta.env.VITE_APP_BASE}${icon.filename}`} width={24} height={24} alt={icon.title} /> : icon.title}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {editor.errors.map((error, i) => <div key={i} className="popup_row" style={{ '--left_column_size': '100px' }}>
                            <div></div>
                            <div className="popup_error">{error}</div>
                        </div>)}
                    </Popup >
                )
            }

            {
                newProjectProperties && (
                    <Popup
                        title={"Créer un nouveau projet"}
                        showCloseButton={true}
                        onCancel={() => setNewProjectProperties(null)}
                        onOk={() => {
                            if (confirm("Cette action remplacera le projet courant.\n\nContinuer?")) {
                                createProject(newProjectProperties.name, newProjectProperties.spr, newProjectProperties.npRows, newProjectProperties.hRow);
                                setNewProjectProperties(null);
                            }
                        }}
                    >
                        <div className="popup_row" style={{ '--left_column_size': '150px', marginBottom: '3em' }}>
                            <label htmlFor="newProjectProperties_name">Nom du projet</label>
                            <input
                                type="text"
                                name="newProjectProperties_name"
                                id="newProjectProperties_name"
                                value={newProjectProperties.name}
                                onChange={(e) => updateProjectProperties({ name: e.target.value })}
                                autoFocus
                            />
                        </div>

                        <div className="popup_row" style={{ '--left_column_size': '150px', alignItems: 'center' }}>
                            <label htmlFor="newProjectProperties_modules">Nombre de modules par rangée</label>
                            <div className="radio_group">
                                {import.meta.env.VITE_ALLOWED_MODULES.split(',').map((count) => {
                                    const c = parseInt(count.trim());
                                    return <div key={c} className="radio">
                                        <input type="radio" name="spr" id={`newProjectProperties_modules_${c}`} value={c} checked={newProjectProperties.spr === c} onChange={(e) => updateProjectProperties({ spr: parseInt(e.target.value) })} style={{ margin: 0, marginRight: '0.25em' }} />
                                        <label htmlFor={`newProjectProperties_modules_${c}`}>{c}</label>
                                    </div>;
                                })}
                            </div>
                        </div>

                        <div className="popup_row" style={{ '--left_column_size': '150px', alignItems: 'center', marginTop: 0, marginBottom: '0.5em' }}>
                            <label htmlFor="newProjectProperties_modules">Nombre de rangées</label>
                            <label style={{ fontSize: '1.1em', color: 'darkcyan' }}>˫ <b>{newProjectProperties.npRows}</b> rangées</label>
                        </div>
                        <div className="popup_row" style={{ '--left_column_size': '150px', marginTop: 0 }}>
                            <div></div>
                            <div style={{ display: "flex", alignItems: "center", columnGap: '1em', marginBottom: '-0.25em' }}>
                                <input type="range" min={rowsMin} max={rowsMax} step={1} value={newProjectProperties.npRows} onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    if (value >= rowsMin) updateProjectProperties({ npRows: value });
                                }} style={{ minHeight: 0, padding: 0, margin: 0, width: '100%' }} />
                            </div>
                        </div>

                        <div className="popup_row" style={{ '--left_column_size': '150px', alignItems: 'center', marginTop: '2em', marginBottom: '0.5em' }}>
                            <label htmlFor="newProjectProperties_modules">Hauteur d&apos;une rangée</label>
                            <label style={{ fontSize: '1.1em', color: 'darkcyan' }}>˫ <b>{newProjectProperties.hRow}</b>mm</label>
                        </div>
                        <div className="popup_row" style={{ '--left_column_size': '150px', marginTop: 0, marginBottom: '3em' }}>
                            <div></div>
                            <div style={{ display: "flex", alignItems: "center", columnGap: '1em', marginBottom: '-0.25em' }}>
                                <input type="range" min={heightMin} max={heightMax} step={1} value={newProjectProperties.hRow} onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    if (value >= heightMin) updateProjectProperties({ hRow: value });
                                }} style={{ minHeight: 0, padding: 0, margin: 0, width: '100%' }} />
                            </div>
                        </div>
                    </Popup >
                )
            }

        </>
    )
}

export default App
