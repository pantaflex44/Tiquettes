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

import App from './App.jsx'

import './main.css';
import * as pkg from '../package.json';
import UserProvider from "./UserProvider.jsx";

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
        const origin = window.location.origin.toLowerCase().trim();

        if (import.meta.env.VITE_APP_MODE !== "development") {
            if (![
                'https://tiquettes.fr',
                'https://www.tiquettes.fr',
                'https://tiquettes.fr/app/',
                'https://tiquettes.fr/app/?enjoy',
                'https://tiquettes.fr/app/?new',
                'https://www.tiquettes.fr/app/',
                'https://www.tiquettes.fr/app/?enjoy',
                'https://www.tiquettes.fr/app/?new',
                'https://www.tiquettes.fr/app/?test',
                'https://www.tiquettes.fr/app/api/toPdf.php',
                'https://www.tiquettes.fr/app/infos.json',
            ].includes(origin)) {
                window.location.replace("https://www.tiquettes.fr/app/?enjoy");
            }
        }

        if (import.meta.env.VITE_APP_MODE === "development") {
            console.log("Developement mode");
        }
    }, []);

    return (
        <UserProvider>
            {/*import.meta.env.VITE_APP_MODE && <>
                <p className={"devmode blink"}>Version {pkg.version} en cours de développement</p>
                <p className={"devmode"}>Version stable disponible ici: <a href={"https://www.tiquettes.fr/app/"}>https://www.tiquettes.fr/app/</a></p>
            </>*/}
            <App />
            <Footer />
        </UserProvider>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Main />);
