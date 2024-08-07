import { useEffect, useMemo, useRef, useState } from 'react';

import './module.css';
import themesList from './themes.json';

import editIcon from './assets/edit.svg';
import shrinkIcon from './assets/minus.svg';
import growIcon from './assets/plus.svg';
import copyIcon from './assets/copy.svg';
import pasteIcon from './assets/paste.svg';
import leftIcon from './assets/left.svg';
import rightIcon from './assets/right.svg';
import cancelredIcon from './assets/x.svg';

/* eslint-disable react/prop-types */
function Module({
    item,
    rowPosition = 1,
    modulePosition = 1,
    theme,
    style = {},
    shrinkAllowed = null,
    growAllowed = null,
    moveLeftAllowed = null,
    moveRightAllowed = null,
    pasteAllowed = null,
    onGrow = null,
    onShrink = null,
    onClear = null,
    onCopy = null,
    onEdit = null,
    onPaste = null,
    cancelPaste = null,
    onMoveLeft = null,
    onMoveRight = null,
    printFreeModuleAllowed = null,
    isDemo = false,
    hasClipboard = false
}) {
    const moduleRef = useRef();

    const isFree = useMemo(() => !isDemo && item.free, [isDemo, item.free]);
    const canPaste = useMemo(() => !isDemo && item.free && hasClipboard && (pasteAllowed && pasteAllowed(item)), [hasClipboard, isDemo, item, pasteAllowed]);
    const canEdit = useMemo(() => !isDemo && onEdit && !item.free, [isDemo, item.free, onEdit]);
    const canCopy = useMemo(() => !isDemo && onCopy && !item.free, [isDemo, item.free, onCopy]);
    const canTransform = useMemo(() => (!isDemo && (((moveLeftAllowed && moveLeftAllowed(item)) || (moveRightAllowed && moveRightAllowed(item)) || (shrinkAllowed && shrinkAllowed(item)) || (growAllowed && growAllowed(item))))), [growAllowed, isDemo, item, moveLeftAllowed, moveRightAllowed, shrinkAllowed]);


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

    }, [beforeUpdate, item, style, currentTheme, themeUpdated, canPaste]);

    return item && <div
        className={`module ${item.free ? 'free' : ''} ${item.free && (import.meta.env.VITE_DEFAULT_PRINT_EMPTY !== 'true' || !printFreeModuleAllowed()) ? 'noprint' : ''} ${hasClipboard && !canPaste ? 'disabled' : ''}`.trim()}
        id={`module_${rowPosition}_${modulePosition}`}
        data-row={rowPosition}
        style={{
            ...style,
            "--sw": `calc((${style['--sw']} * ${item.span}) + ((1px * ${item.span})  - 1px))`,
            color: item.free ? 'darkgray' : 'black'
        }}
        tabIndex={!canPaste && !hasClipboard ? 0 : null}
        title={`(${item.id}) R${rowPosition} | P${modulePosition} | L${item.span}`}
        ref={moduleRef}
        data-id={`${rowPosition}-${modulePosition}`}
        onKeyUp={(e) => {
            if (!isDemo) {
                if (e.key === 'ArrowLeft' && moveLeftAllowed && moveLeftAllowed(item)) {
                    onMoveLeft(item);
                } else if (e.key === 'ArrowRight' && moveRightAllowed(item)) {
                    onMoveRight(item);
                } else if (e.key === '+' && growAllowed(item)) {
                    onGrow(item);
                } else if (e.key === '-' && shrinkAllowed(item)) {
                    onShrink(item);
                } else if (e.key === 'Delete' && !item.free) {
                    onClear(item);
                } else if (e.key === 'Enter') {
                    onEdit(item);
                }
            }
        }}>

        {isFree && !canPaste && !hasClipboard
            ? <img className="module_iconfree" src={editIcon} title="Editer le module" alt="Editer le module" onClick={() => onEdit(item)} />
            : (!isFree
                ? themedModule
                : <div style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #f0f0f0 1px, transparent 0)', backgroundPosition: '4px 2px', backgroundSize: '6px 6px', width: '100%', height: '100%' }}></div>
            )
        }

        {!hasClipboard && canTransform && <div className="module_top">
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
        
        {canPaste && <div className="module_top button">
            <div className="tool paste" title="Coller ici ou [Echap] pour annuler" onClick={() => onPaste(item)}><img src={pasteIcon} alt="Coller" width={18} height={18} style={{ marginTop: '2px' }} /><span>Coller ici</span></div>
        </div>}

        {!hasClipboard && (canEdit || canCopy) && <div className="module_bottom">
            {onCopy && <div className="tool copy" title="Copier ce module" onClick={() => onCopy(item)}><img src={copyIcon} alt="Copier" width={14} height={14} style={{ marginTop: '2px' }} /></div>}
            {canEdit && <div className="tool edit" title="Editer [Entrée]" onClick={() => onEdit(item)}><img src={editIcon} alt="Editer" width={20} height={20} /></div>}
        </div>}

        {canPaste && <div className="module_bottom">
            <div className="tool paste" title="Cliquer ici ou [Echap] pour annuler" onClick={() => cancelPaste()}><img src={cancelredIcon} alt="Annuler" width={16} height={16} style={{ marginTop: '2px' }} /></div>
        </div>}

    </div>;
}

export default Module;