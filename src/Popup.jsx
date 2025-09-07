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
import {useMemo} from "react";

import './popup.css';

import cancelIcon from './assets/x.svg';
import okIcon from './assets/check.svg';
import prevIcon from './assets/arrow-left.svg';
import nextIcon from './assets/arrow-right.svg';
import loadingIcon from './assets/loading_mini.gif';

export default function Popup({
                                  title,
                                  children,
                                  style = {},
                                  className = null,
                                  width = 440,
                                  showCloseButton = true,
                                  showCancelButton = true,
                                  showOkButton = true,
                                  showPrevButton = false,
                                  showNextButton = false,
                                  buttonsDisabled = false,
                                  loading = false,
                                  additionalButtons = [],
                                  onCancel = null,
                                  onOk = null,
                                  onPrev = null,
                                  onNext = null,
                                  cancelButtonContent = <div style={{
                                      display: 'flex',
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                      columnGap: '0.5rem'
                                  }} title={"Annuler et fermer"}>
                                      <img src={cancelIcon} alt={"Annuler"} width={18} height={18}/>
                                      <span className={'additional_buttons_text'}>Annuler</span>
                                  </div>,
                                  prevButtonContent = <div style={{
                                      display: 'flex',
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                      columnGap: '0.5rem'
                                  }} title={"Précédent"}>
                                      <img src={prevIcon} alt={"Précédent"} width={18} height={18}/>
                                      <span className={'additional_buttons_text'}>Précédent</span>
                                  </div>,
                                  nextButtonContent = <div style={{
                                      display: 'flex',
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                      columnGap: '0.5rem'
                                  }} title={"Suivant"}>
                                      <img src={nextIcon} alt={"Suivant"} width={18} height={18}/>
                                      <span className={'additional_buttons_text'}>Suivant</span>
                                  </div>,
                                  okButtonContent = <div style={{
                                      display: 'flex',
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                      columnGap: '0.5rem'
                                  }} title={"Valider et fermer"}>
                                      <img src={okIcon} alt={"Valider"} width={18} height={18}/>
                                      <span className={'additional_buttons_text'}>Valider</span>
                                  </div>,
                              }) {
    const buttons = useMemo(() => ({
        close: showCloseButton,
        cancel: showCancelButton,
        ok: showOkButton,
        prev: showPrevButton,
        next: showNextButton,
    }), [showCancelButton, showOkButton, showCloseButton, showPrevButton, showNextButton]);

    return (
        <div className="popup-overflow">
            <div className={`popup ${loading ? 'loading' : ''}`.trim()} tabIndex={0} style={{width: `${width}px`}}>
                <div className="popup_title">{title}</div>
                {buttons.close &&
                    <div className="popup_cancel" onClick={onCancel}><img src={cancelIcon} alt="Annuler" width={24}
                                                                          height={24}/></div>}

                <div className={`popup_content ${className}`} style={style}>
                    {children}
                </div>

                {loading && (
                    <div className={'popup_loading_box'}>
                        <img src={loadingIcon} width={40} height={40} alt={"Chargement..."}/>
                        <span>Chargement ...</span>
                    </div>
                )}

                <div className="popup_buttons">
                    <div className="popup_buttons_box">
                        {Array.isArray(additionalButtons) && additionalButtons.map((b, i) => {
                            if (!b.text || !b.callback) return null;
                            const {text, callback, ...props} = b;
                            if (typeof text === 'string' && text.trim() === '') return null;

                            let p = {...props};
                            if (buttonsDisabled) {
                                let cls = (p.className ?? '').replaceAll(/disabled/ig, '');
                                cls = cls + ' disabled';
                                p = {...p, className: cls}
                            }

                            return <button key={i} {...p} onClick={callback} title={b.title}>{text}</button>;
                        })}
                    </div>

                    {(buttons.cancel || buttons.ok) && <div className="popup_buttons_box">
                        {buttons.cancel && <button className={`cancel ${buttonsDisabled ? 'disabled' : ''}`.trim()}
                                                   onClick={onCancel}>{cancelButtonContent}</button>}
                        {buttons.prev && <button className={`prev ${buttonsDisabled ? 'disabled' : ''}`.trim()}
                                                 onClick={onPrev}>{prevButtonContent}</button>}
                        {buttons.next && <button className={`next ${buttonsDisabled ? 'disabled' : ''}`.trim()}
                                                 onClick={onNext}>{nextButtonContent}</button>}
                        {buttons.ok && <button className={`ok ${buttonsDisabled ? 'disabled' : ''}`.trim()}
                                               onClick={onOk}>{okButtonContent}</button>}
                    </div>}
                </div>
            </div>
        </div>
    );
}