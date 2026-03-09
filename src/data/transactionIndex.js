import { state } from '../store/state.js';

/**
 * Lookup map for O(1) payment queries: transactionIndex[nim][week] = totalAmount
 * Rebuilt whenever state.kasTransactions changes.
 */
export let transactionIndex = {};

/**
 * Rebuild the transactionIndex from the current state.kasTransactions array.
 * Call this after every kasTransactions snapshot update.
 */
export const buildTransactionIndex = () => {
    transactionIndex = {};
    state.kasTransactions.forEach(t => {
        if (!transactionIndex[t.nim]) transactionIndex[t.nim] = {};
        transactionIndex[t.nim][t.week] = (transactionIndex[t.nim][t.week] || 0) + t.amount;
    });
};

/**
 * Get total amount paid by a student for a specific week. O(1).
 * @param {string} nim
 * @param {number} week
 * @returns {number}
 */
export const getTotalPaid = (nim, week) => transactionIndex[nim]?.[week] || 0;
