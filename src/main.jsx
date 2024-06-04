import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'

import App from './App.jsx'

import './main.css';
import * as pkg from '../package.json';

export default function Main() {
    useEffect(() => {
        document.title = `Nouveau projet - ${pkg.title} ${pkg.version}`;

        const versionElement = document.querySelector('sup.version');
        if (versionElement) versionElement.innerText = pkg.version;
    }, []);

    return (
        <React.StrictMode>
            <App />
            <div style={{ marginTop: '1em', fontSize: 'small', color: 'darkgray' }} className='footer'>{pkg.title} {pkg.version} | <a href={pkg.repository.url} style={{ color: 'darkcyan' }} target="_blank">{pkg.repository.url}</a> | Licence {pkg.license} | {pkg.author} (pantaflex44) | 2024</div>
        </React.StrictMode>)
        ;
}

ReactDOM.createRoot(document.getElementById('root')).render(<Main />);
