import './style.css';
import { setupAuthListeners, login, logout } from './auth/index.js';
import { handleAddKas, handleQuickPay, handleUpdateKas } from './handlers/kas.js';
import { handleAddExpense, handleDeleteExpense } from './handlers/expenses.js';
import { handleAddStudent, handleDeleteStudent, handleSetRole, handleRemoveRole, handlePublishAnnouncement, handleSetWarning, handleRemoveWarning, handleModifyWeek, handleResetWeekToCalendar } from './handlers/admin.js';
import { handleSemesterReportExport } from './handlers/export.js';
import { handleCreateEvent, handleAddEventPayment, handleArchiveEvent, handleDeleteEventPayment, handleUnarchiveEvent, handleDeleteEventPermanently, handleUpdateEventTarget, handleToggleStudentExclusion, handleEditEventPayment } from './handlers/events.js';
import { openKasModal, openEditKasModal, openTransactionHistoryModal, openExpenseModal, openAddStudentModal, openManageRolesModal, openWarningModal, openCreateEventModal, openEventPaymentModal, openEventPaymentHistoryModal, openEditEventTargetModal, openManageEventParticipantsModal, openEditEventPaymentModal } from './ui/modals.js';
import { renderKasAngkatan, renderRekapitulasiPemasukan, renderEventView } from './ui/render.js';
import { isInitialLoad, currentUser, userData, state } from './store/state.js';
import { handleNavigation } from './ui/navigation.js';
import { sendCumulativeBillingReminders } from './utils/email.js';
import { showAlert, showToast } from './utils/toast.js';
import { saveQrisEntry, fileToBase64, fetchQrisConfig } from './data/qris.js';

import { seedDummyData } from './utils/seed.js';

// Bind to window for easy access from console
window.seedDB = seedDummyData;

// Setup global callbacks that need to be passed down
const callbacks = {
    onSemesterExport: handleSemesterReportExport,
    adminCallbacks: {
        onAddStudent: () => openAddStudentModal(e => handleAddStudent(e)),
        onManageRoles: () => openManageRolesModal(e => handleSetRole(e)),
        onAnnouncement: (e) => handlePublishAnnouncement(e, userData),
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

        // Week Management
        if (e.target.closest('#week-minus-btn')) {
            handleModifyWeek(-1);
        }
        if (e.target.closest('#week-plus-btn')) {
            handleModifyWeek(1);
        }
        if (e.target.closest('#week-reset-btn')) {
            handleResetWeekToCalendar();
        }

        // Event Fund Management
        if (e.target.closest('#create-event-btn')) {
            openCreateEventModal((formEvent) => handleCreateEvent(formEvent, currentUser, userData));
        }
        if (e.target.closest('.open-event-payment-btn')) {
            const btn = e.target.closest('.open-event-payment-btn');
            const eventId = btn.dataset.eventId;
            const nim = btn.dataset.nim;
            const name = btn.dataset.name;
            const remaining = parseInt(btn.dataset.remaining);
            openEventPaymentModal(eventId, nim, name, remaining, (formEvent) => handleAddEventPayment(formEvent, currentUser, userData));
        }
        if (e.target.closest('.archive-event-btn')) {
            const btn = e.target.closest('.archive-event-btn');
            handleArchiveEvent(btn.dataset.eventId);
        }
        if (e.target.closest('.open-event-history-btn')) {
            openEventPaymentHistoryModal(e, userData, (paymentId, currentAmount) => {
                openEditEventPaymentModal(paymentId, currentAmount, (formEvent) => handleEditEventPayment(formEvent));
            });
        }
        if (e.target.closest('.delete-event-payment-btn')) {
            const btn = e.target.closest('.delete-event-payment-btn');
            handleDeleteEventPayment(btn.dataset.paymentId);
        }

        // Edit event target
        if (e.target.closest('.edit-event-target-btn')) {
            const btn = e.target.closest('.edit-event-target-btn');
            const eventId = btn.dataset.eventId;
            const event = state.events.find(ev => ev.id === eventId);
            if (event) openEditEventTargetModal(eventId, event.targetPerStudent, (formEvent) => handleUpdateEventTarget(formEvent));
        }

        // Manage event participants
        if (e.target.closest('.manage-event-participants-btn')) {
            const btn = e.target.closest('.manage-event-participants-btn');
            const eventId = btn.dataset.eventId;
            const event = state.events.find(ev => ev.id === eventId);
            if (event) openManageEventParticipantsModal(eventId, event.excludedNims, handleToggleStudentExclusion);
        }

        // Unarchive event
        if (e.target.closest('.unarchive-event-btn')) {
            const btn = e.target.closest('.unarchive-event-btn');
            handleUnarchiveEvent(btn.dataset.eventId);
        }

        // Delete event permanently
        if (e.target.closest('.delete-event-permanent-btn')) {
            const btn = e.target.closest('.delete-event-permanent-btn');
            handleDeleteEventPermanently(btn.dataset.eventId);
        }
        // Navigation
        if (e.target.closest('[data-view]')) {
            handleNavigation(e);
        }

        // Sidebar toggle
        if (e.target.closest('#open-sidebar-btn')) {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.classList.remove('-translate-x-full');
                sidebar.classList.add('translate-x-0');
            }
        }
        if (e.target.closest('#close-sidebar-btn') || e.target.closest('.nav-link')) {
            if (window.innerWidth < 768) {
                const sidebar = document.getElementById('sidebar');
                if (sidebar) {
                    sidebar.classList.remove('translate-x-0');
                    sidebar.classList.add('-translate-x-full');
                }
            }
        }

        // Admin: Save QRIS entry
        if (e.target.closest('.save-qris-btn')) {
            const btn = e.target.closest('.save-qris-btn');
            const classKey = btn.dataset.classKey;
            const card = btn.closest('.qris-admin-card');
            const waInput = card.querySelector('.qris-wa-input');
            const labelInput = card.querySelector('.qris-label-input');
            const fileInput = card.querySelector('.qris-file-input');

            btn.disabled = true;
            btn.textContent = 'Menyimpan...';

            const waNumber = waInput?.value?.replace(/[^0-9]/g, '') || '';
            const label = labelInput?.value || `Bendahara ${classKey}`;

            let qrisBase64 = state.qrisConfig[classKey]?.qrisBase64 || '';

            (async () => {
                try {
                    if (fileInput?.files?.length > 0) {
                        qrisBase64 = await fileToBase64(fileInput.files[0]);
                    }
                    const success = await saveQrisEntry(classKey, { qrisBase64, waNumber, label });
                    if (success) {
                        showToast('success', `QRIS ${classKey} berhasil disimpan.`);
                        // Refresh admin view
                        await fetchQrisConfig();
                    } else {
                        showToast('error', `Gagal menyimpan QRIS ${classKey}.`);
                    }
                } catch (err) {
                    console.error(err);
                    showToast('error', 'Terjadi kesalahan saat menyimpan.');
                } finally {
                    btn.disabled = false;
                    btn.textContent = 'Simpan';
                }
            })();
        }
    });

    // Event filter listeners (delegated via change on body)
    document.body.addEventListener('change', (e) => {
        if (e.target.closest('.event-class-filter') || e.target.closest('.event-status-filter')) {
            const eventId = e.target.dataset.eventId;
            if (eventId) renderEventView(eventId, userData);
        }
    });

    // Timer setup
    setInterval(() => {
        import('./ui/navigation.js').then(({ updateTime }) => updateTime());
    }, 1000);
});

