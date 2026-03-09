import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config.js';
import { state, getWeeklyTarget } from '../store/state.js';
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
    const week = document.getElementById('kas-filter-week').value;
    const classFilter = document.getElementById('kas-filter-class').value;
    const statusFilter = document.getElementById('kas-filter-status').value;

    let studentsToDisplay = state.allStudents;
    if (classFilter !== 'all') {
        studentsToDisplay = studentsToDisplay.filter(s =>
            classFilter.length === 1 ? s.theoryClass === classFilter : s.practiceClass === classFilter
        );
    }

    const target = getWeeklyTarget(parseInt(week));
    const tableData = studentsToDisplay.map(student => {
        const totalPaid = state.kasTransactions
            .filter(p => p.nim === student.nim && p.week === parseInt(week))
            .reduce((sum, p) => sum + p.amount, 0);
        return { ...student, totalPaid, status: totalPaid >= target ? 'Lunas' : 'Belum Lunas' };
    }).filter(d => statusFilter === 'all' || d.status === statusFilter);

    const headers = ['NIM', 'Nama', 'Kelas', 'Total Setoran', 'Status'];
    const body = tableData.map(d => [d.nim, d.name, d.practiceClass, formatCurrency(d.totalPaid), d.status]);
    const filename = `Laporan_Kas_Minggu_${week}_${new Date().toLocaleDateString('id-ID')}`;

    if (type === 'pdf') {
        const doc = new jsPDF();
        doc.text(`Laporan Kas Angkatan - Minggu ke-${week}`, 14, 16);
        doc.autoTable({ head: [headers], body, startY: 20 });
        doc.save(`${filename}.pdf`);
    } else if (type === 'excel') {
        const ws = XLSX.utils.aoa_to_sheet([headers, ...body]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, `Minggu ${week}`);
        XLSX.writeFile(wb, `${filename}.xlsx`);
    }
}

/**
 * Export a full monthly report (income + expenses) to Excel.
 */
export async function handleMonthlyReportExport() {
    const btn = document.getElementById('download-monthly-report-btn');
    btn.disabled = true;
    btn.textContent = 'Memproses...';

    try {
        const month = parseInt(document.getElementById('report-month').value);
        const year = parseInt(document.getElementById('report-year').value);

        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 1);
        const startTimestamp = Timestamp.fromDate(startDate);
        const endTimestamp = Timestamp.fromDate(endDate);

        const incomeQuery = query(collection(db, 'kas_transactions'), where('timestamp', '>=', startTimestamp), where('timestamp', '<', endTimestamp));
        const expenseQuery = query(collection(db, 'kas_expenses'), where('timestamp', '>=', startTimestamp), where('timestamp', '<', endTimestamp));

        const [incomeSnapshot, expenseSnapshot] = await Promise.all([getDocs(incomeQuery), getDocs(expenseQuery)]);

        const wb = XLSX.utils.book_new();

        const { formatDateTime } = await import('../utils/format.js');
        const incomeData = incomeSnapshot.docs.map(d => {
            const t = d.data();
            return [d.id, t.nim, findStudentByNim(t.nim)?.name || '?', t.week, t.amount, t.paymentMethod, t.bankName || '-', t.recordedByName, formatDateTime(t.timestamp)];
        });
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['ID Transaksi','NIM','Nama','Minggu ke-','Jumlah','Metode','Bank','Dicatat Oleh','Tanggal'], ...incomeData]), 'Pemasukan');

        const expenseData = expenseSnapshot.docs.map(d => {
            const e = d.data();
            return [d.id, e.description, e.category, e.amount, e.recordedByName, formatDateTime(e.timestamp)];
        });
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['ID Transaksi','Deskripsi','Kategori','Jumlah','Dicatat Oleh','Tanggal'], ...expenseData]), 'Pengeluaran');

        const monthName = document.getElementById('report-month').options[month].text;
        XLSX.writeFile(wb, `Laporan_Kas_${monthName}_${year}.xlsx`);
        showToast('success', 'Laporan bulanan telah diunduh.');
    } catch (error) {
        console.error('handleMonthlyReportExport error:', error);
        showAlert('error', 'Gagal', 'Gagal mengunduh laporan bulanan.');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Unduh Laporan';
    }
}
