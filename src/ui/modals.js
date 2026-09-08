import { state, getWeeklyTarget } from '../store/state.js';
import { sanitize } from '../utils/sanitize.js';
import { formatCurrency, formatDateTime } from '../utils/format.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toggleBodyScroll(lock) {
    if (lock) {
        document.body.classList.add('modal-open');
    } else {
        document.body.classList.remove('modal-open');
    }
}

function setupModalClose(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    const closeBtns = modal.querySelectorAll('.close-modal-btn');
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modal.classList.add('hidden');
            toggleBodyScroll(false);
        });
    });

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
            toggleBodyScroll(false);
        }
    });
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        toggleBodyScroll(true);
    }
}

// ─── Kas Input Modal ──────────────────────────────────────────────────────────

export function openKasModal(e, onSubmit) {
    const btn = e.target.closest('.open-kas-modal-btn');
    const nim = btn.dataset.nim;
    const name = btn.dataset.name;
    const week = document.getElementById('kas-filter-week').value;
    const modal = document.getElementById('kas-input-modal');

    modal.innerHTML = `
      <div class="glass-card modal-card p-8 rounded-xl shadow-2xl shadow-black/30 w-full max-w-md">
        <h3 class="text-2xl font-bold text-fg-primary mb-2">Input Setoran Kas</h3>
        <p class="text-fg-secondary mb-6">Untuk: <strong>${sanitize(name)}</strong> (Mulai dari Minggu ${sanitize(week)})</p>
        <form id="kas-form">
            <input type="hidden" name="nim" value="${sanitize(nim)}">
            <input type="hidden" name="week" value="${sanitize(week)}">
            <div class="space-y-4">
                <div>
                    <label for="amount" class="block text-sm font-medium text-fg-secondary mb-1">Jumlah Setoran (Rp)</label>
                    <input type="number" id="amount" name="amount" class="w-full py-3 px-4 bg-input border border-border-default rounded-md text-fg-primary" required step="1000" max="5000000">
                </div>
                <div>
                    <label class="block text-sm font-medium text-fg-secondary mb-2">Metode Pembayaran</label>
                    <div class="flex gap-4">
                        <label class="flex items-center gap-2 p-3 bg-input border border-border-default rounded-md flex-1 cursor-pointer has-[:checked]:border-blue-500 has-[:checked]:bg-accent-subtle">
                            <input type="radio" name="paymentMethod" value="Cash" class="accent-blue-500" checked> Tunai
                        </label>
                        <label class="flex items-center gap-2 p-3 bg-input border border-border-default rounded-md flex-1 cursor-pointer has-[:checked]:border-blue-500 has-[:checked]:bg-accent-subtle">
                            <input type="radio" name="paymentMethod" value="Transfer" class="accent-blue-500"> Transfer
                        </label>
                    </div>
                </div>
                <div id="bank-name-container" class="hidden">
                    <label for="bankName" class="block text-sm font-medium text-fg-secondary mb-1">Nama Bank Pengirim</label>
                    <input type="text" id="bankName" name="bankName" class="w-full py-3 px-4 bg-input border border-border-default rounded-md text-fg-primary" placeholder="Contoh: BCA, BNI, Dana">
                </div>
            </div>
            <div class="flex items-center justify-end gap-4 mt-8">
                <button type="button" class="close-modal-btn text-fg-secondary hover:text-fg-primary font-semibold">Batal</button>
                <button type="submit" class="px-6 py-3 btn-primary rounded-md font-bold">Simpan</button>
            </div>
        </form>
      </div>`;

    showModal('kas-input-modal');
    setupModalClose('kas-input-modal');

    const form = document.getElementById('kas-form');
    form.addEventListener('submit', onSubmit);
    form.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            document.getElementById('bank-name-container').classList.toggle('hidden', e.target.value !== 'Transfer');
        });
    });
}

// ─── Kas Edit Modal ───────────────────────────────────────────────────────────

