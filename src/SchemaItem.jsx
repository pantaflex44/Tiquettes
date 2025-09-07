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

import "./schema.css";

import {Fragment} from "react";

import SchemaSymbol from "./SchemaSymbol.jsx";
import SchemaDescription from "./SchemaDescription.jsx";

import firstIcon from "./assets/caret-down-light.svg";

export default function SchemaItem({
                                       switchboard,
                                       baseId = null,
                                       isFirst = false,
                                       childs,
                                       onEditSymbol,
                                       monitor = {}
                                   }) {

    return Object.entries(childs ?? {}).map(([id, item], j) => (
        <Fragment key={id}>
            <div className={`schemaItem ${isFirst ? 'isFirst' : ''} ${item.isLast ? 'isLast' : ''}`.trim()}>
                {isFirst && <img className="schemaItemFirstIcon" src={firstIcon}/>}

                {(isFirst || (item.hasPrev || item.hasNext)) && <div
                    className={`schemaItemPrevLine ${!item.hasNext ? 'noNext' : ''} ${!item.hasPrev && !isFirst ? 'noPrev' : ''}`.trim()}></div>}

                {item.hasNext && <div className="schemaItemNextLine"></div>}

                <SchemaSymbol switchboard={switchboard} isLast={item.isLast} module={item.module}
                              onEdit={(module) => onEditSymbol(module)}
                              monitor={monitor}/>

                {item.isLast ? (
                    <SchemaDescription switchboard={switchboard} module={item.module}/>
                ) : (
                    <div className="schemaItemChilds">
                        <SchemaItem switchboard={switchboard} childs={item.childs}
                                    baseId={baseId ?? item.module.id} onEditSymbol={(module) => onEditSymbol(module)}
                                    monitor={monitor}/>
                    </div>
                )}
            </div>

            {isFirst && j < Object.keys(childs).length - 1 && <div className="schemaItemSeparator"></div>}
        </Fragment>
    ))
}