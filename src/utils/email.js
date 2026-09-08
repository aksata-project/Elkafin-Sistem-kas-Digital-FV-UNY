// ─── EmailJS Email Utility ────────────────────────────────────────────────────
import { getWeeklyTarget } from '../store/state.js';

const EMAILJS_SERVICE_ID  = 'service_0ufbpxe';
const EMAILJS_TEMPLATE_ID = 'template_vuesfjp';
const EMAILJS_PUBLIC_KEY  = 'pfdKjO-Bh1WkTR7sA';

let initPromise = null;

function initEmailJS() {
    if (initPromise) return initPromise;
    initPromise = new Promise((resolve, reject) => {
        if (window.emailjs) { resolve(); return; }
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
        script.onload = () => {
            window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
            resolve();
        };
        script.onerror = () => reject(new Error('Gagal memuat EmailJS SDK'));
        document.head.appendChild(script);
    });
    return initPromise;
}

/**
 * Send ONE cumulative billing email to a student showing all their unpaid weeks
 * with individual amounts per week and a total.
 *
 * @param {{ name: string, email: string }} student
 * @param {{ week: number, amount: number }[]} unpaidDetails - per-week breakdown
 */
export async function sendCumulativeEmail(student, unpaidDetails) {
    await initEmailJS();

    const totalDebt = unpaidDetails.reduce((sum, d) => sum + d.amount, 0);

    // Build a human-readable breakdown string
    // e.g. "Minggu 1: Rp 2.000\nMinggu 3: Rp 2.000\nMinggu 5: Rp 2.000"
    const debtDetails = unpaidDetails
        .map(d => `Minggu ${d.week}: Rp ${d.amount.toLocaleString('id-ID')}`)
        .join('\n');

    const unpaidWeeks = unpaidDetails.map(d => d.week).join(', ');

    return window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        student_name: student.name,
        email:        student.email,
        unpaid_weeks: unpaidWeeks,
        week_count:   unpaidDetails.length,
        total_debt:   totalDebt.toLocaleString('id-ID'),
        debt_details: debtDetails,
    });
}

/**
 * Send cumulative billing reminders to ALL students who have ANY unpaid weeks.
 * Each student receives ONE email summarising all their unpaid weeks with
 * the correct per-week amount (not a flat rate).
 *
 * @param {Array}    students        - all students with .nim, .name, .email
 * @param {Array}    kasTransactions - all kas transactions
 * @param {number}   startWeek       - starting week to check
 * @param {number}   endWeek         - ending week to check (inclusive)
 * @param {Function} onProgress      - (sent, total, studentName) => void
 * @returns {{ sent, skipped, failed }}
 */
export async function sendCumulativeBillingReminders(students, kasTransactions, startWeek, endWeek, onProgress) {
    await initEmailJS();

    // Build set of paid (nim, week) pairs
    const paidSet = new Set(
        kasTransactions
            .filter(t => t.amount > 0)
            .map(t => `${t.nim}-${t.week}`)
    );

    const weeks = Array.from({ length: endWeek - startWeek + 1 }, (_, i) => startWeek + i);

    // For each student, find ALL unpaid weeks with their individual amounts
    const studentsWithDebt = students
        .map(s => {
            const unpaidDetails = weeks
                .filter(w => !paidSet.has(`${s.nim}-${w}`))
                .map(w => ({ week: w, amount: getWeeklyTarget(w) }));
            return { student: s, unpaidDetails };
        })
        .filter(({ student, unpaidDetails }) => unpaidDetails.length > 0 && student.email);

    const skippedNoEmail = students.filter(s =>
        weeks.some(w => !paidSet.has(`${s.nim}-${w}`)) && !s.email
    ).length;

    const total = studentsWithDebt.length;
    let sent = 0, failed = 0;

    for (const { student, unpaidDetails } of studentsWithDebt) {
        try {
            await sendCumulativeEmail(student, unpaidDetails);
            sent++;
        } catch {
            failed++;
        }
        onProgress?.(sent + failed, total, student.name);
        await new Promise(r => setTimeout(r, 300));
    }

    return { sent, skipped: skippedNoEmail, failed };
}
