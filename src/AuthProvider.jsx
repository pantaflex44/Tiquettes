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

import { useEffect, useState } from 'react';
import AuthContext from './AuthContext';
import useDocumentVisibility from './useVisibilityChange';

// eslint-disable-next-line react/prop-types
function AuthProvider({ children }) {
    const sessionId = 'TiquettesAuthSession';

    const [token, setToken] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [authenticated, setAuthenticated] = useState(false);

    const tabIsActive = useDocumentVisibility();
    let logoutTimeout = null;

    const state = () => {
        const session = sessionStorage.getItem(sessionId);
        if (session) {
            const { token, currentUser } = JSON.parse(session);
            setToken(token);
            setCurrentUser(currentUser);
            setAuthenticated(true);
        } else {
            if (authenticated && token !== null) {
                logout(false);
                alert("Votre session a expiré. Veuillez vous reconnecter.");
            }
        }
    };

    const logout = (withConfirm = true) => {
        if (!withConfirm || confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
            setToken(null);
            setCurrentUser(null);
            setAuthenticated(false);
            sessionStorage.removeItem(sessionId);
        }
    };

    useEffect(() => {
        const lt = parseInt(import.meta.env.VITE_AUTOLOGOUT_TIMEOUT);
        if (!tabIsActive && token && lt > 0) {
            // Auto logout after 10 minutes of inactivity
            logoutTimeout = setTimeout(() => {
                logout(false);
                alert("Vous avez été déconnecté pour cause d'inactivité.");
            }, lt * 60 * 1000);
        } else {
            if (logoutTimeout !== null) {
                clearTimeout(logoutTimeout);
                logoutTimeout = null;
            }
            state();
        }
    }, [tabIsActive]);

    return <AuthContext.Provider value={{
        currentUser,
        state,
        authenticated,
        logout
    }}>
        {children}
    </AuthContext.Provider>
}

export default AuthProvider;