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

import partialAsservIcon from './assets/asserv_p.svg';
import totalAsservIcon from './assets/asserv_t.svg';

export default function EditorContactAsservSelector({ id, value, disabled = false, onChange = null }) {
    return <div className={`buttons_box ${disabled === true ? 'disabled' : ''}`.trim()} id={id} name={id}>
        <div className={`buttons_box-button ${value === true ? 'selected' : ''}`.trim()} title="Asservissement partiel" onClick={() => onChange(true)}>
            <img src={partialAsservIcon} width={24} height={24} alt="Asservissement partiel" />
        </div>
        <div className={`buttons_box-button ${value !== true ? 'selected' : ''}`.trim()} title="Asservissement total" onClick={() => onChange(false)}>
            <img src={totalAsservIcon} width={24} height={24} alt="Asservissement total" />
        </div>
    </div>
}