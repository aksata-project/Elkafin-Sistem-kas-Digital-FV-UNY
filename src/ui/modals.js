import { state, getWeeklyTarget } from '../store/state.js';
import { sanitize } from '../utils/sanitize.js';
import { formatCurrency, formatDateTime } from '../utils/format.js';

// ─── Kas Input Modal ──────────────────────────────────────────────────────────

export function openKasModal(e, onSubmit) {
    const btn = e.target.closest('.open-kas-modal-btn');
    const nim = btn.dataset.nim;
    const name = btn.dataset.name;
    const week = document.getElementById('kas-filter-week').value;
    const modal = document.getElementById('kas-input-modal');

    modal.innerHTML = `
      <div class="glass-card p-8 rounded-2xl shadow-2xl shadow-black/30 w-full max-w-md">
        <h3 class="text-2xl font-bold text-white mb-2">Input Setoran Kas</h3>
        <p class="text-gray-400 mb-6">Untuk: <strong>${sanitize(name)}</strong> (Mulai dari Minggu ke-${sanitize(week)})</p>
        <form id="kas-form">
            <input type="hidden" name="nim" value="${sanitize(nim)}">
            <input type="hidden" name="week" value="${sanitize(week)}">
            <div class="space-y-4">
                <div>
                    <label for="amount" class="block text-sm font-medium text-gray-400 mb-1">Jumlah Setoran (Rp)</label>
                    <input type="number" id="amount" name="amount" class="w-full py-3 px-4 bg-gray-900 border border-gray-700 rounded-lg text-white" required step="1000" max="5000000">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-400 mb-2">Metode Pembayaran</label>
                    <div class="flex gap-4">
                        <label class="flex items-center gap-2 p-3 bg-gray-900 border border-gray-700 rounded-lg flex-1 cursor-pointer has-[:checked]:border-blue-500 has-[:checked]:bg-blue-500/10">
                            <input type="radio" name="paymentMethod" value="Cash" class="accent-blue-500" checked> Tunai
                        </label>
                        <label class="flex items-center gap-2 p-3 bg-gray-900 border border-gray-700 rounded-lg flex-1 cursor-pointer has-[:checked]:border-blue-500 has-[:checked]:bg-blue-500/10">
                            <input type="radio" name="paymentMethod" value="Transfer" class="accent-blue-500"> Transfer
                        </label>
                    </div>
                </div>
                <div id="bank-name-container" class="hidden">
                    <label for="bankName" class="block text-sm font-medium text-gray-400 mb-1">Nama Bank Pengirim</label>
                    <input type="text" id="bankName" name="bankName" class="w-full py-3 px-4 bg-gray-900 border border-gray-700 rounded-lg text-white" placeholder="Contoh: BCA, BNI, Dana">
                </div>
            </div>
            <div class="flex items-center justify-end gap-4 mt-8">
                <button type="button" class="close-modal-btn text-gray-400 hover:text-white font-semibold">Batal</button>
                <button type="submit" class="px-6 py-3 btn-primary rounded-lg font-bold">Simpan</button>
            </div>
        </form>
      </div>`;

    modal.classList.remove('hidden');
    modal.querySelector('.close-modal-btn').addEventListener('click', () => modal.classList.add('hidden'));

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
      <div class="glass-card p-8 rounded-2xl shadow-2xl shadow-black/30 w-full max-w-md">
        <h3 class="text-2xl font-bold text-white mb-2">Edit Setoran Kas</h3>
        <p class="text-gray-400 mb-6">Minggu ke-${sanitize(String(transaction.week))}</p>
        <form id="kas-edit-form">
            <input type="hidden" name="id" value="${sanitize(transaction.id)}">
            <div class="space-y-4">
                <div>
                    <label for="edit-amount" class="block text-sm font-medium text-gray-400 mb-1">Jumlah Setoran (Rp)</label>
                    <input type="number" id="edit-amount" name="amount" class="w-full py-3 px-4 bg-gray-900 border border-gray-700 rounded-lg text-white" value="${transaction.amount}" required step="1000">
                </div>
            </div>
            <div class="flex items-center justify-end gap-4 mt-8">
                <button type="button" class="close-modal-btn text-gray-400 hover:text-white font-semibold">Batal</button>
                <button type="submit" class="px-6 py-3 btn-primary rounded-lg font-bold">Simpan Perubahan</button>
            </div>
        </form>
      </div>`;

    modal.classList.remove('hidden');
    modal.querySelector('.close-modal-btn').addEventListener('click', () => modal.classList.add('hidden'));
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
     <div class="glass-card p-8 rounded-2xl shadow-2xl shadow-black/30 w-full max-w-lg">
       <h3 class="text-2xl font-bold text-white mb-2">Riwayat Transaksi</h3>
       <p class="text-gray-400 mb-6">Untuk: <strong>${sanitize(student.name)}</strong></p>
       <div class="max-h-96 overflow-y-auto no-scrollbar">
           ${transactions.length === 0
               ? '<p class="text-gray-500 text-center py-4">Tidak ada riwayat.</p>'
               : transactions.map(t => {
                   const paymentInfo = t.paymentMethod === 'Transfer' ? `via ${sanitize(t.bankName || 'Transfer')}` : 'via Tunai';
                   return `
                   <div class="p-3 border-b border-gray-800 flex justify-between items-start">
                       <div>
                           <p class="font-bold text-white">${formatCurrency(t.amount)} - Minggu ke-${t.week}</p>
                           <p class="text-sm text-gray-400">Dicatat oleh ${sanitize(t.recordedByName)} (${paymentInfo})</p>
                           <p class="text-xs text-gray-500">${formatDateTime(t.timestamp)}</p>
                       </div>
                       ${canEdit ? `<button data-id="${sanitize(t.id)}" class="open-edit-modal-btn btn-secondary py-1 px-3 rounded-lg text-xs font-semibold">Edit</button>` : ''}
                   </div>`;
               }).join('')}
       </div>
       <div class="text-right mt-6">
           <button class="close-modal-btn px-6 py-2 btn-primary rounded-lg font-bold">Tutup</button>
       </div>
     </div>`;

    modal.classList.remove('hidden');
    modal.querySelector('.close-modal-btn').addEventListener('click', () => modal.classList.add('hidden'));
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
        <div class="glass-card p-8 rounded-2xl shadow-2xl shadow-black/30 w-full max-w-md">
            <h3 class="text-2xl font-bold text-white mb-6">Buat Pengeluaran</h3>
            <form id="expense-form" class="space-y-4">
                <div>
                    <label for="expense-desc" class="block text-sm font-medium text-gray-400 mb-1">Deskripsi</label>
                    <input type="text" id="expense-desc" name="description" class="w-full py-3 px-4 bg-gray-900 border border-gray-700 rounded-lg text-white" required>
                </div>
                <div>
                    <label for="expense-amount" class="block text-sm font-medium text-gray-400 mb-1">Jumlah (Rp)</label>
                    <input type="number" id="expense-amount" name="amount" class="w-full py-3 px-4 bg-gray-900 border border-gray-700 rounded-lg text-white" required>
                </div>
                <div>
                    <label for="expense-category" class="block text-sm font-medium text-gray-400 mb-1">Sumber Dana</label>
                    <select id="expense-category" name="category" class="w-full py-3 px-4 bg-gray-900 border border-gray-700 rounded-lg text-white">
                        <option value="teori_c">Kas Teori C</option>
                        <option value="teori_d">Kas Teori D</option>
                        <option value="angkatan">Kas Angkatan (Dibagi Rata)</option>
                    </select>
                </div>
                <div class="flex items-center justify-end gap-4 pt-4">
                    <button type="button" class="close-modal-btn text-gray-400 hover:text-white font-semibold">Batal</button>
                    <button type="submit" class="px-6 py-3 btn-primary rounded-lg font-bold">Simpan</button>
                </div>
            </form>
        </div>`;

    modal.classList.remove('hidden');
    modal.querySelector('.close-modal-btn').addEventListener('click', () => modal.classList.add('hidden'));
    document.getElementById('expense-form').addEventListener('submit', onSubmit);
}

// ─── Add Student Modal ────────────────────────────────────────────────────────

export function openAddStudentModal(onSubmit) {
    const modal = document.getElementById('add-student-modal');
    modal.innerHTML = `
        <div class="glass-card p-8 rounded-2xl shadow-2xl shadow-black/30 w-full max-w-md">
            <h3 class="text-2xl font-bold text-white mb-6">Tambah Anggota Baru</h3>
            <form id="add-student-form" class="space-y-4">
                <div><label class="block text-sm text-gray-400 mb-1">NIM</label><input type="text" name="nim" class="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-white" required></div>
                <div><label class="block text-sm text-gray-400 mb-1">Nama Lengkap</label><input type="text" name="name" class="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-white" required></div>
                <div><label class="block text-sm text-gray-400 mb-1">Email</label><input type="email" name="email" class="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-white" required></div>
                <div><label class="block text-sm text-gray-400 mb-1">Kelas Praktik (C1, C2, D1, D2)</label><input type="text" name="practiceClass" class="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-white" required pattern="[CDcd][12]"></div>
                <div class="flex justify-end gap-4 pt-2">
                    <button type="button" class="close-modal-btn text-gray-400 font-semibold">Batal</button>
                    <button type="submit" class="px-6 py-2 btn-primary font-bold rounded-lg">Tambah</button>
                </div>
            </form>
        </div>`;

    modal.classList.remove('hidden');
    modal.querySelector('.close-modal-btn').addEventListener('click', () => modal.classList.add('hidden'));
    document.getElementById('add-student-form').addEventListener('submit', onSubmit);
}

// ─── Manage Roles Modal ───────────────────────────────────────────────────────

export function openManageRolesModal(onSubmit) {
    const modal = document.getElementById('manage-roles-modal');
    const studentOptions = state.allStudents.map(s =>
        `<option value="${sanitize(s.nim)}">${sanitize(s.name)} (${sanitize(s.nim)})</option>`
    ).join('');

    modal.innerHTML = `
        <div class="glass-card p-8 rounded-2xl shadow-2xl shadow-black/30 w-full max-w-md">
            <h3 class="text-2xl font-bold text-white mb-6">Tunjuk Bendahara</h3>
            <form id="set-role-form" class="space-y-4">
                <div>
                    <label class="block text-sm text-gray-400 mb-1">Pilih Anggota</label>
                    <select name="nim" class="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-white">${studentOptions}</select>
                </div>
                <div>
                    <label class="block text-sm text-gray-400 mb-1">Pilih Jabatan</label>
                    <select name="role" class="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-white">
                        <option value="bendahara_teori">Bendahara Teori</option>
                        <option value="bendahara_praktik">Bendahara Praktik</option>
                    </select>
                </div>
                <div class="flex justify-end gap-4 pt-2">
                    <button type="button" class="close-modal-btn text-gray-400 font-semibold">Batal</button>
                    <button type="submit" class="px-6 py-2 btn-primary font-bold rounded-lg">Simpan</button>
                </div>
            </form>
        </div>`;

    modal.classList.remove('hidden');
    modal.querySelector('.close-modal-btn').addEventListener('click', () => modal.classList.add('hidden'));
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
        <div class="glass-card p-8 rounded-2xl border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.2)] bg-gray-900 w-full max-w-md">
            <div class="flex items-center gap-3 mb-6">
                <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                <h3 class="text-2xl font-bold text-red-500">Peringatan Keras</h3>
            </div>
            <p class="text-gray-400 text-sm mb-6">Label merah dan catatan akan tertampil secara publik di sebelah nama anggota pada tabel kas.</p>
            <form id="set-warning-form" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-400 mb-1">Pilih Anggota</label>
                    <select name="nim" class="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-white">${studentOptions}</select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-400 mb-1">Catatan Peringatan</label>
                    <textarea name="message" rows="3" class="w-full p-3 bg-gray-900 border border-red-500/50 focus:border-red-500 rounded-lg text-white" required placeholder="Contoh: Belum bayar kas 15 minggu, harap segera lapor."></textarea>
                </div>
                <div class="flex justify-end gap-4 pt-4">
                    <button type="button" class="close-modal-btn text-gray-400 font-semibold hover:text-white transition-colors">Batal</button>
                    <button type="submit" class="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors">Sematan</button>
                </div>
            </form>
        </div>`;

    modal.classList.remove('hidden');
    modal.querySelector('.close-modal-btn').addEventListener('click', () => modal.classList.add('hidden'));
    document.getElementById('set-warning-form').addEventListener('submit', onSubmit);
}
