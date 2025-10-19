/*Object.defineProperty(String.prototype, 'replaceDiacritic', {
    value() {
        return this.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }
});*/


function formatURL(url, args = {}) {
    let u = url;
    if (Object.keys(args).length > 0) u += '?';
    const l = Object.keys(args).map(k => {
        return k + "=" + encodeURIComponent(args[k]);
    }).join('&');
    return u + l;
}

function fetchURL(filename, struct = 'app', args = {}) {
    const url = formatURL(import.meta.env.VITE_APP_API_URL + filename, {
        m: import.meta.env.VITE_APP_MODE,
        s: struct,
        ...args
    });
    if (import.meta.env.VITE_APP_MODE === 'development') {
        fetch(url)
            .then((response) => response.text().then(text => ({ response, text })))
            .then((data) => {
                let { response, text } = data;
                text = text.trim();
                if (text === "") text = "no content";
                console.log(`Fetch response ${response.status} ${response.statusText} from ${url} [${text}]`)
            })
            .catch((error) => console.error(error));
    } else {
        fetch(url)
            .then((response) => response.text().then(text => ({ response, text })))
            .then((data) => {
                let { response, text } = data;
                text = text.trim();
                if (text === "") text = "no content";
                console.log(`Fetch response ${response.status} ${response.statusText} from ${url} [${text}]`)
            })
            .catch((error) => console.error(error));
    }
}

export function visit(struct = 'app') {
    fetchURL('visit.php', struct);
}

export function action(actionName, struct = 'app') {
    fetchURL('action.php', struct, { a: actionName });
}








export function stats_visit(isPing = false) {
    fetch(import.meta.env.VITE_APP_API_URL + 'visits.php' + (isPing ? "?ping" : ""))
        /*.then((response) => response.text())
        .then((data) => console.log(data))*/
        .catch((error) => console.error(error));
}

export function stats_count(type) {
    let t = "";
    if (typeof type === 'string') {
        t = 'count_' + type;
    } else if (Array.isArray(type)) {
        t = type.map((tt) => 'count_' + tt).join('|');
    } else {
        return;
    }
    t = t.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    fetch(import.meta.env.VITE_APP_API_URL + 'stats.php?type=' + t)
        /*.then((response) => response.text())
        .then((data) => console.log(data))*/
        .catch((error) => console.error(error));
}

export function stats_count_json(type, key) {
    let t = "";
    if (typeof type === 'string') {
        t = 'count_' + type;
    } else if (Array.isArray(type)) {
        t = type.map((tt) => 'count_' + tt).join('|');
    } else {
        return;
    }
    t = t.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    let k = Object.fromEntries(Object.entries(key).map(([k, v]) => [k, v.normalize("NFD").replace(/[\u0300-\u036f]/g, "")]));
    k = JSON.stringify(k);
    k = btoa(k);

    fetch(import.meta.env.VITE_APP_API_URL + 'stats.php?type=' + t + '&key=' + k)
        /*.then((response) => response.text())
        .then((data) => console.log(data))*/
        .catch((error) => console.error(error));
}