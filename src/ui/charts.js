import Chart from 'chart.js/auto';
import { state, getMaxWeek } from '../store/state.js';
import { formatCurrency } from '../utils/format.js';

/** @type {Chart|null} */
let trenChart = null;

export function renderTrenMingguan() {
    const container = document.getElementById('tren-kas-container');
    if (!container) return;

    const maxWeek = getMaxWeek();
    if (maxWeek < 1) return;

    const weeklyTotals = [];
    const weekLabels = [];

    for (let i = 1; i <= maxWeek; i++) {
        const total = state.kasTransactions
            .filter(t => t.week === i)
            .reduce((sum, t) => sum + t.amount, 0);
        weeklyTotals.push(total);
        weekLabels.push(`Minggu ${i}`);
    }

    // Inisialisasi struktur HTML (hanya sekali jika belum ada)
    if (!container.querySelector('.chart-container')) {
        container.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-bold text-fg-primary">📊 Tren Pemasukan Mingguan</h3>
            </div>
            <div class="chart-container" style="height: 220px; position: relative;">
                <canvas id="tren-chart"></canvas>
            </div>
            <div class="flex justify-between mt-3 text-xs text-fg-tertiary">
                <span id="tren-total-label">Total: <span class="text-accent font-bold">Rp 0</span></span>
                <span id="tren-week-label">0 minggu</span>
            </div>
        `;
    }

    // Update Label Teks
    const totalLabel = document.getElementById('tren-total-label');
    const weekLabel = document.getElementById('tren-week-label');
    if (totalLabel) totalLabel.innerHTML = `Total seluruh minggu: <span class="text-accent font-bold">${formatCurrency(weeklyTotals.reduce((a, b) => a + b, 0))}</span>`;
    if (weekLabel) weekLabel.textContent = `${maxWeek} minggu`;

    // Ambil data binding Chart.js
    const ctx = document.getElementById('tren-chart')?.getContext('2d');
    if (!ctx) return;

    // Gunakan warna biru baru (#007aff)
    const chartConfig = {
        labels: weekLabels,
        datasets: [{
            label: 'Pemasukan (Rp)',
            data: weeklyTotals,
            backgroundColor: weeklyTotals.map((_, i) =>
                i === maxWeek - 1 ? 'rgba(0, 122, 255, 0.9)' : 'rgba(0, 122, 255, 0.25)'
            ),
            borderColor: 'rgb(0, 122, 255)',
            borderWidth: 1,
            borderRadius: 4,
        }]
    };

    if (trenChart) {
        // Jika instance chart sudah ada, perbarui data saja
        trenChart.data = chartConfig;
        trenChart.update();
    } else {
        // Render pertama kali
        // Gunakan style font Inter jika tersedia, jika tidak default.
        Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
        
        trenChart = new Chart(ctx, {
            type: 'bar',
            data: chartConfig,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: { label: (ctx) => ' ' + formatCurrency(ctx.parsed.y) },
                        backgroundColor: '#111827', // var(--color-bg-surface)
                        titleColor: '#8993a4', // var(--color-text-secondary)
                        bodyColor: '#3395ff', // var(--color-text-accent)
                        borderColor: 'rgba(255,255,255,0.08)',
                        borderWidth: 1,
                        padding: 10,
                        boxPadding: 4,
                        cornerRadius: 8,
                        titleFont: { weight: '600' },
                        bodyFont: { weight: 'bold' }
                    }
                },
                scales: {
                    x: { 
                        grid: { color: 'rgba(255,255,255,0.04)' }, // subtle border
                        ticks: { color: '#6b768a', font: { size: 11, weight: '500' } } 
                    },
                    y: {
                        grid: { color: 'rgba(255,255,255,0.04)' },
                        ticks: { color: '#6b768a', font: { size: 10, weight: '500' }, callback: (v) => 'Rp ' + (v / 1000).toFixed(0) + 'k' },
                        beginAtZero: true
                    }
                }
            }
        });
    }
}
