export function showError(message)
{
    const banner = document.getElementById('error-banner');
    banner.textContent = message;
    banner.classList.add('active');

    setTimeout(() =>
    {banner.classList.remove('active');}, 4000);
}
export function extractErrorMessage(error)
{
    if (typeof error.detail === 'string')
    {
        return error.detail;
    }

    if (Array.isArray(error.detail))
    {
        return error.detail.map(e => e.msg).join(', ');
    }

    return 'An unexpected error occurred.';
}
