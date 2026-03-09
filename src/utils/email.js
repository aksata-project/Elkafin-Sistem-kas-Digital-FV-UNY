// ─── EmailJS Email Utility ────────────────────────────────────────────────────
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
 * Send ONE cumulative billing email to a student showing all their unpaid weeks.
 * @param {{ name: string, email: string }} student
 * @param {number[]} unpaidWeeks   - e.g. [1, 3, 4]
 * @param {number}   amountPerWeek - kas amount per week (e.g. 2000)
 */
export async function sendCumulativeEmail(student, unpaidWeeks, amountPerWeek) {
    await initEmailJS();
    const totalDebt = (unpaidWeeks.length * amountPerWeek).toLocaleString('id-ID');
    return window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        student_name: student.name,
        email:        student.email,
        unpaid_weeks: unpaidWeeks.join(', '),
        week_count:   unpaidWeeks.length,
        total_debt:   totalDebt,
    });
}

/**
 * Send cumulative billing reminders to ALL students who have ANY unpaid weeks.
 * Each student receives ONE email summarising all their unpaid weeks.
 *
 * @param {Array}    students        - all students with .nim, .name, .email
 * @param {Array}    kasTransactions - all kas transactions
 * @param {number}   startWeek       - starting week to check
 * @param {number}   endWeek         - ending week to check (inclusive)
 * @param {number}   amountPerWeek   - kas amount per week
 * @param {Function} onProgress      - (sent, total, studentName) => void
 * @returns {{ sent, skipped, failed }}
 */
export async function sendCumulativeBillingReminders(students, kasTransactions, startWeek, endWeek, amountPerWeek, onProgress) {
    await initEmailJS();

    // Build set of paid (nim, week) pairs
    const paidSet = new Set(
        kasTransactions
            .filter(t => t.amount > 0)
            .map(t => `${t.nim}-${t.week}`)
    );

    // For each student, find ALL unpaid weeks (startWeek..endWeek)
    const studentsWithDebt = students
        .map(s => {
            const unpaidWeeks = Array.from({ length: endWeek - startWeek + 1 }, (_, i) => startWeek + i)
                .filter(w => !paidSet.has(`${s.nim}-${w}`));
            return { student: s, unpaidWeeks };
        })
        .filter(({ student, unpaidWeeks }) => unpaidWeeks.length > 0 && student.email);

    const skippedNoEmail = students.filter(s =>
        Array.from({ length: endWeek - startWeek + 1 }, (_, i) => startWeek + i).some(w => !paidSet.has(`${s.nim}-${w}`)) && !s.email
    ).length;

    const total = studentsWithDebt.length;
    let sent = 0, failed = 0;

    for (const { student, unpaidWeeks } of studentsWithDebt) {
        try {
            await sendCumulativeEmail(student, unpaidWeeks, amountPerWeek);
            sent++;
        } catch {
            failed++;
        }
        onProgress?.(sent + failed, total, student.name);
        await new Promise(r => setTimeout(r, 300));
    }

    return { sent, skipped: skippedNoEmail, failed };
}
