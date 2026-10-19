const form = document.getElementById("formtransaksi");
const inputTanggal = document.getElementById("tanggal");
const selectJenis = document.getElementById("jenis");
const selectKategori = document.getElementById("kategori");
const inputKlien = document.getElementById("klien");
const selectStatus = document.getElementById("status");
const inputNominal = document.getElementById("nominal");
const inputCatatan = document.getElementById("catatan");
const fieldTagihan = document.getElementById("field-tagihan");
const pesanError = document.getElementById("error-message");
const tabelRiwayat = document.getElementById("riwayat-transaksi");
const pesanKosong = document.getElementById("kosong");

const tampilanSaldo = document.getElementById("total-saldo");
const tampilanPemasukan = document.getElementById("total-pemasukan");
const tampilanPengeluaran = document.getElementById("total-pengeluaran");
const tampilanPiutang = document.getElementById("total-piutang");

//data dan konstanta
const KUNCI_STORAGE = "catatan-freelancer";

const kategoriJasa = [
    "Content Writer", "Graphic Designer", "Translator", "Fotografer",
    "Programmer", "Virtual Assistant", "Tutor Online", "Content Creator"
];

const kategoriPerJenis = {
    pemasukan: kategoriJasa,
    tagihan: kategoriJasa,
    pengeluaran: ["Internet", "Software", "Transport", "Peralatan", "Pajak", "Lainnya"]
};

const namaJenis = {
    pemasukan: "Pemasukan",
    pengeluaran: "Pengeluaran",
    tagihan: "Tagihan"
};

let transaksi = muatData();

//localStorage
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

//format tampilan
const pemformatRupiah = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
});

function formatRupiah(angka) {
    return pemformatRupiah.format(angka);
}

function formatTanggal(iso) {
    const [tahun, bulan, hari] = iso.split("-");
    return hari + "/" + bulan + "/" + tahun;
}

//dropdown kategori
function isiKategori() {
    selectKategori.replaceChildren();

    const placeholder = new Option("Pilih kategori", "", true, true);
    placeholder.disabled = true;
    selectKategori.appendChild(placeholder);

    const daftar = kategoriPerJenis[selectJenis.value] || [];
    for (const nama of daftar) {
        selectKategori.appendChild(new Option(nama, nama));
    }
}

selectJenis.addEventListener("change", function () {
    isiKategori();
    fieldTagihan.hidden = selectJenis.value !== "tagihan";
});

//ringkasan
function updateRingkasan() {
    let totalPemasukan = 0;
    let totalPengeluaran = 0;
    let totalPiutang = 0;

    for (const item of transaksi) {
        if (item.jenis === "pemasukan") {
            totalPemasukan += item.nominal;
        } else if (item.jenis === "pengeluaran") {
            totalPengeluaran += item.nominal;
        } else if (item.jenis === "tagihan") {
            if (item.status === "lunas") {
                totalPemasukan += item.nominal;
            } else {
                totalPiutang += item.nominal;
            }
        }
    }

    tampilanSaldo.textContent = formatRupiah(totalPemasukan - totalPengeluaran);
    tampilanPemasukan.textContent = formatRupiah(totalPemasukan);
    tampilanPengeluaran.textContent = formatRupiah(totalPengeluaran);
    tampilanPiutang.textContent = formatRupiah(totalPiutang);
}

//riwayat transaksi
function buatSel(teks, kelas) {
    const sel = document.createElement("td");
    sel.textContent = teks;
    if (kelas) {
        sel.className = kelas;
    }
    return sel;
}

function buatTombol(teks, kelas, id) {
    const tombol = document.createElement("button");
    tombol.type = "button";
    tombol.className = kelas;
    tombol.textContent = teks;
    tombol.dataset.id = id;
    return tombol;
}

function tampilkanRiwayat() {
    tabelRiwayat.replaceChildren();

    const urut = [...transaksi].sort(function (a, b) {
        return b.tanggal.localeCompare(a.tanggal) || b.id - a.id;
    });

    pesanKosong.hidden = urut.length > 0;

    for (const item of urut) {
        const baris = document.createElement("tr");

        let klienStatus = "-";
        if (item.jenis === "tagihan") {
            const teksStatus = item.status === "lunas" ? "Lunas" : "Belum dibayar";
            klienStatus = item.klien + " (" + teksStatus + ")";
        }

        const kolomAksi = document.createElement("td");
        if (item.jenis === "tagihan" && item.status !== "lunas") {
            kolomAksi.appendChild(buatTombol("Tandai Lunas", "btn-lunas", item.id));
        }
        kolomAksi.appendChild(buatTombol("Hapus", "btn-hapus", item.id));

        baris.append(
            buatSel(formatTanggal(item.tanggal)),
            buatSel(namaJenis[item.jenis], item.jenis),
            buatSel(item.kategori),
            buatSel(klienStatus),
            buatSel(formatRupiah(item.nominal), item.jenis),
            buatSel(item.catatan || "-"),
            kolomAksi
        );

        tabelRiwayat.appendChild(baris);
    }
}

function perbarui() {
    simpanData();
    updateRingkasan();
    tampilkanRiwayat();
}

//submit dan validasi
form.addEventListener("submit", function (event) {
    event.preventDefault();

    const tanggal = inputTanggal.value;
    const jenis = selectJenis.value;
    const kategori = selectKategori.value;
    const klien = inputKlien.value.trim();
    const nominal = Number(inputNominal.value);
    const catatan = inputCatatan.value.trim();

    if (tanggal === "" || jenis === "" || kategori === "") {
        pesanError.textContent = "Tanggal, jenis, dan kategori wajib diisi.";
        return;
    }

    if (jenis === "tagihan" && klien === "") {
        pesanError.textContent = "Nama klien wajib diisi untuk tagihan.";
        return;
    }

    if (inputNominal.value === "" || !Number.isFinite(nominal) || nominal <= 0) {
        pesanError.textContent = "Nominal harus lebih dari 0.";
        return;
    }

    transaksi.push({
        id: Date.now(),
        tanggal: tanggal,
        jenis: jenis,
        kategori: kategori,
        nominal: nominal,
        catatan: catatan,
        klien: jenis === "tagihan" ? klien : "",
        status: jenis === "tagihan" ? selectStatus.value : ""
    });

    pesanError.textContent = "";
    form.reset();
    fieldTagihan.hidden = true;
    isiKategori();
    perbarui();
});

//klik hapus/tandai lunas
tabelRiwayat.addEventListener("click", function (event) {
    const tombolHapus = event.target.closest(".btn-hapus");
    const tombolLunas = event.target.closest(".btn-lunas");

    if (tombolHapus) {
        const id = Number(tombolHapus.dataset.id);
        if (!confirm("Yakin ingin menghapus transaksi ini?")) {
            return;
        }
        transaksi = transaksi.filter(function (item) {
            return item.id !== id;
        });
        perbarui();
    }

    if (tombolLunas) {
        const id = Number(tombolLunas.dataset.id);
        const target = transaksi.find(function (item) {
            return item.id === id;
        });
        if (target) {
            target.status = "lunas";
            perbarui();
        }
    }
});

isiKategori();
updateRingkasan();
tampilkanRiwayat();