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

    const lastFreeId = useMemo(() => {
        let rows = switchboard.rows;

        let ids = [];
        rows.forEach((row) => {
            return row.forEach((module) => {
                ids.push(module.id);
            });
        });

        const prefix = (editor.currentModule.func ?? defaultModuleId).trim().toUpperCase();

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
                <img className="popup_title_content_img" src={editIcon} title="Editer le module" alt="Editer le module"/>
                <span className="popup_title_content_id">{editor.currentModule.id ?? ""}</span>
                {editor.currentModule.text ? <span className="popup_title_content_desc">/ {editor.currentModule.text ?? ""}</span> : ""}
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
                    <input type="checkbox" id="main_editor_tab" checked={editorTab === "main"} onChange={() => setEditorTab("main")}/>
                    <label htmlFor="main_editor_tab">
                        <img src={switchboardIcon} width="20" height="20" alt="Tableau"/>
                        <span>Tableau</span>
                    </label>

                    <input type="checkbox" id="schema_editor_tab" checked={editorTab === "schema"} onChange={() => setEditorTab("schema")}/>
                    <label htmlFor="schema_editor_tab">
                        <img src={schemaIcon} width="20" height="20" alt="Schéma"/>
                        <span>Schéma</span>
                    </label>
                </div>

                {editor.errors.map((error, i) => <div key={i} className="popup_row" style={{'--left_column_size': '100px'}}>
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
                                <button title="Trouver le prochain identifiant disponible." onClick={() => onUpdateModuleEditor({id: lastFreeId})}>
                                    <img src={assignIdIcon} width={20} height={20} alt="Trouver le prochain identifiant libre." />
                                </button>
                            </div>
                        </div>
                        <div className="popup_row" style={{'--left_column_size': '100px'}}>
                            <div></div>
                            <label style={{fontSize: "small", color: "#777"}}>└ Identifiant du module précédent: <b>{editor.prevModule?.id ?? "-"}</b></label>
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
                            <label htmlFor={`editor_desc_${editor.currentModule.id.trim()}`}>Annotations<br/><span style={{fontSize: '0.8em', color: 'gray'}}>(nomenclature)</span></label>
                            <textarea
                                name="editor_desc"
                                id={`editor_desc_${editor.currentModule.id.trim()}`}
                                value={editor.currentModule.desc}
                                onChange={(e) => onUpdateModuleEditor({desc: e.target.value})}
                                rows={2}
                            />
                        </div>

                        <div style={{display: 'flex', flexDirection: 'column', marginInline: 'auto', marginTop: '2em', alignItems: 'center', width: '100%', borderBottom: '1px solid lightgray'}}>
                            <h5 style={{color: 'gray', width: '100%', borderBottom: '1px solid lightgray', margin: 0}}>Démonstration</h5>
                            <div style={{borderRadius: '5px', border: '1px solid darkgray', width: 'min-content', maxWidth: '100%', overflowX: 'auto', marginBlock: '1em', minHeight: `calc(${switchboard.height}mm + 1mm)`, overflowY: 'hidden'}}>
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
                            <select value={editor.currentModule.func} onChange={(e) => onUpdateModuleEditor({func: e.target.value})}>
                                <option value={""}>-</option>
                                {Object.keys(schemaFunctions).map((key, i) => <option key={i} value={key}>{schemaFunctions[key].name}</option>)}
                            </select>
                        </div>

                        {editor.currentModule.func && <>
                            <div className="popup_row" style={{'--left_column_size': '100px'}}>
                                <label htmlFor={`editor_schparent_${editor.currentModule.id.trim()}`}>Parent</label>
                                <select value={editor.currentModule.parentId} onChange={(e) => onUpdateModuleEditor({parentId: e.target.value})}>
                                    <option value={""}>- aucun -</option>
                                    {Object.entries(getFilteredModulesBySchemaFuncs()).map(([k, l]) => {
                                        return (
                                            <Fragment key={k}>
                                                <option value="" disabled={true}>{schemaFunctions[k].name}</option>
                                                {l.map((module) => <option key={module.id} value={module.id}>{`${module.id} ${module.text ? '- ' + module.text : ''}`.trim()}</option>)}
                                            </Fragment>
                                        );
                                    })}
                                </select>
                            </div>
                            <div className="popup_row" style={{'--left_column_size': '100px', borderBottom: '1px solid lightgray', paddingBottom: '1em'}}>
                                <div></div>
                                <label style={{fontSize: "small", color: "#777"}}>└ Parent du module
                                    précédent: <b>{((prevModule?.id ?? "aucun") + " " + (prevModule && schemaFunctions[prevModule.func] ? "(" + schemaFunctions[prevModule.func].name + ")" : "")).trim()}</b></label>
                            </div>
                        </>
                        }

                        {schemaFunctions[editor.currentModule.func]?.hasType &&
                            <div className="popup_row" style={{'--left_column_size': '100px', marginTop: '2em'}}>
                                <label htmlFor={`editor_type_${editor.currentModule.id.trim()}`}>Type</label>
                                <select value={editor.currentModule.type} onChange={(e) => onUpdateModuleEditor({type: e.target.value})}>
                                    <option value={""}>-</option>
                                    <option value={"A"}>A</option>
                                    <option value={"AC"}>AC</option>
                                    <option value={"B"}>B</option>
                                    <option value={"F"}>F</option>
                                    <option value={"HPI"}>HPI</option>
                                    <option value={"S"}>S</option>
                                </select>
                            </div>
                        }

                        {schemaFunctions[editor.currentModule.func]?.hasCrb &&
                            <div className="popup_row" style={{'--left_column_size': '100px'}}>
                                <label htmlFor={`editor_crb_${editor.currentModule.id.trim()}`}>Courbe</label>
                                <select value={editor.currentModule.crb} onChange={(e) => onUpdateModuleEditor({crb: e.target.value})}>
                                    <option value={""}>-</option>
                                    <option value={"Z"}>Z</option>
                                    <option value={"B"}>B</option>
                                    <option value={"C"}>C</option>
                                    <option value={"D"}>D</option>
                                    <option value={"MA"}>MA</option>
                                </select>
                            </div>
                        }

                        {schemaFunctions[editor.currentModule.func]?.hasType &&
                            <div className="popup_row" style={{'--left_column_size': '100px'}}>
                                <label htmlFor={`editor_current_${editor.currentModule.id.trim()}`}>Sensibilité</label>
                                <select value={editor.currentModule.sensibility} onChange={(e) => onUpdateModuleEditor({sensibility: e.target.value})}>
                                    <option value={""}>-</option>
                                    <option value={"10mA"}>10mA</option>
                                    <option value={"30mA"}>30mA</option>
                                    <option value={"300mA"}>300mA</option>
                                    <option value={"500mA"}>500mA</option>
                                </select>
                            </div>
                        }

                        {schemaFunctions[editor.currentModule.func]?.hasCurrent &&
                            <div className="popup_row" style={{'--left_column_size': '100px'}}>
                                <label htmlFor={`editor_current_${editor.currentModule.id.trim()}`}>Calibre</label>
                                <select value={editor.currentModule.current} onChange={(e) => onUpdateModuleEditor({current: e.target.value})}>
                                    <option value={""}>-</option>
                                    <option value={"2A"}>2A</option>
                                    <option value={"6A"}>6A</option>
                                    <option value={"10A"}>10A</option>
                                    <option value={"16A"}>16A</option>
                                    <option value={"20A"}>20A</option>
                                    <option value={"25A"}>25A</option>
                                    <option value={"32A"}>32A</option>
                                    <option value={"40A"}>40A</option>
                                    <option value={"63A"}>63A</option>
                                    <option value={"80A"}>80A</option>
                                    <option value={"100A"}>100A</option>
                                    <option value={"160A"}>160A</option>
                                    <option value={"250A"}>250A</option>
                                </select>
                            </div>
                        }

                        {schemaFunctions[editor.currentModule.func]?.hasPole &&
                            <div className="popup_row" style={{'--left_column_size': '100px'}}>
                                <label htmlFor={`editor_pole_${editor.currentModule.id.trim()}`}>Pôles</label>
                                <select value={editor.currentModule.pole} onChange={(e) => onUpdateModuleEditor({pole: e.target.value})}>
                                    <option value={""}>-</option>
                                    <option value={"1P+N"}>Monophasé (1P+N)</option>
                                    <option value={"3P"}>Triphasé (3P)</option>
                                    <option value={"3P+N"}>Triphasé (3P+N)</option>
                                    <option value={"4P"}>Tétrapolaire (4P)</option>
                                </select>
                            </div>
                        }

                        {editor.currentModule.func && (
                            <div style={{display: 'flex', flexDirection: 'column', marginInline: 'auto', marginTop: '2em', alignItems: 'center', width: '100%', borderBottom: '1px solid lightgray'}}>
                                <h5 style={{color: 'gray', width: '100%', borderBottom: '1px solid lightgray', margin: 0}}>Démonstration</h5>
                                <div style={{width: '100px', minWidth: '70px', height: '100px', maxWidth: '100%', overflowX: 'auto', marginBlock: '1em', overflowY: 'hidden'}}>
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