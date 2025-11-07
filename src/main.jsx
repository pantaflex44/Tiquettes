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

import { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import * as semver from 'semver';

import App from './App.jsx'

import './main.css';
import * as pkg from '../package.json';

function Footer() {
    return (
        <div style={{
            marginTop: '1em',
            fontSize: 'small',
            color: 'darkgray',
        }} className='footer'>{pkg.title} {pkg.version} {/*import.meta.env.VITE_APP_MODE && "(DEV)"*/}<span
            className="not_printable"> | <a href={pkg.repository.url}
                style={{ color: 'var(--primary-color)' }}
                target="_blank">{pkg.repository.url}</a> | <a
                    href="https://www.gnu.org/licenses/agpl-3.0.fr.html" style={{ color: 'var(--primary-color)' }}
                    target="_blank">{`Licence ${pkg.license}`}</a> | <a href="https://pantaflex44.github.io/Portfolio/"
                        style={{ color: 'var(--primary-color)' }}
                        target="_blank">{pkg.author} (pantaflex44)</a> | 2024-2025</span>
        </div>
    );
}

export default function Main() {
    useEffect(() => {
        const defaultUrl = 'https://www.tiquettes.fr/app/?enjoy';

        const domains = ['tiquettes.fr', 'www.tiquettes.fr'];
        const pathes = ['app', 'dev'];

        const origins = [];
        domains.forEach(domain => {
            const o = `https://${domain}`;
            origins.push(o);
            pathes.forEach(path => {
                const k = `${o}/${path}/`;
                origins.push(k);
            });
        });

        origins.push('https://www.tiquettes.fr/app/api/reports.php');

        const origin = window.location.origin.split('?')[0].toLowerCase().trim();

        if (import.meta.env.VITE_APP_MODE !== "development") {
            if (!origins.includes(origin)) window.location.replace(defaultUrl);
        }

        fetch(`./infos.json?t=${Date.now()}`, {
            method: 'GET'
        })
            .then((response) => response.json)
            .then((json) => console.log(typeof json, json))
            .catch(error => console.error("Unable to verify app version : ", error));

    }, []);

    return (
        <>
            <App />
            <Footer />
        </>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Main />);
