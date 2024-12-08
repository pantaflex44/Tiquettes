/* eslint-disable react/prop-types */

import "./Schema.css";

import {Fragment} from "react";

import SchemaSymbol from "./SchemaSymbol.jsx";
import SchemaDescription from "./SchemaDescription.jsx";

import firstIcon from "./assets/caret-down-light.svg";

export default function SchemaItem({
                                       baseId = null,
                                       isFirst = false,
                                       childs,
                                       schemaFunctions,
                                   }) {

    return Object.entries(childs ?? {}).map(([id, item], j) => (
        <Fragment key={id}>
            <div className={`schemaItem ${isFirst ? 'isFirst' : ''} ${item.isLast ? 'isLast' : ''}`.trim()}>
                {isFirst && <img className="schemaItemFirstIcon" src={firstIcon}/>}

                {(isFirst || (item.hasPrev || item.hasNext)) && <div className={`schemaItemPrevLine ${!item.hasNext ? 'noNext' : ''} ${!item.hasPrev && !isFirst ? 'noPrev' : ''}`.trim()}></div>}

                {item.hasNext && <div className="schemaItemNextLine"></div>}

                <SchemaSymbol isLast={item.isLast} module={item.module} schemaFunctions={schemaFunctions}/>

                {item.isLast ? (
                    <SchemaDescription module={item.module}/>
                ) : (
                    <div className="schemaItemChilds">
                        <SchemaItem childs={item.childs} schemaFunctions={schemaFunctions} baseId={baseId ?? item.module.id}/>
                    </div>
                )}
            </div>

            {isFirst && j < Object.keys(childs).length - 1 && <div className="schemaItemSeparator"></div>}
        </Fragment>
    ))
}