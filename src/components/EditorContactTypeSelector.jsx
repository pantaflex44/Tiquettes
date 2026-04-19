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

import kcNOIcon from '../assets/kc_no.svg';
import kcNCIcon from '../assets/kc_nc.svg';

export default function EditorContactTypeSelector({ id, value, disabled = false, onChange = null }) {
    return <div className={`buttons_box ${disabled === true ? 'disabled' : ''}`.trim()} style={{ width: '100%' }} id={id} name={id}>
        <div className={`buttons_box-button ${value.trim().toUpperCase() === "NO" ? 'selected' : ''}`.trim()} style={{ width: 'initial', flex: 1 }} title="Normalement ouvert" onClick={() => onChange("NO")}>
            <img src={kcNOIcon} width={24} height={24} alt="NO" />
            <span>NO</span>
        </div>
        <div className={`buttons_box-button ${value.trim().toUpperCase() === "NC" ? 'selected' : ''}`.trim()} style={{ width: 'initial', flex: 1 }} title="Normalement fermé" onClick={() => onChange("NC")}>
            <img src={kcNCIcon} width={24} height={24} alt="NC" />
            <span>NC</span>
        </div>
    </div>
}