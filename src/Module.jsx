import { useEffect, useRef, useState } from 'react';

import './module.css';
import themesList from './themes.json';

import editIcon from './assets/edit.svg';
import shrinkIcon from './assets/minus.svg';
import growIcon from './assets/plus.svg';
import trashIcon from './assets/trash.svg';
import leftIcon from './assets/left.svg';
import rightIcon from './assets/right.svg';

/* eslint-disable react/prop-types */
function Module({
    item,
    rowPosition,
    modulePosition,
    theme,
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

    const [currentTheme, setCurrentTheme] = useState(theme);
    const [themeUpdated, setThemeUpdated] = useState(false);
    useEffect(() => {
        setCurrentTheme((old) => {
            if (old.name !== theme.name) {
                setThemeUpdated(true);
                return theme;
            }

            return old;
        });
    }, [theme]);

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


        if (themeUpdated || beforeUpdate !== update) {
            if (themeUpdated) setThemeUpdated(false);
            getTheme(currentTheme.name)
                .then((selectedTheme) => applyTheme(selectedTheme.default))
                .catch(() => {
                    getTheme(defaultThemeName)
                        .then((defaultTheme) => applyTheme(defaultTheme.default))
                        .catch((err) => {
                            console.error(err);
                        });
                });
        }

    }, [beforeUpdate, item, style, currentTheme, themeUpdated]);

    return item && <div className={`module ${item.free && import.meta.env.VITE_DEFAULT_PRINT_EMPTY !== 'true' ? 'noprint' : ''}`} id={`module_${rowPosition}_${modulePosition}`} data-row={rowPosition} style={{
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
            ? <img className="module_iconfree" src={editIcon} title="Editer le module" alt="Editer le module" onClick={() => onEdit(item)} />
            : themedModule
        }

        {((moveLeftAllowed(item) || moveRightAllowed(item) || shrinkAllowed(item) || growAllowed(item))) && <div className="module_top">
            <div className="top_row">
                <div className="tool left" title="Décaler vers la gauche [←]" onClick={() => onMoveLeft(item, moduleRef)} data-disabled={!moveLeftAllowed(item)}><img src={leftIcon} alt="Déplacer vers la gauche" width={15} height={15} /></div>
                <div className="tool shrink" title="Largeur -1 [-]" onClick={() => onShrink(item, moduleRef)} data-disabled={!shrinkAllowed(item)}><img src={shrinkIcon} alt="Réduire" width={15} height={15} /></div>
            </div>
            <div className="top_row">
                <div className="tool right" title="Décaler vers la droite [→]" onClick={() => onMoveRight(item, moduleRef)} data-disabled={!moveRightAllowed(item)}><img src={rightIcon} alt="Déplacer vers la droite" width={15} height={15} /></div>
                <div className="tool grow" title="Largeur +1 [+]" onClick={() => onGrow(item, moduleRef)} data-disabled={!growAllowed(item)}><img src={growIcon} alt="Agrandir" width={15} height={15} /></div>
            </div>
            {item.span > 1 && <div className="top_row"><div className="tool size" title={`Largeur: ${item.span} modules`}>R{rowPosition}<br />L{item.span}<br />P{modulePosition}</div></div>}
        </div>}

        {!item.free && <div className="module_bottom">
            <div className="tool clear" title="Libérer [Suppr]" onClick={() => { if (confirm("Êtes-vous certain de vouloir libérer ce module?")) { onClear(item); } }} data-disabled={item.free}><img src={trashIcon} alt="Libérer" width={17} height={17} /></div>
            <div className="tool edit" title="Editer [Entrée]" onClick={() => onEdit(item)}><img src={editIcon} alt="Editer" width={18} height={18} /></div>
        </div>}

    </div>;
}

export default Module;