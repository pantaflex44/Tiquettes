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

import {useRef} from "react";

import eyeIcon from "./assets/eye.svg";
import eyeOffIcon from "./assets/eye-off.svg";

function PasswordInput({
                           id = '',
                           name = '',
                           placeholder = '',
                           value = '',
                           onChange = null,
                           onFocus = null,
                           onBlur = null,
                           ...props
                       }) {
    const passwordInputRef = useRef(null);
    const passwordImgRef = useRef(null);

    return (
        <div className={'password_form_row'}>
            <input type={'password'} id={id} name={name} placeholder={placeholder}
                   ref={passwordInputRef}
                   style={{minHeight: '32px'}}
                   autoComplete={'new-password'}
                   value={value}
                   onChange={onChange}
                   onInput={(e) => {
                       if (e.target.type !== 'password') {
                           e.target.type = 'password';
                           passwordImgRef.current.src = eyeIcon;
                       }
                   }}
                   onFocus={onFocus}
                   onBlur={onBlur}
                   {...props}
            />
            <img src={eyeIcon} ref={passwordImgRef} width={18} height={18} onClick={(e) => {
                if (passwordInputRef.current.type === 'password') {
                    passwordInputRef.current.type = 'text';
                    e.target.src = eyeOffIcon;
                } else {
                    passwordInputRef.current.type = 'password';
                    e.target.src = eyeIcon;
                }
                passwordInputRef.current.focus();
            }}/>
        </div>
    );
}

export default PasswordInput;