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

import { lazy, Suspense, useEffect, useRef, useState } from "react";

import caretDownIcon from './assets/caret-down.svg';
import caretUpIcon from './assets/caret-up.svg';


export default function EditorMultiContactSelector({ id, value, currentModuleId, filteredModulesListBySchemaFuncs, onChange = null }) {
    const [opened, setOpened] = useState(false);
    const [list, setList] = useState(typeof value === 'string' ? value.split('|') : '');

    const listRef = useRef();

    function getModuleTextById(id) {
        return filteredModulesListBySchemaFuncs.kc.find(m => m.id === value)?.text ? '- ' + filteredModulesListBySchemaFuncs.kc.find(m => m.id === value).text : '';
    }

    function handleKeyUp(e) {
        if (e.key === 'Escape') setOpened(false);
        if (e.key === 'Enter') setOpened(false);
    }

    function handleIconListToggler() {
        setOpened((old) => !old);
    }

    useEffect(() => {
        if (onChange) onChange(list.join('|'));
    }, [list]);

    return (
        <div style={{ position: 'relative' }} className="icon_selector" id={id} tabIndex={-1} >
            <div className={`icon_selector_box ${opened ? 'focused' : ''}`} style={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'nowrap',
                alignItems: 'center',
                justifyContent: 'flex-start',
                columnGap: '1em',
                minWidth: '19px',
                width: 'calc(100% - 0.75rem)',
                minHeight: 'calc(34px - 0.60rem)',
                border: '1px solid darkgray',
                borderRadius: '5px',
                padding: '0.25rem',
                fontWeight: 500,
                backgroundColor: '#fff'
            }}
                onClick={handleIconListToggler}
            >
                <div style={{ fontSize: '0.9em', color: value ? 'black' : 'darkgray', flex: 1, display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-start', gap: '0.25rem' }}>
                    {list.map((v) => {
                        return (
                            <div key={v} contentEditable={false} style={{ userSelect: 'none', display: 'inline-block', color: '#111', border: '1px solid #ccc', backgroundColor: '#f0f0f0', borderRadius: '5px', paddingBlock: '0.15rem', paddingInline: '0.5rem', width: 'max-content' }}>{v}</div>
                        );
                    })}
                    {list.length === 0 ? <div contentEditable={false} style={{ userSelect: 'none', marginLeft: '0.25rem', width: 'max-content' }}>aucun contacteur</div> : null}
                </div>
                <img loading={'lazy'} src={opened ? caretUpIcon : caretDownIcon} width={16} height={16}
                    style={{ padding: '0px', cursor: 'pointer', marginTop: '2px' }} alt="Pictogrammes"
                    title="Liste des pictogrammes" />
            </div>
            <ul onKeyUp={handleKeyUp} ref={listRef} style={{
                zIndex: 1,
                visibility: (opened ? 'visible' : 'hidden'),
                position: 'absolute',
                border: '1px solid darkgray',
                borderRadius: '5px',
                padding: '0.5em',
                fontWeight: 400,
                width: 'calc(100% - 1.3em)',
                margin: 0,
                marginTop: '0em',
                height: '16em',
                overflowY: 'auto',
                backgroundColor: '#fff',
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                flexWrap: 'nowrap',
                alignItems: 'stretch',
                justifyContent: 'flex-start',
                gap: '0.5rem'
            }}>
                {(filteredModulesListBySchemaFuncs.kc ?? []).map((module) => {
                    return module.id !== currentModuleId
                        ? <li key={module.id} style={{
                            display: 'flex',
                            flexDirection: 'row',
                            flexWrap: 'nowrap',
                            alignItems: 'flex-start',
                            justifyContent: 'flex-start',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '5px',
                            gap: '0.5rem',
                            padding: '0.1rem'
                        }}>
                            <input type="checkbox" id={`checkbox-${module.id}`} checked={list.includes(module.id)} onChange={(e) => {
                                let newList = [];
                                if (e.target.checked) {
                                    newList = [...list, module.id];
                                } else {
                                    newList = list.filter(l => l !== module.id);
                                }
                                setList(newList);
                                if (onChange) onChange(newList);
                            }} style={{ marginRight: 'initial', marginTop: '0.2rem' }} />
                            <label htmlFor={`checkbox-${module.id}`} style={{}}>{`${module.id} ${module.text ? '- ' + module.text : ''}`.trim()}</label>
                        </li>
                        : null;
                }).filter(f => f !== null)}
            </ul>
        </div>
    );
}