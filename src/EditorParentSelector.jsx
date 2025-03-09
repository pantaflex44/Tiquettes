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

import {Fragment} from "react";

export default function EditorParentSelector({id, value, currentModuleId, filteredModulesListBySchemaFuncs, schemaFunctions, onChange = null}) {
    return <select id={id} name={id} value={value}
                   onChange={(e) => {
                       if (onChange) onChange(e.target.value)
                   }}>
        <option value={""}>- aucun -</option>
        {Object.entries(filteredModulesListBySchemaFuncs)
            .map(([k, l]) => {
                return (
                    <Fragment key={k}>
                        <option value="" disabled={true}>{schemaFunctions[k].name}</option>
                        {l
                            .map((module) => (
                                currentModuleId !== module.id
                                    ? <option key={module.id}
                                              value={module.id}>{`${module.id} ${module.text ? '- ' + module.text : ''}`.trim()}</option>
                                    : null
                            ))
                            .filter(f => f !== null)}
                    </Fragment>
                )
            })}
    </select>
}