export function openEditKasModal(transactionId, onSubmit) {
    const transaction = state.kasTransactions.find(t => t.id === transactionId);
    if (!transaction) return;

    const modal = document.getElementById('kas-edit-modal');
    modal.innerHTML = `
      <div class="glass-card modal-card p-8 rounded-xl shadow-2xl shadow-black/30 w-full max-w-md">
        <h3 class="text-2xl font-bold text-fg-primary mb-2">Edit Setoran Kas</h3>
        <p class="text-fg-secondary mb-6">Minggu ${sanitize(String(transaction.week))}</p>
        <form id="kas-edit-form">
            <input type="hidden" name="id" value="${sanitize(transaction.id)}">
            <div class="space-y-4">
                <div>
                    <label for="edit-amount" class="block text-sm font-medium text-fg-secondary mb-1">Jumlah Setoran (Rp)</label>
                    <input type="number" id="edit-amount" name="amount" class="w-full py-3 px-4 bg-input border border-border-default rounded-md text-fg-primary" value="${transaction.amount}" required step="1000">
                </div>
            </div>
            <div class="flex items-center justify-end gap-4 mt-8">
                <button type="button" class="close-modal-btn text-fg-secondary hover:text-fg-primary font-semibold">Batal</button>
                <button type="submit" class="px-6 py-3 btn-primary rounded-md font-bold">Simpan Perubahan</button>
            </div>
        </form>
      </div>`;

    showModal('kas-edit-modal');
    setupModalClose('kas-edit-modal');
    document.getElementById('kas-edit-form').addEventListener('submit', onSubmit);
}

// ─── Transaction History Modal ────────────────────────────────────────────────

export function openTransactionHistoryModal(e, userData, onOpenEdit) {
    e.preventDefault();
    const btn = e.target.closest('.open-history-modal-btn');
    const nim = btn.dataset.nim;
    const student = state.allStudents.find(s => s.nim === nim);
    if (!student) return;

    const modal = document.getElementById('transaction-history-modal');
    const transactions = state.kasTransactions
        .filter(t => t.nim === nim)
        .sort((a, b) => b.week - a.week || b.timestamp.seconds - a.timestamp.seconds);

    const canEdit = userData.role && userData.role !== 'mahasiswa';

    modal.innerHTML = `
     <div class="glass-card modal-card p-8 rounded-xl shadow-2xl shadow-black/30 w-full max-w-lg">
       <h3 class="text-2xl font-bold text-fg-primary mb-2">Riwayat Transaksi</h3>
       <p class="text-fg-secondary mb-6">Untuk: <strong>${sanitize(student.name)}</strong></p>
       <div class="max-h-96 overflow-y-auto no-scrollbar">
           ${transactions.length === 0
               ? '<p class="text-fg-tertiary text-center py-4">Tidak ada riwayat.</p>'
               : transactions.map(t => {
                   const paymentInfo = t.paymentMethod === 'Transfer' ? `via ${sanitize(t.bankName || 'Transfer')}` : 'via Tunai';
                   return `
                   <div class="p-3 border-b border-border-default flex justify-between items-start">
                       <div>
                           <p class="font-bold text-fg-primary">${formatCurrency(t.amount)} - Minggu ${t.week}</p>
                           <p class="text-sm text-fg-secondary">Dicatat oleh ${sanitize(t.recordedByName)} (${paymentInfo})</p>
                           <p class="text-xs text-fg-tertiary">${formatDateTime(t.timestamp)}</p>
                       </div>
                       ${canEdit ? `<button data-id="${sanitize(t.id)}" class="open-edit-modal-btn btn-secondary py-1 px-3 rounded-md text-xs font-semibold">Edit</button>` : ''}
                   </div>`;
               }).join('')}
       </div>
       <div class="text-right mt-6">
           <button class="close-modal-btn px-6 py-2 btn-primary rounded-md font-bold">Tutup</button>
       </div>
     </div>`;

    showModal('transaction-history-modal');
    setupModalClose('transaction-history-modal');
    modal.querySelectorAll('.open-edit-modal-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            modal.classList.add('hidden'); // close history modal first
            onOpenEdit(e.target.closest('.open-edit-modal-btn').dataset.id);
        });
    });
}

// ─── Expense Modal ────────────────────────────────────────────────────────────

