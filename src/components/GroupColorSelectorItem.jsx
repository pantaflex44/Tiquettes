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

function GroupColorSelectorItem({
    value,
    selected,
    handleColorItemSelected,
    hoveredItem, setHoveredItem
}) {
    return <li data-value={value?.key} onClick={() => handleColorItemSelected(value)} style={{
        borderRadius: '5px',
        cursor: 'pointer',
        listStyle: 'none',
        padding: '0.5em',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        columnGap: '1em',
        backgroundColor: (value?.key !== selected?.key && hoveredItem === value?.key) ? 'var(--secondary-color)' : ((value?.key === selected?.key) ? '#f5f5f5' : 'inherit')
    }} onMouseMove={() => setHoveredItem(value?.key)}>
        <div style={{ minWidth: '30px', width: '30px', height: '20px', backgroundColor: value?.color ?? 'transparent', border: value?.key === '' ? '1px solid lightgray' : 'initial' }}></div>
        {value?.key === '' && <div style={{ alignSelf: "center" }}>Aucune couleur</div>}
        {value?.key === '_new_' && <div style={{ alignSelf: "center" }}>Nouvelle couleur ...</div>}
        {value?.key !== '' && value?.key !== '_new_' && <div dangerouslySetInnerHTML={{ __html: value?.title ?? value?.key }} style={{ marginTop: '-2px' }} />}
    </li>;
}

export default GroupColorSelectorItem;