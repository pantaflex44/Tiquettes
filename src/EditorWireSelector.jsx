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

import {useEffect, useState} from "react";

export default function EditorWireSelector({id, value, onChange = null, current = 0}) {
    const rules = {
        2: 1,
        6: 1.5,
        10: 1.5,
        15: 1.5,
        16: 1.5,
        20: 2.5,
        25: 4,
        30: 6,
        32: 6,
        40: 10,
        45: 10,
        50: 16,
        60: 16,
        63: 16,
        80: 25,
        90: 25,
        100: 35,
        125: 50,
        160: 75,
        180: 75,
        240: 150,
        250: 150,
    };
    const [list, setList] = useState([]);
    const [cur, setCur] = useState(0);

    useEffect(() => {
        const cc = rules[current] ?? 0;
        setCur(cc);

        const l = [...new Set(Object.values(rules))];
        setList(old => (JSON.stringify(old) !== JSON.stringify(l) ? l : old));

        /*let lmin = [...new Set(Object.values(rules))].filter((c) => c >= cc);
        lmin = (lmin.length > 0) ? lmin[0] : (l.length > 0 ? l[0] : 0);
        //const v = lmin;
        const vv = value ?? 0;
        //if (cc > 0 && vv < v) onChange(`${v}`)
        const v = value ?? lmin;
        if (cc > 0  && vv !== v) onChange(`${v}`);*/
    }, [current, onChange, rules, value]);


    return <select id={id} name={id} value={value} data-value={value}
                   onChange={(e) => {
                       if (onChange) onChange(e.target.value)
                   }}>
        {cur === 0 && <option value={""}>-</option>}
        {list.map((item) => <option key={item} value={item}>{`${item} mm²`}</option>)}
    </select>
}