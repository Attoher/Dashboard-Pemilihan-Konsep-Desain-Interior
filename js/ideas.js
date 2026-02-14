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

// === WORKFLOW LOGIC ===

function isIdeaComplete(item) {
    const ideaKey = `idea_${item.ideaNum}`;
    const roomKey = `room_${item.roomNum}`;
    const ideas = ideasStorage[currentCategory][ideaKey] || [];
    const rooms = ideasStorage[currentCategory][roomKey] || [];
    
    const hasFilledIdea = ideas.some(v => v && v.trim());
    if (!hasFilledIdea) return false;
    
    for (let i = 0; i < ideas.length; i++) {
        if (ideas[i] && ideas[i].trim()) {
            if (!rooms[i] || !rooms[i].trim()) return false;
        }
    }
    return true;
}

function getUnlockedIndex() {
    const categoryData = IDEAS_DATA[currentCategory];
    if (!categoryData) return 0;
    
    for (let i = 0; i < categoryData.items.length; i++) {
        if (!isIdeaComplete(categoryData.items[i])) return i;
    }
    return categoryData.items.length;
}

function renderContent() {
    const categoryData = IDEAS_DATA[currentCategory];
    if (!categoryData) return;
    
    document.getElementById('categoryLabel').textContent = `Kategori: ${categoryData.name}`;
    
    const unlockedIdx = getUnlockedIndex();
    const allComplete = unlockedIdx >= categoryData.items.length;
    
    renderProgressBar(categoryData, unlockedIdx);
    renderWorkflowSteps(categoryData, unlockedIdx);
    
    const finishBanner = document.getElementById('finishBanner');
    if (finishBanner) {
        finishBanner.style.display = allComplete ? 'flex' : 'none';
    }
    
    attachEventListeners();
}

function renderProgressBar(categoryData, unlockedIdx) {
    const total = categoryData.items.length;
    let html = '<div class="progress-steps">';
    
    categoryData.items.forEach((item, idx) => {
        const complete = isIdeaComplete(item);
        const active = idx === unlockedIdx;
        const locked = idx > unlockedIdx;
        
        let stepClass = 'progress-step';
        if (complete) stepClass += ' complete';
        else if (active) stepClass += ' active';
        else if (locked) stepClass += ' locked';
        
        html += `<div class="${stepClass}" onclick="${!locked ? `scrollToStep(${idx})` : ''}" style="${!locked ? 'cursor:pointer' : ''}">
                    <div class="step-circle">${complete ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' : idx + 1}</div>
                    <div class="step-label">Ide ${idx + 1}</div>
                </div>`;
        
        if (idx < total - 1) {
            html += `<div class="step-line ${complete ? 'complete' : ''}"></div>`;
        }
    });
    
    html += '</div>';
    
    const completedCount = categoryData.items.filter(item => isIdeaComplete(item)).length;
    const pct = Math.round((completedCount / total) * 100);
    html += `<div class="progress-bar-wrapper">
                <div class="progress-bar-fill" style="width: ${pct}%"></div>
             </div>
             <div class="progress-text">${completedCount}/${total} ide selesai (${pct}%)</div>`;
    
    document.getElementById('workflowProgress').innerHTML = html;
}

function renderWorkflowSteps(categoryData, unlockedIdx) {
    let html = '';
    
    categoryData.items.forEach((item, idx) => {
        const complete = isIdeaComplete(item);
        const active = idx === unlockedIdx;
        const locked = idx > unlockedIdx;
        
        let sectionClass = 'workflow-step';
        if (complete) sectionClass += ' complete';
        else if (active) sectionClass += ' active';
        else if (locked) sectionClass += ' locked';
        
        html += `<div class="${sectionClass}" id="step-${idx}">`;
        
        html += `<div class="step-header">
                    <div class="step-status-badge ${complete ? 'badge-complete' : active ? 'badge-active' : 'badge-locked'}">
                        ${complete ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;margin-right:4px"><polyline points="20 6 9 17 4 12"></polyline></svg>Selesai' : active ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:-1px;margin-right:4px"><circle cx="12" cy="12" r="5"></circle></svg>Sedang Dikerjakan' : '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;margin-right:4px"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0110 0v4"></path></svg>Terkunci'}
                    </div>
                    <div class="step-title-row">
                        <span class="step-num">#${item.ideaNum}</span>
                        <h3 class="step-title">${item.title}</h3>
                    </div>
                </div>`;
        
        if (locked) {
            html += `<div class="step-locked-msg">
                        <span class="lock-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0110 0v4"></path></svg></span>
                        Selesaikan Ide #${item.ideaNum - 1} terlebih dahulu untuk membuka bagian ini
                     </div>`;
        } else {
            html += `<div class="step-content-row">`;
            html += renderIdeaColumn(item);
            html += renderRoomColumn(item);
            html += `</div>`;
        }
        
        html += `</div>`;
    });
    
    document.getElementById('workflowSteps').innerHTML = html;
}

