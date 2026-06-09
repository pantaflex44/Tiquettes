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

import { useEffect, useState } from 'react';

// eslint-disable-next-line react/prop-types
function ContentEditable({ value = "", onChange = null, style = {}, editableStyle = {}, editableClassName = null, className = null, editMode = false, editable = true, height = 28 }) {
    const [edit, setEdit] = useState(editMode);
    const [lastContent, setLastContent] = useState(value);
    const [content, setContent] = useState(value);

    useEffect(() => {
        setEdit((old) => {
            if (!editable) return false;

            if (old !== editMode) return editMode;

            return old;
        });
    }, [editMode, editable]);

    useEffect(() => {
        setLastContent(value);
    }, [value]);

    const handleEdit = () => {
        setContent(lastContent);
        setEdit(editable);
    };

    const handleCancel = () => {
        setEdit(false);
    };

    const handleOk = () => {
        setLastContent(content);
        if (onChange) onChange(content);

        setEdit(false);
    };

    const handleKeyUp = (e) => {
        if (e.key === 'Escape') handleCancel();
        else if (e.key === 'Enter') handleOk();
    };

    const handleChange = (e) => {
        setContent(e.target.value);
    };

    return (
        <div tabIndex={0} style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', justifyContent: 'start', alignItems: 'center', columnGap: '0.5em' }} onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) handleCancel();
        }}>
            {edit && editable
                ? <input type="text" value={content} onChange={handleChange} onKeyUp={handleKeyUp} style={{ height: `${height}px`, ...editableStyle }} className={editableClassName} autoFocus />
                : <span style={{ ...style }} className={className} onClick={() => { if (editable) handleEdit(); }} title="Cliquer sur le texte pour le modifier">
                    {value}
                </span>
            }
        </div>
    );
}

export default ContentEditable;