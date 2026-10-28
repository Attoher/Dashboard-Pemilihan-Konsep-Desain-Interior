/**
 * Penyimpanan data online (Cloud Firestore).
 * Setiap mahasiswa punya satu dokumen: mahasiswa/{nrp}
 * Field: identitasData, sumberPustakaData, dashboardData, ideasData, winningCategory, updatedAt
 * NRP dibawa antar halaman lewat query string (?nrp=...).
 */
const NRP_PATTERN = /^[A-Za-z0-9_-]{3,30}$/;
const SAVE_DELAY = 500;

let firestore = null;
if (firebaseConfig.projectId) {
    firebase.initializeApp(firebaseConfig);
    firestore = firebase.firestore();
} else {
    console.error('Firebase belum dikonfigurasi. Isi js/firebase-config.js terlebih dahulu.');
}

let pendingNrp = '';
let pendingWrites = {};
let saveTimer = null;
let activeSave = Promise.resolve();

function isValidNrp(nrp) {
    return NRP_PATTERN.test(nrp || '');
}

function getNrp() {
    const nrp = new URLSearchParams(window.location.search).get('nrp') || '';
    return isValidNrp(nrp) ? nrp : '';
}

function withNrp(url, nrp) {
    const value = nrp || getNrp();
    if (!value) return url;
    return url + (url.includes('?') ? '&' : '?') + 'nrp=' + encodeURIComponent(value);
}

function mahasiswaDoc(nrp) {
    if (!firestore) throw new Error('Firebase belum dikonfigurasi (js/firebase-config.js).');
    return firestore.collection('mahasiswa').doc(nrp);
}

async function loadMahasiswa(nrp) {
    const snap = await mahasiswaDoc(nrp).get();
    return snap.exists ? snap.data() : null;
}

// Simpan satu field (ditunda sebentar supaya ketikan beruntun digabung jadi satu write)
function saveMahasiswaField(nrp, field, value) {
    if (pendingNrp && pendingNrp !== nrp) flushMahasiswa();
    pendingNrp = nrp;
    // Round-trip JSON: elemen array kosong (sparse) jadi null, Firestore tidak menerima undefined
    pendingWrites[field] = JSON.parse(JSON.stringify(value));
    clearTimeout(saveTimer);
    saveTimer = setTimeout(flushMahasiswa, SAVE_DELAY);
}

// Kirim semua perubahan yang tertunda. Panggil (dan tunggu) sebelum pindah halaman.
function flushMahasiswa() {
    clearTimeout(saveTimer);
    const fields = Object.keys(pendingWrites);
    if (!pendingNrp || fields.length === 0) return activeSave;

    const payload = pendingWrites;
    payload.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
    const ref = mahasiswaDoc(pendingNrp);
    pendingWrites = {};

    // mergeFields: field yang dikirim diganti utuh, field lain di dokumen tidak tersentuh
    activeSave = activeSave
        .then(() => ref.set(payload, { mergeFields: Object.keys(payload) }))
        .catch(err => {
            console.error('Gagal menyimpan ke Firestore', err);
            showAlert('Gagal menyimpan data ke server. Periksa koneksi internet Anda.', 'error');
        });
    return activeSave;
}

window.addEventListener('pagehide', flushMahasiswa);
