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

import "./twofaInput.css";

import { createRef, useEffect, useMemo, useRef, useState } from "react";
import useLocalDebounce from './useLocalDebounce';

export default function TwofaInput({
    email,
    id = '2fa',
    name = '2fa',
    onError = null,
    onSend = null,
    onLoading = null,
    onVerifying = null,
    onValidaded = null,
    onErrorCleared = null
}) {
    const twofaCodeLength = 6;

    const entryToCleanExploded = (entry) => {
        const v = `${entry}`.trim().toUpperCase();
        let ev = v.split('');
        if (ev.length > twofaCodeLength) ev = ev.slice(0, twofaCodeLength);
        ev = ev.map(s => s.match(/^[0-9A-Z]+$/i) ? s : '_');
        while (ev.length < twofaCodeLength) ev.push('_');
        return ev;
    };

    const [sent, setSended] = useState(false);
    const [value, setValue] = useState(''.padStart(twofaCodeLength, '_'));
    const debouncedValue = useLocalDebounce(value, 500);
    const explodedValue = useMemo(() => entryToCleanExploded(value), [value]);
    const [loading, setLoading] = useState(false);
    const [resendLink, setResendLink] = useState(false);
    const [verifying, setVerifying] = useState(false);

    const refs = useMemo(() => {
        const r = Array(twofaCodeLength)
            .fill()
            .map(_ => createRef());
        return r;
    }, [twofaCodeLength]);
    const boxRef = createRef();

    useEffect(() => {
        if (onLoading) onLoading(loading);
    }, [loading]);

    useEffect(() => {
        if (sent && refs.length > 0) refs[0].current.focus();

        let resendTimer = null;
        if (sent) {
            resendTimer = setTimeout(() => setResendLink(true), 1000 * 60 * 3);
        }
        if (!sent) {
            setResendLink(false);
            if (resendTimer !== null) {
                clearTimeout(resendTimer);
                resendTimer = null;
            }
        }

        return () => {
            setResendLink(false);
            if (resendTimer !== null) {
                clearTimeout(resendTimer);
                resendTimer = null;
            }
        }
    }, [sent]);

    useEffect(() => {
        if (debouncedValue.length === twofaCodeLength && !debouncedValue.includes('_') && !verifying) {
            setVerifying(true);
            if (onVerifying) onVerifying();
            if (onErrorCleared) onErrorCleared();

            fetch(`${import.meta.env.VITE_APP_API_URL}auth.php?function=twoFaCheck&email=${encodeURIComponent(email)}&token=${encodeURIComponent(debouncedValue)}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            })
                .then(response => {
                    //console.log(response.text());
                    return response.json();
                })
                .then(data => {
                    if (data.status === 'error') {
                        if (onError) onError(data.message);
                        setVerifying(false);
                        setResendLink(true);
                    } else if (data.status === 'ok') {
                        if (onValidaded) onValidaded();
                        setResendLink(false);
                    }
                })
                .catch(error => {
                    setSended(false);
                    if (onError) onError(JSON.stringify(error));
                    setVerifying(false);
                    setResendLink(true);
                });
        }
    }, [debouncedValue]);

    const handleSendLink = () => {
        if (onErrorCleared) onErrorCleared();
        setValue(''.padStart(twofaCodeLength, '_'));
        setSended(false); 
    };

    const handleSend = () => {
        setLoading(true);
        if (onErrorCleared) onErrorCleared();

        if (onSend) onSend();

        fetch(`${import.meta.env.VITE_APP_API_URL}auth.php?function=twoFaSend&email=${encodeURIComponent(email)}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        })
            .then(response => {
                //console.log(response.text());
                return response.json();
            })
            .then(data => {
                if (data.status === 'error') {
                    if (onError) onError(data.message);
                } else if (data.status === 'ok') {
                    setSended(data.sent);
                }
            })
            .catch(error => {
                setSended(false);
                if (onError) onError(JSON.stringify(error));
            })
            .finally(() => {
                setLoading(false);
            });
    }

    return <>{sent
        ? (<>
            <label htmlFor={name}>Vous allez recevoir d'ici peu le jeton de sécurité à repporter dans les cases ci-dessous.</label>
            <div id={id} name={name} className="twofaBox" tabIndex={99} ref={boxRef} >
                {
                    Array.from(Array(twofaCodeLength), (e, i) => (
                        <div id={`twofaBox_input_${i}`.trim()} ref={refs[i]} key={i} className={`twofaBox_input ${explodedValue[i] === '' ? 'empty' : ''} ${verifying ? 'disabled' : ''}`.trim()} onKeyUp={(e) => {
                            if (verifying) return;

                            const k = e.key.trim();
                            if (e.ctrlKey && k.toLowerCase() === 'v') {
                                navigator.clipboard.readText()
                                    .then(t => {
                                        setValue(entryToCleanExploded(t).join(''));
                                    })
                                    .catch(() => alert("Impossible de coller ces données."));
                            } else if (k.toLowerCase() === 'escape') {
                                boxRef.current.focus();
                            } else {
                                let ev = [...explodedValue];
                                let next = false;
                                let prev = false;
                                let start = false;
                                let end = false;
                                if (k.length === 1 && k.toUpperCase().match(/^[0-9A-Z]+$/i)) {
                                    ev.splice(i, 1, k.toUpperCase());
                                    next = true;
                                } else if (k.toLowerCase() === 'delete' && ev[i] !== '_') {
                                    ev.splice(i, 1, "_");
                                } else if (k.toLowerCase() === 'backspace' && ev[i] !== '_') {
                                    ev.splice(i, 1, "_");
                                    prev = true;
                                } else if (k.toLowerCase() === 'arrowleft' && i > 0) {
                                    prev = true;
                                } else if (k.toLowerCase() === 'arrowright' && i < twofaCodeLength - 1) {
                                    next = true;
                                } else if (k.toLowerCase() === 'home') {
                                    start = true;
                                } else if (k.toLowerCase() === 'end') {
                                    end = true;
                                }

                                setValue(ev.join(''));

                                if (prev) {
                                    if (i > 0) refs[i - 1].current.focus();
                                    //if (i <= 0) refs[twofaCodeLength - 1].current.focus();
                                } else if (next) {
                                    if (i < twofaCodeLength - 1) refs[i + 1].current.focus();
                                    //if (i >= twofaCodeLength - 1) refs[0].current.focus();
                                } else if (start) {
                                    refs[0].current.focus();
                                } else if (end) {
                                    refs[twofaCodeLength - 1].current.focus();
                                }
                            }
                        }} tabIndex={`10${i}`}>
                            <span>{explodedValue[i] === '_' ? '' : explodedValue[i]}</span>
                        </div>
                    ))
                }
            </div>
            {resendLink && !verifying && <a className="twofaBoxResendLink" href="#" onClick={() => { handleSendLink() }}>↺ Je demande un nouveau jeton de sécurité !</a>}
        </>)
        : (
            <>
                <label htmlFor={name}>Rendez-vous dans votre boite email pour récupérer le jeton de sécurité.</label>
                <button disabled={loading} type="button" className="twofaBoxSendButton" onClick={() => handleSend()}>
                    <span>Cliquer ici pour recevoir le jeton de sécurité</span>
                    {loading && <span className="loader"></span>}
                </button>
            </>
        )}
    </>;
}