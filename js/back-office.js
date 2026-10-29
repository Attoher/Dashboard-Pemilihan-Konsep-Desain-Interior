/**
 * Back office: rekap semua dokumen mahasiswa/{nrp} secara realtime.
 * Dibuka lewat /back-office (tidak ada tautan dari halaman mahasiswa).
 */
const BO_CATEGORIES = {
    internal: {
        name: 'Kinerja Internal',
        short: 'Internal',
        items: [
            { ideaNum: 1, roomNum: 5, title: 'Ide aktivitas/kegiatan penting yang baru' },
            { ideaNum: 2, roomNum: 6, title: 'Ide workflow (urutan pengerjaan tugas) baru' },
            { ideaNum: 3, roomNum: 7, title: 'Ide role/responsibilities (staff) dengan tugas baru' },
            { ideaNum: 4, roomNum: 8, title: 'Ide tools/technologies (peralatan) baru' }
        ]
    },
    customer: {
        name: 'Customer & Experience',
        short: 'Customer',
        items: [
            { ideaNum: 1, roomNum: 4, title: 'Ide mengatasi "pains" (yang tidak diinginkan)' },
            { ideaNum: 2, roomNum: 5, title: 'Ide mewujudkan "gains" (harapan)' },
            { ideaNum: 3, roomNum: 6, title: 'Ide keadaan (konteks) penting yang dihadapi' }
        ]
    },
    competition: {
        name: 'Persaingan',
        short: 'Persaingan',
        items: [
            { ideaNum: 1, roomNum: 7, title: 'Ide strategi sebagai market leader' },
            { ideaNum: 2, roomNum: 8, title: 'Ide strategi sebagai market challenger' },
            { ideaNum: 3, roomNum: 9, title: 'Ide strategi sebagai market follower' },
            { ideaNum: 4, roomNum: 10, title: 'Ide strategi sebagai market nicher' },
            { ideaNum: 5, roomNum: 11, title: 'Ide Unique Selling Propositions (USP) atau Value Propositions' },
            { ideaNum: 6, roomNum: 12, title: 'Ide event atau aktivitas baru' }
        ]
    }
};
const BO_TYPES = ['internal', 'customer', 'competition'];

let boRecords = [];

