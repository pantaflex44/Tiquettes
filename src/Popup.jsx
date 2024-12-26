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
import cancelIcon from './assets/cancel.svg';

import './popup.css';

export default function Popup({
                                  title,
                                  children,
                                  style = {},
                                  className = null,
                                  width = 440,
                                  showCloseButton = true,
                                  showCancelButton = true,
                                  showOkButton = true,
                                  additionalButtons = [],
                                  onCancel = null,
                                  onOk = null
                              }) {
    return (
        <div className="popup-overflow">
            <div className='popup' tabIndex={0} style={{width: `${width}px`}}>
                <div className="popup_title">{title}</div>
                {showCloseButton && <div className="popup_cancel" onClick={onCancel}><img src={cancelIcon} alt="Annuler" width={24} height={24}/></div>}

                <div className={`popup_content ${className}`} style={style}>
                    {children}
                </div>

                <div className="popup_buttons">
                    <div className="popup_buttons_box">
                        {Array.isArray(additionalButtons) && additionalButtons.map((b, i) => {
                            if (!b.text || !b.callback) return null;
                            const {text, callback, ...props} = b;
                            if (text.trim() === '') return null;

                            return <button key={i} {...props} onClick={callback}>{text}</button>;
                        })}
                    </div>
                    {(showCancelButton || showOkButton) && <div className="popup_buttons_box">
                        {showCancelButton && <button className='cancel' onClick={onCancel}>Annuler</button>}
                        {showOkButton && <button className='ok' onClick={onOk}>Valider</button>}
                    </div>}
                </div>
            </div>
        </div>
    );
}