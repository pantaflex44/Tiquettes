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
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";

import "./groupColorSelector.css";

import caretDownIcon from './assets/caret-down.svg';
import caretUpIcon from './assets/caret-up.svg';
import GroupColorSelectorItem from "./GroupColorSelectorItem";
import GroupColorSelectorSeparator from "./GroupColorSelectorSeparator";

export default function GroupColorSelector({
    switchboard,
    value = '',
    onChange = null
}) {
    const [opened, setOpened] = useState(false);
    const [hoveredItem, setHoveredItem] = useState(false);
    const [selected, setSelected] = useState({ key: value, color: value, title: '' });
    const found = useMemo(() => {
        let f = {};
        switchboard.rows.forEach((r) => {
            r.forEach((m) => {
                const grp = (m.grp ?? '').trim();
                if (grp !== '') {
                    if (!f[grp]) f[grp] = [];
                    f[grp].push(m);
                }
            })
        });
        return f;
    }, [switchboard.rows]);

    const listRef = useRef();
    const colorPaletteRef = useRef();

    function handleColorListToggler() {
        setOpened((old) => {
            return !old;
        });
        setTimeout(() => listRef.current.focus(), 200);
    }

    function handleKeyUp(e) {
        if (e.key === 'Escape') setOpened(false);
    }

    function handleColorItemSelected(selected) {
        setSelected(() => selected);
        setOpened(false);
    }

    useEffect(() => {
        const c = selected?.color ?? '';
        if (c !== value && onChange) onChange(c);
    }, [selected]);

    return (
        <div style={{ position: 'relative' }} className="icon_selector">
            <div className={`icon_selector_box ${opened ? 'focused' : ''}`} style={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'nowrap',
                alignItems: 'center',
                justifyContent: 'flex-start',
                columnGap: '1em',
                minWidth: '19px',
                width: 'calc(100% - 1.3em)',
                minHeight: '19px',
                border: '1px solid darkgray',
                borderRadius: '5px',
                padding: '0.5em',
                fontWeight: 500,
                backgroundColor: '#fff'
            }}>
                <div style={{ width: '30px', height: '20px', backgroundColor: selected.color }}></div>
                <img loading={'lazy'} src={opened ? caretUpIcon : caretDownIcon} width={16} height={16}
                    style={{ padding: '0px', cursor: 'pointer', marginTop: '2px' }} alt="Choisir une couleur"
                    title="Liste des couleurs" onClick={handleColorListToggler} />
            </div>
            <input ref={colorPaletteRef} onChange={(e) => {
                setSelected({
                    key: e.target.value,
                    color: e.target.value
                });
                setOpened(false);
            }} type="color" id="color-palette" tabIndex='-1' style={{ position: 'absolute', left: '-10000px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden' }} />
            <ul tabIndex={-1} onKeyUp={handleKeyUp} ref={listRef} style={{
                zIndex: 1,
                visibility: (opened ? 'visible' : 'hidden'),
                position: 'absolute',
                border: '1px solid darkgray',
                borderRadius: '5px',
                padding: '0.5em',
                fontWeight: 400,
                width: '16em',
                margin: 0,
                marginTop: '0em',
                height: 'max-content',
                maxHeight: '24em',
                overflowY: 'auto',
                backgroundColor: '#fff',
                listStyle: 'none'
            }} onMouseOut={() => setHoveredItem(null)} onBlur={() => setOpened(false)}>
                <GroupColorSelectorItem
                    value={{ key: '', color: '', title: '' }}
                    selected={selected}
                    handleColorItemSelected={handleColorItemSelected}
                    hoveredItem={hoveredItem}
                    setHoveredItem={setHoveredItem}
                />
                <GroupColorSelectorItem
                    value={{ key: '_new_', color: '', title: '' }}
                    selected={selected}
                    handleColorItemSelected={() => {
                        colorPaletteRef.current.focus();
                        colorPaletteRef.current.value = selected?.color ?? 'transparent';
                        colorPaletteRef.current.click();
                    }}
                    hoveredItem={hoveredItem}
                    setHoveredItem={setHoveredItem}
                />
                {Object.keys(found).length > 0 && <>
                    <GroupColorSelectorSeparator />
                    {Object.keys(found).map((color) => {
                        let t = found[color].map((m) => `<small><b>${m.id}</b></small> ${m.text}`.trim());
                        return <GroupColorSelectorItem
                            key={color}
                            value={{ key: color, color, title: t.join('<br />') }}
                            selected={selected}
                            handleColorItemSelected={handleColorItemSelected}
                            hoveredItem={hoveredItem}
                            setHoveredItem={setHoveredItem}
                        />;
                    })}
                </>}
            </ul>
        </div>
    );
}