const IDEAS_DATA = {
    internal: {
        name: 'Kinerja Internal',
        items: [
            { ideaNum: 1, roomNum: 5, title: 'Ide aktivitas/kegiatan penting yang baru', maxInputs: 10 },
            { ideaNum: 2, roomNum: 6, title: 'Ide <i>workflow</i> (urutan pengerjaan tugas) baru', maxInputs: 10 },
            { ideaNum: 3, roomNum: 7, title: 'Ide <i>role/responsibilities</i> (staff) dengan tugas baru', maxInputs: 10 },
            { ideaNum: 4, roomNum: 8, title: 'Ide <i>tools/technologies</i> (peralatan) baru', maxInputs: 10 }
        ]
    },
    competition: {
        name: 'Strategi Persaingan',
        items: [
            { ideaNum: 1, roomNum: 7, title: 'Ide strategi sebagai <i>market leader</i>', maxInputs: 10 },
            { ideaNum: 2, roomNum: 8, title: 'Ide strategi sebagai <i>market challenger</i>', maxInputs: 10 },
            { ideaNum: 3, roomNum: 9, title: 'Ide strategi sebagai <i>market follower</i>', maxInputs: 10 },
            { ideaNum: 4, roomNum: 10, title: 'Idea strategi sebagai <i>market nicher</i>', maxInputs: 10 },
            { ideaNum: 5, roomNum: 11, title: 'Idea <i>Unique Selling Propositions (USP)</i> atau <i>Value Propositions</i>', maxInputs: 10 },
            { ideaNum: 6, roomNum: 12, title: 'Idea event atau aktivitas baru', maxInputs: 10 }
        ]
    },
    customer: {
        name: 'Customer & Experience',
        items: [
            { ideaNum: 1, roomNum: 4, title: 'Idea mengatasi <i>"pains"</i> (yang tidak diinginkan)', maxInputs: 10 },
            { ideaNum: 2, roomNum: 5, title: 'Idea mewujudkan <i>"gains"</i> (harapan)', maxInputs: 10 },
            { ideaNum: 3, roomNum: 6, title: 'Idea keadaan (konteks) penting yang dihadapi', maxInputs: 10 }
        ]
    }
};

let currentCategory = '';
let ideasStorage = {};

function loadData() {
    const params = new URLSearchParams(window.location.search);
    currentCategory = params.get('category') || 'internal';
    
    const saved = localStorage.getItem('ideasData');
    if (saved) {
        try {
            ideasStorage = JSON.parse(saved);
        } catch (e) {
            console.error('Error loading ideas data', e);
        }
    }
    
    if (!ideasStorage[currentCategory]) {
        ideasStorage[currentCategory] = {};
    }
    
    loadIdentitas();
    renderContent();
}

function loadIdentitas() {
    const identitas = localStorage.getItem('identitasData');
    if (identitas) {
        try {
            const data = JSON.parse(identitas);
            document.getElementById('displayNama').textContent = data.namaMahasiswa || '-';
            document.getElementById('displayJudul').textContent = data.judulTugas || '-';
        } catch (e) {
            console.error('Error loading identitas', e);
        }
    }
}

function renderContent() {
    const categoryData = IDEAS_DATA[currentCategory];
    if (!categoryData) return;
    
    document.getElementById('categoryLabel').textContent = `Kategori: ${categoryData.name}`;
    
    let ideasHtml = '';
    let roomsHtml = '';
    
    categoryData.items.forEach(item => {
        ideasHtml += renderIdea(item);
        roomsHtml += renderRooms(item);
    });
    
    document.getElementById('ideasContent').innerHTML = ideasHtml;
    document.getElementById('roomsGrid').innerHTML = roomsHtml;
    
    const hasAnyIdea = categoryData.items.some(item => {
        const key = `idea_${item.ideaNum}`;
        const inputs = ideasStorage[currentCategory][key] || [];
        return inputs.some(i => i.trim());
    });
    
    document.getElementById('noRoomsMsg').style.display = hasAnyIdea ? 'none' : 'block';
    
    attachEventListeners();
}

