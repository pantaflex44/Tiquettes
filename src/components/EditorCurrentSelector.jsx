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

export default function EditorCurrentSelector({
	id,
	value,
	allowed = [
		"2A",
		"6A",
		"10A",
		"15A",
		"16A",
		"20A",
		"25A",
		"30A",
		"32A",
		"40A",
		"45A",
		"50A",
		"60A",
		"63A",
		"80A",
		"90A",
		"100A",
		"125A",
		"160A",
		"180A",
		"240A",
		"250A",
	],
	onChange = null,
}) {
	return (
		<select
			id={id}
			name={id}
			value={value}
			onChange={(e) => {
				if (onChange) onChange(e.target.value);
			}}
		>
			<option value={""}>-</option>
			{allowed.map((a) => (
				<option key={a} value={a}>
					{a}
				</option>
			))}
		</select>
	);
}
