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

import "./cloudConnectionPopup.css";

import {useContext, useEffect, useState} from "react";

import {AccountContext} from "./AccountContext.jsx";

import Popup from "./Popup.jsx";
import PasswordInput from "./PasswordInput.jsx";

import userIcon from "./assets/user.svg";
import cloudDataConnectionIcon from "./assets/cloud-data-connection.svg";

export default function CloudConnectionPopup({
                                                 onCancel,
                                                 onConnected,
                                             }) {
    const account = useContext(AccountContext);

    const defaultConnectForm = {
        email: '',
        password: '',
        repassword: '',
        auto: false
    };
    const [connectForm, setConnectForm] = useState({...defaultConnectForm});
    const [error, setError] = useState(null);
    const [mode, setMode] = useState('login');
    const [registerAvaillable, setRegisterAvaillable] = useState(true);
    const [connected, setConnected] = useState(false);

    function displayError(errors) {
        if (errors === null || !errors?.message) {
            setError(null);
            return;
        }

        let e = null;
        try {
            e = JSON.parse(errors.message);
        } catch {
            e = {main: "Une erreur interne est survenue."};
        }

        if (e !== null) {
            setError(old => ({
                ...(old ?? {}),
                ...e
            }));
        }
    }

    const [additionalButtonsMode, setAdditionalButtonsMode] = useState({});
    useEffect(() => {
        displayError(null);
        if (mode === 'login') {
            setAdditionalButtonsMode({
                text: (
                    <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', columnGap: '0.5rem'}}
                         title={"Créer mon compte"}>
                        <img src={userIcon} alt={"Créer mon compte"} width={18} height={18}/>
                        <span className={'additional_buttons_text'}>Créer mon compte</span>
                    </div>
                ),
                title: "Créer mon compte",
                callback: () => setMode('register')
            });
        } else if (mode === 'register' && registerAvaillable) {
            setAdditionalButtonsMode({
                text: (
                    <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', columnGap: '0.5rem'}}
                         title={"Me connecter"}>
                        <img src={cloudDataConnectionIcon} alt={"Me connecter"} width={18} height={18}/>
                        <span className={'additional_buttons_text'}>Connexion</span>
                    </div>
                ),
                title: "Me connecter",
                callback: () => setMode('login')
            });
        }
    }, [mode, registerAvaillable]);

    useEffect(() => {
        if (connected) onConnected();
    }, [connected]);

    useEffect(() => {
        setConnected(false);
        setMode('login');
        setRegisterAvaillable(true);
        displayError(null);
    }, []);

    return <Popup
        title={mode === 'register' ? "Créer mon compte" : "Connexion à mon espace"}
        showCloseButton={true}
        onCancel={() => onCancel()}
        onOk={() => {
            displayError(null);

            if (mode === 'register' && registerAvaillable) {
                account.register(connectForm.email, connectForm.password, connectForm.repassword)
                    .then(() => setConnected(true))
                    .catch(error => displayError(error));

            } else if (mode === 'login') {
                account.login(connectForm.email, connectForm.password)
                    .then(() => setConnected(true))
                    .catch(error => displayError(error));

            }

            if (connected) onConnected();
        }}
        showOkButton={true}
        additionalButtons={[additionalButtonsMode]}
    >
        <div className={'connectBox'}>
            {error?.main && <div className={'form_error'}>⚠ {error.main}</div>}
            <h3 style={{color: 'darkcyan'}}>{mode === 'register' && registerAvaillable ? "Bienvenue !" : "Connexion à mon espace"}</h3>
            {mode === 'register' && registerAvaillable && (
                <>
                    <span className={'subtitle'}>
                        Pour créer votre compte, veuillez remplir le formulaire ci-dessous. Le cloud de Tiquettes permets d&#39;enregistrer ses projets et les diverses préférences dans un espace dédié.
                    </span>
                    <span className={'subtitle'}>
                        Cet espace est <b>gratuit</b> et propose de stocker jusqu&#39;à <b>100 projets</b> par compte !
                    </span>
                </>
            )}
            <div className={'form_row'}>
                <label htmlFor={'email'}>Adresse email</label>
                <input type={'email'} id={'email'} name={'email'} placeholder={''} style={{minHeight: '32px'}}
                       autoComplete={'on'} autoFocus={true}
                       value={connectForm.email}
                       onChange={(e) => setConnectForm((old) => ({...old, email: e.target.value}))}
                       onFocus={() => displayError(null)}
                />
                {error?.email && <div className={'form_error'}>⚠ {error.email}</div>}
            </div>
            <div className={'form_row'}>
                <label htmlFor={'password'}>Mot de passe</label>
                <PasswordInput id={'password'} name={'password'}
                               value={connectForm.password}
                               onChange={(e) => setConnectForm((old) => ({...old, password: e.target.value}))}
                               onFocus={() => displayError(null)}
                />
                {error?.password && <div className={'form_error'}>⚠ {error.password}</div>}
            </div>
            {mode === 'register' && registerAvaillable && (
                <>
                    <div className={'form_row'}>
                        <label htmlFor={'password'}>Mot de passe (confirmation)</label>
                        <PasswordInput id={'repassword'} name={'repassword'}
                                       value={connectForm.repassword}
                                       onChange={(e) => setConnectForm((old) => ({...old, repassword: e.target.value}))}
                                       onFocus={() => displayError(null)}
                        />
                        {error?.repassword && <div className={'form_error'}>⚠ {error.repassword}</div>}
                    </div>
                </>
            )}
        </div>
    </Popup>
}