function renderIdea(item) {
    const key = `idea_${item.ideaNum}`;
    const inputs = ideasStorage[currentCategory][key] || [''];
    const maxReached = inputs.length >= item.maxInputs;
    
    let html = '<div class="idea-card">';
    html += `<div class="idea-card-header">
                <span class="idea-number">#${item.ideaNum}</span>
                <h3 class="idea-title">${item.title}</h3>
            </div>`;
    html += '<div class="idea-inputs-wrapper">';
    
    inputs.forEach((input, idx) => {
        if (idx < item.maxInputs) {
            html += `<div class="idea-input-row">
                        <input type="text" 
                               class="idea-input" 
                               data-idea="${item.ideaNum}" 
                               data-index="${idx}" 
                               value="${escapeHtml(input)}" 
                               placeholder="Maksimal 20 kata"
                               maxlength="200">
                        ${idx > 0 ? `<button class="idea-delete-btn" onclick="removeIdeaInput(${item.ideaNum}, ${idx})" title="Hapus">×</button>` : ''}
                    </div>`;
        }
    });
    
    html += '</div>';
    html += `<button class="idea-add-btn" onclick="addIdeaInput(${item.ideaNum})" ${maxReached ? 'disabled' : ''}>
                + Idea ${inputs.length}/${item.maxInputs}
            </button>`;
    html += '</div>';
    
    return html;
}

function renderRooms(item) {
    const key = `idea_${item.ideaNum}`;
    const ideaInputs = ideasStorage[currentCategory][key] || [''];
    const roomKey = `room_${item.roomNum}`;
    const roomInputs = ideasStorage[currentCategory][roomKey] || [];
    
    while (roomInputs.length < ideaInputs.length) {
        roomInputs.push('');
    }
    roomInputs.length = ideaInputs.length;
    
    let html = '<div class="room-card">';
    html += `<div class="idea-card-header">
                <span class="idea-number">#${item.roomNum}</span>
                <h3 class="idea-title">Ruangan (Idea #${item.ideaNum})</h3>
            </div>`;
    html += '<div class="room-inputs-wrapper">';
    
    ideaInputs.forEach((_, idx) => {
        const roomVal = roomInputs[idx] || '';
        html += `<div class="room-input-row">
                    <input type="text" 
                           class="room-input" 
                           data-room="${item.roomNum}" 
                           data-idea="${item.ideaNum}"
                           data-index="${idx}" 
                           value="${escapeHtml(roomVal)}"
                           placeholder="Nama ruangan"
                           maxlength="200">
                </div>`;
    });
    
    html += '</div>';
    html += '</div>';
    
    return html;
}

function attachEventListeners() {
    document.querySelectorAll('.idea-input').forEach(input => {
        input.addEventListener('input', handleIdeaInput);
        input.addEventListener('blur', handleIdeaBlur);
    });
    
    document.querySelectorAll('.room-input').forEach(input => {
        input.addEventListener('input', handleRoomInput);
        input.addEventListener('blur', handleRoomBlur);
    });
}

function handleIdeaInput(e) {
    const wordCount = countWords(e.target.value);
    if (wordCount > 20) {
    }
}

function handleIdeaBlur(e) {
    const wordCount = countWords(e.target.value);
    if (wordCount > 20) {
        alert('Maksimal 20 kata!');
        e.target.value = e.target.value.split(' ').slice(0, 20).join(' ');
    }
    saveIdeaInput(e.target);
    renderContent();
}

function handleRoomInput(e) {
    saveRoomInput(e.target);
}

function handleRoomBlur(e) {
    saveRoomInput(e.target);
}

function countWords(text) {
    return text.trim().split(/\s+/).filter(Boolean).length;
}

function saveIdeaInput(input) {
    const ideaNum = input.dataset.idea;
    const index = parseInt(input.dataset.index);
    const key = `idea_${ideaNum}`;
    
    if (!ideasStorage[currentCategory][key]) {
        ideasStorage[currentCategory][key] = [];
    }
    
    ideasStorage[currentCategory][key][index] = input.value;
    localStorage.setItem('ideasData', JSON.stringify(ideasStorage));
}

function saveRoomInput(input) {
    const roomNum = input.dataset.room;
    const index = parseInt(input.dataset.index);
    const key = `room_${roomNum}`;
    
    if (!ideasStorage[currentCategory][key]) {
        ideasStorage[currentCategory][key] = [];
    }
    
    ideasStorage[currentCategory][key][index] = input.value;
    localStorage.setItem('ideasData', JSON.stringify(ideasStorage));
}

