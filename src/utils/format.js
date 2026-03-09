/**
 * Format number as Indonesian Rupiah currency.
 * @param {number} amount
 * @returns {string}
 */
export const formatCurrency = (amount) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);

/**
 * Format a Firestore Timestamp to a human-readable Indonesian date+time string.
 * @param {{ seconds: number } | null} timestamp
 * @returns {string}
 */
export const formatDateTime = (timestamp) =>
    timestamp
        ? new Date(timestamp.seconds * 1000).toLocaleString('id-ID', {
            dateStyle: 'long',
            timeStyle: 'short'
          })
        : '-';
