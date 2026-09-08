import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config.js';

export async function seedDummyData() {
    console.log("🌱 Seeding dummy data...");

    // 1. Active Students
    const studentsData = [
        // Kelas C1
        { nim: '25090620001', name: 'Ibnu Fikri Ardiansyah', practiceClass: 'C1', theoryClass: 'C', email: 'ibnufikri.2025@student.uny.ac.id', status: 'active' },
        { nim: '25090620002', name: 'Faiza Julia Rahma', practiceClass: 'C1', theoryClass: 'C', email: 'faizajulia.2025@student.uny.ac.id', status: 'active' },
        { nim: '25090620003', name: 'Ahmad Zaki Mualim', practiceClass: 'C1', theoryClass: 'C', email: 'ahmadzaki.2025@student.uny.ac.id', status: 'active' },
        { nim: '25090620004', name: 'Widya Kaila Putri', practiceClass: 'C1', theoryClass: 'C', email: 'widyakaila.2025@student.uny.ac.id', status: 'active' },
        { nim: '25090620005', name: 'Maulana Marsaa', practiceClass: 'C1', theoryClass: 'C', email: 'maulanamarsaa.2025@student.uny.ac.id', status: 'active' },
        { nim: '25090620006', name: 'Muhammad Syawalino Anandra', practiceClass: 'C1', theoryClass: 'C', email: 'muhammadsyawalino.2025@student.uny.ac.id', status: 'active' },
        { nim: '25090620007', name: 'Azalia Kayana Pasha', practiceClass: 'C1', theoryClass: 'C', email: 'azaliakayana.2025@student.uny.ac.id', status: 'active' },
        { nim: '25090620009', name: 'Ahmad Khoir Mustajib', practiceClass: 'C1', theoryClass: 'C', email: 'ahmadkhoir.2025@student.uny.ac.id', status: 'active' },
        { nim: '25090620010', name: 'Fatih Paruda Pradayan', practiceClass: 'C1', theoryClass: 'C', email: 'fatihparuda.2025@student.uny.ac.id', status: 'active' },
        { nim: '25090620011', name: 'Restu Aji Dwi Nurcahya', practiceClass: 'C1', theoryClass: 'C', email: 'restuaji.2025@student.uny.ac.id', status: 'active' },
        { nim: '25090620012', name: 'Danish Azhaki Nararya', practiceClass: 'C1', theoryClass: 'C', email: 'Danishazhaki.2025@student.uny.ac.id', status: 'active' },
        { nim: '25090620013', name: 'Carolina Yessa Eka Nugraheni', practiceClass: 'C1', theoryClass: 'C', email: 'carolinayessa.2025@student.uny.ac.id', status: 'active' },
        { nim: '25090620014', name: 'Evra Ahnaf Yolan', practiceClass: 'C1', theoryClass: 'C', email: 'evraahnaf.2025@student.uny.ac.id', status: 'active' },
        { nim: '25090620015', name: 'Anggit Vino Alfathir', practiceClass: 'C1', theoryClass: 'C', email: 'anggitvino.2025@student.uny.ac.id', status: 'active' },
        // Kelas C2
        { nim: '25090620016', name: 'Mukhammad Rusdi Khakim', practiceClass: 'C2', theoryClass: 'C', email: 'mukhammadrusdi.2025@student.uny.ac.id', status: 'active' },
        { nim: '25090620017', name: 'Khoirul Azzam Mubarok', practiceClass: 'C2', theoryClass: 'C', email: 'khoirulazzam.2025@student.uny.ac.id', status: 'active' },
        { nim: '25090620018', name: 'Fatchurrohman', practiceClass: 'C2', theoryClass: 'C', email: 'fatchurrohmanfv.2025@student.uny.ac.id', status: 'active' },
        { nim: '25090620019', name: 'Aditiya Farel Muhammad', practiceClass: 'C2', theoryClass: 'C', email: 'adityafarrel.2025@student.uny.ac.id', status: 'active' },
        { nim: '25090620020', name: 'Rafif Abhyasakhi Pradenandana', practiceClass: 'C2', theoryClass: 'C', email: 'rafifabhyasakhi.2025@student.uny.ac.id', status: 'active' },
        { nim: '25090620021', name: 'Farah Naura Lutfiani', practiceClass: 'C2', theoryClass: 'C', email: 'farahnaura.2025@student.uny.ac.id', status: 'active' },
        { nim: '25090620022', name: 'Muhammad Ilham Wicaksono', practiceClass: 'C2', theoryClass: 'C', email: 'muhammadilham.2025@student.uny.ac.id', status: 'active' },
        { nim: '25090620023', name: 'Denta Hero Pradana', practiceClass: 'C2', theoryClass: 'C', email: 'dentahero.2025@student.uny.ac.id', status: 'active' },
        { nim: '25090620024', name: 'Arwi Kafka Wardhana', practiceClass: 'C2', theoryClass: 'C', email: 'arwi0054fv.2025@student.uny.ac.id', status: 'active' },
        { nim: '25090620025', name: 'Yuda Waskito', practiceClass: 'C2', theoryClass: 'C', email: 'yudawaskito.2025@student.uny.ac.id', status: 'active' },
        { nim: '25090620026', name: 'Aldi Nour Fiqri Ramadan', practiceClass: 'C2', theoryClass: 'C', email: 'aldinour.2025@student.uny.ac.id', status: 'active' },
        { nim: '25090620027', name: 'Danang Lutviyanto', practiceClass: 'C2', theoryClass: 'C', email: 'dananglutviyanto.2025@student.uny.ac.id', status: 'active' },
        { nim: '25090620028', name: 'Prita Clarisa', practiceClass: 'C2', theoryClass: 'C', email: 'pritaclarisa.2025@student.uny.ac.id', status: 'active' },
        { nim: '25090620029', name: 'Akbar Angzililminan', practiceClass: 'C2', theoryClass: 'C', email: 'akbar101fv.2025@student.uny.ac.id', status: 'active' },
        { nim: '25090620030', name: 'Tegar Fasihuddin Antoro', practiceClass: 'C2', theoryClass: 'C', email: 'tegarfasihuddin.2025@student.uny.ac.id', status: 'active' },
        // Kelas D1
        { nim: '25090620031', name: 'Helmy Khairi Rauf', practiceClass: 'D1', theoryClass: 'D', email: 'helmy7fv.2025@student.uny.ac.id', status: 'active' },
        { nim: '25090620032', name: 'Anindya Yulisa Rinjani', practiceClass: 'D1', theoryClass: 'D', email: 'anindyayulisa.2025@student.uny.ac.id', status: 'active' },
        { nim: '25090620033', name: 'Miftahul Andrianto', practiceClass: 'D1', theoryClass: 'D', email: 'miftahul35.2025@student.uny.ac.id', status: 'active' },
        { nim: '25090620034', name: 'Muhammad Fahrel Ardiansyah', practiceClass: 'D1', theoryClass: 'D', email: 'muhammadfahrel.2025@student.uny.ac.id', status: 'active' },
        { nim: '25090620035', name: 'Purbo Danies Setyawan', practiceClass: 'D1', theoryClass: 'D', email: 'purbodanies.2025@student.uny.ac.id', status: 'active' },
        { nim: '25090620038', name: 'Erlanda Jalu Prasetyo', practiceClass: 'D1', theoryClass: 'D', email: 'Erlandajalupra0457@student.uny.ac.id', status: 'active' },
        { nim: '25090620039', name: 'Safira Nadina Zahra', practiceClass: 'D1', theoryClass: 'D', email: 'safiranadina.2025@student.uny.ac.id', status: 'active' },
        { nim: '25090620040', name: 'Rizky Ridho Maghribi', practiceClass: 'D1', theoryClass: 'D', email: 'rizkyridho.2025@student.uny.ac.id', status: 'active' },
        { nim: '25090620041', name: 'Melyssa Primadani', practiceClass: 'D1', theoryClass: 'D', email: 'melyssaprimadani.2025@student.uny.ac.id', status: 'active' },
        { nim: '25090620042', name: 'Dhiandra Rakha Naufali', practiceClass: 'D1', theoryClass: 'D', email: 'dhiandrarakha.2025@student.uny.ac.id', status: 'active' },
        { nim: '25090620043', name: 'Haydar Rafi Haqqani', practiceClass: 'D1', theoryClass: 'D', email: 'haydarrafi.2025@student.uny.ac.id', status: 'active' },
        { nim: '25090620044', name: 'Fauzi Abdillah', practiceClass: 'D1', theoryClass: 'D', email: 'fauziabdillah.2025@student.uny.ac.id', status: 'active' },
        { nim: '25090620045', name: 'Ryanda Agusta Pratama', practiceClass: 'D1', theoryClass: 'D', email: 'ryandaagusta.2025@student.uny.ac.id', status: 'active' },
        // Kelas D2
        { nim: '25090620046', name: 'Farih Dwi Azar A', practiceClass: 'D2', theoryClass: 'D', email: 'farihdwi.2025@student.uny.ac.id', status: 'active' },
        { nim: '25090620047', name: 'Yazid Rizki Nafik', practiceClass: 'D2', theoryClass: 'D', email: 'yazidrizki.2025@student.uny.ac.id', status: 'active' },
        { nim: '25090620048', name: 'Fakhri Riski Fadillah', practiceClass: 'D2', theoryClass: 'D', email: 'fakhririski.2025@student.uny.ac.id', status: 'active' },
        { nim: '25090620049', name: 'Firmansyah Adi Saputra', practiceClass: 'D2', theoryClass: 'D', email: 'firmansyahadi.2025@student.uny.ac.id', status: 'active' },
        { nim: '25090620050', name: 'Zalfa Arofal', practiceClass: 'D2', theoryClass: 'D', email: 'zalfaarofal.2025@student.uny.ac.id', status: 'active' },
        { nim: '25090620051', name: 'Olsa Ananda Raymuna', practiceClass: 'D2', theoryClass: 'D', email: 'olsaananda.2025@student.uny.ac.id', status: 'active' },
        { nim: '25090620052', name: 'Murniati', practiceClass: 'D2', theoryClass: 'D', email: 'murniati19fv.2025@student.uny.ac.id', status: 'active' },
        { nim: '25090620054', name: 'Nivedita Vega Putri Suyudianto', practiceClass: 'D2', theoryClass: 'D', email: 'niveditavega.2025@student.uny.ac.id', status: 'active' },
        { nim: '25090620055', name: 'Muhammad Rifzkhy All Fhayed', practiceClass: 'D2', theoryClass: 'D', email: 'muhammad617.2025@student.uny.ac.id', status: 'active' },
        { nim: '25090620056', name: 'Nafys Mawlana Rahman', practiceClass: 'D2', theoryClass: 'D', email: 'nafys0fv.2025@student.uny.ac.id', status: 'active' },
        { nim: '25090620057', name: 'Sidqi Wahyu Prasodjo', practiceClass: 'D2', theoryClass: 'D', email: 'sidqiwahyu.2025@student.uny.ac.id', status: 'active' },
        { nim: '25090620058', name: 'Bayu Aji Wibowo', practiceClass: 'D2', theoryClass: 'D', email: 'bayu397.2025@student.uny.ac.id', status: 'active' },
        { nim: '25090620059', name: 'Siti Acnitia', practiceClass: 'D2', theoryClass: 'D', email: 'sitiacnitia.2025@student.uny.ac.id', status: 'active' },
        { nim: '25090620060', name: 'Aden Nur Alzah Maligana', practiceClass: 'D2', theoryClass: 'D', email: 'aden41fv.2025@student.uny.ac.id', status: 'active' }
    ];

    try {
        // 2. Loop untuk memasukkan mahasiswa ke Firestore
        for (const s of studentsData) {
            await setDoc(doc(db, 'students', s.nim), s);
        }
        console.log(`✅ ${studentsData.length} Mahasiswa berhasil dimasukkan.`);

        // 3. Set role Admin (Ilham)
        await setDoc(doc(db, 'roles', '25090620022'), { role: 'bendahara_angkatan' });
        console.log("✅ Role Admin berhasil diatur.");

        // 4. Inisialisasi Konfigurasi Dasar
        await setDoc(doc(db, 'internal_config', 'carry_over'), { teori_c: 0, teori_d: 0, angkatan: 0 });

        const today = new Date().toISOString().split('T')[0];
        await setDoc(doc(db, 'internal_config', 'semester'), {
            label: 'Semester Baru',
            startDate: today,
            weeklyAmount: 2000,
        });
        console.log("✅ Konfigurasi semester berhasil diset.");

        console.log("🎉 Seeding selesai! Silakan refresh halaman website Anda.");
        alert("Data berhasil dimasukkan! Halaman akan dimuat ulang.");
        window.location.reload();

    } catch (error) {
        console.error("❌ Gagal seeding:", error);
        alert("Gagal memasukkan data: " + error.message);
    }
}
