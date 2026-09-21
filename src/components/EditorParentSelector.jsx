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

import { Fragment, useState } from "react";
import { polesCounter } from "../others/functions.js";

import schemaFunctions from "../schema_functions.json" with { type: "json" };

export default function EditorParentSelector({
	id,
	currentModuleId,
	currentPole,
	filteredModulesListBySchemaFuncs,
	getModuleById,
	sources,
	onParentChange = null,
	onSourceChange = null,
}) {
	const currentModule = getModuleById(currentModuleId);

	const getCurrentParent = () => {
		if (!currentModule) return "";

		let v = "";
		if (currentModule.parentId !== "") {
			v = JSON.stringify({
				type: "module",
				id: currentModule.parentId,
				pole: getModuleById(currentModule.parentId)?.pole ?? "4P",
			});
		} else if (currentModule.srcId !== "") {
			v = JSON.stringify({
				type: "source",
				id: currentModule.srcId,
				pole: sources.find((s) => s.id === currentModule.srcId)?.pole ?? "4P",
			});
		}

		return v;
	};
	const [currentParent, setCurrentParent] = useState(
		getCurrentParent(currentModuleId),
	);

	const isCompatiblePoles = (pole) => {
		const sourcePoles = polesCounter(pole ?? "4P");
		const modulePoles = polesCounter(currentPole ?? "4P");
		if (sourcePoles < modulePoles) return false;
		return true;
	};

	return (
		<select
			id={id}
			name={id}
			value={currentParent}
			onChange={(e) => {
				const v = e.target.value.trim();

				if (v === "") {
					if (onParentChange) onParentChange("");
					if (onSourceChange) onSourceChange("");
				} else {
					const vp = JSON.parse(v);
					if (vp.type === "module") {
						if (onSourceChange) onSourceChange("");
						if (onParentChange) onParentChange(vp.id);
					} else if (vp.type === "source") {
						if (onParentChange) onParentChange("");
						if (onSourceChange) {
							if (!isCompatiblePoles(vp.pole)) {
								onSourceChange("");
							}
							onSourceChange(vp.id ?? "");
						}
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
			{sources.map((s, _i) => {
				if (currentPole && !isCompatiblePoles(s.pole)) {
					return null;
				}

				return (
					<option
						key={`${s.id}-${_i}`}
						value={JSON.stringify({ type: "source", id: s.id, pole: s.pole })}
					>
						{s.label}
					</option>
				);
			})}

			{/* Modules */}
			{Object.entries(filteredModulesListBySchemaFuncs).map(([k, l]) => {
				return (
					<Fragment key={k}>
						<option value={""} disabled={true}>
							{schemaFunctions[k].name}
						</option>
						{l
							.map((module, _i) =>
								currentModuleId !== module.id ? (
									<option
										key={`${module.id}-${_i}`}
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
