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
import Popup from "./Popup.jsx";

export default function NewProjectEditor({
                                             newProjectProperties,
                                             onSetNewProjectProperties,

                                             rowsMin,
                                             rowsMax,
                                             heightMin,
                                             heightMax,

                                             onCreateProject,
                                             onUpdateProjectProperties,
                                         }) {
    return newProjectProperties && (
        <Popup
            title={"Créer un nouveau projet"}
            showCloseButton={true}
            onCancel={() => onSetNewProjectProperties(null)}
            onOk={() => {
                onCreateProject(newProjectProperties.name, newProjectProperties.spr, newProjectProperties.npRows, newProjectProperties.hRow);
                onSetNewProjectProperties(null);
            }}
        >
            <div className="popup_row dark" style={{'--left_column_size': '150px', marginBottom: '3em'}}>
                <label htmlFor="newProjectProperties_name" style={{fontSize: '110%'}}>Nom du projet :</label>
                <input
                    type="text"
                    name="newProjectProperties_name"
                    id="newProjectProperties_name"
                    value={newProjectProperties.name}
                    onChange={(e) => onUpdateProjectProperties({name: e.target.value})}
                    autoFocus
                />
            </div>


            <div className="popup_row span dark"
                 style={{'--left_column_size': '150px', alignItems: 'center', marginTop: 0, marginBottom: '1em'}}>
                <label htmlFor="newProjectProperties_modules" style={{fontSize: '110%'}}>Nombre de rangées :</label>
            </div>
            <div className="popup_row" style={{'--left_column_size': '150px', marginTop: 0, marginBottom: '3em'}}>
                <div><label style={{
                    fontSize: '1.1em',
                    color: 'var(--primary-color)'
                }}>˫ <b>{newProjectProperties.npRows}</b> rangées</label></div>
                <div style={{display: "flex", alignItems: "center", columnGap: '1em'}}>
                    <input type="range" min={rowsMin} max={rowsMax} step={1} value={newProjectProperties.npRows}
                           onChange={(e) => {
                               const value = parseInt(e.target.value);
                               if (value >= rowsMin) onUpdateProjectProperties({npRows: value});
                           }} style={{minHeight: 0, padding: 0, margin: 0, width: '100%'}}/>
                </div>
            </div>

            <div className="popup_row span dark"
                 style={{'--left_column_size': '150px', alignItems: 'center', marginTop: 0, marginBottom: '0em'}}>
                <label htmlFor="newProjectProperties_modules" style={{fontSize: '110%'}}>Nombre de modules par rangée
                    :</label>
            </div>
            <div className="popup_row span"
                 style={{'--left_column_size': '150px', alignItems: 'center', marginTop: '0', marginBottom: '3em'}}>
                <div></div>
                <div className="radio_group">
                    {import.meta.env.VITE_ALLOWED_MODULES.split(',').map((count) => {
                        const c = parseInt(count.trim());
                        return <div key={c} className="radio">
                            <input type="radio" name="spr" id={`newProjectProperties_modules_${c}`} value={c}
                                   checked={newProjectProperties.spr === c}
                                   onChange={(e) => onUpdateProjectProperties({spr: parseInt(e.target.value)})}/>
                            <label htmlFor={`newProjectProperties_modules_${c}`}
                                   style={{margin: 0, marginRight: '0.5em', paddingInline: '1em'}}>{c} modules</label>
                        </div>;
                    })}
                </div>
            </div>

            <div className="popup_row span dark"
                 style={{'--left_column_size': '150px', alignItems: 'center', marginBottom: '1em'}}>
                <label htmlFor="newProjectProperties_modules" style={{fontSize: '110%'}}>Hauteur d&apos;une
                    rangée :</label>
            </div>
            <div className="popup_row" style={{'--left_column_size': '150px', marginTop: 0, marginBottom: '-1em'}}>
                <div><label style={{
                    fontSize: '1.1em',
                    color: 'var(--primary-color)'
                }}>˫ <b>{newProjectProperties.hRow}</b>mm</label></div>
                <div style={{display: "flex", alignItems: "center", columnGap: '1em', marginBottom: '-0.25em'}}>
                    <input type="range" min={heightMin} max={heightMax} step={1} value={newProjectProperties.hRow}
                           onChange={(e) => {
                               const value = parseInt(e.target.value);
                               if (value >= heightMin) onUpdateProjectProperties({hRow: value});
                           }} style={{minHeight: 0, padding: 0, margin: 0, width: '100%'}}/>
                </div>
            </div>

            <div className="popup_row span light"
                 style={{'--left_column_size': '150px', alignItems: 'center', marginTop: '2em', marginBottom: '5em'}}>
                <div>
                    La hauteur des étiquettes dépend de l&#39;espace disponible proposé par l&#39;enveloppe choisie. Chaque marque / modèle possède ses propres dimensions.<br />Pour garantir une insertion correcte des étiquettes imprimées, il est conseillé de <b>retirer 1mm de la hauteur mesurée</b>.
                    <ul>
                        <li><b>Schneider Resi 9</b> : 30mm → 29mm</li>
                        <li><b>Schneider PrimaSeT S</b> : 24mm → 23mm</li>
                        <li><b>Hager Gamma</b> : 35mm → 34mm</li>
                        <li>etc.</li>
                    </ul>
                </div>

            </div>
        </Popup>
    );
}