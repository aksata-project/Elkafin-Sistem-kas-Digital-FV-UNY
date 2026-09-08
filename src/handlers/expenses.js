import { collection, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config.js';
import { state } from '../store/state.js';
import { showAlert, showToast, showConfirm } from '../utils/toast.js';
import { findStudentByNim } from '../ui/navigation.js';
import { logActivity } from '../utils/logger.js';

/**
 * Handle submitting the add expense form.
 */
export async function handleAddExpense(e, currentUser, userData) {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Menyimpan...';

    const formData = new FormData(e.target);
    const amount = parseInt(formData.get('amount'));
    const category = formData.get('category');

    let incomeC = state.carryOver.teori_c || 0;
    let incomeD = state.carryOver.teori_d || 0;
    const carryOverAngkatan = state.carryOver.angkatan || 0;

    // Build inactive NIM set for exclusion
    const inactiveNims = new Set(state.inactiveStudents.map(s => s.nim));

    state.kasTransactions.forEach(p => {
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

    let balance = 0;
    if (category === 'teori_c') balance = finalC;
    else if (category === 'teori_d') balance = finalD;
    else if (category === 'angkatan') balance = total;
    if (amount > balance) {
        const { formatCurrency } = await import('../utils/format.js');
        showAlert('error', 'Gagal', `Saldo tidak mencukupi. Saldo tersisa: ${formatCurrency(balance)}`);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Simpan';
        return;
    }

    try {
        await addDoc(collection(db, 'kas_expenses'), {
            description: formData.get('description'),
            amount,
            category,
            recordedBy: currentUser.uid,
            recordedByName: userData.displayName,
            timestamp: serverTimestamp()
        });
        await logActivity('CREATE', 'PENGELUARAN', `Mencatat pengeluaran ${category} sebesar Rp ${amount.toLocaleString('id-ID')} untuk: ${formData.get('description')}`, amount);
        document.getElementById('kas-expense-modal').classList.add('hidden');
        showToast('success', 'Data pengeluaran berhasil disimpan.');
    } catch (error) {
        showAlert('error', 'Gagal', 'Gagal menyimpan data pengeluaran.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Simpan';
    }
}

/**
 * Handle deleting an expense entry.
 */
export async function handleDeleteExpense(e) {
    const btn = e.target.closest('.delete-expense-btn');
    const expenseId = btn.dataset.id;
    const confirmed = await showConfirm('Konfirmasi Hapus', 'Anda yakin ingin menghapus data pengeluaran ini? Tindakan ini tidak dapat diurungkan.');
    if (confirmed) {
        try {
            const expense = state.kasExpenses.find(e => e.id === expenseId);
            await deleteDoc(doc(db, 'kas_expenses', expenseId));
            if(expense) {
                await logActivity('DELETE', 'PENGELUARAN', `Menghapus data pengeluaran ${expense.category}: ${expense.description}`);
            }
            showToast('success', 'Data pengeluaran telah dihapus.');
        } catch (error) {
            showAlert('error', 'Gagal', 'Gagal menghapus data pengeluaran.');
        }
    }
}