export function openExpenseModal(onSubmit) {
    const modal = document.getElementById('kas-expense-modal');
    modal.innerHTML = `
        <div class="glass-card modal-card p-8 rounded-xl shadow-2xl shadow-black/30 w-full max-w-md">
            <h3 class="text-2xl font-bold text-fg-primary mb-6">Buat Pengeluaran</h3>
            <form id="expense-form" class="space-y-4">
                <div>
                    <label for="expense-desc" class="block text-sm font-medium text-fg-secondary mb-1">Deskripsi</label>
                    <input type="text" id="expense-desc" name="description" class="w-full py-3 px-4 bg-input border border-border-default rounded-md text-fg-primary" required>
                </div>
                <div>
                    <label for="expense-amount" class="block text-sm font-medium text-fg-secondary mb-1">Jumlah (Rp)</label>
                    <input type="number" id="expense-amount" name="amount" class="w-full py-3 px-4 bg-input border border-border-default rounded-md text-fg-primary" required>
                </div>
                <div>
                    <label for="expense-category" class="block text-sm font-medium text-fg-secondary mb-1">Sumber Dana</label>
                    <select id="expense-category" name="category" class="w-full py-3 px-4 bg-input border border-border-default rounded-md text-fg-primary">
                        <option value="teori_c">Kas Teori C</option>
                        <option value="teori_d">Kas Teori D</option>
                        <option value="angkatan">Kas Angkatan (Dibagi Rata)</option>
                    </select>
                </div>
                <div class="flex items-center justify-end gap-4 pt-4">
                    <button type="button" class="close-modal-btn text-fg-secondary hover:text-fg-primary font-semibold">Batal</button>
                    <button type="submit" class="px-6 py-3 btn-primary rounded-md font-bold">Simpan</button>
                </div>
            </form>
        </div>`;

    showModal('kas-expense-modal');
    setupModalClose('kas-expense-modal');
    document.getElementById('expense-form').addEventListener('submit', onSubmit);
}

// ─── Add Student Modal ────────────────────────────────────────────────────────

export function openAddStudentModal(onSubmit) {
    const modal = document.getElementById('add-student-modal');
    modal.innerHTML = `
        <div class="glass-card modal-card p-8 rounded-xl shadow-2xl shadow-black/30 w-full max-w-md">
            <h3 class="text-2xl font-bold text-fg-primary mb-6">Tambah Anggota Baru</h3>
            <form id="add-student-form" class="space-y-4">
                <div><label class="block text-sm text-fg-secondary mb-1">NIM</label><input type="text" name="nim" class="w-full p-2 bg-input border border-border-default rounded-md text-fg-primary" required></div>
                <div><label class="block text-sm text-fg-secondary mb-1">Nama Lengkap</label><input type="text" name="name" class="w-full p-2 bg-input border border-border-default rounded-md text-fg-primary" required></div>
                <div><label class="block text-sm text-fg-secondary mb-1">Email</label><input type="email" name="email" class="w-full p-2 bg-input border border-border-default rounded-md text-fg-primary" required></div>
                <div><label class="block text-sm text-fg-secondary mb-1">Kelas Praktik (C1, C2, D1, D2)</label><input type="text" name="practiceClass" class="w-full p-2 bg-input border border-border-default rounded-md text-fg-primary" required pattern="[CDcd][12]"></div>
                <div class="flex justify-end gap-4 pt-2">
                    <button type="button" class="close-modal-btn text-fg-secondary font-semibold">Batal</button>
                    <button type="submit" class="px-6 py-2 btn-primary font-bold rounded-md">Tambah</button>
                </div>
            </form>
        </div>`;

    showModal('add-student-modal');
    setupModalClose('add-student-modal');
    document.getElementById('add-student-form').addEventListener('submit', onSubmit);
}

// ─── Manage Roles Modal ───────────────────────────────────────────────────────

export function openManageRolesModal(onSubmit) {
    const modal = document.getElementById('manage-roles-modal');
    const options = state.allStudents.map(s => 
        `<option value="${s.nim}">${sanitize(s.name)} (${sanitize(s.practiceClass)})</option>`
    ).join('');

    modal.innerHTML = `
        <div class="glass-card modal-card p-8 rounded-xl shadow-2xl shadow-black/30 w-full max-w-md">
            <h3 class="text-2xl font-bold text-fg-primary mb-6">Tunjuk Bendahara</h3>
            <form id="set-role-form" class="space-y-4">
                <div>
                    <label class="block text-sm text-fg-secondary mb-1">Pilih Anggota</label>
                    <select name="nim" class="w-full p-2 bg-input border border-border-default rounded-md text-fg-primary">${options}</select>
                </div>
                <div>
                    <label class="block text-sm text-fg-secondary mb-1">Pilih Jabatan</label>
                    <select name="role" class="w-full p-2 bg-input border border-border-default rounded-md text-fg-primary">
                        <option value="bendahara_teori">Bendahara Teori</option>
                        <option value="bendahara_praktik">Bendahara Praktik</option>
                    </select>
                </div>
                <div class="flex justify-end gap-4 pt-2">
                    <button type="button" class="close-modal-btn text-fg-secondary font-semibold">Batal</button>
                    <button type="submit" class="px-6 py-2 btn-primary font-bold rounded-md">Simpan</button>
                </div>
            </form>
        </div>`;

    showModal('manage-roles-modal');
    setupModalClose('manage-roles-modal');
    document.getElementById('set-role-form').addEventListener('submit', onSubmit);
}

