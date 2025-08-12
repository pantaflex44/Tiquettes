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
import schemaFunctions from './schema_functions.json';

import summaryRowIcon from "./assets/summary_row.svg";
import summaryPositionIcon from "./assets/summary_position.svg";
import summaryNoPicto from "./assets/summary_nopicto.svg";
import numbersIcon from "./assets/numbers.svg";
import editIcon from "./assets/edit.svg";
import {useMemo, useState} from "react";

export default function SummaryTab({
                                       tab,
                                       switchboard,
                                       setSwitchboard,
                                       printOptions,
                                       reassignModules,
                                       getModuleById,
                                       onEdit = null,
                                   }) {
    /*const getModuleById = (moduleId) => {
        let indexes = {row: -1, module: -1};
        let m = {module: null, indexes};

        switchboard.rows.forEach((row, ri) => {
            row.forEach((module, mi) => {
                if (!m.module && module.id === moduleId && !module.free) {
                    m = {...m, module, indexes: {...indexes, row: ri, module: mi}};
                }
            })
        });

        return m;
    }*/
    const [editMode, setEditMode] = useState(false);

    const handleEdit = (module, tab, focus = null) => {
        const m = getModuleById(module.id);
        if (!m?.module) return;

        onEdit(m.indexes.row, m.indexes.module, tab, focus);
    };

    return (
        <div
            className={`summary ${tab === 3 ? 'selected' : ''} ${printOptions.summary ? 'printable' : 'notprintable'}`.trim()}>
            <div className="tabPageBand notprintable">
                <div className="tabPageBandGroup">
                    <div className="tabPageBandCol">
                        <button style={{height: '34px'}}
                                title="Ré-assigner automatiquement les identifiants des modules de l'ensemble du projet."
                                onClick={() => reassignModules()}>
                            <img src={numbersIcon} alt="Ré-assigner automatiquement les identifiants" width={22}
                                 height={22}/>
                        </button>
                    </div>
                    <div className="tabPageBandCol">

                        <input type="checkbox" name="summaryEditMode" id="summaryEditMode"
                               checked={editMode} onChange={() => setEditMode(old => !old)}/>
                        <label htmlFor="summaryEditMode" title="Editer les informations">
                            <img src={editIcon} alt="Editer les informations" width={22} height={22}/>
                            Edition
                        </label>
                    </div>
                </div>
                <div className="tabPageBandGroup">
                    <div className="tabPageBandCol">
                        <span style={{fontSize: 'smaller', lineHeight: 1.2}}>Afficher<br/>les colones:</span>
                    </div>
                    <div className="tabPageBandCol">
                        <input type="checkbox" name="summaryColumnRowChoice" id="summaryColumnRowChoice"
                               checked={switchboard.summaryColumnRow} onChange={(e) => setSwitchboard((old) => ({
                            ...old,
                            summaryColumnRow: e.target.checked
                        }))}/>
                        <label htmlFor="summaryColumnRowChoice" title="Colone 'Rangée'">Rangée</label>
                    </div>
                    <div className="tabPageBandCol">
                        <input type="checkbox" name="summaryColumnPositionChoice" id="summaryColumnPositionChoice"
                               checked={switchboard.summaryColumnPosition}
                               onChange={(e) => setSwitchboard((old) => ({
                                   ...old,
                                   summaryColumnPosition: e.target.checked
                               }))}/>
                        <label htmlFor="summaryColumnPositionChoice" title="Colone 'Position'">Position</label>
                    </div>
                    <div className="tabPageBandCol">
                        <input type="checkbox" name="summaryColumnTypeChoice" id="summaryColumnTypeChoice"
                               checked={switchboard.summaryColumnType} onChange={(e) => setSwitchboard((old) => ({
                            ...old,
                            summaryColumnType: e.target.checked
                        }))}/>
                        <label htmlFor="summaryColumnTypeChoice" title="Colone 'Type'">Type</label>
                    </div>
                    <div className="tabPageBandCol">
                        <input type="checkbox" name="summaryColumnIdChoice" id="summaryColumnIdChoice"
                               checked={switchboard.summaryColumnId} onChange={(e) => setSwitchboard((old) => ({
                            ...old,
                            summaryColumnId: e.target.checked
                        }))}/>
                        <label htmlFor="summaryColumnIdChoice" title="Colone 'Identifiant'">Identifiant</label>
                    </div>
                    <div className="tabPageBandCol">
                        <input type="checkbox" name="summaryColumnFunctionChoice" id="summaryColumnFunctionChoice"
                               checked={switchboard.summaryColumnFunction}
                               onChange={(e) => setSwitchboard((old) => ({
                                   ...old,
                                   summaryColumnFunction: e.target.checked
                               }))}/>
                        <label htmlFor="summaryColumnFunctionChoice" title="Colone 'Fonction'">Fonction</label>
                    </div>
                    <div className="tabPageBandCol">
                        <input type="checkbox" name="summaryColumnLabelChoice" id="summaryColumnLabelChoice"
                               checked={switchboard.summaryColumnLabel} onChange={(e) => setSwitchboard((old) => ({
                            ...old,
                            summaryColumnLabel: e.target.checked
                        }))}/>
                        <label htmlFor="summaryColumnLabelChoice" title="Colone 'Libellé'">Libellé</label>
                    </div>
                    <div className="tabPageBandCol">
                        <input type="checkbox" name="summaryColumnDescriptionChoice"
                               id="summaryColumnDescriptionChoice"
                               checked={switchboard.summaryColumnDescription}
                               onChange={(e) => setSwitchboard((old) => ({
                                   ...old,
                                   summaryColumnDescription: e.target.checked
                               }))}/>
                        <label htmlFor="summaryColumnDescriptionChoice"
                               title="Colone 'Annotations'">Annotations</label>
                    </div>
                </div>
            </div>

            <table>
                <thead>
                <tr>
                    {switchboard.summaryColumnRow && <th style={{width: '100px', paddingRight: '1em'}}>Rangée</th>}
                    {switchboard.summaryColumnPosition &&
                        <th style={{width: '60px', paddingRight: '1em'}}>Position</th>}
                    {switchboard.summaryColumnType &&
                        <th style={{width: '50px', paddingRight: '1em', textAlign: 'center'}}>Type</th>}
                    {switchboard.summaryColumnId &&
                        <th style={{width: '100px', paddingRight: '1em'}}>Identifiant</th>}
                    {switchboard.summaryColumnFunction &&
                        <th style={{width: '220px', paddingRight: '1em'}}>Fonction</th>}
                    {switchboard.summaryColumnLabel &&
                        <th style={{width: '210px', paddingRight: '1em'}}>Libellé</th>}
                    {switchboard.summaryColumnDescription && <th>Annotations</th>}
                </tr>
                </thead>
                <tbody>
                {switchboard.rows.map((row, i) => {
                    let li = -1;
                    return row.map((module, j) => {
                        if (!module.free) {
                            const ret = <tr key={`${i}-${j}`}
                                            className={`${li !== i ? 'newrow' : 'otherrow'}`.trim()}>
                                {switchboard.summaryColumnRow && (
                                    <td className="summary_row">{li !== i ?
                                        <div><img src={summaryRowIcon} width={16} height={16}
                                                  alt="Rangée"/><span>Rangée {i + 1}</span></div> : null}</td>
                                )}
                                {switchboard.summaryColumnPosition && (
                                    <td className="summary_position">
                                        <div><img src={summaryPositionIcon} width={16} height={16}
                                                  alt="Position"/><span>P{`${j + 1}`.padStart(2, '0')}</span></div>
                                    </td>
                                )}
                                {switchboard.summaryColumnType && (
                                    <td className="summary_type" onClick={() => handleEdit(module, 'main', 'icon')}
                                        title={"Cliquer pour éditer"}>
                                        <div>{module.icon ?
                                            <img src={module.icon} width={20} height={20} alt="Pictogramme"/> :
                                            <img src={summaryNoPicto} width={20} height={20}
                                                 alt="Remplacement"/>}</div>
                                    </td>
                                )}
                                {switchboard.summaryColumnId && (
                                    <td className="summary_id" onClick={() => handleEdit(module, 'main', 'id')}
                                        title={"Cliquer pour éditer"}>
                                        <div>{module.id}</div>
                                    </td>
                                )}
                                {switchboard.summaryColumnFunction && (
                                    <td className="summary_func" onClick={() => handleEdit(module, 'schema')}
                                        title={"Cliquer pour éditer"}>
                                        {schemaFunctions[module.func] && <p>
                                            {schemaFunctions[module.func]?.name ?? ""}
                                            <br/>
                                            {schemaFunctions[module.func]?.hasType === true && `Type ${module.type} `}
                                            {schemaFunctions[module.func]?.hasCrb === true && `Courbe ${module.crb} `}
                                            {schemaFunctions[module.func]?.hasType === true && `${module.sensibility} `}
                                            {`${module.current ?? ""} ${module.pole ?? ""}`.trim()}
                                        </p>}
                                    </td>
                                )}
                                {switchboard.summaryColumnLabel && (
                                    <td className="summary_text" onClick={() => handleEdit(module, 'main', 'text')}
                                        title={"Cliquer pour éditer"}>
                                        <div>{module.text}</div>
                                    </td>
                                )}
                                {switchboard.summaryColumnDescription && (
                                    <td className="summary_text" onClick={() => handleEdit(module, 'main', 'desc')}
                                        title={"Cliquer pour éditer"}>
                                        <div>{module.desc}</div>
                                    </td>
                                )}
                            </tr>;
                            if (li !== i) li = i;
                            return ret;
                        }
                    })
                })}
                </tbody>
            </table>
        </div>
    );
}