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


import { useState } from 'react';

import { ChromePicker } from 'react-color';

import './groupColorChooser.css';
import Popup from './Popup';

function GroupColorChooser({
    value,
    useGroupColorValue = false,
    onUseGroupColorChange = null,
    onChange = null,
    disabled = false,
    id = null,
    name = null,
    title = '',
    className = '',
    style = {},
}) {
    const [opened, setOpened] = useState(false);
    const [color, setColor] = useState(value);

    return (
        <>
            <button id={id} name={name} title={title}
                className={`gcc-box ${className}`.trim()}
                disabled={disabled}
                style={{ ...style, backgroundColor: value }}
                onClick={() => setOpened(old => !old)}
            ></button>
            {opened && <>
                <Popup
                    title={title}
                    showCloseButton={true}
                    showCancelButton={true}
                    showOkButton={true}
                    withOverflow={false}
                    width={315}

                    onCancel={() => setOpened(false)}
                    onOk={() => {
                        if (onChange) onChange(color);
                        setOpened(false);
                    }}

                >
                    <div style={{ boxSizing: 'border-box', width: '100%', height: 'max-content', border: '1px solid #ccc', borderTopLeftRadius: '7px', borderTopRightRadius: '7px' }}>
                        <div style={{ boxSizing: 'border-box', width: '100%', height: '30px', backgroundColor: color, marginBottom: '0', borderTopLeftRadius: '7px', borderTopRightRadius: '7px' }}></div>
                        <ChromePicker disableAlpha={true} color={color} onChange={(c) => setColor(c.hex)} width={300} />
                    </div>
                    {typeof useGroupColorValue === 'boolean' && onUseGroupColorChange && <div className={'gcc-box_group'}>
                        <input id={`use_grp_${id}`} name={`use_grp_${id}`} type="checkbox" checked={useGroupColorValue} onChange={onUseGroupColorChange} disabled={disabled} />
                        <label htmlFor={`use_grp_${id}`}>Utiliser la couleur du groupe si elle est définie dans les propriétés du module.</label>
                    </div>}
                </Popup>
            </>}
        </>
    );
}

export default GroupColorChooser;