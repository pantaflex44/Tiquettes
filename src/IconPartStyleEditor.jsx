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
import iconColorIcon from "./assets/icon-color.svg";

export default function IconPartStyleEditor({
                                                positions,
                                                editedTheme,
                                                setEditedTheme,
                                                propName
                                            }) {

    return (!positions[propName].shown ? <span className={'tep-settings_hidden'}>Masqué</span> : <>


        <div className={'tep-settings_row'}>
            <label htmlFor={'tep-icon-fullheight'}>Utiliser toute la hauteur disponible:</label>
            <input type={'checkbox'} checked={editedTheme.data[propName]?.fullHeight ?? false}
                   id={'tep-icon-fullheight'}
                   name={'tep-icon-fullheight'}
                   title={"Afficher l'identifiant"}
                   onChange={(e) => setEditedTheme(old => ({
                       ...old,
                       data: {
                           ...old.data,
                           [propName]: {...(old.data[propName] ?? {}), fullHeight: e.target.checked}
                       }
                   }))}/>
        </div>
        <div className={'tep-settings_row'}>
            <label htmlFor={'tep-icon-fullheight'}>Format:</label>
            <select name="sample_modtype" id={'sample_modtype'} value={editedTheme.data[propName]?.type ?? 'icon'}
                    onChange={(e) => setEditedTheme(old => ({
                        ...old,
                        data: {
                            ...old.data,
                            [propName]: {
                                ...(old.data[propName] ?? {}),
                                type: e.target.value
                            },
                        }
                    }))} style={{flex: "1 1 0%"}}>
                <option value={'icon'}>Pictogramme</option>
                <option value={'text'}>Texte (Type)</option>
            </select>
        </div>
        <div className={'tep-settings_row'}>
            <label htmlFor={'tep-icon-fullheight'}>Taille:</label>
            <input type={'range'} value={editedTheme.data[propName]?.sizePercent ?? 50} min={0} max={100}
                   id={'tep-icon-sizePercent'}
                   name={'tep-icon-sizePercent'}
                   title={"Taille de l'icone"}
                   onChange={(e) => setEditedTheme(old => ({
                       ...old,
                       data: {
                           ...old.data,
                           [propName]: {...(old.data[propName] ?? {}), sizePercent: parseInt(e.target.value)}
                       }
                   }))}/>
            <span style={{fontSize: 'small'}}>{`${editedTheme.data[propName]?.sizePercent ?? 50}%`}</span>
        </div>

        <div className={'tep-settings_row'}>
            <div className={'tep-settings_row-el'}>
                <img src={alignLeftIcon} alt={"Alignement à gauche"} width={16} height={16}/>
                <input type={'checkbox'}
                       checked={(editedTheme.data[propName]?.horizontalAlignment ?? 'center') === 'left'}
                       id={'tep-icon-horizontalAlignmentLeft'}
                       name={'tep-icon-horizontalAlignmentLeft'}
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
                       id={'tep-icon-horizontalAlignmentCenter'}
                       name={'tep-icon-horizontalAlignmentCenter'}
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
                       id={'tep-icon-horizontalAlignmentRight'}
                       name={'tep-icon-horizontalAlignmentRight'}
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
            <div className={'tep-settings_row-el'}>
                <img src={backColorIcon} alt={"Couleur du fond"} width={16} height={16}/>
                <input type={'color'} value={editedTheme.data[propName]?.backgroundColor ?? '#ffffff'}
                       id={'tep-icon-backgroundColor'}
                       name={'tep-icon-backgroundColor'}
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
                <img src={iconColorIcon} alt={"Couleur de l'icône"} width={16} height={16}/>
                <input type={'color'} value={editedTheme.data[propName]?.color ?? '#000000'}
                       id={'tep-icon-color'}
                       name={'tep-icon-color'}
                       onChange={(e) => setEditedTheme(old => ({
                           ...old,
                           data: {...old.data, [propName]: {...(old.data[propName] ?? {}), color: e.target.value}}
                       }))}
                       title={"Couleur de l'icône"}
                />
            </div>
        </div>
    </>);
}