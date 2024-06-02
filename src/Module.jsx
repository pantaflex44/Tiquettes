import { useEffect, useRef, useState } from 'react';

import './module.css';
import themesList from './themes.json';

import editIcon from './assets/edit.svg';
import shrinkIcon from './assets/minus.svg';
import growIcon from './assets/plus.svg';
import trashIcon from './assets/trash.svg';
import leftIcon from './assets/left.svg';
import rightIcon from './assets/right.svg';
/*import hourglass from './assets/hourglass.svg';

import Hager1Theme from './themes/hgr1/Content';
import Hager2Theme from './themes/hgr2/Content';
import Hager3Theme from './themes/hgr3/Content';
import Hager4Theme from './themes/hgr4/Content';

import Legrand1Theme from './themes/lgrd1/Content';
import Legrand2Theme from './themes/lgrd2/Content';
import Legrand3Theme from './themes/lgrd3/Content';
import Legrand4Theme from './themes/lgrd4/Content';

import Schneider1Theme from './themes/schn1/Content';
import Schneider2Theme from './themes/schn2/Content';
import Schneider3Theme from './themes/schn3/Content';
import Schneider4Theme from './themes/schn4/Content';

import SimpleTheme from './themes/simple/Content';
import MinimalTheme from './themes/minimal/Content';*/

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

    const [themedModule, setThemedModule] = useState(null);
    const [beforeUpdate, setBeforeUpdate] = useState(null);

    useEffect(() => {
        const defaultThemeName = themesList.filter((t) => t.default)[0].name;
        const update = JSON.stringify(item);

        const getTheme = (name) => import(`./themes/${name}/Content.jsx`);
        const applyTheme = (Content) => {
            setThemedModule(() => {
                setBeforeUpdate(update);

                return (Content ? (
                    <Content
                        item={item}
                        style={style}
                    />
                ) : null);
            });
        }


        if (item?.theme?.name && beforeUpdate !== update) {
            getTheme(item.theme.name)
                .then((selectedTheme) => applyTheme(selectedTheme.default))
                .catch(() => {
                    getTheme(defaultThemeName)
                        .then((defaultTheme) => applyTheme(defaultTheme.default))
                        .catch((err) => {
                            console.error(err);
                        });
                });
        }

    }, [beforeUpdate, item, style]);

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

        {item.free
            ? <img className="module_iconfree" src={editIcon} title="Editer le module" onClick={() => onEdit(item)} />
            : themedModule
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