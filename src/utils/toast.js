import { sanitize } from './sanitize.js';

// ─── Toast Notification ───────────────────────────────────────────────────────

/**
 * Show a lightweight toast notification.
 * @param {'success'|'error'} type
 * @param {string} message
 * @param {number} [duration=3500]
 */
export const showToast = (type, message, duration = 3500) => {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icon = type === 'success'
        ? `<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
        : `<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;

    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `${icon}<span>${sanitize(message)}</span>`;
    container.appendChild(el);

    setTimeout(() => {
        el.classList.add('fade-out');
        el.addEventListener('animationend', () => el.remove(), { once: true });
    }, duration);
};

// ─── Alert Modal ─────────────────────────────────────────────────────────────

/**
 * Show a modal alert dialog.
 * @param {'success'|'error'} type
 * @param {string} title
 * @param {string} message
 */
export const showAlert = (type, title, message) => {
    const modal = document.getElementById('alert-modal');
    const isSuccess = type === 'success';
    const iconColor = isSuccess ? 'text-yellow-300' : 'text-warning';
    const bgColor = isSuccess ? 'bg-yellow-400/10' : 'bg-yellow-600/10';

    modal.innerHTML = `
        <div class="glass-card p-8 rounded-xl shadow-2xl shadow-black/30 w-full max-w-sm text-center">
            <div class="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center ${bgColor}">
                ${isSuccess
                    ? `<svg class="w-10 h-10 ${iconColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
                    : `<svg class="w-10 h-10 ${iconColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
                }
            </div>
            <h3 class="text-2xl font-bold mb-2 text-fg-primary">${sanitize(title)}</h3>
            <p class="text-fg-secondary mb-8">${sanitize(message)}</p>
            <button id="alert-ok-btn" class="w-full px-6 py-3 btn-primary rounded-md font-bold">OK</button>
        </div>`;

    modal.classList.remove('hidden');
    modal.querySelector('#alert-ok-btn').addEventListener('click', () => modal.classList.add('hidden'));
};

// ─── Confirm Modal ────────────────────────────────────────────────────────────

/**
 * Show a confirmation dialog. Returns a Promise resolving to true/false.
 * @param {string} title
 * @param {string} message
 * @returns {Promise<boolean>}
 */
export const showConfirm = (title, message) => {
    return new Promise((resolve) => {
        const modal = document.getElementById('alert-modal');
        modal.innerHTML = `
        <div class="glass-card p-8 rounded-xl shadow-2xl shadow-black/30 w-full max-w-sm text-center">
            <div class="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center bg-yellow-600/10">
                <svg class="w-10 h-10 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.546-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h3 class="text-2xl font-bold mb-2 text-fg-primary">${sanitize(title)}</h3>
            <p class="text-fg-secondary mb-8">${sanitize(message)}</p>
            <div class="flex justify-center gap-4">
                <button id="confirm-cancel-btn" class="w-full px-6 py-3 btn-secondary rounded-md font-bold">Batal</button>
                <button id="confirm-ok-btn" class="w-full px-6 py-3 btn-primary rounded-md font-bold">Yakin</button>
            </div>
        </div>`;

        modal.classList.remove('hidden');

        const close = () => modal.classList.add('hidden');

        modal.querySelector('#confirm-ok-btn').onclick = () => { close(); resolve(true); };
        modal.querySelector('#confirm-cancel-btn').onclick = () => { close(); resolve(false); };
    });
};
