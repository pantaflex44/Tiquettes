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

import {useEffect} from 'react'
import ReactDOM from 'react-dom/client'

import App from './App.jsx'

import './main.css';
import './print.css';

import * as pkg from '../package.json';

function Footer() {
    return (
        <div className='footer'>{pkg.title} {pkg.version}<span className="notprintable"> | <a href={pkg.repository.url}
                                                                                              target="_blank">{pkg.repository.url}</a> | <a
            href="https://www.gnu.org/licenses/agpl-3.0.fr.html" target="_blank">{`Licence ${pkg.license}`}</a> | <a
            href="https://pantaflex44.github.io/Portfolio/"
            target="_blank">{pkg.author} (pantaflex44)</a> | 2024-2025</span>
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
                'https://tiquettes.fr/app/?enjoy',
                'https://tiquettes.fr/app/?new',
                'https://www.tiquettes.fr/app/',
                'https://www.tiquettes.fr/app/?enjoy',
                'https://www.tiquettes.fr/app/?new',
                'https://www.tiquettes.fr/app/?test',
                'https://www.tiquettes.fr/app/api/toPdf.php'
            ].includes(origin)) {
                window.location.replace("https://www.tiquettes.fr/app/?enjoy");
            }
        }

        if (import.meta.env.VITE_APP_MODE === "development") {
            console.log("Developement mode");
        }
    }, []);

    return (
        <>
            <App/>
            <Footer/>
        </>
    )
        ;
}

ReactDOM.createRoot(document.getElementById('root')).render(<Main/>);
