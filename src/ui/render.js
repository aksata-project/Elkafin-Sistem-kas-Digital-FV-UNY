import { state, getWeeklyTarget, getMaxWeek, getCurrentCalendarWeek, formatWeekRange, userData } from '../store/state.js';
import { formatCurrency, formatDateTime } from '../utils/format.js';
import { sanitize } from '../utils/sanitize.js';
import { getTotalPaid } from '../data/transactionIndex.js';
import { hasPermissionToEdit, findStudentByNim, getRoleName, handleNavigation } from './navigation.js';
import { animateNumber } from '../utils/animate.js';

// Cache for previous values to animate from
const prevDashboardValues = { finalC: 0, finalD: 0, total: 0 };

// ─── Dashboard Summary ────────────────────────────────────────────────────────

export function renderDashboardSummary() {
    try {
        let incomeC = state.carryOver.teori_c || 0;
        let incomeD = state.carryOver.teori_d || 0;
        const carryOverAngkatan = state.carryOver.angkatan || 0;

        // Build a set of inactive NIMs for fast lookup
        const inactiveNims = new Set(state.inactiveStudents.map(s => s.nim));

        state.kasTransactions.forEach(p => {
            // Only count transactions from currently active students
            if (inactiveNims.has(p.nim)) return;
            const student = findStudentByNim(p.nim);
            if (student) {
                if (student.theoryClass === 'C') incomeC += p.amount;
                else if (student.theoryClass === 'D') incomeD += p.amount;
            }
        });

        const expenseC = state.kasExpenses.filter(e => e.category === 'teori_c').reduce((sum, e) => sum + e.amount, 0);
        const expenseD = state.kasExpenses.filter(e => e.category === 'teori_d').reduce((sum, e) => sum + e.amount, 0);
        const expenseAngkatan = state.kasExpenses.filter(e => e.category === 'angkatan').reduce((sum, e) => sum + e.amount, 0);

        const finalC = incomeC - expenseC - (expenseAngkatan / 2);
        const finalD = incomeD - expenseD - (expenseAngkatan / 2);
        const total = finalC + finalD + carryOverAngkatan;

        const labelC = document.getElementById('total-kas-c');
        const labelD = document.getElementById('total-kas-d');
        const labelAngkatan = document.getElementById('total-kas-angkatan');

        // Animate values from previous state
        if (labelC) animateNumber(labelC, prevDashboardValues.finalC, finalC);
        if (labelD) animateNumber(labelD, prevDashboardValues.finalD, finalD);
        if (labelAngkatan) animateNumber(labelAngkatan, prevDashboardValues.total, total);

        // Update cache
        prevDashboardValues.finalC = finalC;
        prevDashboardValues.finalD = finalD;
        prevDashboardValues.total = total;
    } catch (e) {
        console.error('renderDashboardSummary error:', e);
    }
}

// ─── Announcement ─────────────────────────────────────────────────────────────

export function renderAnnouncement() {
    try {
        const banner = document.getElementById('announcement-banner');
        if (state.announcement && state.announcement.message) {
            // FIX: sanitize message and authorName to prevent XSS
            banner.innerHTML = `
                <div class="glass-card p-4 rounded-md flex items-start gap-4 border border-border-accent">
                    <div class="flex-shrink-0 w-8 h-8 rounded-full bg-accent-subtle flex items-center justify-center">
                        <svg class="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20"><path d="M9.998.75a.75.75 0 01.75.75v5.021a3.021 3.021 0 11-4.042 0V1.5a.75.75 0 01.75-.75zM8.5 4.5a.75.75 0 00-1.5 0v3.406c0 .175.006.348.019.52a4.521 4.521 0 108.962 0c.013-.172.019-.345.019-.52V4.5a.75.75 0 00-1.5 0v2.521a3.021 3.021 0 11-6 0V4.5zM12.75 18a.75.75 0 000-1.5h-5.5a.75.75 0 000 1.5h5.5z" /></svg>
                    </div>
                    <div>
                        <p class="font-bold text-accent">Pengumuman</p>
                        <p class="text-sm text-fg-secondary">${sanitize(state.announcement.message)}</p>
                        <p class="text-xs text-fg-tertiary mt-1">Diposting oleh ${sanitize(state.announcement.authorName)} pada ${formatDateTime(state.announcement.createdAt)}</p>
                    </div>
                    <button id="dismiss-announcement-btn" class="ml-auto text-fg-tertiary hover:text-fg-secondary">&times;</button>
                </div>`;
            banner.classList.remove('hidden');
            document.getElementById('dismiss-announcement-btn').addEventListener('click', () => banner.classList.add('hidden'));
        } else {
            banner.classList.add('hidden');
        }
    } catch (e) {
        console.error('renderAnnouncement error:', e);
    }
}

// ─── My Payment Status ────────────────────────────────────────────────────────

export function renderMyPaymentStatus(userData) {
    try {
        const container = document.getElementById('my-payment-status-container');
        const WEEKS_PER_PAGE = 3;
        const maxWeek = getMaxWeek();
        const totalPages = maxWeek > 0 ? Math.ceil(maxWeek / WEEKS_PER_PAGE) : 1;

        if (state.paymentStatusPage >= totalPages) {
            state.paymentStatusPage = Math.max(0, totalPages - 1);
        }

        let content = `<h3 class="text-xl font-bold mb-4 text-fg-primary">Status Kas Saya</h3>`;

        const startWeek = state.paymentStatusPage * WEEKS_PER_PAGE + 1;
        const endWeek = Math.min(startWeek + WEEKS_PER_PAGE - 1, maxWeek);

        let weekBlocksHTML = '';
        if (maxWeek > 0) {
            for (let i = startWeek; i <= endWeek; i++) {
                const totalPaid = getTotalPaid(userData.nim, i);
                const target = getWeeklyTarget(i);
                const isPaid = totalPaid >= target;
                weekBlocksHTML += `<div class="p-2 sm:p-3 rounded-[10px] text-center min-w-[3.5rem] w-full flex-1 ${isPaid ? 'bg-accent-subtle' : 'bg-elevated'}">
                    <p class="text-[10px] sm:text-xs text-fg-secondary uppercase tracking-wider mb-1">M ${i}</p>
                    <p class="font-bold text-sm sm:text-base ${isPaid ? 'text-accent' : 'text-fg-tertiary'}">${isPaid ? 'Lunas' : 'Belum'}</p>
                </div>`;
            }
        } else {
            weekBlocksHTML = '<p class="text-fg-tertiary text-center w-full">Belum ada data minggu.</p>';
        }

        content += `<div class="flex items-center gap-1 sm:gap-2">
            <button id="prev-week-page" class="pagination-btn p-1.5 sm:p-2 rounded-full bg-elevated hover:bg-input transition-colors shrink-0"><svg class="w-4 h-4 sm:w-5 sm:h-5 text-fg-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg></button>
            <div class="flex-1 overflow-hidden">
                <div class="flex flex-row justify-center gap-1.5 sm:gap-3 w-full">${weekBlocksHTML}</div>
            </div>
            <button id="next-week-page" class="pagination-btn p-1.5 sm:p-2 rounded-full bg-elevated hover:bg-input transition-colors shrink-0"><svg class="w-4 h-4 sm:w-5 sm:h-5 text-fg-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></button>
        </div>`;

        if (container) container.innerHTML = content;

        const prevBtn = document.getElementById('prev-week-page');
        const nextBtn = document.getElementById('next-week-page');
        if (prevBtn && nextBtn) {
            prevBtn.disabled = state.paymentStatusPage === 0;
            nextBtn.disabled = state.paymentStatusPage >= totalPages - 1;
            prevBtn.addEventListener('click', () => {
                if (state.paymentStatusPage > 0) { state.paymentStatusPage--; renderMyPaymentStatus(userData); }
            });
            nextBtn.addEventListener('click', () => {
                if (state.paymentStatusPage < totalPages - 1) { state.paymentStatusPage++; renderMyPaymentStatus(userData); }
            });
        }
    } catch (e) {
        console.error('renderMyPaymentStatus error:', e);
    }
}

// ─── Kas Angkatan Table ───────────────────────────────────────────────────────

