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
import wizardIcon from "./assets/hand.svg";

import Popup from "./Popup.jsx";

export default function WelcomePopup({
                                         onCancel,
                                         onNewProject,
                                         onImportProject,
                                         onWizard,
                                         wizard = null,
                                     }) {
    const appWizardAllowed = `${import.meta.env.VITE_APP_WIZARD}`.toLowerCase().trim() === "true";

    const wizardConfirm = () => {
        if (wizard !== null) {
            return confirm("L'assistant est en cours d'éxécution. Cette action effacera tout votre travail.\r\n\r\nÊtes-vous certain de vouloir quitter l'assistant ?");
        }
        return true;
    };

    const newWizardConfirm = () => {
        return true;
    };

    return <Popup
        title={"Bienvenue sur Tiquettes"}
        showCloseButton={false}
        onCancel={() => onCancel()}
        showOkButton={false}
    >
        <ul className="bigList">
            <li onClick={() => {
                if (wizardConfirm()) onNewProject();
            }}>
                <img src={projectIcon} width={48} height={48} alt="Nouveau projet"/>
                <div className="bigList-content">
                    <div className="bigList-content_title">Nouveau projet libre</div>
                    <div className="bigList-content_description">Démarrez librement votre nouveau projet. C&#39;est à vous de renseigner toutes les informations requises.</div>
                </div>
            </li>
            {appWizardAllowed && (
                <li className={wizard !== null ? 'disabled' : ''} onClick={() => {
                    if (newWizardConfirm()) onWizard();
                }}>
                    <img src={wizardIcon} width={48} height={48} alt="Assistant de conception"/>
                    <div className="bigList-content">
                        <div className="bigList-content_title">Assistant de conception résidentiel</div>
                        <div className="bigList-content_description">Utilisez notre assistant de conception pour votre projet résidentiel.<br/>A tout moment, vous pouvez revenir au projet libre en cours d&#39;édition, en quittant l&#39;assistant sans sauvegarder votre travail !</div>
                    </div>
                </li>
            )}
            <li onClick={() => {
                if (wizardConfirm()) onImportProject();
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