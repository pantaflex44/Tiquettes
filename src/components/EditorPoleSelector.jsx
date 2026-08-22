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

import { useMemo } from "react";

export default function EditorPoleSelector({
	id,
	parentModule,
	value,
	db = null,
	style = {},
	onChange = null,
}) {
	const polesCounter = (pole) => {
		let p = parseInt(pole.replace(/\D/g, ""), 10);
		if (p === 1 && pole.includes("+N")) p = 2;
		if (p === 3 && pole.includes("+N")) p = 4;
		return p;
	};

	const dbPole = useMemo(() => {
		if (!db?.pole) return 4;
		const pole = db.pole.trim().toUpperCase();
		return polesCounter(pole);
	}, [db]);

	const allowedPoles = [
		{
			key: "1P+N",
			name: `Monophasé unipolaire ${import.meta.env.VITE_VREF_230V} (1P+N)`,
			vref: import.meta.env.VITE_VREF_230V,
		},
		{
			key: "2P",
			name: `Monophasé bipolaire ${import.meta.env.VITE_VREF_230V} (2P)`,
			vref: import.meta.env.VITE_VREF_230V,
		},
		{
			key: "3P",
			name: `Triphasé ${import.meta.env.VITE_VREF_400V} (3P)`,
			vref: import.meta.env.VITE_VREF_400V,
		},
		{
			key: "3P+N",
			name: `Triphasé ${import.meta.env.VITE_VREF_230V} (3P+N)`,
			vref: import.meta.env.VITE_VREF_230V,
		},
		{
			key: "4P",
			name: `Tétrapolaire ${import.meta.env.VITE_VREF_230V} (4P)`,
			vref: import.meta.env.VITE_VREF_230V,
		},
	].filter((currentPole) => {
		const p = polesCounter(currentPole.key);
		if (p <= dbPole) {
			if (!parentModule?.pole) return true;
			const parentPole = parentModule.pole.trim().toUpperCase();
			return p <= polesCounter(parentPole);
		}
		return false;
	});

	const getVrefFromPole = (pole) => {
		const found = allowedPoles.find((p) => p.key === pole);
		return found ? found.vref : import.meta.env.VITE_VREF_230V;
	};

	return (
		<select
			id={id}
			name={id}
			value={value}
			onChange={(e) => {
				if (onChange) onChange(e.target.value, getVrefFromPole(e.target.value));
			}}
			style={{ ...style }}
		>
			<option value={""}>-</option>
			{allowedPoles.map((pole, i) => (
				<option key={i} value={pole.key}>
					{pole.name}
				</option>
			))}
		</select>
	);
}
