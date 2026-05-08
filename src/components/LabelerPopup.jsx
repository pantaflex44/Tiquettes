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

import "../css/labelerPopup.css";
import * as pkg from '../../package.json';
import labelersOptions from "../labelers_options.json";

import exportLabelerTextOrientationHIcon from "../assets/text-orientation-h.svg";
import exportLabelerTextOrientationVIcon from "../assets/text-orientation-v.svg";
import exportLabelerTextNoneIcon from "../assets/text-size-none.svg";
import exportLabelerTextSize1Icon from "../assets/text-size-1.svg";
import exportLabelerTextSize2Icon from "../assets/text-size-2.svg";
import exportLabelerTextSize3Icon from "../assets/text-size-3.svg";
import exportLabelerIconNoneIcon from "../assets/icon-size-none.svg";
import exportLabelerIconSize1Icon from "../assets/icon-size-1.svg";
import exportLabelerIconSize2Icon from "../assets/icon-size-2.svg";
import exportLabelerIconSize3Icon from "../assets/icon-size-3.svg";
import downloadIcon from "../assets/download.svg";
import borderLeftIcon from "../assets/border-left.svg";
import borderTopIcon from "../assets/border-top.svg";
import borderRightIcon from "../assets/border-right.svg";
import borderBottomIcon from "../assets/border-bottom.svg";
import borderInterIcon from "../assets/border-inter.svg";
import trimExtIcon from "../assets/trim-ext.svg";
import trimAllIcon from "../assets/trim-all.svg";
import trimNoneIcon from "../assets/trim-none.svg";
import containerIcon from "../assets/container.svg";
import containerInvertIcon from "../assets/container-invert.svg";

import Popup from "./Popup.jsx";


