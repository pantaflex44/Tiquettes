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

import { useEffect, useState } from "react";
import generateDisplayName from "./generateDisplayName.js";

import Popup from "./Popup";

import "./loginPopup.css";
import userShieldIcon from './assets/user-shield.svg';
import nextIcon from './assets/arrow-right.svg';
import lockOpenIcon from './assets/lock-open.svg';
import faceIdIcon from './assets/face-id.svg';


// eslint-disable-next-line react/prop-types
export default function LoginPopup({
    onCancel,
    onOk
}) {
    const [step, setStep] = useState('email'); // 'email' | ['plans'] | 'password' | '2fa' | 'done'
    const [readyToProceed, setReadyToProceed] = useState(true);
    const [compute, setCompute] = useState(false);
    const [knownUser, setKnownUser] = useState(null);
    const [formData, setFormData] = useState({
        email: "",
        plan: "",
        password: "",
        repassword: "",
        twoFA: "",
        displayName: "",
        errors: {
            email: "",
            plan: "",
            password: "",
            repassword: "",
            twoFA: ""
        }
    });

    const handleEmailVerify = (email) => {
        setCompute(true);
        setFormData(old => ({ ...old, errors: { ...old.errors, email: "" } }));

        fetch(`${import.meta.env.VITE_APP_API_URL}auth.php?function=checkEmail&email=${encodeURIComponent(formData.email)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                //console.log(response.text());
                return response.json();
            })
            .then(data => {
                if (data.status === 'error') {
                    throw new Error(data.message);
                }
                if (data.status === 'ok') {
                    setKnownUser(data.exists ? data.user : null);
                    setFormData(old => ({ ...old, displayName: data.user?.displayName || generateDisplayName() }));
                    setStep(data.exists ? 'password' : 'plans');
                    setCompute(false);
                    setReadyToProceed(false);
                }
            })
            .catch(error => {
                setFormData(old => ({ ...old, errors: { ...old.errors, email: error.message } }));
                setKnownUser(null);
                setCompute(false);
                setReadyToProceed(true);
            });
    };

    return <Popup
        title={"Connexion ou création de votre espace personnel"}
        showCloseButton={step !== 'done'}
        showCancelButton={step !== 'done'}
        onCancel={() => onCancel()}
        showOkButton={step === 'done'}
        onOk={() => onOk()}
        okButtonContent={<div style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            columnGap: '0.5rem'
        }} title={"Fermer"}>
            <img src={userShieldIcon} alt={"Fermer"} width={18} height={18} />
            <span className={'additional_buttons_text'}>Fermer</span>
        </div>}
        showNextButton={step !== 'done'}
        nextButtonDisabled={!readyToProceed}
        nextButtonContent={
            step === 'email'
                ? <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    columnGap: '0.5rem'
                }} title={"Suivant"}>
                    <img src={nextIcon} alt={"Suivant"} width={18} height={18} />
                    <span className={'additional_buttons_text'}>Suivant</span>
                </div>

                : step === 'plans'
                    ? <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        columnGap: '0.5rem'
                    }} title={"Suivant"}>
                        <img src={nextIcon} alt={"Suivant"} width={18} height={18} />
                        <span className={'additional_buttons_text'}>Suivant</span>
                    </div>

                    : step === 'password'
                        ? <div style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            columnGap: '0.5rem'
                        }} title={"Vérifier"}>
                            <img src={faceIdIcon} alt={"Vérifier"} width={18} height={18} />
                            <span className={'additional_buttons_text'}>Vérifier</span>
                        </div>

                        : step === '2fa'
                            ? <div style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                columnGap: '0.5rem'
                            }} title={"Me connecter"}>
                                <img src={lockOpenIcon} alt={"Me connecter"} width={18} height={18} />
                                <span className={'additional_buttons_text'}>Me connecter</span>
                            </div>

                            : ""
        }
        onNext={() => {
            if (step === 'email') {
                handleEmailVerify();
            } else if (step === 'plans') {
                setStep('password');
            } else if (step === 'password') {
                setStep('2fa');
            } else if (step === '2fa') {
                setStep('done');
            }
            setReadyToProceed(false);
        }}
        buttonsDisabled={compute}
        width={step === 'plans' ? 700 : 400}
    >
        {
            step === 'email'
                ? <div className="login_step_container">
                    <h3>Veuillez vous identifier</h3>
                    <label htmlFor="email">Adresse email utilisée lors de votre inscription. Si vous n'êtes pas encore inscrit, veuillez utiliser une adresse email valide.</label>
                    <input id="email" name="email" type="email" placeholder="Entrez votre adresse e-mail" value={formData.email} onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        setFormData(old => ({ ...old, errors: { ...old.errors, email: "" } }));
                    }} />
                    {formData.errors.email && <span className="error">{formData.errors.email}</span>}
                </div>

                : step === 'plans'
                    ? <div className="login_step_container">
                        <h3><small>2/{knownUser === null ? '5' : '4'}</small>Bienvenue {formData.displayName} !</h3>
                        <h4>Choisir son abonnement.</h4>
                        <p><b>Tiquettes.fr est, par défaut, gratuit pour tous</b>.<br />Toutefois, si vous souhaitez aller plus loin, vous pouvez choisir un abonnement permettant, notamment, d'avoir votre espace de stockage en ligne et d'accéder à des fonctionnalités avancées.</p>
                        <p>Sélectionnez le plan qui correspond le mieux à vos besoins. Vous pourrez toujours le modifier plus tard dans les paramètres de votre compte.</p>
                        {formData.errors.plan && <span className="error">{formData.errors.plan}</span>}
                        <div className="plans">
                            <div className={`plan ${formData.plan === 'pro' ? 'selected' : ''}`} onClick={() => {
                                setFormData({ ...formData, plan: 'pro' });
                                setFormData(old => ({ ...old, errors: { ...old.errors, plan: "" } }));
                                setReadyToProceed(true);
                            }}>
                                <h3>Pro</h3>
                                <div className="prices">
                                    <div className="price">
                                        <div>4,99 €</div>
                                        <div>mois</div>
                                    </div>
                                    <div>ou</div>
                                    <div className="price">
                                        <div>49 €</div>
                                        <div>an</div>
                                    </div>
                                </div>
                                <ul>
                                    <li>Toutes les fonctionnalités de base</li>
                                    <li>Stockage en ligne (100 projets)</li>
                                    <li>Stockage d'un thème personnalisé</li>
                                    <li>Fonctionnalités avancées</li>
                                </ul>
                            </div>
                            <div className={`plan ${formData.plan === 'max' ? 'selected' : ''}`} onClick={() => {
                                setFormData({ ...formData, plan: 'max' });
                                setFormData(old => ({ ...old, errors: { ...old.errors, plan: "" } }));
                                setReadyToProceed(true);
                            }}>
                                <h3>Max</h3>
                                <div className="prices">
                                    <div className="price">
                                        <div>9,99 €</div>
                                        <div>mois</div>
                                    </div>
                                    <div>ou</div>
                                    <div className="price">
                                        <div>99 €</div>
                                        <div>an</div>
                                    </div>
                                </div>
                                <ul>
                                    <li>Toutes les fonctionnalités de Pro</li>
                                    <li>Stockage en ligne de grande capacité (500 projets)</li>
                                    <li>Stockage de 10 thèmes personnalisés</li>
                                    <li>Fonctionnalités exclusives</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    : step === 'password'
                        ? <div className="login_step_container">
                            <h3><small>{knownUser === null ? '3' : '2'}/{knownUser === null ? '5' : '4'}</small>{knownUser !== null ? `Bienvenue ${knownUser.displayName}` : "Création du mot de passe"}</h3>
                            {knownUser !== null
                                ? <>
                                    <label htmlFor="password">Mot de passe défini lors de votre inscription.</label>
                                    <input id="password" name="password" type="password" placeholder="Entrez votre mot de passe" value={formData.password} onChange={(e) => {
                                        setFormData({ ...formData, password: e.target.value });
                                        setFormData(old => ({ ...old, errors: { ...old.errors, password: "" } }));
                                    }} />
                                    {formData.errors.password && <span className="error">{formData.errors.password}</span>}
                                </>
                                : <>
                                    <label htmlFor="password">Créez un mot de passe sécurisé. Minimum 8 caractères, incluant une majuscule, une minuscule, un chiffre et un caractère spécial.</label>
                                    <input id="password" name="password" type="password" placeholder="Entrez votre mot de passe" value={formData.password} onChange={(e) => {
                                        setFormData({ ...formData, password: e.target.value });
                                        setFormData(old => ({ ...old, errors: { ...old.errors, password: "" } }));
                                    }} />
                                    {formData.errors.password && <span className="error">{formData.errors.password}</span>}
                                    <label htmlFor="repassword">Répétez votre mot de passe.</label>
                                    <input id="repassword" name="repassword" type="password" placeholder="Vérifiez votre mot de passe" value={formData.repassword} onChange={(e) => {
                                        setFormData({ ...formData, repassword: e.target.value });
                                        setFormData(old => ({ ...old, errors: { ...old.errors, repassword: "" } }));
                                    }} />
                                    {formData.errors.repassword && <span className="error">{formData.errors.repassword}</span>}
                                </>
                            }
                        </div>

                        : step === '2fa'
                            ? <div className="login_step_container">
                                <h3><small>{knownUser === null ? '4' : '3'}/{knownUser === null ? '5' : '4'}</small>Authentification à deux facteurs</h3>
                                <label htmlFor="2fa">Rendez-vous dans votre boite mail pour récupérer le code de vérification.</label>
                                <input id="2fa" name="2fa" type="text" placeholder="Code de vérification" value={formData.twoFA} onChange={(e) => {
                                    setFormData({ ...formData, twoFA: e.target.value });
                                    setFormData(old => ({ ...old, errors: { ...old.errors, twoFA: "" } }));
                                }} />
                                {formData.errors.twoFA && <span className="error">{formData.errors.twoFA}</span>}
                            </div>

                            : step === 'done'
                                ? <div className="login_step_container">
                                    <h3><small>{knownUser === null ? '5' : '4'}/{knownUser === null ? '5' : '4'}</small>Connexion réussie !</h3>
                                    <p>Vous êtes maintenant connecté à votre espace.</p>
                                </div>

                                : null
        }

    </Popup>
}