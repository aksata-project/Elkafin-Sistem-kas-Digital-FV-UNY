import { collection, addDoc, doc, writeBatch, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config.js';
import { state, getWeeklyTarget } from '../store/state.js';
import { showAlert, showToast } from '../utils/toast.js';
import { logActivity } from '../utils/logger.js';

/**
 * Handle quick-pay (instant cash payment for current week).
 */
export async function handleQuickPay(e, currentUser, userData) {
    e.preventDefault();
    const btn = e.target.closest('.quick-pay-btn');
    const nim = btn.dataset.nim;
    const week = parseInt(document.getElementById('kas-filter-week').value);
    const amount = getWeeklyTarget(week);

    const originalContent = btn.innerHTML;
    btn.innerHTML = `<div class="animate-spin rounded-full h-3 w-3 border-2 border-white"></div>`;
    btn.disabled = true;

    try {
        await addDoc(collection(db, 'kas_transactions'), {
            nim, week, amount,
            paymentMethod: 'Cash',
            bankName: null,
            recordedBy: currentUser.uid,
            recordedByName: userData.displayName,
            timestamp: serverTimestamp()
        });
        await logActivity('CREATE', 'KAS', `Menerima uang kas (Cepat) dari ${nim} untuk Minggu ${week}`, amount);
        showToast('success', 'Pembayaran kas berhasil dicatat.');
    } catch (error) {
        showAlert('error', 'Gagal', `Gagal mencatat Quick Pay: ${error.message}`);
        btn.innerHTML = originalContent;
        btn.disabled = false;
    }
}

/**
 * Handle the full kas input form submission (supports multi-week rollover).
 */
export async function handleAddKas(e, currentUser, userData) {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Menyimpan...';

    const formData = new FormData(e.target);
    const nim = formData.get('nim');
    let remainingAmount = parseInt(formData.get('amount'));
    let currentWeek = parseInt(formData.get('week'));

    if (isNaN(remainingAmount) || remainingAmount <= 0) {
        showAlert('error', 'Gagal', 'Jumlah setoran tidak valid.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Simpan';
        return;
    }

    const paymentMethod = formData.get('paymentMethod');
    const bankName = paymentMethod === 'Transfer' ? formData.get('bankName') : null;
    const batch = writeBatch(db);

    try {
        while (remainingAmount > 0) {
            const target = getWeeklyTarget(currentWeek);
            const amountForThisWeek = Math.min(remainingAmount, target);
            const data = {
                nim, week: currentWeek, amount: amountForThisWeek,
                paymentMethod, bankName,
                recordedBy: currentUser.uid,
                recordedByName: userData.displayName,
                timestamp: serverTimestamp()
            };
            batch.set(doc(collection(db, 'kas_transactions')), data);
            remainingAmount -= amountForThisWeek;
            currentWeek++;
        }
        await batch.commit();
        await logActivity('CREATE', 'KAS', `Menerima setoran kas sebesar Rp ${parseInt(formData.get('amount')).toLocaleString('id-ID')} dari ${nim}`, parseInt(formData.get('amount')));
        document.getElementById('kas-input-modal').classList.add('hidden');
        showToast('success', 'Setoran kas berhasil dicatat.');
    } catch (error) {
        showAlert('error', 'Gagal', `Gagal mencatat setoran: ${error.message}`);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Simpan';
    }
}

/**
 * Handle editing an existing kas transaction.
 */
export async function handleUpdateKas(e) {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Menyimpan...';

    const formData = new FormData(e.target);
    const transactionId = formData.get('id');
    const newAmount = parseInt(formData.get('amount'));

    const transaction = state.kasTransactions.find(t => t.id === transactionId);
    const maxAllowed = transaction ? getWeeklyTarget(transaction.week) : 5000;

    // Validasi: 0 diizinkan untuk menghapus, tapi tidak boleh negatif atau melebihi target minggu tersebut
    if (isNaN(newAmount) || newAmount < 0 || newAmount > maxAllowed) {
        showAlert('error', 'Gagal', `Jumlah tidak valid (0 - Rp ${maxAllowed.toLocaleString('id-ID')}).`);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Simpan Perubahan';
        return;
    }

    try {
        if (newAmount === 0) {
            // Jika nominal disetel ke 0, hapus transaksi tersebut secara otomatis
            await deleteDoc(doc(db, 'kas_transactions', transactionId));
            await logActivity('DELETE', 'KAS', `Menghapus transaksi kas milik ${transaction.nim} pada Minggu ${transaction.week}`);
            showToast('success', 'Transaksi telah dihapus (nominal 0).');
        } else {
            // Jika nominal > 0, perbarui nilai transaksi
            await updateDoc(doc(db, 'kas_transactions', transactionId), { amount: newAmount });
            await logActivity('UPDATE', 'KAS', `Mengubah setoran kas milik ${transaction.nim} pada Minggu ${transaction.week} menjadi Rp ${newAmount.toLocaleString('id-ID')}`, newAmount);
            showToast('success', 'Setoran kas telah diperbarui.');
        }
        
        document.getElementById('kas-edit-modal').classList.add('hidden');
        document.getElementById('transaction-history-modal').classList.add('hidden');
    } catch (error) {
        showAlert('error', 'Gagal', 'Gagal memproses transaksi.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Simpan Perubahan';
    }
}

// Manual week handlers removed — weeks are now auto-calculated from semester.startDate
