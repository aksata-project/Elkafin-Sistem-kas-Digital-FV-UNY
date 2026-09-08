import { collection, addDoc, serverTimestamp, writeBatch, doc, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config.js';
import { currentUser, userData } from '../store/state.js';

/**
 * Log an activity performed by an admin/treasurer.
 * 
 * @param {string} actionType - 'CREATE', 'UPDATE', 'DELETE'
 * @param {string} module - 'KAS', 'EVENT', 'PENGELUARAN', 'ADMIN'
 * @param {string} description - Human readable details about the action
 * @param {number|null} amount - Monetary amount involved, if any
 */
export async function logActivity(actionType, module, description, amount = null) {
    if (!currentUser || !userData) return;

    try {
        await addDoc(collection(db, 'activity_logs'), {
            uid: currentUser.uid,
            name: userData.displayName,
            role: userData.role,
            practiceClass: userData.practiceClass || '',
            theoryClass: userData.theoryClass || '',
            actionType,
            module,
            description,
            amount,
            timestamp: serverTimestamp()
        });
    } catch (e) {
        console.error('Failed to write activity log:', e);
        // Do not crash the application if logging fails
    }
}

export async function handleClearLogs() {
    try {
        const querySnapshot = await getDocs(collection(db, 'activity_logs'));
        if (querySnapshot.empty) {
            import('./toast.js').then(m => m.showToast('info', 'Tidak ada log untuk dihapus.'));
            return;
        }

        const batch = writeBatch(db);
        let count = 0;
        querySnapshot.forEach((document) => {
            batch.delete(doc(db, 'activity_logs', document.id));
            count++;
        });

        await batch.commit();

        import('./toast.js').then(m => m.showToast('success', `Berhasil membersihkan ${count} log aktivitas secara permanen.`));
    } catch (error) {
        console.error('handleClearLogs ERROR:', error);
        import('./toast.js').then(m => m.showAlert('error', 'Gagal', `Gagal membersihkan log: ${error.message}`));
    }
}
