import cancelIcon from './assets/cancel.svg';

import './popup.css';

// eslint-disable-next-line react/prop-types
export default function Popup({ title, children, showCloseButton = true, onCancel = null, onOk = null }) {
    return (
        <div className="popup-overflow">
            <div className="popup" tabIndex={0}>
                <div className="popup_title">{title}</div>
                {showCloseButton && <div className="popup_cancel" onClick={onCancel}><img src={cancelIcon} alt="Annuler" width={24} height={24} /></div>}

                <div className='popup_content'>
                    {children}
                </div>

                <div className="popup_buttons">
                    <button onClick={onOk}>Valider</button>
                    <button onClick={onCancel}>Annuler</button>
                </div>
            </div>
        </div>
    );
}