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

import {cloneElement, useEffect, useMemo, useRef, useState} from 'react';

import './module.css';
import themesList from './themes.json';

import editIcon from './assets/edit.svg';
import shrinkIcon from './assets/minus.svg';
import growIcon from './assets/plus.svg';
import copyIcon from './assets/copy.svg';
import cutIcon from './assets/cut.svg';
import pasteIcon from './assets/paste.svg';
import leftIcon from './assets/left.svg';
import rightIcon from './assets/right.svg';
import cancelredIcon from './assets/x.svg';
import halfLeftIcon from './assets/half-left.svg';
import halfRightIcon from './assets/half-right.svg';
import noHalfIcon from './assets/no-half.svg';

/* eslint-disable react/prop-types */
function Module({
                    item,
                    rowPosition = 1,
                    modulePosition = 1,
                    theme,
                    clipboard,
                    clipboardMode,
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
                    onCut = null,
                    onEdit = null,
                    onPaste = null,
                    onHalf = null,
                    cancelPaste = null,
                    onMoveLeft = null,
                    onMoveRight = null,
                    printFreeModuleAllowed = null,
                    isDemo = false,
                    hasClipboard = false
                }) {
    const moduleRef = useRef(null);

    const isFree = useMemo(() => !isDemo && item.free, [isDemo, item.free]);
    const canPaste = useMemo(() => !isDemo && item.free && hasClipboard && (pasteAllowed && pasteAllowed(item)), [hasClipboard, isDemo, item, pasteAllowed]);
    const canEdit = useMemo(() => !isDemo && onEdit && !item.free, [isDemo, item.free, onEdit]);
    const canCopy = useMemo(() => !isDemo && onCopy && !item.free, [isDemo, item.free, onCopy]);
    const canTransform = useMemo(() => (!isDemo && (((moveLeftAllowed && moveLeftAllowed(item)) || (moveRightAllowed && moveRightAllowed(item)) || (shrinkAllowed && shrinkAllowed(item)) || (growAllowed && growAllowed(item))))), [growAllowed, isDemo, item, moveLeftAllowed, moveRightAllowed, shrinkAllowed]);
    const halfModeLeft = useMemo(() => item.half === "none" || item.half === "right" ? "left" : "none", [item.half]);
    const halfModeRight = useMemo(() => item.half === "none" || item.half === "left" ? "right" : "none", [item.half]);
    const canHalfMode = useMemo(() => !item.free && item.span > 1, [item.free, item.span]);
    const isHalfLeftMode = useMemo(() => item.half === "none" || item.half === "right", [item.half]);
    const isHalfRightMode = useMemo(() => item.half === "none" || item.half === "left", [item.half]);

    const [themedModule, setThemedModule] = useState(null);
    const [beforeUpdate, setBeforeUpdate] = useState(null);

    const [currentTheme, setCurrentTheme] = useState(theme);
    const [themeUpdated, setThemeUpdated] = useState(false);
    useEffect(() => {
        setCurrentTheme((old) => {
            if (JSON.stringify(old) !== JSON.stringify(theme)) {
                setThemeUpdated(true);
                return theme;
            }

            return old;
        });
    }, [theme]);

    useEffect(() => {
        const defaultThemeObj = themesList.filter((t) => t.default)[0];
        const update = JSON.stringify(item);

        const applyTheme = (Content, data) => {
            setThemedModule(() => {
                setBeforeUpdate(update);

                return (Content ? (
                    <Content
                        item={item}
                        data={data}
                    />
                ) : null);
            });
        };

        const themeImport = (data) => {
            import(`./ThemeEngine.jsx`)
                .then((selectedTheme) => applyTheme(selectedTheme.default, data))
                .catch(() => {
                    console.log(`Theme '${currentTheme.name}' error. Default theme will be used.`);
                    import(`./ThemeEngine.jsx`)
                        .then((selectedTheme) => applyTheme(selectedTheme.default, defaultThemeObj.data))
                        .catch((err2) => {
                            console.error(`Unable to load default theme. Error: ${err2}`);
                        });
                });
        };

        if (themeUpdated || beforeUpdate !== update) {
            if (themeUpdated) setThemeUpdated(false);
            themeImport(currentTheme.data);
        }

    }, [beforeUpdate, item, style, currentTheme, themeUpdated, canPaste]);


    return item && <div
        className={`module ${item.free ? 'free' : ''} ${item.free && (import.meta.env.VITE_DEFAULT_PRINT_EMPTY !== 'true' || !printFreeModuleAllowed()) ? 'noprint' : ''} ${isDemo ? 'demo' : ''}${hasClipboard && item.free && !canPaste ? 'disabled' : ''}`.trim()}
        id={`module_${rowPosition}_${modulePosition}`}
        data-row={rowPosition}
        style={{
            ...style,
            "--sw": `calc((${style['--sw']} * ${item.span}) + ((1px * ${item.span})  - 1px))`,
            "--nsw": style['--sw'],
            color: item.free ? 'darkgray' : 'black',
            overflowX: isDemo ? 'hidden' : 'initial',
            cursor: canPaste ? 'pointer' : 'default',
        }}
        tabIndex={!canPaste && !hasClipboard ? 0 : null}
        title={!isDemo ? (canPaste ? "Coller ici" : "Cliquer sur le crayon pour éditer ce module...") : "Module de démonstration"}
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
        }}
        onClick={() => {
            if (canPaste) onPaste(item);
        }}
    >

        {canPaste
            ?
            <img className="module_iconfree" src={pasteIcon} style={{width: '50%'}} title="Coller ici" alt="Coller ici"
                 onClick={() => onPaste(item)}/>
            : (isFree && !canPaste && !hasClipboard
                    ? <img className="module_iconfree" src={editIcon} title="Cliquer pour éditer ce module..."
                           alt="Editer ce module"
                           onClick={() => onEdit(item)}/>
                    : (!isFree && themedModule
                        ? <div
                            className={`module_content half-${item.half} ${currentTheme?.data?.top?.border === true ? 'withTopSeparator' : ''} ${currentTheme?.data?.bottom?.border === true ? 'withBottomSeparator' : ''} ${hasClipboard && clipboard?.id === item.id ? 'clipboard_me' : ''} ${hasClipboard && !canPaste ? 'disabled' : ''}`.trim()}
                            style={{
                                width: isDemo ? 'calc(100% + 1px)' : (`calc(100% - (${item.half === "none" ? '0px' : `calc(${style['--sw']} / 2)`}))`),
                                minWidth: isDemo ? 'calc(100% + 1px)' : (`calc(100% - (${item.half === "none" ? '0px' : `calc(${style['--sw']} / 2)`}))`),
                                maxWidth: isDemo ? 'calc(100% + 1px)' : (`calc(100% - (${item.half === "none" ? '0px' : `calc(${style['--sw']} / 2)`}))`),
                                marginLeft: item.half === "left" ? `calc(${style['--sw']} / 2)` : '0px',
                                marginRight: item.half === "right" ? `calc(${style['--sw']} / 2)` : '0px',
                                borderLeftWidth: item.half === "left" ? '1px' : '0px',
                                borderRightWidth: item.half === "right" ? '1px' : '0px',
                                cursor: canEdit ? 'pointer' : 'default',
                                '--topSeparatorStyle': currentTheme?.data?.top?.border === true ? (currentTheme?.data?.top?.borderStyle ?? 'solid') : 'initial',
                                '--topSeparatorSize': currentTheme?.data?.top?.border === true ? `${currentTheme?.data?.top?.borderSize ?? 1}px` : 'initial',
                                '--topSeparatorColor': currentTheme?.data?.top?.border === true ? (currentTheme?.data?.top?.borderColor ?? '#000000') : 'initial',
                                '--bottomSeparatorStyle': currentTheme?.data?.bottom?.border === true ? (currentTheme?.data?.bottom?.borderStyle ?? 'solid') : 'initial',
                                '--bottomSeparatorSize': currentTheme?.data?.bottom?.border === true ? `${currentTheme?.data?.bottom?.borderSize ?? 1}px` : 'initial',
                                '--bottomSeparatorColor': currentTheme?.data?.bottom?.border === true ? (currentTheme?.data?.bottom?.borderColor ?? '#000000') : 'initial',
                            }}
                            onClick={() => {
                                if (canEdit) onEdit(item)
                            }}
                            title={"Cliquer pour éditer ce module..."}
                        >{
                            cloneElement(themedModule,
                                {
                                    style: {...style},
                                }
                            )
                        }</div>
                        : <div style={{
                            backgroundImage: 'radial-gradient(circle at 1px 1px, #f0f0f0 1px, transparent 0)',
                            backgroundPosition: '4px 2px',
                            backgroundSize: '6px 6px',
                            width: '100%',
                            height: '100%'
                        }}></div>)
            )
        }

        {
            !hasClipboard && canTransform && <div className="module_top">
                <div className="top_row">
                    <div className="tool" title="Demi module sur la gauche"
                         onClick={() => onHalf(item, halfModeLeft)}
                         data-disabled={!canHalfMode}><img
                        src={!canHalfMode ? halfLeftIcon : (isHalfLeftMode ? halfLeftIcon : noHalfIcon)}
                        alt="Demi module sur la gauche" width={16} height={16}/></div>
                    <div className="tool shrink" title="Largeur -1 [-]" onClick={() => onShrink(item, moduleRef)}
                         data-disabled={!shrinkAllowed(item)}><img src={shrinkIcon} alt="Réduire" width={15} height={15}/>
                    </div>
                    <div className="tool left" title="Décaler vers la gauche [←]"
                         onClick={() => onMoveLeft(item, moduleRef)} data-disabled={!moveLeftAllowed(item)}><img
                        src={leftIcon} alt="Déplacer vers la gauche" width={15} height={15}/></div>
                </div>
                <div className="top_row">
                    <div className="tool" title="Demi module sur la droite"
                         onClick={() => onHalf(item, halfModeRight)}
                         data-disabled={!canHalfMode}><img
                        src={!canHalfMode ? halfRightIcon : (isHalfRightMode ? halfRightIcon : noHalfIcon)}
                        alt="Demi module sur la droite" width={16} height={16}/></div>
                    <div className="tool grow" title="Largeur +1 [+]" onClick={() => onGrow(item, moduleRef)}
                         data-disabled={!growAllowed(item)}><img src={growIcon} alt="Agrandir" width={15} height={15}/>
                    </div>
                    <div className="tool right" title="Décaler vers la droite [→]"
                         onClick={() => onMoveRight(item, moduleRef)} data-disabled={!moveRightAllowed(item)}><img
                        src={rightIcon} alt="Déplacer vers la droite" width={15} height={15}/></div>
                </div>
                {item.span > 1 && <div className="top_row" style={{flex: 1, marginTop: '4px'}}>
                    <div className="tool size" style={{marginLeft: 'auto', marginRight: '10px'}}
                         title={`Largeur: ${item.span} modules`}><br/>⤚ {item.span} ⤙
                    </div>
                </div>}
            </div>
        }

        {
            !hasClipboard && (canEdit || canCopy) && <div className="module_bottom">
                {onCopy &&
                    <div className="tool copy" title="Copier" onClick={() => onCopy(item)}>
                        <img src={copyIcon}
                             alt="Copier"
                             width={14}
                             height={14}
                             style={{marginTop: '2px', marginLeft: '2px'}}/>
                    </div>}
                {onCopy &&
                    <div className="tool cut" title="Couper" onClick={() => onCut(item)}>
                        <img src={cutIcon}
                             alt="Couper"
                             width={16}
                             height={16}
                             style={{marginTop: '2px', marginLeft: '2px'}}/>
                    </div>}
            </div>
        }

        {
            hasClipboard && clipboard?.id === item.id &&
            <div className="module_bottom paste force_visible" title="Cliquer ici pour annuler">
                <div className="tool paste cancel" onClick={() => cancelPaste()}
                     style={{
                         width: '100%',
                         height: '100%',
                         display: 'inline-flex',
                         flexDirection: 'row',
                         justifyContent: 'center',
                         alignItems: 'center'
                     }}>
                    <img src={cancelredIcon} alt="Annuler" width={16} height={16} style={{marginTop: '-4px'}}/>
                </div>
            </div>
        }

    </div>;
}

export default Module;