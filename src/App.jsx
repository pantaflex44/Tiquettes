import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import './app.css';
import swbIcons from './switchboard_icons.json';

import Row from "./Row";
import Popup from "./Popup";

function App() {

  function setDocumentTitle(title) {
    document.title = `${title} - ${import.meta.env.VITE_APP_NAME} ${import.meta.env.VITE_APP_VERSION}`
  }

  const importRef = useRef();

  const stepSize = parseInt(import.meta.env.VITE_DEFAULT_STEPSIZE);
  const defaultNpRows = parseInt(import.meta.env.VITE_DEFAULT_ROWS);
  const defaultHRow = parseInt(import.meta.env.VITE_DEFAULT_ROWHEIGHT);
  const defaultStepsPerRows = parseInt(import.meta.env.VITE_DEFAULT_STEPSPERROW);
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
    bgcolor: import.meta.env.VITE_DEFAULT_BGCOLOR,
    fgcolor: import.meta.env.VITE_DEFAULT_FGCOLOR,
    showId: import.meta.env.VITE_DEFAULT_SHOWID === "true",
    showIcon: import.meta.env.VITE_DEFAULT_SHOWICON === "true",
    showText: import.meta.env.VITE_DEFAULT_SHOWTEXT === "true"
  }), []);

  const [npRows, setNpRows] = useState(defaultNpRows);
  const [hRow, setHRow] = useState(defaultHRow);
  const [editor, setEditor] = useState(null);

  const createRow = useCallback((steps, rowsCount = null) => {
    return Array(rowsCount ?? npRows).fill([]).map((_, i) => Array(steps).fill({ ...defaultModule }).map((q, j) => ({ ...q, id: `Q${(j + 1) + (((i + 1) * steps) - steps)}` })));
  }, [defaultModule, npRows])

  const defaultProject = useMemo(() => ({
    height: defaultHRow,
    stepsPerRows: defaultStepsPerRows,
    rows: createRow(defaultStepsPerRows)
  }), [createRow, defaultHRow, defaultStepsPerRows]);

  const [switchboard, setSwitchboard] = useState(
    sessionStorage.getItem("tiquettes")
      ? JSON.parse(sessionStorage.getItem("tiquettes"))
      : { ...defaultProject }
  );

  const create = useCallback((stepsPerRows, rowsCount = null, height = null) => {
    importRef.current.value = "";
    setDocumentTitle("Nouveau projet");
    setSwitchboard({ ...defaultProject, height: height ?? hRow, stepsPerRows, rows: createRow(stepsPerRows, rowsCount) });
  }, [createRow, defaultProject, hRow])

  const reset = () => {
    importRef.current.value = "";
    setDocumentTitle("Nouveau projet");
    setHRow(defaultHRow);
    setNpRows(defaultNpRows);
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

    setEditor({ rowIndex, moduleIndex, currentModule, errors: [] });
  }

  const handleModuleGrow = (rowIndex, moduleIndex) => {
    const row = switchboard.rows[rowIndex];
    const currentModule = row[moduleIndex];
    const nextModule = (moduleIndex + currentModule.span) < switchboard.stepsPerRows ? row[moduleIndex + 1] : null;

    if (nextModule?.free === true && nextModule?.span === 1) grow(rowIndex, moduleIndex);
  }

  const handleModuleShrink = (rowIndex, moduleIndex) => {
    const row = switchboard.rows[rowIndex];
    const currentModule = row[moduleIndex];

    if (currentModule.span > 1) shrink(rowIndex, moduleIndex);
  }

  const handleModuleClear = (rowIndex, moduleIndex) => {
    const row = switchboard.rows[rowIndex];
    const currentModule = row[moduleIndex];

    if (!currentModule.free) clear(rowIndex, moduleIndex);
  }

  const handleModuleEdit = (rowIndex, moduleIndex) => {
    edit(rowIndex, moduleIndex);
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

  useEffect(() => {
    const swb = JSON.stringify(switchboard);
    if (sessionStorage.getItem("tiquettes") !== swb) {
      sessionStorage.setItem("tiquettes", swb);
      console.log("Saved for this session.");
    }
  }, [switchboard]);

  return (
    <>
      <h4>Nouveau projet
        <br />
        <button style={{ marginTop: '1em' }} onClick={() => reset()}>Par défaut</button>
        <input ref={importRef} style={{ marginLeft: '0.75em', marginTop: '1em' }} type="file" onChange={(e) => {
          const fileReader = new FileReader();
          fileReader.readAsText(e.target.files[0], "UTF-8");
          fileReader.onload = (e) => {
            try {
              const swb = JSON.parse(e.target.result);
              setSwitchboard((old) => ({ ...old, ...swb }));
              setDocumentTitle(importRef.current.value.replaceAll("\\", "/").split("/").pop());
            } catch (err) {
              alert("Impossible d'importer ce fichier.");
              importRef.current.value = "";
            }
          };
        }} />
      </h4>

      <div className="toolbar">
        <span style={{ width: '1em' }}><small>1)</small></span>
        <span style={{ width: '4em', fontWeight: 'bold' }}><small>Rangées</small></span>
        <button onClick={() => setNpRows((old) => {
          if (old > rowsMin) return old - 1;
          return old;
        })}>-</button>
        <input type="range" min={rowsMin} max={rowsMax} step={1} value={npRows} onChange={(e) => {
          const value = parseInt(e.target.value);
          if (value >= rowsMin) setNpRows(value);
        }} />
        <span><small>{npRows}</small></span>
        <button onClick={() => setNpRows((old) => {
          if (old < rowsMax) return old + 1;
          return old;
        })}>+</button>
      </div>

      <div className="toolbar">
        <span style={{ width: '1em' }}><small>2)</small></span>
        <span style={{ width: '4em', fontWeight: 'bold' }}><small>Hauteur</small></span>
        <button onClick={() => setHRow((old) => {
          if (old > heightMin) return old - 1;
          return old;
        })}>-</button>
        <input type="range" min={heightMin} max={heightMax} step={1} value={hRow} onChange={(e) => {
          const value = parseInt(e.target.value);
          if (value >= heightMin) setHRow(value);
        }} />
        <span><small>{hRow}mm</small></span>
        <button onClick={() => setHRow((old) => {
          if (old < heightMax) return old + 1;
          return old;
        })}>+</button>
      </div>

      <div className="toolbar">
        <span style={{ width: '1em' }}><small>3)</small></span>
        <span style={{ width: '4em', fontWeight: 'bold' }}><small>Largeur</small></span>
        {import.meta.env.VITE_ALLOWED_MODULES.split(',').map((count) => {
          const c = parseInt(count.trim());
          return <button key={c} onClick={() => create(c)}>{c}</button>;
        })}
        <span><small>modules</small></span>
      </div>

      <h3>Projet courant<br />
        <button style={{ marginTop: '1em' }} onClick={() => {
          const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(JSON.stringify(switchboard))}`;
          const link = document.createElement("a");
          link.href = jsonString;
          link.download = "tiquettes.json";
          link.click();
        }}>Exporter</button>
        <button style={{ marginLeft: '0.75em', marginTop: '1em' }} onClick={() => { window.print() }}>Imprimer</button>
      </h3>
      <ul className="project">
        <li>
          <small><b>{switchboard.rows.length}</b> rangée{switchboard.rows.length > 1 ? 's' : ''}</small>
        </li>
        <li>
          <small><b>{switchboard.stepsPerRows}</b> module{switchboard.stepsPerRows > 1 ? 's' : ''} par rangée</small>
        </li>
        <li>
          <small>Hauteur des étiquettes: <b>{switchboard.height}mm</b></small>
        </li>
      </ul>



      <div className="switchboard">
        {switchboard.rows.map((row, i) => (
          <Row
            key={i}
            index={i + 1}
            items={row}
            stepsPerRows={switchboard.stepsPerRows}
            style={{
              "--w": `${switchboard.stepsPerRows * stepSize}mm`,
              "--h": `${switchboard.height}mm`,
              "--c": switchboard.stepsPerRows,
              "--sw": `${stepSize}mm`
            }}
            onModuleGrow={(moduleIndex, item) => handleModuleGrow(i, moduleIndex, item)}
            onModuleShrink={(moduleIndex, item) => handleModuleShrink(i, moduleIndex, item)}
            onModuleClear={(moduleIndex, item) => handleModuleClear(i, moduleIndex, item)}
            onModuleEdit={(moduleIndex, item) => handleModuleEdit(i, moduleIndex, item)}
            moduleShrinkAllowed={(moduleIndex, item) => moduleShrinkAllowed(i, moduleIndex, item)}
            moduleGrowAllowed={(moduleIndex, item) => moduleGrowAllowed(i, moduleIndex, item)}
          />
        ))}

      </div>

      {editor && (
        <Popup
          title={"Editer le module"}
          showCloseButton={true}
          onCancel={() => setEditor(null)}
          onOk={() => {
            setEditor((old) => ({
              ...old,
              errors: []
            }));

            const id = editor.currentModule.id.trim();
            const icon = editor.currentModule.icon;
            const text = editor.currentModule.text.trim();
            const showId = editor.currentModule.showId;
            const showIcon = editor.currentModule.showIcon;
            const showText = editor.currentModule.showText;
            const bgcolor = editor.currentModule.bgcolor;
            const fgcolor = editor.currentModule.fgcolor;

            if (!(/[A-Z0-9.]{2,}/.test(id))) {
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
                    text,
                    showId,
                    showIcon,
                    showText,
                    bgcolor,
                    fgcolor
                  };
                });

                return r;
              });

              return { ...old, rows };
            });

            setEditor(null);
          }}
        >
          <div className="popup_row">
            <label htmlFor={`editor_id_${editor.currentModule.id.trim()}`}>Identifiant</label>
            <input type="text" name="editor_id" id={`editor_id_${editor.currentModule.id.trim()}`} value={editor.currentModule.id} pattern="\w{2}" onChange={(e) => {
              const value = e.target.value;
              setEditor((old) => ({ ...old, currentModule: { ...old.currentModule, id: value } }));
            }} autoFocus />
          </div>

          <div className="popup_row">
            <label htmlFor={`editor_text_${editor.currentModule.id.trim()}`}>Description</label>
            <textarea name="editor_text" id={`editor_text_${editor.currentModule.id.trim()}`} value={editor.currentModule.text} pattern="/(\w+)/" onChange={(e) => {
              const value = e.target.value;
              setEditor((old) => ({ ...old, currentModule: { ...old.currentModule, text: value } }));
            }} rows={2} />
          </div>

          <div className="popup_row">
            <label>Pictogramme</label>
            <div className="icon_group">
              {swbIcons.map((icon, i) => (
                <div className="icon" title={icon.title} key={i}>
                  <input type="radio" name="editor_icon" id={`editor_icon_${editor.currentModule.id.trim()}`}
                    value={icon.filename}
                    checked={(icon.filename !== '' ? icon.filename : null) === editor.currentModule.icon}
                    onChange={(e) => {
                      let value = e.target.value;
                      if (value === '') value = null;
                      setEditor((old) => ({ ...old, currentModule: { ...old.currentModule, icon: value } }));
                    }}
                  />
                  {icon.filename ? <img src={`${import.meta.env.VITE_APP_BASE}${icon.filename}`} width={24} height={24} /> : icon.title}
                </div>
              ))}
            </div>
          </div>

          <div className="popup_row">
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
          </div>

          {editor.errors.map((error, i) => <div key={i} className="popup_row"><div></div><div className="popup_error">{error}</div></div>)}
        </Popup >
      )
      }

    </>
  )
}

export default App
