import { collection, addDoc, deleteDoc, doc, setDoc, getDocs, updateDoc, serverTimestamp, writeBatch, query } from 'firebase/firestore';
import { db } from '../firebase/config.js';
import { showAlert, showToast, showConfirm } from '../utils/toast.js';
import { handleSemesterReportExport } from './export.js';
import { state, getMaxWeek, getCurrentCalendarWeek } from '../store/state.js';

/**
 * Handle manually incrementing or decrementing the active week.
 * @param {number} delta - +1 to add a week, -1 to remove
 */
export async function handleModifyWeek(delta) {
    const currentMax = getMaxWeek();
    const newMax = currentMax + delta;

    if (newMax < 1) {
        showAlert('error', 'Gagal', 'Jumlah minggu aktif tidak bisa kurang dari 1.');
        return;
    }

    try {
        await updateDoc(doc(db, 'internal_config', 'semester'), {
            manualMaxWeek: newMax
        });
        const calendarWeek = getCurrentCalendarWeek();
        const isManual = newMax !== calendarWeek;
        showToast('success', `Minggu aktif diubah ke Minggu ke-${newMax}${isManual ? ' (manual)' : ' (otomatis)'}.`);
    } catch (error) {
        console.error('handleModifyWeek error:', error);
        showAlert('error', 'Gagal', 'Gagal mengubah jumlah minggu aktif.');
    }
}

/**
 * Reset manual week override back to calendar-based auto-calculation.
 */
export async function handleResetWeekToCalendar() {
    try {
        await updateDoc(doc(db, 'internal_config', 'semester'), {
            manualMaxWeek: null
        });
        showToast('success', 'Minggu aktif dikembalikan ke perhitungan kalender otomatis.');
    } catch (error) {
        console.error('handleResetWeekToCalendar error:', error);
        showAlert('error', 'Gagal', 'Gagal mereset minggu aktif.');
    }
}


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
    const confirmed = await showConfirm(
        'Konfirmasi Nonaktifkan',
        `Anda yakin ingin menonaktifkan anggota dengan NIM ${nim}?\n\nMahasiswa akan dinonaktifkan dan transaksinya akan dikecualikan dari perhitungan saldo. Data tidak dihapus permanen dan bisa diaktifkan kembali.`
    );
    if (confirmed) {
        try {
            await updateDoc(doc(db, 'students', nim), {
                status: 'inactive',
                deactivatedAt: serverTimestamp()
            });
            showToast('success', `Anggota dengan NIM ${nim} telah dinonaktifkan.`);
        } catch (error) {
            showAlert('error', 'Gagal', 'Gagal menonaktifkan anggota.');
        }
    }
}

/**
 * Handle reactivating an inactive student.
 */
export async function handleReactivateStudent(e) {
    const btn = e.target.closest('.reactivate-student-btn');
    const nim = btn.dataset.nim;
    const confirmed = await showConfirm(
        'Konfirmasi Aktivasi',
        `Anda yakin ingin mengaktifkan kembali anggota dengan NIM ${nim}?\n\nTransaksi sebelumnya akan kembali dihitung ke dalam saldo.`
    );
    if (confirmed) {
        try {
            await updateDoc(doc(db, 'students', nim), {
                status: 'active',
                deactivatedAt: null
            });
            showToast('success', `Anggota dengan NIM ${nim} telah diaktifkan kembali.`);
        } catch (error) {
            showAlert('error', 'Gagal', 'Gagal mengaktifkan anggota.');
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

// handleResetWeek removed — starting a new semester (with new startDate) auto-resets weeks

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

/**
 * Handle starting a new semester.
 * Combines: semester config + carry-over + automated wipe + auto-backup.
 */
export async function handleStartNewSemester(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const label = formData.get('semester_label') || '';
    const startDate = formData.get('start_date') || '';
    const weeklyAmount = parseInt(formData.get('weekly_amount')) || 2000;

    if (!label || !startDate) {
        showAlert('error', 'Gagal', 'Label semester dan tanggal mulai wajib diisi.');
        return;
    }

    const confirmed = await showConfirm(
        'PERHATIAN: MENGHAPUS SEMUA TRANSAKSI',
        `Anda akan memulai semester baru:\n\n` +
        `• Label: ${label}\n` +
        `• Minggu 1 dimulai: ${new Date(startDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n` +
        `• Nominal: Rp ${weeklyAmount.toLocaleString('id-ID')}/minggu\n\n` +
        `Operasi ini akan MENGHAPUS PERMANEN semua data transaksi dan pengeluaran pada semester saat ini.\nLanjutkan?`
    );
    if (!confirmed) return;

    const hardPrompt = window.prompt(
        "Kirim laporan semester akan diunduh otomatis setelah ini.\n\n" +
        "Ketik 'HAPUS' (tanpa tanda kutip, huruf besar semua) untuk menghapus semua data transaksi lama dan memulai semester baru:"
    );

    if (hardPrompt !== 'HAPUS') {
        showAlert('error', 'Dibatalkan', 'Konfirmasi dibatalkan atau kata yang diketik salah.');
        return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Memproses Backup...';
    }

    try {
        // 1. Auto-download backup first
        await handleSemesterReportExport();

        if (submitBtn) submitBtn.textContent = 'Menghapus Data...';

        // 2. Wipe Collections (chunked by 500)
        async function deleteCollectionInBatches(collectionPath) {
            let deletedCount = 0;
            const snapshot = await getDocs(query(collection(db, collectionPath)));
            const docs = snapshot.docs;
            const chunkSize = 500;

            for (let i = 0; i < docs.length; i += chunkSize) {
                const chunk = docs.slice(i, i + chunkSize);
                const batchWriter = writeBatch(db);
                chunk.forEach((docSnap) => batchWriter.delete(docSnap.ref));
                await batchWriter.commit();
                deletedCount += chunk.length;
            }
            return deletedCount;
        }

        const deletedTx = await deleteCollectionInBatches('kas_transactions');
        const deletedEx = await deleteCollectionInBatches('kas_expenses');

        if (submitBtn) submitBtn.textContent = 'Menyimpan...';

        // 3. Save new semester config & carry_over
        const configBatch = writeBatch(db);

        // Save semester config
        configBatch.set(doc(db, 'internal_config', 'semester'), {
            label,
            startDate,
            weeklyAmount,
            manualMaxWeek: 1,
        });

        // Save carry-over
        configBatch.set(doc(db, 'internal_config', 'carry_over'), {
            teori_c: parseInt(formData.get('teori_c')) || 0,
            teori_d: parseInt(formData.get('teori_d')) || 0,
            angkatan: parseInt(formData.get('angkatan')) || 0,
        });

        await configBatch.commit();
        
        showToast('success', `Semester "${label}" dimulai! ${deletedTx} transaksi & ${deletedEx} pengeluaran lama telah dihapus dan di-reset.`);
        
        // Reload location to clear application state gracefully
        setTimeout(() => {
            window.location.reload();
        }, 2000);

    } catch (error) {
        console.error('handleStartNewSemester error:', error);
        showAlert('error', 'Gagal', 'Gagal memulai semester baru. ' + error.message);
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Mulai Semester Baru';
        }
    }
}
