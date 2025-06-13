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

import {AccountContext} from "./AccountContext.jsx";
import useApi from "./useApi.jsx";
import {useEffect, useState} from "react";

export default function AccountProvider({children}) {
    const api = useApi();

    const [currentUser, setCurrentUser] = useState(null);

    function logout() {
        api('GET', 'logout')
            .then(() => {
                setCurrentUser(null);
            })
            .catch(() => {
            });
    }

    function authenticate() {
        api('GET', 'authenticate')
            .then((user) => {
                setCurrentUser(user);
            })
            .catch(() => {
                let disconnected = false;
                if (currentUser !== null) disconnected = true;
                setCurrentUser(null);
            });
    }

    async function emailExists(email) {
        return await api('GET', 'emailExists', {email});
    }

    async function register(email, password, repassword) {
        let error = null;
        let response = {};

        try {
            const fd = new FormData();
            fd.append('email', email);
            fd.append('password', password);
            fd.append('repassword', repassword);
            response = await api('POST', 'register', {}, fd);
            if (response.errors) {
                error = response.errors
            } else if (!response.token || !response.expireAt || !response.user) {
                error = {main: "Connexion automatique impossible. Veuillez effectuer l'opération manuellement."};
            }
        } catch (e) {
            //console.error(e);
            error = {main: "Une erreur est survenue. Veuillez recommencer ultérieurement."};
        }

        if (error !== null) throw new Error(JSON.stringify(error));

        setCurrentUser(response.user);
    }

    async function login(email, password) {
        let error = null;
        let response = {};

        try {
            const fd = new FormData();
            fd.append('email', email);
            fd.append('password', password);
            response = await api('POST', 'login', {}, fd);
            if (response.errors) {
                error = response.errors
            } else if (!response.token || !response.expireAt || !response.user) {
                error = {main: "Connexion impossible suite à une erreur interne."};
            }
        } catch (e) {
            //console.error(e);
            error = {main: "Une erreur est survenue. Veuillez recommencer ultérieurement."};
        }

        if (error !== null) throw new Error(JSON.stringify(error));

        setCurrentUser(response.user);
    }

    useEffect(() => {
        authenticate();
    }, []);

    return (
        <AccountContext value={{
            logout,
            currentUser,
            authenticate,
            emailExists,
            register,
            login,
        }}>
            {children}
        </AccountContext>
    )
}