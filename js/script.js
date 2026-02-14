const maxMahasiswa = 7;
const maxWords = 30;
const maxNotes = 20;

const IDEAS_DATA = {
    internal: {
        name: 'Kinerja Internal',
        ideas: [
            { num: 1, title: 'Ide aktivitas/kegiatan penting yang baru', room: 5 },
            { num: 2, title: 'Ide workflow (urutan pengerjaan tugas) baru', room: 6 },
            { num: 3, title: 'Ide role/responsibilities (staff) dengan tugas baru', room: 7 },
            { num: 4, title: 'Ide tools/technologies (peralatan) baru', room: 8 }
        ]
    },
    customer: {
        name: 'Customer & Experience',
        ideas: [
            { num: 1, title: 'Ide mengatasi "pains" (yang tidak diinginkan)', room: 4 },
            { num: 2, title: 'Ide mewujudkan "gains" (harapan)', room: 5 },
            { num: 3, title: 'Ide keadaan (Konteks) penting yang dihadapi', room: 6 }
        ]
    },
    competition: {
        name: 'Persaingan',
        ideas: [
            { num: 1, title: 'Ide strategi sebagai market leader', room: 7 },
            { num: 2, title: 'Ide strategi sebagai market challenger', room: 8 },
            { num: 3, title: 'Ide strategi sebagai market follower', room: 9 },
            { num: 4, title: 'Ide strategi sebagai market nicher', room: 10 },
            { num: 5, title: 'Ide Unique Selling Propositions (USP) atau Value Propositions', room: 11 },
            { num: 6, title: 'Ide event atau aktivitas baru', room: 12 }
        ]
    }
};

let appData = {
    internal: { inputs: [], notes: [] },
    customer: { inputs: [], notes: [] },
    competition: { inputs: [], notes: [] }
};

function loadData() {
    const saved = localStorage.getItem('dashboardData');
    if (saved) {
        try {
            appData = JSON.parse(saved);
            // Migrate old formats
            ['internal', 'customer', 'competition'].forEach(type => {
                // Migrate old single-note to notes array
                if (!Array.isArray(appData[type].notes)) {
                    if (appData[type].note && typeof appData[type].note === 'string') {
                        appData[type].notes = [appData[type].note];
                    } else {
                        appData[type].notes = [];
                    }
                    delete appData[type].note;
                }
                // Remove legacy keyword field
                if ('keyword' in appData[type]) {
                    delete appData[type].keyword;
                }
                saveData();
            });
        } catch (e) {
            console.error('Gagal memuat data', e);
        }
    } else {
        appData.internal.inputs = [''];
        appData.customer.inputs = [''];
        appData.competition.inputs = [''];
    }
    loadIdentitas();
    renderAll();
}

function loadIdentitas() {
    const identitas = localStorage.getItem('identitasData');
    if (identitas) {
        try {
            const data = JSON.parse(identitas);
            document.getElementById('namaMahasiswa').value = data.namaMahasiswa || '';
            document.getElementById('judulTugas').value = data.judulTugas || '';
        } catch (e) {
            console.error('Gagal memuat identitas', e);
        }
    }
}

function saveIdentitas() {
    const identitas = {
        namaMahasiswa: document.getElementById('namaMahasiswa').value,
        judulTugas: document.getElementById('judulTugas').value
    };
    localStorage.setItem('identitasData', JSON.stringify(identitas));
}

function saveData() {
    localStorage.setItem('dashboardData', JSON.stringify(appData));
}

function renderAll() {
    renderCategory('internal');
    renderCategory('customer');
    renderCategory('competition');
    renderNotesList('internal');
    renderNotesList('customer');
    renderNotesList('competition');
    calculateAverages();
}

function renderCategory(type) {
    const container = document.getElementById(type + 'Inputs');
    container.innerHTML = '';
    const data = appData[type].inputs;
    for (let i = 0; i < data.length; i++) {
        addInputRow(type, i, data[i]);
    }
    document.getElementById(type + 'NoteInput').value = '';
}

