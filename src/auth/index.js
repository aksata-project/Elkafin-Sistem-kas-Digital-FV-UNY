import { onAuthStateChanged, signInWithPopup, signOut as fbSignOut } from 'firebase/auth';
import { collection, doc, setDoc, getDoc, getDocs, onSnapshot, query, orderBy, writeBatch } from 'firebase/firestore';
import { auth, db, provider } from '../firebase/config.js';
import {
    state,
    setCurrentUser,
    setUserData,
    setIsInitialLoad,
    setUnsubscribers,
    unsubscribers,
    isInitialLoad
} from '../store/state.js';
import { buildTransactionIndex } from '../data/transactionIndex.js';
import {
    renderAnnouncement,
    renderDashboardSummary,
    renderMyPaymentStatus,
    renderKasAngkatan,
    renderExpenses,
    renderArchiveView,
    renderAdminView,
    renderRekapitulasiPemasukan
} from '../ui/render.js';
import { populateClassFilter, populateWeekFilter } from '../ui/render.js';
import { setupUI } from '../ui/navigation.js';
import { renderTrenMingguan } from '../ui/charts.js';
import { showAlert, showToast } from '../utils/toast.js';

export function setupAuthListeners(callbacks) {
    let animationDone = false;
    let pendingAuthCallback = null;

    // Start animation immediately (it IS the loading screen)
    playIntroAnimation().then(() => {
        animationDone = true;
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) loadingScreen.classList.add('hidden');

        // If auth state already resolved during animation, run it now
        if (pendingAuthCallback) pendingAuthCallback();
    });

    // Persistent listener — handles ALL auth state changes (login, logout, refresh)
    onAuthStateChanged(auth, async (user) => {
        const handler = async () => {
            const loginOverlay = document.getElementById('login-screen');
            const appContainer = document.getElementById('app');
            const bottomNav = document.getElementById('bottom-nav');

            if (user) {
                setCurrentUser(user);
                setUserData({
                    uid: user.uid,
                    displayName: user.displayName,
                    email: user.email,
                    photoURL: user.photoURL,
                    nim: null,
                    role: 'mahasiswa',
                    theoryClass: null,
                    practiceClass: null
                });

                loginOverlay.classList.add('hidden');
                appContainer.classList.remove('hidden');
                if (bottomNav) bottomNav.classList.remove('hidden');

                await initializeDatabaseIfNeeded();
                setupRealtimeDataListeners(callbacks);
            } else {
                setCurrentUser(null);
                setUserData(null);
                unsubscribers.forEach(unsub => unsub());
                setUnsubscribers([]);
                setIsInitialLoad(true);

                loginOverlay.classList.remove('hidden');
                appContainer.classList.add('hidden');
                if (bottomNav) bottomNav.classList.add('hidden');
            }
        };

        if (!animationDone) {
            // Animation still running — queue the handler
            pendingAuthCallback = handler;
        } else {
            // Animation done — run immediately
            await handler();
        }
    });
}

// ─── Reusable Intro Animation ────────────────────────────────────────────────
export function playIntroAnimation() {
    return new Promise(resolve => {
        const loadingScreen = document.getElementById('loading-screen');
        const phase1 = document.getElementById('intro-phase-1');
        const phase2 = document.getElementById('intro-phase-2');
        if (!loadingScreen || !phase1 || !phase2) { resolve(); return; }

        // Reset state for replay
        loadingScreen.classList.remove('hidden');
        loadingScreen.style.opacity = '1';
        loadingScreen.style.transition = '';
        phase1.classList.remove('hidden', 'fade-out');
        phase2.classList.add('hidden');
        phase2.classList.remove('flex', 'fade-in');

        // Force re-trigger CSS animations by cloning letters
        phase1.querySelectorAll('.intro-letter').forEach(el => {
            el.style.animation = 'none';
            void el.offsetWidth; // reflow
            el.style.animation = '';
        });
        const bar = phase1.querySelector('.intro-tagline-bar');
        if (bar) { bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; }

        // Phase 1: ELKAFIN text for 1.8s
        setTimeout(() => {
            phase1.classList.add('fade-out');
            setTimeout(() => {
                phase1.classList.add('hidden');
                // Phase 2: Logo + Powered by
                phase2.classList.remove('hidden');
                phase2.classList.add('flex', 'fade-in');

                // Reset phase 2 inner animations
                const logo = phase2.querySelector('.intro-logo');
                const powered = phase2.querySelector('.intro-powered-text');
                [logo, powered].forEach(el => {
                    if (!el) return;
                    el.style.animation = 'none';
                    void el.offsetWidth;
                    el.style.animation = '';
                });

                // Phase 2 visible for 1.6s, then fade out
                setTimeout(() => {
                    loadingScreen.style.transition = 'opacity 0.5s ease';
                    loadingScreen.style.opacity = '0';
                    setTimeout(() => {
                        loadingScreen.classList.add('hidden');
                        loadingScreen.style.opacity = '';
                        resolve();
                    }, 500);
                }, 1600);
            }, 600);
        }, 1800);
    });
}

