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

import {useMemo} from "react";

export default function EditorPoleSelector({id, value, db, onChange = null}) {
    const dbPole = useMemo(() => {
        if (!db || !db?.pole) return 4;
        let pole = db.pole.trim().toUpperCase();
        let p = parseInt(pole.replace(/\D/g, ''));
        if (p === 3 && pole.includes('+N')) p = 4;
        return p;
    }, [db]);

    const allowedPoles = [
        {key: "1P+N", name: "Monophasé (1P+N)"},
        {key: "3P", name: "Triphasé (3P)"},
        {key: "3P+N", name: "Triphasé (3P+N)"},
        {key: "4P", name: "Tétrapolaire (4P)"}
    ].filter(currentPole => {
        let p = parseInt(currentPole.key.replace(/\D/g, ''));
        if (p === 3 && currentPole.key.includes('+N')) p = 4;
        return p <= dbPole;
    });

    return <select id={id} name={id} value={value}
                   onChange={(e) => {
                       if (onChange) onChange(e.target.value)
                   }}>
        <option value={""}>-</option>
        {allowedPoles.map((pole, i) => <option key={i} value={pole.key}>{pole.name}</option>)}
    </select>
}