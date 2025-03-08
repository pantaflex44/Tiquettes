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

import upIcon from "./assets/caret-up.svg";
import downIcon from "./assets/caret-down.svg";

export default function ThemeEditorPartColumnTitle({
                                                       propName,
                                                       title,
                                                       shownCount,
                                                       positions,
                                                       setEditedTheme,
                                                       up,
                                                       down
                                                   }) {
    return <h5>
        <input type={'checkbox'} checked={positions[propName].shown}
               title={title}
               onChange={(e) => setEditedTheme(old => ({
                   ...old,
                   data: {...old.data, [propName]: {...(old.data[propName] ?? {}), shown: e.target.checked}}
               }))}/>
        <img src={upIcon} alt={"Remonter"} width={16} height={16}
             className={!positions[propName].shown || positions[propName].order <= 0 ? 'disabled' : null}
             style={{cursor: 'pointer'}} onClick={() => up(propName)}/>
        <img src={downIcon} alt={"Descendre"} width={16} height={16}
             className={!positions[propName].shown || positions[propName].order >= shownCount - 1 ? 'disabled' : null}
             style={{cursor: 'pointer'}} onClick={() => down(propName)}/>
        <span>{title}</span>
    </h5>
}