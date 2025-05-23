export function stats_visit() {
    fetch(import.meta.env.VITE_APP_API_URL + 'visits.php')
        .catch((error) => console.error(error));
}

export function stats_count(type) {
    fetch(import.meta.env.VITE_APP_API_URL + 'stats.php?type=count_' + type)
        .catch((error) => console.error(error));
}