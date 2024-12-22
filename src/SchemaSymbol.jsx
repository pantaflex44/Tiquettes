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

export default function SchemaSymbol({
                                         module,
                                         schemaFunctions,
                                         onEdit = null,
                                         isLast = false,
                                         monitor = {}
                                     }) {
    const func = useMemo(() => {
        if (!module?.func) return null;

        let func = module?.func;
        let isDb = false;
        if (func === 'db') {
            func = 'dd';
            isDb = true;
        }

        if (!schemaFunctions[func]) return null;

        return {name: func, isDb};
    }, [module]);

    const handleEdit = () => {
        if (onEdit) onEdit(module);
    }

    return func && (
        <div className={`schemaItemSymbol ${!func.isDb ? 'editable' : ''}`} title={schemaFunctions[func.name].name + (monitor.errors && monitor.errors[module.id] ? "\r\n\r\n⚠ : " + monitor.errors[module.id].join("\r\n⚠ : ") : "") + (monitor.infos && monitor.infos[module.id] && !(monitor.errors && monitor.errors[module.id]) ? "\r\n\r\n🛈 " + monitor.infos[module.id].join("\r\n🛈 ") : "")} onClick={() => handleEdit()}>
            <img className="schemaItemSymbolImg" src={`${import.meta.env.BASE_URL}schema_${func.name}.svg`} alt={schemaFunctions[func.name].name} width={70} height={100}/>
            <div className="schemaItemSymbolId">{module.id}</div>

            {schemaFunctions[func.name]?.hasType && <div className="schemaItemSymbolType">{module.type ? 'Type' : ''} {module.type}<br/>{module.sensibility}</div>}

            <div className="schemaItemSymbolCurrent">{((schemaFunctions[func.name]?.hasCrb && module.crb ? `${module.crb} ` : '') + (schemaFunctions[func.name]?.hasCurrent && module.current ? module.current : '')).trim()}</div>

            {schemaFunctions[func.name]?.hasPole && module.pole && (
                <>
                    <div className="schemaItemSymbolPole">{module.pole}</div>
                    <img className="schemaItemSymbolImgPole" src={`${import.meta.env.VITE_APP_BASE}schema_${module.pole}.svg`} alt={module.pole} width={11}/>
                </>
            )}

            {monitor.errors && monitor.errors[module.id] && <img className="schemaItemSymbolWarning" src={`${import.meta.env.BASE_URL}schema_warning.svg`} alt="Erreur"/>}
        </div>
    );
}