// Isian mahasiswa ditampilkan di teks maupun atribut (href), jadi tanda kutip ikut di-escape
const BO_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
function boEscape(text) {
    return (text == null ? '' : String(text)).replace(/[&<>"']/g, ch => BO_ESCAPES[ch]);
}

function boAverage(dashboard, type) {
    const inputs = dashboard?.[type]?.inputs || [];
    const numbers = inputs.map(v => parseFloat(v)).filter(v => !isNaN(v));
    return numbers.length ? numbers.reduce((a, b) => a + b, 0) / numbers.length : null;
}

/** Sama dengan aturan di halaman hasil: rata-rata tertinggi, seri dimenangkan urutan pertama. */
function boWinner(averages) {
    const [i, c, p] = BO_TYPES.map(t => averages[t] ?? 0);
    if (i === 0 && c === 0 && p === 0) return null;
    if (i >= c && i >= p) return 'internal';
    if (c >= i && c >= p) return 'customer';
    return 'competition';
}

function boIdeaProgress(ideas, category) {
    if (!category) return { done: 0, total: 0, filled: 0 };
    const data = ideas?.[category] || {};
    const items = BO_CATEGORIES[category].items;
    let done = 0;
    let filled = 0;
    for (const item of items) {
        const list = data[`idea_${item.ideaNum}`] || [];
        const rooms = data[`room_${item.roomNum}`] || [];
        const nonEmpty = list.filter(v => v && String(v).trim());
        filled += nonEmpty.length;
        const complete = nonEmpty.length > 0 &&
            list.every((v, i) => v && String(v).trim() && rooms[i] && String(rooms[i]).trim());
        if (complete) done++;
    }
    return { done, total: items.length, filled };
}

function boToRecord(doc) {
    const data = doc.data();
    const averages = {};
    BO_TYPES.forEach(t => { averages[t] = boAverage(data.dashboardData, t); });
    const winner = boWinner(averages);
    const updated = data.updatedAt?.toDate ? data.updatedAt.toDate() : null;
    return {
        nrp: doc.id,
        nama: data.identitasData?.namaMahasiswa || '',
        judul: data.identitasData?.judulTugas || '',
        averages,
        winner,
        sources: (data.sumberPustakaData || []).filter(s => s && String(s).trim()),
        progress: boIdeaProgress(data.ideasData, winner),
        updated,
        raw: data
    };
}

function boFormatDate(date) {
    if (!date) return '-';
    const diff = (Date.now() - date.getTime()) / 1000;
    if (diff < 60) return 'baru saja';
    if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

const boScore = (value) => value == null ? '–' : value.toLocaleString('id-ID', { maximumFractionDigits: 1 });

function boCategoryBadge(category) {
    if (!category) return '<span class="bo-cat bo-cat-none">Belum ada skor</span>';
    return `<span class="bo-cat bo-cat-${category}">${BO_CATEGORIES[category].name}</span>`;
}

function boProgressBar(progress) {
    if (!progress.total) return '<span class="bo-muted">–</span>';
    const pct = Math.round((progress.done / progress.total) * 100);
    return `<div class="bo-progress" title="${progress.done} dari ${progress.total} ide lengkap">
        <div class="bo-progress-bar"><div style="width:${pct}%"></div></div>
        <span>${progress.done}/${progress.total}</span>
    </div>`;
}

function boFiltered() {
    const keyword = document.getElementById('boSearch').value.trim().toLowerCase();
    const category = document.getElementById('boCategory').value;
    const sort = document.getElementById('boSort').value;
    const list = boRecords.filter(r => {
        const text = `${r.nama} ${r.nrp} ${r.judul}`.toLowerCase();
        if (keyword && !text.includes(keyword)) return false;
        if (category === 'belum') return !r.winner;
        return category === 'semua' || r.winner === category;
    });
    const sorters = {
        terbaru: (a, b) => (b.updated?.getTime() || 0) - (a.updated?.getTime() || 0),
        nama: (a, b) => (a.nama || a.nrp).localeCompare(b.nama || b.nrp, 'id'),
        nrp: (a, b) => a.nrp.localeCompare(b.nrp),
        progres: (a, b) => (b.progress.total ? b.progress.done / b.progress.total : -1) -
            (a.progress.total ? a.progress.done / a.progress.total : -1)
    };
    return list.sort(sorters[sort]);
}

function boRenderStats() {
    const total = boRecords.length;
    const complete = boRecords.filter(r => r.progress.total && r.progress.done === r.progress.total).length;
    const counts = Object.fromEntries(BO_TYPES.map(t => [t, boRecords.filter(r => r.winner === t).length]));
    const avgOf = (type) => {
        const values = boRecords.map(r => r.averages[type]).filter(v => v != null);
        return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
    };
    const card = (label, value, hint = '') => `
        <div class="bo-stat">
            <span class="bo-stat-label">${label}</span>
            <strong class="bo-stat-value">${value}</strong>
            ${hint ? `<span class="bo-stat-hint">${hint}</span>` : ''}
        </div>`;
    document.getElementById('boStats').innerHTML =
        card('Mahasiswa', total) +
        card('Ide lengkap', complete, total ? `${Math.round((complete / total) * 100)}% dari semua` : '') +
        BO_TYPES.map(t => card(
            `Pemenang ${BO_CATEGORIES[t].short}`,
            counts[t],
            `rata-rata skor ${boScore(avgOf(t))}`
        )).join('');
}

function boRenderRows() {
    const rows = boFiltered();
    const tbody = document.getElementById('boRows');
    if (!boRecords.length) {
        tbody.innerHTML = '<tr><td colspan="9" class="bo-empty">Belum ada mahasiswa yang mengisi.</td></tr>';
        return;
    }
    if (!rows.length) {
        tbody.innerHTML = '<tr><td colspan="9" class="bo-empty">Tidak ada yang cocok dengan pencarian.</td></tr>';
        return;
    }
    tbody.innerHTML = rows.map(r => `
        <tr data-nrp="${boEscape(r.nrp)}" tabindex="0">
            <td>
                <strong>${boEscape(r.nama || '(tanpa nama)')}</strong>
                <span class="bo-sub">${boEscape(r.nrp)}${r.judul ? ' · ' + boEscape(r.judul) : ''}</span>
            </td>
            <td>${boCategoryBadge(r.winner)}</td>
            ${BO_TYPES.map(t => `<td class="num${r.winner === t ? ' bo-win' : ''}">${boScore(r.averages[t])}</td>`).join('')}
            <td class="num${r.sources.length < 5 ? ' bo-warn' : ''}">${r.sources.length}</td>
            <td>${boProgressBar(r.progress)}</td>
            <td class="bo-muted">${boFormatDate(r.updated)}</td>
            <td class="bo-actions">
                <button type="button" class="bo-delete" data-delete="${boEscape(r.nrp)}" title="Hapus data ${boEscape(r.nama || r.nrp)}" aria-label="Hapus data ${boEscape(r.nama || r.nrp)}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
            </td>
        </tr>`).join('');
}

function boRender() {
    boRenderStats();
    boRenderRows();
    document.getElementById('exportCsv').disabled = boRecords.length === 0;
}

function boOpenDetail(nrp) {
    const r = boRecords.find(x => x.nrp === nrp);
    if (!r) return;
    const dashboard = r.raw.dashboardData || {};
    const ideas = r.raw.ideasData || {};
    const link = (page) => `../${page}?nrp=${encodeURIComponent(r.nrp)}`;

    const scoreBlocks = BO_TYPES.map(t => {
        const data = dashboard[t] || {};
        const inputs = (data.inputs || []).filter(v => v !== '' && v != null);
        const notes = (data.notes || []).filter(Boolean);
        return `<div class="bo-score-card bo-score-${t}${r.winner === t ? ' is-winner' : ''}">
            <div class="bo-score-head"><span>${BO_CATEGORIES[t].name}</span><strong>${boScore(r.averages[t])}</strong></div>
            <p class="bo-muted">Skor: ${inputs.length ? inputs.map(boEscape).join(', ') : '-'}</p>
            ${notes.length ? `<ol>${notes.map(n => `<li>${boEscape(n)}</li>`).join('')}</ol>` : '<p class="bo-muted">Tanpa catatan</p>'}
        </div>`;
    }).join('');

    const sources = r.sources.length
        ? `<ol class="bo-list">${r.sources.map(s => {
            const text = boEscape(s);
            return /^https?:\/\//i.test(s) ? `<li><a href="${text}" target="_blank" rel="noopener noreferrer">${text}</a></li>` : `<li>${text}</li>`;
        }).join('')}</ol>`
        : '<p class="bo-muted">Belum ada sumber pustaka.</p>';

    // Ide & ruangan untuk setiap kategori yang pernah diisi, kategori pemenang lebih dulu
    const ideaCategories = BO_TYPES.filter(t => ideas[t] && Object.keys(ideas[t]).length)
        .sort((a, b) => (b === r.winner) - (a === r.winner));
    const ideaBlocks = ideaCategories.length ? ideaCategories.map(t => `
        <h4 class="bo-h4">${BO_CATEGORIES[t].name}${t === r.winner ? ' <span class="bo-cat bo-cat-' + t + '">pemenang</span>' : ''}</h4>
        ${BO_CATEGORIES[t].items.map(item => {
            const list = ideas[t][`idea_${item.ideaNum}`] || [];
            const rooms = ideas[t][`room_${item.roomNum}`] || [];
            const rows = list.map((idea, i) => idea && String(idea).trim()
                ? `<li>${boEscape(idea)} <span class="bo-room">→ ${boEscape(rooms[i] || 'ruangan belum diisi')}</span></li>` : '').join('');
            return `<div class="bo-idea"><p class="bo-idea-title">#${item.ideaNum} ${boEscape(item.title)}</p>
                ${rows ? `<ul>${rows}</ul>` : '<p class="bo-muted">Belum diisi</p>'}</div>`;
        }).join('')}`).join('') : '<p class="bo-muted">Belum ada ide yang diisi.</p>';

    document.getElementById('boDetailTitle').textContent = r.nama || r.nrp;
    document.getElementById('boDetailBody').innerHTML = `
        <div class="bo-detail-meta">
            <span>NRP <strong>${boEscape(r.nrp)}</strong></span>
            <span>Judul <strong>${boEscape(r.judul || '-')}</strong></span>
            <span>Diperbarui <strong>${boFormatDate(r.updated)}</strong></span>
        </div>
        <div class="bo-detail-actions">
            <a class="btn btn-secondary" href="${link('index.html')}" target="_blank" rel="noopener">Buka dashboard mahasiswa</a>
            <a class="btn btn-primary" href="${link('pages/result.html')}" target="_blank" rel="noopener">Lihat halaman hasil</a>
            <button type="button" class="btn bo-delete-btn" data-delete="${boEscape(r.nrp)}">Hapus data</button>
        </div>
        <h4 class="bo-h4">Skor &amp; catatan</h4>
        <div class="bo-score-grid">${scoreBlocks}</div>
        <h4 class="bo-h4">Sumber pustaka (${r.sources.length})</h4>
        ${sources}
        <h4 class="bo-h4">Ide &amp; ruangan</h4>
        ${ideaBlocks}`;
    document.getElementById('boDetail').classList.remove('hidden');
}

/** Hapus seluruh data seorang mahasiswa setelah dikonfirmasi. Tidak bisa dibatalkan. */
async function boDelete(nrp) {
    const r = boRecords.find(x => x.nrp === nrp);
    if (!r) return;
    const label = r.nama ? `<b>${boEscape(r.nama)}</b> (${boEscape(r.nrp)})` : `<b>${boEscape(r.nrp)}</b>`;
    const ok = await showConfirm(
        `Hapus semua data ${label}? Skor, catatan, sumber pustaka, dan ide akan hilang permanen.`,
        'warning'
    );
    if (!ok) return;
    try {
        await firestore.collection('mahasiswa').doc(nrp).delete();
        boCloseDetail();
    } catch (error) {
        console.error(error);
        showAlert(
            error.code === 'permission-denied'
                ? 'Penghapusan ditolak aturan Firestore. Publish ulang firestore.rules terlebih dahulu.'
                : 'Gagal menghapus data. Periksa koneksi internet Anda.',
            'error'
        );
    }
}

function boCloseDetail() {
    document.getElementById('boDetail').classList.add('hidden');
}

function boExportCsv() {
    const header = ['NRP', 'Nama', 'Judul tugas', 'Kategori pemenang', 'Rata-rata Internal',
        'Rata-rata Customer', 'Rata-rata Persaingan', 'Jumlah sumber', 'Ide lengkap', 'Total ide', 'Diperbarui'];
    const cell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const lines = boFiltered().map(r => [
        r.nrp, r.nama, r.judul, r.winner ? BO_CATEGORIES[r.winner].name : '',
        ...BO_TYPES.map(t => r.averages[t] == null ? '' : r.averages[t].toFixed(2)),
        r.sources.length, r.progress.done, r.progress.total,
        r.updated ? r.updated.toISOString() : ''
    ].map(cell).join(','));
    // BOM supaya Excel membaca UTF-8 dengan benar
    const blob = new Blob(['﻿' + [header.map(cell).join(','), ...lines].join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rekap-mahasiswa-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

window.addEventListener('DOMContentLoaded', () => {
    ['boSearch', 'boCategory', 'boSort'].forEach(id =>
        document.getElementById(id).addEventListener('input', boRenderRows));

    const rows = document.getElementById('boRows');
    rows.addEventListener('click', e => {
        const del = e.target.closest('[data-delete]');
        if (del) {
            boDelete(del.dataset.delete);
            return;
        }
        const tr = e.target.closest('tr[data-nrp]');
        if (tr) boOpenDetail(tr.dataset.nrp);
    });
    rows.addEventListener('keydown', e => {
        if (e.target.closest('[data-delete]')) return;
        const tr = e.target.closest('tr[data-nrp]');
        if (tr && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            boOpenDetail(tr.dataset.nrp);
        }
    });

    const modal = document.getElementById('boDetail');
    modal.addEventListener('click', e => {
        const del = e.target.closest('[data-delete]');
        if (del) boDelete(del.dataset.delete);
        else if (e.target === modal || e.target.closest('[data-close]')) boCloseDetail();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') boCloseDetail(); });
    document.getElementById('exportCsv').addEventListener('click', boExportCsv);

    if (!firestore) {
        document.getElementById('boRows').innerHTML = '<tr><td colspan="9" class="bo-empty">Firebase belum dikonfigurasi.</td></tr>';
        return;
    }
    firestore.collection('mahasiswa').onSnapshot(snapshot => {
        boRecords = snapshot.docs.map(boToRecord);
        boRender();
    }, error => {
        console.error(error);
        document.getElementById('boRows').innerHTML = `<tr><td colspan="9" class="bo-empty">Gagal memuat data${error.code === 'permission-denied' ? ': aturan Firestore belum mengizinkan daftar mahasiswa (publish ulang firestore.rules).' : '.'}</td></tr>`;
    });

    // Label "x menit lalu" diperbarui tiap menit
    setInterval(boRenderRows, 60000);
});
