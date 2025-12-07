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

/* eslint-disable react/prop-types */

import {useMemo} from "react";

import schemaFunctions from './schema_functions.json';

export default function SchemaSymbol({
                                         switchboard,
                                         module,
                                         onEdit = null,
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
        const isContact = func === 'k';

        if (!schemaFunctions[func] && !isContact) return null;

        let obj = schemaFunctions[func];
        if (isContact) {
            obj = {name: "Contacteur", hasPole: true, hasCurrent: true, hasWire: true};
        }

        const name = obj?.name ?? "";
        const titleErrors = monitor.errors && monitor.errors[module.id] ? "\r\n\r\n⚠ : " + monitor.errors[module.id].join("\r\n⚠ : ") : "";
        const titleInfos = monitor.infos && monitor.infos[module.id] ? "\r\n\r\n🛈 " + monitor.infos[module.id].join("\r\n🛈 ") : "";
        const title = `${module.id} / ${name}: ${module.text}${titleErrors}${titleInfos}`.trim();
        const icon = `${import.meta.env.BASE_URL}schema_${func}.svg`;

        return {obj, name, title, icon, isDb, isContact};
    }, [module]);

    const handleEdit = () => {
        if (onEdit) onEdit(module);
    }

    return func && (
        <div style={{"--symbol-width": '70px',"--symbol-height": '100px'}} className={`schemaItemSymbol ${!func.isDb ? 'editable' : ''}`}
             title={func.title}
             onClick={() => handleEdit()}>
            <img className="schemaItemSymbolImg" src={func.icon} alt={func.name} width={70} height={100}/>
            <div className="schemaItemSymbolId">{module.id}</div>
            {module.line && <div className="schemaItemSymbolLine">L{module.line}</div>}

            {func.obj?.hasType &&
                <div className="schemaItemSymbolType">{module.type ? 'Type' : ''} {module.type}<br/>{module.sensibility}
                </div>}

            <div
                className="schemaItemSymbolCurrent">{((func.obj?.hasCrb && module.crb ? `${module.crb} ` : '') + (func.obj?.hasCurrent && module.current ? module.current : '')).trim()}</div>

            {func.obj?.hasPole && module.pole && (
                <>
                    <div className="schemaItemSymbolPole">{module.pole}</div>
                    <img className="schemaItemSymbolImgPole"
                         src={`${import.meta.env.VITE_APP_BASE}schema_${module.pole}.svg`} alt={module.pole}
                         width={11}/>
                </>
            )}

            {monitor.errors && monitor.errors[module.id] &&
                <img className="schemaItemSymbolWarning notprintable"
                     src={`${import.meta.env.BASE_URL}schema_warning.svg`}
                     alt="Erreur"/>}
        </div>
    );
}