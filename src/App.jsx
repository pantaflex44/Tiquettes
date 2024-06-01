import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react"

import './app.css';
import * as pkg from '../package.json';
import swbIcons from './switchboard_icons.json';
import themesList from './themes.json';

import Row from "./Row";
import Popup from "./Popup";

function App() {

    function setDocumentTitle(title) {
        document.title = `${title} - ${pkg.title} ${pkg.version}`
    }

    const importRef = useRef();

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
        id: import.meta.env.VITE_DEFAULT_ID,
        icon: import.meta.env.VITE_DEFAULT_ICON === "" ? null : import.meta.env.VITE_DEFAULT_ICON,
        text: import.meta.env.VITE_DEFAULT_TEXT,
        free: true,
        span: 1,
        theme: defaultTheme,
    }), [defaultTheme]);

    const [npRows, setNpRows] = useState(defaultNpRows);
    const [hRow, setHRow] = useState(defaultHRow);
    const [spr, setSpr] = useState(defaultStepsPerRows);
    const [editor, setEditor] = useState(null);

    const createRow = useCallback((steps, rowsCount = null) => {
        return Array(rowsCount ?? npRows).fill([]).map((_, i) => Array(steps).fill({ ...defaultModule }).map((q, j) => ({
            ...q,
            id: `Q${(j + 1) + (((i + 1) * steps) - steps)}`
        })));
    }, [defaultModule, npRows])

    const defaultProject = useMemo(() => ({
        height: defaultHRow,
        stepsPerRows: defaultStepsPerRows,
        rows: createRow(defaultStepsPerRows),
    }), [createRow, defaultHRow, defaultStepsPerRows]);

    const [switchboard, setSwitchboard] = useState(
        sessionStorage.getItem("tiquettes")
            ? JSON.parse(sessionStorage.getItem("tiquettes"))
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
        return themeFound ?? defaultModule;
    }
    const [theme, setTheme] = useState(getThemeOfFirstModuleFound());

    const create = useCallback((stepsPerRows, rowsCount = null, height = null) => {
        importRef.current.value = "";

        setDocumentTitle("Nouveau projet");
        setTheme(defaultTheme);
        setSwitchboard({ ...defaultProject, height: height ?? hRow, stepsPerRows, rows: createRow(stepsPerRows, rowsCount) });
    }, [createRow, defaultProject, defaultTheme, hRow])

    const reset = () => {
        importRef.current.value = "";

        setDocumentTitle("Nouveau projet");
        setHRow(defaultHRow);
        setNpRows(defaultNpRows);
        setSpr(defaultStepsPerRows);
        setTheme(defaultTheme);

        create(defaultStepsPerRows, defaultNpRows, defaultHRow);
    }

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

            return { ...old, rows };
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

                return { ...old, rows };
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

                return { ...old, rows };
            });
        }
    }

    const edit = (rowIndex, moduleIndex) => {
        const currentModule = switchboard.rows[rowIndex][moduleIndex];

        setEditor({ rowIndex, moduleIndex, currentModule, theme, errors: [] });
    }

    const importProject = (file) => {
        if (file) {
            const fileReader = new FileReader();
            fileReader.readAsText(file, 'UTF-8');
            fileReader.onload = (e) => {
                try {
                    const swb = JSON.parse(e.target.result);

                    setTheme(getThemeOfFirstModuleFound(swb));
                    setSwitchboard((old) => ({ ...old, ...swb }));

                    setDocumentTitle(importRef.current.value.replaceAll("\\", "/").split("/").pop());
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
            m.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "end" });
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
            setSwitchboard((old) => ({ ...old, rows }));
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

        if (!(/[a-zA-Z0-9.]{2,}/.test(id))) {
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

            return { ...old, rows };
        });

        setEditor(null);
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
                return { ...old, rows };
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
                return { ...old, rows };
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

    useEffect(() => {
        const t = setTimeout(() => {
            const swb = JSON.stringify(switchboard);
            if (sessionStorage.getItem("tiquettes") !== swb) {
                sessionStorage.setItem("tiquettes", swb);
                console.log("Saved for this session.");
            }
        }, 1000);
        return () => { if (t) clearTimeout(t); }
    }, [switchboard]);

    return (
        <>
            <div className="projectbox">
                <div className="newproject">
                    <h4>Nouveau projet</h4>

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
                    <h4>Importer un projet
                        <br />
                        <input ref={importRef} style={{ marginTop: '1em' }} type="file" onChange={(e) => { if (e.target.files && e.target.files.length > 0) importProject(e.target.files[0]); }} />
                    </h4>
                </div>
            </div>

            <h3>
                <span style={{ display: 'inline-block', width: '7.1em' }}>Projet courant</span>
                <br />

                <button style={{ marginTop: '1em' }} onClick={() => { if (confirm("Êtes-vous certain de vouloir réinitialiser le projet?")) reset(); }}>Réinitialiser</button>

                <button style={{ marginLeft: '4em', marginTop: '1em' }} onClick={() => { exportProject(); }}>Exporter</button>

                <button style={{ marginLeft: '1em', marginTop: '1em' }} onClick={() => { printProject(); }}>Imprimer</button>

                <br />
                <select
                    style={{ marginTop: '1em' }}
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

            <div className="switchboard">
                {switchboard.rows.map((row, i) => (
                    <Row
                        key={i}

                        index={i + 1}
                        items={row.map((m) => ({ ...defaultModule, ...m }))}
                        stepsPerRows={switchboard.stepsPerRows}
                        style={{
                            "--w": `${switchboard.stepsPerRows * stepSize}mm`,
                            "--h": `calc(${switchboard.height}mm + 1mm)`, // 30mm -> 117.16px
                            "--c": switchboard.stepsPerRows,
                            "--sw": `calc(${stepSize}mm + 1px)` // 18mm -> 70.03px
                        }}

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
                                            {icon.filename ? <img src={`${import.meta.env.VITE_APP_BASE}${icon.filename}`} width={24} height={24} /> : icon.title}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/*<div className="popup_row">
            <label htmlFor={`editor_showid_${editor.currentModule.id.trim()}`}>Afficher l&apos;identifiant</label>
            <input type="checkbox" name="editor_showid" id={`editor_showid_${editor.currentModule.id.trim()}`} checked={editor.currentModule.showId} onChange={(e) => {
              const value = e.target.checked;
              setEditor((old) => ({ ...old, currentModule: { ...old.currentModule, showId: value } }));
            }} />
          </div>
          <div className="popup_row">
            <label htmlFor={`editor_showicon_${editor.currentModule.id.trim()}`}>Afficher le pictogramme</label>
            <input type="checkbox" name="editor_showicon" id={`editor_showicon_${editor.currentModule.id.trim()}`} checked={editor.currentModule.showIcon} onChange={(e) => {
              const value = e.target.checked;
              setEditor((old) => ({ ...old, currentModule: { ...old.currentModule, showIcon: value } }));
            }} />
          </div>
          <div className="popup_row">
            <label htmlFor={`editor_showtext_${editor.currentModule.id.trim()}`}>Afficher la description</label>
            <input type="checkbox" name="editor_showtext" id={`editor_showtext_${editor.currentModule.id.trim()}`} checked={editor.currentModule.showText} onChange={(e) => {
              const value = e.target.checked;
              setEditor((old) => ({ ...old, currentModule: { ...old.currentModule, showText: value } }));
            }} />
          </div>

          <div className="popup_row">
            <label htmlFor={`editor_bgcolor_${editor.currentModule.id.trim()}`}>Couleur de fond</label>
            <datalist id={`editor_bgcolors_${editor.currentModule.id.trim()}`}>
              {import.meta.env.VITE_FAVORITES_BGCOLORS.split(',').map((color) => {
                const c = color.trim();
                return <option key={c} value={c} />
              })}
            </datalist>
            <input type="color" name="editor_bgcolor" id={`editor_bgcolor_${editor.currentModule.id.trim()}`} list={`editor_bgcolors_${editor.currentModule.id.trim()}`} value={editor.currentModule.bgcolor} onChange={(e) => {
              const value = e.target.value;
              setEditor((old) => ({ ...old, currentModule: { ...old.currentModule, bgcolor: value } }));
            }} />
          </div>

          <div className="popup_row">
            <label htmlFor={`editor_fgcolor_${editor.currentModule.id.trim()}`}>Couleur du texte</label>
            <datalist id={`editor_fgcolors_${editor.currentModule.id.trim()}`}>
              {import.meta.env.VITE_FAVORITES_FGCOLORS.split(',').map((color) => {
                const c = color.trim();
                return <option key={c} value={c} />
              })}
            </datalist>
            <input type="color" name="editor_fgcolor" id={`editor_fgcolor_${editor.currentModule.id.trim()}`} list={`editor_fgcolors_${editor.currentModule.id.trim()}`} value={editor.currentModule.fgcolor} onChange={(e) => {
              const value = e.target.value;
              setEditor((old) => ({ ...old, currentModule: { ...old.currentModule, fgcolor: value } }));
            }} />
          </div>*/}

                        {editor.errors.map((error, i) => <div key={i} className="popup_row"><div></div><div className="popup_error">{error}</div></div>)}
                    </Popup >
                )
            }

        </>
    )
}

export default App
