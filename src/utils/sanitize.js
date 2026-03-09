/**
 * Escape HTML special characters to prevent XSS when injecting into innerHTML.
 * @param {any} str
 * @returns {string}
 */
export const sanitize = (str) =>
    String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
