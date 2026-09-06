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

import { Fragment, useMemo, useState } from "react";

import schemaFunctions from "../schema_functions.json" with { type: "json" };

export default function EditorParentSelector({
	id,
	currentModuleId,
	filteredModulesListBySchemaFuncs,
	getModuleById,
	sources,
	onParentChange = null,
	onSourceChange = null,
}) {
	const getCurrentParent = (currentModuleId) => {
		const module = getModuleById(currentModuleId);
		if (!module) return "";

		let v = "";
		if (module.parentId !== "") {
			v = JSON.stringify({ type: "module", id: module.parentId });
		} else if (module.srcId !== "") {
			//v = JSON.stringify({ type: "source", id: module.srcId });
		}
		return v;
	};
	const [currentParent, setCurrentParent] = useState(
		getCurrentParent(currentModuleId),
	);

	return (
		<select
			id={id}
			name={id}
			value={currentParent}
			onChange={(e) => {
				const v = e.target.value.trim();
				if (v === "") {
					if (onParentChange) onParentChange("");
				} else {
					const vp = JSON.parse(v);
					if (vp.type === "module") {
						if (onParentChange) onParentChange(vp.id);
					} else if (vp.type === "source") {
						//if (onSourceChange) onSourceChange(vp.id ?? "");
					}
				}
				setCurrentParent(v);
			}}
			style={{ flex: 1 }}
		>
			{/* Aucun parent */}
			<option value={""}>- aucun -</option>

			{/* Sources personnelles */}
			<option value={""} disabled={true}>
				Sources d'alimentations
			</option>
			{/*sources.map((s) => (
				<option
					key={s.trim()}
					value={JSON.stringify({ type: "source", id: s.trim() })}
				>
					{s.trim()}
				</option>
			))*/}

			{/* Modules */}
			{Object.entries(filteredModulesListBySchemaFuncs).map(([k, l]) => {
				return (
					<Fragment key={k}>
						<option value={""} disabled={true}>
							{schemaFunctions[k].name}
						</option>
						{l
							.map((module) =>
								currentModuleId !== module.id ? (
									<option
										key={module.id}
										value={JSON.stringify({ type: "module", id: module.id })}
									>
										{`${module.id} ${module.text ? `- ${module.text}` : ""}`.trim()}
									</option>
								) : null,
							)
							.filter((f) => f !== null)}
					</Fragment>
				);
			})}
		</select>
	);
}
