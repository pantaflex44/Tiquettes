import {useEffect, useState} from "react";
import pkg from '../package.json';

function useApi() {
    function getSavedToken() {
        const t = sessionStorage.getItem(`${pkg.name}_token`);
        if (t === null) return '';
        return t;
    }

    function getSavedExpireAt() {
        const e = sessionStorage.getItem(`${pkg.name}_exp`);
        if (e === null) return 0;
        return e;
    }

    const [token, setToken] = useState(getSavedToken());
    const [expireAt, setExpireAt] = useState(getSavedExpireAt());

    function clearToken() {
        setToken('');
        setExpireAt(0);
    }

    function tokenExpired() {
        const now = Date.now();
        if (token !== '' && now > expireAt) {
            clearToken();
            return true;
        }
        return false;
    }

    useEffect(() => {
        const t = (token ?? '').trim();
        if (t === '') {
            sessionStorage.removeItem(`${pkg.name}_token`);
        } else {
            sessionStorage.setItem(`${pkg.name}_token`, t);
        }
    }, [token]);

    useEffect(() => {
        if (expireAt === 0) {
            sessionStorage.removeItem(`${pkg.name}_exp`);
        } else {
            sessionStorage.setItem(`${pkg.name}_exp`, expireAt);
        }
    }, [expireAt]);


    return async (method, category, action, getParams = {}, formData = null) => {
        try {
            if (tokenExpired()) throw new Error('Expired token');

            let url = import.meta.env.VITE_APP_API_URL + 'api.php?c=' + encodeURIComponent(category.trim()) + '&a=' + encodeURIComponent(action.trim());

            let options = {
                method,
                mode: 'cors',
                headers: {
                    'Accept': 'application/json',
                }
            };
            const t = (token ?? '').trim();
            if (t !== '') options = {...options, headers: {...options.headers, 'Authorization': `Bearer ${t}`}}

            const params = Object.entries(getParams).map(([key, value]) => {
                return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
            }).join('&').trim();
            if (params !== '') url += '&' + params;
            if (typeof formData === 'object' && formData) options = {...options, body: formData};

            const response = await fetch(url, options);

            if (!response.ok) {
                let message = "";
                switch (response.status) {
                    case 401: // Unauthorized
                        message = "Unauthorized";
                        clearToken();
                        break;
                    case 403: // Not authorized
                        message = "Not authorized";
                        clearToken();
                        break;
                    case 400: // Bad request
                        message = "Bad request";
                        break;
                    case 410: // Token expired
                        message = "Token expired";
                        clearToken();
                        break;
                    default: // Request error
                        message = response.statusText ?? "Request error";
                }
                throw new Error(response.status + " " + message);
            }

            if (category === 'user' && action === 'logout') {
                clearToken();
                return true;
            }

            try {
                const content = await response.text();
                const contentType = response.headers.get("content-type");
                const isJSON = (contentType && contentType.indexOf("application/json") !== -1);
                //console.log(content);
                if (isJSON) {
                    const json = JSON.parse(content);
                    if (json.token) setToken(json.token);
                    if (json.expireAt) setExpireAt(json.expireAt * 1000);
                    return json;
                } else {
                    throw new Error(content);
                }
            } catch (err) {
                throw new Error(err);
            }

        } catch (error) {
            console.error(`API ${action}`, error);
            throw new Error(error);
        }
    }
}

export default useApi;