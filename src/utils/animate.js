import { formatCurrency } from './format.js';

/**
 * Animate a numeric value from start to end.
 * @param {HTMLElement} element - The element to update.
 * @param {number} start - Starting value.
 * @param {number} end - Ending value.
 * @param {number} duration - Animation duration in ms.
 * @param {boolean} isCurrency - Whether to format as IDR currency.
 */
export function animateNumber(element, start, end, duration = 1000, isCurrency = true) {
    if (!element) return;
    
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const current = Math.floor(progress * (end - start) + start);
        
        element.textContent = isCurrency ? formatCurrency(current) : current;
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}