// ─── Warning Modal ────────────────────────────────────────────────────────────

export function openWarningModal(onSubmit) {
    const modal = document.getElementById('manage-warnings-modal');
    // Hanya tampilkan mahasiswa yang belum punya peringatan aktif (opsional, tapi lebih baik semua agar bisa nimpa)
    const studentOptions = state.allStudents.map(s =>
        `<option value="${sanitize(s.nim)}">${sanitize(s.name)} (${sanitize(s.nim)})</option>`
    ).join('');

    modal.innerHTML = `
        <div class="glass-card modal-card p-8 rounded-xl border border-danger/50 shadow-[0_0_20px_rgba(239,68,68,0.2)] bg-input w-full max-w-md">
            <div class="flex items-center gap-3 mb-6">
                <svg class="w-8 h-8 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                <h3 class="text-2xl font-bold text-danger">Peringatan Keras</h3>
            </div>
            <p class="text-fg-secondary text-sm mb-6">Label merah dan catatan akan tertampil secara publik di sebelah nama anggota pada tabel kas.</p>
            <form id="set-warning-form" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-fg-secondary mb-1">Pilih Anggota</label>
                    <select name="nim" class="w-full p-2 bg-input border border-border-default rounded-md text-fg-primary">${studentOptions}</select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-fg-secondary mb-1">Catatan Peringatan</label>
                    <textarea name="message" rows="3" class="w-full p-3 bg-input border border-danger/50 focus:border-danger/50 rounded-md text-fg-primary" required placeholder="Contoh: Belum bayar kas 15 minggu, harap segera lapor."></textarea>
                </div>
                <div class="flex justify-end gap-4 pt-4">
                    <button type="button" class="close-modal-btn text-fg-secondary font-semibold hover:text-fg-primary transition-colors">Batal</button>
                    <button type="submit" class="px-6 py-2 bg-red-600 hover:bg-red-700 text-fg-primary font-bold rounded-md transition-colors">Sematan</button>
                </div>
            </form>
        </div>`;

    showModal('manage-warnings-modal');
    setupModalClose('manage-warnings-modal');
    document.getElementById('set-warning-form').addEventListener('submit', onSubmit);
}

// ─── Create Event Modal ───────────────────────────────────────────────────────

export function openCreateEventModal(onSubmit) {
    const modal = document.getElementById('create-event-modal');
    modal.innerHTML = `
        <div class="glass-card modal-card p-8 rounded-xl shadow-2xl shadow-black/30 w-full max-w-md">
            <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 rounded-lg bg-accent-subtle flex items-center justify-center">
                    <svg class="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                </div>
                <h3 class="text-2xl font-bold text-fg-primary">Buat Kegiatan Baru</h3>
            </div>
            <form id="create-event-form" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-fg-secondary mb-1">Nama Kegiatan *</label>
                    <input type="text" name="event_name" class="w-full py-3 px-4 bg-input border border-border-default rounded-md text-fg-primary" required placeholder="Contoh: Kunjungan Industri 2026">
                </div>
                <div>
                    <label class="block text-sm font-medium text-fg-secondary mb-1">Target Per Mahasiswa (Rp) *</label>
                    <input type="number" name="target_per_student" class="w-full py-3 px-4 bg-input border border-border-default rounded-md text-fg-primary" required min="1000" step="1000" placeholder="350000">
                </div>
                <div>
                    <label class="block text-sm font-medium text-fg-secondary mb-1">Tenggat Waktu (opsional)</label>
                    <input type="date" name="deadline" class="w-full py-3 px-4 bg-input border border-border-default rounded-md text-fg-primary">
                </div>
                <div class="flex items-center justify-end gap-4 pt-4">
                    <button type="button" class="close-modal-btn text-fg-secondary hover:text-fg-primary font-semibold">Batal</button>
                    <button type="submit" class="px-6 py-3 btn-primary rounded-md font-bold">Buat Kegiatan</button>
                </div>
            </form>
        </div>`;

    showModal('create-event-modal');
    setupModalClose('create-event-modal');
    document.getElementById('create-event-form').addEventListener('submit', onSubmit);
}

