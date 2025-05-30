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

import {useState, useEffect} from 'react';

function useDocumentVisibility() {
    const [isDocumentVisible, setIsDocumentVisible] = useState(!document.hidden);

    const handleVisibilityChange = () => {
        setIsDocumentVisible(!document.hidden);
    };

    const handleBlurChange = () => {
        setIsDocumentVisible(false);
    };

    const handleFocusChange = () => {
        setIsDocumentVisible(true);
    };

    useEffect(() => {
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlurChange);
        window.addEventListener('focus', handleFocusChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlurChange);
            window.removeEventListener('focus', handleFocusChange);
        };
    }, []);

    return isDocumentVisible;
}

export default useDocumentVisibility;