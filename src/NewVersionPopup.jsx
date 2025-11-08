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

import "./newVersionPopup.css";

import reloadIcon from "./assets/refresh-dot.svg";

import Popup from "./Popup.jsx";

export default function NewVersionPopup({
    newVersion,
    onOk,
}) {

    return <Popup
        title={"Oyé Oyé cher utilisateur !"}
        showCloseButton={false}
        showOkButton={true}
        showCancelButton={false}
        okButtonContent={
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', columnGap: '0.5rem', fontSize: '110%' }}
                title={"Charger la nouvelle version"}>
                <img src={reloadIcon} alt={"Charger"} width={20} height={20} />
                <span>Utiliser la nouvelle version</span>
            </div>
        }
        onOk={onOk}
    >
        <h1>La version {newVersion} est désormais disponible !</h1>
        <h2>Votre navigateur Internet utilise une version obsolète.</h2>
        <h4 style={{fontWeight: '500'}}>Pour toujours satisfaire vos éxigences les plus pointues, Tiquettes.fr évolue sans cesse.<br />Rechargez la page de votre naviguateur ou cliquez sur le bouton ci-dessous pour en profier :-)</h4>
    </Popup>
}