// ─── Event Payment Modal ──────────────────────────────────────────────────────

export function openEventPaymentModal(eventId, nim, studentName, remaining, onSubmit) {
    const modal = document.getElementById('event-payment-modal');
    modal.innerHTML = `
        <div class="glass-card modal-card p-8 rounded-xl shadow-2xl shadow-black/30 w-full max-w-md">
            <h3 class="text-2xl font-bold text-fg-primary mb-2">Input Cicilan Kegiatan</h3>
            <p class="text-fg-secondary mb-1">Untuk: <strong>${sanitize(studentName)}</strong></p>
            <p class="text-sm text-accent mb-6">Sisa kekurangan: <strong>Rp ${remaining.toLocaleString('id-ID')}</strong></p>
            <form id="event-payment-form">
                <input type="hidden" name="eventId" value="${eventId}">
                <input type="hidden" name="nim" value="${sanitize(nim)}">
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-fg-secondary mb-1">Jumlah Cicilan (Rp)</label>
                        <input type="number" name="amount" class="w-full py-3 px-4 bg-input border border-border-default rounded-md text-fg-primary" required min="1000" step="1000" max="${remaining}">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-fg-secondary mb-2">Metode Pembayaran</label>
                        <div class="flex gap-4">
                            <label class="flex items-center gap-2 p-3 bg-input border border-border-default rounded-md flex-1 cursor-pointer has-[:checked]:border-blue-500 has-[:checked]:bg-accent-subtle">
                                <input type="radio" name="paymentMethod" value="Cash" class="accent-blue-500" checked> Tunai
                            </label>
                            <label class="flex items-center gap-2 p-3 bg-input border border-border-default rounded-md flex-1 cursor-pointer has-[:checked]:border-blue-500 has-[:checked]:bg-accent-subtle">
                                <input type="radio" name="paymentMethod" value="Transfer" class="accent-blue-500"> Transfer
                            </label>
                        </div>
                    </div>
                    <div id="event-bank-name-container" class="hidden">
                        <label class="block text-sm font-medium text-fg-secondary mb-1">Nama Bank Pengirim</label>
                        <input type="text" name="bankName" class="w-full py-3 px-4 bg-input border border-border-default rounded-md text-fg-primary" placeholder="Contoh: BCA, BNI, Dana">
                    </div>
                </div>
                <div class="flex items-center justify-end gap-4 mt-8">
                    <button type="button" class="close-modal-btn text-fg-secondary hover:text-fg-primary font-semibold">Batal</button>
                    <button type="submit" class="px-6 py-3 btn-primary rounded-md font-bold">Simpan</button>
                </div>
            </form>
        </div>`;

    showModal('event-payment-modal');
    setupModalClose('event-payment-modal');

    const form = document.getElementById('event-payment-form');
    form.addEventListener('submit', onSubmit);
    form.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            document.getElementById('event-bank-name-container').classList.toggle('hidden', e.target.value !== 'Transfer');
        });
    });
}

// ─── Event Payment History Modal ──────────────────────────────────────────────

