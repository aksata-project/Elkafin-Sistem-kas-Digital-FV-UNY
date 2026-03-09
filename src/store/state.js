// ─── Constants ───────────────────────────────────────────────────────────────
export const WEEKLY_TARGET = 2000;
export const SEMESTER_2_START_WEEK = 1;

export const getWeeklyTarget = (week) => 2000;

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
    allStudents: [],
    kasTransactions: [],
    kasExpenses: [],
    roles: {},
    announcement: null,
    currentWeek: 1,
    manualMaxWeek: 1,
    paymentStatusPage: 0,
    trenKasPage: 0,
    carryOver: { teori_c: 0, teori_d: 0, angkatan: 0 },
    warnings: {}
};
