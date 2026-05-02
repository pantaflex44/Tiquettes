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
import { useEffect, useMemo, useState } from "react";

import labelersOptions from "../labelers_options.json";

import "../css/labelerPopup.css";

import exportLabelerTextOrientationHIcon from "../assets/text-orientation-h.svg";
import exportLabelerTextOrientationVIcon from "../assets/text-orientation-v.svg";
import exportLabelerTextSize1Icon from "../assets/text-size-1.svg";
import exportLabelerTextSize2Icon from "../assets/text-size-2.svg";
import exportLabelerTextSize3Icon from "../assets/text-size-3.svg";
import downloadIcon from "../assets/download.svg";

import Popup from "./Popup.jsx";


export default function LabelerPopup({
    switchboard,
    onApply,
    onCancel
}) {
    const [model, setModel] = useState('');
    const [options, setOptions] = useState(null);
    const [labelersList, setLabelersList] = useState({});

    useEffect(() => {
        let $groups = {};
        for (const key in labelersOptions) {
            const labeler = labelersOptions[key];
            const group = labeler.group ?? "Autres";
            if (!$groups[group]) {
                $groups[group] = [];
            }
            $groups[group].push(labeler);
        }
        setLabelersList($groups);
    }, [labelersOptions]);

    const defaultOptions = useMemo(() => {
        if (!model) return null;
        const labeler = labelersOptions[model];
        const o = labeler ?? null;
        setOptions(o);
        return o;
    }, [labelersOptions, model]);

    const apply = () => {
        if (!onApply || !model || !options) return;
        onApply(model, options);
    }

    return <Popup
        title={"Paramètres d'exportation"}
        showCloseButton={true}
        showOkButton={true}
        showCancelButton={true}
        width={440}
        onOk={apply}
        okButtonDisabled={!model || !options}
        onCancel={onCancel}
        okButtonContent={
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', columnGap: '0.5rem' }}
                title={"Exporter les étiquettes pour cette étiqueteuse"}>
                <img src={downloadIcon} alt={"Exporter"} width={20} height={20} />
                <span>Exporter</span>
            </div>
        }
    >
        <div style={{ flex: 1 }}>
            <div className="popup_row" style={{
                "--left_column_size": "160px", alignItems: 'center', borderBottom: `1px solid ${options?.ribbon ? 'lightgray' : 'transparent'}`,
                paddingBottom: "1em",
                marginBottom: "1em",
            }}>
                <label htmlFor={`labeler_model`}>Étiqueteuse</label>
                <select name="labeler_model" id={`labeler_model`} value={model} onChange={(e) => setModel(e.target.value)} autoFocus={true}>
                    <option value="" disabled>--Sélectionner un modèle--</option>
                    {Object.keys(labelersList).map((group) => {
                        return <optgroup key={group} label={group}>
                            {labelersList[group].map((labeler) => {
                                return <option key={labeler.model} value={labeler.model}>{labeler.title}</option>
                            })}
                        </optgroup>
                    })}
                </select>
            </div>
            {options?.dpi && (
                <div className="popup_row" style={{ "--left_column_size": "160px", alignItems: 'center' }}>
                    <label htmlFor={`labeler_dpi_x`}>Résolutions</label>
                    <div className="popup_row-flex" style={{ display: 'grid', gridTemplateColumns: '1fr 10px 1fr', gridTemplateRows: '1fr', alignItems: 'center', gap: '0.75rem' }}>
                        <input className="minheight" type="number" name={`labeler_dpi_x`} id={`labeler_dpi_x`} value={options.dpi.x} onChange={(e) => setOptions((old) => {
                            const newOptions = {
                                ...old,
                                dpi: {
                                    ...old.dpi,
                                    x: parseInt(e.target.value)
                                }
                            }
                            return newOptions;
                        })} />
                        <span>x</span>
                        <input className="minheight" type="number" name={`labeler_dpi_y`} id={`labeler_dpi_y`} value={options.dpi.y} onChange={(e) => setOptions((old) => {
                            const newOptions = {
                                ...old,
                                dpi: {
                                    ...old.dpi,
                                    y: parseInt(e.target.value)
                                }
                            }
                            return newOptions;
                        })} />
                    </div>
                </div>
            )}
            {options?.ribbon?.steps && (
                <div className="popup_row" style={{ "--left_column_size": "160px", alignItems: 'center' }}>
                    <label htmlFor={`labeler_ribbon`}>Hauteur du ruban</label>
                    <select name="labeler_ribbon" id="labeler_ribbon" value={options.ribbon.value} onChange={(e) => setOptions((old) => {
                        const newOptions = {
                            ...old,
                            ribbon: {
                                ...old.ribbon,
                                value: e.target.value
                            }
                        }
                        return newOptions;
                    })}>
                        {options.ribbon.steps.map((step) => {
                            return <option key={step} value={step}>{step} mm</option>
                        })}
                    </select>
                </div>
            )}
            {options &&
                <div className="popup_row" style={{ "--left_column_size": "160px", alignItems: 'center' }}>
                    <label htmlFor={`labeler_stepsize`}>Largeur des modules</label>
                    <select name="labeler_stepsize" id="labeler_stepsize" value={options?.stepSize?.value ?? switchboard.stepSize} onChange={(e) => setOptions((old) => {
                        const newOptions = {
                            ...old,
                            stepSize: {
                                ...old.stepSize,
                                value: e.target.value
                            }
                        }
                        return newOptions;
                    })}>
                        <option value={17.5}>17.5 mm</option>
                        <option value={18}>18 mm</option>
                    </select>
                </div>
            }
            {options?.options && (
                <div className="popup_row" style={{
                    "--left_column_size": "160px", alignItems: 'baseline', borderTop: `1px solid ${options?.ribbon ? 'lightgray' : 'transparent'}`,
                    paddingTop: "1em",
                    marginTop: "1em",
                }}>
                    <label htmlFor={`labeler_ribbon`}>Options d'affichage</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {options?.options?.invert?.has === true && (
                            <div className="popup_row-flex" style={{ alignItems: 'center' }}>
                                <label>Inverser</label>
                                <input type="checkbox" name={`labeler_invert`} id={`labeler_invert`} checked={options.options.invert.value} onChange={(e) => setOptions((old) => {
                                    const newOptions = {
                                        ...old,
                                        options: {
                                            ...old.options,
                                            invert: {
                                                ...old.options.invert,
                                                value: e.target.checked
                                            }
                                        }
                                    }
                                    return newOptions;
                                })} />
                            </div>
                        )}
                        {options?.options?.icons?.has === true && (
                            <div className="popup_row-flex" style={{ alignItems: 'center' }}>
                                <label>Afficher les icônes</label>
                                <input type="checkbox" name={`labeler_icons`} id={`labeler_icons`} checked={options.options.icons.value} onChange={(e) => setOptions((old) => {
                                    const newOptions = {
                                        ...old,
                                        options: {
                                            ...old.options,
                                            icons: {
                                                ...old.options.icons,
                                                value: e.target.checked
                                            }
                                        }
                                    }
                                    return newOptions;
                                })} />
                            </div>
                        )}
                        {options?.options?.text?.has === true && (
                            <div className="popup_row-flex" style={{ alignItems: 'center' }}>
                                <label>Afficher le texte</label>
                                <input type="checkbox" name={`labeler_text`} id={`labeler_text`} checked={options.options.text.value} onChange={(e) => setOptions((old) => {
                                    const newOptions = {
                                        ...old,
                                        options: {
                                            ...old.options,
                                            text: {
                                                ...old.options.text,
                                                value: e.target.checked
                                            }
                                        }
                                    }
                                    return newOptions;
                                })} />
                            </div>
                        )}
                        {options?.options?.text?.has === true && options?.options?.text?.value === true && (
                            <>
                                <div className="popup_row-flex" style={{ alignItems: 'center', margin: 0, gap: '0.75rem' }}>
                                    <div style={{ marginLeft: '1rem' }}>Taille</div>
                                    <div style={{ display: 'flex', flexDirection: 'row', gap: '0.25rem', alignItems: 'center' }}>
                                        <input type="checkbox" name={'labeler_text_size'} id={'labeler_text_size'} checked={options.options?.textSize?.value === 'small'} onChange={(e) => setOptions((old) => {
                                            const newOptions = {
                                                ...old,
                                                options: {
                                                    ...old.options,
                                                    textSize: {
                                                        ...old.options.textSize,
                                                        value: 'small'
                                                    }
                                                }
                                            }
                                            return newOptions;
                                        })} />
                                        <img src={exportLabelerTextSize1Icon} width={18} height={18} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'row', gap: '0.25rem', alignItems: 'center' }}>
                                        <input type="checkbox" name={'labeler_text_size'} id={'labeler_text_size'} checked={options.options?.textSize?.value === 'normal'} onChange={(e) => setOptions((old) => {
                                            const newOptions = {
                                                ...old,
                                                options: {
                                                    ...old.options,
                                                    textSize: {
                                                        ...old.options.textSize,
                                                        value: 'normal'
                                                    }
                                                }
                                            }
                                            return newOptions;
                                        })} />
                                        <img src={exportLabelerTextSize2Icon} width={18} height={18} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'row', gap: '0.5rem', alignItems: 'center' }}>
                                        <input type="checkbox" name={'labeler_text_size'} id={'labeler_text_size'} checked={options.options?.textSize?.value === 'large'} onChange={(e) => setOptions((old) => {
                                            const newOptions = {
                                                ...old,
                                                options: {
                                                    ...old.options,
                                                    textSize: {
                                                        ...old.options.textSize,
                                                        value: 'large'
                                                    }
                                                }
                                            }
                                            return newOptions;
                                        })} />
                                        <img src={exportLabelerTextSize3Icon} width={18} height={18} />
                                    </div>
                                </div>
                                <div className="popup_row-flex" style={{ alignItems: 'center', margin: 0, gap: '0.75rem' }}>
                                    <div style={{ marginLeft: '1rem' }}>Orientation</div>
                                    <div style={{ display: 'flex', flexDirection: 'row', gap: '0.5rem', alignItems: 'center' }}>
                                        <input type="checkbox" name={'labeler_text_orientation'} id={'labeler_text_orientation'} checked={options.options?.textOrientation?.value === 'horizontal'} onChange={(e) => setOptions((old) => {
                                            const newOptions = {
                                                ...old,
                                                options: {
                                                    ...old.options,
                                                    textOrientation: {
                                                        ...old.options.textSize,
                                                        value: 'horizontal'
                                                    }
                                                }
                                            }
                                            return newOptions;
                                        })} />
                                        <img src={exportLabelerTextOrientationHIcon} width={18} height={18} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'row', gap: '0.5rem', alignItems: 'center' }}>
                                        <input type="checkbox" name={'labeler_text_orientation'} id={'labeler_text_orientation'} checked={options.options?.textOrientation?.value === 'vertical'} onChange={(e) => setOptions((old) => {
                                            const newOptions = {
                                                ...old,
                                                options: {
                                                    ...old.options,
                                                    textOrientation: {
                                                        ...old.options.textSize,
                                                        value: 'vertical'
                                                    }
                                                }
                                            }
                                            return newOptions;
                                        })} />
                                        <img src={exportLabelerTextOrientationVIcon} width={18} height={18} />
                                    </div>
                                </div>
                            </>
                        )}



                    </div>
                </div>
            )}
        </div>
    </Popup>
}