export function openEventPaymentHistoryModal(e, userData, onOpenEdit) {
    e.preventDefault();
    const btn = e.target.closest('.open-event-history-btn');
    const nim = btn.dataset.nim;
    const eventId = btn.dataset.eventId;
    const studentName = btn.dataset.name;

    const event = state.events.find(ev => ev.id === eventId);
    if (!event) return;

    const student = state.allStudents.find(s => s.nim === nim);
    const displayName = student ? student.name : studentName;

    const modal = document.getElementById('transaction-history-modal');
    const studentPayments = state.eventPayments
        .filter(p => p.nim === nim && p.eventId === eventId)
        .sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));

    const total = studentPayments.reduce((sum, p) => sum + p.amount, 0);
    const target = event.targetPerStudent;
    const progress = target > 0 ? Math.min((total / target) * 100, 100) : 0;
    const isLunas = total >= target;

    const canEdit = userData && (userData.role === 'bendahara_angkatan' || userData.role === 'bendahara_teori');

    modal.innerHTML = `
        <div class="glass-card modal-card p-8 rounded-xl shadow-2xl shadow-black/30 w-full max-w-lg">
            <h3 class="text-2xl font-bold text-fg-primary mb-2">Riwayat Cicilan Kegiatan</h3>
            <p class="text-fg-secondary mb-1">Untuk: <strong>${sanitize(displayName)}</strong></p>
            <p class="text-sm text-fg-tertiary mb-1">Kegiatan: <span class="text-accent font-semibold">${sanitize(event.name)}</span></p>
            <div class="flex items-center gap-3 mb-4 mt-3">
                <div class="flex-1 h-2 bg-elevated rounded-full overflow-hidden">
                    <div class="h-full ${isLunas ? 'bg-accent' : 'bg-accent'} rounded-full transition-all" style="width: ${progress}%"></div>
                </div>
                <span class="text-sm font-bold ${isLunas ? 'text-accent' : 'text-warning'} whitespace-nowrap">${isLunas ? 'Lunas ✓' : `${Math.round(progress)}%`}</span>
            </div>
            <p class="text-sm text-accent mb-6">Total dibayar: <strong>Rp ${total.toLocaleString('id-ID')}</strong> / Rp ${target.toLocaleString('id-ID')}</p>
            <div class="max-h-80 overflow-y-auto no-scrollbar">
                ${studentPayments.length === 0
                    ? '<p class="text-fg-tertiary text-center py-4">Belum ada cicilan yang dicatat.</p>'
                    : studentPayments.map(p => {
                        const paymentInfo = p.paymentMethod === 'Transfer' ? `via ${sanitize(p.bankName || 'Transfer')}` : 'via Tunai';
                        return `
                        <div class="p-3 border-b border-border-default flex justify-between items-start">
                            <div>
                                <p class="font-bold text-fg-primary">${formatCurrency(p.amount)}</p>
                                <p class="text-sm text-fg-secondary">Dicatat oleh ${sanitize(p.recordedByName)} (${paymentInfo})</p>
                                <p class="text-xs text-fg-tertiary">${formatDateTime(p.timestamp)}</p>
                            </div>
                            ${canEdit ? `
                            <div class="flex gap-2 ml-3 flex-shrink-0">
                                <button data-id="${sanitize(p.id)}" data-amount="${p.amount}" class="open-edit-event-payment-btn btn-secondary py-1 px-3 rounded-md text-xs font-semibold">Edit</button>
                            </div>` : ''}
                        </div>`;
                    }).join('')}
            </div>
            <div class="text-right mt-6">
                <button class="close-modal-btn px-6 py-2 btn-primary rounded-md font-bold">Tutup</button>
            </div>
        </div>`;

    showModal('transaction-history-modal');
    setupModalClose('transaction-history-modal');

    // Wire edit buttons — same pattern as kas angkatan
    modal.querySelectorAll('.open-edit-event-payment-btn').forEach(editBtn => {
        editBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
            onOpenEdit(editBtn.dataset.id, parseInt(editBtn.dataset.amount));
        });
    });
}

// ─── Edit Event Target Modal ──────────────────────────────────────────────────

export function openEditEventTargetModal(eventId, currentTarget, onSubmit) {
    const modal = document.getElementById('create-event-modal');
    modal.innerHTML = `
        <div class="glass-card modal-card p-8 rounded-xl shadow-2xl shadow-black/30 w-full max-w-md">
            <h3 class="text-2xl font-bold text-fg-primary mb-2">Ubah Target Iuran</h3>
            <p class="text-fg-secondary text-sm mb-6">Target saat ini: <strong>Rp ${currentTarget.toLocaleString('id-ID')}</strong>/orang</p>
            <form id="edit-event-target-form">
                <input type="hidden" name="eventId" value="${eventId}">
                <div>
                    <label class="block text-sm font-medium text-fg-secondary mb-1">Target Baru Per Mahasiswa (Rp)</label>
                    <input type="number" name="new_target" class="w-full py-3 px-4 bg-input border border-border-default rounded-md text-fg-primary" required min="1000" step="1000" value="${currentTarget}">
                </div>
                <p class="text-xs text-warning/70 mt-2">⚠ Mengubah target akan mempengaruhi perhitungan progress semua mahasiswa.</p>
                <div class="flex items-center justify-end gap-4 pt-6">
                    <button type="button" class="close-modal-btn text-fg-secondary hover:text-fg-primary font-semibold">Batal</button>
                    <button type="submit" class="px-6 py-3 btn-primary rounded-md font-bold">Simpan Perubahan</button>
                </div>
            </form>
        </div>`;

    showModal('create-event-modal');
    setupModalClose('create-event-modal');
    document.getElementById('edit-event-target-form').addEventListener('submit', onSubmit);
}

