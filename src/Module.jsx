import './module.css';

import editIcon from './assets/edit.svg';
import shrinkIcon from './assets/minus.svg';
import growIcon from './assets/plus.svg';
import trashIcon from './assets/trash.svg';
import leftIcon from './assets/left.svg';
import rightIcon from './assets/right.svg';
import { useRef } from 'react';

/* eslint-disable react/prop-types */
function Module({
    item,
    rowPosition,
    modulePosition,
    style = {},
    shrinkAllowed = null,
    growAllowed = null,
    moveLeftAllowed = null,
    moveRightAllowed = null,
    onGrow = null,
    onShrink = null,
    onClear = null,
    onEdit = null,
    onMoveLeft = null,
    onMoveRight = null
}) {
    const moduleRef = useRef();

    return item && <div className="module" data-row={rowPosition} style={{
        ...style,
        "--sw": `calc(${style['--sw']} * ${item.span})`,
        color: item.free ? 'darkgray' : 'black'
    }}
        tabIndex="0"
        title={`(${item.id}) R${rowPosition} | P${modulePosition} | L${item.span}`}
        ref={moduleRef}
        data-id={`${rowPosition}-${modulePosition}`}
        onKeyUp={(e) => {
            if (e.key === 'ArrowLeft' && moveLeftAllowed(item)) {
                onMoveLeft(item);
            } else if (e.key === 'ArrowRight' && moveRightAllowed(item)) {
                onMoveRight(item);
            } else if (e.key === '+' && growAllowed(item)) {
                onGrow(item);
            } else if (e.key === '-' && shrinkAllowed(item)) {
                onShrink(item);
            } else if (e.key === 'Delete' && !item.free) {
                if (confirm("Êtes-vous certain de vouloir libérer ce module?")) { onClear(item); }
            } else if (e.key === 'Enter') {
                onEdit(item);
            }
        }}>

        {!item.free && item.showId
            ? <div className="module_title">{item.id}</div>
            : <div>&nbsp;</div>
        }

        {!item.free && item.showIcon && item.icon && <img className="module_icon" src={`${import.meta.env.VITE_APP_BASE}${item.icon}`} style={{ width: `calc(${style['--h']} * 0.25)`, height: `calc(${style['--h']} * 0.25)` }} />}
        {item.free && <img className="module_iconfree" src={editIcon} title="Editer le module" onClick={() => onEdit(item)} />}

        {!item.free && item.showText
            ? <div className="module_text" style={{ backgroundColor: item.bgcolor, color: item.fgcolor, height: `calc(${style['--h']} * 0.29)` }} dangerouslySetInnerHTML={{ __html: item.text.replaceAll("\n", "<br />") }}></div>
            : <div className="module_text">&nbsp;</div>
        }

        {((moveLeftAllowed(item) || moveRightAllowed(item) || shrinkAllowed(item) || growAllowed(item))) && <div className="module_top">
            <div className="top_row">
                <div className="tool left" title="Décaler vers la gauche [←]" onClick={() => onMoveLeft(item, moduleRef)} data-disabled={!moveLeftAllowed(item)}><img src={leftIcon} alt="" width={15} height={15} /></div>
                <div className="tool shrink" title="Largeur -1 [-]" onClick={() => onShrink(item, moduleRef)} data-disabled={!shrinkAllowed(item)}><img src={shrinkIcon} alt="" width={15} height={15} /></div>
            </div>
            <div className="top_row">
                <div className="tool right" title="Décaler vers la droite [→]" onClick={() => onMoveRight(item, moduleRef)} data-disabled={!moveRightAllowed(item)}><img src={rightIcon} alt="" width={15} height={15} /></div>
                <div className="tool grow" title="Largeur +1 [+]" onClick={() => onGrow(item, moduleRef)} data-disabled={!growAllowed(item)}><img src={growIcon} alt="" width={15} height={15} /></div>
            </div>
            {item.span > 1 && <div className="top_row"><div className="tool size" title={`Largeur: ${item.span} modules`}>R{rowPosition}<br />L{item.span}<br />P{modulePosition}</div></div>}
        </div>}

        {!item.free && <div className="module_bottom">
            <div className="tool clear" title="Libérer [Suppr]" onClick={() => { if (confirm("Êtes-vous certain de vouloir libérer ce module?")) { onClear(item); } }} data-disabled={item.free}><img src={trashIcon} alt="" width={17} height={17} /></div>
            <div className="tool edit" title="Editer [Entrée]" onClick={() => onEdit(item)}><img src={editIcon} alt="" width={18} height={18} /></div>
        </div>}

    </div>;
}

export default Module;