export function renderKasAngkatan(userData) {
    try {
        const tableBody = document.getElementById('kas-angkatan-table');
        if (!tableBody) return;

        const week = document.getElementById('kas-filter-week').value;
        const classFilter = document.getElementById('kas-filter-class').value;
        const statusFilter = document.getElementById('kas-filter-status').value;
        const nameFilter = (document.getElementById('kas-filter-name')?.value || '').toLowerCase().trim();

        let studentsToDisplay = state.allStudents;

        if (classFilter !== 'all') {
            studentsToDisplay = studentsToDisplay.filter(s =>
                classFilter.length === 1 ? s.theoryClass === classFilter : s.practiceClass === classFilter
            );
        }
        if (nameFilter) {
            studentsToDisplay = studentsToDisplay.filter(s =>
                s.name.toLowerCase().includes(nameFilter) || s.nim.includes(nameFilter)
            );
        }

        const weekInt = parseInt(week);
        const target = getWeeklyTarget(weekInt);

        const weeklyData = studentsToDisplay.map(student => {
            const totalPaid = getTotalPaid(student.nim, weekInt);
            return { ...student, totalPaid, status: totalPaid >= target ? 'Lunas' : 'Belum Lunas' };
        });

        const filteredData = weeklyData.filter(d => statusFilter === 'all' || d.status === statusFilter);

        tableBody.innerHTML = filteredData.length === 0
            ? `<tr><td colspan="5" class="text-center p-6 text-fg-tertiary">Tidak ada data untuk filter ini.</td></tr>`
            : filteredData.map(data => {
                const canEdit = hasPermissionToEdit(data, userData);
                const progress = Math.min((data.totalPaid / target) * 100, 100);
                const isLunas = data.totalPaid >= target;
                const warning = state.warnings && state.warnings[data.nim] && state.warnings[data.nim].active ? state.warnings[data.nim] : null;

                let actionButton = `<span class="text-fg-muted text-sm">-</span>`;
                if (canEdit) {
                    if (isLunas) {
                        actionButton = `<button data-nim="${data.nim}" class="open-history-modal-btn btn-secondary py-2 px-4 rounded-md text-sm font-semibold">Edit</button>`;
                    } else {
                        actionButton = `
                        <div class="flex gap-2 justify-center">
                            <button data-nim="${data.nim}" class="quick-pay-btn btn-primary py-2 px-3 rounded-md text-xs font-bold flex items-center gap-1" title="Bayar Instan Rp ${target}">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                ${target / 1000}k
                            </button>
                            <button data-nim="${data.nim}" data-name="${sanitize(data.name)}" class="open-kas-modal-btn btn-secondary py-2 px-3 rounded-md text-xs font-semibold">Input</button>
                        </div>`;
                    }
                }

                let nameHTML = `<a href="#" class="hover:text-accent open-history-modal-btn transition-colors" data-nim="${data.nim}">${sanitize(data.name)}</a>`;

                if (warning) {
                    nameHTML = `
                        <div class="flex items-center gap-2">
                            <a href="#" class="text-danger hover:text-danger/80 open-history-modal-btn transition-colors drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" data-nim="${data.nim}">${sanitize(data.name)}</a>
                            <div class="group relative flex items-center">
                                <span ${canEdit ? `data-nim="${data.nim}" title="Klik untuk cabut peringatan"` : ''} class="${canEdit ? 'remove-warning-btn cursor-pointer hover:bg-accent hover:text-fg-primary transition-colors' : 'cursor-help'} flex h-5 w-5 items-center justify-center rounded-full bg-danger-subtle text-danger border border-danger/50 animate-pulse">
                                    <svg class="w-3 h-3 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                                </span>
                                <div class="absolute left-8 w-64 p-3 bg-elevated text-red-200 text-xs rounded-md shadow-2xl border border-danger/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[9999] pointer-events-none break-words whitespace-normal">
                                    <p class="font-bold text-danger/80 mb-1 text-sm border-b border-danger/50 pb-1">⚠ Catatan Khusus Peringatan</p>
                                    <p class="mt-1 leading-relaxed">${sanitize(warning.message)}</p>
                                </div>
                            </div>
                        </div>
                    `;
                }

                return `
                    <tr class="border-b ${warning ? 'border-danger/50 bg-elevated' : 'border-border-default'} hover:bg-input text-sm transition-colors relative">
                        <td class="p-2 md:p-4 hidden md:table-cell text-fg-secondary">${sanitize(data.nim)}</td>
                        <td class="p-2 md:p-4 font-semibold text-fg-primary">${nameHTML}</td>
                        <td class="p-2 md:p-4"><span class="px-2 py-1 text-xs font-semibold rounded-full bg-elevated text-fg-secondary">${sanitize(data.practiceClass)}</span></td>

                        <td class="p-2 md:p-4"><span class="badge ${isLunas ? 'badge-success' : 'badge-danger'}">${data.status}</span></td>
                        <td class="p-2 md:p-4 text-center">${actionButton}</td>
                    </tr>`;
            }).join('');

    } catch (e) {
        console.error('renderKasAngkatan error:', e);
    }
}

// ─── Log Aktivitas ────────────────────────────────────────────────────────────

export function renderActivityLogView() {
    const container = document.getElementById('activity-log-container');
    if (!container) return;

    if (!state.activityLogs || state.activityLogs.length === 0) {
        container.innerHTML = `
            <div class="glass-card p-12 rounded-xl text-center flex flex-col items-center justify-center">
                <div class="w-16 h-16 bg-elevated rounded-full flex items-center justify-center mb-4 border border-border-default">
                    <svg class="w-8 h-8 text-fg-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                </div>
                <p class="text-fg-secondary font-medium text-lg">Belum ada aktivitas dicatat</p>
                <p class="text-fg-tertiary text-sm mt-1">Aktivitas bendahara akan muncul di sini</p>
            </div>
        `;
        return;
    }

    const getActionBadge = (type) => {
        switch (type) {
            case 'CREATE': return '<span class="px-1.5 py-0.5 text-[9px] uppercase font-bold rounded bg-success/10 text-success">INPUT</span>';
            case 'UPDATE': return '<span class="px-1.5 py-0.5 text-[9px] uppercase font-bold rounded bg-warning/10 text-warning">EDIT</span>';
            case 'DELETE': return '<span class="px-1.5 py-0.5 text-[9px] uppercase font-bold rounded bg-danger/10 text-danger">HAPUS</span>';
            default: return `<span class="px-1.5 py-0.5 text-[9px] uppercase font-bold rounded bg-accent/10 text-accent">${type}</span>`;
        }
    };

    const logsHTML = state.activityLogs.map(log => {
        let dateStr = 'Tengah diproses...';
        if (log.timestamp && log.timestamp.toDate) {
            const d = log.timestamp.toDate();
            // DD MMM YYYY, HH:mm
            dateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        }

        return `
            <div class="glass-card py-2 px-3 rounded-lg flex items-center justify-between mb-1.5 gap-2 hover:bg-elevated transition-colors border-l-[3px]" style="border-left-color: var(--color-accent);">
                <div class="flex-1 min-w-0 pr-1">
                    <div class="flex items-center gap-1.5 mb-0.5">
                        <h4 class="font-bold text-fg-primary text-[11px] truncate" style="max-width: 60%;">${sanitize(log.name)}</h4>
                        ${getActionBadge(log.actionType)}
                    </div>
                    <p class="text-fg-secondary text-[10px] leading-tight line-clamp-2">${sanitize(log.description)}</p>
                </div>
                <div class="flex flex-col items-end shrink-0 whitespace-nowrap justify-center">
                    ${log.amount ? `<span class="text-[11px] font-bold text-fg-primary mb-0.5">Rp ${log.amount.toLocaleString('id-ID')}</span>` : ''}
                    <span class="text-[9px] font-medium text-fg-tertiary">${dateStr}</span>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = `<div class="flex flex-col gap-1">${logsHTML}</div>`;
}

// ─── Expenses Table ───────────────────────────────────────────────────────────

export function renderExpenses(userData) {
    try {
        const tableBody = document.getElementById('expenses-table-body');
        if (!tableBody) return;

        const sortedExpenses = [...state.kasExpenses].sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);
        const isFullTreasurer = userData.role === 'bendahara_angkatan' || userData.role === 'bendahara_teori';

        if (sortedExpenses.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" class="text-center p-6 text-fg-tertiary">Belum ada pengeluaran.</td></tr>`;
            return;
        }

        const categoryMap = { teori_c: 'Kas Teori C', teori_d: 'Kas Teori D', angkatan: 'Kas Angkatan (Dibagi Rata)' };
        // FIX: sanitize description and recordedByName to prevent XSS
        tableBody.innerHTML = sortedExpenses.map(exp => `
            <tr class="border-b border-border-default">
                <td class="p-4">${formatDateTime(exp.timestamp)}</td>
                <td class="p-4 text-fg-primary">${sanitize(exp.description)}</td>
                <td class="p-4"><span class="px-3 py-1 text-xs font-semibold rounded-full bg-elevated text-fg-secondary">${categoryMap[exp.category] || 'Lainnya'}</span></td>
                <td class="p-4 text-accent font-semibold">${formatCurrency(exp.amount)}</td>
                <td class="p-4 text-fg-secondary">${sanitize(exp.recordedByName)}</td>
                <td class="p-4 text-center">${isFullTreasurer ? `<button data-id="${exp.id}" class="delete-expense-btn text-danger hover:text-danger/80 text-xs font-semibold">&times; Hapus</button>` : ''}</td>
            </tr>`
        ).join('');
    } catch (e) {
        console.error('renderExpenses error:', e);
    }
}