export async function login() {
    try {
        // Show intro animation while Firebase processes login
        const loginOverlay = document.getElementById('login-screen');
        if (loginOverlay) loginOverlay.classList.add('hidden');

        // Start animation (runs in parallel with signInWithPopup)
        const animPromise = playIntroAnimation();
        await signInWithPopup(auth, provider);
        await animPromise;
    } catch (error) {
        // Restore login screen on error
        const loginOverlay = document.getElementById('login-screen');
        const loadingScreen = document.getElementById('loading-screen');
        if (loginOverlay) loginOverlay.classList.remove('hidden');
        if (loadingScreen) loadingScreen.classList.add('hidden');
        console.error('Login error:', error);
        showAlert('error', 'Login Gagal', error.message);
    }
}

export async function logout() {
    try {
        await fbSignOut(auth);
    } catch (error) {
        console.error('Logout error:', error);
        showAlert('error', 'Logout Gagal', error.message);
    }
}

async function initializeDatabaseIfNeeded() {
    try {
        const configSnapshot = await getDocs(collection(db, 'internal_config'));
        if (configSnapshot.empty) {
            await setDoc(doc(db, 'internal_config', 'weeks'), { manualMaxWeek: 1 });
            await setDoc(doc(db, 'internal_config', 'current_semester'), { startWeek: 17 });
            console.log('Database initialized with default config.');
        }
    } catch (e) {
        console.error('initializeDatabaseIfNeeded error:', e);
    }
}

