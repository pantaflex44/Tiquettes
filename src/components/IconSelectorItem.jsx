/**
 Tiquettes - Générateur d'étiquettes pour tableaux et armoires électriques
 Copyright (C) 2024-2026 Christophe LEMOINE

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

function IconSelectorItem({
                              icon,
                              selected,
                              search,
                              handleIconListItemSelected,
                              hoveredItem, setHoveredItem
                          }) {
    return <li data-value={icon.filename} onClick={() => handleIconListItemSelected(icon)} style={{
        borderRadius: '5px',
        cursor: 'pointer',
        listStyle: 'none',
        padding: '0.5em',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        alignItems: 'center',
        justifyContent: 'flex-start',
        columnGap: '1em',
        backgroundColor: ((selected && selected.filename === icon.filename && search.filename) ? '#f5f5f5' : (hoveredItem === icon.filename) ? 'var(--secondary-color)' : 'inherit')
    }} onMouseMove={() => setHoveredItem(icon.filename)}>
        {icon.filename
            ? <img src={`${import.meta.env.VITE_APP_BASE}${icon.filename}`} loading={"lazy"} width={24} height={24}
                   alt={icon.title} title={icon.title}/>
            : <div style={{width: '24px', height: '24px'}}></div>
        }
        <div>{icon.title}</div>
    </li>;
}

export default IconSelectorItem;