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

'use strict'

import { useEffect, useState } from "react";
import axios from 'axios';

import { SpaceContext } from './SpaceContext.jsx';

export default function SpaceProvider({ children }) {
    const [project, setProject] = useState(null);
    const [instanceId, setInstanceId] = useState(null);
    const [printOptions, setPrintOptions] = useState(null);
    const [params, setParams] = useState(null);
    const [error, setError] = useState(null);

    const [loadState, setLoadState] = useState(null);
    const [saveState, setSaveState] = useState(null);

    const apiSend = (url, ufiid, args = {}, thenCallback = null, errorCallback = null) => {
        axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

        let axiosConfig = {
            headers: {
                'X-UFIID': ufiid ?? '',
            }
        };
        axios
            .post(url, args, axiosConfig)
            .then(response => {
                if (response.status === 200 || response.status === 201) {
                    const data = response.data;
                    if (data.error) {
                        throw new Error(data.error);
                    } else {
                        if (thenCallback) thenCallback(data);
                    }
                }
            })
            .catch(error => {
                if (errorCallback) errorCallback(error);
            });
    };

    const closeAll = (noProject = false, noError = false) => {
        if (noProject === false) {
            setProject(null);
            setParams(null);
            setInstanceId(null);
            setPrintOptions(null);
        }
        setLoadState('closed');
        setSaveState(null);
        if (noError == false) {
            setError(null);
        }
    };

    const apiError = (error) => {
        if (error.response) {
            setError({
                code: 'RESPONSE_ERROR',
                message: error.message ?? '',
                text: "Oh la, il apparait que nous venons de rencontrer le Professeur Tournesol ... La réponse ne correspond pas à la demande.<br /><br />Impossible de charger le projet dans ces conditions."
            });
        } else if (error.request) {
            setError({
                code: 'REQUEST_ERROR',
                message: error.message ?? '',
                text: "Hum, j'ai l'impression que quelqu'un boude dans son coin. Aucune réponse et aucun contenu à charger !<br /><br />Si le problème persiste, veuillez, s'il vous plait, nous contacter pour que l'on puisse corriger ce comportement."
            });
        } else {
            setError({
                code: 'COMMON_ERROR',
                message: error.message ?? '',
                text: "Nous venons de retrouver un insecte dans les transistors provoquant une erreur générale."
            });
        }
    };

    const load = (ufiid) => {
        setLoadState('loading');
        apiSend(
            import.meta.env.VITE_APP_API_URL + "load.php",
            ufiid,
            {},
            (data) => {
                if (!data.instanceId || data.instanceId !== ufiid || !data.project || !data.params || data.printOptions) {
                    throw new Error("Impossible de charger ce projet.");
                } else {
                    if (!data.project || !data.project.switchboard) {
                        throw new Error("Impossible de former ce projet. Document corrompu.");
                    }
                    setProject(data.project);
                    setParams(data.params);
                    setInstanceId(data.instanceId);
                    setPrintOptions(data.printOptions);
                    setLoadState('loaded');
                }
            },
            (error) => {
                apiError(error);
                closeAll(false, true);
            }
        );
    };

    const save = (switchboard, auto = false) => {
        setSaveState('saving');
        if (instanceId) {
            apiSend(
                import.meta.env.VITE_APP_API_URL + "save.php",
                instanceId,
                {
                    switchboard: JSON.stringify(switchboard),
                },
                (data) => {
                    if (!data.instanceId || data.instanceId !== instanceId || !data.ok) {
                        throw new Error("Impossible de sauvegarder ce projet.");
                    } else {
                        setSaveState('saved');
                    }
                },
                (error) => {
                    if (auto) {
                        setSaveState('error');
                    } else {
                        apiError(error);
                    }
                }
            );
        } else {
            if (auto) {
                setSaveState('error');
            } else {
                apiError(new Error("Impossible de sauvegarder pour le moment..."));
            }
        }
    };

    useEffect(() => {
        if (project === null) {
            closeAll(true);
        }
    }, [project]);

    useEffect(() => {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);

        const ufiid = urlParams.get('ufiid');
        if (typeof ufiid === 'string') {
            load(ufiid);
        }

        return () => {
            closeAll();
        };
    }, []);

    return (
        <SpaceContext value={{
            project,
            params,
            printOptions,
            loadState,
            saveState,
            error,
            save
        }}>
            {children}
        </SpaceContext>
    );
}