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
import ThemeEditorPartColumn from "./ThemeEditorPartColumn.jsx";

import importIcon from './assets/upload.svg';
import exportIcon from './assets/download.svg';
import undoIcon from './assets/undo.svg';
import borderNoneIcon from './assets/border-none.svg';
import borderBottomIcon from './assets/border-bottom.svg';

import sanitizeFilename from "sanitize-filename";

import './themeEditorPopup.css';
import alignLeftIcon from "./assets/align-left.svg";

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
            },
            "top": {
                "border": "none",
            },
            "bottom": {
                "border": "none",
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
    }), [editedTheme.data.icon?.shown, editedTheme.data.id?.shown, editedTheme.data.text?.shown]);
    const shownCount = useMemo(() => ([shown.id ? 1 : 0, shown.icon ? 1 : 0, shown.text ? 1 : 0].reduce((acc, cur) => acc + cur, 0)), [shown.icon, shown.id, shown.text]);
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
    }, [editedTheme.data.icon?.position, editedTheme.data.id?.position, editedTheme.data.text?.position, shown]);

    const prepareTheme = (t) => Object.keys(defaultTheme)
        .reduce(function (accumulator, key) {
            accumulator[key] = t[key]
            return accumulator
        }, {});

    return <Popup
        title={theme?.title ?? "Créer mon thème"}
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
                <div className={'tep-border'} style={{
                    minHeight: `calc(${sample.height}mm + 1mm)`,
                    height: `calc(${sample.height}mm + 1mm)`,
                    maxHeight: `calc(${sample.height}mm + 1mm)`,
                }}>
                    <div className={'tep-settings_row'} style={{width: '100%'}}>
                        <div className={'tep-settings_row-el'}>
                            <img src={borderBottomIcon} alt={"Ajouter un séparateur haut"} width={16} height={16}/>
                            <input type={'checkbox'}
                                   checked={(editedTheme.data.top?.border ?? 'none') !== 'none'}
                                   id={'tep-top-border'}
                                   name={'tep-top-border'}
                                   onChange={(e) => setEditedTheme(old => ({
                                       ...old,
                                       data: {
                                           ...old.data,
                                           top: {
                                               ...(old.data.top ?? {}),
                                               border: e.target.checked ? '' : 'none'
                                           },
                                       }
                                   }))}
                                   title={"Ajouter un séparateur haut"}
                            />
                        </div>
                        <div className={'tep-settings_row-el'}>
                            <input type={'color'} value={((editedTheme.data.top?.border ?? 'none') === 'none') ? '#eeeeee' : (editedTheme.data.top?.borderColor ?? '#000000')} disabled={(editedTheme.data.top?.border ?? 'none') === 'none'}
                                   id={'tep-top-borderColor'}
                                   name={'tep-top-borderColor'}
                                   onChange={(e) => setEditedTheme(old => ({
                                       ...old,
                                       data: {
                                           ...old.data,
                                           top: {
                                               ...(old.data.top ?? {}),
                                               borderColor: e.target.value
                                           },
                                       }
                                   }))}
                                   title={"Couleur de la bordure"}
                            />
                        </div>
                        <div className={'tep-settings_row-el'}>
                            <select id={'tep-top-borderSize'}  disabled={(editedTheme.data.top?.border ?? 'none') === 'none'}
                                    name={'tep-top-borderSize'}
                                    value={editedTheme.data.top?.borderSize ?? 1}
                                    onChange={(e) => setEditedTheme(old => ({
                                        ...old,
                                        data: {
                                            ...old.data,
                                            top: {
                                                ...(old.data.top ?? {}),
                                                borderSize: e.target.value
                                            },
                                        }
                                    }))}
                            >
                                <option>1</option>
                                <option>2</option>
                                <option>3</option>
                                <option>4</option>
                                <option>5</option>
                            </select>
                        </div>
                    </div>
                </div>
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
            <div className={'tep-settings'}>
                <ThemeEditorPartColumn propName={'id'}
                                       title={"Identifiant"}
                                       editedTheme={editedTheme}
                                       setEditedTheme={setEditedTheme}
                                       positions={positions}
                                       shownCount={shownCount}
                                       down={down}
                                       up={up}/>
                <ThemeEditorPartColumn propName={'icon'}
                                       title={"Pictogramme"}
                                       editedTheme={editedTheme}
                                       setEditedTheme={setEditedTheme}
                                       positions={positions}
                                       shownCount={shownCount}
                                       down={down}
                                       up={up}/>
                <ThemeEditorPartColumn propName={'text'}
                                       title={"Libellé"}
                                       editedTheme={editedTheme}
                                       setEditedTheme={setEditedTheme}
                                       positions={positions}
                                       shownCount={shownCount}
                                       down={down}
                                       up={up}/>
            </div>
        </div>
    </Popup>
}