function addIdeaInput(ideaNum) {
    const key = `idea_${ideaNum}`;
    if (!ideasStorage[currentCategory][key]) {
        ideasStorage[currentCategory][key] = [''];
    }
    
    const categoryData = IDEAS_DATA[currentCategory];
    const item = categoryData.items.find(i => i.ideaNum === ideaNum);
    
    if (ideasStorage[currentCategory][key].length < item.maxInputs) {
        ideasStorage[currentCategory][key].push('');
        localStorage.setItem('ideasData', JSON.stringify(ideasStorage));
        renderContent();
    }
}

function removeIdeaInput(ideaNum, index) {
    const key = `idea_${ideaNum}`;
    if (ideasStorage[currentCategory][key]) {
        ideasStorage[currentCategory][key].splice(index, 1);
        localStorage.setItem('ideasData', JSON.stringify(ideasStorage));
        renderContent();
    }
}

function saveAllIdeas() {
    localStorage.setItem('ideasData', JSON.stringify(ideasStorage));
    showStatus('Semua idea berhasil disimpan!', 'success');
}

function showStatus(message, type) {
    const container = document.querySelector('.container');
    const existing = document.querySelector('.status-message');
    if (existing) existing.remove();
    
    const div = document.createElement('div');
    div.className = `status-message status-${type}`;
    div.textContent = message;
    container.insertBefore(div, container.firstChild);
    
    setTimeout(() => div.remove(), 3000);
}

function exportData() {
    const categoryData = IDEAS_DATA[currentCategory];
    
    const element = document.createElement('div');
    element.style.padding = '5px';
    element.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    element.style.lineHeight = '1.3';
    element.style.color = '#333';
    
    let html = `
        <div style="max-width: 210mm;">
            <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; margin-bottom: 8px;">
                <h1 style="font-size: 18px; font-weight: 700; margin: 0 0 2px 0; color: #111827;">Rincian Idea Konsep Desain</h1>
                <div style="color: #6b7280; font-size: 11px; margin-bottom: 0px;"><strong>${categoryData.name}</strong></div>
                <div style="color: #6b7280; font-size: 9px;">Tanggal: ${new Date().toLocaleString('id-ID')}</div>
            </div>
    `;
    
    categoryData.items.forEach(item => {
        const ideaKey = `idea_${item.ideaNum}`;
        const roomKey = `room_${item.roomNum}`;
        const ideaInputs = ideasStorage[currentCategory][ideaKey] || [];
        const roomInputs = ideasStorage[currentCategory][roomKey] || [];
        const filledIdeas = ideaInputs.filter(i => i.trim());
        
        html += `
            <div style="margin-bottom: 8px;">
                <div style="font-size: 11px; font-weight: 600; color: #1f2937; margin-bottom: 4px; border-left: 3px solid #2563eb; padding-left: 6px;">
                    Idea #${item.ideaNum}: ${item.title}
                </div>
        `;
        
        if (filledIdeas.length > 0) {
            filledIdeas.forEach((idea, idx) => {
                const room = roomInputs[ideaInputs.indexOf(idea)] || '';
                html += `
                    <div style="margin-bottom: 3px; padding: 4px; background: #f9fafb; border-left: 2px solid #2563eb; font-size: 10px;">
                        <div style="margin-bottom: 1px;"><strong>Idea:</strong> ${escapeHtml(idea)}</div>
                        ${room.trim() ? `<div style="color: #059669;"><strong>Ruangan:</strong> ${escapeHtml(room)}</div>` : ''}
                    </div>
                `;
            });
        } else {
            html += `<div style="color: #9ca3af; font-style: italic; font-size: 9px;">Belum ada idea yang diisi</div>`;
        }
        
        html += `</div>`;
    });
    
    html += `</div>`;
    element.innerHTML = html;
    
    document.body.appendChild(element);
    
    const opt = {
        margin: [5, 5, 5, 5],
        filename: `idea-${currentCategory}-${new Date().getTime()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
    
    html2pdf().set(opt).from(element).save().then(() => {
        document.body.removeChild(element);
    });
    
    showStatus('Data berhasil di-export ke PDF!', 'success');
}

function goBack() {
    window.history.back();
}

function goToResultPage() {
    window.location.href = 'result.html';
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

window.addEventListener('DOMContentLoaded', loadData);
