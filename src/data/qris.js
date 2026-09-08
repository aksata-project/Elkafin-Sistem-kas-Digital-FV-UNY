import { doc, getDoc, setDoc, getDocs, collection } from 'firebase/firestore';
import { db } from '../firebase/config.js';
import { state } from '../store/state.js';

/**
 * Fetch QRIS config from Firestore.
 * Collection: qris_configs
 */
export async function fetchQrisConfig() {
    try {
        const querySnapshot = await getDocs(collection(db, 'qris_configs'));
        const config = {};
        querySnapshot.forEach(docSnap => {
            config[docSnap.id] = docSnap.data();
        });
        state.qrisConfig = config;
    } catch (e) {
        console.error('fetchQrisConfig error:', e);
        state.qrisConfig = {};
    }
}

/**
 * Save a single QRIS entry (image + WA number + label) for a class key.
 * @param {string} classKey - e.g. 'C1', 'C2', 'D1', 'D2', 'C', 'D'
 * @param {{ qrisBase64: string, waNumber: string, label: string }} data
 */
export async function saveQrisEntry(classKey, data) {
    try {
        const entryData = {
            qrisBase64: data.qrisBase64 || '',
            waNumber: data.waNumber || '',
            label: data.label || `Bendahara ${classKey}`,
            updatedAt: new Date().toISOString()
        };
        
        await setDoc(doc(db, 'qris_configs', classKey), entryData);
        
        // Update local state immediately
        state.qrisConfig[classKey] = entryData;
        
        return true;
    } catch (e) {
        console.error('saveQrisEntry error:', e);
        return false;
    }
}

/**
 * Convert a File object to a Base64 data URL string.
 * @param {File} file
 * @returns {Promise<string>}
 */
export function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
