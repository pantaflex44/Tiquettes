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

import { lazy, Suspense, useEffect, useRef, useState } from "react";

import useOutsideAlerter from "../hooks/useOutsideAlerter.jsx";
const EditorSrcNameItem = lazy(() => import('./EditorSrcNameItem.jsx'));

import caretDownIcon from '../assets/caret-down.svg';
import caretUpIcon from '../assets/caret-up.svg';
import addIcon from '../assets/plus.svg';


/* eslint-disable react/prop-types */
function EditorSrcName({ sources = [], value = null, onChange = null, onOpenState = null }) {
    const [selected, setSelected] = useState(null);
    const [opened, setOpened] = useState(false);
    const [hoveredItem, setHoveredItem] = useState(false);
    const [search, setSearch] = useState(null);
    const [found, setFound] = useState([...sources]);
    const [addAllowed, setAddAllowed] = useState(false);

    const listRef = useRef();
    const listContainerRef = useRef();
    useOutsideAlerter(listContainerRef, () => {
        setOpened(false);
    });

    function compare(s1, s2, lowerCase = true, equals = false) {
        let fs1 = s1.normalize('NFD').replace(/\p{Diacritic}/gu, '').trim();
        if (lowerCase) fs1 = fs1.toLowerCase();

        let fs2 = s2.normalize('NFD').replace(/\p{Diacritic}/gu, '').trim();
        if (lowerCase) fs2 = fs2.toLowerCase();

        return equals ? fs1 === fs2 : fs1.includes(fs2);
    }

    function handleSearchInput(e) {
        const v = e.target.value;
        const f = [...sources].filter((item) => compare(item, v, true, false));
        console.log(f.length);
        setSearch(v);
    }

    function handleSearchEnter() {
        setOpened(true);

    }

    function handleKeyUp(e) {
        if (e.key === 'Escape') setOpened(false);
        if (e.key === 'Enter') {
            if (search && search.trim() !== '') {
                if (search !== hoveredItem) {
                    setSelected(hoveredItem);
                    setSearch(hoveredItem);
                    setOpened(false);
                } else {
                    if (found.length > 0) {
                        setSelected(found[0]);
                        setSearch(found[0]);
                    } else {
                        setSelected(search);
                    }
                    setOpened(false);
                }
            } else {
                setSearch(null);
                setSelected(null);
                setHoveredItem(null);
                setOpened(false);
            }
        }
        if (e.key === 'ArrowUp' && found.length > 0) {
            let idx = found.indexOf(hoveredItem);
            if (idx > 0) {
                idx--;
            } else if (idx <= 0) {
                idx = found.length - 1;
            }
            setHoveredItem(found[idx]);
        }
        if (e.key === 'ArrowDown' && found.length > 0) {
            let idx = found.indexOf(hoveredItem);
            if (idx < found.length - 1) {
                idx++;
            } else if (idx >= found.length - 1) {
                idx = 0;
            }
            setHoveredItem(found[idx]);
        }
    }

    function handleItemListToggler() {
        setOpened((old) => {
            if (!old) setFound([...sources]);
            return !old;
        });
        setTimeout(() => {
            if (listRef.current) listRef.current.focus();
        }, 200);
    }

    function handleItemListItemSelected(item) {
        setSelected(() => {
            setOpened(false);
            const o = item ? item : null;
            setSearch(o);
            return o;
        });
    }

    useEffect(() => {
        setSearch(selected);

        if (onChange) {
            if (!selected || (selected !== value)) {
                onChange(selected ? selected : null);
            }
        }
    }, [selected]);

    useEffect(() => {
        if (onOpenState) onOpenState(opened ? 'opened' : 'closed');

        if (!opened) setSearch(search && search.trim() !== '' ? (selected ? selected : '') : '');

        if (opened && search && listRef.current) {
            const result = Array.from(listRef.current.children).filter((child) => child.dataset.value === search);
            if (result.length > 0) result[0].scrollIntoView();
        }
    }, [opened]);

    useEffect(() => {
        if (!search || search === '') {
            setAddAllowed(false);
            setFound([...sources]);
            return;
        }
        const f = [...sources].filter((item) => compare(item, search, true, false));
        const l = f.length > 0 ? f : [...sources];
        setFound(l);

        const ff = [...sources].filter((item) => compare(item, search, true, true));
        setAddAllowed(search && search.trim() !== '' && ff.length === 0);
        if (l.length > 0) setHoveredItem(l[0]);
    }, [search]);

    useEffect(() => {
        if (value) {
            const f = [...sources].filter((item) => compare(item, value, true, false));
            if (f.length > 0 && (!selected || f[0] !== selected)) setSelected(f[0]);
        }
    }, [value]);

    return (
        <div className="icon_selector" style={{ position: 'relative', flex: 1 }} ref={listContainerRef}>
            <div className={`icon_selector_box ${opened ? 'focused' : ''}`} style={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'nowrap',
                alignItems: 'center',
                justifyContent: 'flex-start',
                columnGap: '1em',
                minWidth: '19px',
                width: `calc(100% - 1rem + 2px ${addAllowed ? '- 16px - 1em' : '+ 0rem'})`,
                minHeight: '19px',
                border: '1px solid darkgray',
                borderRadius: '5px',
                padding: '0.5em',
                fontWeight: 500,
                backgroundColor: '#fff'
            }}
            >
                <input type="text" value={search ?? ''} onKeyUp={handleKeyUp} onChange={handleSearchInput}
                    placeholder="Source ..." style={{ border: 0, padding: 0, width: 'initial', flex: 1 }} onInput={handleSearchEnter} />

                {addAllowed && <img loading={'lazy'} src={addIcon} width={16} height={16}
                    style={{ padding: '0px', cursor: 'pointer', marginTop: '2px' }} alt="Ajouter"
                    title="Ajouter" />}

                <img loading={'lazy'} src={opened ? caretUpIcon : caretDownIcon} width={16} height={16}
                    style={{ padding: '0px', cursor: 'pointer', marginTop: '2px' }} alt="Sources disponibles"
                    title="Liste des sources disponibles" onClick={handleItemListToggler} />
            </div>
            <ul tabIndex={-1} onKeyUp={handleKeyUp} ref={listRef} style={{
                zIndex: 1,
                visibility: (opened ? 'visible' : 'hidden'),
                position: 'absolute',
                border: '1px solid darkgray',
                borderRadius: '5px',
                padding: '0.5em',
                fontWeight: 400,
                width: `calc(100% - 1rem + 2px ${addAllowed ? '- 16px - 1em' : '+ 0rem'})`,
                margin: 0,
                marginTop: '0em',
                height: '16em',
                overflowY: 'auto',
                backgroundColor: '#fff',
                listStyle: 'none'
            }} onMouseOut={() => setHoveredItem(null)}>
                {
                    found.map((item, i) => <Suspense key={i} fallback={<div></div>}>
                        <EditorSrcNameItem item={item} selected={selected} search={search}
                            handleItemListItemSelected={handleItemListItemSelected}
                            hoveredItem={hoveredItem}
                            setHoveredItem={setHoveredItem} />
                    </Suspense>)
                }
            </ul>
        </div>
    );
}

export default EditorSrcName;