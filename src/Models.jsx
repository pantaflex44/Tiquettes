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
import './models.css';

import {cloneElement, useEffect, useState} from "react";

import magicIcon from './assets/wand.svg';

import Popup from "./Popup.jsx";


export default function Models({
                                    onCancel,
                                    onOk
                                }) {

    const steps = [
        {
            title: "Liste des modèles disponibles",
            stepper: "Bienvenue",
            component: <></>
        },
    ];
    const [step, setStep] = useState(0);
    const [buttons, setButtons] = useState({ok: false, prev: false, next: false});

    useEffect(() => {
        setButtons((old) => ({
            ...old,
            ok: step >= (steps.length - 1),
            prev: step > 0,
            next: step < (steps.length - 1)
        }));
    }, [step]);

    return <Popup
        title={"Modèles connus"}
        showCloseButton={false}
        onCancel={() => onCancel()}
        onOk={() => onOk()}
        onNext={() => {
            if (step < (steps.length - 1)) setStep((old) => old + 1);
        }}
        onPrev={() => {
            if (step > 0) setStep((old) => old - 1);
        }}
        showCancelButton={true}
        showOkButton={buttons.ok}
        showPrevButton={buttons.prev}
        showNextButton={buttons.next}
        width={800}
    >
        <article className="filoche">
            <div className="stepperTitle">{steps[step].title}</div>
            <img className="stepperImg" src={magicIcon} width={128} height={128}/>

            <div className="stepper" style={{maxWidth: '600px', marginInline: 'auto'}}>
                {steps.map((data, i) => (
                    <div key={i}
                         className={`step ${step > i ? 'completed' : ''} ${step === i ? 'active' : ''}`}>
                        <div className="step-label"></div>
                        <div className="step-description">{steps[i].stepper}</div>
                    </div>
                ))}
            </div>

            {cloneElement(steps[step].component, {step, title: steps[step].title})}
        </article>
    </Popup>;
}