function addInputRow(type, index, value) {
    const container = document.getElementById(type + 'Inputs');
    const wrapper = document.createElement('div');
    wrapper.className = 'input-row';

    const label = document.createElement('label');
    label.textContent = 'Mahasiswa ' + (index + 1);

    const input = document.createElement('input');
    input.type = 'number';
    input.min = 1;
    input.max = 100;
    input.placeholder = 'Skor 1-100';
    input.value = value;
    input.dataset.type = type;
    input.dataset.index = index;
    input.oninput = function(e) {
        const t = e.target.dataset.type;
        const idx = e.target.dataset.index;
        appData[t].inputs[idx] = e.target.value;
        saveData();
        calculateAverages();
    };

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    container.appendChild(wrapper);
}

function addMahasiswa(type) {
    if (appData[type].inputs.length >= maxMahasiswa) {
        showAlert('Maksimal 7 mahasiswa per kategori.', 'warning');
        return;
    }
    appData[type].inputs.push('');
    renderCategory(type);
    saveData();
}

function hapusMahasiswa(type) {
    if (appData[type].inputs.length <= 1) {
        showAlert('Minimal 1 mahasiswa harus dipertahankan.', 'warning');
        return;
    }
    appData[type].inputs.pop();
    renderCategory(type);
    saveData();
}

function calculateAverage(containerId, avgId, type) {
    const inputs = appData[type].inputs;
    let total = 0;
    let count = 0;
    for (let val of inputs) {
        if (val !== '') {
            const num = parseFloat(val);
            if (!isNaN(num)) {
                total += num;
                count++;
            }
        }
    }
    const avg = count ? (total / count).toFixed(2) : 0;
    document.getElementById(avgId).innerText = avg;
    return parseFloat(avg);
}

function calculateAverages() {
    calculateAverage('internalInputs', 'internalAvg', 'internal');
    calculateAverage('customerInputs', 'customerAvg', 'customer');
    calculateAverage('competitionInputs', 'competitionAvg', 'competition');
}

function countWords(text) {
    return text.trim().split(/\s+/).filter(Boolean).length;
}

function tambahCatatan(type) {
    const input = document.getElementById(type + 'NoteInput');
    const note = input.value.trim();

    if (note === '') {
        showAlert('Catatan tidak boleh kosong.', 'warning');
        return;
    }

    if (countWords(note) > maxWords) {
        showAlert('Catatan maksimal 30 kata per catatan.', 'warning');
        return;
    }

    if (appData[type].notes.length >= maxNotes) {
        showAlert('Maksimal 20 catatan per kategori.', 'warning');
        return;
    }

    appData[type].notes.push(note);
    input.value = '';
    saveData();
    renderNotesList(type);
}

function hapusSatuCatatan(type, index) {
    appData[type].notes.splice(index, 1);
    saveData();
    renderNotesList(type);
}

function hapusSemuaCatatan(type) {
    if (appData[type].notes.length === 0) return;
    showConfirm('Hapus semua catatan untuk kategori ini?', 'warning', function() {
        appData[type].notes = [];
        saveData();
        renderNotesList(type);
    });
}

