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

export default function EditorAssociateAccessories({
	id,
	currentModuleId,
	currentModuleFunc,
	filteredModulesListBySchemaFuncs,
	getModuleById,
	onChange = null,
}) {
	const currentModule = getModuleById(currentModuleId);

	const getCurrentAssociate = () => {
		return currentModule?.associateId ?? "";
	};
	const [currentAssociate, setCurrentAssociate] = useState(
		getCurrentAssociate(currentModuleId),
	);

	const filteredAllowedAssociates = useMemo(() => {
		let allowedAssociates = {};
		Object.entries(filteredModulesListBySchemaFuncs).forEach(([k, l]) => {
			const allowedAccessories = schemaFunctions[k]?.allowedAccessories ?? [];
			l.forEach((module) => {
				if (
					module.id !== currentModuleId &&
					allowedAccessories.includes(currentModuleFunc)
				) {
					allowedAssociates = {
						...allowedAssociates,
						[k]: [...(allowedAssociates[k] ?? []), module],
					};
				}
			});
		});
		return allowedAssociates;
	}, [currentModuleId, filteredModulesListBySchemaFuncs]);

	return (
		<select
			id={id}
			name={id}
			value={currentAssociate}
			onChange={(e) => {
				setCurrentAssociate(e.target.value);
				if (onChange) onChange(e.target.value);
			}}
			style={{ flex: 1 }}
		>
			{/* Aucun associé */}
			<option value={""}>- aucun -</option>

			{/* Modules */}
			{Object.entries(filteredAllowedAssociates).map(([k, l]) => {
				return (
					<Fragment key={k}>
						<option value={""} disabled={true}>
							{schemaFunctions[k].name}
						</option>
						{l
							.map((module, _i) =>
								currentModuleId !== module.id ? (
									<option key={`${module.id}-${_i}`} value={module.id}>
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
