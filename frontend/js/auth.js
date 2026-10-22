import {API} from "./config.js";
import {showError, extractErrorMessage} from "./errors.js";

let onSessionExpired = () => {};
export function setSessionExpiredHandler(fn)
{
    onSessionExpired = fn;
}

export function get_token()
{
    return localStorage.getItem('token');
}
export async function authFetch(url, options = {})
{
    const headers = {...(options.headers || {}),
        'Authorization' : `Bearer ${get_token()}`};
    const response = await fetch(url, {...options, headers});

    if(response.status === 401 || response.status === 403){
        onSessionExpired()
    }
    return response;
}

export async function authenticate(path)
{
    const username = document.getElementById('auth-username').value;
    const password = document.getElementById('auth-password').value;

    const response = await fetch(`${API}${path}`,
        {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username, password})
        });

    if(!response.ok){
        const error = await response.json();
        showError(extractErrorMessage(error));
        return false;
    }

    return response.json();
}