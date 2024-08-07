import './row.css';
import rowAddIcon from './assets/row-add.svg';
import rowDeleteIcon from './assets/trash.svg';


import Module from "./Module";

/* eslint-disable react/prop-types */
function Row({
    rowPosition,
    rowIndex,
    items,
    theme,
    style = {},
    onModuleGrow = null,
    onModuleShrink = null,
    moduleGrowAllowed = null,
    moduleShrinkAllowed = null,
    moduleMoveLeftAllowed = null,
    moduleMoveRightAllowed = null,
    onModuleClear = null,
    onModuleEdit = null,
    onModuleCopy = null,
    onModulePaste = null,
    onModuleCancelPaste = null,
    modulePasteAllowed = null,
    onModuleMoveLeft = null,
    onModuleMoveRight = null,
    onRowAddAfter = null,
    onRowDelete = null,
    rowAddAllowed = null,
    rowDeleteAllowed = null,
    printFreeModuleAllowed = null,
    hasClipboard = false
}) {
    return (
        <div className="switchboard_row" id={`row_${rowPosition}`}>

            <div className="row_title">
                <img className={`row_delete_icon ${!rowDeleteAllowed() ? 'disabled' : ''}`} src={rowDeleteIcon} width={20} height={20} alt="Supprimer cette rangée" title="Supprimer cette rangée" onClick={() => { if (confirm(`Supprimer la rangée ${rowPosition} et tout ce qu'elle contient?`)) onRowDelete(rowIndex); }} />
                <span>Rangée {rowPosition}</span>
            </div>
            <div className="row" style={style}>
                {items.map((item, i) => (
                    <Module
                        key={i}
                        item={item}
                        modulePosition={i + 1}
                        rowPosition={rowPosition}
                        theme={theme}
                        style={{
                            "--h": style['--h'],
                            "--sw": style['--sw']
                        }}
                        
                        onGrow={(item, moduleRef) => onModuleGrow(i, item, moduleRef)}
                        onShrink={(item, moduleRef) => onModuleShrink(i, item, moduleRef)}
                        
                        onClear={(item) => onModuleClear(i, item)}
                        onEdit={(item) => onModuleEdit(i, item)}
                        
                        onCopy={(item) => onModuleCopy(i, item)}
                        onPaste={(item) => onModulePaste(i, item)}
                        cancelPaste={() => onModuleCancelPaste()}
                        pasteAllowed={(item) => modulePasteAllowed(i, item)}
                        hasClipboard={hasClipboard}
                        
                        shrinkAllowed={(item) => moduleShrinkAllowed(i, item)}
                        growAllowed={(item) => moduleGrowAllowed(i, item)}
                        
                        moveLeftAllowed={(item) => moduleMoveLeftAllowed(i, item)}
                        moveRightAllowed={(item) => moduleMoveRightAllowed(i, item)}
                        onMoveLeft={(item, moduleRef) => onModuleMoveLeft(i, item, moduleRef)}
                        onMoveRight={(item, moduleRef) => onModuleMoveRight(i, item, moduleRef)}

                        printFreeModuleAllowed={() => printFreeModuleAllowed()}
                        
                    />
                ))}
            </div>
            <div className={`row_add ${!rowAddAllowed() ? 'disabled' : ''}`} title="Insérer une nouvelle rangée">
                <img className="row_add_icon" src={rowAddIcon} width={24} height={24} alt="Ajouter une rangée" onClick={() => onRowAddAfter(rowIndex)} />
                {rowAddAllowed()
                    ? <div className="row_add_info" onClick={() => onRowAddAfter(rowIndex)}>Insérer une nouvelle rangée ici</div>
                    : <div className="row_add_info">Nombre de rangées maximum atteint</div>
                }
                <div className="row_action_line"></div>
            </div>
        </div>
    );
}

export default Row;