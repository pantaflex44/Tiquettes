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

/* eslint-disable react/prop-types */
import {Fragment, lazy, Suspense, useEffect, useMemo, useState} from "react";

import schemaFunctions from './schema_functions.json';

import switchboardIcon from './assets/project.svg';
import schemaIcon from './assets/schema.svg';
import editIcon from './assets/edit.svg';
import assignIdIcon from './assets/assign-number.svg';

import Module from "./Module.jsx";
import Popup from "./Popup.jsx";
import SchemaSymbol from "./SchemaSymbol.jsx";
import EditorCurrentSelector from "./EditorCurrentSelector.jsx";
import EditorPoleSelector from "./EditorPoleSelector.jsx";
import EditorSensibilitySelector from "./EditorSensibilitySelector.jsx";
import EditorCrbSelector from "./EditorCrbSelector.jsx";
import EditorTypeSelector from "./EditorTypeSelector.jsx";
import EditorContactSelector from "./EditorContactSelector.jsx";
import EditorParentSelector from "./EditorParentSelector.jsx";
import EditorFunctionSelector from "./EditorFunctionSelector.jsx";

const IconSelector = lazy(() => import("./IconSelector.jsx"));

export default function Editor({
                                   theme,
                                   switchboard,
                                   stepSize,

                                   getFilteredModulesBySchemaFuncs,
                                   getModuleById,

                                   editor,
                                   onSetEditor,

                                   onApplyModuleEditor,
                                   onHandleModuleClear,

                                   hasBlankId = false,
                               }) {
    const defaultModuleId = import.meta.env.VITE_DEFAULT_ID;
    const [ed, setEd] = useState(editor);

    const [editorTab, setEditorTab] = useState(ed?.tabPage ?? "main");
    const prevModule = useMemo(() => getModuleById(ed?.prevModule?.parentId), [ed?.prevModule?.parentId]);
    const prevModuleTitle = useMemo(() => ((prevModule?.id ?? "-") + " " + (prevModule && schemaFunctions[prevModule.func] ? "(" + schemaFunctions[prevModule.func].name + ")" : "")).trim(), [prevModule]);

    const lastFreeId = useMemo(() => {
        let rows = switchboard.rows;

        let ids = [];
        rows.forEach((row) => {
            return row.forEach((module) => {
                ids.push(module.id);
            });
        });

        let prefix = (ed.currentModule.func ?? defaultModuleId).trim().toUpperCase();
        if (prefix === '') prefix = defaultModuleId;

        let found = '';
        let count = 1;
        while (ids.includes(`${prefix}${count}`)) count++;
        found = `${prefix}${count}`;

        return found;
    }, [switchboard, defaultModuleId, ed.currentModule.func]);

    const onUpdateModuleEditor = (data) => {
        setEd((old) => ({...old, currentModule: {...old.currentModule, ...data}}));
    }

    useEffect(() => {
        if (hasBlankId) {
            onUpdateModuleEditor({id: lastFreeId});
        }
    }, [hasBlankId, ed.currentModule.func]);


    return ed && (
        <Popup
            title={<div className="popup_title_content">
                <img className="popup_title_content_img" src={editIcon} title="Editer le module"
                     alt="Editer le module"/>
                <span className="popup_title_content_id">{ed.currentModule.id ?? ""}</span>
                {ed.currentModule.text ?
                    <span className="popup_title_content_desc">/ {ed.currentModule.text ?? ""}</span> : ""}
            </div>}
            showCloseButton={true}
            onCancel={() => onSetEditor(null)}
            onOk={() => {
                onApplyModuleEditor({...ed})
            }}
            width={440}
            className="popup_flex"
            additionalButtons={[
                {
                    text: "Supprimer",
                    callback: () => {
                        if (onHandleModuleClear(ed.rowIndex, ed.moduleIndex, ed.currentModule)) {
                            onSetEditor(null)
                        }
                    },
                    style: {color: 'red', borderColor: 'red'},
                    disabled: ed.currentModule.free
                }
            ]}
        >
            <div style={{flex: 1, minHeight: '540px'}}>
                <div className={"editor_tabpages"}>
                    <input type="checkbox" id="main_editor_tab" checked={editorTab === "main"}
                           onChange={() => setEditorTab("main")}/>
                    <label htmlFor="main_editor_tab">
                        <img src={switchboardIcon} width="20" height="20" alt="Tableau"/>
                        <span>Tableau</span>
                    </label>

                    <input type="checkbox" id="schema_editor_tab" checked={editorTab === "schema"}
                           onChange={() => setEditorTab("schema")}/>
                    <label htmlFor="schema_editor_tab">
                        <img src={schemaIcon} width="20" height="20" alt="Schéma"/>
                        <span>Schéma</span>
                    </label>
                </div>

                {ed.errors.map((error, i) => <div key={i} className="popup_row"
                                                  style={{'--left_column_size': '100px'}}>
                    <div>&nbsp;</div>
                    <div className="popup_error">{error}</div>
                </div>)}

                {editorTab === "main" &&
                    <>
                        <div className="popup_row" style={{'--left_column_size': '100px'}}>
                            <label htmlFor={`editor_id_${ed.currentModule.id.trim()}`}>Identifiant</label>
                            <div className="popup_row-flex">
                                <input
                                    type="text"
                                    name="editor_id"
                                    id={`editor_id_${ed.currentModule.id.trim()}`}
                                    value={ed.currentModule.id}
                                    onChange={(e) => onUpdateModuleEditor({id: e.target.value})}
                                    autoFocus
                                />
                                <button title="Trouver le prochain identifiant disponible."
                                        onClick={() => onUpdateModuleEditor({id: lastFreeId})}>
                                    <img src={assignIdIcon} width={22} height={22}
                                         alt="Trouver le prochain identifiant libre."/>
                                </button>
                            </div>
                        </div>
                        <div className="popup_row" style={{'--left_column_size': '100px'}}>
                            <div></div>
                            <label style={{fontSize: "small", color: "#777"}}>└ Identifiant du module
                                précédent: <b>{ed.prevModule?.id ?? "-"}</b></label>
                        </div>

                        <div className="popup_row" style={{alignItems: 'center', '--left_column_size': '100px'}}>
                            <label>Pictogramme</label>
                            <Suspense fallback={<div style={{lineHeight: '40px'}}>...</div>}>
                                <IconSelector value={ed.currentModule.icon} onChange={(selectedIcon, selected) => {
                                    if (!ed.currentModule.icon || (selectedIcon && ed.currentModule.icon !== selectedIcon)) {
                                        onUpdateModuleEditor({icon: selectedIcon, coef: selected?.coef ?? 0.5})
                                        if (selected?.func && !ed.currentModule.func) onUpdateModuleEditor({func: selected?.func});
                                        if (selected?.crb && !ed.currentModule.crb) onUpdateModuleEditor({crb: selected?.crb});
                                        if (selected?.current && !ed.currentModule.current) onUpdateModuleEditor({current: selected?.current});
                                    }
                                }}/>
                            </Suspense>
                        </div>

                        <div className="popup_row" style={{'--left_column_size': '100px'}}>
                            <label htmlFor={`editor_text_${ed.currentModule.id.trim()}`}>Libellé</label>
                            <textarea
                                name="editor_text"
                                id={`editor_text_${ed.currentModule.id.trim()}`}
                                value={ed.currentModule.text}
                                onChange={(e) => onUpdateModuleEditor({text: e.target.value})}
                                rows={3}
                            />
                        </div>

                        <div className="popup_row" style={{'--left_column_size': '100px'}}>
                            <label htmlFor={`editor_desc_${ed.currentModule.id.trim()}`}>Annotations<br/><span
                                style={{fontSize: '0.8em', color: 'gray'}}>(nomenclature)</span></label>
                            <textarea
                                name="editor_desc"
                                id={`editor_desc_${ed.currentModule.id.trim()}`}
                                value={ed.currentModule.desc}
                                onChange={(e) => onUpdateModuleEditor({desc: e.target.value})}
                                rows={2}
                            />
                        </div>

                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            marginInline: 'auto',
                            marginTop: '2em',
                            alignItems: 'center',
                            width: '100%',
                            borderBottom: '1px solid lightgray'
                        }}>
                            <h5 style={{
                                color: 'gray',
                                width: '100%',
                                borderBottom: '1px solid lightgray',
                                margin: 0
                            }}>Démonstration</h5>
                            <div style={{
                                borderRadius: '5px',
                                border: '1px solid darkgray',
                                width: 'min-content',
                                maxWidth: '100%',
                                overflowX: 'auto',
                                marginBlock: '1em',
                                minHeight: `calc(${switchboard.height}mm + 1mm)`,
                                overflowY: 'hidden'
                            }}>
                                <Module
                                    isDemo={true}
                                    item={{
                                        id: ed.currentModule.id,
                                        icon: ed.currentModule.icon,
                                        text: ed.currentModule.text,
                                        desc: ed.currentModule.desc,
                                        parentId: ed.currentModule.parentId,
                                        func: ed.currentModule.func,
                                        type: ed.currentModule.type,
                                        current: ed.currentModule.current,
                                        crb: ed.currentModule.crb,
                                        sensibility: ed.currentModule.sensibility,
                                        pole: ed.currentModule.pole,
                                        free: false,
                                        span: ed.currentModule.span
                                    }}
                                    modulePosition={1}
                                    rowPosition={1}
                                    theme={theme}
                                    style={{
                                        "--h": `calc(${switchboard.height}mm + 1mm)`,
                                        "--sw": `calc(${stepSize}mm + 1px)`
                                    }}
                                />
                            </div>
                        </div>
                    </>
                }

                {editorTab === "schema" &&
                    <>
                        <div className="popup_row" style={{'--left_column_size': '100px'}}>
                            <label htmlFor={`editor_func_${ed.currentModule.id.trim()}`}>Fonction</label>
                            <EditorFunctionSelector id={`editor_func_${ed.currentModule.id.trim()}`}
                                                    value={ed.currentModule.func}
                                                    onChange={(value) => onUpdateModuleEditor({func: value})}/>
                        </div>

                        {ed.currentModule.func && <>
                            <div className="popup_row" style={{'--left_column_size': '100px'}}>
                                <label htmlFor={`editor_schparent_${ed.currentModule.id.trim()}`}>Parent</label>
                                <EditorParentSelector id={`editor_schparent_${ed.currentModule.id.trim()}`}
                                                      value={ed.currentModule.parentId}
                                                      currentModuleId={ed.currentModule.id}
                                                      filteredModulesListBySchemaFuncs={getFilteredModulesBySchemaFuncs()}
                                                      onChange={(value) => onUpdateModuleEditor({parentId: value})}/>
                            </div>
                            <div className="popup_row" style={{
                                '--left_column_size': '100px',
                                borderBottom: schemaFunctions[ed.currentModule.func]?.supportContacts === true ? 'initial' : '1px solid lightgray',
                                paddingBottom: schemaFunctions[ed.currentModule.func]?.supportContacts === true ? 'initial' : '1em',
                                marginBottom: schemaFunctions[ed.currentModule.func]?.supportContacts === true ? 'initial' : '2em'
                            }}>
                                <div></div>
                                <label style={{fontSize: "small", color: "#777"}}>└ Parent du module
                                    précédent: <b>{prevModuleTitle !== "" ? prevModuleTitle : "-"}</b></label>
                            </div>

                            {schemaFunctions[ed.currentModule.func]?.supportContacts === true &&
                                <div className="popup_row" style={{
                                    '--left_column_size': '100px',
                                    borderBottom: '1px solid lightgray',
                                    paddingBottom: '1em',
                                    marginBottom: '2em'
                                }}>
                                    <label htmlFor={`editor_contacts_${ed.currentModule.id.trim()}`}>Asservi
                                        par</label>
                                    <EditorContactSelector id={`editor_contacts_${ed.currentModule.id.trim()}`}
                                                           value={ed.currentModule.kcId}
                                                           currentModuleId={ed.currentModule.id}
                                                           filteredModulesListBySchemaFuncs={getFilteredModulesBySchemaFuncs()}
                                                           onChange={(value) => onUpdateModuleEditor({kcId: value})}/>
                                </div>}
                        </>
                        }

                        {schemaFunctions[ed.currentModule.func]?.hasType &&
                            <div className="popup_row" style={{'--left_column_size': '100px'}}>
                                <label htmlFor={`editor_type_${ed.currentModule.id.trim()}`}>Type</label>
                                <EditorTypeSelector id={`editor_type_${ed.currentModule.id.trim()}`}
                                                    value={ed.currentModule.type}
                                                    onChange={(value) => onUpdateModuleEditor({type: value})}/>
                            </div>
                        }

                        {schemaFunctions[ed.currentModule.func]?.hasCrb &&
                            <div className="popup_row" style={{'--left_column_size': '100px'}}>
                                <label htmlFor={`editor_crb_${ed.currentModule.id.trim()}`}>Courbe</label>
                                <EditorCrbSelector id={`editor_crb_${ed.currentModule.id.trim()}`}
                                                   value={ed.currentModule.crb}
                                                   onChange={(value) => onUpdateModuleEditor({crb: value})}/>
                            </div>
                        }

                        {schemaFunctions[ed.currentModule.func]?.hasType &&
                            <div className="popup_row" style={{'--left_column_size': '100px'}}>
                                <label
                                    htmlFor={`editor_sensibility_${ed.currentModule.id.trim()}`}>Sensibilité</label>
                                <EditorSensibilitySelector id={`editor_sensibility_${ed.currentModule.id.trim()}`}
                                                           value={ed.currentModule.sensibility}
                                                           onChange={(value) => onUpdateModuleEditor({sensibility: value})}/>
                            </div>
                        }

                        {schemaFunctions[ed.currentModule.func]?.hasCurrent &&
                            <div className="popup_row" style={{'--left_column_size': '100px'}}>
                                <label htmlFor={`editor_current_${ed.currentModule.id.trim()}`}>Calibre</label>
                                <EditorCurrentSelector id={`editor_current_${ed.currentModule.id.trim()}`}
                                                       value={ed.currentModule.current}
                                                       onChange={(value) => onUpdateModuleEditor({current: value})}/>
                            </div>
                        }

                        {schemaFunctions[ed.currentModule.func]?.hasPole &&
                            <div className="popup_row" style={{'--left_column_size': '100px'}}>
                                <label htmlFor={`editor_pole_${ed.currentModule.id.trim()}`}>Pôles</label>
                                <EditorPoleSelector id={`editor_pole_${ed.currentModule.id.trim()}`}
                                                    value={ed.currentModule.pole}
                                                    onChange={(value) => onUpdateModuleEditor({pole: value})}/>
                            </div>
                        }

                        {ed.currentModule.func && (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                marginInline: 'auto',
                                marginTop: '2em',
                                alignItems: 'center',
                                width: '100%',
                                borderBottom: '1px solid lightgray'
                            }}>
                                <h5 style={{
                                    color: 'gray',
                                    width: '100%',
                                    borderBottom: '1px solid lightgray',
                                    margin: 0
                                }}>Démonstration</h5>
                                <div style={{
                                    width: '100px',
                                    minWidth: '70px',
                                    height: '100px',
                                    maxWidth: '100%',
                                    overflowX: 'auto',
                                    marginBlock: '1em',
                                    overflowY: 'hidden'
                                }}>
                                    <SchemaSymbol module={ed.currentModule}/>
                                </div>
                            </div>
                        )}
                    </>
                }


            </div>
        </Popup>
    );
}