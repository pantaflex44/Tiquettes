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

import Popup from "./Popup.jsx";

export default function LoadingErrorPopup({ error, onCancel }) {
    return <Popup
        title={"Oups !"}
        showCancelButton={false}
        showCloseButton={false}
        showOkButton={false}
        showPrevButton={false}
        showNextButton={false}
        onCancel={() => onCancel()}
    >
        <h4 style={{ margin: 0, padding: 0, fontWeight: 300, color: 'red' }}>Huston, nous rencontrons un problème !</h4>
        {/*<p style={{ margin: 0, marginTop: '1rem', padding: 0 }} dangerouslySetInnerHTML={{ __html: error?.text ?? '' }} ></p>*/}
        <p style={{ margin: 0, marginBottom: '2rem', marginTop: '1rem', padding: 0, fontWeight: 600, fontSize: '105%' }} dangerouslySetInnerHTML={{ __html: `${error?.message ?? '-'}`.trim() }} ></p>
        <p style={{ margin: 0, marginTop: 0, padding: 0, paddingTop: '0.5rem', fontSize: '80%' }} dangerouslySetInnerHTML={{ __html: `#_${error?.code ?? 'UNKNOWN_ERROR'}`.trim() }} ></p>
    </Popup >
}