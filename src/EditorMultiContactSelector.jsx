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
import useOutsideAlerter from "./useOutsideAlerter";


export default function EditorMultiContactSelector({ id, value, currentModuleId, filteredModulesListBySchemaFuncs, onChange = null }) {
    const [opened, setOpened] = useState(false);
    const [list, setList] = useState((typeof value === 'string' ? value.split('|') : []).map(v => v.trim()).filter(v => v !== ''));

    const listRef = useRef();
    const listContainerRef = useRef();
    useOutsideAlerter(listContainerRef, () => {
        setOpened(false);
    });

    function getModuleTextById(id) {
        return filteredModulesListBySchemaFuncs.kc.find(m => m.id === id)?.text ?? '';
    }

    function handleKeyUp(e) {
        if (e.key === 'Escape') setOpened(false);
    }

    useEffect(() => {
        if (onChange) onChange(list.join('|'));
    }, [list]);

    return (
        <div style={{ position: 'relative' }} className="icon_selector" id={id} ref={listContainerRef}  >
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
                onClick={() => setOpened((old) => !old)}
            >
                <div style={{ fontSize: '0.9em', color: value ? 'black' : 'darkgray', flex: 1, display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-start', gap: '0.25rem' }}>
                    {list.map((v) => {
                        return (
                            <div key={v} contentEditable={false} style={{ userSelect: 'none', display: 'inline-block', color: '#111', border: '1px solid #ccc', backgroundColor: '#f0f0f0', borderRadius: '5px', paddingBlock: '0.15rem', paddingInline: '0.5rem', width: 'max-content' }} title={getModuleTextById(v)}>
                                {v}
                            </div>
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
                padding: '0',
                paddingBlock: '0.25rem',
                fontWeight: 400,
                width: 'calc(100% - 0.25rem)',
                margin: 0,
                marginTop: '0',
                maxHeight: '16rem',
                overflowY: 'auto',
                backgroundColor: '#fff',
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                flexWrap: 'nowrap',
                alignItems: 'stretch',
                justifyContent: 'flex-start',
                gap: '0rem'
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
                            paddingInline: '0.5rem',
                            paddingBlock: '0.5rem',
                            backgroundColor: list.includes(module.id) ? 'var(--secondary-color-light)' : 'transparent',
                        }}>
                            <input type="checkbox" id={`checkbox-${module.id}`} checked={list.includes(module.id)} onChange={(e) => {
                                let newList = [];
                                if (e.target.checked) {
                                    newList = [...list, module.id];
                                } else {
                                    newList = list.filter(l => l !== module.id);
                                }
                                setList(newList);
                            }} style={{ marginRight: 'initial', marginTop: '0.15rem' }} />
                            <label htmlFor={`checkbox-${module.id}`} style={{}}>{`${module.id} ${module.text ? '- ' + module.text : ''}`.trim()}</label>
                        </li>
                        : null;
                }).filter(f => f !== null)}
            </ul>
        </div >
    );
}