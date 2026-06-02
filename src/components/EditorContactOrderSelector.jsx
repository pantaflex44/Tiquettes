/**
 Tiquettes - Générateur d'étiquettes pour tableaux et armoires électriques
 Copyright (C) 2024-2026 Christophe LEMOINE

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

import asservOrderBefore from "../assets/asserv_order_before.svg";
import asservOrderAfter from "../assets/asserv_order_after.svg";

export default function EditorContactOrderSelector({ id, value, disabled = false, onChange = null }) {
    return (
        <div className={`buttons_box ${disabled === true ? "disabled" : ""}`.trim()} style={{ flex: 0, marginRight: '3px' }} id={id} name={id}>
            <div
                className={`buttons_box-button ${value === "before" ? "selected" : ""}`.trim()}
                title="Asservissement en amont du module"
                onClick={() => onChange("before")}
            >
                <img src={asservOrderBefore} width={24} height={24} alt="Asservissement en amont du module" />
            </div>
            <div
                className={`buttons_box-button ${value === "after" ? "selected" : ""}`.trim()}
                title="Asservissement en aval du module"
                onClick={() => onChange("after")}
            >
                <img src={asservOrderAfter} width={24} height={24} alt="Asservissement en aval du module" />
            </div>
        </div>
    );
}
