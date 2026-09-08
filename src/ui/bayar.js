import { state, getMaxWeek, getWeeklyTarget } from '../store/state.js';
import { sanitize } from '../utils/sanitize.js';

/**
 * Open the Bayar (Payment) modal.
 * Auto-detects student class and shows the appropriate QRIS.
 * @param {object} userData - Current user data
 */
/**
 * Render the Bayar (Payment) page.
 * Auto-detects student class and shows the appropriate QRIS.
 * @param {object} userData - Current user data
 */
export function renderBayarPage(userData) {
    if (!userData || !userData.nim) return;

    const container = document.getElementById('view-bayar');
    if (!container) return;

    const practiceClass = userData.practiceClass || '';
    const theoryClass = userData.theoryClass || '';
    const maxWeek = getMaxWeek();
    const weeklyAmount = getWeeklyTarget(1);

    // Active events for the event tab
    const activeEvents = state.events.filter(ev => ev.status === 'active');
    const eventOptions = activeEvents.map(ev => {
        const excludedNims = new Set(ev.excludedNims || []);
        if (excludedNims.has(userData.nim)) return '';
        const payments = state.eventPayments.filter(p => p.nim === userData.nim && p.eventId === ev.id);
        const paid = payments.reduce((sum, p) => sum + p.amount, 0);
        const remaining = Math.max(ev.targetPerStudent - paid, 0);
        if (remaining <= 0) return '';
        return `<option value="${ev.id}" data-remaining="${remaining}" data-name="${sanitize(ev.name)}">
            ${sanitize(ev.name)} — Sisa Rp ${remaining.toLocaleString('id-ID')}
        </option>`;
    }).filter(Boolean).join('');

    // Week options
    const weekOptions = Array.from({ length: maxWeek }, (_, i) => i + 1)
        .reverse()
        .map(w => `<option value="${w}"${w === maxWeek ? ' selected' : ''}>Minggu ${w}</option>`)
        .join('');

    // QRIS keys
    const primaryQrisKey = practiceClass;
    const secondaryQrisKey = theoryClass;

    container.innerHTML = `
        <div class="flex flex-col gap-6 animate-fade-in-up">
            <div class="section-header">
                <div>
                    <h2 class="text-fg-primary">Pembayaran QRIS</h2>
                    <p class="text-sm text-fg-tertiary">Silakan selesaikan pembayaran Kas atau Kegiatan Anda.</p>
                </div>
                <button data-view="angkatan" class="nav-link btn-secondary flex items-center gap-2 px-4 py-2 text-sm">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                    Kembali
                </button>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Payment Config -->
                <div class="glass-card p-6 md:p-8 rounded-xl shadow-xl space-y-6">
                    <div class="flex items-center gap-3 pb-4" style="border-bottom: 1px solid var(--color-border-default);">
                        <div class="w-12 h-12 rounded-[12px] flex items-center justify-center" style="background: var(--color-primary-subtle);">
                            <svg class="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
                        </div>
                        <div>
                            <h3 class="text-lg font-bold text-fg-primary">Konfigurasi Pembayaran</h3>
                            <p class="text-xs text-fg-tertiary">Kelas ${sanitize(practiceClass)} — ${sanitize(userData.displayName)}</p>
                        </div>
                    </div>

                    <!-- Tab Switcher -->
                    <div class="flex gap-1 p-1 rounded-[10px]" style="background: var(--color-bg-elevated);">
                        <button data-tab="kas" class="bayar-tab flex-1 py-2.5 px-4 rounded-[8px] text-sm font-semibold transition-all text-accent" style="background: var(--color-primary-subtle);">
                            Kas Mingguan
                        </button>
                        <button data-tab="event" class="bayar-tab flex-1 py-2.5 px-4 rounded-[8px] text-sm font-semibold transition-all text-fg-tertiary hover:text-fg-secondary">
                            Kegiatan
                        </button>
                    </div>

                    <!-- Tab: Kas Mingguan -->
                    <div id="bayar-tab-kas" class="bayar-tab-content space-y-5">
                        <div class="space-y-4">
                            <div>
                                <label class="block text-xs font-semibold text-fg-tertiary uppercase tracking-wider mb-2">Minggu</label>
                                <select id="bayar-week" class="w-full py-3 px-4 rounded-[10px] text-sm text-fg-primary" style="background: var(--color-bg-input); border: 1px solid var(--color-border-default);">
                                    ${weekOptions}
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-fg-tertiary uppercase tracking-wider mb-2">Jumlah Pembayaran (Rp)</label>
                                <input type="number" id="bayar-amount-kas" value="${weeklyAmount}" min="1000" step="1000" class="w-full py-3 px-4 rounded-[10px] text-sm text-fg-primary" style="background: var(--color-bg-input); border: 1px solid var(--color-border-default);">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-fg-tertiary uppercase tracking-wider mb-2">Tujuan Transaksi</label>
                                <select id="bayar-target-kas" class="w-full py-3 px-4 rounded-[10px] text-sm text-fg-primary" style="background: var(--color-bg-input); border: 1px solid var(--color-border-default);">
                                    <option value="${primaryQrisKey}">Bendahara Praktik ${sanitize(practiceClass)}</option>
                                    <option value="${secondaryQrisKey}">Bendahara Teori ${sanitize(theoryClass)}</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Tab: Kegiatan -->
                    <div id="bayar-tab-event" class="bayar-tab-content hidden space-y-5">
                        ${activeEvents.length === 0 || !eventOptions
                            ? '<div class="text-center py-12"><p class="text-fg-tertiary text-sm">Tidak ada kegiatan aktif atau semua sudah lunas. 🎉</p></div>'
                            : `<div class="space-y-4">
                                <div>
                                    <label class="block text-xs font-semibold text-fg-tertiary uppercase tracking-wider mb-2">Pilih Kegiatan</label>
                                    <select id="bayar-event-select" class="w-full py-3 px-4 rounded-[10px] text-sm text-fg-primary" style="background: var(--color-bg-input); border: 1px solid var(--color-border-default);">
                                        ${eventOptions}
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-xs font-semibold text-fg-tertiary uppercase tracking-wider mb-2">Jumlah Cicilan (Rp)</label>
                                    <input type="number" id="bayar-amount-event" min="1000" step="1000" class="w-full py-3 px-4 rounded-[10px] text-sm text-fg-primary" style="background: var(--color-bg-input); border: 1px solid var(--color-border-default);">
                                </div>
                                <div>
                                    <label class="block text-xs font-semibold text-fg-tertiary uppercase tracking-wider mb-2">Tujuan Transaksi</label>
                                    <select id="bayar-target-event" class="w-full py-3 px-4 rounded-[10px] text-sm text-fg-primary" style="background: var(--color-bg-input); border: 1px solid var(--color-border-default);">
                                        <option value="${primaryQrisKey}">Bendahara Praktik ${sanitize(practiceClass)}</option>
                                        <option value="${secondaryQrisKey}">Bendahara Teori ${sanitize(theoryClass)}</option>
                                    </select>
                                </div>
                            </div>`
                        }
                    </div>

                    <button id="bayar-confirm-wa-btn" class="w-full btn-primary py-4 rounded-[12px] font-bold text-base flex items-center justify-center gap-3 shadow-lg shadow-primary/20">
                        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.396 0-4.597-.838-6.321-2.234l-.44-.364-3.26 1.093 1.093-3.26-.364-.44A9.958 9.958 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
                        Konfirmasi via WhatsApp
                    </button>
                </div>

                <!-- QRIS Visual -->
                <div id="qris-display-container" class="glass-card p-8 rounded-xl flex items-center justify-center min-h-[400px]">
                    <div id="bayar-qris-display" class="w-full">
                        ${renderQrisDisplay(primaryQrisKey)}
                    </div>
                </div>
            </div>
        </div>
    `;

    // --- Wire up interactivity ---

    // Tab switching
    container.querySelectorAll('.bayar-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            // Update tab active state
            container.querySelectorAll('.bayar-tab').forEach(t => {
                t.classList.remove('text-accent');
                t.style.background = 'transparent';
                t.classList.add('text-fg-tertiary');
            });
            tab.classList.add('text-accent');
            tab.classList.remove('text-fg-tertiary');
            tab.style.background = 'var(--color-primary-subtle)';
            // Toggle tab content
            container.querySelectorAll('.bayar-tab-content').forEach(c => c.classList.add('hidden'));
            document.getElementById(`bayar-tab-${target}`)?.classList.remove('hidden');

            // Swap QRIS target if necessary
            if (target === 'kas') {
                const targetKas = document.getElementById('bayar-target-kas')?.value;
                document.getElementById('bayar-qris-display').innerHTML = renderQrisDisplay(targetKas);
            } else {
                const targetEvent = document.getElementById('bayar-target-event')?.value;
                document.getElementById('bayar-qris-display').innerHTML = renderQrisDisplay(targetEvent);
            }
        });
    });

    // QRIS target change (Kas tab)
    document.getElementById('bayar-target-kas')?.addEventListener('change', (e) => {
        const display = document.getElementById('bayar-qris-display');
        if (display) display.innerHTML = renderQrisDisplay(e.target.value);
    });

    // QRIS target change (Event tab)
    document.getElementById('bayar-target-event')?.addEventListener('change', (e) => {
        const display = document.getElementById('bayar-qris-display');
        if (display) display.innerHTML = renderQrisDisplay(e.target.value);
    });

    // Set default event amount from remaining
    const eventSelect = document.getElementById('bayar-event-select');
    const eventAmountInput = document.getElementById('bayar-amount-event');
    if (eventSelect && eventAmountInput) {
        const updateEventAmount = () => {
            const selected = eventSelect.options[eventSelect.selectedIndex];
            if (selected) eventAmountInput.value = selected.dataset.remaining || '';
        };
        updateEventAmount();
        eventSelect.addEventListener('change', updateEventAmount);
    }

    // WhatsApp confirmation
    document.getElementById('bayar-confirm-wa-btn')?.addEventListener('click', () => {
        const kasTab = !document.getElementById('bayar-tab-kas')?.classList.contains('hidden');

        let targetKey, amount, tipeLabel, extraInfo;

        if (kasTab) {
            targetKey = document.getElementById('bayar-target-kas')?.value;
            amount = parseInt(document.getElementById('bayar-amount-kas')?.value) || 0;
            const week = document.getElementById('bayar-week')?.value || '';
            tipeLabel = 'Kas Mingguan';
            extraInfo = `Minggu: ${week}`;
        } else {
            targetKey = document.getElementById('bayar-target-event')?.value;
            amount = parseInt(document.getElementById('bayar-amount-event')?.value) || 0;
            const eventSel = document.getElementById('bayar-event-select');
            const eventName = eventSel?.options[eventSel.selectedIndex]?.dataset.name || '-';
            tipeLabel = `Tabungan Kegiatan`;
            extraInfo = `Kegiatan: ${eventName}`;
        }

        if (amount <= 0) {
            import('../utils/toast.js').then(({ showToast }) => {
                showToast('error', 'Jumlah pembayaran harus lebih dari 0.');
            });
            return;
        }

        const qrisEntry = state.qrisConfig[targetKey];
        if (!qrisEntry || !qrisEntry.waNumber) {
            import('../utils/toast.js').then(({ showToast }) => {
                showToast('error', 'Nomor WhatsApp bendahara belum diatur. Hubungi admin.');
            });
            return;
        }

        const message = `[KONFIRMASI KAS]
Nama: ${userData.displayName}
NIM: ${userData.nim}
Kelas: ${practiceClass}
Tipe: ${tipeLabel}
${extraInfo}
Jumlah: Rp ${amount.toLocaleString('id-ID')}
Metode: QRIS
Link: https://elkafin.web.app/`;

        const waUrl = `https://wa.me/${qrisEntry.waNumber}?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
    });
}

/**
 * Render the QRIS image display for a given class key.
 * @param {string} classKey - e.g. 'C1', 'C', 'D2'
 * @returns {string} HTML
 */
function renderQrisDisplay(classKey) {
    const entry = state.qrisConfig[classKey];

    if (!entry || !entry.qrisBase64) {
        return `
            <div class="text-center py-12 rounded-[14px] bg-elevated/50 border-2 border-dashed border-border-default/40">
                <div class="w-16 h-16 bg-elevated rounded-full flex items-center justify-center mx-auto mb-4 border border-border-default">
                    <svg class="w-8 h-8 text-fg-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                </div>
                <p class="text-fg-primary font-bold text-lg">QRIS Belum Tersedia</p>
                <p class="text-fg-tertiary text-sm mt-1 mb-2">Belum ada QRIS untuk <strong>${sanitize(classKey)}</strong></p>
                <p class="text-fg-muted text-xs">Silakan hubungi administrator untuk mengunggah.</p>
            </div>`;
    }

    return `
        <div class="text-center animate-fade-in">
            <h3 class="text-sm md:text-base font-black text-fg-primary uppercase tracking-[0.2em] mb-6 drop-shadow-sm">${sanitize(entry.label || `Bendahara ${classKey}`)}</h3>
            
            <div class="relative group inline-block">
                <!-- Decorative glow background -->
                <div class="absolute -inset-4 bg-accent/20 rounded-[24px] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <!-- QR Code Container -->
                <div class="relative inline-block p-4 rounded-[20px] bg-white shadow-2xl border-2 border-white/10 overflow-hidden transform transition-transform duration-300 hover:scale-[1.02]">
                    <img src="${entry.qrisBase64}" 
                         alt="QRIS ${classKey}" 
                         class="w-64 h-64 md:w-80 md:h-80 object-contain rounded-lg" />
                </div>
            </div>
            
            <div class="mt-8 space-y-2">
                <p class="text-xs md:text-sm text-fg-secondary font-medium tracking-wide">Scan QR di atas dengan aplikasi e-wallet</p>
                <div class="flex items-center justify-center gap-2 text-[10px] text-fg-muted opacity-60">
                    <div class="h-px w-10 bg-border-default"></div>
                    <span>Satu QRIS Untuk Semua</span>
                    <div class="h-px w-10 bg-border-default"></div>
                </div>
            </div>
        </div>`;
}
