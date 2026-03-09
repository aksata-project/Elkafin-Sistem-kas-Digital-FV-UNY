import './style.css';
import { setupAuthListeners, login, logout } from './auth/index.js';
import { handleAddKas, handleQuickPay, handleUpdateKas, handleAddManualWeek, handleRemoveManualWeek } from './handlers/kas.js';
import { handleAddExpense, handleDeleteExpense } from './handlers/expenses.js';
import { handleAddStudent, handleDeleteStudent, handleSetRole, handleRemoveRole, handlePublishAnnouncement, handleResetWeek, handleSaveCarryOver, handleSetWarning, handleRemoveWarning } from './handlers/admin.js';
import { handleExport, handleMonthlyReportExport } from './handlers/export.js';
import { openKasModal, openEditKasModal, openTransactionHistoryModal, openExpenseModal, openAddStudentModal, openManageRolesModal, openWarningModal } from './ui/modals.js';
import { renderKasAngkatan, renderRekapitulasiPemasukan } from './ui/render.js';
import { currentUser, userData, state } from './store/state.js';
import { sendCumulativeBillingReminders } from './utils/email.js';
import { showAlert, showToast } from './utils/toast.js';

// Setup global callbacks that need to be passed down
const callbacks = {
    onExportExcel: () => handleExport('excel'),
    onExportPdf: () => handleExport('pdf'),
    onAddWeek: handleAddManualWeek,
    onRemoveWeek: handleRemoveManualWeek,
    onMonthlyExport: handleMonthlyReportExport,
    adminCallbacks: {
        onAddStudent: () => openAddStudentModal(e => handleAddStudent(e)),
        onManageRoles: () => openManageRolesModal(e => handleSetRole(e)),
        onAnnouncement: (e) => handlePublishAnnouncement(e, userData),
        onResetWeek: handleResetWeek,
        onSaveCarryOver: handleSaveCarryOver,
        onAddWarning: () => openWarningModal(e => handleSetWarning(e)),
        onRemoveWarning: handleRemoveWarning,
        onSendBilling: async (targetClass, startWeek, endWeek) => {
            if (startWeek > endWeek) {
                showToast('error', 'Minggu Awal tidak boleh lebih besar dari Minggu Akhir.');
                return;
            }

            // Filter mahasiswa berdasarkan input Kelas Praktik (C1, C2, D1, D2) dari dropdown
            let targetStudents = state.allStudents;
            if (targetClass !== 'all') {
                targetStudents = state.allStudents.filter(s => s.practiceClass === targetClass);
            }

            // Build paid set
            const paidSet = new Set(
                state.kasTransactions.filter(t => t.amount > 0).map(t => `${t.nim}-${t.week}`)
            );

            // Count students with any unpaid week AND have email
            const debtorCount = targetStudents.filter(s =>
                s.email && Array.from({ length: endWeek - startWeek + 1 }, (_, i) => startWeek + i).some(w => !paidSet.has(`${s.nim}-${w}`))
            ).length;
            const noEmailCount = targetStudents.filter(s =>
                !s.email && Array.from({ length: endWeek - startWeek + 1 }, (_, i) => startWeek + i).some(w => !paidSet.has(`${s.nim}-${w}`))
            ).length;

            if (debtorCount === 0) {
                showToast('info', `Semua anggota ${targetClass !== 'all' ? 'kelas ini ' : ''}telah lunas untuk rentang minggu tersebut! 🎉`);
                return;
            }

            const confirmed = confirm(
                `Akan mengirim tagihan kumulatif ke ${debtorCount} anggota yang masih memiliki tunggakan (Minggu ${startWeek}–${endWeek}).\n` +
                (noEmailCount > 0 ? `(${noEmailCount} anggota tanpa email akan dilewati)\n` : '') +
                `\nSetiap orang menerima 1 email berisi daftar tunggakan. Lanjutkan?`
            );
            if (!confirmed) return;

            const btn = document.getElementById('send-billing-btn');
            const progressDiv = document.getElementById('billing-progress');
            if (btn) { btn.disabled = true; btn.textContent = 'Mengirim...'; }
            if (progressDiv) { progressDiv.classList.remove('hidden'); progressDiv.textContent = 'Mempersiapkan...'; }

            try {
                const result = await sendCumulativeBillingReminders(
                    targetStudents,
                    state.kasTransactions,
                    startWeek,
                    endWeek,
                    2000,
                    (sent, total, name) => {
                        if (progressDiv) progressDiv.textContent = `Mengirim... ${sent}/${total} — ${name}`;
                    }
                );
                if (progressDiv) progressDiv.classList.add('hidden');
                showToast('success', `✅ ${result.sent} email kumulatif terkirim${result.failed > 0 ? `, ${result.failed} gagal` : ''}${result.skipped > 0 ? `, ${result.skipped} tanpa email` : ''}.`);
            } catch (err) {
                if (progressDiv) progressDiv.classList.add('hidden');
                showToast('error', 'Gagal mengirim email. Cek koneksi atau konfigurasi EmailJS.');
                console.error(err);
            } finally {
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>Kirim Tagihan Kumulatif';
                }
            }
        }
    }
};

// Listen for global events
document.addEventListener('DOMContentLoaded', () => {
    // Auth bindings
    document.getElementById('google-login-btn')?.addEventListener('click', login);
    document.getElementById('logout-btn')?.addEventListener('click', logout);

    // Setup Auth and Realtime sync
    setupAuthListeners(callbacks);

    // Filter bindings
    document.getElementById('kas-filter-class')?.addEventListener('change', () => renderKasAngkatan(userData));
    document.getElementById('kas-filter-status')?.addEventListener('change', () => renderKasAngkatan(userData));
    document.getElementById('kas-filter-name')?.addEventListener('input', () => renderKasAngkatan(userData));
    document.getElementById('kas-filter-week')?.addEventListener('change', () => {
        renderKasAngkatan(userData);
        renderRekapitulasiPemasukan();
    });

    // Global click listener for dynamic elements (buttons inside render logic)
    document.body.addEventListener('click', (e) => {
        // Kas Modals
        if (e.target.closest('.open-kas-modal-btn')) {
            openKasModal(e, (formEvent) => handleAddKas(formEvent, currentUser, userData));
        }
        if (e.target.closest('.open-history-modal-btn')) {
            openTransactionHistoryModal(e, userData, (transactionId) => {
                openEditKasModal(transactionId, handleUpdateKas);
            });
        }
        if (e.target.closest('.quick-pay-btn')) {
            handleQuickPay(e, currentUser, userData);
        }

        // Expenses
        if (e.target.closest('#add-expense-btn')) {
            openExpenseModal((formEvent) => handleAddExpense(formEvent, currentUser, userData));
        }
        if (e.target.closest('.delete-expense-btn')) {
            handleDeleteExpense(e);
        }

        // Admin
        if (e.target.closest('.delete-student-btn')) {
            handleDeleteStudent(e);
        }
        if (e.target.closest('.remove-role-btn')) {
            handleRemoveRole(e);
        }
        if (e.target.closest('.remove-warning-btn')) {
            handleRemoveWarning(e);
        }
    });

    // Timer setup
    setInterval(() => {
        import('./ui/navigation.js').then(({ updateTime }) => updateTime());
    }, 1000);
});

