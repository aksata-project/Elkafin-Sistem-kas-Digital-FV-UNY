import Chart from 'chart.js/auto';
import { state } from '../store/state.js';
import { formatCurrency } from '../utils/format.js';

/** @type {Chart|null} */
let trenChart = null;

export function renderTrenMingguan() {
    const container = document.getElementById('tren-kas-container');
    if (!container) return;

    const maxWeek = Math.max(state.currentWeek, state.manualMaxWeek);
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
                <h3 class="text-xl font-bold text-white">📊 Tren Pemasukan Mingguan</h3>
            </div>
            <div class="chart-container" style="height: 220px; position: relative;">
                <canvas id="tren-chart"></canvas>
            </div>
            <div class="flex justify-between mt-3 text-xs text-gray-500">
                <span id="tren-total-label">Total: <span class="text-blue-400 font-bold">Rp 0</span></span>
                <span id="tren-week-label">0 minggu</span>
            </div>
        `;
    }

    // Update Label Teks
    const totalLabel = document.getElementById('tren-total-label');
    const weekLabel = document.getElementById('tren-week-label');
    if (totalLabel) totalLabel.innerHTML = `Total seluruh minggu: <span class="text-blue-400 font-bold">${formatCurrency(weeklyTotals.reduce((a, b) => a + b, 0))}</span>`;
    if (weekLabel) weekLabel.textContent = `${maxWeek} minggu`;

    // Ambil data binding Chart.js
    const ctx = document.getElementById('tren-chart')?.getContext('2d');
    if (!ctx) return;

    const chartConfig = {
        labels: weekLabels,
        datasets: [{
            label: 'Pemasukan (Rp)',
            data: weeklyTotals,
            backgroundColor: weeklyTotals.map((_, i) =>
                i === maxWeek - 1 ? 'rgba(59, 130, 246, 0.9)' : 'rgba(59, 130, 246, 0.35)'
            ),
            borderColor: 'rgba(59, 130, 246, 0.8)',
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
                        backgroundColor: '#111',
                        titleColor: '#9ca3af',
                        bodyColor: '#60A5FA',
                        borderColor: '#333',
                        borderWidth: 1,
                    }
                },
                scales: {
                    x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b7280', font: { size: 10 } } },
                    y: {
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: '#6b7280', font: { size: 10 }, callback: (v) => 'Rp ' + (v / 1000).toFixed(0) + 'k' },
                        beginAtZero: true
                    }
                }
            }
        });
    }
}
