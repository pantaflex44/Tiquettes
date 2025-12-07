/**
 * Tiquettes - Générateur d'étiquettes pour tableaux et armoires électriques
 * Copyright (C) 2024-2026 Christophe LEMOINE
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

function formatURL(url, args = {}) {
    let u = url;
    if (Object.keys(args).length > 0) u += '?';
    const l = Object.keys(args).map(k => {
        return k + "=" + encodeURIComponent(args[k]);
    }).join('&');
    return u + l;
}

function fetchURL(filename, struct, args = {}) {
    const url = formatURL(import.meta.env.VITE_APP_API_URL + filename, {
        m: import.meta.env.VITE_APP_MODE,
        s: struct,
        ...args
    });
    fetch(url)
        .then((response) => response.text().then(text => ({ response, text })))
        .then((data) => {
            let { response, text } = data;
            text = text.trim();
            if (text === "") text = "no content";
            /*if (import.meta.env.VITE_APP_MODE === 'development') {
                console.log(`Fetch response ${response.status} ${response.statusText} from ${url} [${text}]`)
            }*/
        })
        .catch((error) => console.error(error));

}

export function visit(struct = 'web') {
    fetchURL('visit.php', struct);
}

export function action(actionName, struct = 'app') {
    fetchURL('action.php', struct, { a: actionName });
}

export function choices(choiceName, keys = [], struct = 'app') {
    fetchURL('choices.php', struct, { c: choiceName, k: keys.join('|') });
}
