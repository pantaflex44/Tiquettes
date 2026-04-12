/**
 Tiquettes - Générateur d'étiquettes pour tableaux et armoires électriques
 Copyright (C) 2024-2026 Christophe LEMOINE

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

'use strict'

import { StrictMode, useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import * as semver from 'semver';

import App from './App.jsx'

import './main.css';
import * as pkg from '../package.json';
import NewVersionPopup from './NewVersionPopup.jsx';


Array.prototype.replaceItemWith = function (item, newItem) {
    const index = this.indexOf(item);
    if (index !== -1) {
        this[index] = newItem;
    }
};


Array.prototype.removeItem = function (item) {
    const index = this.indexOf(item);
    if (index !== -1) {
        this.splice(index, 1);
    }
};


Array.prototype.insertItemAt = function (index, newItem) {
    this.splice(index, 0, newItem);
};


Array.prototype.moveItem = function (item, newIndex) {
    const index = this.indexOf(item);
    if (index !== -1) {
        this.splice(index, 1);
        this.splice(newIndex, 0, item);
    }
};


Array.prototype.moveItemTo = function (item, targetArray) {
    const index = this.indexOf(item);
    if (index !== -1) {
        this.splice(index, 1);
        targetArray.push(item);
    }
};


Array.prototype.moveItemToIndex = function (item, targetArray, targetIndex) {
    const index = this.indexOf(item);
    if (index !== -1) {
        this.splice(index, 1);
        targetArray.splice(targetIndex, 0, item);
    }
};


Array.prototype.swapItems = function (item1, item2) {
    const index1 = this.indexOf(item1);
    const index2 = this.indexOf(item2);
    if (index1 !== -1 && index2 !== -1) {
        this[index1] = item2;
        this[index2] = item1;
    }
};


Array.prototype.getItemAfter = function (item) {
    const index = this.indexOf(item);
    if (index !== -1 && index < this.length - 1) {
        return this[index + 1];
    }
    return null;
};


Array.prototype.getItemBefore = function (item) {
    const index = this.indexOf(item);
    if (index > 0) {
        return this[index - 1];
    }
    return null;
};


Array.prototype.getFirstItem = function () {
    return this.length > 0 ? this[0] : null;
};


Array.prototype.getLastItem = function () {
    return this.length > 0 ? this[this.length - 1] : null;
};


Array.prototype.containsItem = function (item) {
    return this.indexOf(item) !== -1;
};


Array.prototype.clear = function () {
    this.length = 0;
};


Array.prototype.clone = function () {
    return this.slice();
};


Array.prototype.filterBy = function (callback) {
    const result = [];
    this.forEach(item => {
        if (callback(item)) {
            result.push(item);
        }
    });
    return result;
};


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
                    target="_blank">{pkg.author} (pantaflex44)</a> | &copy; 2024-{new Date().getFullYear()}</span>
        </div>
    );
}

export default function Main() {
    const [newVersionAvaillable, setNewVersionAvaillable] = useState(null);

    useEffect(() => {
        console.log("Mode:", import.meta.env.VITE_APP_MODE);

        //if (import.meta.env.VITE_APP_MODE !== "development") {
        const defaultUrl = 'https://www.tiquettes.fr/app/?enjoy';

        const domains = ['tiquettes.fr', 'www.tiquettes.fr'];
        const pathes = [
            '/app/',
            '/app/api/reports.php',
            '/app/api/resume.php',
            '/app/infos.json',
            '/api/',
            '/dev/'
        ];

        const origins = [];
        domains.forEach(domain => {
            const o = `https://${domain}`;
            origins.push(o);
            pathes.forEach(path => {
                const k = `${o}${path}`;
                origins.push(k);
            });
        });
        origins.push('http://localhost:' + import.meta.env.VITE_SERVER_PORT);
        origins.push('https://localhost:' + import.meta.env.VITE_SERVER_PORT);

        const origin = window.location.origin.split('?')[0].toLowerCase().trim();
        if (!origins.includes(origin)) window.location.replace(defaultUrl);
        //}

        fetch(`./infos.json?t=${Date.now()}`, {
            method: 'GET',
            cache: 'no-store',
            headers: {
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
            }
        })
            .then((response) => response.json())
            .then((json) => {
                const currentVersion = json.version ?? "0.0.0";
                const localVersion = pkg.version;

                if (semver.gt(currentVersion, localVersion)) {
                    console.log(`New version ${currentVersion} availlable ! Please force your browser to reload before using it.`);
                    setNewVersionAvaillable(currentVersion);
                } else {
                    console.log(`You are up to date. Current version: ${currentVersion}`);
                }
            })
            .catch(error => console.error("Unable to verify app version : ", error));

    }, []);

    return (
        <>
            <App />
            <Footer />

            {newVersionAvaillable && <NewVersionPopup
                newVersion={newVersionAvaillable}
                onOk={() => {
                    window.location.reload(true);
                }}
            />}
        </>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Main />);
