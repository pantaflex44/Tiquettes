export function stats_visit() {
    fetch(import.meta.env.VITE_APP_API_URL + 'visits.php')
        .catch((error) => console.error(error));
}

export function stats_count(type) {
    const t = type.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    fetch(import.meta.env.VITE_APP_API_URL + 'stats.php?type=count_' + t)
        .catch((error) => console.error(error));
}

export function stats_count_json(type, key) {
    const t = type.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    let k = Object.fromEntries(Object.entries(key).map(([k, v]) => [k, v.normalize("NFD").replace(/[\u0300-\u036f]/g, "")]));
    k = JSON.stringify(k);
    k = btoa(k);

    fetch(import.meta.env.VITE_APP_API_URL + 'stats.php?type=count_' + t + '&key=' + k)
        .catch((error) => console.error(error));
}