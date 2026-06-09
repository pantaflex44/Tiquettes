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

import {useEffect, useState} from "react";

export default function EditorWireSelector({ id, value, onChange = null, current = 0, rules = {} }) {
    const [list, setList] = useState([]);
    const [cur, setCur] = useState(0);

    useEffect(() => {
        const c = rules[current] ?? 0;
        setCur(c);

        const l = [...new Set(Object.values(rules))];
        setList(old => (JSON.stringify(old) !== JSON.stringify(l) ? l : old));
    }, [current, onChange, rules, value]);


    return <select id={id} name={id} value={value} data-value={value}
                   onChange={(e) => {
                       if (onChange) onChange(e.target.value)
                   }}>
        <option value={""}>( détection automatique )</option>
        {cur > 0 && <option value={"?"}>( inconnue )</option>}
        {list.map((item) => <option key={item} value={item}>{`${item} mm²`}</option>)}
    </select>
}