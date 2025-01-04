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

import "./welcomePopup.css";

import projectIcon from "./assets/project.svg";
import importIcon from "./assets/upload.svg";
import modelsIcon from "./assets/modelref.svg";

import Popup from "./Popup.jsx";

export default function WelcomePopup({
                                         onCancel,
                                         onNewProject,
                                         onImportProject,
                                         onWizard,
                                         wizardAllowed = false
                                     }) {
    return <Popup
        title={"Bienvenue sur Tiquettes"}
        showCloseButton={false}
        onCancel={() => onCancel()}
        showOkButton={false}
    >
        <ul className="bigList">
            <li onClick={() => {
                onNewProject();
            }}>
                <img src={projectIcon} width={48} height={48} alt="Nouveau projet"/>
                <div className="bigList-content">
                    <div className="bigList-content_title">Nouveau projet libre</div>
                    <div className="bigList-content_description">Démarrez librement votre nouveau projet. C&#39;est à
                        vous de renseigner toutes les informations requises.
                    </div>
                </div>
            </li>
            {wizardAllowed && (
                <li onClick={() => {
                    onWizard();
                }}>
                    <img src={modelsIcon} width={48} height={48} alt="Models"/>
                    <div className="bigList-content">
                        <div className="bigList-content_title">Modèle par référence</div>
                        <div className="bigList-content_description">Pour vous aider à concevoir votre projet, Tiquettes vous propose des modèles de tableaux pré-conçus.
                        </div>
                    </div>
                </li>
            )}
            <li onClick={() => {
                onImportProject();
            }}>
                <img src={importIcon} width={48} height={48} alt="Importer un projet"/>
                <div className="bigList-content">
                    <div className="bigList-content_title">Importer un projet existant</div>
                    <div className="bigList-content_description">Chargez facilement un ancien projet.</div>
                </div>
            </li>
        </ul>
    </Popup>
}