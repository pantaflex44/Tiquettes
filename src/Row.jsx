import './row.css';

import Module from "./Module";

/* eslint-disable react/prop-types */
function Row({
    index,
    items,
    style = {},
    onModuleGrow = null,
    onModuleShrink = null,
    moduleGrowAllowed = null,
    moduleShrinkAllowed = null,
    onModuleClear = null,
    onModuleEdit = null
}) {
    return (
        <div className="switchboard_row">
            <div className="row_title">Rangée {index}</div>
            <div className="row" style={style}>
                {items.map((item, i) => (
                    <Module
                        key={i}
                        item={item}
                        modulePosition={i + 1}
                        rowPosition={index}
                        style={{
                            "--h": style['--h'],
                            "--sw": style['--sw']
                        }}
                        onGrow={(item) => onModuleGrow(i, item)}
                        onShrink={(item) => onModuleShrink(i, item)}
                        onClear={(item) => onModuleClear(i, item)}
                        onEdit={(item) => onModuleEdit(i, item)}
                        shrinkAllowed={(item) => moduleShrinkAllowed(i, item)}
                        growAllowed={(item) => moduleGrowAllowed(i, item)}
                    />
                ))}
            </div>
        </div>
    );
}

export default Row;