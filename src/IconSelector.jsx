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

import { useEffect, useRef, useState } from "react";

import swbIcons from './switchboard_icons.json';
import caretDownIcon from './assets/caret-down.svg';
import caretUpIcon from './assets/caret-up.svg';

/* eslint-disable react/prop-types */
function IconSelector({ value = null, onChange = null, onOpenState = null }) {
    const [selected, setSelected] = useState(null);
    const [opened, setOpened] = useState(false);
    const [hoveredItem, setHoveredItem] = useState(false);
    const [search, setSearch] = useState(null);
    const [found, setFound] = useState([...swbIcons]);

    const listRef = useRef();

    function handleSearchInput(e) {
        const v = e.target.value;
        const f = [...swbIcons].filter((icon) => icon.title.toLowerCase() == v.toLowerCase());
        setSearch(f.length > 0 ? f[0] : { title: v });
    }

    function handleSearchEnter() {
        setOpened(true);
    }

    function handleKeyUp(e) {
        if (e.key === 'Escape') setOpened(false);
        if (e.key === 'Enter') {
            if (search.filename) {
                setSelected(search);
            } else if (found.length > 0) {
                setSelected(found[0]);
            }
            setOpened(false);
        }
    }

    function handleIconListToggler() {
        setOpened((old) => {
            if (!old) setFound([...swbIcons]);
            return !old;
        });
        setTimeout(() => listRef.current.focus(), 200);
    }

    function handleIconListItemSelected(icon) {
        setSelected(() => {
            setOpened(false);
            const o = icon.filename ? icon : null;
            setSearch(o);
            return o;
        });
    }

    useEffect(() => {
        setSearch(selected);

        if (onChange) {
            if (!selected || (selected.filename !== value)) {
                onChange(selected ? selected.filename : null, selected);
            }
        }
    }, [selected]);

    useEffect(() => {
        if (onOpenState) onOpenState(opened ? 'opened' : 'closed');

        if (!opened) setSearch(selected ? selected : '');

        if (opened && search.filename) {
            const result = Array.from(listRef.current.children).filter((child) => child.dataset.value === search.filename);
            if (result.length > 0) result[0].scrollIntoView();
        }
    }, [opened]);

    useEffect(() => {
        if (!search || !search.title) {
            setFound([...swbIcons]);
            return;
        }
        const f = [...swbIcons].filter((icon) => icon.title.toLowerCase().includes(search.title.toLowerCase()));
        const l = f.length > 0 ? f : [...swbIcons];
        setFound(l);
        setHoveredItem(l[0].filename);
    }, [search]);

    useEffect(() => {
        if (value) {
            const f = [...swbIcons].filter((icon) => icon.filename == value);
            if (f.length > 0 && (!selected || f[0].filename !== selected.filename)) setSelected(f[0]);
        }
    }, [value]);

    return (
        <div style={{ position: 'relative' }} className="icon_selector">
            <div className={`icon_selector_box ${opened ? 'focused' : ''}`} style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', alignItems: 'center', justifyContent: 'flex-start', columnGap: '1em', minWidth: '19px', width: 'calc(100% - 1.3em)', minHeight: '19px', backgroundColor: '#f5f5f5', border: '1px solid darkgray', borderRadius: '5px', padding: '0.5em', fontWeight: 500 }}>
                {search && search.filename
                    ? <img src={`${import.meta.env.VITE_APP_BASE}${search.filename}`} width={24} height={24} alt={search.title} />
                    : <div style={{ width: '24px', height: '24px' }}></div>
                }
                <input type="text" value={search ? search.title : ''} onKeyUp={handleKeyUp} onChange={handleSearchInput} placeholder="Rechercher ..." style={{ border: 0, padding: 0 }} onInput={handleSearchEnter} />
                <img src={opened ? caretUpIcon : caretDownIcon} width={16} height={16} style={{ padding: '0px', cursor: 'pointer', marginTop: '2px' }} alt="Pictogrammes" title="Liste des pictogrammes" onClick={handleIconListToggler} />
            </div>
            <ul tabIndex={-1} onKeyUp={handleKeyUp} ref={listRef} style={{ zIndex: 1, visibility: (opened ? 'visible' : 'hidden'), position: 'absolute', border: '1px solid darkgray', borderRadius: '5px', padding: '0.5em', fontWeight: 400, width: 'calc(100% - 1.3em)', margin: 0, marginTop: '0em', height: '16em', overflowY: 'auto', backgroundColor: '#fff', listStyle: 'none' }} onMouseOut={() => setHoveredItem(null)}>
                {found.map((icon, i) => {
                    return <li key={i} data-value={icon.filename} onClick={() => handleIconListItemSelected(icon)} style={{ borderRadius: '5px', cursor: 'pointer', listStyle: 'none', padding: '0.5em', display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', alignItems: 'center', justifyContent: 'flex-start', columnGap: '1em', backgroundColor: ((selected && selected.filename === icon.filename && search.filename) ? '#f5f5f5' : (hoveredItem === icon.filename) ? 'var(--secondary-color)' : 'inherit') }} onMouseMove={() => setHoveredItem(icon.filename) } >
                        {icon.filename
                            ? <img src={`${import.meta.env.VITE_APP_BASE}${icon.filename}`} width={24} height={24} alt={icon.title} title={icon.title} />
                            : <div style={{ width: '24px', height: '24px' }}></div>
                        }
                        <div>{icon.title}</div>
                    </li>;
                })}
            </ul>
        </div>
    );
}

export default IconSelector;