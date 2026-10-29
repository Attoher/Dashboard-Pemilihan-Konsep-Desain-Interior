/**
 * Penyimpanan data online (Cloud Firestore).
 * Setiap mahasiswa punya satu dokumen: mahasiswa/{nrp}
 * Field: identitasData, sumberPustakaData, dashboardData, ideasData, winningCategory, updatedAt
 * NRP aktif hanya diingat di tab ini (sessionStorage), tidak ditaruh di URL, supaya hasil
 * mahasiswa lain tidak bisa dibuka sekadar dengan mengganti NRP di link.
 */
const NRP_SESSION_KEY = 'nrpAktif';
const NRP_HANDOFF_KEY = 'nrpTitipan';
const NRP_HANDOFF_TTL = 15000;
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

/** NRP yang sedang dikerjakan di tab ini. ?nrp= di URL sengaja diabaikan (dan dibuang). */
function getNrp() {
    const params = new URLSearchParams(window.location.search);
    if (params.has('nrp')) {
        params.delete('nrp');
        const query = params.toString();
        history.replaceState(null, '', window.location.pathname + (query ? '?' + query : ''));
    }
    try {
        const handoff = takeNrpHandoff();
        if (handoff) sessionStorage.setItem(NRP_SESSION_KEY, handoff);
        const nrp = sessionStorage.getItem(NRP_SESSION_KEY) || '';
        return isValidNrp(nrp) ? nrp : '';
    } catch {
        return '';
    }
}

function setActiveNrp(nrp) {
    try {
        sessionStorage.setItem(NRP_SESSION_KEY, nrp);
    } catch {
        // sessionStorage diblokir: NRP perlu diisi ulang di setiap halaman
    }
}

/**
 * Titipkan NRP untuk tab baru yang akan dibuka (back office). Browser tidak selalu menyalin
 * sessionStorage ke tab baru, jadi NRP dititip sebentar di localStorage dan diambil sekali pakai.
 */
function handOffNrp(nrp) {
    try {
        localStorage.setItem(NRP_HANDOFF_KEY, JSON.stringify({ nrp, at: Date.now() }));
    } catch {
        // localStorage diblokir: halaman tujuan akan meminta NRP diisi
    }
}

function takeNrpHandoff() {
    const raw = localStorage.getItem(NRP_HANDOFF_KEY);
    if (!raw) return '';
    localStorage.removeItem(NRP_HANDOFF_KEY);
    try {
        const { nrp, at } = JSON.parse(raw);
        return Date.now() - at < NRP_HANDOFF_TTL && isValidNrp(nrp) ? nrp : '';
    } catch {
        return '';
    }
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
