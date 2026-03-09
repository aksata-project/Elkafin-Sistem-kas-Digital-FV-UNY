import { state, getWeeklyTarget } from '../store/state.js';
import { formatCurrency, formatDateTime } from '../utils/format.js';
import { sanitize } from '../utils/sanitize.js';
import { getTotalPaid } from '../data/transactionIndex.js';
import { hasPermissionToEdit, findStudentByNim, getRoleName } from './navigation.js';
import { animateNumber } from '../utils/animate.js';

// Cache for previous values to animate from
const prevDashboardValues = { finalC: 0, finalD: 0, total: 0 };

// ─── Dashboard Summary ────────────────────────────────────────────────────────

export function renderDashboardSummary() {
    try {
        let incomeC = state.carryOver.teori_c || 0;
        let incomeD = state.carryOver.teori_d || 0;
        const carryOverAngkatan = state.carryOver.angkatan || 0;

        state.kasTransactions.forEach(p => {
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
                <div class="glass-card p-4 rounded-lg flex items-start gap-4 border border-blue-500/20">
                    <div class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <svg class="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.998.75a.75.75 0 01.75.75v5.021a3.021 3.021 0 11-4.042 0V1.5a.75.75 0 01.75-.75zM8.5 4.5a.75.75 0 00-1.5 0v3.406c0 .175.006.348.019.52a4.521 4.521 0 108.962 0c.013-.172.019-.345.019-.52V4.5a.75.75 0 00-1.5 0v2.521a3.021 3.021 0 11-6 0V4.5zM12.75 18a.75.75 0 000-1.5h-5.5a.75.75 0 000 1.5h5.5z" /></svg>
                    </div>
                    <div>
                        <p class="font-bold text-blue-400">Pengumuman</p>
                        <p class="text-sm text-gray-300">${sanitize(state.announcement.message)}</p>
                        <p class="text-xs text-gray-500 mt-1">Diposting oleh ${sanitize(state.announcement.authorName)} pada ${formatDateTime(state.announcement.createdAt)}</p>
                    </div>
                    <button id="dismiss-announcement-btn" class="ml-auto text-gray-500 hover:text-gray-300">&times;</button>
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
        const maxWeek = Math.max(state.currentWeek, state.manualMaxWeek);
        const totalPages = maxWeek > 0 ? Math.ceil(maxWeek / WEEKS_PER_PAGE) : 1;

        if (state.paymentStatusPage >= totalPages) {
            state.paymentStatusPage = Math.max(0, totalPages - 1);
        }

        let content = `<h3 class="text-xl font-bold mb-4 text-white">Status Pembayaran Kas Saya</h3>`;

        const startWeek = state.paymentStatusPage * WEEKS_PER_PAGE + 1;
        const endWeek = Math.min(startWeek + WEEKS_PER_PAGE - 1, maxWeek);

        let weekBlocksHTML = '';
        if (maxWeek > 0) {
            for (let i = startWeek; i <= endWeek; i++) {
                const totalPaid = getTotalPaid(userData.nim, i);
                const target = getWeeklyTarget(i);
                const isPaid = totalPaid >= target;
                weekBlocksHTML += `<div class="flex-1 p-3 rounded-lg text-center min-w-[4rem] ${isPaid ? 'bg-blue-500/10' : 'bg-gray-800/20'}">
                    <p class="text-sm text-gray-400">Minggu ${i}</p>
                    <p class="font-bold text-lg ${isPaid ? 'text-blue-400' : 'text-gray-500'}">${isPaid ? 'Lunas' : 'Belum'}</p>
                </div>`;
            }
        } else {
            weekBlocksHTML = '<p class="text-gray-500 text-center col-span-5">Belum ada data minggu.</p>';
        }

        content += `<div class="flex items-center gap-2">
            <button id="prev-week-page" class="pagination-btn p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg></button>
            <div class="flex-1 flex justify-center gap-3">${weekBlocksHTML}</div>
            <button id="next-week-page" class="pagination-btn p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></button>
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
            ? `<tr><td colspan="6" class="text-center p-6 text-gray-500">Tidak ada data untuk filter ini.</td></tr>`
            : filteredData.map(data => {
                const canEdit = hasPermissionToEdit(data, userData);
                const progress = Math.min((data.totalPaid / target) * 100, 100);
                const isLunas = data.totalPaid >= target;
                const warning = state.warnings && state.warnings[data.nim] && state.warnings[data.nim].active ? state.warnings[data.nim] : null;

                let actionButton = `<span class="text-gray-600 text-sm">-</span>`;
                if (canEdit) {
                    if (isLunas) {
                        actionButton = `<button data-nim="${data.nim}" class="open-history-modal-btn btn-secondary py-2 px-4 rounded-lg text-sm font-semibold">Edit</button>`;
                    } else {
                        actionButton = `
                        <div class="flex gap-2 justify-center">
                            <button data-nim="${data.nim}" class="quick-pay-btn btn-primary py-2 px-3 rounded-lg text-xs font-bold flex items-center gap-1" title="Bayar Instan Rp ${target}">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                ${target / 1000}k
                            </button>
                            <button data-nim="${data.nim}" data-name="${sanitize(data.name)}" class="open-kas-modal-btn btn-secondary py-2 px-3 rounded-lg text-xs font-semibold">Input</button>
                        </div>`;
                    }
                }

                let nameHTML = `<a href="#" class="hover:text-blue-400 open-history-modal-btn transition-colors" data-nim="${data.nim}">${sanitize(data.name)}</a>`;
                
                if (warning) {
                    nameHTML = `
                        <div class="flex items-center gap-2">
                            <a href="#" class="text-red-500 hover:text-red-400 open-history-modal-btn transition-colors drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" data-nim="${data.nim}">${sanitize(data.name)}</a>
                            <div class="group relative flex items-center">
                                <span ${canEdit ? `data-nim="${data.nim}" title="Klik untuk cabut peringatan"` : ''} class="${canEdit ? 'remove-warning-btn cursor-pointer hover:bg-red-500 hover:text-white transition-colors' : 'cursor-help'} flex h-5 w-5 items-center justify-center rounded-full bg-red-500/20 text-red-500 border border-red-500/50 animate-pulse">
                                    <svg class="w-3 h-3 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                                </span>
                                <div class="absolute left-8 w-64 p-3 bg-red-950 text-red-200 text-xs rounded-lg shadow-2xl border border-red-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[9999] pointer-events-none break-words whitespace-normal">
                                    <p class="font-bold text-red-400 mb-1 text-sm border-b border-red-800/50 pb-1">⚠ Catatan Khusus Peringatan</p>
                                    <p class="mt-1 leading-relaxed">${sanitize(warning.message)}</p>
                                </div>
                            </div>
                        </div>
                    `;
                }

                return `
                    <tr class="border-b ${warning ? 'border-red-900/40 bg-red-950/20' : 'border-gray-800'} hover:bg-gray-900/50 text-sm transition-colors relative">
                        <td class="p-2 md:p-4 hidden md:table-cell text-gray-400">${sanitize(data.nim)}</td>
                        <td class="p-2 md:p-4 font-semibold text-white">${nameHTML}</td>
                        <td class="p-2 md:p-4"><span class="px-2 py-1 text-xs font-semibold rounded-full bg-gray-800 text-gray-300">${sanitize(data.practiceClass)}</span></td>
                        <td class="p-2 md:p-4"><div class="w-full"><span class="font-semibold ${isLunas ? 'text-blue-400' : 'text-blue-600'}">${formatCurrency(data.totalPaid)}</span><div class="w-full bg-gray-700 rounded-full h-1.5 mt-1"><div class="${isLunas ? 'bg-blue-500' : 'bg-blue-800'} h-1.5 rounded-full transition-all duration-500" style="width: ${progress}%"></div></div></div></td>
                        <td class="p-2 md:p-4"><span class="px-2 py-1 text-xs font-semibold rounded-full ${isLunas ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-500'}">${data.status}</span></td>
                        <td class="p-2 md:p-4 text-center">${actionButton}</td>
                    </tr>`;
            }).join('');

    } catch (e) {
        console.error('renderKasAngkatan error:', e);
    }
}

// ─── Expenses Table ───────────────────────────────────────────────────────────

export function renderExpenses(userData) {
    try {
        const tableBody = document.getElementById('expenses-table-body');
        if (!tableBody) return;

        const sortedExpenses = [...state.kasExpenses].sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);
        const isFullTreasurer = userData.role === 'bendahara_angkatan' || userData.role === 'bendahara_teori';

        if (sortedExpenses.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" class="text-center p-6 text-gray-500">Belum ada pengeluaran.</td></tr>`;
            return;
        }

        const categoryMap = { teori_c: 'Kas Teori C', teori_d: 'Kas Teori D', angkatan: 'Kas Angkatan (Dibagi Rata)' };
        // FIX: sanitize description and recordedByName to prevent XSS
        tableBody.innerHTML = sortedExpenses.map(exp => `
            <tr class="border-b border-gray-800">
                <td class="p-4">${formatDateTime(exp.timestamp)}</td>
                <td class="p-4 text-white">${sanitize(exp.description)}</td>
                <td class="p-4"><span class="px-3 py-1 text-xs font-semibold rounded-full bg-gray-700 text-gray-300">${categoryMap[exp.category] || 'Lainnya'}</span></td>
                <td class="p-4 text-blue-500 font-semibold">${formatCurrency(exp.amount)}</td>
                <td class="p-4 text-gray-400">${sanitize(exp.recordedByName)}</td>
                <td class="p-4 text-center">${isFullTreasurer ? `<button data-id="${exp.id}" class="delete-expense-btn text-red-500 hover:text-red-400 text-xs font-semibold">&times; Hapus</button>` : ''}</td>
            </tr>`
        ).join('');
    } catch (e) {
        console.error('renderExpenses error:', e);
    }
}

// ─── Archive View ─────────────────────────────────────────────────────────────

export function renderArchiveView(userData, onDownload, adminCallbacks) {
    try {
        const view = document.getElementById('view-arsip');
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const monthOptions = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
            .map((month, index) => `<option value="${index}" ${index === currentMonth ? 'selected' : ''}>${month}</option>`).join('');

        const yearOptions = Array.from({ length: 5 }, (_, i) => {
            const year = currentYear - i;
            return `<option value="${year}">${year}</option>`;
        }).join('');

        const isAdmin = userData && userData.role === 'bendahara_angkatan';
        const carryOverForm = isAdmin ? `
            <div class="mt-8 border-t border-gray-800 pt-8">
                <h3 class="text-xl font-bold text-white mb-4">Input Saldo Pindahan Semester Lalu</h3>
                <form id="carry-over-form" class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label class="block text-sm font-medium text-gray-400 mb-1">Saldo Teori C (Rp)</label>
                        <input type="number" name="teori_c" value="${state.carryOver.teori_c || 0}" class="w-full py-3 px-4 bg-gray-900 border border-gray-700 rounded-lg text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-400 mb-1">Saldo Teori D (Rp)</label>
                        <input type="number" name="teori_d" value="${state.carryOver.teori_d || 0}" class="w-full py-3 px-4 bg-gray-900 border border-gray-700 rounded-lg text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-400 mb-1">Saldo Angkatan (Rp)</label>
                        <input type="number" name="angkatan" value="${state.carryOver.angkatan || 0}" class="w-full py-3 px-4 bg-gray-900 border border-gray-700 rounded-lg text-white">
                    </div>
                    <button type="submit" class="w-full btn-secondary font-bold py-3 rounded-lg">Simpan Saldo Awal</button>
                </form>
            </div>
        ` : '';

        view.innerHTML = `
            <h2 class="text-4xl font-bold text-white mb-6">Arsip Laporan Bulanan</h2>
            <div class="glass-card p-8 rounded-xl">
                <p class="text-gray-400 mb-6">Pilih bulan dan tahun untuk mengunduh laporan kas lengkap dalam format Excel.</p>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <label for="report-month" class="block text-sm font-medium text-gray-400 mb-1">Bulan</label>
                        <select id="report-month" class="w-full py-3 px-4 bg-gray-900 border border-gray-700 rounded-lg text-white">${monthOptions}</select>
                    </div>
                    <div>
                        <label for="report-year" class="block text-sm font-medium text-gray-400 mb-1">Tahun</label>
                        <select id="report-year" class="w-full py-3 px-4 bg-gray-900 border border-gray-700 rounded-lg text-white">${yearOptions}</select>
                    </div>
                    <button id="download-monthly-report-btn" class="w-full btn-primary font-bold py-3 rounded-lg">Unduh Laporan</button>
                </div>
                ${carryOverForm}
            </div>`;

        document.getElementById('download-monthly-report-btn').addEventListener('click', () => {
            const m = document.getElementById('report-month').value;
            const y = document.getElementById('report-year').value;
            onDownload(parseInt(m), parseInt(y));
        });

        if (isAdmin && adminCallbacks && adminCallbacks.onSaveCarryOver) {
            document.getElementById('carry-over-form').addEventListener('submit', adminCallbacks.onSaveCarryOver);
        }
    } catch (e) {
        console.error('renderArchiveView error:', e);
    }
}

// ─── Admin View ───────────────────────────────────────────────────────────────

export function renderAdminView(userData, { onAddStudent, onManageRoles, onAnnouncement, onResetWeek, onSendBilling, onAddWarning, onRemoveWarning }) {
    try {
        if (!userData || userData.role !== 'bendahara_angkatan') {
            const adminView = document.getElementById('view-admin');
            if (adminView) adminView.innerHTML = '';
            return;
        }

        const view = document.getElementById('view-admin');

        // FIX: sanitize student name, nim, email to prevent XSS
        const studentsTable = state.allStudents.map(s => `
            <tr class="border-b border-gray-800">
                <td class="p-3">${sanitize(s.nim)}</td>
                <td class="p-3 text-white">${sanitize(s.name)}</td>
                <td class="p-3">${sanitize(s.practiceClass)}</td>
                <td class="p-3">${sanitize(s.email || '-')}</td>
                <td class="p-3 text-center"><button data-nim="${sanitize(s.nim)}" class="delete-student-btn text-blue-600 hover:text-blue-400 text-sm font-semibold">&times; Hapus</button></td>
            </tr>`
        ).join('');

        const rolesMap = { bendahara_angkatan: 'Ketua Kelas', bendahara_teori: 'Bendahara Teori', bendahara_praktik: 'Bendahara Praktik' };
        let rolesContent = '';
        for (const nim in state.roles) {
            const student = findStudentByNim(nim);
            if (student) {
                const roleLabel = state.roles[nim].includes('teori')
                    ? `(${student.theoryClass})` : state.roles[nim].includes('praktik')
                    ? `(${student.practiceClass})` : '';
                rolesContent += `<div class="flex justify-between items-center p-3 border-b border-gray-800">
                    <span><strong>${rolesMap[state.roles[nim]]} ${roleLabel}</strong>: ${sanitize(student.name)}</span>
                    <button data-nim="${sanitize(nim)}" class="remove-role-btn text-xs text-blue-600 hover:text-blue-400 font-semibold">&times; Hapus</button>
                </div>`;
            }
        }

        let warningsContent = '';
        for (const nim in state.warnings) {
            const warning = state.warnings[nim];
            const student = findStudentByNim(nim);
            if (student && warning.active) {
                warningsContent += `<div class="flex justify-between items-center p-3 border-b border-red-900/30">
                    <div class="flex-1">
                        <p class="font-bold text-red-500">${sanitize(student.name)} <span class="text-gray-500 text-xs font-normal">(${student.practiceClass})</span></p>
                        <p class="text-xs text-red-400 mt-1 flex items-start gap-1">
                            <svg class="w-3 h-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                            ${sanitize(warning.message)}
                        </p>
                    </div>
                    <button data-nim="${sanitize(nim)}" class="remove-warning-btn ml-4 text-xs text-gray-400 hover:text-white font-semibold flex-shrink-0 whitespace-nowrap">&times; Cabut</button>
                </div>`;
            }
        }

        const practiceClassesOptions = [...new Set(state.allStudents.map(s => s.practiceClass).filter(Boolean))]
            .sort()
            .map(c => `<option value="${c}">Praktik ${c}</option>`)
            .join('');

        view.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <div class="flex justify-between items-center mb-4"><h2 class="text-3xl font-bold text-white">Manajemen Anggota</h2><button id="add-student-btn" class="btn-primary px-4 py-2 rounded-lg font-semibold text-sm">Tambah Anggota</button></div>
                    <div class="glass-card p-4 rounded-xl"><div class="overflow-y-auto max-h-96"><table class="w-full text-sm"><thead><tr class="border-b border-gray-800"><th class="p-3 text-left">NIM</th><th class="p-3 text-left">Nama</th><th class="p-3 text-left">Kelas</th><th class="p-3 text-left">Email Terdaftar</th><th class="p-3 text-center">Aksi</th></tr></thead><tbody>${studentsTable}</tbody></table></div></div>
                </div>
                <div>
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-3xl font-bold text-white">Manajemen Bendahara</h2>
                        <div class="flex gap-2">
                            <button id="reset-week-btn" class="btn-secondary px-4 py-2 rounded-lg font-semibold text-sm border-red-500/50 text-red-500 hover:bg-red-500/10">Reset Minggu 1</button>
                            <button id="manage-roles-btn" class="btn-primary px-4 py-2 rounded-lg font-semibold text-sm">Tunjuk Bendahara</button>
                        </div>
                    </div>
                    <div class="glass-card p-4 rounded-xl mb-8">${rolesContent || '<p class="p-3 text-gray-500">Belum ada bendahara yang ditunjuk.</p>'}</div>
                    
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-3xl font-bold text-red-500 flex items-center gap-2">
                            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                            Peringatan Keras
                        </h2>
                        <button id="add-warning-btn" class="btn-primary border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all">Beri Peringatan</button>
                    </div>
                    <div class="glass-card p-4 rounded-xl border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-950/10">
                        ${warningsContent || '<p class="p-3 text-gray-500">Belum ada peringatan keras yang diberikan.</p>'}
                    </div>
                </div>
            </div>
            <div class="mt-8">
                <h2 class="text-3xl font-bold text-white mb-4">Manajemen Pengumuman</h2>
                <div class="glass-card p-6 rounded-xl">
                    <form id="announcement-form">
                        <label for="announcement-text" class="block text-sm font-medium text-gray-400 mb-1">Tulis Pengumuman Baru</label>
                        <textarea id="announcement-text" rows="3" class="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg" placeholder="Contoh: Batas akhir pembayaran untuk acara X adalah tanggal Y...">${state.announcement ? sanitize(state.announcement.message) : ''}</textarea>
                        <div class="flex justify-end mt-4"><button type="submit" class="px-6 py-2 btn-primary rounded-lg font-bold">Publikasikan</button></div>
                    </form>
                </div>
            </div>
            <div class="mt-8">
                <h2 class="text-3xl font-bold text-white mb-1">Kirim Tagihan Kumulatif</h2>
                <p class="text-gray-500 text-sm mb-4">Kirim satu email per anggota yang berisi total tunggakan pada minggu tertentu, difilter berdasarkan kelas.</p>
                <div class="glass-card p-6 rounded-xl">
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-4">
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-400 mb-1">Pilih Kelas Praktik</label>
                            <select id="billing-class-select" class="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm">
                                <option value="all">Semua Kelas</option>
                                ${practiceClassesOptions}
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-400 mb-1">Dari Minggu</label>
                            <select id="billing-start-week" class="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm">
                                ${Array.from({length: state.currentWeek || 1}, (_, i) => i + 1)
                                    .map(w => `<option value="${w}">Minggu ke-${w}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-400 mb-1">Sampai Minggu</label>
                            <select id="billing-end-week" class="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm">
                                ${Array.from({length: state.currentWeek || 1}, (_, i) => i + 1)
                                    .map(w => `<option value="${w}"${w === (state.currentWeek || 1) ? ' selected' : ''}>Minggu ke-${w}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="flex flex-wrap gap-4 items-center">
                        <button id="send-billing-btn" class="btn-primary px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 text-sm w-full md:w-auto justify-center">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                            Kirim Tagihan Kumulatif
                        </button>
                    </div>
                    <p class="text-xs text-gray-600 mt-3">* Hanya anggota yang sesuai filter, memiliki email terdaftar, dan memiliki tunggakan yang akan menerima email.</p>
                    <div id="billing-progress" class="hidden mt-4 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-sm text-indigo-300"></div>
                </div>
            </div>`;

        document.getElementById('add-student-btn').addEventListener('click', onAddStudent);
        document.getElementById('manage-roles-btn').addEventListener('click', onManageRoles);
        document.getElementById('reset-week-btn').addEventListener('click', onResetWeek);
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
    let rekapHTML = `<h3 class="text-xl font-bold mb-4 text-white">Rekap Pemasukan Kas (Minggu ${currentWeek})</h3><div class="space-y-4 text-gray-300">`;

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
                <div class="w-full bg-gray-700 rounded-full h-2.5 mt-1"><div class="bg-blue-500 h-2.5 rounded-full" style="width: ${studentsInClass.length > 0 ? (paidCount / studentsInClass.length) * 100 : 0}%"></div></div>
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
    const maxWeek = Math.max(state.currentWeek, state.manualMaxWeek);
    if (filter.options.length === maxWeek && parseInt(currentVal) <= maxWeek) return;

    const options = Array.from({ length: maxWeek }, (_, i) =>
        `<option value="${i + 1}">Minggu ke-${i + 1}</option>`
    ).join('');

    if (filter.innerHTML !== options) {
        filter.innerHTML = options;
    }
    if (currentVal && parseInt(currentVal) <= maxWeek) {
        filter.value = currentVal;
    } else {
        filter.value = state.currentWeek;
    }
}
