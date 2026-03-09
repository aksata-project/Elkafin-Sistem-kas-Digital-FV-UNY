import { state } from '../store/state.js';
import { sanitize } from '../utils/sanitize.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const findStudentByNim = (nim) => state.allStudents.find(s => s.nim === nim);

export const getRoleName = (role) => ({
    mahasiswa: 'Mahasiswa',
    bendahara_praktik: 'Bendahara Praktik',
    bendahara_teori: 'Bendahara Teori',
    bendahara_angkatan: 'Ketua Kelas',
}[role] || 'Tidak Diketahui');

export const hasPermissionToEdit = (studentToEdit, userData) => {
    if (!userData || !studentToEdit) return false;
    switch (userData.role) {
        case 'bendahara_angkatan': return true;
        case 'bendahara_teori': return userData.theoryClass === studentToEdit.theoryClass;
        case 'bendahara_praktik': return userData.practiceClass === studentToEdit.practiceClass;
        default: return false;
    }
};

// ─── Time Display ─────────────────────────────────────────────────────────────

export function updateTime() {
    const now = new Date();
    const timeEl = document.getElementById('current-time');
    const dateEl = document.getElementById('current-date');
    if (timeEl) {
        timeEl.textContent = now.toLocaleTimeString('id-ID', {
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
        }).replace(/\./g, ':');
    }
    if (dateEl) {
        dateEl.textContent = now.toLocaleDateString('id-ID', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }
}

// ─── Navigation ───────────────────────────────────────────────────────────────

export function handleNavigation(e) {
    const link = e.target.closest('[data-view]');
    if (!link) return;

    e.preventDefault();
    const viewId = `view-${link.dataset.view}`;

    // Switch views with animation
    document.querySelectorAll('.view').forEach(v => {
        v.classList.add('hidden');
        v.classList.remove('view-enter');
    });
    const activeView = document.getElementById(viewId);
    if (activeView) {
        activeView.classList.remove('hidden');
        // Trigger reflow before adding animation class
        void activeView.offsetWidth;
        activeView.classList.add('view-enter');
    }

    // Sync sidebar nav active state
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('nav-link-active', 'bg-blue-500/10', 'text-blue-400'));
    const sidebarLink = document.querySelector(`.nav-link[data-view="${link.dataset.view}"]`);
    if (sidebarLink) sidebarLink.classList.add('nav-link-active');

    // Sync bottom nav active state
    document.querySelectorAll('.bottom-nav-item').forEach(b => b.classList.remove('active'));
    const bottomItem = document.getElementById(`bnav-${link.dataset.view}`);
    if (bottomItem) bottomItem.classList.add('active');

    if (window.innerWidth < 768) {
        document.getElementById('sidebar')?.classList.add('-translate-x-full');
    }
}

// ─── Setup UI (Sidebar, Nav, Buttons) ────────────────────────────────────────

