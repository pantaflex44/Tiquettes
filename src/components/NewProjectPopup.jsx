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

import { useState } from "react";
import "../css/newProjectPopup.css";
import * as pkg from '../../package.json';

import Popup from "./Popup.jsx";
import FirstpageOptionsPopup from "./FirstpageSettingsPopup.jsx";

import wizardPicture2 from '../assets/swb.png';
import wizardPicture2rowsCount from '../assets/swb_rowsCount.png';
import wizardPicture2stepsPerRows from '../assets/swb_stepsPerRows.png';
import wizardPicture2height from '../assets/swb_height.png';
import wizardPicture2stepSize from '../assets/swb_stepSize.png';
import fpSettingsIcon from '../assets/fp-settings.svg';
import importIcon from '../assets/upload.svg';

export default function NewProjectPopup({
    onCancel,
    onApply,
    defaultFirstpageOptions
}) {
    const defaultStepSize = parseInt(import.meta.env.VITE_DEFAULT_STEPSIZE);
    const defaultProjectName = import.meta.env.VITE_DEFAULT_PROJECT_NAME;
    const defaultNpRows = parseInt(import.meta.env.VITE_DEFAULT_ROWS);
    const defaultHRow = parseInt(import.meta.env.VITE_DEFAULT_ROWHEIGHT);
    const defaultStepsPerRows = parseInt(import.meta.env.VITE_DEFAULT_STEPSPERROW);
    const rowsMin = parseInt(import.meta.env.VITE_ROWS_MIN);
    const rowsMax = parseInt(import.meta.env.VITE_ROWS_MAX);
    const heightMin = parseInt(import.meta.env.VITE_HEIGHT_MIN);
    const heightMax = parseInt(import.meta.env.VITE_HEIGHT_MAX);

    const [properties, setProperties] = useState({
        rowsCount: defaultNpRows,
        stepsPerRows: defaultStepsPerRows,
        height: defaultHRow,
        stepSize: defaultStepSize,
        name: defaultProjectName,
        infos: defaultFirstpageOptions.infos,
        views: defaultFirstpageOptions.views,
    });
    const maxSteps = 4;
    const [step, setStep] = useState(1);
    const [wizardPicture2src, setWizardPicture2src] = useState(wizardPicture2);
    const [tooltipBox, setTooltipBox] = useState('');
    const [firstpageOptionsPopup, setFirstpageOptionsPopup] = useState(false);

    const cancel = () => {
        onCancel();
    }

    const apply = () => {
        onApply(properties);
    }

    const Summary = () => {
        return <>
            <span className={`wizard-page-left-title ${step === 1 ? 'current' : ''}`.trim()}>Bienvenue !</span>
            <span className={`wizard-page-left-title ${step === 2 ? 'current' : ''}`.trim()}>Mon enveloppe</span>
            <span className={`wizard-page-left-title ${step === 3 ? 'current' : ''}`.trim()}>Données du projet</span>
            <span className={`wizard-page-left-title ${step === 4 ? 'current' : ''}`.trim()}>Résumons</span>
        </>;
    }

    return <>
        <Popup
            title={`Créer un nouveau projet (${step}/${maxSteps})`}
            showCloseButton={true}
            showOkButton={step === maxSteps}
            showCancelButton={true}
            showPrevButton={step > 1}
            showNextButton={step < maxSteps}
            width={710}
            onOk={apply}
            onCancel={() => {
                if (confirm("Voulez-vous abandonner la création de votre nouveau projet ?")) {
                    cancel();
                }
            }}
            onPrev={() => {
                setStep(old => old > 1 ? old - 1 : old);
            }}
            onNext={() => {
                setStep(old => old < maxSteps ? old + 1 : old)
            }}
            noPadding={true}
        >
            {step === 1 && (
                <div className="wizard-page" data-step={step}>
                    <div className="wizard-page-left">
                        <Summary />
                    </div>
                    <div className="wizard-page-right">
                        <h3>
                            Bienvenue dans l'assistant de création d'un nouveau projet !
                        </h3>
                        <p>
                            Vous allez configurer un nouveau projet en suivant les quelques étapes nécessaires. C'est simple et très rapide.
                        </p>
                        <p>
                            Laissez vous guider, et retrouvons nous à la fin pour entrer dans le vif du sujet !
                        </p>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="wizard-page" data-step={step}>
                    <div className="wizard-page-left">
                        <Summary />

                        <img className="wizard-page-left-picture" src={wizardPicture2src} />
                        <span className="wizard-page-tooltip">{tooltipBox}</span>
                    </div>
                    <div className="wizard-page-right">
                        <h3>
                            Commençons par définir l'enveloppe du tableau électrique
                        </h3>
                        <div className="wizard-page-form">
                            <div className="wizard-page-form-row" onMouseEnter={() => {
                                setWizardPicture2src(wizardPicture2rowsCount);
                                setTooltipBox("");
                            }} onMouseLeave={() => {
                                setWizardPicture2src(wizardPicture2);
                                setTooltipBox("");
                            }}>
                                <label htmlFor="rowsCount">Mon enveloppe comporte <b>{properties.rowsCount}</b> rangée{properties.rowsCount > 1 ? 's' : ''}</label>
                                <div className="wizard-page-form-row-flex">
                                    <span className="wizard-page-form-row-indicator-left">{rowsMin}</span>
                                    <input style={{ flex: 1 }} type="range" name="rowsCount" id="rowsCount"
                                        min={rowsMin}
                                        max={rowsMax}
                                        value={properties.rowsCount}
                                        title={`Nombre de rangées: ${properties.rowsCount}`}
                                        onChange={(e) => setProperties(old => ({ ...old, rowsCount: parseInt(e.target.value) }))}
                                    />
                                    <span className="wizard-page-form-row-indicator-right">{rowsMax}</span>
                                </div>
                            </div>
                            <div className="wizard-page-form-row" onMouseEnter={() => {
                                setWizardPicture2src(wizardPicture2stepsPerRows);
                                setTooltipBox("Le nombre de modules par rangée est normalisé. Vous retrouverez souvent les nombres de 13, 18 et 24 modules par rangée.");
                            }} onMouseLeave={() => {
                                setWizardPicture2src(wizardPicture2);
                                setTooltipBox("");
                            }}>
                                <label htmlFor="stepsPerRows">Chaque rangée possède</label>
                                <div className="wizard-page-form-row-flex">
                                    <div className="radio_group" style={{ margin: 0 }}>
                                        {import.meta.env.VITE_ALLOWED_MODULES.split(',').map((count) => {
                                            const c = parseInt(count.trim());
                                            return <div key={c} className="radio">
                                                <input type="radio" name={`stepsPerRows_${c}`} id={`stepsPerRows_${c}`} value={c}
                                                    checked={properties.stepsPerRows === c}
                                                    onChange={(e) => setProperties(old => ({ ...old, stepsPerRows: parseInt(e.target.value) }))} />
                                                <label htmlFor={`stepsPerRows_${c}`}
                                                    style={{ margin: 0, marginRight: '0.5em', paddingInline: '1em', fontWeight: 'normal' }}>{c} modules</label>
                                            </div>;
                                        })}
                                    </div>
                                </div>
                            </div>
                            <div className="wizard-page-form-row" onMouseEnter={() => {
                                setWizardPicture2src(wizardPicture2stepSize);
                                setTooltipBox("Certains modules anciens possèdent une largeur de 17.5mm. Aujourd'hui il est courant d'utiliser des modules de 18mm de largeur.");
                            }} onMouseLeave={() => {
                                setWizardPicture2src(wizardPicture2);
                                setTooltipBox("");
                            }}>
                                <label htmlFor="stepSize">Et chaque module a une largeur de</label>
                                <div className="wizard-page-form-row-flex">
                                    <div className="radio_group" style={{ margin: 0 }}>
                                        {[17.5, 18].map((s) => {
                                            return <div key={s} className="radio">
                                                <input type="radio" name={`stepSize_${s}`} id={`stepSize_${s}`} value={s}
                                                    checked={properties.stepSize === s}
                                                    onChange={(e) => setProperties(old => ({ ...old, stepSize: parseFloat(e.target.value) }))} />
                                                <label htmlFor={`stepSize_${s}`}
                                                    style={{ margin: 0, marginRight: '0.5em', paddingInline: '1em', fontWeight: 'normal' }}>{s}mm</label>
                                            </div>;
                                        })}
                                    </div>
                                </div>
                            </div>
                            <div className="wizard-page-form-row" onMouseEnter={() => {
                                setWizardPicture2src(wizardPicture2height);
                                setTooltipBox("La hauteur des étiquettes dépend de l'espace disponible proposé par l'enveloppe choisie. Chaque marque / modèle possède ses propres dimensions. Pour garantir une insertion correcte des étiquettes imprimées, il est conseillé de retirer 1mm de la hauteur mesurée.");
                            }} onMouseLeave={() => {
                                setWizardPicture2src(wizardPicture2);
                                setTooltipBox("");
                            }}>
                                <label htmlFor="height">Les portes étiquettes font <b>{properties.height}mm</b> de hauteur</label>
                                <div className="wizard-page-form-row-flex">
                                    <span className="wizard-page-form-row-indicator-left">{heightMin}mm</span>
                                    <input style={{ flex: 1 }} type="range" name="height" id="height"
                                        min={heightMin}
                                        max={heightMax}
                                        value={properties.height}
                                        title={`Nombre de rangées: ${properties.height}`}
                                        onChange={(e) => setProperties(old => ({ ...old, height: parseInt(e.target.value) }))}
                                    />
                                    <span className="wizard-page-form-row-indicator-right">{heightMax}mm</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="wizard-page" data-step={step}>
                    <div className="wizard-page-left">
                        <Summary />
                    </div>
                    <div className="wizard-page-right">
                        <h3>
                            Un peu de paperasse ! Renseignez les données de votre projet.
                        </h3>
                        <div className="wizard-page-form">
                            <div className="wizard-page-form-row">
                                <label htmlFor="name">Nom du projet</label>
                                <div className="wizard-page-form-row-flex">
                                    <input style={{ flex: 1, height: '30px', fontSize: '90%' }} type="text" name="name" id="name"
                                        value={properties.name}
                                        onChange={(e) => setProperties(old => ({ ...old, name: e.target.value }))}
                                        autoFocus={true}
                                    />
                                </div>
                                <span className="wizard-form-tooltip">Définissez un nom simple et clair pour mieux reconnaitre votre projet.</span>
                            </div>
                            <div className="wizard-page-form-row">
                                <label htmlFor="name">Données installateur / client</label>
                                <div style={{ fontSize: '95%' }}>Vous avez la possibilité de renseigner vos informations en tant qu'installateur mais aussi celles de votre client.</div>
                                <div className="wizard-page-form-row-flex">
                                    <button style={{ fontSize: '95%', marginTop: '0.5rem', columnGap: '0.5rem' }} onClick={() => setFirstpageOptionsPopup(true)}>
                                        <img src={fpSettingsIcon} width={18} height={18} />
                                        <span>Renseigner ou importer les données</span>
                                    </button>
                                </div>
                                <div style={{ fontSize: '95%' }}>Vous pourrez modifier ultérieurement ces données dans le menu Imprimer / Page de garde / Paramètres.</div>
                            </div>


                        </div>
                    </div>
                </div>
            )}

            {step === 4 && (
                <div className="wizard-page" data-step={step}>
                    <div className="wizard-page-left">
                        <Summary />
                    </div >
                    <div className="wizard-page-right">
                        <h3>
                            Résumons votre projet
                        </h3>
                        <p>Mon projet repose sur une enveloppe de <b>{properties.rowsCount} rangée{properties.rowsCount > 1 ? 's' : ''}</b> comportant <b>{properties.stepsPerRows} modules</b> chacune.</p>
                        <p>Chaque module fait <b>{properties.stepSize}mm de largeur</b>.</p>
                        <p>Vous avez renseigné une hauteur de <b>{properties.height}mm</b> pour l'emplacement dédié aux étiquettes.</p>
                        <p>Pour mieux l'identifier, votre projet porte le nom <b>{properties.name}</b>.</p>
                        {(properties.infos.from.name || properties.infos.from.siret || properties.infos.from.postalAddress || properties.infos.from.email || properties.infos.from.phone) && <p>Vous avez défini les informations relatives à l'installateur.</p>}
                        {(properties.infos.to.name || properties.infos.to.postalAddress || properties.infos.to.email || properties.infos.to.phone) && <p>Vous avez défini les informations relatives au client.</p>}
                        <p style={{ marginTop: '5rem' }}>Si ces informations sont exactes, cliquez sur le bouton <b>Valider</b> pour créer votre projet.</p>
                    </div>
                </div >
            )
            }
        </Popup>
        {
            firstpageOptionsPopup && <FirstpageOptionsPopup
                withOverflow={false}
                withPreview={false}
                withViewSelector={true}
                defaultFirstpageOptions={defaultFirstpageOptions}
                currentInfos={properties.infos}
                currentViews={properties.views}
                onApply={(options) => {
                    setProperties(old => ({ ...old, infos: options.infos }));
                    setProperties(old => ({ ...old, views: options.views }))
                    setFirstpageOptionsPopup(false);
                }}
                onCancel={() => {
                    setFirstpageOptionsPopup(false)
                }}
            />
        }
    </>
}