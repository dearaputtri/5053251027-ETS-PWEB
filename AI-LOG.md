Prompt : bagaimana kode pada css agar header posisi nya tetap saat di scroll?
Jawaban : 
- Pakai position: sticky di CSS header
- position: sticky membuat header ikut bergulir seperti biasa, lalu menempel saat mencapai batas yang ditentukan.
- top: 0 menentukan batas itu, yaitu menempel tepat di tepi atas layar.
- z-index: 10 membuat header berada di atas isi halaman, supaya kartu dan tabel tidak menimpanya saat lewat di bawahnya.
Yang diperbaiki : 
dari=> 
header {
    background-color: lightblue;
    color: black;
    top: 0;
    z-index: 10;
}
menjaadi => 
header {
    background-color: lightblue;
    color: black;
    position: sticky;
    top: 0;
    z-index: 10;
}

--------

Prompt : Apa penyebab data tidak muncul di tabel (dengan mengirimkan html dan js saya)
Jawaban : 
- `tbody` di HTML memakai `class="riwayat-transaksi"`, sedangkan JS mencarinya dengan `getElementById("riwayat-transaksi")`, sehingga elemennya tidak ketemu (`null`) dan tabel tidak digambar.
- Blok `submit` tertulis dua kali karena salah tempel, sehingga handler klik Hapus dan Tandai Lunas hilang dan pesan error muncul padahal data sudah masuk.
Yang diperbaiki :
dari =>
<tbody class="riwayat-transaksi"></tbody>
menjadi=>
<tbody id="riwayat-transaksi"></tbody>

--------

Prompt : Bagaimana agar data jadi persisten yangmana akan tetap muncul meskipun di reload?
Jawaban : 
- Pakai `localStorage` bawaan browser, karena datanya tidak hilang saat halaman di-refresh atau browser ditutup.
- `localStorage` hanya bisa menyimpan teks, jadi array diubah dulu dengan `JSON.stringify()` saat menyimpan, dan dikembalikan dengan `JSON.parse()` saat dimuat.
- Data dimuat sekali saat halaman dibuka, dan disimpan setiap kali ada perubahan (tambah, hapus, tandai lunas).
- Pemuatan dibungkus `try/catch` supaya aplikasi tidak error kalau isi storage rusak atau masih kosong.
Yang diperbaiki : 
dari =>
let transaksi = [
    { id: 1, keterangan: "Gaji Bulanan", nominal: 5000000, tipe: "pemasukan" },
    { id: 2, keterangan: "Belanja Bulanan", nominal: 1500000, tipe: "pengeluaran" }
];
Menjadi =>
const KUNCI_STORAGE = "catatan-freelancer";

let transaksi = muatData();

function muatData() {
    try {
        const data = JSON.parse(localStorage.getItem(KUNCI_STORAGE));
        return Array.isArray(data) ? data : [];
    } catch (error) {
        return [];
    }
}

function simpanData() {
    localStorage.setItem(KUNCI_STORAGE, JSON.stringify(transaksi));
}

function perbarui() {
    simpanData();
    updateRingkasan();
    tampilkanRiwayat();
}

---------

beberapa prompt untuk pengaplikasian lainnya belum bisa saya masukkan karena keterbatasan waktu pengumpulan.