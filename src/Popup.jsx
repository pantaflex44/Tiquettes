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
    additionalButtons = [],
    onCancel = null,
    onOk = null
}) {
    return (
        <div className="popup-overflow">
            <div className='popup' tabIndex={0} style={{ width: `${width}px` }}>
                <div className="popup_title">{title}</div>
                {showCloseButton && <div className="popup_cancel" onClick={onCancel}><img src={cancelIcon} alt="Annuler" width={24} height={24} /></div>}

                <div className={`popup_content ${className}`} style={style}>
                    {children}
                </div>

                <div className="popup_buttons">
                    <div className="popup_buttons_box">
                        {Array.isArray(additionalButtons) && additionalButtons.map((b, i) => {
                            if (!b.text || !b.callback) return null;
                            const { text, callback, ...props } = b;
                            if (text.trim() === '') return null;
                            
                            return <button key={i} {...props} onClick={callback}>{text}</button>;
                        })}
                    </div>
                    <div className="popup_buttons_box">
                        <button className='cancel' onClick={onCancel}>Annuler</button>
                        <button className='ok' onClick={onOk}>Valider</button>
                    </div>
                </div>
            </div>
        </div>
    );
}