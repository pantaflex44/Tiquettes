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
import { useEffect, useMemo, useRef, useState } from "react";

import "../css/sourcesPopup.css";

import Popup from "./Popup.jsx";

import plusIcon from "../assets/plus.svg";
import editIcon from "../assets/edit.svg";
import trashIcon from "../assets/trash.svg";

export default function SourcesPopup({
    switchboard,
    onApply,
    onCancel
}) {
    const listRef = useRef();

    const [sources, setSources] = useState([...(switchboard.sources ?? import.meta.env.VITE_SOURCES.split('|').map(v => v.trim()).filter(v => v !== ''))].sort((a, b) => a.localeCompare(b)));
    const [current, setCurrent] = useState([]);
    const [edit, setEdit] = useState([]);
    const isNew = useMemo(() => {
        const results = sources.filter(s => s === edit);
        return edit === '' || (edit !== '' && results.length === 0);
    }, [sources, edit]);

    const cancel = () => {
        if (onCancel) onCancel();
    }

    const apply = () => {
        if (onApply) onApply(sources);
    }

    const countFromSource = (srcId) => {
        const l = switchboard.rows.map(r => r.map(m => m.srcId === srcId).filter(m => m !== false)).filter(r => r.length > 0).length;
        return l;
    };

    const ensureVisible = (srcId) => {
        setTimeout(() => {
            Array.from(listRef.current.options).forEach(o => {
                console.log(o.value, srcId);
                if (o.value === srcId) {
                    o.scrollIntoView();
                }
            });
        }, 500);
    };

    return <Popup
        title={"Gestion des sources"}
        showCloseButton={true}
        showOkButton={true}
        showCancelButton={true}
        width={500}
        onOk={apply}
        okButtonDisabled={switchboard.sources && (JSON.stringify(switchboard.sources) === JSON.stringify(sources))}
        onCancel={cancel}
    >
        <div className="popup_rows" style={{ flex: 1 }}>
            <div className="popup_row" style={{
                "--left_column_size": "140px", alignItems: 'flex-start', marginTop: '1rem'
            }}>
                <label htmlFor={`sources_list`}><b>Liste des sources disponibles</b><br /><br /><small>Ajoutez ou retirez les sources qui seront reliées à vos modules de tête.</small></label>
                <select ref={listRef} multiple={true} size={5} name={`sources_list`} id={`sources_list`} value={current} onChange={(e) => {
                    let c = Array.from(e.target.options).filter(o => o.selected).map(o => o.value);
                    if (!Array.isArray(c)) {
                        c = [];
                    }
                    if (c.length > 1) c = [c[0]];
                    setCurrent(c);
                    setEdit(c.length > 0 ? c[0] : "")
                }}>
                    {sources.map(s => <option key={s} title={`${countFromSource(s)} utilisation${countFromSource(s) > 1 ? 's' : ''}`}>{s}</option>)}
                </select>
            </div>
            <div className="popup_row" style={{
                "--left_column_size": "140px", alignItems: 'flex-start', marginBottom: '1rem'
            }}>
                <label htmlFor={`source`}></label>
                <div className="popup_row-grid" style={{ gridTemplateColumns: '1fr 41px' }}>
                    <input type="search" name={`source`} id={`source`} value={edit} placeholder="Nom de la source" style={{ height: '34px' }}
                        onChange={(e) => {
                            setEdit(e.target.value);

                            const v = e.target.value.trim();
                            const results = sources.filter(s => s.toLowerCase().includes(v.toLowerCase()));
                            if (v === '' || results.length === 0) {
                                setCurrent([]);
                            } else {
                                setCurrent([results[0]]);
                            }
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                if (current.length > 0) {
                                    setEdit(current[0]);
                                }
                            }
                        }}
                    />

                    {isNew && (
                        <button title="Ajouter la source" disabled={edit === ''} style={{ width: '40px' }} onClick={() => {
                            setSources(old => [...old, edit].sort((a, b) => a.localeCompare(b)));
                            //setEdit("");
                            setCurrent([edit]);
                            //ensureVisible(edit);
                        }}>
                            <img src={plusIcon} width={18} height={18} alt="Ajouter la source" />
                        </button>
                    )}

                    {!isNew && (
                        <button title="Supprimer la source" style={{ width: '40px' }} onClick={() => {
                            if (confirm("Êtes-vous certain de vouloir supprimer cette source ?")) {
                                setSources(old => old.filter(o => o !== edit));
                                setEdit("");
                                setCurrent([]);
                            }
                        }}>
                            <img src={trashIcon} width={18} height={18} alt="Supprimer la source" />
                        </button>
                    )}

                </div>
            </div>
        </div>
    </Popup >
}