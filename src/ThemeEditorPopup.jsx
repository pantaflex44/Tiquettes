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

/* eslint-disable react/prop-types */
import {useMemo, useRef, useState} from "react";

import Popup from "./Popup.jsx";
import Module from "./Module.jsx";
import VerticalRule from "./VerticalRule.jsx";
import IconSelector from "./IconSelector.jsx";

import importIcon from './assets/upload.svg';
import exportIcon from './assets/download.svg';
import undoIcon from './assets/undo.svg';
import upIcon from './assets/caret-up.svg';
import downIcon from './assets/caret-down.svg';
import textColorIcon from './assets/text-color.svg';
import iconColorIcon from './assets/icon-color.svg';
import backColorIcon from './assets/paint.svg';
import boldIcon from './assets/bold.svg';
import italicIcon from './assets/italic.svg';
import alignLeftIcon from './assets/align-left.svg';
import alignCenterIcon from './assets/align-center.svg';
import alignRightIcon from './assets/align-right.svg';

import './themeEditorPopup.css';
import * as pkg from "../package.json";
import sanitizeFilename from "sanitize-filename";

export default function ThemeEditorPopup({
                                             switchboard,
                                             stepSize,
                                             heightMin,
                                             heightMax,
                                             onCancel,
                                             onApply,
                                             theme
                                         }) {


    const defaultTheme = {
        "title": "Mon nouveau thème",
        "name": "custom",
        "default": false,
        "group": "Créations",
        "data": {
            "id": {
                "shown": true,
                "position": "top",
                "fullHeight": false,
                "lineCount": 1,
                "horizontalAlignment": "center",
                "fontSize": "2.4mm",
                "fontWeight": "bold",
                "fontStyle": "normal",
                "fontFamily": "sans-serif",
                "backgroundColor": "transparent",
                "color": "#000000"
            },
            "icon": {
                "shown": true,
                "position": "middle",
                "sizePercent": 50,
                "fullHeight": true,
                "horizontalAlignment": "center",
                "backgoundColor": "transparent",
                "color": "#000000"
            },
            "text": {
                "shown": true,
                "position": "bottom",
                "fullHeight": false,
                "lineCount": 2,
                "horizontalAlignment": "center",
                "fontSize": "2.7mm",
                "fontWeight": "bold",
                "fontStyle": "normal",
                "fontFamily": "sans-serif",
                "backgroundColor": "transparent",
                "color": "#000000"
            }
        }
    };

    const initialTheme = {...theme};
    const [editedTheme, setEditedTheme] = useState({...theme});

    const [sample, setSample] = useState({
        id: 'Q01',
        icon: 'swb_ecl.svg',
        text: "Eclairage chambres",
        height: switchboard.height,
        width: stepSize
    });

    const importRef = useRef();

    const setPosition = (actualId, actualPosition, newId, newPosition) => {
        setEditedTheme(old => ({
            ...old,
            data: {
                ...old.data,
                [actualId]: {...old.data[actualId], position: newPosition},
                [newId]: {...old.data[newId], position: actualPosition}
            }
        }));
    };

    const invertPosition = (actualId, actualPosition, newPosition) => {
        const found = Object.entries(editedTheme.data).filter((k) => k[1].position === newPosition);
        if (found.length === 1 && found[0][1].shown) {
            setPosition(actualId, actualPosition, found[0][0], newPosition);
            return true;
        }
        return false;
    };

    const up = (el) => {
        let actualPosition = editedTheme.data[el]?.position;
        if (actualPosition !== 'top' && actualPosition !== 'bottom' && actualPosition !== 'middle') actualPosition = 'top';
        if (actualPosition === 'middle') {
            invertPosition(el, actualPosition, 'top');
        } else if (actualPosition === 'bottom') {
            if (!invertPosition(el, actualPosition, 'middle')) invertPosition(el, actualPosition, 'top');
        }
    };

    const down = (el) => {
        let actualPosition = editedTheme.data[el]?.position;
        if (actualPosition !== 'top' && actualPosition !== 'bottom' && actualPosition !== 'middle') actualPosition = 'bottom';
        if (actualPosition === 'middle') {
            invertPosition(el, actualPosition, 'bottom');
        } else if (actualPosition === 'top') {
            if (!invertPosition(el, actualPosition, 'middle')) invertPosition(el, actualPosition, 'bottom');
        }
    };

    const shown = useMemo(() => ({
        id: (editedTheme.data.id?.shown ?? true) === true,
        icon: (editedTheme.data.icon?.shown ?? true) === true,
        text: (editedTheme.data.text?.shown ?? true) === true
    }), [editedTheme.data]);
    const shownCount = useMemo(() => ([shown.id ? 1 : 0, shown.icon ? 1 : 0, shown.text ? 1 : 0].reduce((acc, cur) => acc + cur, 0)), [shown]);
    const positions = useMemo(() => {
        let idPosition = (editedTheme.data.id?.position ?? 'top');
        let iconPosition = (editedTheme.data.icon?.position ?? 'middle');
        let textPosition = (editedTheme.data.text?.position ?? 'bottom');
        if (idPosition !== 'top' && idPosition !== 'middle' && idPosition !== 'bottom') idPosition = 'top';
        if (iconPosition !== 'top' && iconPosition !== 'middle' && iconPosition !== 'bottom') iconPosition = 'middle';
        if (textPosition !== 'top' && textPosition !== 'middle' && textPosition !== 'bottom') textPosition = 'bottom';

        let idOrder = idPosition === 'bottom' ? 2 : (idPosition === 'middle' ? 1 : 0);
        let iconOrder = iconPosition === 'bottom' ? 2 : (iconPosition === 'middle' ? 1 : 0);
        let textOrder = textPosition === 'bottom' ? 2 : (textPosition === 'middle' ? 1 : 0);

        let pos = Object.entries({id: idOrder, icon: iconOrder, text: textOrder});
        pos.sort((a, b) => a[1] < b[1] ? -1 : 1);
        pos = Object.fromEntries(pos
            .map((obj) => shown[obj[0]] === true ? obj[0] : null)
            .filter((key) => key !== null)
            .map((obj, idx) => [obj, {order: idx, shown: true}])
        );

        if (!pos.id) pos = {...pos, id: {shown: false}};
        if (!pos.icon) pos = {...pos, icon: {shown: false}};
        if (!pos.text) pos = {...pos, text: {shown: false}};

        return pos;
    }, [editedTheme.data, shown]);

    const prepareTheme = (t) => Object.keys(defaultTheme)
        .reduce(function (accumulator, key) {
            accumulator[key] = t[key]
            return accumulator
        }, {});

    return <Popup
        title={editedTheme?.title ?? "Créer mon thème"}
        showCloseButton={true}
        onCancel={() => onCancel()}
        onOk={() => onApply(editedTheme)}
        showOkButton={true}
        width={800}
        additionalButtons={[
            {
                text: (
                    <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', columnGap: '0.5rem'}}
                         title={"Importer un thème"}>
                        <img src={importIcon} alt={"Importer"} width={18} height={18}/>
                        <input type={'file'} id={'importTheme'} ref={importRef} style={{display: 'none'}}/>
                    </div>
                ),
                title: "Importer",
                callback: () => {
                    const el = document.getElementById('importTheme');
                    if (el) {
                        el.onchange = (e) => {
                            if (e.target.files && e.target.files.length > 0 && e.target.files[0]) {
                                const fileReader = new FileReader();
                                fileReader.readAsText(e.target.files[0], 'UTF-8');
                                fileReader.onload = (e) => {
                                    try {
                                        let et = prepareTheme(JSON.parse(e.target.result));
                                        et = {
                                            ...et,
                                            "name": defaultTheme.name,
                                            "default": defaultTheme.default,
                                            "group": defaultTheme.group
                                        };

                                        if (!et.data || !et.data?.id || !et.data?.icon || !et.data?.text) {
                                            throw new Error("Malformated theme - Bad structure");
                                        }

                                        if (!('shown' in et.data.id) || !('shown' in et.data.icon) || !('shown' in et.data.text)) {
                                            throw new Error("Malformated theme - Missing properties");
                                        }

                                        setEditedTheme(et);
                                    } catch (err) {
                                        console.error(err);
                                        alert("Impossible d'importer ce thème.");
                                    } finally {
                                        importRef.current.value = null;
                                    }
                                };
                            } else {
                                importRef.current.value = null;
                                alert("Aucun thème à importer.")
                            }
                        };
                        el.click();
                    }
                }
            },
            {
                text: (
                    <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', columnGap: '0.5rem'}}
                         title={"Exporter ce thème"}>
                        <img src={exportIcon} alt={"Exporter"} width={18} height={18}/>
                    </div>
                ),
                title: "Exporter",
                callback: () => {
                    try {
                        const defaultTitle = "Mon nouveau thème";
                        let title = prompt("Nom de votre nouveau thème :", defaultTitle);
                        if (typeof title !== 'string') return;
                        title = title.trim();
                        if (title === "") title = defaultTitle;

                        setEditedTheme(old => {
                            const et = prepareTheme({...old, title});

                            const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(JSON.stringify(et))}`;
                            const link = document.createElement("a");
                            link.href = jsonString;
                            link.download = `${sanitizeFilename(title.toLowerCase())}.json`;
                            link.click();

                            return et;
                        });
                    } catch (err) {
                        console.error(err);
                        alert("Impossible d'exporter ce thème.");
                    }
                }
            },
            {
                text: (
                    <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', columnGap: '0.5rem'}}
                         title={"Annuler les modifications"}>
                        <img src={undoIcon} alt={"Recharger"} width={18} height={18}/>
                        <span className={'additional_buttons_text'}>Thème par défaut</span>
                    </div>
                ),
                title: "Thème par défaut",
                callback: () => {
                    if (confirm("Êtes-vous certain de vouloir annuler vos modifications?")) setEditedTheme({...initialTheme});
                }
            },
        ]}
    >
        <div className={'tep-grid'}>
            <h5>Données de démonstration</h5>
            <div className={'tep-top'}>
                <div className={'tep-preview'} style={{width: `calc(${sample.width}mm + 1px + 50px)`}}>
                    <div className={'tep-module'} style={{
                        width: `calc(${sample.width}mm + 1px)`,
                        minHeight: `calc(${sample.height}mm + 1mm)`,
                        height: `calc(${sample.height}mm + 1mm)`,
                        maxHeight: `calc(${sample.height}mm + 1mm)`,
                    }}>
                        <Module
                            isDemo={true}
                            item={{
                                id: sample.id,
                                icon: sample.icon,
                                text: sample.text,
                                free: false,
                                span: 1
                            }}
                            modulePosition={1}
                            rowPosition={1}
                            theme={editedTheme}
                            style={{
                                "--h": `calc(${sample.height}mm + 1mm)`,
                                "--sw": `calc(${sample.width}mm + 1px)`
                            }}
                        />
                    </div>
                    <VerticalRule size={sample.height}/>
                </div>
                <div className={'tep-sample'} style={{}}>
                    <div className="tep-row" style={{
                        '--left_column_size': '100px',
                        marginTop: 0
                    }}>
                        <label htmlFor={'sample_id'}>Identifiant</label>
                        <div className="popup_row-flex">
                            <input
                                type="text"
                                name="sample_id"
                                id={'sample_id'}
                                value={sample.id}
                                onChange={(e) => {
                                    setSample(old => ({...old, id: e.target.value}));
                                }}
                            />
                        </div>
                    </div>
                    <div className="tep-row" style={{
                        alignItems: 'center',
                        '--left_column_size': '100px',
                    }}>
                        <label>Pictogramme</label>
                        <IconSelector value={sample.icon} onChange={(selectedIcon, selected) => {
                            setSample(old => ({...old, icon: selectedIcon}));
                        }}
                        />
                    </div>
                    <div className="tep-row" style={{
                        '--left_column_size': '100px',
                        width: '100%',
                    }}>
                        <label htmlFor={'sample_text'}>Libellé</label>
                        <textarea
                            name="sample_text"
                            id={'sample_text'}
                            value={sample.text}
                            onChange={(e) => {
                                setSample(old => ({...old, text: e.target.value}));
                            }}
                            rows={3}
                        />
                    </div>
                    <div className="tep-row" style={{
                        '--left_column_size': '100px',
                        width: '100%',
                        alignItems: 'center',
                        marginBottom: '2rem'
                    }}>
                        <label htmlFor={'sample_height'}>Hauteur</label>
                        <input
                            name="sample_height"
                            id={'sample_height'}
                            type="range" min={heightMin} max={heightMax} step={1}
                            value={sample.height} onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (value >= heightMin) setSample(old => ({...old, height: value}));
                        }}
                            style={{width: 'initial', margin: 0, padding: 0}}/>
                    </div>
                </div>
            </div>
            <div style={{}} className={'tep-settings'}>
                <div className={'tep-settings_column'}>
                    <h5>
                        <input type={'checkbox'} checked={positions.id.shown}
                               title={"Afficher l'identifiant"}
                               onChange={(e) => setEditedTheme(old => ({
                                   ...old,
                                   data: {...old.data, id: {...(old.data.id ?? {}), shown: e.target.checked}}
                               }))}/>
                        <img src={upIcon} alt={"Remonter"} width={16} height={16}
                             className={!positions.id.shown || positions.id.order <= 0 ? 'disabled' : null}
                             style={{cursor: 'pointer'}} onClick={() => up('id')}/>
                        <img src={downIcon} alt={"Descendre"} width={16} height={16}
                             className={!positions.id.shown || positions.id.order >= shownCount - 1 ? 'disabled' : null}
                             style={{cursor: 'pointer'}} onClick={() => down('id')}/>
                        <span>Identifiant</span>
                    </h5>

                    {!positions.id.shown ? <span className={'tep-settings_hidden'}>Masqué</span> : <>
                        <div className={'tep-settings_row'}>
                            <label htmlFor={'tep-id-fullheight'}>Utiliser toute la hauteur disponible:</label>
                            <input type={'checkbox'} checked={editedTheme.data.id?.fullHeight ?? false}
                                   id={'tep-id-fullheight'}
                                   name={'tep-id-fullheight'}
                                   onChange={(e) => setEditedTheme(old => ({
                                       ...old,
                                       data: {...old.data, id: {...(old.data.id ?? {}), fullHeight: e.target.checked}}
                                   }))}/>
                        </div>

                        <div className={'tep-settings_row'}>
                            <label htmlFor={'tep-id-lineCount'}>Nombre de lignes:</label>
                            <input type={'number'} value={editedTheme.data.id?.lineCount ?? 1} min={1} max={5} step={1}
                                   id={'tep-id-lineCount'}
                                   name={'tep-id-lineCount'}
                                   onChange={(e) => setEditedTheme(old => ({
                                       ...old,
                                       data: {...old.data, id: {...(old.data.id ?? {}), lineCount: e.target.value}}
                                   }))}/>
                        </div>

                        <div className={'tep-settings_row'}>
                            <div className={'tep-settings_row-el'}>
                                <img src={alignLeftIcon} alt={"Alignement à gauche"} width={16} height={16}/>
                                <input type={'checkbox'}
                                       checked={(editedTheme.data.id?.horizontalAlignment ?? 'center') === 'left'}
                                       id={'tep-id-horizontalAlignmentLeft'}
                                       name={'tep-id-horizontalAlignmentLeft'}
                                       onChange={(e) => setEditedTheme(old => ({
                                           ...old,
                                           data: {
                                               ...old.data,
                                               id: {
                                                   ...(old.data.id ?? {}),
                                                   horizontalAlignment: e.target.checked ? 'left' : old.data.id?.horizontalAlignment
                                               }
                                           }
                                       }))}
                                       title={"Alignement à gauche"}
                                />
                            </div>
                            <div className={'tep-settings_row-el'}>
                                <img src={alignCenterIcon} alt={"Alignement au centre"} width={16} height={16}/>
                                <input type={'checkbox'}
                                       checked={(editedTheme.data.id?.horizontalAlignment ?? 'center') === 'center'}
                                       id={'tep-id-horizontalAlignmentCenter'}
                                       name={'tep-id-horizontalAlignmentCenter'}
                                       onChange={(e) => setEditedTheme(old => ({
                                           ...old,
                                           data: {
                                               ...old.data,
                                               id: {
                                                   ...(old.data.id ?? {}),
                                                   horizontalAlignment: e.target.checked ? 'center' : old.data.id?.horizontalAlignment
                                               }
                                           }
                                       }))}
                                       title={"Alignement au centre"}
                                />
                            </div>
                            <div className={'tep-settings_row-el'}>
                                <img src={alignRightIcon} alt={"Alignement à droite"} width={16} height={16}/>
                                <input type={'checkbox'}
                                       checked={(editedTheme.data.id?.horizontalAlignment ?? 'center') === 'right'}
                                       id={'tep-id-horizontalAlignmentRight'}
                                       name={'tep-id-horizontalAlignmentRight'}
                                       onChange={(e) => setEditedTheme(old => ({
                                           ...old,
                                           data: {
                                               ...old.data,
                                               id: {
                                                   ...(old.data.id ?? {}),
                                                   horizontalAlignment: e.target.checked ? 'right' : old.data.id?.horizontalAlignment
                                               }
                                           }
                                       }))}
                                       title={"Alignement à droite"}
                                />
                            </div>
                        </div>

                        <div className={'tep-settings_row'}>
                            <select id={'tep-id-fontFamily'}
                                    name={'tep-id-fontFamily'}
                                    value={editedTheme.data.id?.fontFamily ?? 'sans-serif'}
                                    onChange={(e) => setEditedTheme(old => ({
                                        ...old,
                                        data: {
                                            ...old.data,
                                            id: {...(old.data.id ?? {}), fontFamily: e.target.value}
                                        }
                                    }))}
                                    style={{flex: 1}}
                            >
                                <option>serif</option>
                                <option>sans-serif</option>
                                <option>monospace</option>
                                <option>cursive</option>
                            </select>
                            <input type={'number'}
                                   value={(editedTheme.data.id?.fontSize ?? '2.4mm').replaceAll('mm', '')} min={2.0}
                                   max={4.0} step={0.1}
                                   id={'tep-id-fontSize'}
                                   name={'tep-id-fontSize'}
                                   onChange={(e) => setEditedTheme(old => ({
                                       ...old,
                                       data: {
                                           ...old.data,
                                           id: {...(old.data.id ?? {}), fontSize: `${e.target.value}mm`}
                                       }
                                   }))}/>
                        </div>

                        <div className={'tep-settings_row'}>
                            <div className={'tep-settings_row-el'}>
                                <img src={backColorIcon} alt={"Couleur du fond"} width={16} height={16}/>
                                <input type={'color'} value={editedTheme.data.id?.backgroundColor ?? '#ffffff'}
                                       id={'tep-id-backgroundColor'}
                                       name={'tep-id-backgroundColor'}
                                       onChange={(e) => setEditedTheme(old => ({
                                           ...old,
                                           data: {
                                               ...old.data,
                                               id: {...(old.data.id ?? {}), backgroundColor: e.target.value}
                                           }
                                       }))}
                                       title={"Couleur du fond"}
                                />
                            </div>
                            <div className={'tep-settings_row-el'}>
                                <img src={textColorIcon} alt={"Couleur du texte"} width={16} height={16}/>
                                <input type={'color'} value={editedTheme.data.id?.color ?? '#000000'}
                                       id={'tep-id-color'}
                                       name={'tep-id-color'}
                                       onChange={(e) => setEditedTheme(old => ({
                                           ...old,
                                           data: {...old.data, id: {...(old.data.id ?? {}), color: e.target.value}}
                                       }))}
                                       title={"Couleur du texte"}
                                />
                            </div>
                            <div className={'tep-settings_row-el'}>
                                <img src={boldIcon} alt={"Texte gras"} width={16} height={16}/>
                                <input type={'checkbox'}
                                       checked={(editedTheme.data.id?.fontWeight ?? 'normal') === 'bold'}
                                       id={'tep-id-fontWeight'}
                                       name={'tep-id-fontWeight'}
                                       onChange={(e) => setEditedTheme(old => ({
                                           ...old,
                                           data: {
                                               ...old.data,
                                               id: {
                                                   ...(old.data.id ?? {}),
                                                   fontWeight: e.target.checked ? 'bold' : 'normal'
                                               }
                                           }
                                       }))}
                                       title={"Texte gras"}
                                />
                            </div>
                            <div className={'tep-settings_row-el'}>
                                <img src={italicIcon} alt={"Texte italique"} width={16} height={16}/>
                                <input type={'checkbox'}
                                       checked={(editedTheme.data.id?.fontStyle ?? 'normal') === 'italic'}
                                       id={'tep-id-fontStyle'}
                                       name={'tep-id-fontStyle'}
                                       onChange={(e) => setEditedTheme(old => ({
                                           ...old,
                                           data: {
                                               ...old.data,
                                               id: {
                                                   ...(old.data.id ?? {}),
                                                   fontStyle: e.target.checked ? 'italic' : 'normal'
                                               }
                                           }
                                       }))}
                                       title={"Texte italique"}
                                />
                            </div>
                        </div>
                    </>}


                </div>
                <div className={'tep-settings_column'}>
                    <h5>
                        <input type={'checkbox'} checked={positions.icon.shown}
                               title={"Afficher le pictogramme"}
                               onChange={(e) => setEditedTheme(old => ({
                                   ...old,
                                   data: {...old.data, icon: {...(old.data.icon ?? {}), shown: e.target.checked}}
                               }))}/>
                        <img src={upIcon} alt={"Remonter"} width={16} height={16}
                             className={!positions.icon.shown || positions.icon.order <= 0 ? 'disabled' : null}
                             style={{cursor: 'pointer'}} onClick={() => up('icon')}/>
                        <img src={downIcon} alt={"Descendre"} width={16} height={16}
                             className={!positions.icon.shown || positions.icon.order >= shownCount - 1 ? 'disabled' : null}
                             style={{cursor: 'pointer'}} onClick={() => down('icon')}/>
                        <span>Pictogramme</span>
                    </h5>

                    {!positions.icon.shown ? <span className={'tep-settings_hidden'}>Masqué</span> : <>
                        <div className={'tep-settings_row'}>
                            <label htmlFor={'tep-icon-fullheight'}>Utiliser toute la hauteur disponible:</label>
                            <input type={'checkbox'} checked={editedTheme.data.icon?.fullHeight ?? false}
                                   id={'tep-icon-fullheight'}
                                   name={'tep-icon-fullheight'}
                                   title={"Afficher l'identifiant"}
                                   onChange={(e) => setEditedTheme(old => ({
                                       ...old,
                                       data: {
                                           ...old.data,
                                           icon: {...(old.data.icon ?? {}), fullHeight: e.target.checked}
                                       }
                                   }))}/>
                        </div>
                        <div className={'tep-settings_row'}>
                            <label htmlFor={'tep-icon-fullheight'}>Taille:</label>
                            <input type={'range'} value={editedTheme.data.icon?.sizePercent ?? 50} min={0} max={100}
                                   id={'tep-icon-sizePercent'}
                                   name={'tep-icon-sizePercent'}
                                   title={"Taille de l'icone"}
                                   onChange={(e) => setEditedTheme(old => ({
                                       ...old,
                                       data: {
                                           ...old.data,
                                           icon: {...(old.data.icon ?? {}), sizePercent: parseInt(e.target.value)}
                                       }
                                   }))}/>
                            <span style={{fontSize: 'small'}}>{`${editedTheme.data.icon?.sizePercent ?? 50}%`}</span>
                        </div>

                        <div className={'tep-settings_row'}>
                            <div className={'tep-settings_row-el'}>
                                <img src={alignLeftIcon} alt={"Alignement à gauche"} width={16} height={16}/>
                                <input type={'checkbox'}
                                       checked={(editedTheme.data.icon?.horizontalAlignment ?? 'center') === 'left'}
                                       id={'tep-icon-horizontalAlignmentLeft'}
                                       name={'tep-icon-horizontalAlignmentLeft'}
                                       onChange={(e) => setEditedTheme(old => ({
                                           ...old,
                                           data: {
                                               ...old.data,
                                               icon: {
                                                   ...(old.data.icon ?? {}),
                                                   horizontalAlignment: e.target.checked ? 'left' : old.data.icon?.horizontalAlignment
                                               }
                                           }
                                       }))}
                                       title={"Alignement à gauche"}
                                />
                            </div>
                            <div className={'tep-settings_row-el'}>
                                <img src={alignCenterIcon} alt={"Alignement au centre"} width={16} height={16}/>
                                <input type={'checkbox'}
                                       checked={(editedTheme.data.icon?.horizontalAlignment ?? 'center') === 'center'}
                                       id={'tep-icon-horizontalAlignmentCenter'}
                                       name={'tep-icon-horizontalAlignmentCenter'}
                                       onChange={(e) => setEditedTheme(old => ({
                                           ...old,
                                           data: {
                                               ...old.data,
                                               icon: {
                                                   ...(old.data.icon ?? {}),
                                                   horizontalAlignment: e.target.checked ? 'center' : old.data.icon?.horizontalAlignment
                                               }
                                           }
                                       }))}
                                       title={"Alignement au centre"}
                                />
                            </div>
                            <div className={'tep-settings_row-el'}>
                                <img src={alignRightIcon} alt={"Alignement à droite"} width={16} height={16}/>
                                <input type={'checkbox'}
                                       checked={(editedTheme.data.icon?.horizontalAlignment ?? 'center') === 'right'}
                                       id={'tep-icon-horizontalAlignmentRight'}
                                       name={'tep-icon-horizontalAlignmentRight'}
                                       onChange={(e) => setEditedTheme(old => ({
                                           ...old,
                                           data: {
                                               ...old.data,
                                               icon: {
                                                   ...(old.data.icon ?? {}),
                                                   horizontalAlignment: e.target.checked ? 'right' : old.data.icon?.horizontalAlignment
                                               }
                                           }
                                       }))}
                                       title={"Alignement à droite"}
                                />
                            </div>
                        </div>

                        <div className={'tep-settings_row'}>
                            <div className={'tep-settings_row-el'}>
                                <img src={backColorIcon} alt={"Couleur du fond"} width={16} height={16}/>
                                <input type={'color'} value={editedTheme.data.icon?.backgroundColor ?? '#ffffff'}
                                       id={'tep-icon-backgroundColor'}
                                       name={'tep-icon-backgroundColor'}
                                       onChange={(e) => setEditedTheme(old => ({
                                           ...old,
                                           data: {
                                               ...old.data,
                                               icon: {...(old.data.icon ?? {}), backgroundColor: e.target.value}
                                           }
                                       }))}
                                       title={"Couleur du fond"}
                                />
                            </div>
                            <div className={'tep-settings_row-el'}>
                                <img src={iconColorIcon} alt={"Couleur de l'icône"} width={16} height={16}/>
                                <input type={'color'} value={editedTheme.data.icon?.color ?? '#000000'}
                                       id={'tep-icon-color'}
                                       name={'tep-icon-color'}
                                       onChange={(e) => setEditedTheme(old => ({
                                           ...old,
                                           data: {...old.data, icon: {...(old.data.icon ?? {}), color: e.target.value}}
                                       }))}
                                       title={"Couleur de l'icône"}
                                />
                            </div>
                        </div>
                    </>}
                </div>
                <div className={'tep-settings_column'}>
                    <h5>
                        <input type={'checkbox'} checked={positions.text.shown}
                               title={"Afficher le libellé"}
                               onChange={(e) => setEditedTheme(old => ({
                                   ...old,
                                   data: {...old.data, text: {...(old.data.text ?? {}), shown: e.target.checked}}
                               }))}/>
                        <img src={upIcon} alt={"Remonter"} width={16} height={16}
                             className={!positions.text.shown || positions.text.order <= 0 ? 'disabled' : null}
                             style={{cursor: 'pointer'}} onClick={() => up('text')}/>
                        <img src={downIcon} alt={"Descendre"} width={16} height={16}
                             className={!positions.text.shown || positions.text.order >= shownCount - 1 ? 'disabled' : null}
                             style={{cursor: 'pointer'}} onClick={() => down('text')}/>
                        <span>Libellé</span>
                    </h5>

                    {!positions.text.shown ? <span className={'tep-settings_hidden'}>Masqué</span> : <>
                        <div className={'tep-settings_row'}>
                            <label htmlFor={'tep-text-fullheight'}>Utiliser toute la hauteur disponible:</label>
                            <input type={'checkbox'} checked={editedTheme.data.text?.fullHeight ?? false}
                                   id={'tep-text-fullheight'}
                                   name={'tep-text-fullheight'}
                                   onChange={(e) => setEditedTheme(old => ({
                                       ...old,
                                       data: {
                                           ...old.data,
                                           text: {...(old.data.text ?? {}), fullHeight: e.target.checked}
                                       }
                                   }))}/>
                        </div>

                        <div className={'tep-settings_row'}>
                            <label htmlFor={'tep-text-lineCount'}>Nombre de lignes:</label>
                            <input type={'number'} value={editedTheme.data.text?.lineCount ?? 1} min={1} max={5}
                                   step={1}
                                   id={'tep-text-lineCount'}
                                   name={'tep-text-lineCount'}
                                   onChange={(e) => setEditedTheme(old => ({
                                       ...old,
                                       data: {...old.data, text: {...(old.data.text ?? {}), lineCount: e.target.value}}
                                   }))}/>
                        </div>

                        <div className={'tep-settings_row'}>
                            <div className={'tep-settings_row-el'}>
                                <img src={alignLeftIcon} alt={"Alignement à gauche"} width={16} height={16}/>
                                <input type={'checkbox'}
                                       checked={(editedTheme.data.text?.horizontalAlignment ?? 'center') === 'left'}
                                       id={'tep-text-horizontalAlignmentLeft'}
                                       name={'tep-text-horizontalAlignmentLeft'}
                                       onChange={(e) => setEditedTheme(old => ({
                                           ...old,
                                           data: {
                                               ...old.data,
                                               text: {
                                                   ...(old.data.text ?? {}),
                                                   horizontalAlignment: e.target.checked ? 'left' : old.data.text?.horizontalAlignment
                                               }
                                           }
                                       }))}
                                       title={"Alignement à gauche"}
                                />
                            </div>
                            <div className={'tep-settings_row-el'}>
                                <img src={alignCenterIcon} alt={"Alignement au centre"} width={16} height={16}/>
                                <input type={'checkbox'}
                                       checked={(editedTheme.data.text?.horizontalAlignment ?? 'center') === 'center'}
                                       id={'tep-text-horizontalAlignmentCenter'}
                                       name={'tep-text-horizontalAlignmentCenter'}
                                       onChange={(e) => setEditedTheme(old => ({
                                           ...old,
                                           data: {
                                               ...old.data,
                                               text: {
                                                   ...(old.data.text ?? {}),
                                                   horizontalAlignment: e.target.checked ? 'center' : old.data.text?.horizontalAlignment
                                               }
                                           }
                                       }))}
                                       title={"Alignement au centre"}
                                />
                            </div>
                            <div className={'tep-settings_row-el'}>
                                <img src={alignRightIcon} alt={"Alignement à droite"} width={16} height={16}/>
                                <input type={'checkbox'}
                                       checked={(editedTheme.data.text?.horizontalAlignment ?? 'center') === 'right'}
                                       id={'tep-text-horizontalAlignmentRight'}
                                       name={'tep-text-horizontalAlignmentRight'}
                                       onChange={(e) => setEditedTheme(old => ({
                                           ...old,
                                           data: {
                                               ...old.data,
                                               text: {
                                                   ...(old.data.text ?? {}),
                                                   horizontalAlignment: e.target.checked ? 'right' : old.data.text?.horizontalAlignment
                                               }
                                           }
                                       }))}
                                       title={"Alignement à droite"}
                                />
                            </div>
                        </div>

                        <div className={'tep-settings_row'}>
                            <select id={'tep-text-fontFamily'}
                                    name={'tep-text-fontFamily'}
                                    value={editedTheme.data.text?.fontFamily ?? 'sans-serif'}
                                    onChange={(e) => setEditedTheme(old => ({
                                        ...old,
                                        data: {
                                            ...old.data,
                                            text: {...(old.data.text ?? {}), fontFamily: e.target.value}
                                        }
                                    }))}
                                    style={{flex: 1}}
                            >
                                <option>serif</option>
                                <option>sans-serif</option>
                                <option>monospace</option>
                                <option>cursive</option>
                            </select>
                            <input type={'number'}
                                   value={(editedTheme.data.text?.fontSize ?? '2.4mm').replaceAll('mm', '')} min={2.0}
                                   max={4.0} step={0.1}
                                   id={'tep-text-fontSize'}
                                   name={'tep-text-fontSize'}
                                   onChange={(e) => setEditedTheme(old => ({
                                       ...old,
                                       data: {
                                           ...old.data,
                                           text: {...(old.data.text ?? {}), fontSize: `${e.target.value}mm`}
                                       }
                                   }))}/>
                        </div>

                        <div className={'tep-settings_row'}>
                            <div className={'tep-settings_row-el'}>
                                <img src={backColorIcon} alt={"Couleur du fond"} width={16} height={16}/>
                                <input type={'color'} value={editedTheme.data.text?.backgroundColor ?? '#ffffff'}
                                       id={'tep-text-backgroundColor'}
                                       name={'tep-text-backgroundColor'}
                                       onChange={(e) => setEditedTheme(old => ({
                                           ...old,
                                           data: {
                                               ...old.data,
                                               text: {...(old.data.text ?? {}), backgroundColor: e.target.value}
                                           }
                                       }))}
                                       title={"Couleur du fond"}
                                />
                            </div>
                            <div className={'tep-settings_row-el'}>
                                <img src={textColorIcon} alt={"Couleur du texte"} width={16} height={16}/>
                                <input type={'color'} value={editedTheme.data.text?.color ?? '#000000'}
                                       id={'tep-text-color'}
                                       name={'tep-text-color'}
                                       onChange={(e) => setEditedTheme(old => ({
                                           ...old,
                                           data: {...old.data, text: {...(old.data.text ?? {}), color: e.target.value}}
                                       }))}
                                       title={"Couleur du texte"}
                                />
                            </div>
                            <div className={'tep-settings_row-el'}>
                                <img src={boldIcon} alt={"Texte gras"} width={16} height={16}/>
                                <input type={'checkbox'}
                                       checked={(editedTheme.data.text?.fontWeight ?? 'normal') === 'bold'}
                                       id={'tep-text-fontWeight'}
                                       name={'tep-text-fontWeight'}
                                       onChange={(e) => setEditedTheme(old => ({
                                           ...old,
                                           data: {
                                               ...old.data,
                                               text: {
                                                   ...(old.data.text ?? {}),
                                                   fontWeight: e.target.checked ? 'bold' : 'normal'
                                               }
                                           }
                                       }))}
                                       title={"Texte gras"}
                                />
                            </div>
                            <div className={'tep-settings_row-el'}>
                                <img src={italicIcon} alt={"Texte italique"} width={16} height={16}/>
                                <input type={'checkbox'}
                                       checked={(editedTheme.data.text?.fontStyle ?? 'normal') === 'italic'}
                                       id={'tep-text-fontStyle'}
                                       name={'tep-text-fontStyle'}
                                       onChange={(e) => setEditedTheme(old => ({
                                           ...old,
                                           data: {
                                               ...old.data,
                                               text: {
                                                   ...(old.data.text ?? {}),
                                                   fontStyle: e.target.checked ? 'italic' : 'normal'
                                               }
                                           }
                                       }))}
                                       title={"Texte italique"}
                                />
                            </div>
                        </div>
                    </>}

                </div>
            </div>
        </div>
    </Popup>
}