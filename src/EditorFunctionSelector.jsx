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

export default function EditorFunctionSelector({id, value, onChange = null}) {
    return <select id={id} name={id} value={value}
                   onChange={(e) => {
                       if (onChange) onChange(e.target.value)
                   }}>
        <option value={""}>-</option>
        {Object.keys(schemaFunctions)
            .filter(key => (schemaFunctions[key].selectable ?? false) === true)
            .map((key, i) => <option key={i}
                                     value={key}>{schemaFunctions[key].name}</option>)}
    </select>
}