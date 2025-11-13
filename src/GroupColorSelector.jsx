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
import { useEffect, useMemo, useRef, useState } from "react";

import "./groupColorSelector.css";

import caretDownIcon from './assets/caret-down.svg';
import caretUpIcon from './assets/caret-up.svg';
import GroupColorSelectorItem from "./GroupColorSelectorItem";
import GroupColorSelectorSeparator from "./GroupColorSelectorSeparator";
import Popup from "./Popup";
import { ChromePicker } from "react-color";

export default function GroupColorSelector({
    switchboard,
    value = '',
    onChange = null
}) {
    const [opened, setOpened] = useState(false);
    const [paletteOpened, setPaletteOpened] = useState(false);
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
        console.log(selected);
        setSelected(() => selected);
        setOpened(false);
    }

    useEffect(() => {
        const c = selected?.color ?? '';
        if (c !== value && onChange) onChange(c);
    }, [selected]);

    return (
        <>
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
                }}
                    onClick={handleColorListToggler}
                >
                    <div style={{ width: '30px', height: '20px', backgroundColor: selected.color }}></div>
                    <img loading={'lazy'} src={opened ? caretUpIcon : caretDownIcon} width={16} height={16}
                        style={{ padding: '0px', cursor: 'pointer', marginTop: '2px' }} alt="Choisir une couleur"
                        title="Liste des couleurs" />
                </div>

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
                            let c = (selected?.color ?? 'transparent').trim();
                            if (c === '') c = 'transparent';
                            setPaletteOpened(true);
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

            {paletteOpened && <Popup
                title={"Nouvelle couleur de groupe"}
                showCloseButton={false}
                showCancelButton={false}
                showOkButton={true}
                withOverflow={false}
                width={315}
                onOk={() => setPaletteOpened(false)}
            >
                <div style={{ boxSizing: 'border-box', width: '100%', height: 'max-content', border: '1px solid #ccc', borderTopLeftRadius: '7px', borderTopRightRadius: '7px' }}>
                    <div style={{ boxSizing: 'border-box', width: '100%', height: '30px', backgroundColor: selected.color, marginBottom: '0', borderTopLeftRadius: '7px', borderTopRightRadius: '7px' }}></div>
                    <ChromePicker disableAlpha={true} color={selected.color} onChange={(c) => setSelected({
                        key: c.hex,
                        color: c.hex
                    })} width={300} />
                </div>
            </Popup>}
        </>
    );
}