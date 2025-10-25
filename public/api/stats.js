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
            if (import.meta.env.VITE_APP_MODE === 'development') {
                console.log(`Fetch response ${response.status} ${response.statusText} from ${url} [${text}]`)
            }
        })
        .catch((error) => console.error(error));

}

export function visit(struct = 'web') {
    fetchURL('visit.php', struct);
}

export function action(actionName, struct = 'app') {
    fetchURL('action.php', struct, { a: actionName });
}