function renderIdeaColumn(item) {
    const key = `idea_${item.ideaNum}`;
    const inputs = ideasStorage[currentCategory][key] || [''];
    const maxReached = inputs.length >= item.maxInputs;
    
    let html = '<div class="step-col step-col-idea">';
    html += '<div class="col-header"><span class="col-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z"></path></svg></span> Isian Ide</div>';
    
    inputs.forEach((input, idx) => {
        if (idx < item.maxInputs) {
            html += `<div class="wf-input-row">
                        <span class="wf-input-num">${idx + 1}.</span>
                        <input type="text" 
                               class="idea-input wf-input" 
                               data-idea="${item.ideaNum}" 
                               data-index="${idx}" 
                               value="${escapeHtml(input)}" 
                               placeholder="Tulis ide (maks 20 kata)"
                               maxlength="200">
                        ${idx > 0 ? `<button class="idea-delete-btn" onclick="removeIdeaInput(${item.ideaNum}, ${idx})" title="Hapus">×</button>` : ''}
                    </div>`;
        }
    });
    
    html += `<button class="idea-add-btn" onclick="addIdeaInput(${item.ideaNum})" ${maxReached ? 'disabled' : ''}>
                + Tambah Ide (${inputs.length}/${item.maxInputs})
            </button>`;
    html += '</div>';
    return html;
}

function renderRoomColumn(item) {
    const ideaKey = `idea_${item.ideaNum}`;
    const ideaInputs = ideasStorage[currentCategory][ideaKey] || [''];
    const roomKey = `room_${item.roomNum}`;
    const roomInputs = ideasStorage[currentCategory][roomKey] || [];
    
    while (roomInputs.length < ideaInputs.length) {
        roomInputs.push('');
    }
    roomInputs.length = ideaInputs.length;
    
    let html = '<div class="step-col step-col-room">';
    html += `<div class="col-header"><span class="col-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></span> Ruangan</div>`;
    
    ideaInputs.forEach((_, idx) => {
        const roomVal = roomInputs[idx] || '';
        html += `<div class="wf-input-row">
                    <span class="wf-input-num">${idx + 1}.</span>
                    <input type="text" 
                           class="room-input wf-input" 
                           data-room="${item.roomNum}" 
                           data-idea="${item.ideaNum}"
                           data-index="${idx}" 
                           value="${escapeHtml(roomVal)}"
                           placeholder="Nama ruangan"
                           maxlength="200">
                </div>`;
    });
    
    html += '</div>';
    return html;
}

function scrollToStep(idx) {
    const el = document.getElementById(`step-${idx}`);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// === EVENT HANDLERS ===

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
    saveIdeaInput(e.target);
}

function handleIdeaBlur(e) {
    const wordCount = countWords(e.target.value);
    if (wordCount > 20) {
        showAlert('Maksimal 20 kata!', 'warning');
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
    renderContent();
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
        
        const categoryData = IDEAS_DATA[currentCategory];
        const item = categoryData.items.find(i => i.ideaNum === ideaNum);
        if (item) {
            const roomKey = `room_${item.roomNum}`;
            if (ideasStorage[currentCategory][roomKey]) {
                ideasStorage[currentCategory][roomKey].splice(index, 1);
            }
        }
        
        localStorage.setItem('ideasData', JSON.stringify(ideasStorage));
        renderContent();
    }
}

// === UTILITY ===

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