// ─── Archive View ─────────────────────────────────────────────────────────────

export function renderArchiveView(userData, onDownload) {
    try {
        const view = document.getElementById('view-arsip');
        const maxWeek = getMaxWeek();
        const semesterLabel = state.semester.label || 'Belum diatur';
        const startDateStr = state.semester.startDate
            ? new Date(state.semester.startDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
            : 'Belum diatur';

        view.innerHTML = `
            <h2 class="text-3xl font-bold text-fg-primary mb-2">Arsip Laporan Semester</h2>
            ${state.semester.label
                ? `<p class="text-sm text-accent mb-6">Semester aktif: <strong>${sanitize(state.semester.label)}</strong> — Minggu ${maxWeek} berjalan ${formatWeekRange(maxWeek) ? '&bull; ' + formatWeekRange(maxWeek) : ''}</p>`
                : '<p class="text-sm text-fg-tertiary mb-6">Semester belum diatur. Silakan atur di halaman Admin.</p>'}
            <div class="glass-card p-6 rounded-[14px]">
                <p class="text-fg-secondary mb-6">Unduh laporan semester lengkap dalam format Excel. Laporan mencakup seluruh pemasukan, pengeluaran, dan rekap tunggakan dari minggu 1 sampai minggu ke-${maxWeek}.</p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <div class="glass-card p-4 rounded-md bg-input">
                        <p class="text-sm text-fg-secondary">Semester: <strong class="text-fg-primary">${sanitize(semesterLabel)}</strong></p>
                        <p class="text-sm text-fg-secondary mt-1">Dimulai: <strong class="text-fg-primary">${startDateStr}</strong></p>
                        <p class="text-sm text-fg-secondary mt-1">Minggu aktif: <strong class="text-fg-primary">1 – ${maxWeek}</strong></p>
                        <p class="text-sm text-fg-secondary mt-1">Nominal: <strong class="text-fg-primary">Rp ${(state.semester.weeklyAmount || 2000).toLocaleString('id-ID')}/minggu</strong></p>
                    </div>
                    <button id="download-semester-report-btn" class="w-full btn-primary font-bold py-4 rounded-md text-base">Unduh Laporan Semester</button>
                </div>
                <p class="text-xs text-fg-muted mt-3">* File Excel berisi 3 sheet: Pemasukan, Pengeluaran, dan Rekap Tunggakan.</p>
            </div>
            <div id="archived-events-container"></div>`;

        document.getElementById('download-semester-report-btn').addEventListener('click', onDownload);
        renderArchivedEvents();
    } catch (e) {
        console.error('renderArchiveView error:', e);
    }
}

// ─── Admin View ───────────────────────────────────────────────────────────────

export function renderAdminView(userData, { onAddStudent, onManageRoles, onAnnouncement, onSendBilling, onAddWarning, onRemoveWarning }) {
    try {
        if (!userData || userData.role !== 'bendahara_angkatan') {
            const adminView = document.getElementById('view-admin');
            if (adminView) adminView.innerHTML = '';
            return;
        }

        const view = document.getElementById('view-admin');

        // FIX: sanitize student name, nim, email to prevent XSS
        const studentsTable = state.allStudents.map(s => `
            <tr class="border-b border-border-default">
                <td class="p-3">${sanitize(s.nim)}</td>
                <td class="p-3 text-fg-primary">${sanitize(s.name)}</td>
                <td class="p-3">${sanitize(s.practiceClass)}</td>
                <td class="p-3">${sanitize(s.email || '-')}</td>
                <td class="p-3 text-center"><button data-nim="${sanitize(s.nim)}" class="delete-student-btn text-warning hover:text-warning text-sm font-semibold">⏸ Nonaktifkan</button></td>
            </tr>`
        ).join('');

        // Inactive students table
        const inactiveTable = state.inactiveStudents.length > 0
            ? state.inactiveStudents.map(s => `
                <tr class="border-b border-border-default bg-input">
                    <td class="p-3 text-fg-tertiary">${sanitize(s.nim)}</td>
                    <td class="p-3 text-fg-tertiary">${sanitize(s.name)}</td>
                    <td class="p-3 text-fg-tertiary">${sanitize(s.practiceClass)}</td>
                    <td class="p-3 text-fg-tertiary">${sanitize(s.email || '-')}</td>
                    <td class="p-3 text-center"><button data-nim="${sanitize(s.nim)}" class="reactivate-student-btn text-success hover:text-success/80 text-sm font-semibold">▶ Aktifkan</button></td>
                </tr>`
            ).join('')
            : '<tr><td colspan="5" class="text-center p-4 text-fg-muted">Tidak ada mahasiswa nonaktif.</td></tr>';

        const rolesMap = { bendahara_angkatan: 'Ketua Kelas', bendahara_teori: 'Bendahara Teori', bendahara_praktik: 'Bendahara Praktik' };
        let rolesContent = '';
        for (const nim in state.roles) {
            const student = findStudentByNim(nim);
            if (student) {
                const roleLabel = state.roles[nim].includes('teori')
                    ? `(${student.theoryClass})` : state.roles[nim].includes('praktik')
                        ? `(${student.practiceClass})` : '';
                rolesContent += `<div class="flex justify-between items-center p-3 border-b border-border-default">
                    <span><strong>${rolesMap[state.roles[nim]]} ${roleLabel}</strong>: ${sanitize(student.name)}</span>
                    <button data-nim="${sanitize(nim)}" class="remove-role-btn text-xs text-accent hover:text-accent font-semibold">&times; Hapus</button>
                </div>`;
            }
        }

        let warningsContent = '';
        for (const nim in state.warnings) {
            const warning = state.warnings[nim];
            const student = findStudentByNim(nim);
            if (student && warning.active) {
                warningsContent += `<div class="flex justify-between items-center p-3 border-b border-danger/50">
                    <div class="flex-1">
                        <p class="font-bold text-danger">${sanitize(student.name)} <span class="text-fg-tertiary text-xs font-normal">(${student.practiceClass})</span></p>
                        <p class="text-xs text-danger/80 mt-1 flex items-start gap-1">
                            <svg class="w-3 h-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                            ${sanitize(warning.message)}
                        </p>
                    </div>
                    <button data-nim="${sanitize(nim)}" class="remove-warning-btn ml-4 text-xs text-fg-secondary hover:text-fg-primary font-semibold flex-shrink-0 whitespace-nowrap">&times; Cabut</button>
                </div>`;
            }
        }

        const practiceClassesOptions = [...new Set(state.allStudents.map(s => s.practiceClass).filter(Boolean))]
            .sort()
            .map(c => `<option value="${c}">Praktik ${c}</option>`)
            .join('');

        const maxWeek = getMaxWeek();
        const calWeek = getCurrentCalendarWeek();
        const weekOptions = Array.from({ length: maxWeek }, (_, i) => i + 1);

        view.innerHTML = `
            <div class="mb-8">
                <h2 class="text-2xl font-bold text-fg-primary mb-1">Manajemen Semester</h2>
                <p class="text-fg-tertiary text-sm mb-4">Setup semester baru: atur tanggal minggu pertama, label, nominal kas, dan saldo pindahan. Minggu berjalan otomatis dari tanggal yang diatur.</p>
                <div class="glass-card p-6 rounded-[14px] border border-border-accent">
                    ${state.semester.startDate ? `
                    <div class="mb-6 p-4 rounded-md bg-accent-subtle border border-border-accent">
                        <div class="flex items-center justify-between flex-wrap gap-3">
                            <div>
                                <p class="text-lg font-bold text-fg-primary">${sanitize(state.semester.label || 'Tanpa Label')}</p>
                                <p class="text-sm text-fg-secondary mt-1">Dimulai: ${new Date(state.semester.startDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                            <div class="text-right">
                                <p class="text-3xl font-bold text-accent">Minggu ${calWeek}</p>
                                <p class="text-xs text-fg-tertiary">${formatWeekRange(calWeek) || ''} — Rp ${(state.semester.weeklyAmount || 2000).toLocaleString('id-ID')}/minggu</p>
                            </div>
                        </div>
                    </div>` : `
                    <div class="mb-6 p-4 rounded-md bg-accent border border-warning/50">
                        <p class="text-warning font-semibold">⚠ Semester belum dikonfigurasi. Silakan isi form di bawah untuk memulai.</p>
                    </div>`}
                    <form id="semester-setup-form">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label class="block text-sm font-medium text-fg-secondary mb-1">Label Semester *</label>
                                <input type="text" name="semester_label" value="${sanitize(state.semester.label || '')}" placeholder="Contoh: Genap 2025/2026" class="w-full py-3 px-4 bg-input border border-border-default rounded-md text-fg-primary" required>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-fg-secondary mb-1">Tanggal Mulai Minggu 1 *</label>
                                <input type="date" name="start_date" value="${state.semester.startDate || ''}" class="w-full py-3 px-4 bg-input border border-border-default rounded-md text-fg-primary" required>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-fg-secondary mb-1">Nominal Kas/Minggu (Rp)</label>
                                <input type="number" name="weekly_amount" value="${state.semester.weeklyAmount || 2000}" min="0" class="w-full py-3 px-4 bg-input border border-border-default rounded-md text-fg-primary">
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label class="block text-sm font-medium text-fg-secondary mb-1">Saldo Pindahan Teori C (Rp)</label>
                                <input type="number" name="teori_c" value="${state.carryOver.teori_c || 0}" class="w-full py-3 px-4 bg-input border border-border-default rounded-md text-fg-primary">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-fg-secondary mb-1">Saldo Pindahan Teori D (Rp)</label>
                                <input type="number" name="teori_d" value="${state.carryOver.teori_d || 0}" class="w-full py-3 px-4 bg-input border border-border-default rounded-md text-fg-primary">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-fg-secondary mb-1">Saldo Pindahan Angkatan (Rp)</label>
                                <input type="number" name="angkatan" value="${state.carryOver.angkatan || 0}" class="w-full py-3 px-4 bg-input border border-border-default rounded-md text-fg-primary">
                            </div>
                        </div>
                        <button type="submit" class="w-full btn-primary font-bold py-3 rounded-md text-base">Mulai Semester Baru</button>
                        <p class="text-xs text-warning mt-2 text-center">⚠ Minggu pembayaran akan dihitung otomatis dari tanggal mulai. Transaksi lama tetap tersimpan.</p>
                    </form>
                </div>
            </div>
            <div id="admin-events-widget" class="mb-8"></div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <div class="flex justify-between items-center mb-4"><h2 class="text-2xl font-bold text-fg-primary">Manajemen Anggota</h2><button id="add-student-btn" class="btn-primary px-4 py-2 rounded-md font-semibold text-sm">Tambah Anggota</button></div>
                    <div class="glass-card p-4 rounded-[14px]"><div class="overflow-y-auto max-h-96"><table class="w-full text-sm"><thead><tr class="border-b border-border-default"><th class="p-3 text-left">NIM</th><th class="p-3 text-left">Nama</th><th class="p-3 text-left">Kelas</th><th class="p-3 text-left">Email Terdaftar</th><th class="p-3 text-center">Aksi</th></tr></thead><tbody>${studentsTable}</tbody></table></div></div>
                    
                    ${state.inactiveStudents.length > 0 ? `
                    <div class="mt-6">
                        <h3 class="text-xl font-bold text-fg-tertiary mb-3 flex items-center gap-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
                            Mahasiswa Nonaktif (${state.inactiveStudents.length})
                        </h3>
                        <div class="glass-card p-4 rounded-lg border border-border-default bg-input"><div class="overflow-y-auto max-h-48"><table class="w-full text-sm"><thead><tr class="border-b border-border-default"><th class="p-3 text-left text-fg-tertiary">NIM</th><th class="p-3 text-left text-fg-tertiary">Nama</th><th class="p-3 text-left text-fg-tertiary">Kelas</th><th class="p-3 text-left text-fg-tertiary">Email</th><th class="p-3 text-center text-fg-tertiary">Aksi</th></tr></thead><tbody>${inactiveTable}</tbody></table></div></div>
                    </div>` : ''}
                </div>
                <div>
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-2xl font-bold text-fg-primary">Manajemen Bendahara</h2>
                        <button id="manage-roles-btn" class="btn-primary px-4 py-2 rounded-md font-semibold text-sm">Tunjuk Bendahara</button>
                    </div>
                    <div class="glass-card p-4 rounded-lg mb-8">${rolesContent || '<p class="p-3 text-fg-tertiary">Belum ada bendahara yang ditunjuk.</p>'}</div>
                    
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-2xl font-bold text-danger flex items-center gap-2">
                            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                            Peringatan Keras
                        </h2>
                        <button id="add-warning-btn" class="btn-primary border-danger/50 text-danger hover:bg-accent hover:text-fg-primary px-4 py-2 rounded-md font-semibold text-sm transition-all">Beri Peringatan</button>
                    </div>
                    <div class="glass-card p-4 rounded-lg border border-danger/50 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-elevated">
                        ${warningsContent || '<p class="p-3 text-fg-tertiary">Belum ada peringatan keras yang diberikan.</p>'}
                    </div>
                </div>
            </div>
            <div class="mt-8">
                <h2 class="text-2xl font-bold text-fg-primary mb-4">Manajemen Pengumuman</h2>
                <div class="glass-card p-6 rounded-lg">
                    <form id="announcement-form">
                        <label for="announcement-text" class="block text-sm font-medium text-fg-secondary mb-1">Tulis Pengumuman Baru</label>
                        <textarea id="announcement-text" rows="3" class="w-full p-3 bg-input border border-border-default rounded-md" placeholder="Contoh: Batas akhir pembayaran untuk acara X adalah tanggal Y...">${state.announcement ? sanitize(state.announcement.message) : ''}</textarea>
                        <div class="flex justify-end mt-4"><button type="submit" class="px-6 py-2 btn-primary rounded-md font-bold">Publikasikan</button></div>
                    </form>
                </div>
            </div>
            <div class="mt-8">
                <h2 class="text-2xl font-bold text-fg-primary mb-1">Kirim Tagihan Kumulatif</h2>
                <p class="text-fg-tertiary text-sm mb-4">Kirim satu email per anggota yang berisi total tunggakan. Setiap mahasiswa mendapat email dengan nominal yang berbeda sesuai tunggakan masing-masing.</p>
                <div class="glass-card p-6 rounded-lg">
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-4">
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-fg-secondary mb-1">Pilih Kelas Praktik</label>
                            <select id="billing-class-select" class="w-full px-4 py-2.5 bg-input border border-border-default rounded-md text-fg-primary text-sm">
                                <option value="all">Semua Kelas</option>
                                ${practiceClassesOptions}
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-fg-secondary mb-1">Dari Minggu</label>
                            <select id="billing-start-week" class="w-full px-4 py-2.5 bg-input border border-border-default rounded-md text-fg-primary text-sm">
                                ${weekOptions.map(w => `<option value="${w}">Minggu ${w} ${formatWeekRange(w) ? '&bull; ' + formatWeekRange(w) : ''}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-fg-secondary mb-1">Sampai Minggu</label>
                            <select id="billing-end-week" class="w-full px-4 py-2.5 bg-input border border-border-default rounded-md text-fg-primary text-sm">
                                ${weekOptions.map(w => `<option value="${w}"${w === maxWeek ? ' selected' : ''}>Minggu ${w} ${formatWeekRange(w) ? '&bull; ' + formatWeekRange(w) : ''}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="flex flex-wrap gap-4 items-center">
                        <button id="send-billing-btn" class="btn-primary px-5 py-2.5 rounded-md font-semibold flex items-center gap-2 text-sm w-full md:w-auto justify-center">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                            Kirim Tagihan Kumulatif
                        </button>
                    </div>
                    <p class="text-xs text-fg-muted mt-3">* Hanya anggota yang sesuai filter, memiliki email terdaftar, dan memiliki tunggakan yang akan menerima email.</p>
                    <div id="billing-progress" class="hidden mt-4 p-3 rounded-md bg-accent-subtle border border-border-accent text-sm text-accent"></div>
                </div>
            </div>
            <div class="mt-8">
                <h2 class="text-2xl font-bold text-fg-primary mb-1">Kelola QRIS & WhatsApp Bendahara</h2>
                <p class="text-fg-tertiary text-sm mb-4">Upload gambar QRIS dan isi nomor WhatsApp untuk masing-masing bendahara. Data ini digunakan pada fitur "Bayar via QRIS".</p>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${['C1', 'C2', 'D1', 'D2', 'C', 'D'].map(key => {
            const entry = state.qrisConfig[key] || {};
            const isPraktik = key.length === 2;
            const defaultLabel = isPraktik ? `Bendahara Praktik ${key}` : `Bendahara Teori ${key}`;
            return `
                        <div class="qris-admin-card glass-card p-5 rounded-[14px]">
                            <div class="flex items-center gap-2 mb-4">
                                <span class="badge ${isPraktik ? 'badge-success' : 'badge-neutral'}">${key}</span>
                                <span class="text-sm font-semibold text-fg-primary">${defaultLabel}</span>
                            </div>
                            ${entry.qrisBase64
                                ? `<div class="mb-3 text-center"><div class="inline-block p-2 rounded-[12px] bg-white border border-border-default shadow-md"><img src="${entry.qrisBase64}" alt="QRIS ${key}" class="w-36 h-36 object-contain" /></div></div>`
                                : `<div class="mb-3 p-6 text-center rounded-[12px] text-xs text-fg-muted bg-elevated/50 border border-dashed border-border-default">Belum ada QRIS</div>`
                            }
                            <div class="space-y-3">
                                <div>
                                    <label class="block text-xs font-semibold text-fg-tertiary uppercase tracking-wider mb-1">Gambar QRIS</label>
                                    <input type="file" accept="image/*" class="qris-file-input w-full text-xs text-fg-secondary file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-accent-subtle file:text-accent hover:file:bg-accent hover:file:text-white file:transition-colors file:cursor-pointer">
                                </div>
                                <div>
                                    <label class="block text-xs font-semibold text-fg-tertiary uppercase tracking-wider mb-1">Label</label>
                                    <input type="text" value="${sanitize(entry.label || defaultLabel)}" placeholder="${defaultLabel}" class="qris-label-input w-full py-2 px-3 rounded-[10px] text-sm text-fg-primary" style="background: var(--color-bg-input); border: 1px solid var(--color-border-default);">
                                </div>
                                <div>
                                    <label class="block text-xs font-semibold text-fg-tertiary uppercase tracking-wider mb-1">Nomor WhatsApp</label>
                                    <input type="text" value="${sanitize(entry.waNumber || '')}" placeholder="628xxxxxxxxxx" class="qris-wa-input w-full py-2 px-3 rounded-[10px] text-sm text-fg-primary" style="background: var(--color-bg-input); border: 1px solid var(--color-border-default);">
                                </div>
                                <button data-class-key="${key}" class="save-qris-btn w-full btn-primary py-2 rounded-[10px] font-semibold text-sm">Simpan</button>
                            </div>
                        </div>`;
        }).join('')}
                </div>
            </div>`;

        document.getElementById('add-student-btn').addEventListener('click', onAddStudent);
        document.getElementById('manage-roles-btn').addEventListener('click', onManageRoles);
        document.getElementById('announcement-form').addEventListener('submit', onAnnouncement);
        document.getElementById('send-billing-btn').addEventListener('click', () => {
            const targetClass = document.getElementById('billing-class-select').value;
            const startWeek = parseInt(document.getElementById('billing-start-week').value);
            const endWeek = parseInt(document.getElementById('billing-end-week').value);
            onSendBilling?.(targetClass, startWeek, endWeek);
        });

        // Peringatan handlers
        document.getElementById('add-warning-btn')?.addEventListener('click', onAddWarning);
        document.querySelectorAll('.remove-warning-btn').forEach(btn => {
            btn.addEventListener('click', onRemoveWarning);
        });

        // Reactivate student handlers
        document.querySelectorAll('.reactivate-student-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                import('../handlers/admin.js').then(m => m.handleReactivateStudent(e));
            });
        });

        // Semester setup handler (start new semester)
        document.getElementById('semester-setup-form')?.addEventListener('submit', (e) => {
            e.preventDefault(); // MUST be synchronous — before async import!
            import('../handlers/admin.js').then(m => m.handleStartNewSemester(e));
        });
    } catch (e) {
        console.error('renderAdminView error:', e);
    }
}

// ─── Rekap Pemasukan ──────────────────────────────────────────────────────────

export function renderRekapitulasiPemasukan() {
    const container = document.getElementById('rekap-pemasukan-container');
    if (!container) return;

    const currentWeek = parseInt(document.getElementById('kas-filter-week')?.value) || state.currentWeek;
    const target = getWeeklyTarget(currentWeek);

    const classesToRekap = ['C', 'C1', 'C2', 'D', 'D1', 'D2'];
    let rekapHTML = `<h3 class="text-xl font-bold mb-4 text-fg-primary">Rekap Pemasukan Kas (Minggu ${currentWeek})</h3><div class="space-y-4 text-fg-secondary">`;

    classesToRekap.forEach(className => {
        const isTeori = className.length === 1;
        const studentsInClass = state.allStudents.filter(s =>
            isTeori ? s.theoryClass === className : s.practiceClass === className
        );

        let paidCount = 0;
        // FIX: Use O(1) transactionIndex instead of O(n) filter+reduce
        studentsInClass.forEach(s => {
            if (getTotalPaid(s.nim, currentWeek) >= target) paidCount++;
        });

        rekapHTML += `
            <div>
                <div class="flex justify-between font-semibold"><p>Kelas ${isTeori ? 'Teori' : 'Praktik'} ${className}</p><p>${paidCount} / ${studentsInClass.length}</p></div>
                <div class="w-full bg-elevated rounded-full h-2.5 mt-1"><div class="bg-accent h-2.5 rounded-full" style="width: ${studentsInClass.length > 0 ? (paidCount / studentsInClass.length) * 100 : 0}%"></div></div>
            </div>`;
    });

    rekapHTML += '</div>';
    container.innerHTML = rekapHTML;
}

// ─── Filter Controls ──────────────────────────────────────────────────────────

export function populateClassFilter(userData) {
    const filter = document.getElementById('kas-filter-class');
    if (!filter) return;

    // Default to the user's practice class if it's their first time loading the filter
    let currentVal = filter.value;
    const isFirstLoad = !currentVal;

    const practiceClasses = [...new Set(state.allStudents.map(s => s.practiceClass))].sort();

    filter.innerHTML = `
        <option value="all">Semua Kelas</option>
        <option value="C">Teori C</option>
        <option value="D">Teori D</option>
        ${practiceClasses.map(c => `<option value="${c}">Praktik ${c}</option>`).join('')}
    `;

    if (isFirstLoad && userData && userData.practiceClass) {
        // Auto-select the user's practice class on first load
        currentVal = userData.practiceClass;
    }

    if (Array.from(filter.options).some(opt => opt.value === currentVal)) {
        filter.value = currentVal;
    }
}

export function populateWeekFilter() {
    const filter = document.getElementById('kas-filter-week');
    if (!filter) return;
    const currentVal = filter.value;
    const maxWeek = getMaxWeek();
    if (filter.options.length === maxWeek && parseInt(currentVal) <= maxWeek) return;

    const options = Array.from({ length: maxWeek }, (_, i) => {
        const w = i + 1;
        const range = formatWeekRange(w);
        return `<option value="${w}">Minggu ${w}${range ? ' &bull; ' + range : ''}</option>`;
    }).join('');

    if (filter.innerHTML !== options) {
        filter.innerHTML = options;
    }
    if (currentVal && parseInt(currentVal) <= maxWeek) {
        filter.value = currentVal;
    } else {
        filter.value = Math.min(getCurrentCalendarWeek(), maxWeek);
    }
}

// ─── Week Management Render ───────────────────────────────────────────────────

/**
 * Renders the manual week management control widget.
 * Visible only to bendahara_angkatan. Called whenever semester config changes.
 */
export function renderWeekManagement() {
    const container = document.getElementById('week-management-actions');
    if (!container) return;

    if (!userData || userData.role !== 'bendahara_angkatan') {
        container.classList.add('hidden');
        return;
    }

    const maxWeek = getMaxWeek();
    const calendarWeek = getCurrentCalendarWeek();
    const isManualOverride = state.semester.manualMaxWeek != null && state.semester.manualMaxWeek !== calendarWeek;

    container.innerHTML = `
        <div class="flex items-center gap-2">
            <span class="text-xs text-fg-tertiary hidden sm:inline">Minggu Aktif:</span>
            <div class="flex items-center gap-1 bg-elevated border border-border-default rounded-md px-1 py-1">
                <button id="week-minus-btn" title="Kurangi minggu aktif"
                    class="w-7 h-7 flex items-center justify-center rounded-md text-fg-secondary hover:text-danger/80 hover:bg-danger-subtle transition-all text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed"
                    ${maxWeek <= 1 ? 'disabled' : ''}>&#8722;</button>
                <span class="px-2 min-w-[5.5rem] text-center">
                    <span class="text-sm font-bold ${isManualOverride ? 'text-warning' : 'text-accent'}">Minggu ${maxWeek}</span>
                    ${isManualOverride
            ? '<span class="text-xs text-warning block leading-none">manual</span>'
            : '<span class="text-xs text-fg-tertiary block leading-none">kalender</span>'}
                </span>
                <button id="week-plus-btn" title="Tambah minggu aktif"
                    class="w-7 h-7 flex items-center justify-center rounded-md text-fg-secondary hover:text-accent hover:bg-accent-subtle transition-all text-sm font-bold">&#43;</button>
            </div>
            ${isManualOverride ? `<button id="week-reset-btn" title="Kembalikan ke kalender otomatis"
                class="text-xs text-warning/70 hover:text-warning underline transition-colors">reset</button>` : ''}
        </div>
    `;
    container.classList.remove('hidden');
}

// ─── Event Fund Views ─────────────────────────────────────────────────────────

/**
 * Ensure dynamic view divs exist for all active events.
 * Called whenever state.events changes.
 */
export function renderEventViews(userData) {
    const container = document.getElementById('event-views-container');
    if (!container) return;

    const activeEvents = state.events.filter(ev => ev.status === 'active');

    // Remove stale view divs
    container.querySelectorAll('.event-view').forEach(el => {
        const eventId = el.id.replace('view-event-', '');
        if (!activeEvents.find(ev => ev.id === eventId)) {
            el.remove();
        }
    });

    // Create missing view divs & render
    activeEvents.forEach(ev => {
        let viewDiv = document.getElementById(`view-event-${ev.id}`);
        if (!viewDiv) {
            viewDiv = document.createElement('div');
            viewDiv.id = `view-event-${ev.id}`;
            viewDiv.className = 'view event-view hidden';
            container.appendChild(viewDiv);
        }
        renderEventView(ev.id, userData);
    });
}

/**
 * Render the detail page for a single event.
 */
export function renderEventView(eventId, userData) {
    const view = document.getElementById(`view-event-${eventId}`);
    if (!view) return;

    const event = state.events.find(ev => ev.id === eventId);
    if (!event) return;

    const canRecord = userData && (userData.role === 'bendahara_angkatan' || userData.role === 'bendahara_teori');
    const isAdmin = userData && userData.role === 'bendahara_angkatan';
    const payments = state.eventPayments.filter(p => p.eventId === eventId);
    const excludedNims = new Set(event.excludedNims || []);

    // Filter out excluded students for calculations
    const participatingStudents = state.allStudents.filter(s => !excludedNims.has(s.nim));
    const totalCollected = payments.filter(p => !excludedNims.has(p.nim)).reduce((sum, p) => sum + p.amount, 0);
    const totalTarget = participatingStudents.length * event.targetPerStudent;
    const overallProgress = totalTarget > 0 ? Math.min((totalCollected / totalTarget) * 100, 100) : 0;

    const deadlineStr = event.deadline
        ? new Date(event.deadline).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'Tidak ada';

    // Build student table
    const classFilter = view.querySelector('.event-class-filter')?.value || 'all';
    const statusFilter = view.querySelector('.event-status-filter')?.value || 'all';

    let studentsToDisplay = [...participatingStudents];
    if (classFilter !== 'all') {
        studentsToDisplay = studentsToDisplay.filter(s =>
            classFilter.length === 1 ? s.theoryClass === classFilter : s.practiceClass === classFilter
        );
    }

    const studentData = studentsToDisplay.map(s => {
        const paid = payments.filter(p => p.nim === s.nim).reduce((sum, p) => sum + p.amount, 0);
        const remaining = Math.max(event.targetPerStudent - paid, 0);
        const progress = Math.min((paid / event.targetPerStudent) * 100, 100);
        const isLunas = paid >= event.targetPerStudent;
        return { ...s, paid, remaining, progress, isLunas };
    });

    const filteredData = studentData.filter(d =>
        statusFilter === 'all' || (statusFilter === 'Lunas' ? d.isLunas : !d.isLunas)
    );

    const lunasCount = studentData.filter(d => d.isLunas).length;
    const belumCount = studentData.filter(d => !d.isLunas).length;

    // Practice class options for filter
    const classOptions = [...new Set(state.allStudents.map(s => s.practiceClass).filter(Boolean))].sort();

    const tableRows = filteredData.length === 0
        ? `<tr><td colspan="6" class="text-center p-6 text-fg-tertiary">Tidak ada data untuk filter ini.</td></tr>`
        : filteredData.map(d => {
            const hasPayments = d.paid > 0;
            let actionHTML;
            if (d.isLunas) {
                actionHTML = canRecord
                    ? `<button data-event-id="${eventId}" data-nim="${d.nim}" data-name="${sanitize(d.name)}" class="open-event-history-btn btn-secondary py-2 px-4 rounded-md text-sm font-semibold">Edit</button>`
                    : '<span class="px-3 py-1 text-xs font-semibold rounded-full bg-accent-subtle text-accent border border-border-accent">Lunas</span>';
            } else if (canRecord) {
                actionHTML = `<div class="flex gap-2 justify-center">
                    <button data-event-id="${eventId}" data-nim="${d.nim}" data-name="${sanitize(d.name)}" data-remaining="${d.remaining}" class="open-event-payment-btn btn-primary py-2 px-3 rounded-md text-xs font-bold flex items-center gap-1"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>Cicilan</button>
                    ${hasPayments ? `<button data-event-id="${eventId}" data-nim="${d.nim}" data-name="${sanitize(d.name)}" class="open-event-history-btn btn-secondary py-2 px-3 rounded-md text-xs font-semibold">Edit</button>` : ''}
                </div>`;
            } else {
                actionHTML = `<span class="text-xs text-warning font-semibold">Kurang Rp ${d.remaining.toLocaleString('id-ID')}</span>`;
            }
            return `
            <tr class="border-b border-border-default hover:bg-elevated transition-colors">
                <td class="p-3 hidden md:table-cell text-fg-secondary">${sanitize(d.nim)}</td>
                <td class="p-3 font-medium">
                    <a href="#" data-event-id="${eventId}" data-nim="${d.nim}" data-name="${sanitize(d.name)}"
                       class="open-event-history-btn ${d.isLunas ? 'text-accent hover:text-accent-hover' : 'text-fg-primary hover:text-accent'} transition-colors">
                        ${sanitize(d.name)}
                    </a>
                </td>
                <td class="p-3 text-fg-secondary">${d.practiceClass}</td>
                <td class="p-3">
                    <div class="flex items-center gap-2">
                        <div class="flex-1 h-2 bg-elevated rounded-full overflow-hidden">
                            <div class="h-full ${d.isLunas ? 'bg-accent' : 'bg-accent'} rounded-full transition-all" style="width: ${d.progress}%"></div>
                        </div>
                        <span class="text-xs font-semibold ${d.isLunas ? 'text-accent' : 'text-warning'} whitespace-nowrap">${Math.round(d.progress)}%</span>
                    </div>
                    <p class="text-xs text-fg-tertiary mt-1">Rp ${d.paid.toLocaleString('id-ID')} / ${event.targetPerStudent.toLocaleString('id-ID')}</p>
                </td>
                <td class="p-3 text-center">${actionHTML}</td>
            </tr>`;
        }).join('');

    view.innerHTML = `
        <!-- Event Header Card (Golden Ratio Layout) -->
        <div class="glass-card mb-6 overflow-hidden rounded-[16px]">
            <div class="flex flex-col md:flex-row">
                <!-- Main Info Pane (approx 62%) -->
                <div class="flex-1 p-5 md:p-6 flex flex-col sm:flex-row gap-5 items-start ${isAdmin ? 'md:border-r border-border-default/50' : ''}">
                    <div class="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 bg-accent-subtle/50 border border-border-accent/40 shadow-sm hidden sm:flex">
                        <svg class="w-7 h-7 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>
                    </div>
                    <div class="flex-1 w-full">
                        <h2 class="text-2xl sm:text-[26px] font-bold text-fg-primary tracking-tight leading-tight flex items-center gap-3">
                            <div class="w-9 h-9 rounded-xl flex items-center justify-center bg-accent-subtle/50 border border-border-accent/40 sm:hidden">
                                <svg class="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>
                            </div>
                            ${sanitize(event.name)}
                        </h2>
                        <div class="flex flex-wrap items-center gap-2 mt-4 text-xs font-medium text-fg-secondary">
                            <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-elevated/80 border border-border-default/50 shadow-sm">
                                <svg class="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                Rp ${event.targetPerStudent.toLocaleString('id-ID')} / orang
                            </div>
                            <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-elevated/80 border border-border-default/50 shadow-sm">
                                <svg class="w-4 h-4 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                ${deadlineStr}
                            </div>
                            <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-elevated/80 border border-border-default/50 shadow-sm">
                                <svg class="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                ${participatingStudents.length}/${state.allStudents.length} Peserta
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Admin Action Pane (approx 38%) -->
                ${isAdmin ? `
                <div class="w-full md:w-[38%] bg-elevated/30 p-5 md:p-6 flex flex-col justify-center border-t md:border-t-0 border-border-default/50">
                    <p class="text-[10px] uppercase tracking-widest font-bold text-fg-tertiary mb-3 flex items-center justify-center md:justify-start gap-1">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        Admin Control
                    </p>
                    <div class="flex flex-col gap-2">
                        <div class="flex gap-2">
                            <button data-event-id="${eventId}" class="edit-event-target-btn flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-fg-secondary hover:text-fg-primary bg-input hover:bg-elevated/80 px-0 py-2.5 rounded-lg transition-transform hover:scale-[1.02] border border-border-default shadow-sm">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                Target
                            </button>
                            <button data-event-id="${eventId}" class="manage-event-participants-btn flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-fg-secondary hover:text-fg-primary bg-input hover:bg-elevated/80 px-0 py-2.5 rounded-lg transition-transform hover:scale-[1.02] border border-border-default shadow-sm">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                                Peserta
                            </button>
                        </div>
                        <button data-event-id="${eventId}" class="archive-event-btn w-full flex items-center justify-center gap-1.5 text-[11px] uppercase tracking-wide font-bold text-danger/80 hover:text-danger hover:bg-danger/10 px-3 py-2 rounded-lg transition-all border border-danger/20">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                            Arsipkan Event
                        </button>
                    </div>
                </div>
                ` : ''}
            </div>
        </div>

        <!-- Progress Summary -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="glass-card p-5 rounded-lg">
                <p class="text-sm text-fg-tertiary mb-1">Total Terkumpul</p>
                <p class="text-2xl font-bold text-accent">Rp ${totalCollected.toLocaleString('id-ID')}</p>
                <div class="mt-3 h-2 bg-elevated rounded-full overflow-hidden">
                    <div class="h-full bg-accent rounded-full transition-all" style="width: ${overallProgress}%"></div>
                </div>
                <p class="text-xs text-fg-tertiary mt-1">${overallProgress.toFixed(1)}% dari Rp ${totalTarget.toLocaleString('id-ID')}</p>
            </div>
            <div class="glass-card p-5 rounded-lg">
                <p class="text-sm text-fg-tertiary mb-1">Sudah Lunas</p>
                <p class="text-2xl font-bold text-accent">${lunasCount} <span class="text-base text-fg-tertiary">orang</span></p>
            </div>
            <div class="glass-card p-5 rounded-lg">
                <p class="text-sm text-fg-tertiary mb-1">Belum Lunas</p>
                <p class="text-2xl font-bold text-warning">${belumCount} <span class="text-base text-fg-tertiary">orang</span></p>
            </div>
        </div>

        <!-- Filters -->
        <div class="glass-card p-4 rounded-lg mb-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm text-fg-tertiary mb-1">Filter Kelas</label>
                    <select class="event-class-filter w-full px-4 py-2.5 bg-input border border-border-default rounded-md text-fg-primary text-sm" data-event-id="${eventId}">
                        <option value="all">Semua Kelas</option>
                        ${classOptions.map(c => `<option value="${c}"${classFilter === c ? ' selected' : ''}>Praktik ${c}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-sm text-fg-tertiary mb-1">Filter Status</label>
                    <select class="event-status-filter w-full px-4 py-2.5 bg-input border border-border-default rounded-md text-fg-primary text-sm" data-event-id="${eventId}">
                        <option value="all"${statusFilter === 'all' ? ' selected' : ''}>Semua Status</option>
                        <option value="Lunas"${statusFilter === 'Lunas' ? ' selected' : ''}>Lunas</option>
                        <option value="Belum Lunas"${statusFilter === 'Belum Lunas' ? ' selected' : ''}>Belum Lunas</option>
                    </select>
                </div>
            </div>
        </div>

        <!-- Student Table -->
        <div class="glass-card p-4 rounded-lg">
            <div class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead>
                        <tr class="border-b border-border-default">
                            <th class="p-3 text-sm font-semibold text-fg-secondary hidden md:table-cell">NIM</th>
                            <th class="p-3 text-sm font-semibold text-fg-secondary">Nama</th>
                            <th class="p-3 text-sm font-semibold text-fg-secondary">Kelas</th>
                            <th class="p-3 text-sm font-semibold text-fg-secondary">Progress</th>
                            <th class="p-3 text-sm font-semibold text-fg-secondary text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>${tableRows}</tbody>
                </table>
            </div>
        </div>`;
}

/**
 * Render event management widget inside the Admin view.
 */
export function renderEventsSummaryInAdmin(userData) {
    const container = document.getElementById('admin-events-widget');
    if (!container) return;

    const activeEvents = state.events.filter(ev => ev.status === 'active');

    const eventsListHTML = activeEvents.length === 0
        ? '<p class="text-fg-tertiary p-3">Belum ada kegiatan aktif.</p>'
        : activeEvents.map(ev => {
            const payments = state.eventPayments.filter(p => p.eventId === ev.id);
            const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
            const totalTarget = state.allStudents.length * ev.targetPerStudent;
            const progress = totalTarget > 0 ? Math.min((totalCollected / totalTarget) * 100, 100) : 0;

            return `
                <div class="p-4 border-b border-border-default last:border-0">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <p class="font-bold text-fg-primary">${sanitize(ev.name)}</p>
                            <p class="text-xs text-fg-tertiary">Target: Rp ${ev.targetPerStudent.toLocaleString('id-ID')}/orang</p>
                        </div>
                        <button data-event-id="${ev.id}" class="archive-event-btn text-xs text-fg-tertiary hover:text-warning font-semibold transition-colors">Arsipkan</button>
                    </div>
                    <div class="h-2 bg-elevated rounded-full overflow-hidden">
                        <div class="h-full bg-accent rounded-full" style="width: ${progress}%"></div>
                    </div>
                    <p class="text-xs text-fg-tertiary mt-1">${progress.toFixed(1)}% terkumpul — Rp ${totalCollected.toLocaleString('id-ID')} / ${totalTarget.toLocaleString('id-ID')}</p>
                </div>`;
        }).join('');

    container.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-3xl font-bold text-fg-primary flex items-center gap-2">
                <svg class="w-7 h-7 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>
                Tabungan Kegiatan
            </h2>
            <button id="create-event-btn" class="btn-primary px-4 py-2 rounded-md font-semibold text-sm flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                Buat Kegiatan
            </button>
        </div>
        <div class="glass-card rounded-lg overflow-hidden">
            ${eventsListHTML}
        </div>`;
}

/**
 * Render archived events section in the Arsip view.
 */
export function renderArchivedEvents() {
    const container = document.getElementById('archived-events-container');
    if (!container) return;

    const archivedEvents = state.events.filter(ev => ev.status === 'archived');

    if (archivedEvents.length === 0) {
        container.innerHTML = '';
        return;
    }

    const eventsHTML = archivedEvents.map(ev => {
        const payments = state.eventPayments.filter(p => p.eventId === ev.id);
        const excludedNims = new Set(ev.excludedNims || []);
        const participants = state.allStudents.filter(s => !excludedNims.has(s.nim));
        const totalCollected = payments.filter(p => !excludedNims.has(p.nim)).reduce((sum, p) => sum + p.amount, 0);
        const totalTarget = participants.length * ev.targetPerStudent;
        const progress = totalTarget > 0 ? Math.min((totalCollected / totalTarget) * 100, 100) : 0;
        const lunasCount = participants.filter(s => {
            const paid = payments.filter(p => p.nim === s.nim).reduce((sum, p) => sum + p.amount, 0);
            return paid >= ev.targetPerStudent;
        }).length;

        return `
            <div class="p-4 border-b border-border-default last:border-0">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <p class="font-bold text-fg-secondary">${sanitize(ev.name)}</p>
                        <p class="text-xs text-fg-tertiary mt-1">Target: Rp ${ev.targetPerStudent.toLocaleString('id-ID')}/orang — ${lunasCount}/${participants.length} lunas — Terkumpul: Rp ${totalCollected.toLocaleString('id-ID')}</p>
                    </div>
                    <div class="flex gap-2 flex-shrink-0">
                        <button data-event-id="${ev.id}" class="unarchive-event-btn text-xs text-fg-secondary hover:text-accent border border-border-default hover:border-blue-500/50 px-3 py-1.5 rounded-md transition-all">↩ Aktifkan</button>
                        <button data-event-id="${ev.id}" class="delete-event-permanent-btn text-xs text-fg-tertiary hover:text-danger/80 border border-border-default hover:border-danger/50 px-3 py-1.5 rounded-md transition-all">✕ Hapus</button>
                    </div>
                </div>
                <div class="h-1.5 bg-elevated rounded-full overflow-hidden">
                    <div class="h-full bg-accent rounded-full" style="width: ${progress}%"></div>
                </div>
                <p class="text-xs text-fg-muted mt-1">${progress.toFixed(1)}% tercapai</p>
            </div>`;
    }).join('');

    container.innerHTML = `
        <div class="mt-8">
            <h3 class="text-2xl font-bold text-fg-tertiary mb-4 flex items-center gap-2">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>
                Kegiatan Selesai
            </h3>
            <div class="glass-card rounded-lg overflow-hidden">${eventsHTML}</div>
        </div>`;
}

/**
 * Render Kegiatan Hub view
 */
export function renderKegiatanHub(userData) {
    const container = document.getElementById('kegiatan-hub-container');
    if (!container) return;

    const activeEvents = state.events.filter(ev => ev.status === 'active');

    if (activeEvents.length === 0) {
        container.innerHTML = `
            <div class="glass-card p-12 rounded-xl text-center flex flex-col items-center justify-center">
                <div class="w-16 h-16 bg-elevated rounded-full flex items-center justify-center mb-4 border border-border-default">
                    <svg class="w-8 h-8 text-fg-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                </div>
                <p class="text-fg-secondary font-medium text-lg">Belum ada kegiatan</p>
                <p class="text-fg-tertiary text-sm mt-1">Acara atau kegiatan baru akan muncul di sini</p>
            </div>
        `;
        return;
    }

    const eventsHTML = activeEvents.map(ev => {
        const payments = state.eventPayments.filter(p => p.eventId === ev.id);
        const excludedNims = new Set(ev.excludedNims || []);

        // Cek target dan nominal
        let statusBadge = '';
        if (userData.role === 'mahasiswa') {
            const userPaid = payments.filter(p => p.nim === userData.nim).reduce((sum, p) => sum + p.amount, 0);
            if (excludedNims.has(userData.nim)) {
                statusBadge = '<span class="px-2 py-1 text-[10px] font-bold uppercase rounded bg-elevated text-fg-tertiary border border-border-default">Bebas</span>';
            } else if (userPaid >= ev.targetPerStudent) {
                statusBadge = '<span class="px-2 py-1 text-[10px] font-bold uppercase rounded bg-success/10 text-success border border-success/20">Lunas</span>';
            } else if (userPaid > 0) {
                statusBadge = '<span class="px-2 py-1 text-[10px] font-bold uppercase rounded bg-warning/10 text-warning border border-warning/20">Mencicil</span>';
            } else {
                statusBadge = '<span class="px-2 py-1 text-[10px] font-bold uppercase rounded bg-danger/10 text-danger border border-danger/20">Belum Bayar</span>';
            }
        }

        const participantsCounter = state.allStudents.length - excludedNims.size;

        return `
            <a href="#" data-view="event-${ev.id}" class="nav-link-event flex flex-col p-5 glass-card rounded-[14px] border border-border-default hover:border-accent transition-all hover:bg-elevated/50 mb-4 group cursor-pointer" style="text-decoration:none;">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full flex items-center justify-center bg-accent-subtle text-accent border border-border-accent shrink-0 group-hover:scale-105 transition-transform">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                        </div>
                        <div>
                            <h3 class="font-bold text-fg-primary text-base group-hover:text-accent transition-colors">${sanitize(ev.name)}</h3>
                            <p class="text-xs text-fg-tertiary">Target: Rp ${ev.targetPerStudent.toLocaleString('id-ID')}</p>
                        </div>
                    </div>
                    ${statusBadge}
                </div>
                <div class="flex justify-between items-center text-xs mt-2 pt-3 border-t border-border-subtle">
                    <span class="text-fg-tertiary flex items-center gap-1.5">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                        ${participantsCounter} Peserta
                    </span>
                    <span class="text-accent font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Detail <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                    </span>
                </div>
            </a>
        `;
    }).join('');

    container.innerHTML = `<div class="flex flex-col gap-1">${eventsHTML}</div>`;

    if (!container.dataset.handlersAttached) {
        container.addEventListener('click', handleNavigation);
        container.dataset.handlersAttached = 'true';
    }
}
