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

import { useMemo } from "react";

export default function SchemaDescription({
    switchboard,
    module
}) {
    const getModuleById = (moduleId) => {
        let indexes = { row: -1, module: -1 };
        let m = { module: null, indexes };

        switchboard.rows.forEach((row, ri) => {
            row.forEach((module, mi) => {
                if (!m.module && module.id === moduleId && !module.free) {
                    m = { ...m, module, indexes: { ...indexes, row: ri, module: mi } };
                }
            })
        });

        return m;
    }

    const infos = useMemo(() => {
        let icon = module.icon;
        let text = module.text ?? "";
        let wire = module.wire ?? "";
        let pole = module.pole ?? "";

        /*const parentModule = getModuleById(module.parentId).module;
        if (module.func === 'kc' && parentModule) {
            icon = parentModule.icon;
            text = parentModule.text;
            pole = parentModule.pole;
            wire = parentModule.wire;
        }*/

        /*if (module.func === 'k' && parentModule) {
            icon = module.icon;
            text = module.text;
            pole = module.pole;
            wire = module.wire;
        }*/

        return { text, icon, wire, pole };
    }, [module]);

    return (
        /*<div className="schemaItemLast">*/
        <>
            <div className="schemaItemLastWire">{infos.wire ? `${infos.wire} mm²` : ""}</div>
            {infos.icon && (
                <div className="schemaItemLastIconContainer" title={infos.text}>
                    <img
                        alt="Pictogramme"
                        width={24}
                        height={24}
                        src={`${import.meta.env.VITE_APP_BASE}${infos.icon}`}
                        className="schemaItemLastIcon"
                    />
                </div>
            )}
            <div className="schemaItemLastText">{infos.text}</div>
        </>
        /*</div>*/
    );
}