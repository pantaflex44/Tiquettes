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

import alignLeftIcon from "./assets/align-left.svg";
import alignCenterIcon from "./assets/align-center.svg";
import alignRightIcon from "./assets/align-right.svg";
import backColorIcon from "./assets/paint.svg";
import textColorIcon from "./assets/text-color.svg";
import boldIcon from "./assets/bold.svg";
import italicIcon from "./assets/italic.svg";

export default function TextPartStyleEditor({
                                                positions,
                                                editedTheme,
                                                setEditedTheme,
                                                propName
                                            }) {
    return (!positions[propName].shown ? <span className={'tep-settings_hidden'}>Masqué</span> : <>
        <div className={'tep-settings_row'}>
            <label htmlFor={'tep-id-fullheight'}>Utiliser toute la hauteur disponible:</label>
            <input type={'checkbox'} checked={editedTheme.data[propName]?.fullHeight ?? false}
                   id={'tep-id-fullheight'}
                   name={'tep-id-fullheight'}
                   onChange={(e) => setEditedTheme(old => ({
                       ...old,
                       data: {...old.data, [propName]: {...(old.data[propName] ?? {}), fullHeight: e.target.checked}}
                   }))}/>
        </div>

        <div className={'tep-settings_row'}>
            <label htmlFor={'tep-id-lineCount'}>Nombre de lignes:</label>
            <input type={'number'} value={editedTheme.data[propName]?.lineCount ?? 1} min={1} max={5} step={1}
                   id={'tep-id-lineCount'}
                   name={'tep-id-lineCount'}
                   onChange={(e) => setEditedTheme(old => ({
                       ...old,
                       data: {...old.data, [propName]: {...(old.data[propName] ?? {}), lineCount: e.target.value}}
                   }))}/>
        </div>

        <div className={'tep-settings_row'}>
            <div className={'tep-settings_row-el'}>
                <img src={alignLeftIcon} alt={"Alignement à gauche"} width={16} height={16}/>
                <input type={'checkbox'}
                       checked={(editedTheme.data[propName]?.horizontalAlignment ?? 'center') === 'left'}
                       id={'tep-id-horizontalAlignmentLeft'}
                       name={'tep-id-horizontalAlignmentLeft'}
                       onChange={(e) => setEditedTheme(old => ({
                           ...old,
                           data: {
                               ...old.data,
                               [propName]: {
                                   ...(old.data[propName] ?? {}),
                                   horizontalAlignment: e.target.checked ? 'left' : old.data[propName]?.horizontalAlignment
                               }
                           }
                       }))}
                       title={"Alignement à gauche"}
                />
            </div>
            <div className={'tep-settings_row-el'}>
                <img src={alignCenterIcon} alt={"Alignement au centre"} width={16} height={16}/>
                <input type={'checkbox'}
                       checked={(editedTheme.data[propName]?.horizontalAlignment ?? 'center') === 'center'}
                       id={'tep-id-horizontalAlignmentCenter'}
                       name={'tep-id-horizontalAlignmentCenter'}
                       onChange={(e) => setEditedTheme(old => ({
                           ...old,
                           data: {
                               ...old.data,
                               [propName]: {
                                   ...(old.data[propName] ?? {}),
                                   horizontalAlignment: e.target.checked ? 'center' : old.data[propName]?.horizontalAlignment
                               }
                           }
                       }))}
                       title={"Alignement au centre"}
                />
            </div>
            <div className={'tep-settings_row-el'}>
                <img src={alignRightIcon} alt={"Alignement à droite"} width={16} height={16}/>
                <input type={'checkbox'}
                       checked={(editedTheme.data[propName]?.horizontalAlignment ?? 'center') === 'right'}
                       id={'tep-id-horizontalAlignmentRight'}
                       name={'tep-id-horizontalAlignmentRight'}
                       onChange={(e) => setEditedTheme(old => ({
                           ...old,
                           data: {
                               ...old.data,
                               [propName]: {
                                   ...(old.data[propName] ?? {}),
                                   horizontalAlignment: e.target.checked ? 'right' : old.data[propName]?.horizontalAlignment
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
                    value={editedTheme.data[propName]?.fontFamily ?? 'sans-serif'}
                    onChange={(e) => setEditedTheme(old => ({
                        ...old,
                        data: {
                            ...old.data,
                            [propName]: {...(old.data[propName] ?? {}), fontFamily: e.target.value}
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
                   value={(editedTheme.data[propName]?.fontSize ?? '2.4mm').replaceAll('mm', '')} min={2.0}
                   max={4.0} step={0.1}
                   id={'tep-id-fontSize'}
                   name={'tep-id-fontSize'}
                   onChange={(e) => setEditedTheme(old => ({
                       ...old,
                       data: {
                           ...old.data,
                           [propName]: {...(old.data[propName] ?? {}), fontSize: `${e.target.value}mm`}
                       }
                   }))}/>
        </div>

        <div className={'tep-settings_row'}>
            <div className={'tep-settings_row-el'}>
                <img src={backColorIcon} alt={"Couleur du fond"} width={16} height={16}/>
                <input type={'color'} value={editedTheme.data[propName]?.backgroundColor ?? '#ffffff'}
                       id={'tep-id-backgroundColor'}
                       name={'tep-id-backgroundColor'}
                       onChange={(e) => setEditedTheme(old => ({
                           ...old,
                           data: {
                               ...old.data,
                               [propName]: {...(old.data[propName] ?? {}), backgroundColor: e.target.value}
                           }
                       }))}
                       title={"Couleur du fond"}
                />
            </div>
            <div className={'tep-settings_row-el'}>
                <img src={textColorIcon} alt={"Couleur du texte"} width={16} height={16}/>
                <input type={'color'} value={editedTheme.data[propName]?.color ?? '#000000'}
                       id={'tep-id-color'}
                       name={'tep-id-color'}
                       onChange={(e) => setEditedTheme(old => ({
                           ...old,
                           data: {...old.data, [propName]: {...(old.data[propName] ?? {}), color: e.target.value}}
                       }))}
                       title={"Couleur du texte"}
                />
            </div>
            <div className={'tep-settings_row-el'}>
                <img src={boldIcon} alt={"Texte gras"} width={16} height={16}/>
                <input type={'checkbox'}
                       checked={(editedTheme.data[propName]?.fontWeight ?? 'normal') === 'bold'}
                       id={'tep-id-fontWeight'}
                       name={'tep-id-fontWeight'}
                       onChange={(e) => setEditedTheme(old => ({
                           ...old,
                           data: {
                               ...old.data,
                               [propName]: {
                                   ...(old.data[propName] ?? {}),
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
                       checked={(editedTheme.data[propName]?.fontStyle ?? 'normal') === 'italic'}
                       id={'tep-id-fontStyle'}
                       name={'tep-id-fontStyle'}
                       onChange={(e) => setEditedTheme(old => ({
                           ...old,
                           data: {
                               ...old.data,
                               [propName]: {
                                   ...(old.data[propName] ?? {}),
                                   fontStyle: e.target.checked ? 'italic' : 'normal'
                               }
                           }
                       }))}
                       title={"Texte italique"}
                />
            </div>
        </div>
    </>);
}