// ─── Global auth references (mutated by auth module) ─────────────────────────
export let currentUser = null;
export let userData = null;
export let isInitialLoad = true;
export let unsubscribers = [];

export function setCurrentUser(user) { currentUser = user; }
export function setUserData(data) { userData = data; }
export function setIsInitialLoad(val) { isInitialLoad = val; }
export function setUnsubscribers(arr) { unsubscribers = arr; }

// ─── Application State ───────────────────────────────────────────────────────
export const state = {
    allStudents: [],          // Only active students (status !== 'inactive')
    inactiveStudents: [],     // Students with status === 'inactive'
    kasTransactions: [],
    kasExpenses: [],
    roles: {},
    announcement: null,
    currentWeek: 1,           // Highest week number from existing transactions
    paymentStatusPage: 0,
    trenKasPage: 0,
    carryOver: { teori_c: 0, teori_d: 0, angkatan: 0 },
    warnings: {},
    events: [],               // Active/archived event fund objects
    eventPayments: [],        // All event installment payment records
    activityLogs: [],         // Treasury activity logs for UI
    qrisConfig: {},           // QRIS images + WA numbers per class (C1,C2,D1,D2,C,D)
    semester: {
        label: '',             // e.g. "Genap 2025/2026"
        startDate: null,       // ISO date string: '2025-02-17'
        weeklyAmount: 2000,    // Nominal kas per minggu
        manualMaxWeek: null,   // Manual override; null = use calendar
    }
};

// ─── Calendar-Based Week Calculations ─────────────────────────────────────────

/**
 * Calculate current week number based on calendar date.
 * Week 1 starts on state.semester.startDate.
 * @returns {number} Current week number (0 if semester hasn't started, 1+ if active)
 */
export const getCurrentCalendarWeek = () => {
    if (!state.semester.startDate) return 1;
    const start = new Date(state.semester.startDate);
    start.setHours(0, 0, 0, 0);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffMs = now - start;
    if (diffMs < 0) return 0; // semester belum dimulai
    return Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1;
};

/**
 * Single source of truth: how many weeks are currently available.
 * Uses manualMaxWeek if set by admin, otherwise falls back to calendar.
 * @returns {number}
 */
export const getMaxWeek = () => {
    if (state.semester.manualMaxWeek != null && state.semester.manualMaxWeek > 0) {
        return state.semester.manualMaxWeek;
    }
    const calendarWeek = getCurrentCalendarWeek();
    return Math.max(calendarWeek, 1);
};

/**
 * Get the date range (start and end) for a specific week number.
 * @param {number} week - Week number (1-indexed)
 * @returns {{ start: Date, end: Date } | null}
 */
export const getWeekDateRange = (week) => {
    if (!state.semester.startDate) return null;
    const start = new Date(state.semester.startDate);
    start.setHours(0, 0, 0, 0);
    const weekStart = new Date(start.getTime() + (week - 1) * 7 * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
    return { start: weekStart, end: weekEnd };
};

/**
 * Format a week's date range as a short string.
 * @param {number} week
 * @returns {string} e.g. "17 Feb – 23 Feb"
 */
export const formatWeekRange = (week) => {
    const range = getWeekDateRange(week);
    if (!range) return '';
    const opts = { day: 'numeric', month: 'short' };
    return `${range.start.toLocaleDateString('id-ID', opts)} – ${range.end.toLocaleDateString('id-ID', opts)}`;
};

/**
 * Get the weekly kas target for a given week.
 * @param {number} week
 * @returns {number}
 */
export const getWeeklyTarget = (week) => state.semester.weeklyAmount || 2000;
