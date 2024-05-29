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
    moduleMoveLeftAllowed = null,
    moduleMoveRightAllowed = null,
    onModuleClear = null,
    onModuleEdit = null,
    onModuleMoveLeft = null,
    onModuleMoveRight = null
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
                        onGrow={(item, moduleRef) => onModuleGrow(i, item, moduleRef)}
                        onShrink={(item, moduleRef) => onModuleShrink(i, item, moduleRef)}
                        onClear={(item) => onModuleClear(i, item)}
                        onEdit={(item) => onModuleEdit(i, item)}
                        shrinkAllowed={(item) => moduleShrinkAllowed(i, item)}
                        growAllowed={(item) => moduleGrowAllowed(i, item)}
                        moveLeftAllowed={(item) => moduleMoveLeftAllowed(i, item)}
                        moveRightAllowed={(item) => moduleMoveRightAllowed(i, item)}
                        onMoveLeft={(item, moduleRef) => onModuleMoveLeft(i, item, moduleRef)}
                        onMoveRight={(item, moduleRef) => onModuleMoveRight(i, item, moduleRef)}
                    />
                ))}
            </div>
        </div>
    );
}

export default Row;