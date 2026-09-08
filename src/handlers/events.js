import { collection, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, query, where, getDocs, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase/config.js';
import { state } from '../store/state.js';
import { showAlert, showToast } from '../utils/toast.js';
import { logActivity } from '../utils/logger.js';

/**
 * Create a new event/kegiatan.
 * Only bendahara_angkatan can create events (enforced by UI visibility).
 */
export async function handleCreateEvent(e, currentUser, userData) {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Menyimpan...';

    const formData = new FormData(e.target);
    const name = formData.get('event_name')?.trim();
    const targetPerStudent = parseInt(formData.get('target_per_student'));
    const deadline = formData.get('deadline') || null;

    if (!name || isNaN(targetPerStudent) || targetPerStudent <= 0) {
        showAlert('error', 'Gagal', 'Nama kegiatan dan target harus diisi dengan benar.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Buat Kegiatan';
        return;
    }

    try {
        await addDoc(collection(db, 'events'), {
            name,
            targetPerStudent,
            deadline,
            status: 'active',
            excludedNims: [],
            createdAt: serverTimestamp(),
            createdBy: currentUser.uid,
            createdByName: userData.displayName
        });
        await logActivity('CREATE', 'EVENT', `Membuat kegiatan baru: ${name} dengan target Rp ${targetPerStudent.toLocaleString('id-ID')}`);
        document.getElementById('create-event-modal').classList.add('hidden');
        showToast('success', `Kegiatan "${name}" berhasil dibuat!`);
    } catch (error) {
        console.error('handleCreateEvent error:', error);
        showAlert('error', 'Gagal', 'Gagal membuat kegiatan baru.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Buat Kegiatan';
    }
}

/**
 * Add an installment payment for an event.
 * Only bendahara_teori and bendahara_angkatan can record (enforced by UI).
 */
export async function handleAddEventPayment(e, currentUser, userData) {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Menyimpan...';

    const formData = new FormData(e.target);
    const eventId = formData.get('eventId');
    const nim = formData.get('nim');
    const amount = parseInt(formData.get('amount'));
    const paymentMethod = formData.get('paymentMethod');
    const bankName = paymentMethod === 'Transfer' ? formData.get('bankName') : null;

    if (isNaN(amount) || amount <= 0) {
        showAlert('error', 'Gagal', 'Jumlah cicilan tidak valid.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Simpan';
        return;
    }

    // Validate: total paid + new amount must not exceed target
    const event = state.events.find(ev => ev.id === eventId);
    if (!event) {
        showAlert('error', 'Gagal', 'Kegiatan tidak ditemukan.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Simpan';
        return;
    }

    const alreadyPaid = state.eventPayments
        .filter(p => p.eventId === eventId && p.nim === nim)
        .reduce((sum, p) => sum + p.amount, 0);

    if (alreadyPaid + amount > event.targetPerStudent) {
        const remaining = event.targetPerStudent - alreadyPaid;
        showAlert('error', 'Melebihi Target', `Sisa kekurangan hanya Rp ${remaining.toLocaleString('id-ID')}. Cicilan tidak boleh melebihi target.`);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Simpan';
        return;
    }

    try {
        await addDoc(collection(db, 'event_payments'), {
            eventId,
            nim,
            amount,
            paymentMethod,
            bankName,
            recordedBy: currentUser.uid,
            recordedByName: userData.displayName,
            timestamp: serverTimestamp()
        });
        await logActivity('CREATE', 'EVENT_PAYMENT', `Menerima cicilan kegiatan "${event.name}" sebesar Rp ${amount.toLocaleString('id-ID')} dari ${nim}`, amount);
        document.getElementById('event-payment-modal').classList.add('hidden');
        showToast('success', 'Cicilan berhasil dicatat.');
    } catch (error) {
        console.error('handleAddEventPayment error:', error);
        showAlert('error', 'Gagal', 'Gagal mencatat cicilan.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Simpan';
    }
}

/**
 * Archive an event (set status to 'archived').
 */
export async function handleArchiveEvent(eventId) {
    const event = state.events.find(ev => ev.id === eventId);
    if (!event) return;

    const confirmed = confirm(`Arsipkan kegiatan "${event.name}"?\n\nKegiatan akan hilang dari sidebar dan dipindahkan ke halaman Arsip. Data pembayaran tetap tersimpan.`);
    if (!confirmed) return;

    try {
        await updateDoc(doc(db, 'events', eventId), { status: 'archived' });
        await logActivity('UPDATE', 'EVENT', `Mengarsipkan kegiatan: ${event.name}`);
        showToast('success', `Kegiatan "${event.name}" telah diarsipkan.`);
    } catch (error) {
        console.error('handleArchiveEvent error:', error);
        showAlert('error', 'Gagal', 'Gagal mengarsipkan kegiatan.');
    }
}

/**
 * Unarchive an event (set status back to 'active').
 */
export async function handleUnarchiveEvent(eventId) {
    const event = state.events.find(ev => ev.id === eventId);
    if (!event) return;

    const confirmed = confirm(`Aktifkan kembali kegiatan "${event.name}"?\n\nKegiatan akan muncul lagi di sidebar.`);
    if (!confirmed) return;

    try {
        await updateDoc(doc(db, 'events', eventId), { status: 'active' });
        showToast('success', `Kegiatan "${event.name}" telah diaktifkan kembali.`);
    } catch (error) {
        console.error('handleUnarchiveEvent error:', error);
        showAlert('error', 'Gagal', 'Gagal mengaktifkan kegiatan.');
    }
}

/**
 * Permanently delete an event and ALL its payments.
 */
export async function handleDeleteEventPermanently(eventId) {
    const event = state.events.find(ev => ev.id === eventId);
    if (!event) return;

    const confirmed = confirm(
        `⚠ HAPUS PERMANEN kegiatan "${event.name}"?\n\n` +
        `Semua data pembayaran cicilan akan DIHAPUS dan TIDAK BISA DIKEMBALIKAN.\n\n` +
        `Ketik OK untuk melanjutkan.`
    );
    if (!confirmed) return;

    try {
        // Delete all payments for this event
        const paymentsQuery = query(collection(db, 'event_payments'), where('eventId', '==', eventId));
        const paymentsSnapshot = await getDocs(paymentsQuery);
        const deletePromises = paymentsSnapshot.docs.map(d => deleteDoc(doc(db, 'event_payments', d.id)));
        await Promise.all(deletePromises);

        // Delete event document
        await deleteDoc(doc(db, 'events', eventId));
        await logActivity('DELETE', 'EVENT', `Menghapus PERMANEN kegiatan beserta data cicilannya: ${event.name}`);
        showToast('success', `Kegiatan "${event.name}" dan semua datanya telah dihapus permanen.`);
    } catch (error) {
        console.error('handleDeleteEventPermanently error:', error);
        showAlert('error', 'Gagal', 'Gagal menghapus kegiatan.');
    }
}

/**
 * Delete a single event payment (for corrections).
 */
export async function handleDeleteEventPayment(paymentId) {
    const confirmed = confirm('Hapus pembayaran cicilan ini?');
    if (!confirmed) return;

    try {
        const payment = state.eventPayments.find(p => p.id === paymentId);
        const finalEvent = payment ? state.events.find(e => e.id === payment.eventId) : null;
        
        await deleteDoc(doc(db, 'event_payments', paymentId));
        
        if (payment && finalEvent) {
            await logActivity('DELETE', 'EVENT', `Menghapus cicilan kegiatan "${finalEvent.name}" dengan nominal Rp ${payment.amount.toLocaleString('id-ID')} dari mahasiswa ${payment.nim}`);
        }

        showToast('success', 'Pembayaran cicilan telah dihapus.');
    } catch (error) {
        console.error('handleDeleteEventPayment error:', error);
        showAlert('error', 'Gagal', 'Gagal menghapus pembayaran.');
    }
}

/**
 * Update the target amount per student for an event.
 */
export async function handleUpdateEventTarget(e) {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Menyimpan...';

    const formData = new FormData(e.target);
    const eventId = formData.get('eventId');
    const newTarget = parseInt(formData.get('new_target'));

    if (isNaN(newTarget) || newTarget <= 0) {
        showAlert('error', 'Gagal', 'Nominal target harus lebih dari 0.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Simpan Perubahan';
        return;
    }

    try {
        await updateDoc(doc(db, 'events', eventId), { targetPerStudent: newTarget });
        await logActivity('UPDATE', 'EVENT', `Mengubah target iuran kegiatan menjadi Rp ${newTarget.toLocaleString('id-ID')}`, newTarget);
        document.getElementById('create-event-modal').classList.add('hidden');
        showToast('success', 'Target iuran berhasil diperbarui.');
    } catch (error) {
        console.error('handleUpdateEventTarget error:', error);
        showAlert('error', 'Gagal', 'Gagal memperbarui target.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Simpan Perubahan';
    }
}

/**
 * Toggle a student's exclusion from an event.
 * Uses Firestore arrayUnion/arrayRemove for atomic updates.
 */
export async function handleToggleStudentExclusion(eventId, nim, exclude) {
    try {
        const eventRef = doc(db, 'events', eventId);
        if (exclude) {
            await updateDoc(eventRef, { excludedNims: arrayUnion(nim) });
            showToast('info', 'Mahasiswa dikecualikan dari kegiatan ini.');
        } else {
            await updateDoc(eventRef, { excludedNims: arrayRemove(nim) });
            showToast('success', 'Mahasiswa dimasukkan kembali ke kegiatan ini.');
        }
    } catch (error) {
        console.error('handleToggleStudentExclusion error:', error);
        showAlert('error', 'Gagal', 'Gagal mengubah status peserta.');
    }
}

/**
 * Edit an existing event payment amount.
 */
export async function handleEditEventPayment(e) {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Menyimpan...';

    const formData = new FormData(e.target);
    const paymentId = formData.get('paymentId');
    const newAmount = parseInt(formData.get('amount'));

    if (isNaN(newAmount) || newAmount < 0) {
        showAlert('error', 'Gagal', 'Jumlah cicilan tidak valid.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Simpan Perubahan';
        return;
    }

    // Amount = 0 → hapus entri ini
    if (newAmount === 0) {
        const confirmed = confirm('Nilai 0 akan menghapus entri cicilan ini. Lanjutkan?');
        if (!confirmed) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Simpan Perubahan';
            return;
        }
        try {
            const currentPayment = state.eventPayments.find(p => p.id === paymentId);
            const ev = currentPayment ? state.events.find(e => e.id === currentPayment.eventId) : null;
            
            await deleteDoc(doc(db, 'event_payments', paymentId));
            
            if (currentPayment && ev) {
                await logActivity('DELETE', 'EVENT', `Menghapus cicilan berjalan kegiatan "${ev.name}" untuk mahasiswa ${currentPayment.nim} karena nominal diisi Rp 0`);
            }
            
            document.getElementById('event-payment-modal').classList.add('hidden');
            showToast('success', 'Entri cicilan telah dihapus.');
        } catch (error) {
            console.error('handleEditEventPayment (delete) error:', error);
            showAlert('error', 'Gagal', 'Gagal menghapus cicilan.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Simpan Perubahan';
        }
        return;
    }

    // Validate doesn't exceed target
    const payment = state.eventPayments.find(p => p.id === paymentId);
    if (!payment) return;

    const event = state.events.find(ev => ev.id === payment.eventId);
    if (!event) return;

    const otherPaid = state.eventPayments
        .filter(p => p.eventId === payment.eventId && p.nim === payment.nim && p.id !== paymentId)
        .reduce((sum, p) => sum + p.amount, 0);

    if (otherPaid + newAmount > event.targetPerStudent) {
        const max = event.targetPerStudent - otherPaid;
        showAlert('error', 'Melebihi Target', `Maksimal Rp ${max.toLocaleString('id-ID')} untuk cicilan ini.`);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Simpan Perubahan';
        return;
    }

    try {
        const oldPayment = state.eventPayments.find(p => p.id === paymentId);
        await updateDoc(doc(db, 'event_payments', paymentId), { amount: newAmount });
        
        if (oldPayment && event) {
            await logActivity('UPDATE', 'EVENT', `Mengedit cicilan kegiatan "${event.name}" mahasiswa ${oldPayment.nim} dari sebelumnya Rp ${oldPayment.amount.toLocaleString('id-ID')} menjadi Rp ${newAmount.toLocaleString('id-ID')}`, newAmount);
        }
        
        document.getElementById('event-payment-modal').classList.add('hidden');
        showToast('success', 'Jumlah cicilan berhasil diperbarui.');
    } catch (error) {
        console.error('handleEditEventPayment error:', error);
        showAlert('error', 'Gagal', 'Gagal memperbarui cicilan.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Simpan Perubahan';
    }
}