function setupRealtimeDataListeners(callbacks) {
    // 1. Students Listener
    const u1 = onSnapshot(collection(db, 'students'), (snapshot) => {
        state.allStudents = snapshot.docs.map(doc => ({ nim: doc.id, ...doc.data() }));
        
        const ADMIN_EMAIL = 'muhammadilham.2025@student.uny.ac.id'.toLowerCase();
        const isMainAdmin = currentUser?.email?.toLowerCase() === ADMIN_EMAIL;
        
        const match = state.allStudents.find(s => s.email === currentUser?.email);
        
        if (userData) {
            if (isMainAdmin) {
                userData.role = 'bendahara_angkatan';
                userData.nim = match ? match.nim : 'ADMIN';
                userData.theoryClass = match ? match.theoryClass : 'C'; // Default
                userData.practiceClass = match ? match.practiceClass : 'C1'; // Default
            } else if (match) {
                userData.nim = match.nim;
                userData.theoryClass = match.theoryClass;
                userData.practiceClass = match.practiceClass;
                userData.role = state.roles[match.nim] || 'mahasiswa';
            } else {
                userData.nim = null;
            }
        }
        
        populateClassFilter(userData);
        
        // Cek akses: Harus admin atau mahasiswa yang terdaftar emailnya
        if (!userData || (!isMainAdmin && !match)) {
            document.getElementById('app').classList.add('hidden');
            const modal = document.getElementById('nim-registration-modal');
            if (modal) {
                modal.innerHTML = `
                    <div class="glass-card p-8 rounded-2xl shadow-2xl w-full max-w-md text-center">
                        <h3 class="text-2xl font-bold text-red-500 mb-4">Akses Ditolak</h3>
                        <p class="text-gray-300 mb-6">Email <strong>${currentUser?.email}</strong> tidak terdaftar di sistem Elka Finance.</p>
                        <p class="text-sm text-gray-400 mb-8">Silakan hubungi Ketua Kelas untuk mendaftarkan email Anda.</p>
                        <button id="logout-from-reg-btn" class="w-full py-3 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-lg font-bold transition-all">Keluar</button>
                    </div>`;
                modal.classList.remove('hidden');
                document.getElementById('logout-from-reg-btn')?.addEventListener('click', logout);
            }
            return;
        }

        document.getElementById('nim-registration-modal')?.classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');

        setupUI(userData, callbacks);
        renderDashboardSummary();
        renderKasAngkatan(userData);
        renderRekapitulasiPemasukan();
        
        if (userData.role === 'bendahara_angkatan') {
            renderAdminView(userData, callbacks.adminCallbacks);
        }
    });

    // 2. Roles Listener
    const u2 = onSnapshot(collection(db, 'roles'), (snapshot) => {
        state.roles = {};
        snapshot.docs.forEach(doc => state.roles[doc.id] = doc.data().role);
        
        const ADMIN_EMAIL = 'muhammadilham.2025@student.uny.ac.id'.toLowerCase();
        const isMainAdmin = currentUser?.email?.toLowerCase() === ADMIN_EMAIL;

        if (userData && userData.nim) {
            if (isMainAdmin) {
                userData.role = 'bendahara_angkatan';
            } else {
                userData.role = state.roles[userData.nim] || 'mahasiswa';
            }
        }
        
        if (userData && (isMainAdmin || userData.nim)) {
            setupUI(userData, callbacks);
            if (userData.role === 'bendahara_angkatan' || userData.role === 'bendahara_teori') {
                renderArchiveView(userData, callbacks.onMonthlyExport, callbacks.adminCallbacks);
            }
            if (userData.role === 'bendahara_angkatan') {
                renderAdminView(userData, callbacks.adminCallbacks);
            }
        }
    });

    // 3. Kas Transactions Listener
    const u3 = onSnapshot(query(collection(db, 'kas_transactions'), orderBy('timestamp', 'asc')), (snapshot) => {
        state.kasTransactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        buildTransactionIndex();

        const maxTransWeek = state.kasTransactions.length > 0
            ? Math.max(...state.kasTransactions.map(t => t.week))
            : 1;
        state.currentWeek = maxTransWeek;

        populateWeekFilter();
        
        if (userData && userData.nim) {
            renderDashboardSummary();
            renderMyPaymentStatus(userData);
            renderKasAngkatan(userData);
            renderRekapitulasiPemasukan();
            renderTrenMingguan();
        }
        
        if (!isInitialLoad) showToast('success', 'Data kas telah diperbarui.', 2000);
    });

    // 4. Kas Expenses Listener
    const u4 = onSnapshot(query(collection(db, 'kas_expenses'), orderBy('timestamp', 'asc')), (snapshot) => {
        state.kasExpenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        if (userData && userData.nim) {
            renderDashboardSummary();
            renderExpenses(userData);
        }
        
        if (!isInitialLoad) showToast('success', 'Data pengeluaran telah diperbarui.', 2000);
    });

    // 5. Config Listener
    const u5 = onSnapshot(doc(db, 'internal_config', 'weeks'), (docSnap) => {
        if (docSnap.exists()) {
            state.manualMaxWeek = docSnap.data().manualMaxWeek || 1;
            populateWeekFilter();
            
            if (userData && userData.nim) {
                renderMyPaymentStatus(userData);
                renderTrenMingguan();
            }
        }
    });

    const u6 = onSnapshot(collection(db, 'announcements'), (snapshot) => {
        if (!snapshot.empty) {
            const data = snapshot.docs[0].data();
            state.announcement = { id: snapshot.docs[0].id, ...data };
        } else {
            state.announcement = null;
        }
        renderAnnouncement();
    });

    const u7 = onSnapshot(doc(db, 'internal_config', 'carry_over'), (docSnap) => {
        if (docSnap.exists()) {
            state.carryOver = docSnap.data();
            if (userData && userData.nim) {
                renderDashboardSummary();
            }
        }
    });

    // 8. Warnings Listener
    const u8 = onSnapshot(collection(db, 'warnings'), (snapshot) => {
        state.warnings = {};
        snapshot.docs.forEach(doc => {
            if (doc.data().active) {
                state.warnings[doc.id] = doc.data();
            }
        });
        
        if (userData && userData.nim) {
            renderKasAngkatan(userData); // Trigger render ulang agar label merah muncul
        }
    });

    setUnsubscribers([u1, u2, u3, u4, u5, u6, u7, u8]);

    setTimeout(() => { setIsInitialLoad(false); }, 1500);
}

// Export for inner usage
import { currentUser, userData } from '../store/state.js';