// ─── Manage Event Participants Modal ──────────────────────────────────────────

export function openManageEventParticipantsModal(eventId, excludedNims, onToggle) {
    const modal = document.getElementById('create-event-modal');
    const excluded = new Set(excludedNims || []);

    const studentRows = state.allStudents.map(s => {
        const isExcluded = excluded.has(s.nim);
        return `
            <div class="flex items-center justify-between p-3 border-b border-border-default last:border-0">
                <div>
                    <p class="text-fg-primary font-medium text-sm">${sanitize(s.name)}</p>
                    <p class="text-xs text-fg-tertiary">${s.practiceClass} — ${sanitize(s.nim)}</p>
                </div>
                <button data-nim="${sanitize(s.nim)}" data-excluded="${isExcluded}" class="toggle-participant-btn px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    isExcluded
                        ? 'border border-gray-600 text-fg-secondary hover:text-fg-primary hover:border-blue-500'
                        : 'bg-accent-subtle text-accent border border-border-accent hover:bg-accent hover:text-danger/80 hover:border-danger/50'
                }">${isExcluded ? 'Masukkan' : 'Kecualikan'}</button>
            </div>`;
    }).join('');

    modal.innerHTML = `
        <div class="glass-card modal-card p-8 rounded-xl shadow-2xl shadow-black/30 w-full max-w-lg">
            <h3 class="text-2xl font-bold text-fg-primary mb-2">Kelola Peserta Kegiatan</h3>
            <p class="text-fg-secondary text-sm mb-4">Kecualikan mahasiswa yang tidak mengikuti kegiatan ini. Mahasiswa yang dikecualikan tidak akan muncul di tabel cicilan.</p>
            <p class="text-xs text-accent mb-4">${excluded.size} mahasiswa dikecualikan dari ${state.allStudents.length} total</p>
            <div class="max-h-96 overflow-y-auto no-scrollbar">
                ${studentRows}
            </div>
            <div class="text-right mt-6">
                <button class="close-modal-btn px-6 py-2 btn-primary rounded-md font-bold">Tutup</button>
            </div>
        </div>`;

    showModal('create-event-modal');
    setupModalClose('create-event-modal');

    // Attach toggle handlers
    modal.querySelectorAll('.toggle-participant-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const nim = btn.dataset.nim;
            const isCurrentlyExcluded = btn.dataset.excluded === 'true';
            onToggle(eventId, nim, !isCurrentlyExcluded);
        });
    });
}

// ─── Edit Event Payment Modal ─────────────────────────────────────────────────

export function openEditEventPaymentModal(paymentId, currentAmount, onSubmit) {
    const modal = document.getElementById('event-payment-modal');
    modal.innerHTML = `
        <div class="glass-card modal-card p-8 rounded-xl shadow-2xl shadow-black/30 w-full max-w-md">
            <h3 class="text-2xl font-bold text-fg-primary mb-2">Edit Cicilan</h3>
            <p class="text-fg-secondary mb-6">Nominal saat ini: <strong>Rp ${currentAmount.toLocaleString('id-ID')}</strong></p>
            <form id="edit-event-payment-form">
                <input type="hidden" name="paymentId" value="${sanitize(paymentId)}">
                <div>
                    <label class="block text-sm font-medium text-fg-secondary mb-1">Jumlah Baru (Rp)</label>
                    <input type="number" name="amount" class="w-full py-3 px-4 bg-input border border-border-default rounded-md text-fg-primary" required min="0" step="1000" value="${currentAmount}">
                    <p class="text-xs text-fg-tertiary mt-1.5">💡 Isi <strong class="text-fg-primary">0</strong> untuk menghapus entri cicilan ini.</p>
                </div>
                <div class="flex items-center justify-end gap-4 mt-8">
                    <button type="button" class="close-modal-btn text-fg-secondary hover:text-fg-primary font-semibold">Batal</button>
                    <button type="submit" class="px-6 py-3 btn-primary rounded-md font-bold">Simpan Perubahan</button>
                </div>
            </form>
        </div>`;

    showModal('event-payment-modal');
    setupModalClose('event-payment-modal');
    document.getElementById('edit-event-payment-form').addEventListener('submit', onSubmit);
}
