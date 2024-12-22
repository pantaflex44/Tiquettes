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

import { useState, useEffect } from 'react';

function useMultiClickHandler(handler, delay = 250) {
    const [state, setState] = useState({ clicks: 0, args: [] });

    useEffect(() => {
        const timer = setTimeout(() => {
            setState({ clicks: 0, args: [] });

            if (state.clicks > 0 && typeof handler[state.clicks] === 'function') {
                handler[state.clicks](...state.args);
            }
        }, delay);

        return () => clearTimeout(timer);
    }, [handler, delay, state.clicks, state.args]);

    return (...args) => {
        setState((prevState) => ({ clicks: prevState.clicks + 1, args }));

        if (typeof handler[0] === 'function') {
            handler[0](...args);
        }
    };
}

export default useMultiClickHandler;