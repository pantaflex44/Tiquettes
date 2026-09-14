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

import { polesCounter } from "../others/functions.js";

export default function EditorPoleSelector({
	id,
	parentModule,
	source,
	value,
	allowed = ["1P+N", "2P", "3P", "3P+N", "4P"],
	style = {},
	onChange = null,
}) {
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
	]
		.filter((p) => allowed.includes(p.key))
		.filter((currentPole) => {
			const p = polesCounter(currentPole.key);
			if (!parentModule?.pole) {
				const sourcePole = source?.pole
					? polesCounter(source.pole.trim().toUpperCase())
					: 4;
				return p <= sourcePole;
			} else {
				const parentPole = polesCounter(parentModule.pole.trim().toUpperCase());
				return p <= parentPole;
			}
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
