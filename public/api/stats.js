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