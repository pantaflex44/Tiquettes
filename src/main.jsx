import React, {useEffect} from 'react'
import ReactDOM from 'react-dom/client'

import App from './App.jsx'

import './main.css';
import * as pkg from '../package.json';

function Footer() {
    return (
        <div style={{
            marginTop: '1em',
            fontSize: 'small',
            color: 'darkgray',
        }} className='footer'>{pkg.title} {pkg.version}<span className="not_printable"> | <a href={pkg.repository.url} style={{ color: 'var(--primary-color)' }} target="_blank">{pkg.repository.url}</a> | <a href="https://opensource.org/license/mit" style={{ color: 'var(--primary-color)' }} target="_blank">{`Licence ${pkg.license}`}</a> | <a href="https://pantaflex44.github.io/Portfolio/" style={{ color: 'var(--primary-color)' }} target="_blank">{pkg.author} (pantaflex44)</a> | 2024-2025</span>
        </div>
);
}

export default function Main() {
    useEffect(() => {
        if (import.meta.env.VITE_APP_MODE !== "development") {
            const origin = window.location.origin.toLowerCase().trim();
            if (![
                'https://tiquettes.fr',
                'https://www.tiquettes.fr',
                'https://tiquettes.fr/app/',
                'https://www.tiquettes.fr/app/'
            ].includes(origin)) {
                console.log("Tiquettes url app has moved! Go to https://www.tiquettes.fr");
                window.location.replace("https://www.tiquettes.fr");
            }
        }

        if (import.meta.env.VITE_APP_MODE === "development") {
            console.log("Developement mode");
        }
    }, []);

    return (
        <React.StrictMode>
            <App />
            <Footer />
        </React.StrictMode>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Main />);
