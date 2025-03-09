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
import {Fragment, useEffect, useMemo, useState} from "react";

import switchboardIcon from './assets/project.svg';
import schemaIcon from './assets/schema.svg';
import editIcon from './assets/edit.svg';
import assignIdIcon from './assets/assign-number.svg';

import IconSelector from "./IconSelector.jsx";
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

export default function Editor({
                                   theme,
                                   switchboard,
                                   stepSize,
                                   schemaFunctions,

                                   getFilteredModulesBySchemaFuncs,
                                   getModuleById,

                                   editor,
                                   onSetEditor,

                                   onApplyModuleEditor,
                                   onUpdateModuleEditor,
                                   onHandleModuleClear,

                                   hasBlankId = false,
                               }) {
    const defaultModuleId = import.meta.env.VITE_DEFAULT_ID;

    const [editorTab, setEditorTab] = useState(editor?.tabPage ?? "main");
    const prevModule = getModuleById(editor?.prevModule?.parentId);
    const prevModuleTitle = ((prevModule?.id ?? "-") + " " + (prevModule && schemaFunctions[prevModule.func] ? "(" + schemaFunctions[prevModule.func].name + ")" : "")).trim();

    const lastFreeId = useMemo(() => {
        let rows = switchboard.rows;

        let ids = [];
        rows.forEach((row) => {
            return row.forEach((module) => {
                ids.push(module.id);
            });
        });

        let prefix = (editor.currentModule.func ?? defaultModuleId).trim().toUpperCase();
        if (prefix === '') prefix = defaultModuleId;

        let found = '';
        let count = 1;
        while (ids.includes(`${prefix}${count}`)) count++;
        found = `${prefix}${count}`;

        return found;
    }, [switchboard, defaultModuleId, editor.currentModule.func]);

    useEffect(() => {
        if (hasBlankId) onUpdateModuleEditor({id: lastFreeId});
    }, [hasBlankId, editor.currentModule.func]);


    return editor && (
        <Popup
            title={<div className="popup_title_content">
                <img className="popup_title_content_img" src={editIcon} title="Editer le module"
                     alt="Editer le module"/>
                <span className="popup_title_content_id">{editor.currentModule.id ?? ""}</span>
                {editor.currentModule.text ?
                    <span className="popup_title_content_desc">/ {editor.currentModule.text ?? ""}</span> : ""}
            </div>}
            showCloseButton={true}
            onCancel={() => onSetEditor(null)}
            onOk={() => onApplyModuleEditor()}
            width={440}
            className="popup_flex"
            additionalButtons={[
                {
                    text: "Supprimer",
                    callback: () => {
                        if (onHandleModuleClear(editor.rowIndex, editor.moduleIndex, editor.currentModule)) {
                            onSetEditor(null)
                        }
                    },
                    style: {color: 'red', borderColor: 'red'},
                    disabled: editor.currentModule.free
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

                {editor.errors.map((error, i) => <div key={i} className="popup_row"
                                                      style={{'--left_column_size': '100px'}}>
                    <div>&nbsp;</div>
                    <div className="popup_error">{error}</div>
                </div>)}

                {editorTab === "main" &&
                    <>
                        <div className="popup_row" style={{'--left_column_size': '100px'}}>
                            <label htmlFor={`editor_id_${editor.currentModule.id.trim()}`}>Identifiant</label>
                            <div className="popup_row-flex">
                                <input
                                    type="text"
                                    name="editor_id"
                                    id={`editor_id_${editor.currentModule.id.trim()}`}
                                    value={editor.currentModule.id}
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
                                précédent: <b>{editor.prevModule?.id ?? "-"}</b></label>
                        </div>

                        <div className="popup_row" style={{alignItems: 'center', '--left_column_size': '100px'}}>
                            <label>Pictogramme</label>
                            <IconSelector value={editor.currentModule.icon} onChange={(selectedIcon, selected) => {
                                onUpdateModuleEditor({icon: selectedIcon, coef: selected?.coef ?? 0.5})
                                if (selected?.func && !editor.currentModule.func) onUpdateModuleEditor({func: selected?.func});
                                if (selected?.crb && !editor.currentModule.crb) onUpdateModuleEditor({crb: selected?.crb});
                                if (selected?.current && !editor.currentModule.current) onUpdateModuleEditor({current: selected?.current});
                            }}/>
                        </div>

                        <div className="popup_row" style={{'--left_column_size': '100px'}}>
                            <label htmlFor={`editor_text_${editor.currentModule.id.trim()}`}>Libellé</label>
                            <textarea
                                name="editor_text"
                                id={`editor_text_${editor.currentModule.id.trim()}`}
                                value={editor.currentModule.text}
                                onChange={(e) => onUpdateModuleEditor({text: e.target.value})}
                                rows={3}
                            />
                        </div>

                        <div className="popup_row" style={{'--left_column_size': '100px'}}>
                            <label htmlFor={`editor_desc_${editor.currentModule.id.trim()}`}>Annotations<br/><span
                                style={{fontSize: '0.8em', color: 'gray'}}>(nomenclature)</span></label>
                            <textarea
                                name="editor_desc"
                                id={`editor_desc_${editor.currentModule.id.trim()}`}
                                value={editor.currentModule.desc}
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
                                        id: editor.currentModule.id,
                                        icon: editor.currentModule.icon,
                                        text: editor.currentModule.text,
                                        desc: editor.currentModule.desc,
                                        parentId: editor.currentModule.parentId,
                                        func: editor.currentModule.func,
                                        type: editor.currentModule.type,
                                        current: editor.currentModule.current,
                                        crb: editor.currentModule.crb,
                                        sensibility: editor.currentModule.sensibility,
                                        pole: editor.currentModule.pole,
                                        free: false,
                                        span: editor.currentModule.span
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
                            <label htmlFor={`editor_func_${editor.currentModule.id.trim()}`}>Fonction</label>
                            <EditorFunctionSelector id={`editor_func_${editor.currentModule.id.trim()}`}
                                                    value={editor.currentModule.func}
                                                    onChange={(value) => onUpdateModuleEditor({func: value})}
                                                    schemaFunctions={schemaFunctions}/>
                        </div>

                        {editor.currentModule.func && <>
                            <div className="popup_row" style={{'--left_column_size': '100px'}}>
                                <label htmlFor={`editor_schparent_${editor.currentModule.id.trim()}`}>Parent</label>
                                <EditorParentSelector id={`editor_schparent_${editor.currentModule.id.trim()}`}
                                                      value={editor.currentModule.parentId}
                                                      currentModuleId={editor.currentModule.id}
                                                      filteredModulesListBySchemaFuncs={getFilteredModulesBySchemaFuncs()}
                                                      onChange={(value) => onUpdateModuleEditor({parentId: value})}
                                                      schemaFunctions={schemaFunctions}/>
                            </div>
                            <div className="popup_row" style={{
                                '--left_column_size': '100px',
                                borderBottom: schemaFunctions[editor.currentModule.func]?.supportContacts === true ? 'initial' : '1px solid lightgray',
                                paddingBottom: schemaFunctions[editor.currentModule.func]?.supportContacts === true ? 'initial' : '1em',
                                marginBottom: schemaFunctions[editor.currentModule.func]?.supportContacts === true ? 'initial' : '2em'
                            }}>
                                <div></div>
                                <label style={{fontSize: "small", color: "#777"}}>└ Parent du module
                                    précédent: <b>{prevModuleTitle !== "" ? prevModuleTitle : "-"}</b></label>
                            </div>

                            {schemaFunctions[editor.currentModule.func]?.supportContacts === true &&
                                <div className="popup_row" style={{
                                    '--left_column_size': '100px',
                                    borderBottom: '1px solid lightgray',
                                    paddingBottom: '1em',
                                    marginBottom: '2em'
                                }}>
                                    <label htmlFor={`editor_contacts_${editor.currentModule.id.trim()}`}>Asservi
                                        par</label>
                                    <EditorContactSelector id={`editor_contacts_${editor.currentModule.id.trim()}`}
                                                           value={editor.currentModule.kcId}
                                                           currentModuleId={editor.currentModule.id}
                                                           filteredModulesListBySchemaFuncs={getFilteredModulesBySchemaFuncs()}
                                                           onChange={(value) => onUpdateModuleEditor({kcId: value})}/>
                                </div>}
                        </>
                        }

                        {schemaFunctions[editor.currentModule.func]?.hasType &&
                            <div className="popup_row" style={{'--left_column_size': '100px'}}>
                                <label htmlFor={`editor_type_${editor.currentModule.id.trim()}`}>Type</label>
                                <EditorTypeSelector id={`editor_type_${editor.currentModule.id.trim()}`}
                                                    value={editor.currentModule.type}
                                                    onChange={(value) => onUpdateModuleEditor({type: value})}/>
                            </div>
                        }

                        {schemaFunctions[editor.currentModule.func]?.hasCrb &&
                            <div className="popup_row" style={{'--left_column_size': '100px'}}>
                                <label htmlFor={`editor_crb_${editor.currentModule.id.trim()}`}>Courbe</label>
                                <EditorCrbSelector id={`editor_crb_${editor.currentModule.id.trim()}`}
                                                   value={editor.currentModule.crb}
                                                   onChange={(value) => onUpdateModuleEditor({crb: value})}/>
                            </div>
                        }

                        {schemaFunctions[editor.currentModule.func]?.hasType &&
                            <div className="popup_row" style={{'--left_column_size': '100px'}}>
                                <label
                                    htmlFor={`editor_sensibility_${editor.currentModule.id.trim()}`}>Sensibilité</label>
                                <EditorSensibilitySelector id={`editor_sensibility_${editor.currentModule.id.trim()}`}
                                                           value={editor.currentModule.sensibility}
                                                           onChange={(value) => onUpdateModuleEditor({sensibility: value})}/>
                            </div>
                        }

                        {schemaFunctions[editor.currentModule.func]?.hasCurrent &&
                            <div className="popup_row" style={{'--left_column_size': '100px'}}>
                                <label htmlFor={`editor_current_${editor.currentModule.id.trim()}`}>Calibre</label>
                                <EditorCurrentSelector id={`editor_current_${editor.currentModule.id.trim()}`}
                                                       value={editor.currentModule.current}
                                                       onChange={(value) => onUpdateModuleEditor({current: value})}/>
                            </div>
                        }

                        {schemaFunctions[editor.currentModule.func]?.hasPole &&
                            <div className="popup_row" style={{'--left_column_size': '100px'}}>
                                <label htmlFor={`editor_pole_${editor.currentModule.id.trim()}`}>Pôles</label>
                                <EditorPoleSelector id={`editor_pole_${editor.currentModule.id.trim()}`}
                                                    value={editor.currentModule.pole}
                                                    onChange={(value) => onUpdateModuleEditor({pole: value})}/>
                            </div>
                        }

                        {editor.currentModule.func && (
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
                                    <SchemaSymbol module={editor.currentModule} schemaFunctions={schemaFunctions}/>
                                </div>
                            </div>
                        )}
                    </>
                }


            </div>
        </Popup>
    );
}