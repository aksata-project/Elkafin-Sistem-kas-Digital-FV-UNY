import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config.js';
import { state, getWeeklyTarget, getMaxWeek, formatWeekRange } from '../store/state.js';
import { formatCurrency } from '../utils/format.js';
import { showAlert, showToast } from '../utils/toast.js';
import { findStudentByNim } from '../ui/navigation.js';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Export the current filtered table to Excel or PDF.
 * @param {'excel'|'pdf'} type
 */
export function handleExport(type) {
    const table = document.getElementById('kas-table');
    if (!table) { showAlert('error', 'Gagal', 'Tabel tidak ditemukan.'); return; }

    const rows = Array.from(table.querySelectorAll('tbody tr'));
    if (rows.length === 0) { showAlert('info', 'Kosong', 'Tidak ada data untuk diekspor.'); return; }

    const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
    const dataRows = rows.map(row => Array.from(row.querySelectorAll('td')).map(td => td.textContent.trim()));

    if (type === 'excel') {
        const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Kas');
        XLSX.writeFile(wb, 'Rekap_Kas.xlsx');
        showToast('success', 'Data berhasil diekspor ke Excel.');
    } else if (type === 'pdf') {
        const docPdf = new jsPDF({ orientation: 'landscape' });
        docPdf.text('Rekap Kas Angkatan', 14, 16);
        docPdf.autoTable({
            head: [headers],
            body: dataRows,
            startY: 22,
            styles: { fontSize: 7, cellPadding: 2 },
            headStyles: { fillColor: [59, 130, 246] },
        });
        docPdf.save('Rekap_Kas.pdf');
        showToast('success', 'Data berhasil diekspor ke PDF.');
    }
}

/**
 * Export a full semester report (income + expenses + tunggakan) to Excel.
 * Uses all data already loaded in state — no date filtering needed.
 */
export async function handleSemesterReportExport() {
    const btn = document.getElementById('download-semester-report-btn');
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Memproses...';
    }

    try {
        const wb = XLSX.utils.book_new();
        const { formatDateTime } = await import('../utils/format.js');
        const semesterLabel = state.semester.label || 'Tanpa_Label';

        // ─── Sheet 1: Seluruh Pemasukan ───────────────────────────────────
        const incomeData = state.kasTransactions.map(t => {
            const student = findStudentByNim(t.nim);
            return [
                t.id,
                t.nim,
                student?.name || '?',
                t.week,
                formatWeekRange(t.week) || '-',
                t.amount,
                t.paymentMethod || '-',
                t.bankName || '-',
                t.recordedByName || '-',
                formatDateTime(t.timestamp)
            ];
        });
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
            ['ID Transaksi', 'NIM', 'Nama', 'Minggu ke-', 'Periode', 'Jumlah', 'Metode', 'Bank', 'Dicatat Oleh', 'Tanggal'],
            ...incomeData
        ]), 'Pemasukan');

        // ─── Sheet 2: Seluruh Pengeluaran ─────────────────────────────────
        const expenseData = state.kasExpenses.map(e => [
            e.id,
            e.description,
            e.category,
            e.amount,
            e.recordedByName || '-',
            formatDateTime(e.timestamp)
        ]);
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
            ['ID Transaksi', 'Deskripsi', 'Kategori', 'Jumlah', 'Dicatat Oleh', 'Tanggal'],
            ...expenseData
        ]), 'Pengeluaran');

        // ─── Sheet 3: Rekap Tunggakan ─────────────────────────────────────
        const maxWeek = getMaxWeek();
        const weeks = Array.from({ length: maxWeek }, (_, i) => i + 1);

        const paidSet = new Set(
            state.kasTransactions.filter(t => t.amount > 0).map(t => `${t.nim}-${t.week}`)
        );

        const tunggakanHeaders = ['NIM', 'Nama', 'Kelas Teori', 'Kelas Praktik', 'Minggu Belum Bayar', 'Jumlah Minggu', 'Total Tunggakan (Rp)'];
        const tunggakanData = state.allStudents.map(student => {
            const unpaidWeeks = weeks.filter(w => !paidSet.has(`${student.nim}-${w}`));
            if (unpaidWeeks.length === 0) return null;

            const totalDebt = unpaidWeeks.reduce((sum, w) => sum + getWeeklyTarget(w), 0);
            return [
                student.nim,
                student.name,
                student.theoryClass,
                student.practiceClass,
                unpaidWeeks.join(', '),
                unpaidWeeks.length,
                totalDebt
            ];
        }).filter(Boolean);

        tunggakanData.sort((a, b) => b[6] - a[6]);
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([tunggakanHeaders, ...tunggakanData]), 'Rekap Tunggakan');

        const safeLabel = semesterLabel.replace(/[^a-zA-Z0-9_\- ]/g, '_');
        XLSX.writeFile(wb, `Laporan_Semester_${safeLabel}.xlsx`);
        showToast('success', `Laporan semester "${semesterLabel}" telah diunduh (3 sheet).`);
    } catch (error) {
        console.error('handleSemesterReportExport error:', error);
        showAlert('error', 'Gagal', 'Gagal mengunduh laporan semester.');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = 'Unduh Laporan Semester';
        }
    }
}
