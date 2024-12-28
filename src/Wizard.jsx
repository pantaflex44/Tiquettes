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
import "./wizard.css";

import trashIcon from "./assets/trash.svg";
import addIcon from "./assets/plus.svg";

import {useState} from "react";

export default function Wizard({
                                   wizard,
                                   onCancel,
                                   onUpdate,
                                   onSave,
                               }) {
    const [data, setData] = useState({...wizard});
    const [selectedRoom, setSelectedRoom] = useState(wizard.rooms.length > 0 ? wizard.rooms[0].name : '');
    const [newRoomName, setNewRoomName] = useState("");

    const defaultProjectName = import.meta.env.VITE_DEFAULT_PROJECT_NAME;
    const heightMin = parseInt(import.meta.env.VITE_HEIGHT_MIN);
    const heightMax = parseInt(import.meta.env.VITE_HEIGHT_MAX);

    return (
        <>
            <h3>Bienvenue dans l&#39;assistant de conception d&#39;un projet résidentiel.</h3>
            <div className="wizardDescription">Concevez votre projet résidentiel pas à pas. Indiquez la configuration de votre habitation, puis laissez votre humble assistant vous proposer un projet complet !</div>
            <div className="wizard">
                <div className="wizardProject">
                    <div className="wizardBlock">
                        <div className="wizardBlock_row">
                            <label htmlFor="wizardPrjname">Nom du projet</label>
                            <div className="sublabel">Indiquez un nom simple et explicite.</div>
                            <input
                                type="text"
                                name="wizardPrjname"
                                id="wizardPrjname"
                                value={data.prjname}
                                onChange={(e) => setData((old) => ({...old, prjname: e.target.value}))}
                                onBlur={(e) => {
                                    const value = (e.target.value ?? '').trim();
                                    if (value === "") e.target.value = defaultProjectName;
                                }}
                                autoFocus
                            />
                        </div>

                        <div className="wizardBlock_separator"></div>

                        <div className="wizardBlock_row">
                            <label htmlFor="wizardHrow">Hauteur des étiquettes</label>
                            <div className="sublabel">Renseignez la hauteur en millimètres de l&#39;espace disponible alloué par le porte étiquettes de l&#39;enveloppe choisie.</div>
                            <div className="wizardBlock_inline">
                                <input type="range" min={heightMin} max={heightMax} step={1} value={data.height} onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    if (value >= heightMin) setData((old) => ({...old, height: value}));
                                }}/>
                                <label htmlFor="wizardHrow"><small>{data.height}mm</small></label>
                            </div>
                            <div className="sublabel"><u>Conseil</u>: retirez 1mm de la hauteur totale pour être certain que les étiquettes imprimées s&#39;insèrent correctement.</div>
                            <div className="sublabel">
                                <b>Exemples:</b><br/>
                                - Schneider Resi9: 30mm<br/>
                                - Schneider PrismaSeT: 24mm / 35mm<br/>
                                - Hager Gamma: 31mm<br/>
                                - Legrand: 35mm<br/>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="wizardRooms">
                    <div className="wizardBlock nopad">
                        <div className="wizardRoomsList">
                            <div className="wizardRoom">
                                <input type="text" name="wizardNewRoom" id="wizardNewRoom" placeholder="Nouvelle pièce" value={newRoomName} onChange={(e) => setNewRoomName(e.target.value)} />
                                <img src={addIcon} width={16} height={16} alt="Ajouter" title={`Ajouter une nouvelle pièce`} className={newRoomName === '' ? 'disabled' : ''}/>
                            </div>
                            {wizard.rooms.map((room, i) => (
                                <div className="wizardRoom" key={i} title={room.namee}>
                                    <label>
                                        {room.name}
                                        <input type="radio" value={room.name} checked={selectedRoom === room.name} onChange={(e) => setSelectedRoom(e.target.value)}/>
                                    </label>
                                    <img src={trashIcon} width={16} height={16} alt="Supprimer" title={`Supprimer la pièce: '${room.name}'`}/>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="wizardDetails">
                    <div className="wizardBlock">
                        c
                    </div>
                </div>
            </div>
        </>
    )
        ;
};