export function setupUI(userData, { onExportExcel, onExportPdf, onAddWeek, onRemoveWeek }) {
    try {
        if (!userData) return;

        document.getElementById('user-profile').innerHTML = `
            <p class="font-bold text-lg text-white">${sanitize(userData.displayName)}</p>
            <p class="text-sm text-gray-400">${sanitize(userData.nim)}</p>
            <p class="text-sm text-gray-500 truncate">${sanitize(userData.email)}</p>
            <span class="inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">${getRoleName(userData.role)}</span>
        `;

        const nav = document.getElementById('main-nav');
        let navLinks = `<a href="#" data-view="angkatan" class="nav-link flex items-center px-4 py-2.5 rounded-lg text-gray-400 hover:text-indigo-400 transition-colors"><svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>Kas Angkatan</a>`;

        navLinks += `<a href="#" data-view="pengeluaran" class="nav-link flex items-center px-4 py-2.5 rounded-lg text-gray-400 hover:text-indigo-400 transition-colors"><svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 14a5 5 0 11-10 0 5 5 0 0110 0z"></path></svg>Pengeluaran</a>`;

        if (userData.role === 'bendahara_angkatan' || userData.role === 'bendahara_teori') {
            navLinks += `<a href="#" data-view="arsip" class="nav-link flex items-center px-4 py-2.5 rounded-lg text-gray-400 hover:text-indigo-400 transition-colors"><svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h4M8 7a2 2 0 012-2h4a2 2 0 012 2v8a2 2 0 01-2 2h-4a2 2 0 01-2-2z" /></svg>Arsip Laporan</a>`;
            document.getElementById('bnav-arsip')?.classList.remove('hidden');
        }
        if (userData.role === 'bendahara_angkatan') {
            navLinks += `<a href="#" data-view="admin" class="nav-link flex items-center px-4 py-2.5 rounded-lg text-gray-400 hover:text-indigo-400 transition-colors"><svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>Admin</a>`;
            document.getElementById('bnav-admin')?.classList.remove('hidden');
        }

        // Setup bottom nav handler
        const bottomNav = document.getElementById('bottom-nav');
        if (bottomNav && !bottomNav.dataset.handlersAttached) {
            bottomNav.addEventListener('click', handleNavigation);
            bottomNav.dataset.handlersAttached = 'true';
        }

        nav.innerHTML = navLinks;

        if (!nav.dataset.handlersAttached) {
            nav.addEventListener('click', handleNavigation);
            nav.dataset.handlersAttached = 'true';
        }

        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('nav-link-active'));
        const activeViewId = document.querySelector('.view:not(.hidden)')?.id || 'view-angkatan';
        const activeLink = nav.querySelector(`[data-view=${activeViewId.split('-')[1]}]`);
        if (activeLink) activeLink.classList.add('nav-link-active');

        const isTreasurer = userData.role !== 'mahasiswa';
        const isFullTreasurer = userData.role === 'bendahara_angkatan' || userData.role === 'bendahara_teori';
        const isPresident = userData.role === 'bendahara_angkatan';
        const treasurerActions = document.getElementById('treasurer-actions');
        const weekManagementActions = document.getElementById('week-management-actions');

        treasurerActions.innerHTML = isTreasurer ? `
            <button id="export-excel-btn" class="btn-secondary px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2.5 1A1.5 1.5 0 001 2.5v11A1.5 1.5 0 002.5 15h11a1.5 1.5 0 001.5-1.5v-11A1.5 1.5 0 0013.5 1h-11zM2 2.5a.5.5 0 01.5-.5h11a.5.5 0 01.5.5v11a.5.5 0 01-.5.5h-11a.5.5 0 01-.5-.5v-11z"/><path d="M5.884 4.61a.5.5 0 10-.768.64L7.349 8l-2.233 2.75a.5.5 0 00.768.64L8 8.781l2.116 2.609a.5.5 0 00.768-.64L8.651 8l2.233-2.75a.5.5 0 00-.768-.64L8 7.219 5.884 4.61z"/></svg>Excel</button>
            <button id="export-pdf-btn" class="btn-secondary px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 2a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V4a2 2 0 00-2-2H5zm0 1h10a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4a1 1 0 011-1zm5 2.5a.5.5 0 00-1 0v3a.5.5 0 00.5.5h1a.5.5 0 00.5-.5v-3a.5.5 0 00-.5-.5h-1z" clip-rule="evenodd"/></svg>PDF</button>` : '';

        if (isTreasurer) {
            treasurerActions.classList.remove('hidden');
            document.getElementById('export-excel-btn').onclick = onExportExcel;
            document.getElementById('export-pdf-btn').onclick = onExportPdf;
        } else {
            treasurerActions.classList.add('hidden');
        }

        if (isPresident) {
            weekManagementActions.classList.remove('hidden');
            weekManagementActions.classList.add('flex');
            document.getElementById('add-week-btn').onclick = onAddWeek;
            document.getElementById('remove-week-btn').onclick = onRemoveWeek;
        } else {
            weekManagementActions.classList.add('hidden');
        }

        // Setup pengeluaran view (requires isFullTreasurer)
        document.getElementById('view-pengeluaran').innerHTML = `
            <div class="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h2 class="text-4xl font-bold text-white">Laporan Pengeluaran</h2>
                <div id="expense-actions">${isFullTreasurer ? `<button id="add-expense-btn" class="btn-primary px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"/></svg>Buat Pengeluaran</button>` : ''}</div>
            </div>
            <div class="glass-card p-6 rounded-xl">
                <div class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead><tr class="border-b border-gray-800"><th class="p-4 text-sm font-semibold text-gray-400">Tanggal</th><th class="p-4 text-sm font-semibold text-gray-400">Deskripsi</th><th class="p-4 text-sm font-semibold text-gray-400">Kategori</th><th class="p-4 text-sm font-semibold text-gray-400">Jumlah</th><th class="p-4 text-sm font-semibold text-gray-400">Dicatat Oleh</th><th class="p-4 text-sm font-semibold text-gray-400 text-center">Aksi</th></tr></thead>
                        <tbody id="expenses-table-body"></tbody>
                    </table>
                </div>
            </div>`;

        updateTime();
    } catch (e) {
        console.error('setupUI error:', e);
    }
}
