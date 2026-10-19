# Persona dan Permasalahan
Persona yang saya dapatkan adalah pekerja lepas (freelancer) yang penghasilannya datang per proyek dan sering mengalami klien terlambat membayar.

Permasalahan yang sering dialami freelancer adalah sulit mengetahui uang yang benar-benar sudah dimiliki. Setelah pekerjaan selesai, pembayaran dari klien sering tertunda. Kalau tagihan yang belum dibayar langsung dicatat sebagai pemasukan, saldo terlihat besar padahal uangnya belum diterima. Sebaliknya, kalau tagihan tidak dicatat sama sekali, freelancer mudah lupa berapa uang yang masih harus ditagih dan dari klien mana.

Untuk mengatasi permasalahan tersebut, saya membuat website Catatan Freelancer, yaitu aplikasi pencatatan keuangan yang memungkinkan pengguna mencatat pemasukan dan pengeluaran, melihat riwayat transaksi, serta memantau saldo.

Fitur khas dari web ini adalah pencatatan tagihan ke klien dengan status "belum dibayar" atau "lunas". Tagihan yang belum dibayar tidak dihitung sebagai pemasukan, tetapi masuk ke Total Piutang. Setelah tombol "Tandai Lunas" diklik, tagihan tersebut otomatis menjadi pemasukan dan saldo bertambah. Dengan fitur tersebut, freelancer dapat membedakan uang yang sudah dimiliki dan uang yang masih ditunggu dari klien.

# Rancangan Struktur Data
Semua transaksi disimpan dalam satu array. Tagihan klien memakai array yang sama, dibedakan oleh `jenis: "tagihan"` dan field `status`.

```js
const dataBaru = {
    id: Date.now(),
    tanggal: tanggal,
    jenis: jenis,         
    kategori: kategori,
    nominal: nominal,
    catatan: catatan,
    klien: jenis === "tagihan" ? klien : "",
    status: jenis === "tagihan" ? selectStatus.value : ""   // "belum" atau "lunas"
};
```

Data disimpan menggunakan `localStorage` dengan format JSON.

Aturan perhitungan ringkasan:
- Pemasukan = transaksi `pemasukan` + tagihan berstatus `lunas`
- Pengeluaran = transaksi `pengeluaran`
- Total Piutang = tagihan berstatus `belum`
- Saldo = Pemasukan - Pengeluaran

# Keputusan Desain
Saya memilih menyimpan tagihan di array yang sama dengan transaksi lain, dan tidak membuat salinan pemasukan baru saat tagihan lunas. Pemasukan dari tagihan dihitung saat ringkasan dibuat, yaitu dengan mengecek `status`.

Alasannya, kalau tagihan yang lunas disalin menjadi transaksi pemasukan baru, satu pekerjaan tercatat dua kali dan total bisa salah. Dengan cara ini, cukup mengubah status dari `belum` menjadi `lunas`, lalu piutang berkurang dan pemasukan bertambah secara otomatis. Cara ini juga sesuai ketentuan bahwa fitur khas harus memakai data yang sama di `localStorage`.

# Bug dan Kendala yang Ditemui
## Kendala 1: Form Tetap Tersimpan Saat Tanggal, Jenis, atau Kategori Kosong
Saat saya mencoba menekan tombol Tambah dengan tanggal, jenis, atau kategori yang masih kosong, transaksi tetap tersimpan dan muncul baris dengan data yang tidak lengkap.

Masalahnya, validasi awal di JavaScript hanya mengecek keterangan dan nominal. Atribut `required` di HTML juga tidak membantu karena form memakai `novalidate`, sehingga browser tidak ikut memeriksa.

Solusinya adalah menambahkan pengecekan di JavaScript. Jika salah satu field kosong, muncul peringatan di halaman dan data tidak disimpan.

```js
if (tanggal === "" || jenis === "" || kategori === "") {
    pesanError.textContent = "Tanggal, jenis, dan kategori wajib diisi.";
    return;
}
```

Pesan ditampilkan di elemen `<p id="error-message">`, bukan `alert()`. Perintah `return` menghentikan fungsi sehingga data tidak masuk ke array.

## Kendala 2: Nominal 0 atau Negatif Tetap Diterima
Kendala berikutnya muncul ketika saya mengisi nominal `0` atau `-5000`. Transaksi tetap tersimpan, sehingga saldo dan total di kartu ringkasan menjadi tidak masuk akal.

Masalahnya, tidak ada pengecekan nilai nominal. Atribut `min="1"` di HTML tidak berpengaruh karena form memakai `novalidate`. Selain itu, nilai dari input selalu berupa teks, jadi harus diubah menjadi angka dulu sebelum dibandingkan.

Solusinya adalah mengubah nilai input dengan `Number()`, lalu mengecek bahwa nominal tidak kosong, benar-benar angka, dan lebih dari 0.

```js
const nominal = Number(inputNominal.value);

if (inputNominal.value === "" || !Number.isFinite(nominal) || nominal <= 0) {
    pesanError.textContent = "Nominal harus lebih dari 0.";
    return;
}
```

Setelah data berhasil ditambahkan, pesan error dikosongkan kembali dengan `pesanError.textContent = ""`.