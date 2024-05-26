import './module.css';

import editIcon from './assets/edit.svg';
import { useEffect } from 'react';

/* eslint-disable react/prop-types */
function Module({
    item,
    rowPosition,
    modulePosition,
    style = {},
    shrinkAllowed = null,
    growAllowed = null,
    onGrow = null,
    onShrink = null,
    onClear = null,
    onEdit = null
}) {
    useEffect(() => {
        function highlightFirstModule() {
            let mds = document.querySelectorAll(`.module[data-row="${rowPosition}"`);
            let previousOffset = 0;
            for (let m of mds) {
                if (m.offsetTop > previousOffset) {
                    previousOffset = m.offsetTop;
                    m.classList.add('first');
                } else {
                    m.classList.remove('first');
                }
            }
        }
        window.addEventListener('resize', highlightFirstModule);
        highlightFirstModule();

        return () => {
            window.removeEventListener('resize', highlightFirstModule);
        }
    }, [rowPosition]);

    return item && <div className="module" data-row={rowPosition} style={{
        ...style,
        "--sw": `calc(${style['--sw']} * ${item.span})`,
        color: item.free ? 'darkgray' : 'black'
    }} tabIndex="0" title={`(${item.id}) R${rowPosition} | P${modulePosition} | L${item.span}`}>

        <div className="toolbox">
            <div className="info title"><div className="tool edit" title="Editer" onClick={() => onEdit(item)}><img src={editIcon} alt="" width={16} height={16} /></div> {item.id}</div>
            <div className="break"></div>
            <div className="info">{`R${rowPosition} / P${modulePosition} / L${item.span}`}</div>
            <div className="break"></div>
            <div className="tool shrink" title="Largeur -1" onClick={() => onShrink(item)} data-disabled={!shrinkAllowed(item)}>➖</div>
            <div className="tool grow" title="Largeur +1" onClick={() => onGrow(item)} data-disabled={!growAllowed(item)}>➕</div>
            <div className="tool clear" title="Libérer" onClick={() => onClear(item)} data-disabled={item.free}>⭕</div>
        </div>

        {!item.free && item.showId
            ? <div className="module_title">{item.id}</div>
            : <div>&nbsp;</div>
        }

        {!item.free && item.showIcon && item.icon && <img className="module_icon" src={`${import.meta.env.VITE_APP_BASE}${item.icon}`} style={{ width: `calc(${style['--h']} * 0.25)`, height: `calc(${style['--h']} * 0.25)` }} />}

        {!item.free && item.showText
            ? <div className="module_text" style={{ backgroundColor: item.bgcolor, color: item.fgcolor, height: `calc(${style['--h']} * 0.29)` }} dangerouslySetInnerHTML={{ __html: item.text.replaceAll("\n", "<br />") }}></div>
            : <div className="module_text">&nbsp;</div>
        }

    </div>;
}

export default Module;