export default function LabelerPopup({
    switchboard,
    onApply,
    onCancel
}) {
    const getSavedLabelersOptions = () => {
        if (sessionStorage.getItem(pkg.name + '_labelersOptions')) {
            const merge = (a, b) => [a, b].reduce((r, o) => Object
                .entries(o)
                .reduce((q, [k, v]) => ({
                    ...q,
                    [k]: v && typeof v === 'object' ? merge(q[k] || {}, v) : v
                }), r),
                {});
            return merge(labelersOptions, JSON.parse(sessionStorage.getItem(pkg.name + '_labelersOptions')));
        }
        return { ...labelersOptions };
    }

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
    }, [labelersOptions, model]);

    useEffect(() => {
        if (model && labelersOptions) {
            sessionStorage.setItem(pkg.name + '_labelersModel', model);

            const savedOptions = sessionStorage.getItem(pkg.name + '_labelersOptions_' + model);
            let o = {};

            if (savedOptions) {
                o = { ...labelersOptions[model], ...JSON.parse(savedOptions) };
            } else {
                const labeler = labelersOptions[model];
                o = labeler ?? {};
            }

            if (o.ribbon?.steps && typeof o.ribbon.steps === 'object' && !Array.isArray(o.ribbon.steps)) {
                o = { ...o, ribbon: { ...o.ribbon, steps: Object.values(o.ribbon.steps) } };
            }

            console.log(`Load options for model ${model}`);

            setOptions(o);
        }
    }, [labelersOptions, model]);

    const saveOptions = () => {
        if (labelersOptions && options && Object.keys(labelersOptions).includes(model)) {
            console.log(`Save options for model ${model}`);

            sessionStorage.setItem(pkg.name + '_labelersOptions_' + model, JSON.stringify({ ...labelersOptions[model], ...options }));
        }
    }

    const cancel = () => {
        saveOptions();

        if (onCancel) onCancel();
    }

    const apply = () => {
        if (!onApply || !model || !options) return;

        saveOptions();
        onApply(model, options);
    }

    useEffect(() => {
        const savedModel = sessionStorage.getItem(pkg.name + '_labelersModel');
        if (savedModel) {
            setModel(savedModel);
        }
    }, []);

    return <Popup
        title={"Paramètres d'exportation"}
        showCloseButton={true}
        showOkButton={true}
        showCancelButton={true}
        width={440}
        onOk={apply}
        okButtonDisabled={!model || !options}
        onCancel={cancel}
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
                "--left_column_size": "160px", alignItems: 'center'
            }}>
                <label htmlFor={`labeler_model`}><b>Étiqueteuse</b></label>
                <select name="labeler_model" id={`labeler_model`} value={model} onChange={(e) => {
                    saveOptions();
                    setModel(e.target.value);
                }} autoFocus={true}>
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
            {options && (
                <div className="popup_row" style={{
                    "--left_column_size": "160px", alignItems: 'center', borderBottom: '1px solid lightgray',
                    paddingBottom: "1em",
                    marginBottom: "1em",
                }}>
                    <label htmlFor={`labeler_init`}>Paramètres courants</label>
                    <button id={`labeler_init`} name={`labeler_init`} className="link" onClick={() => {
                        if (confirm("Voulez-vous remplacer les paramètres locaux par les paramètres originaux pour cette étiqueteuse ?")) {
                            sessionStorage.removeItem(pkg.name + '_labelersOptions_' + model);
                            setOptions(labelersOptions[model] ?? {});
                        }
                    }}>
                        Réinitialiser
                    </button>
                </div>
            )}
            {options?.dpi && (
                <div className="popup_row" style={{ "--left_column_size": "160px", alignItems: 'center' }}>
                    <label htmlFor={`labeler_dpi_x`}>Résolutions</label>
                    <div className="popup_row-flex" style={{ display: 'grid', gridTemplateColumns: '1fr 10px 1fr', gridTemplateRows: '1fr', alignItems: 'center', gap: '0.75rem' }}>
                        <input className="minheight" type="number" name={`labeler_dpi_x`} id={`labeler_dpi_x`} value={options.dpi.x} min={72} max={600} onChange={(e) => setOptions((old) => {
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
                        <input className="minheight" type="number" name={`labeler_dpi_y`} id={`labeler_dpi_y`} value={options.dpi.y} min={72} max={600} onChange={(e) => setOptions((old) => {
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
            {options?.ribbon?.range && (
                <div className="popup_row" style={{ "--left_column_size": "160px", alignItems: 'center' }}>
                    <label htmlFor={`labeler_ribbon_range`}>Hauteur du ruban</label>
                    <div className="popup_row-flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
                        <input id={'labeler_ribbon_range'} name={'labeler_ribbon_range'} type="range" min={Math.min(...(options?.ribbon?.range ?? [1, 1]))} max={Math.max(...(options?.ribbon?.range ?? [1, 1]))} step={1} value={options.ribbon.value} onChange={(e) => setOptions((old) => {
                            const newOptions = {
                                ...old,
                                ribbon: {
                                    ...old.ribbon,
                                    value: e.target.value
                                }
                            }
                            return newOptions;
                        })} />
                        <span style={{ fontSize: '90%', width: '50px', textAlign: 'right' }}>{options.ribbon.value} mm</span>
                    </div>
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



            {options?.options?.icons?.has === true && (
                <>
                    <div className="popup_row" style={{
                        "--left_column_size": "160px", alignItems: 'center', borderTop: '1px solid lightgray',
                        paddingTop: "1em",
                        marginTop: "1em",
                    }}>
                        <label htmlFor={'labeler_iconsSize'}>Taille des pictogramme</label>
                        <div className="popup_row-flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
                            <img style={{ flex: 0 }} src={options.options?.icons?.value === true ? (options.options?.iconsSize?.value === 'small' ? exportLabelerIconSize1Icon : (options.options?.iconsSize?.value === 'normal' ? exportLabelerIconSize2Icon : (options.options?.iconsSize?.value === 'large' ? exportLabelerIconSize3Icon : exportLabelerIconNoneIcon))) : exportLabelerIconNoneIcon} width={18} height={18} />
                            <select id={'labeler_iconsSize'} name={'labeler_iconsSize'} value={options.options?.icons?.value === true ? (options.options?.iconsSize?.value ?? 'normal') : 'none'} onChange={(e) => {
                                let v = e.target.value;
                                let i = true;
                                if (v === 'none') i = false;
                                setOptions((old) => {
                                    const newOptions = {
                                        ...old,
                                        options: {
                                            ...old.options,
                                            icons: {
                                                ...old.options.icons,
                                                value: i
                                            },
                                            iconsSize: {
                                                ...old.options.iconsSize,
                                                value: v
                                            }
                                        }
                                    }
                                    return newOptions;
                                });
                            }} style={{ flex: 1 }}>
                                <option value={'none'}>Ne pas afficher</option>
                                <option value={'small'}>Petite</option>
                                <option value={'normal'}>Normale</option>
                                <option value={'large'}>Grande</option>
                            </select>
                        </div>
                    </div>
                </>
            )}

            {options?.options?.text?.has === true && (
                <>
                    <div className="popup_row" style={{
                        "--left_column_size": "160px", alignItems: 'center', borderTop: '1px solid lightgray',
                        paddingTop: "1em",
                        marginTop: "1em",
                    }}>
                        <label style={{ flex: 1 }}>Taille des libellés</label>
                        <div className="popup_row-flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
                            <img style={{ flex: 0 }} src={options.options?.text?.value === true ? (options.options?.textSize?.value === 'small' ? exportLabelerTextSize1Icon : (options.options?.textSize?.value === 'normal' ? exportLabelerTextSize2Icon : (options.options?.textSize?.value === 'large' ? exportLabelerTextSize3Icon : exportLabelerTextNoneIcon))) : exportLabelerTextNoneIcon} width={18} height={18} />
                            <select value={options.options?.text?.value === true ? (options.options?.textSize?.value ?? 'normal') : 'none'} onChange={(e) => {
                                let v = e.target.value;
                                let i = true;
                                if (v === 'none') i = false;
                                setOptions((old) => {
                                    const newOptions = {
                                        ...old,
                                        options: {
                                            ...old.options,
                                            text: {
                                                ...old.options.text,
                                                value: i
                                            },
                                            textSize: {
                                                ...old.options.textSize,
                                                value: v
                                            }
                                        }
                                    }
                                    return newOptions;
                                });
                            }} style={{ flex: 1 }}>
                                <option value={'none'}>Ne pas afficher</option>
                                <option value={'small'}>Petite</option>
                                <option value={'normal'}>Normale</option>
                                <option value={'large'}>Grande</option>
                            </select>
                        </div>
                    </div>
                    <div className="popup_row" style={{
                        "--left_column_size": "160px", alignItems: 'center'
                    }}>
                        <label style={{ flex: 1 }}>Orientation</label>
                        <div className="popup_row-flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
                            <img style={{ flex: 0 }} src={options.options?.textOrientation?.value === 'horizontal' ? exportLabelerTextOrientationHIcon : exportLabelerTextOrientationVIcon} width={18} height={18} />
                            <select disabled={options.options?.text?.value !== true} value={options.options?.textOrientation?.value ?? 'horizontal'} onChange={(e) => {
                                setOptions((old) => {
                                    const newOptions = {
                                        ...old,
                                        options: {
                                            ...old.options,
                                            textOrientation: {
                                                ...old.options.textOrientation,
                                                value: e.target.value
                                            }
                                        }
                                    }
                                    return newOptions;
                                });
                            }} style={{ flex: 1 }}>
                                <option value={'horizontal'}>Horizontale</option>
                                <option value={'vertical'}>Verticale</option>
                            </select>
                        </div>
                    </div>
                </>
            )}

            {options?.options?.invert?.has === true && (
                <>
                    <div className="popup_row" style={{
                        "--left_column_size": "160px", alignItems: 'center', borderTop: '1px solid lightgray',
                        paddingTop: "1em",
                        marginTop: "1em",
                    }}>
                        <label style={{ flex: 1 }}>Affichage</label>
                        <div className="popup_row-flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
                            <img style={{ flex: 0 }} src={options.options?.invert?.value === true ? containerInvertIcon : containerIcon} width={18} height={18} />
                            <select value={options.options?.invert?.value ?? false} onChange={(e) => setOptions((old) => {
                                const newOptions = {
                                    ...old,
                                    options: {
                                        ...old.options,
                                        invert: {
                                            ...old.options.invert,
                                            value: e.target.value === 'true'
                                        }
                                    }
                                };
                                return newOptions;
                            })} style={{ flex: 1 }}>
                                <option value={'false'}>Normal</option>
                                <option value={'true'}>Inversé</option>
                            </select>
                        </div>
                    </div>
                </>
            )}

            {options &&
                <>
                    <div className="popup_row" style={{
                        "--left_column_size": "160px", alignItems: 'center', borderTop: '1px solid lightgray',
                        paddingTop: "1em",
                        marginTop: "1em",
                    }}>
                        <label style={{ flex: 1 }}>Découpes</label>
                        <div className="popup_row-flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
                            <img style={{ flex: 0 }} src={options.options?.trim === 'all' ? trimAllIcon : (options.options?.trim === 'ext' ? trimExtIcon : trimNoneIcon)} width={18} height={18} />
                            <select value={options.options?.trim ?? false} onChange={(e) => setOptions((old) => {
                                const newOptions = {
                                    ...old,
                                    options: {
                                        ...old.options,
                                        trim: e.target.value
                                    }
                                };
                                return newOptions;
                            })} style={{ flex: 1 }}>
                            <option value={''}>Conserver les espaces vides</option>
                            <option value={'ext'}>Retirer les espaces extérieurs</option>
                            <option value={'all'}>Supprimer tous les espaces</option>
                        </select>
                    </div>
                </div>


                <div className="popup_row" style={{
                    "--left_column_size": "160px", alignItems: 'center'
                }}>
                    <label style={{ flex: 1 }}>Bordures</label>
                    <div className="popup_row-flex" style={{ alignItems: 'center', gap: '1.25rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'row', gap: '0.25rem', alignItems: 'center', flex: 0 }} title={"Afficher les bordures entre les modules imprimés"}>
                            <img src={borderInterIcon} width={18} height={18} />
                            <input type="checkbox" name={'labeler_borders_inter'} id={'labeler_borders_inter'} checked={(options.options?.borders?.inter ?? true) === true} onChange={(e) => setOptions((old) => {
                                const newOptions = {
                                    ...old,
                                    options: {
                                        ...old.options,
                                        borders: {
                                            ...old.options.borders,
                                            inter: e.target.checked
                                        }
                                    }
                                }
                                return newOptions;
                            })} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', gap: '0.25rem', alignItems: 'center' }} title={"Afficher les bordures à gauche des modules imprimés"}>
                            <img src={borderLeftIcon} width={18} height={18} />
                            <input type="checkbox" name={'labeler_borders_left'} id={'labeler_borders_left'} checked={(options.options?.borders?.left ?? false) === true} onChange={(e) => setOptions((old) => {
                                const newOptions = {
                                    ...old,
                                    options: {
                                        ...old.options,
                                        borders: {
                                            ...old.options.borders,
                                            left: e.target.checked
                                        }
                                    }
                                }
                                return newOptions;
                            })} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', gap: '0.25rem', alignItems: 'center' }} title={"Afficher les bordures en haut des modules imprimés"}>
                            <img src={borderTopIcon} width={18} height={18} />
                            <input type="checkbox" name={'labeler_borders_top'} id={'labeler_borders_top'} checked={(options.options?.borders?.top ?? false) === true} onChange={(e) => setOptions((old) => {
                                const newOptions = {
                                    ...old,
                                    options: {
                                        ...old.options,
                                        borders: {
                                            ...old.options.borders,
                                            top: e.target.checked
                                        }
                                    }
                                }
                                return newOptions;
                            })} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', gap: '0.25rem', alignItems: 'center' }} title={"Afficher les bordures à droite des modules imprimés"}>
                            <img src={borderRightIcon} width={18} height={18} />
                            <input type="checkbox" name={'labeler_borders_right'} id={'labeler_borders_right'} checked={(options.options?.borders?.right ?? false) === true} onChange={(e) => setOptions((old) => {
                                const newOptions = {
                                    ...old,
                                    options: {
                                        ...old.options,
                                        borders: {
                                            ...old.options.borders,
                                            right: e.target.checked
                                        }
                                    }
                                }
                                return newOptions;
                            })} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', gap: '0.25rem', alignItems: 'center' }} title={"Afficher les bordures en bas des modules imprimés"}>
                            <img src={borderBottomIcon} width={18} height={18} />
                            <input type="checkbox" name={'labeler_borders_bottom'} id={'labeler_borders_bottom'} checked={(options.options?.borders?.bottom ?? false) === true} onChange={(e) => setOptions((old) => {
                                const newOptions = {
                                    ...old,
                                    options: {
                                        ...old.options,
                                        borders: {
                                            ...old.options.borders,
                                            bottom: e.target.checked
                                            }
                                        }
                                    }
                                    return newOptions;
                                })} />
                        </div>
                    </div>
                </div>
                </>
            }



        </div>
    </Popup>
}