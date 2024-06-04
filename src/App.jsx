import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react"

import './app.css';
import * as pkg from '../package.json';
import swbIcons from './switchboard_icons.json';
import themesList from './themes.json';

import Row from "./Row";
import Popup from "./Popup";

import newProjectIcon from './assets/new_project.svg';
import importProjectIcon from './assets/import_project.svg';
import projectIcon from './assets/project.svg';
import { satisfies } from 'compare-versions';

function App() {

    function setDocumentTitle(title) {
        document.title = `${title} - ${pkg.title} ${pkg.version}`
    }

    const importRef = useRef();
    const projectRef = useRef();
    const switchboardRef = useRef();

    const stepSize = parseInt(import.meta.env.VITE_DEFAULT_STEPSIZE);
    const defaultNpRows = parseInt(import.meta.env.VITE_DEFAULT_ROWS);
    const defaultHRow = parseInt(import.meta.env.VITE_DEFAULT_ROWHEIGHT);
    const defaultStepsPerRows = parseInt(import.meta.env.VITE_DEFAULT_STEPSPERROW);
    const defaultTheme = themesList.filter((t) => t.default)[0];
    const rowsMin = parseInt(import.meta.env.VITE_ROWS_MIN);
    const rowsMax = parseInt(import.meta.env.VITE_ROWS_MAX);
    const heightMin = parseInt(import.meta.env.VITE_HEIGHT_MIN);
    const heightMax = parseInt(import.meta.env.VITE_HEIGHT_MAX);

    const defaultModule = useMemo(() => ({
        id: `${import.meta.env.VITE_DEFAULT_ID}?`,
        icon: import.meta.env.VITE_DEFAULT_ICON === "" ? null : import.meta.env.VITE_DEFAULT_ICON,
        text: import.meta.env.VITE_DEFAULT_TEXT,
        free: true,
        span: 1,
        theme: defaultTheme
    }), [defaultTheme]);

    const [npRows, setNpRows] = useState(defaultNpRows);
    const [hRow, setHRow] = useState(defaultHRow);
    const [spr, setSpr] = useState(defaultStepsPerRows);
    const [editor, setEditor] = useState(null);

    const verifyVersion = (swb) => {
        if (!swb.version) {
            alert(`Ce projet a été réalisé avec une version inconnue de ${pkg.title}.\n\nImpossible de l'éditer.`);
            return false;
        }

        const projectVersion = swb.version;
        if (!satisfies(projectVersion, import.meta.env.VITE_APP_VERSION_RANGE)) {
            alert(`Ce projet a été réalisé avec une version trop ancienne de ${pkg.title}.\n\nVersion du projet: ${projectVersion}\nVersions supportées: ${import.meta.env.VITE_APP_VERSION_RANGE}\n\nImpossible de l'éditer.`);
            return false;
        }

        return true;
    };

    const scrollToProject = () => {
        projectRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "start"
        });
    };

    const autoId = (swb, rowIndex = 0, moduleIndex = 0) => {
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
                        return { ...module, id: `${import.meta.env.VITE_DEFAULT_ID}${j + 1 + jump}` };
                    } else {
                        return module;
                    }
                });
            } else {
                return row
            }
        });

        return { ...reIndentedSwb, rows };
    }

    const createRow = useCallback((steps, rowsCount = null) => {
        return Array(rowsCount ?? npRows).fill([]).map((_, i) => Array(steps).fill({ ...defaultModule }).map((q, j) => ({
            ...q,
            id: `Q${(j + 1) + (((i + 1) * steps) - steps)}`
        })));
    }, [defaultModule, npRows]);

    const updates = useMemo(() => ({
        version: pkg.version
    }), []);

    const defaultProject = useMemo(() => ({
        height: defaultHRow,
        stepsPerRows: defaultStepsPerRows,
        rows: createRow(defaultStepsPerRows),
        ...updates
    }), [createRow, defaultHRow, defaultStepsPerRows, updates]);

    const [switchboard, setSwitchboard] = useState(
        sessionStorage.getItem("tiquettes")
            ? autoId({
                ...updates,
                ...JSON.parse(sessionStorage.getItem("tiquettes"))
            })
            : { ...defaultProject }
    );

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
    const [theme, setTheme] = useState(getThemeOfFirstModuleFound());

    const create = useCallback((stepsPerRows, rowsCount = null, height = null) => {
        importRef.current.value = "";

        setTheme(defaultTheme);
        setSwitchboard(() => {
            return autoId({ ...defaultProject, height: height ?? hRow, stepsPerRows, rows: createRow(stepsPerRows, rowsCount) });
        });

        setDocumentTitle("Nouveau projet");
        scrollToProject();
    }, [createRow, defaultProject, defaultTheme, hRow])

    const reset = useCallback(() => {
        importRef.current.value = "";

        setDocumentTitle("Nouveau projet");
        setHRow(defaultHRow);
        setNpRows(defaultNpRows);
        setSpr(defaultStepsPerRows);
        setTheme(defaultTheme);

        create(defaultStepsPerRows, defaultNpRows, defaultHRow);
    }, [create, defaultHRow, defaultNpRows, defaultStepsPerRows, defaultTheme]);

    const grow = (rowIndex, moduleIndex) => {
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

            return autoId({ ...old, rows });
        });
    }

    const shrink = (rowIndex, moduleIndex) => {
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

                return autoId({ ...old, rows });
            });
        }
    }

    const clear = (rowIndex, moduleIndex) => {
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

                return autoId({ ...old, rows });
            });
        }
    }

    const edit = (rowIndex, moduleIndex) => {
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
    }

    const importProject = (file) => {
        if (file) {
            const fileReader = new FileReader();
            fileReader.readAsText(file, 'UTF-8');
            fileReader.onload = (e) => {
                try {
                    const swb = JSON.parse(e.target.result);

                    setTheme(getThemeOfFirstModuleFound(swb));
                    setSwitchboard((old) => autoId({
                        ...old,
                        ...updates,
                        ...swb
                    }));

                    setDocumentTitle(importRef.current.value.replaceAll("\\", "/").split("/").pop());
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
    }

    const exportProject = () => {
        const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(JSON.stringify(switchboard))}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = "tiquettes.json";
        link.click();
    }

    const printProject = () => {
        if (window) {
            window.print();
        } else {
            alert("Cet appareil ne permet pas de lancer une impression.");
        }
    }

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

            const rows = switchboard.rows.map((row) => {
                return row.map((m) => {
                    return { ...m, theme: selected };
                })
            });
            setSwitchboard((old) => autoId({ ...old, rows }));
        }
    }

    const updateEditor = (data) => {
        setEditor((old) => ({ ...old, currentModule: { ...old.currentModule, ...data } }));
    }

    const applyEditor = () => {
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

            return autoId({ ...old, rows });
        });

        setEditor(null);
    }

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
            grow(rowIndex, moduleIndex);
            moduleFocus(rowIndex + 1, moduleIndex + 1);
        }
    }

    const handleModuleShrink = (rowIndex, moduleIndex) => {
        const row = switchboard.rows[rowIndex];
        const currentModule = row[moduleIndex];

        if (currentModule.span > 1) {
            shrink(rowIndex, moduleIndex);
            moduleFocus(rowIndex + 1, moduleIndex + 1);
        }
    }

    const handleModuleClear = (rowIndex, moduleIndex) => {
        const row = switchboard.rows[rowIndex];
        const currentModule = row[moduleIndex];

        if (!currentModule.free) {
            clear(rowIndex, moduleIndex);
            moduleFocus(rowIndex + 1, moduleIndex + 1);
        }
    }

    const handleModuleEdit = (rowIndex, moduleIndex) => {
        edit(rowIndex, moduleIndex);
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
                return autoId({ ...old, rows });
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
                return autoId({ ...old, rows });
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
        if (rows.length >= import.meta.env.VITE_ROWS_MAX) {
            alert(`Impossible d'ajouter une nouvelle rangée.\nTaille maximum atteinte: ${import.meta.env.VITE_ROWS_MAX} rangées`);
            return;
        }

        const newRow = createRow(switchboard.stepsPerRows, 1);
        rows.splice(rowIndex + 1, 0, ...newRow);

        setSwitchboard((old) => autoId({ ...old, rows }));
    }

    const handleRowDelete = (rowIndex) => {
        let rows = switchboard.rows;
        rows.splice(rowIndex, 1);

        setSwitchboard((old) => autoId({ ...old, rows }));
    }

    const rowAddAllowed = () => {
        return switchboard.rows.length < import.meta.env.VITE_ROWS_MAX;
    }

    const rowDeleteAllowed = () => {
        return switchboard.rows.length > 1;
    }

    useEffect(() => {
        let t = null;

        if (!verifyVersion(switchboard)) {
            reset();
            return;
        }

        t = setTimeout(() => {
            const swb = JSON.stringify(switchboard);
            if (sessionStorage.getItem("tiquettes") !== swb) {
                sessionStorage.setItem("tiquettes", swb);
                console.log("Saved for this session.");
            }
        }, 1000);

        return () => {
            if (t) clearTimeout(t);
        }
    }, [reset, switchboard]);

    return (
        <>
            <div className="projectbox">
                <div className="newproject">
                    <h4><img src={newProjectIcon} width={20} height={20} alt="Nouveau projet" /><span>Nouveau projet</span></h4>

                    <div className="toolbar">
                        {import.meta.env.VITE_ALLOWED_MODULES.split(',').map((count) => {
                            const c = parseInt(count.trim());
                            return <div key={c} style={{ display: 'flex', alignItems: 'center', marginRight: '1em' }}>
                                <input type="radio" name="spr" id={`spr${c}`} value={c} checked={spr === c} onChange={(e) => { setSpr(parseInt(e.target.value)); }} style={{ margin: 0, marginRight: '0.5em' }} />
                                <label htmlFor={`spr${c}`}><small>{c} modules</small></label>
                            </div>;
                        })}
                    </div>

                    <div className="toolbar">
                        <button onClick={() => setNpRows((old) => {
                            if (old > rowsMin) return old - 1;
                            return old;
                        })}>-</button>
                        <input type="range" min={rowsMin} max={rowsMax} step={1} value={npRows} onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (value >= rowsMin) setNpRows(value);
                        }} />
                        <span><small>{npRows} rangées</small></span>
                        <button onClick={() => setNpRows((old) => {
                            if (old < rowsMax) return old + 1;
                            return old;
                        })}>+</button>
                    </div>

                    <div className="toolbar">
                        <button onClick={() => setHRow((old) => {
                            if (old > heightMin) return old - 1;
                            return old;
                        })}>-</button>
                        <input type="range" min={heightMin} max={heightMax} step={1} value={hRow} onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (value >= heightMin) setHRow(value);
                        }} />
                        <span><small>hauteur {hRow}mm</small></span>
                        <button onClick={() => setHRow((old) => {
                            if (old < heightMax) return old + 1;
                            return old;
                        })}>+</button>
                    </div>

                    <div className="toolbar">
                        <button onClick={() => { if (confirm("Cette action remplacera le projet courant.\n\nContinuer?")) create(spr); }}>Créer le nouveau projet...</button>
                    </div>
                </div>

                <div className="importproject">
                    <h4><img src={importProjectIcon} width={20} height={20} alt="Importer un projet" /><span>Importer un projet</span></h4>

                    <div className="toolbar">
                        <input ref={importRef} type="file" onChange={(e) => { if (e.target.files && e.target.files.length > 0) importProject(e.target.files[0]); }} />
                    </div>
                </div>
            </div>

            <h3 ref={projectRef} style={{ scrollMarginTop: '1em' }}>
                <span style={{ display: 'flex', width: '100%', flexDirection: 'row', flexWrap: 'nowrap', justifyContent: 'start', alignItems: 'center', columnGap: '0.5em', marginBottom: '1em' }}><img src={projectIcon} width={24} height={24} alt="Projet courant" /><span>Projet courant</span></span>

                <button style={{ marginLeft: '32px', marginTop: '1em' }} onClick={() => { if (confirm("Êtes-vous certain de vouloir réinitialiser le projet?")) reset(); }}>Réinitialiser...</button>
                <button style={{ marginLeft: '4em', marginTop: '1em' }} onClick={() => { exportProject(); }}>Exporter</button>
                <button style={{ marginLeft: '1em', marginTop: '1em' }} onClick={() => { printProject(); }}>Imprimer</button>

                <select
                    style={{ marginLeft: '32px', marginTop: '1em' }}
                    value={theme?.name ?? defaultTheme}
                    onChange={(e) => { updateTheme(e.target.value); }}
                >
                    {Object.entries(Object.groupBy(themesList, (({ group }) => group))).map((e) => {
                        const g = e[0];
                        const l = e[1];
                        return <Fragment key={`themes_${g}`}>
                            <option key={`group_${g}`} id={`group_${g}`} style={{ fontSize: "small" }} disabled>- {g} -</option>
                            {l.map((t) => <option key={`theme_${t.name}`} id={`theme_${t.name}`} value={t.name}>Thème {t.title}</option>)}
                        </Fragment>
                    })}
                </select>
            </h3 >
            <ul className="project">
                <li>
                    <small><b>{switchboard.rows.length}</b> rangée{switchboard.rows.length > 1 ? 's' : ''} de <b>{switchboard.stepsPerRows}</b> module{switchboard.stepsPerRows > 1 ? 's' : ''}. Hauteur des étiquettes: <b>{switchboard.height}mm</b>.</small>
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
                        onOk={() => applyEditor()}
                    >
                        <div className="popup_row">
                            <label htmlFor={`editor_id_${editor.currentModule.id.trim()}`}>Identifiant</label>
                            <input
                                type="text"
                                name="editor_id"
                                id={`editor_id_${editor.currentModule.id.trim()}`}
                                value={editor.currentModule.id}
                                onChange={(e) => updateEditor({ id: e.target.value })}
                                autoFocus
                            />
                        </div>
                        <div className="popup_row">
                            <div></div>
                            <label style={{ fontSize: "small", color: "#777" }}>˫ Identifiant du module précédent: <b>{editor.prevModule?.id ?? "-"}</b></label>
                        </div>

                        <div className="popup_row">
                            <label htmlFor={`editor_text_${editor.currentModule.id.trim()}`}>Description</label>
                            <textarea
                                name="editor_text"
                                id={`editor_text_${editor.currentModule.id.trim()}`}
                                value={editor.currentModule.text}
                                onChange={(e) => updateEditor({ text: e.target.value })}
                                rows={3}
                            />
                        </div>

                        <div className="popup_row">
                            <label>Pictogramme</label>
                            <div className="icon_group">
                                {swbIcons.map((icon, i) => (
                                    <div className="icon" title={icon.title} key={i}>
                                        <input
                                            type="radio"
                                            name="editor_icon"
                                            id={`editor_icon_${editor.currentModule.id.trim()}_${icon.filename}`}
                                            value={icon.filename}
                                            checked={(icon.filename !== '' ? icon.filename : null) === editor.currentModule.icon}
                                            onChange={(e) => updateEditor({ icon: e.target.value !== '' ? e.target.value : null })}
                                        />
                                        <label htmlFor={`editor_icon_${editor.currentModule.id.trim()}_${icon.filename}`}>
                                            {icon.filename ? <img src={`${import.meta.env.VITE_APP_BASE}${icon.filename}`} width={24} height={24} alt={icon.title} /> : icon.title}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {editor.errors.map((error, i) => <div key={i} className="popup_row"><div></div><div className="popup_error">{error}</div></div>)}
                    </Popup >
                )
            }

        </>
    )
}

export default App
