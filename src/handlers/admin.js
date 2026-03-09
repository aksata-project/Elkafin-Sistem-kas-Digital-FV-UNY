import { collection, addDoc, deleteDoc, doc, setDoc, getDocs, serverTimestamp, writeBatch, query } from 'firebase/firestore';
import { db } from '../firebase/config.js';
import { showAlert, showToast, showConfirm } from '../utils/toast.js';

/**
 * Handle adding a new student.
 */
export async function handleAddStudent(e) {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Menyimpan...';

    const formData = new FormData(e.target);
    const nim = formData.get('nim');
    const practiceClass = formData.get('practiceClass').toUpperCase();

    const data = {
        nim,
        name: formData.get('name'),
        practiceClass,
        theoryClass: practiceClass.charAt(0),
        email: formData.get('email')
    };

    try {
        await setDoc(doc(db, 'students', nim), data);
        document.getElementById('add-student-modal').classList.add('hidden');
        showToast('success', 'Anggota baru berhasil ditambahkan.');
    } catch (error) {
        showAlert('error', 'Gagal', `Gagal menambahkan anggota: ${error.message}`);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Tambah';
    }
}

/**
 * Handle deleting a student.
 */
export async function handleDeleteStudent(e) {
    const btn = e.target.closest('.delete-student-btn');
    const nim = btn.dataset.nim;
    const confirmed = await showConfirm('Konfirmasi Hapus', `Anda yakin ingin menghapus anggota dengan NIM ${nim}? Tindakan ini tidak dapat diurungkan.`);
    if (confirmed) {
        try {
            await deleteDoc(doc(db, 'students', nim));
            showToast('success', `Anggota dengan NIM ${nim} telah dihapus.`);
        } catch (error) {
            showAlert('error', 'Gagal', 'Gagal menghapus anggota.');
        }
    }
}

/**
 * Handle assigning a role to a student.
 */
export async function handleSetRole(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const nim = formData.get('nim');
    const role = formData.get('role');
    try {
        await setDoc(doc(db, 'roles', nim), { role });
        document.getElementById('manage-roles-modal').classList.add('hidden');
        showToast('success', 'Jabatan bendahara telah diatur.');
    } catch (error) {
        console.error('handleSetRole error:', error);
        showAlert('error', 'Gagal', 'Gagal mengatur jabatan.');
    }
}

/**
 * Handle removing a role from a student.
 */
export async function handleRemoveRole(e) {
    const btn = e.target.closest('.remove-role-btn');
    const nim = btn.dataset.nim;
    const confirmed = await showConfirm('Konfirmasi Hapus', `Anda yakin ingin menghapus jabatan dari anggota dengan NIM ${nim}?`);
    if (confirmed) {
        try {
            await deleteDoc(doc(db, 'roles', nim));
            showToast('success', 'Jabatan telah dihapus.');
        } catch (error) {
            console.error('handleRemoveRole error:', error);
            showAlert('error', 'Gagal', 'Gagal menghapus jabatan.');
        }
    }
}

/**
 * Handle publishing a new announcement.
 */
export async function handlePublishAnnouncement(e, userData) {
    e.preventDefault();
    const message = document.getElementById('announcement-text').value;
    if (!message) return;

    try {
        const oldAnnouncements = await getDocs(query(collection(db, 'announcements')));
        const batch = writeBatch(db);
        oldAnnouncements.forEach(d => batch.delete(d.ref));

        batch.set(doc(collection(db, 'announcements')), {
            message,
            authorName: userData.displayName,
            createdAt: serverTimestamp()
        });

        await batch.commit();
        showToast('success', 'Pengumuman telah dipublikasikan.');
    } catch (error) {
        console.error('handlePublishAnnouncement error:', error);
        showAlert('error', 'Gagal', 'Gagal mempublikasikan pengumuman.');
    }
}

/**
 * Reset manualMaxWeek to 1.
 */
export async function handleResetWeek() {
    const confirmed = await showConfirm('Konfirmasi Reset', 'Apakah Anda yakin ingin mereset minggu pembayaran kembali ke Minggu 1? Filter minggu di dashboard akan kembali ke awal.');
    if (confirmed) {
        try {
            await setDoc(doc(db, 'internal_config', 'weeks'), { manualMaxWeek: 1 });
            showToast('success', 'Minggu pembayaran telah direset ke Minggu 1.');
        } catch (error) {
            console.error('handleResetWeek error:', error);
            showAlert('error', 'Gagal', 'Gagal mereset minggu.');
        }
    }
}

/**
 * Save carry-over balance from last semester.
 */
export async function handleSaveCarryOver(e) {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Menyimpan...';
    }

    const formData = new FormData(e.target);
    const data = {
        teori_c: parseInt(formData.get('teori_c')) || 0,
        teori_d: parseInt(formData.get('teori_d')) || 0,
        angkatan: parseInt(formData.get('angkatan')) || 0
    };

    try {
        await setDoc(doc(db, 'internal_config', 'carry_over'), data);
        showToast('success', 'Saldo semester lalu telah diperbarui.');
    } catch (error) {
        console.error('handleSaveCarryOver error:', error);
        showAlert('error', 'Gagal', 'Gagal menyimpan saldo semester lalu.');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Simpan Saldo Awal';
        }
    }
}

/**
 * Handle giving a severe warning to a student.
 */
export async function handleSetWarning(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const nim = formData.get('nim');
    const message = formData.get('message');
    
    try {
        await setDoc(doc(db, 'warnings', nim), { 
            active: true, 
            message, 
            timestamp: serverTimestamp() 
        });
        document.getElementById('manage-warnings-modal')?.classList.add('hidden');
        showToast('success', 'Peringatan keras telah disematkan.');
    } catch (error) {
        console.error('handleSetWarning error:', error);
        showAlert('error', 'Gagal', 'Gagal memberikan peringatan.');
    }
}

/**
 * Handle removing a severe warning from a student.
 */
export async function handleRemoveWarning(e) {
    const btn = e.target.closest('.remove-warning-btn');
    if (!btn) return;
    const nim = btn.dataset.nim;
    
    const confirmed = await showConfirm('Konfirmasi Hapus', `Anda yakin ingin mencabut peringatan dari anggota dengan NIM ${nim}?`);
    if (confirmed) {
        try {
            await deleteDoc(doc(db, 'warnings', nim));
            showToast('success', 'Peringatan keras telah dicabut.');
        } catch (error) {
            console.error('handleRemoveWarning error:', error);
            showAlert('error', 'Gagal', 'Gagal mencabut peringatan.');
        }
    }
}