function renderNotesList(type) {
    const container = document.getElementById(type + 'NotesList');
    const counter = document.getElementById(type + 'NotesCounter');
    const notes = appData[type].notes || [];

    counter.textContent = notes.length + ' / 20 catatan';

    if (notes.length === 0) {
        container.innerHTML = '<div class="notes-empty"><em>Belum ada catatan</em></div>';
        return;
    }

    let html = '';
    notes.forEach((note, idx) => {
        html += `<div class="note-item">
            <span class="note-num">${idx + 1}.</span>
            <span class="note-text">${escapeHtml(note)}</span>
            <button onclick="hapusSatuCatatan('${type}', ${idx})" class="note-delete-btn" title="Hapus catatan">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
        </div>`;
    });
    container.innerHTML = html;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function processSelection() {
    const internalAvg = parseFloat(document.getElementById('internalAvg').innerText) || 0;
    const customerAvg = parseFloat(document.getElementById('customerAvg').innerText) || 0;
    const competitionAvg = parseFloat(document.getElementById('competitionAvg').innerText) || 0;

    let result = '';
    let category = 'internal';
    
    if (internalAvg === 0 && customerAvg === 0 && competitionAvg === 0) {
        result = 'Silakan isi skor terlebih dahulu.';
    } else if (internalAvg >= customerAvg && internalAvg >= competitionAvg) {
        result = 'Prioritas Konsep: Penguatan Kinerja Internal';
        category = 'internal';
    } else if (customerAvg >= internalAvg && customerAvg >= competitionAvg) {
        result = 'Prioritas Konsep: Engagement & Experience Customer';
        category = 'customer';
    } else {
        result = 'Prioritas Konsep: Strategi Diferensiasi Persaingan';
        category = 'competition';
    }

    document.getElementById('resultChoice').innerText = result;
    document.getElementById('modalResultText').innerText = result;
    
    if (internalAvg > 0 || customerAvg > 0 || competitionAvg > 0) {
        drawChart(internalAvg, customerAvg, competitionAvg);
        showCategoryDescription(category);
    }
    
    document.getElementById('resultModal').classList.remove('hidden');
}

function drawChart(i, c, comp) {
    const canvas = document.getElementById('chartCanvas');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const barWidth = 80;
    const spacing = 40;
    const baseX = 50;
    const maxVal = Math.max(i, c, comp, 100);

    function drawBar(x, value, color, label) {
        const barHeight = (value / maxVal) * (height - 80);
        ctx.fillStyle = color;
        ctx.fillRect(x, height - 40 - barHeight, barWidth, barHeight);
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial, sans-serif';
        ctx.fillText(label, x + 10, height - 20);
        ctx.fillText(value, x + 10, height - 45 - barHeight);
    }

    drawBar(baseX, i, 'rgba(59, 130, 246, 0.8)', 'Internal');
    drawBar(baseX + barWidth + spacing, c, 'rgba(34, 197, 94, 0.8)', 'Customer');
    drawBar(baseX + 2*(barWidth + spacing), comp, 'rgba(239, 68, 68, 0.8)', 'Persaingan');
}

function showCategoryDescription(category) {
    let description = '';
    
    if (category === 'internal') {
        description = `<strong><svg class="icon-inline" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg> Kinerja Internal:</strong><br>
            Fokus pada optimalisasi internal untuk meningkatkan revenue. Kategori ini mencakup:<br>
            <ul style="margin: 0.5rem 0 0 1.5rem;">
                <li>Ide aktivitas/kegiatan penting yang baru</li>
                <li>Ide workflow (urutan pengerjaan tugas) baru</li>
                <li>Ide role/responsibilities (staff) dengan tugas baru</li>
                <li>Ide tools/technologies (peralatan) baru</li>
            </ul>
            Setiap ide akan ditempatkan di ruangan/lokasi yang sesuai.`;
    } else if (category === 'customer') {
        description = `<strong><svg class="icon-inline" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> Customer & Experience:</strong><br>
            Fokus pada pengalaman pelanggan untuk mendorong revenue dan loyalitas. Kategori ini mencakup:<br>
            <ul style="margin: 0.5rem 0 0 1.5rem;">
                <li>Ide mengatasi "pains" (yang tidak diinginkan)</li>
                <li>Ide mewujudkan "gains" (harapan pelanggan)</li>
                <li>Ide keadaan (konteks) penting yang dihadapi pelanggan</li>
            </ul>
            Setiap ide akan ditempatkan di ruangan/lokasi yang sesuai.`;
    } else if (category === 'competition') {
        description = `<strong><svg class="icon-inline" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> Strategi Persaingan:</strong><br>
            Fokus pada diferensiasi dan positioning untuk meningkatkan revenue di pasar kompetitif. Kategori ini mencakup:<br>
            <ul style="margin: 0.5rem 0 0 1.5rem;">
                <li>Ide strategi sebagai market leader</li>
                <li>Ide strategi sebagai market challenger</li>
                <li>Ide strategi sebagai market follower</li>
                <li>Idea strategi sebagai market nicher</li>
                <li>Idea Unique Selling Propositions (USP) atau Value Propositions</li>
                <li>Idea event atau aktivitas baru</li>
            </ul>
            Setiap ide akan ditempatkan di ruangan/lokasi yang sesuai.`;
    }
    
    document.getElementById('categoryDescription').innerHTML = description;
}

function updateSteps(result) {
    const stepsList = document.getElementById('stepsList');
    stepsList.innerHTML = '';
    let steps = [];
    if (result.includes('Kinerja Internal')) {
        steps = [
            'Evaluasi efisiensi operasional saat ini',
            'Identifikasi area peningkatan produktivitas',
            'Rancang ulang alur kerja berbasis teknologi',
            'Uji coba prototype dengan tim internal',
            'Implementasi dan monitoring KPI'
        ];
    } else if (result.includes('Customer')) {
        steps = [
            'Riset kebutuhan dan preferensi pelanggan',
            'Buat customer journey map',
            'Desain touchpoint yang interaktif dan personal',
            'Gather feedback melalui focus group',
            'Iterasi desain berdasarkan masukan'
        ];
    } else if (result.includes('Persaingan')) {
        steps = [
            'Analisis kompetitor utama',
            'Tentukan unique selling proposition (USP)',
            'Kembangkan konsep diferensiasi',
            'Validasi dengan calon pengguna',
            'Siapkan strategi pemasaran'
        ];
    } else {
        steps = ['Isi data terlebih dahulu.'];
    }
    steps.forEach(s => {
        const li = document.createElement('li');
        li.textContent = s;
        li.onclick = () => showAlert(s, 'info');
        stepsList.appendChild(li);
    });
}

function showCategoryDetail(type) {
    const data = appData[type];
    const ideasData = IDEAS_DATA[type];
    const categoryNames = {
        'internal': 'Kinerja Internal',
        'customer': 'Customer & Experience',
        'competition': 'Persaingan'
    };
    
    const categoryIcons = {
        'internal': '<svg class="icon-inline" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>',
        'customer': '<svg class="icon-inline" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>',
        'competition': '<svg class="icon-inline" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>'
    };
    
    document.getElementById('detailModalTitle').innerHTML = categoryIcons[type] + ' Detail ' + categoryNames[type];
    
    let html = `
        <div class="detail-section">
            <h4><svg class="icon-inline" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg> Ide untuk Kategori Ini</h4>
            <ul class="ideas-list">
    `;
    
    ideasData.ideas.forEach(idea => {
        html += `
            <li>
                <strong>${idea.num}. ${idea.title}</strong>
            </li>
        `;
    });
    
    html += `
            </ul>
        </div>
        <div class="detail-section">
            <h4><svg class="icon-inline" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> Daftar Catatan Penting (${(data.notes || []).length})</h4>
    `;
    
    const notes = data.notes || [];
    if (notes.length > 0) {
        html += '<div class="values-list">';
        notes.forEach((note, idx) => {
            html += `<div class="value-item"><strong>${idx + 1}.</strong> ${escapeHtml(note)}</div>`;
        });
        html += '</div>';
    } else {
        html += '<p><em>Belum ada catatan</em></p>';
    }
    
    html += `
        </div>
        <div class="detail-section">
            <h4><svg class="icon-inline" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Nilai Mahasiswa</h4>
            <div class="values-list">
    `;
    
    data.inputs.forEach((val, idx) => {
        html += `<div class="value-item"><svg class="icon-inline" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> <strong>Mahasiswa ${idx+1}:</strong> ${val || '<em>belum diisi</em>'}</div>`;
    });
    
    html += `
            </div>
        </div>
    `;
    
    document.getElementById('detailModalBody').innerHTML = html;
    document.getElementById('detailModal').classList.remove('hidden');
}

function closeDetailModal() {
    const modal = document.getElementById('detailModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function closeModal() {
    const modal = document.getElementById('resultModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function goToResultPage() {
    window.open('result.html', '_blank');
}

function goToIdeasPage() {
    const internalAvg = parseFloat(document.getElementById('internalAvg').innerText) || 0;
    const customerAvg = parseFloat(document.getElementById('customerAvg').innerText) || 0;
    const competitionAvg = parseFloat(document.getElementById('competitionAvg').innerText) || 0;
    
    let category = 'internal';
    if (internalAvg === 0 && customerAvg === 0 && competitionAvg === 0) {
        showAlert('Silakan isi skor terlebih dahulu.', 'warning');
        return;
    } else if (customerAvg > internalAvg && customerAvg >= competitionAvg) {
        category = 'customer';
    } else if (competitionAvg > internalAvg && competitionAvg > customerAvg) {
        category = 'competition';
    }
    
    localStorage.setItem('winningCategory', category);
    
    window.location.href = 'pages/ideas.html?category=' + category;
}

window.onload = function() {
    loadData();
    
    const modal = document.getElementById('resultModal');
    if (modal) {
        modal.classList.add('hidden');
        
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
    }
    
    const detailModal = document.getElementById('detailModal');
    if (detailModal) {
        detailModal.classList.add('hidden');
        detailModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeDetailModal();
            }
        });
    }
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
            closeDetailModal();
        }
    });
};