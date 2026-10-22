import {API} from "./config.js";

let allGenres = [];
export async function loadGenres() {
    const response = await fetch(`${API}/genres`);
    allGenres = await response.json();
}
export function setupGenrePicker(inputId, optionsId)
{
    const input = document.getElementById(inputId);
    const options = document.getElementById(optionsId);

    function render(filterText)
    {
        const query = filterText.toLowerCase();
        const matches = allGenres.filter(g => g.toLowerCase().includes(query));

        options.innerHTML = '';
        matches.forEach(genre =>
        {
            const item = document.createElement('div');
            item.textContent = genre;
            item.addEventListener('mousedown', () =>
            {
                input.value = genre;
                options.classList.remove('open');
            });
            options.appendChild(item);
        });

        options.classList.toggle('open', matches.length > 0);
    }

    input.addEventListener('focus', () => render(''));
    input.addEventListener('input', () => render(input.value));
    input.addEventListener('blur', () =>
    {
        options.classList.remove('open');
        if (!allGenres.includes(input.value))
        {
            input.value = '';
        }
    });
}