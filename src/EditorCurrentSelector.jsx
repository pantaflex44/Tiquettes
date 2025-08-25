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

export default function EditorCurrentSelector({id, value, onChange = null}) {
    return <select id={id} name={id} value={value}
                   onChange={(e) => {
                       if (onChange) onChange(e.target.value)
                   }}>
        <option value={""}>-</option>
        <option value={"2A"}>2A</option>
        <option value={"6A"}>6A</option>
        <option value={"10A"}>10A</option>
        <option value={"15A"}>15A</option>
        <option value={"16A"}>16A</option>
        <option value={"20A"}>20A</option>
        <option value={"25A"}>25A</option>
        <option value={"30A"}>30A</option>
        <option value={"32A"}>32A</option>
        <option value={"40A"}>40A</option>
        <option value={"45A"}>45A</option>
        <option value={"50A"}>50A</option>
        <option value={"60A"}>60A</option>
        <option value={"63A"}>63A</option>
        <option value={"80A"}>80A</option>
        <option value={"90A"}>90A</option>
        <option value={"100A"}>100A</option>
        <option value={"125A"}>100A</option>
        <option value={"160A"}>160A</option>
        <option value={"180A"}>100A</option>
        <option value={"240A"}>100A</option>
        <option value={"250A"}>250A</option>
    </select>
}