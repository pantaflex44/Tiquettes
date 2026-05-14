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

import { useRef, useState } from "react";
import "../css/firstpageSettingsPopup.css";
import * as pkg from '../../package.json';

import Popup from "./Popup.jsx";

import dataIcon from "../assets/database.svg";
import eyeIcon from "../assets/eye.svg";
import exportIcon from '../assets/download.svg';
import importIcon from "../assets/upload.svg";

export default function FirstpageSettingsPopup({
    defaultFirstpageOptions,
    switchboard,
    printOptions,
    onCancel,
    onApply,
}) {
    const [tab, setTab] = useState(1);

    const importRef = useRef();

    const merge = (a, b) => [a, b].reduce((r, o) => Object
        .entries(o)
        .reduce((q, [k, v]) => ({
            ...q,
            [k]: v && typeof v === 'object' ? merge(q[k] || {}, v) : v
        }), r),
        {});
    const loadOptions = () => {
        return merge(defaultFirstpageOptions, {
            infos: merge(defaultFirstpageOptions.infos, switchboard?.firstPageInfos ?? {}),
            views: merge(defaultFirstpageOptions.views, printOptions?.pdfOptions?.firstPageView ?? {}),
        });
    }
    const [options, setOptions] = useState(loadOptions());

    const exportData = () => {
        let o = {
            infos: { from: { ...options.infos.from } },
            views: { ...options.views }
        }

        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(o))}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = `Tiquettes - Données personnelles.json`;
        link.click();
    }

    const _importData = (data) => {
        try {
            let o = typeof data === 'string' ? JSON.parse(data) : data;
            setOptions(old => {
                const opt = merge(old, o);
                return opt;
            });
            return true;
        } catch (err) {
            importRef.current.value = "";
            alert("Impossible d'importer ces données.");
            return false;
        }
    }

    const importData = (file) => {
        if (file) {
            const fileReader = new FileReader();
            fileReader.readAsText(file, 'UTF-8');
            fileReader.onload = (e) => _importData(e.target.result);
        } else {
            importRef.current.value = "";
            alert("Aucunes données à importer!");
        }
    }

    const cancel = () => {
        if (onCancel) onCancel();
    }

    const apply = () => {
        if (onApply) onApply(options);
    }

    return <Popup
        title={"Présentation de la page de garde"}
        showCloseButton={true}
        showOkButton={true}
        showCancelButton={true}
        width={890}
        onOk={apply}
        okButtonDisabled={!options}
        onCancel={cancel}
        popupStyle={{ overflowT: 'auto' }}
    >
        <nav className="tabPages" style={{ marginTop: 0 }}>
            <div className={`tabPages_page ${tab === 1 ? 'selected' : ''}`.trim()}
                onClick={() => setTab(1)}>
                <img src={dataIcon} width={20} height={20} alt="Données de la page d'accueil" />
                <span>Données du projet</span>
            </div>
            <div className={`tabPages_page ${tab === 2 ? 'selected' : ''}`.trim()}
                onClick={() => setTab(2)}>
                <img src={eyeIcon} width={20} height={20} alt="Aperçu" />
                <span>Aperçu</span>
            </div>
        </nav>

        <div className={`tabPages_page-content ${tab === 1 ? 'selected' : ''}`.trim()}>
            <div className="data-grid">
                <div className="data-grid-column" style={{ gridRow: 'span 2', background: 'initial' }}>
                    <h5>
                        <span style={{ flex: 1 }}>Informations de l'installateur</span>
                        <img src={exportIcon} alt={"Remonter"} width={16} height={16} style={{ cursor: 'pointer' }} title="Importer mes données" onClick={() => {
                            document.getElementById('importdatafile').click();
                        }} />
                        <img src={importIcon} alt={"Remonter"} width={16} height={16} style={{ cursor: 'pointer' }} title="Exporter mes données" onClick={() => exportData()} />
                    </h5>
                    <div className="data-grid-blocks" >
                        <div className="data-grid-block" >
                            <div className="data-grid-block_title" >
                                <input type="checkbox" checked={(options?.views?.from?.name ?? false)} onChange={(e) => setOptions(old => ({
                                    ...old,
                                    views: {
                                        ...(old.views ?? {}),
                                        from: {
                                            ...(old.views?.from ?? {}),
                                            name: e.target.checked
                                        }
                                    }
                                }))} title={(options?.views?.from?.name ?? false) === true ? "Masquer cet élément" : "Afficher cet élément"} />
                                <label htmlFor="from_name"><b>Dénomination / Raison sociale</b></label>
                            </div>
                            <input className={(options?.views?.from?.name ?? false) === false ? 'disabled' : ''} type="text" name="from_name" id="from_name" value={options?.infos?.from?.name ?? ''} onChange={(e) => {
                                setOptions(old => ({
                                    ...old,
                                    infos: {
                                        ...(old.infos ?? {}),
                                        from: {
                                            ...(old.infos?.from ?? {}),
                                            name: e.target.value
                                        }
                                    }
                                }))
                            }} placeholder="" disabled={!(options?.views?.from?.name ?? false)} />
                        </div>

                        <div className="data-grid-block" >
                            <div className="data-grid-block_title" >
                                <input type="checkbox" checked={(options?.views?.from?.photo ?? false)} onChange={(e) => setOptions(old => ({
                                    ...old,
                                    views: {
                                        ...(old.views ?? {}),
                                        from: {
                                            ...(old.views?.from ?? {}),
                                            photo: e.target.checked
                                        }
                                    }
                                }))} title={(options?.views?.from?.photo ?? false) === true ? "Masquer cet élément" : "Afficher cet élément"} />
                                <label htmlFor="from_photo"><b>Logo</b></label>
                            </div>
                            <input className={(options?.views?.from?.photo ?? false) === false ? 'disabled' : ''} type="text" name="from_photo" id="from_photo" value={options?.infos?.from?.photo ?? ''} onChange={(e) => {
                                setOptions(old => ({
                                    ...old,
                                    infos: {
                                        ...(old.infos ?? {}),
                                        from: {
                                            ...(old.infos?.from ?? {}),
                                            photo: e.target.value
                                        }
                                    }
                                }))
                            }} placeholder="url valide de votre logo" disabled={!(options?.views?.from?.photo ?? false)} />
                        </div>

                        <div className="data-grid-block" >
                            <div className="data-grid-block_title" >
                                <input type="checkbox" checked={(options?.views?.from?.siret ?? false)} onChange={(e) => setOptions(old => ({
                                    ...old,
                                    views: {
                                        ...(old.views ?? {}),
                                        from: {
                                            ...(old.views?.from ?? {}),
                                            siret: e.target.checked
                                        }
                                    }
                                }))} title={(options?.views?.from?.siret ?? false) === true ? "Masquer cet élément" : "Afficher cet élément"} />
                                <label htmlFor="from_siret"><b>Numéro de SIRET / SIREN</b></label>
                            </div>
                            <input className={(options?.views?.from?.siret ?? false) === false ? 'disabled' : ''} type="text" name="from_siret" id="from_siret" value={options?.infos?.from?.siret ?? ''} onChange={(e) => {
                                setOptions(old => ({
                                    ...old,
                                    infos: {
                                        ...(old.infos ?? {}),
                                        from: {
                                            ...(old.infos?.from ?? {}),
                                            siret: e.target.value
                                        }
                                    }
                                }))
                            }} placeholder="" disabled={!(options?.views?.from?.siret ?? false)} />
                        </div>

                        <div className="data-grid-block" >
                            <div className="data-grid-block_title" >
                                <input type="checkbox" checked={(options?.views?.from?.postalAddress ?? false)} onChange={(e) => setOptions(old => ({
                                    ...old,
                                    views: {
                                        ...(old.views ?? {}),
                                        from: {
                                            ...(old.views?.from ?? {}),
                                            postalAddress: e.target.checked
                                        }
                                    }
                                }))} title={(options?.views?.from?.postalAddress ?? false) === true ? "Masquer cet élément" : "Afficher cet élément"} />
                                <label htmlFor="from_postalAddress"><b>Adresse postale</b></label>
                            </div>
                            <textarea rows={4} className={(options?.views?.from?.postalAddress ?? false) === false ? 'disabled' : ''} type="text" name="from_postalAddress" id="from_postalAddress" value={options?.infos?.from?.postalAddress ?? ''} onChange={(e) => {
                                setOptions(old => ({
                                    ...old,
                                    infos: {
                                        ...(old.infos ?? {}),
                                        from: {
                                            ...(old.infos?.from ?? {}),
                                            postalAddress: e.target.value
                                        }
                                    }
                                }))
                            }} placeholder="" disabled={!(options?.views?.from?.postalAddress ?? false)} />
                        </div>

                        <div className="data-grid-block" >
                            <div className="data-grid-block_title" >
                                <input type="checkbox" checked={(options?.views?.from?.email ?? false)} onChange={(e) => setOptions(old => ({
                                    ...old,
                                    views: {
                                        ...(old.views ?? {}),
                                        from: {
                                            ...(old.views?.from ?? {}),
                                            email: e.target.checked
                                        }
                                    }
                                }))} title={(options?.views?.from?.email ?? false) === true ? "Masquer cet élément" : "Afficher cet élément"} />
                                <label htmlFor="from_email"><b>Adresse email</b></label>
                            </div>
                            <input className={(options?.views?.from?.email ?? false) === false ? 'disabled' : ''} type="email" name="from_email" id="from_email" value={options?.infos?.from?.email ?? ''} onChange={(e) => {
                                setOptions(old => ({
                                    ...old,
                                    infos: {
                                        ...(old.infos ?? {}),
                                        from: {
                                            ...(old.infos?.from ?? {}),
                                            email: e.target.value
                                        }
                                    }
                                }))
                            }} placeholder="" disabled={!(options?.views?.from?.email ?? false)} />
                        </div>

                        <div className="data-grid-block" >
                            <div className="data-grid-block_title" >
                                <input type="checkbox" checked={(options?.views?.from?.phone ?? false)} onChange={(e) => setOptions(old => ({
                                    ...old,
                                    views: {
                                        ...(old.views ?? {}),
                                        from: {
                                            ...(old.views?.from ?? {}),
                                            phone: e.target.checked
                                        }
                                    }
                                }))} title={(options?.views?.from?.phone ?? false) === true ? "Masquer cet élément" : "Afficher cet élément"} />
                                <label htmlFor="from_phone"><b>Numéro de téléphone</b></label>
                            </div>
                            <input className={(options?.views?.from?.phone ?? false) === false ? 'disabled' : ''} type="tel" name="from_phone" id="from_phone" value={options?.infos?.from?.phone ?? ''} onChange={(e) => {
                                setOptions(old => ({
                                    ...old,
                                    infos: {
                                        ...(old.infos ?? {}),
                                        from: {
                                            ...(old.infos?.from ?? {}),
                                            phone: e.target.value
                                        }
                                    }
                                }))
                            }} placeholder="" disabled={!(options?.views?.from?.phone ?? false)} />
                        </div>
                    </div>
                </div>

                <div className="data-grid-column" style={{ background: 'initial' }}>
                    <h5><span>Données relatives au client</span></h5>
                    <div className="data-grid-blocks" >
                        <div className="data-grid-block" >
                            <div className="data-grid-block_title" >
                                <input type="checkbox" checked={(options?.views?.to?.name ?? false)} onChange={(e) => setOptions(old => ({
                                    ...old,
                                    views: {
                                        ...(old.views ?? {}),
                                        to: {
                                            ...(old.views?.to ?? {}),
                                            name: e.target.checked
                                        }
                                    }
                                }))} title={(options?.views?.to?.name ?? false) === true ? "Masquer cet élément" : "Afficher cet élément"} />
                                <label htmlFor="to_name"><b>Nom du client</b></label>
                            </div>
                            <input className={(options?.views?.to?.name ?? false) === false ? 'disabled' : ''} type="text" name="to_name" id="to_name" value={options?.infos?.to?.name ?? ''} onChange={(e) => {
                                setOptions(old => ({
                                    ...old,
                                    infos: {
                                        ...(old.infos ?? {}),
                                        to: {
                                            ...(old.infos?.to ?? {}),
                                            name: e.target.value
                                        }
                                    }
                                }))
                            }} placeholder="" disabled={!(options?.views?.to?.name ?? false)} />
                        </div>

                        <div className="data-grid-block" >
                            <div className="data-grid-block_title" >
                                <input type="checkbox" checked={(options?.views?.to?.postalAddress ?? false)} onChange={(e) => setOptions(old => ({
                                    ...old,
                                    views: {
                                        ...(old.views ?? {}),
                                        to: {
                                            ...(old.views?.to ?? {}),
                                            postalAddress: e.target.checked
                                        }
                                    }
                                }))} title={(options?.views?.to?.postalAddress ?? false) === true ? "Masquer cet élément" : "Afficher cet élément"} />
                                <label htmlFor="to_postalAddress"><b>Adresse postale</b></label>
                            </div>
                            <textarea rows={4} className={(options?.views?.to?.postalAddress ?? false) === false ? 'disabled' : ''} type="text" name="to_postalAddress" id="to_postalAddress" value={options?.infos?.to?.postalAddress ?? ''} onChange={(e) => {
                                setOptions(old => ({
                                    ...old,
                                    infos: {
                                        ...(old.infos ?? {}),
                                        to: {
                                            ...(old.infos?.to ?? {}),
                                            postalAddress: e.target.value
                                        }
                                    }
                                }))
                            }} placeholder="" disabled={!(options?.views?.to?.postalAddress ?? false)} />
                        </div>

                        <div className="data-grid-block" >
                            <div className="data-grid-block_title" >
                                <input type="checkbox" checked={(options?.views?.to?.email ?? false)} onChange={(e) => setOptions(old => ({
                                    ...old,
                                    views: {
                                        ...(old.views ?? {}),
                                        to: {
                                            ...(old.views?.to ?? {}),
                                            email: e.target.checked
                                        }
                                    }
                                }))} title={(options?.views?.to?.email ?? false) === true ? "Masquer cet élément" : "Afficher cet élément"} />
                                <label htmlFor="to_email"><b>Adresse email</b></label>
                            </div>
                            <input className={(options?.views?.to?.email ?? false) === false ? 'disabled' : ''} type="email" name="to_email" id="to_email" value={options?.infos?.to?.email ?? ''} onChange={(e) => {
                                setOptions(old => ({
                                    ...old,
                                    infos: {
                                        ...(old.infos ?? {}),
                                        to: {
                                            ...(old.infos?.to ?? {}),
                                            email: e.target.value
                                        }
                                    }
                                }))
                            }} placeholder="" disabled={!(options?.views?.to?.email ?? false)} />
                        </div>

                        <div className="data-grid-block" >
                            <div className="data-grid-block_title" >
                                <input type="checkbox" checked={(options?.views?.to?.phone ?? false)} onChange={(e) => setOptions(old => ({
                                    ...old,
                                    views: {
                                        ...(old.views ?? {}),
                                        to: {
                                            ...(old.views?.to ?? {}),
                                            phone: e.target.checked
                                        }
                                    }
                                }))} title={(options?.views?.to?.phone ?? false) === true ? "Masquer cet élément" : "Afficher cet élément"} />
                                <label htmlFor="to_phone"><b>Numéro de téléphone</b></label>
                            </div>
                            <input className={(options?.views?.to?.phone ?? false) === false ? 'disabled' : ''} type="tel" name="to_phone" id="to_phone" value={options?.infos?.to?.phone ?? ''} onChange={(e) => {
                                setOptions(old => ({
                                    ...old,
                                    infos: {
                                        ...(old.infos ?? {}),
                                        to: {
                                            ...(old.infos?.to ?? {}),
                                            phone: e.target.value
                                        }
                                    }
                                }))
                            }} placeholder="" disabled={!(options?.views?.to?.phone ?? false)} />
                        </div>
                    </div>
                </div>

                <div className="data-grid-column" style={{ background: 'initial' }}>
                    <h5><span>Données diverses</span></h5>
                    <div className="data-grid-blocks" style={{ gap: '0.5rem' }} >
                        <div className="data-grid-block" >
                            <div className="data-grid-block_title" >
                                <input type="checkbox" checked={(options?.views?.projectName ?? false)} onChange={(e) => setOptions(old => ({
                                    ...old,
                                    views: {
                                        ...(old.views ?? {}),
                                        projectName: e.target.checked
                                    }
                                }))} title={(options?.views?.projectName ?? false) === true ? "Masquer cet élément" : "Afficher cet élément"} />
                                <label htmlFor="to_name" style={{ fontSize: '90%' }}>Afficher le nom du projet</label>
                            </div>
                        </div>

                        <div className="data-grid-block" >
                            <div className="data-grid-block_title" >
                                <input type="checkbox" checked={(options?.views?.projectVersion ?? false)} onChange={(e) => setOptions(old => ({
                                    ...old,
                                    views: {
                                        ...(old.views ?? {}),
                                        projectVersion: e.target.checked
                                    }
                                }))} title={(options?.views?.projectVersion ?? false) === true ? "Masquer cet élément" : "Afficher cet élément"} />
                                <label htmlFor="to_name" style={{ fontSize: '90%' }}>Afficher la version du projet</label>
                            </div>
                        </div>

                        <div className="data-grid-block" >
                            <div className="data-grid-block_title" >
                                <input type="checkbox" checked={(options?.views?.projectCreated ?? false)} onChange={(e) => setOptions(old => ({
                                    ...old,
                                    views: {
                                        ...(old.views ?? {}),
                                        projectCreated: e.target.checked
                                    }
                                }))} title={(options?.views?.projectCreated ?? false) === true ? "Masquer cet élément" : "Afficher cet élément"} />
                                <label htmlFor="to_name" style={{ fontSize: '90%' }}>Afficher la date de création</label>
                            </div>
                        </div>

                        <div className="data-grid-block" >
                            <div className="data-grid-block_title" >
                                <input type="checkbox" checked={(options?.views?.projectUpdated ?? false)} onChange={(e) => setOptions(old => ({
                                    ...old,
                                    views: {
                                        ...(old.views ?? {}),
                                        projectUpdated: e.target.checked
                                    }
                                }))} title={(options?.views?.projectUpdated ?? false) === true ? "Masquer cet élément" : "Afficher cet élément"} />
                                <label htmlFor="to_name" style={{ fontSize: '90%' }}>Afficher la date de dernière modification</label>
                            </div>
                        </div>

                        <div className="data-grid-block" >
                            <div className="data-grid-block_title" >
                                <input type="checkbox" checked={(options?.views?.projectType ?? false)} onChange={(e) => setOptions(old => ({
                                    ...old,
                                    views: {
                                        ...(old.views ?? {}),
                                        projectType: e.target.checked
                                    }
                                }))} title={(options?.views?.projectType ?? false) === true ? "Masquer cet élément" : "Afficher cet élément"} />
                                <label htmlFor="to_name" style={{ fontSize: '90%' }}>Afficher le type de l'installation</label>
                            </div>
                        </div>

                        <div className="data-grid-block" >
                            <div className="data-grid-block_title" >
                                <input type="checkbox" checked={(options?.views?.projectVRef ?? false)} onChange={(e) => setOptions(old => ({
                                    ...old,
                                    views: {
                                        ...(old.views ?? {}),
                                        projectVRef: e.target.checked
                                    }
                                }))} title={(options?.views?.projectVRef ?? false) === true ? "Masquer cet élément" : "Afficher cet élément"} />
                                <label htmlFor="to_name" style={{ fontSize: '90%' }}>Afficher la tension de l'installation</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className={`tabPages_page-content ${tab === 2 ? 'selected' : ''}`.trim()} style={{ background: '#F9F9F9' }}>
            <div className="fppage-container">
                <div className="fppage">
                    <div className="fppage-header" data-margin-top={`tiquettes.fr ${pkg.version}`}>Tableau électrique</div>

                    <div className="ffpage-box" style={{
                        left: '10mm',
                        top: '55mm',
                        width: 'calc(210mm - 20mm)',
                        height: '60mm'
                    }}>
                        <span className="ffpage-item" style={{
                            left: '2mm',
                            top: '1mm',
                            fontSize: '10pt',
                            color: 'var(--primary-color)'
                        }}>Installateur</span>

                        {(options?.views?.from?.photo ?? false) === true
                            && options?.infos?.from?.photo
                            && <div className="ffpage-item" style={{
                                left: '11mm',
                                top: '12mm',
                                width: '30mm',
                                height: '30mm',
                                display: 'grid',
                                placeItems: 'center'
                            }}>
                                <img src={options?.infos?.from?.photo} style={{
                                    maxWidth: '100%'
                                }} />
                            </div>}

                        {(options?.views?.from?.siret ?? false) === true
                            && typeof options?.infos?.from?.siret === 'string'
                            && <span className="ffpage-item" style={{
                                left: '8mm',
                                top: '50mm',
                                width: '150px',
                                fontSize: '10pt'
                            }}>S / {options?.infos?.from?.siret}</span>}

                        {(options?.views?.from?.name ?? false) === true
                            && typeof options?.infos?.from?.name === 'string'
                            && <span className="ffpage-item" style={{
                                left: '65mm',
                                top: '6mm',
                                width: '115mm',
                                fontSize: '16pt',
                                fontWeight: 'bold',
                            }}>{options?.infos?.from?.name}</span>}

                        {(options?.views?.from?.postalAddress ?? false) === true
                            && typeof options?.infos?.from?.postalAddress === 'string'
                            && <span className="ffpage-item" style={{
                                wordWrap: 'break-word',
                                whiteSpace: 'pre-wrap',
                                left: '65mm',
                                top: '15mm',
                                width: '115mm',
                                height: '25mm',
                                fontSize: '12pt'
                            }}>{options?.infos?.from?.postalAddress}</span>}

                        {(options?.views?.from?.email ?? false) === true
                            && typeof options?.infos?.from?.email === 'string'
                            && <span className="ffpage-item" style={{
                                left: '65mm',
                                top: '42mm',
                                width: '115mm',
                                fontSize: '12pt'
                            }}>Email: {options?.infos?.from?.email}</span>}

                        {(options?.views?.from?.phone ?? false) === true
                            && typeof options?.infos?.from?.phone === 'string'
                            && <span className="ffpage-item" style={{
                                left: '65mm',
                                top: '49mm',
                                width: '115mm',
                                fontSize: '12pt'
                            }}>Téléphone: {options?.infos?.from?.phone}</span>}
                    </div>

                    <div className="ffpage-box" style={{
                        left: '10mm',
                        top: '120mm',
                        width: 'calc(210mm - 20mm)',
                        height: '60mm'
                    }}>
                        <span className="ffpage-item" style={{
                            left: '2mm',
                            top: '1mm',
                            fontSize: '10pt',
                            color: 'var(--primary-color)'
                        }}>Client</span>

                        <img className="ffpage-item" style={{
                            left: '11mm',
                            top: '12mm',
                            width: '30mm',
                            height: '30mm'
                        }}
                            src={'https://github.com/pantaflex44/Tiquettes/blob/main/public/android-chrome-512x512.png?raw=true'} width={114} height={114} />

                        <span className="ffpage-item" style={{
                            left: '11mm',
                            top: '48mm',
                            width: '150px',
                            fontSize: '10pt'
                        }}>Dossier réalisé avec</span>
                        <span className="ffpage-item" style={{
                            left: '11mm',
                            top: '52mm',
                            width: '150px',
                            fontSize: '10pt'
                        }}><b>Tiquettes.fr {pkg.version}</b></span>

                        {(options?.views?.to?.name ?? false) === true
                            && typeof options?.infos?.to?.name === 'string'
                            && <span className="ffpage-item" style={{
                                left: '65mm',
                                top: '6mm',
                                width: '115mm',
                                fontSize: '16pt',
                                fontWeight: 'bold'
                            }}>{options?.infos?.to?.name}</span>}

                        {(options?.views?.to?.postalAddress ?? false) === true
                            && typeof options?.infos?.to?.postalAddress === 'string'
                            && <span className="ffpage-item" style={{
                                wordWrap: 'break-word',
                                whiteSpace: 'pre-wrap',
                                left: '65mm',
                                top: '15mm',
                                width: '115mm',
                                height: '25mm',
                                fontSize: '12pt'
                            }}>{options?.infos?.to?.postalAddress}</span>}

                        {(options?.views?.to?.email ?? false) === true
                            && typeof options?.infos?.to?.email === 'string'
                            && <span className="ffpage-item" style={{
                                left: '65mm',
                                top: '42mm',
                                width: '115mm',
                                fontSize: '12pt'
                            }}>Email: {options?.infos?.to?.email}</span>}

                        {(options?.views?.to?.phone ?? false) === true
                            && typeof options?.infos?.to?.phone === 'string'
                            && <span className="ffpage-item" style={{
                                left: '65mm',
                                top: '49mm',
                                width: '115mm',
                                fontSize: '12pt'
                            }}>Téléphone: {options?.infos?.to?.phone}</span>}
                    </div>

                    <div className="ffpage-box" style={{
                        left: '10mm',
                        top: '185mm',
                        width: 'calc(210mm - 20mm)',
                        height: '100mm'
                    }}>
                        <span className="ffpage-item" style={{
                            left: '2mm',
                            top: '1mm',
                            fontSize: '10pt',
                            color: 'var(--primary-color)'
                        }}>Nom du projet</span>
                        {(options?.views?.projectName ?? false) === true &&
                            <span className="ffpage-item" style={{
                                left: '8mm',
                                top: '9mm',
                                width: '175mm',
                                fontSize: '14pt',
                            }}><b>{switchboard.prjname}</b></span>
                        }
                        <div className="ffpage-line" style={{
                            left: 0,
                            top: '35mm',
                            width: '190mm'
                        }}></div>
                        <span className="ffpage-item" style={{
                            left: '2mm',
                            top: '38mm',
                            fontSize: '10pt',
                            color: 'var(--primary-color)'
                        }}>Révision</span>
                        {(options?.views?.projectVersion ?? false) === true && <>
                            <span className="ffpage-item" style={{
                                left: '40mm',
                                top: '38mm',
                                fontSize: '15pt',
                            }}><b>{switchboard.prjversion}</b></span>
                            <span className="ffpage-item" style={{
                                left: '60mm',
                                top: '39mm',
                                fontSize: '10pt',
                            }}>{switchboard.appversion}</span>
                        </>
                        }
                        <div className="ffpage-line" style={{
                            left: 0,
                            top: '46mm',
                            width: '190mm'
                        }}></div>
                        <span className="ffpage-item" style={{
                            left: '2mm',
                            top: '48mm',
                            fontSize: '10pt',
                            color: 'var(--primary-color)'
                        }}>Date de création</span>
                        {(options?.views?.projectCreated ?? false) === true &&
                            <span className="ffpage-item" style={{
                                left: '40mm',
                                top: '48mm',
                                fontSize: '15pt',
                            }}><b>{switchboard.prjcreated.toLocaleDateString()}</b></span>
                        }
                        <span className="ffpage-item" style={{
                            left: '95mm',
                            top: '48mm',
                            fontSize: '10pt',
                            color: 'var(--primary-color)'
                        }}>Dernière modification</span>
                        {(options?.views?.projectUpdated ?? false) === true &&
                            <span className="ffpage-item" style={{
                                left: '140mm',
                                top: '48mm',
                                fontSize: '15pt',
                            }}><b>{switchboard.prjupdated.toLocaleDateString()}</b></span>
                        }
                        <div className="ffpage-line" style={{
                            left: 0,
                            top: '56mm',
                            width: '190mm'
                        }}></div>
                        <span className="ffpage-item" style={{
                            left: '2mm',
                            top: '58mm',
                            fontSize: '10pt',
                            color: 'var(--primary-color)'
                        }}>Type d'installation</span>
                        {(options?.views?.projectType ?? false) === true &&
                            <span className="ffpage-item" style={{
                                left: '40mm',
                                top: '58mm',
                                fontSize: '15pt',
                            }}><b>{switchboard.projectType === 'R' ? 'Résidentiel' : (switchboard.projectType === 'T' ? 'Tertiaire' : '')}</b></span>
                        }
                        <span className="ffpage-item" style={{
                            left: '95mm',
                            top: '58mm',
                            fontSize: '10pt',
                            color: 'var(--primary-color)'
                        }}>Tension de référence</span>
                        {(options?.views?.projectVRef ?? false) === true &&
                            <span className="ffpage-item" style={{
                                left: '140mm',
                                top: '58mm',
                                fontSize: '15pt',
                            }}><b>{switchboard.vref}V</b></span>
                        }
                        <div className="ffpage-line" style={{
                            left: 0,
                            top: '66mm',
                            width: '190mm'
                        }}></div>
                        <span className="ffpage-item" style={{
                            left: '2mm',
                            top: '68mm',
                            fontSize: '10pt',
                            color: 'var(--primary-color)'
                        }}>Ce dossier contient</span>
                        <span className="ffpage-item" style={{
                            left: '8mm',
                            top: '78mm',
                            fontSize: '14pt',
                        }}><b>{printOptions.schema ? '☑' : '☐'} Schéma unifilaire</b></span>
                        <span className="ffpage-item" style={{
                            left: '8mm',
                            top: '86mm',
                            fontSize: '14pt',
                        }}><b>{printOptions.summary ? '☑' : '☐'} Nomenclature</b></span>

                    </div>

                </div>
            </div>
        </div>

        <input id="importdatafile" ref={importRef} type="file" onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) importData(e.target.files[0]);
        }} style={{ visibility: 'hidden', position: 'absolute', top: '0', left: '-500000px' }} />
    </Popup >
}