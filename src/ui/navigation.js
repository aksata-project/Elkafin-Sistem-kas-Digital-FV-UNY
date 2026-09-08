import { state, getMaxWeek, userData } from '../store/state.js';
import { sanitize } from '../utils/sanitize.js';
import { renderBayarPage } from './bayar.js';

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

    // Update semester info
    const labelEl = document.getElementById('semester-label');
    const weekEl = document.getElementById('semester-week');
    const startEl = document.getElementById('semester-start');
    
    if (labelEl) labelEl.textContent = state.semester?.label || 'Semester Aktif';
    
    if (weekEl) weekEl.textContent = `Minggu ke-${getMaxWeek()}`;

    if (startEl) {
        if (state.semester?.startDate) {
            const startD = new Date(state.semester.startDate);
            startEl.textContent = startD.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
        } else {
            startEl.textContent = '-';
        }
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

        // Render page content if needed
        if (link.dataset.view === 'bayar') {
            renderBayarPage(userData);
        }
    }

    // Sync sidebar nav active state
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('nav-link-active'));
    const sidebarLink = document.querySelector(`.nav-link[data-view="${link.dataset.view}"]`);
    if (sidebarLink) sidebarLink.classList.add('nav-link-active');

    // Sync bottom nav active state
    document.querySelectorAll('.bottom-nav-item').forEach(b => b.classList.remove('active'));
    const bottomItem = document.getElementById(`bnav-${link.dataset.view}`);
    if (bottomItem) bottomItem.classList.add('active');

    if (window.innerWidth < 768) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.remove('translate-x-0');
            sidebar.classList.add('-translate-x-full');
        }
    }
}

// ─── Setup UI (Sidebar, Nav, Buttons) ────────────────────────────────────────

export function setupUI(userData, { onAddWeek, onRemoveWeek }) {
    try {
        if (!userData) return;

        document.getElementById('user-profile').innerHTML = `
            <p class="font-bold text-lg text-fg-primary">${sanitize(userData.displayName)}</p>
            <p class="text-sm text-fg-secondary">${sanitize(userData.nim)}</p>
            <p class="text-sm text-fg-tertiary truncate">${sanitize(userData.email)}</p>
            <span class="inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full text-accent" style="background: var(--color-primary-subtle); border: 1px solid var(--color-border-accent);">${getRoleName(userData.role)}</span>
        `;

        const nav = document.getElementById('main-nav');
        let navLinks = '';

        // 1. Bayar (Prominent Position)
        navLinks += `<a href="#" data-view="bayar" class="nav-link nav-link-prominent flex items-center px-4 py-3 rounded-[12px] text-white transition-all transform hover:scale-[1.02] mb-4 active:scale-95 shadow-lg shadow-primary/20" style="background: linear-gradient(135deg, var(--color-primary), #005bb5);"><svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4h6v6H4V4zm10 0h6v6h-6V4zm-10 10h6v6H4v-6zm10 0h2v2h-2v-2zm4 0h2v2h-2v-2zm-4 4h2v2h-2v-2zm4 0h2v2h-2v-2z"/></svg><span class="font-bold tracking-wide">Bayar via QRIS</span></a>`;
        navLinks += `<div style="border-top: 1px solid var(--color-border-default); opacity: 0.5;" class="mb-4"></div>`;

        // 2. Kas Angkatan
        navLinks += `<a href="#" data-view="angkatan" class="nav-link flex items-center px-4 py-2.5 rounded-[10px] text-fg-secondary hover:text-accent transition-colors mb-1"><svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>Kas Angkatan</a>`;

        // 3. Kegiatan
        navLinks += `<a href="#" data-view="kegiatan" class="nav-link flex items-center px-4 py-2.5 rounded-[10px] text-fg-secondary hover:text-accent transition-colors mb-2"><svg class="w-5 h-5 mr-3 text-fg-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>Kegiatan</a>`;

        // 4. Pengeluaran
        navLinks += `<a href="#" data-view="pengeluaran" class="nav-link flex items-center px-4 py-2.5 rounded-[10px] text-fg-secondary hover:text-accent transition-colors mb-1 mt-1"><svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>Pengeluaran</a>`;

        // 5. Log Aktivitas
        navLinks += `<a href="#" data-view="log" class="nav-link flex items-center px-4 py-2.5 rounded-[10px] text-fg-secondary hover:text-accent transition-colors mb-1"><svg class="w-5 h-5 mr-3 text-fg-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>Log Aktivitas</a>`;
        document.getElementById('bnav-log')?.classList.remove('hidden');

        if (userData.role === 'bendahara_angkatan' || userData.role === 'bendahara_teori') {
            navLinks += `<div style="border-top: 1px solid var(--color-border-default);" class="my-2"></div>`;
            navLinks += `<a href="#" data-view="arsip" class="nav-link flex items-center px-4 py-2.5 rounded-[10px] text-fg-secondary hover:text-accent transition-colors mb-1"><svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h4M8 7a2 2 0 012-2h4a2 2 0 012 2v8a2 2 0 01-2 2h-4a2 2 0 01-2-2z" /></svg>Arsip Laporan</a>`;
            document.getElementById('bnav-arsip')?.classList.remove('hidden');
        }
        if (userData.role === 'bendahara_angkatan') {
            navLinks += `<a href="#" data-view="admin" class="nav-link flex items-center px-4 py-2.5 rounded-[10px] text-fg-secondary hover:text-accent transition-colors"><svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>Admin</a>`;
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

        treasurerActions.innerHTML = '';
        treasurerActions.classList.add('hidden');

        // Setup pengeluaran view (requires isFullTreasurer)
        document.getElementById('view-pengeluaran').innerHTML = `
            <div class="section-header">
                <h2 class="text-fg-primary">Laporan Pengeluaran</h2>
                <div id="expense-actions">${isFullTreasurer ? `<button id="add-expense-btn" class="btn-primary px-5 py-2.5 rounded-[10px] font-semibold flex items-center gap-2 text-sm"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"/></svg>Buat Pengeluaran</button>` : ''}</div>
            </div>
            <div class="glass-card p-5 rounded-[14px]">
                <div class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead><tr style="border-bottom: 1px solid var(--color-border-default);"><th class="p-3 text-sm font-semibold text-fg-secondary">Tanggal</th><th class="p-3 text-sm font-semibold text-fg-secondary">Deskripsi</th><th class="p-3 text-sm font-semibold text-fg-secondary">Kategori</th><th class="p-3 text-sm font-semibold text-fg-secondary">Jumlah</th><th class="p-3 text-sm font-semibold text-fg-secondary">Dicatat Oleh</th><th class="p-3 text-sm font-semibold text-fg-secondary text-center">Aksi</th></tr></thead>
                        <tbody id="expenses-table-body"></tbody>
                    </table>
                </div>
            </div>`;

        updateTime();
    } catch (e) {
        console.error('setupUI error:', e);
    }
}
