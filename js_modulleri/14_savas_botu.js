// --- MULTIPLAYER CANLI SAVAŞ ODASI (SUPABASE + GEMINI 3.8 FLASH) ---

let currentBattleSubscription = null;
let currentActiveBattleId = null;
let currentBattleData = null;
let currentBattleRole = null; // 'saldiran' | 'savunan' | null (izleyici)
let refereeDebounceTimer = null;
const REFEREE_DEBOUNCE_MS = 4000;

// --- KULLANICI / DEVLET YARDIMCISI ---
window.getMyStateName = function() {
    if(typeof db !== 'undefined' && db.states && typeof currentUserEmail !== 'undefined' && currentUserEmail) {
        let myState = db.states.find(s => s.ownerEmail === currentUserEmail);
        if(myState) return myState.name;
    }
    return null;
};

// --- GLOBAL SAVAŞ DİNLEYİCİ ---
window.initGlobalBattleListener = function() {
    const supabaseClient = (typeof sb !== 'undefined' ? sb : null);
    if(!supabaseClient) {
        setTimeout(window.initGlobalBattleListener, 2000);
        return;
    }
    
    supabaseClient.channel('public-savaslar-changes')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'savaslar' }, payload => {
            const b = payload.new;
            const myStateName = getMyStateName();
            if(myStateName && (b.saldiran_id === myStateName || b.savunan_id === myStateName)) {
                alert(`⚔️ DİKKAT! Devletin (${myStateName}) savaşa girdi! Hedef: ${b.bolge}\n(Lütfen gizli harp hamleni odaya ilet)`);
                openBattleRoom(b.id);
            }
        })
        .subscribe();
};
setTimeout(window.initGlobalBattleListener, 3000);

// --- GEMİNİ API VE MODEL KONTROLÜ ---
window.getGeminiModel = function() {
    return localStorage.getItem("OSMOYUN_GEMINI_MODEL") || "gemini-3.8-flash";
};

window.setGeminiModel = function(modelName) {
    if(modelName && modelName.trim()) {
        localStorage.setItem("OSMOYUN_GEMINI_MODEL", modelName.trim());
    }
};

window.clearGeminiApiKey = function() {
    localStorage.removeItem("OSMOYUN_GEMINI_KEY");
    localStorage.removeItem("OSMOYUN_GEMINI_MODEL");
    alert("Kayıtlı API Anahtarı ve Model ayarları silindi.");
    openBattleLobby();
};

window.promptChangeModel = function() {
    const current = getGeminiModel();
    const chosen = prompt("Kullanmak istediğiniz Gemini model adını girin (Örn: gemini-3.8-flash, gemini-2.0-flash):", current);
    if(chosen && chosen.trim()) {
        localStorage.setItem("OSMOYUN_GEMINI_MODEL", chosen.trim());
        if(typeof toast === 'function') toast(`YZ Modeli güncellendi: ${chosen.trim()}`, true);
        openBattleLobby();
    }
};

window.saveAndVerifyLobbyKey = async function() {
    const keyVal = document.getElementById('lobby_api_key')?.value.trim();
    const modelVal = document.getElementById('lobby_model_name')?.value.trim() || "gemini-3.8-flash";
    if(!keyVal) return alert("Lütfen API anahtarını girin!");
    
    const btn = document.getElementById('btn_verify_key');
    if(btn) { btn.innerText = "⏳ Doğrulanıyor..."; btn.disabled = true; }
    
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelVal}:generateContent`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": keyVal
            },
            body: JSON.stringify({contents: [{parts: [{text: "merhaba"}]}]})
        });
        
        if(!response.ok) {
            throw new Error(`Reddedildi (HTTP ${response.status}) - Model: ${modelVal}. Lütfen anahtarın ve model adının doğruluğunu kontrol edin.`);
        }
        
        localStorage.setItem("OSMOYUN_GEMINI_KEY", keyVal);
        localStorage.setItem("OSMOYUN_GEMINI_MODEL", modelVal);
        alert(`✅ Başarılı! API Anahtarı ve Model (${modelVal}) doğrulandı.`);
        openBattleLobby();
    } catch(e) {
        alert("❌ Hata: " + e.message);
        if(btn) { btn.innerText = "Doğrula ve Kaydet"; btn.disabled = false; }
    }
};

// --- 1. SAVAŞ LOBİSİ ---
window.openBattleLobby = async function() {
    const supabaseClient = (typeof sb !== 'undefined' ? sb : null);
    if(!supabaseClient) return alert("Veritabanı bağlantısı bulunamadı!");

    let { data: battles, error } = await supabaseClient
        .from('savaslar')
        .select('*')
        .eq('durum', 'aktif')
        .order('olusturulma_tarihi', { ascending: false });

    if(error) return alert("Savaşlar çekilemedi: " + error.message);

    let listHtml = "";
    if(battles && battles.length > 0) {
        listHtml = battles.map(b => `
            <div style="background:var(--panel-light); padding:10px; border:1px solid var(--border-gold); margin-bottom:10px; border-radius:4px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <h4 style="margin:0; color:var(--gold);">📍 ${b.bolge}</h4>
                    <small>${b.saldiran_id} ⚔️ ${b.savunan_id}</small>
                </div>
                <button class="btn blue" onclick="openBattleRoom('${b.id}')">Savaşa Katıl</button>
            </div>
        `).join('');
    } else {
        listHtml = `<p class="sub" style="text-align:center;">Şu an aktif bir savaş bulunmuyor.</p>`;
    }

    let savedKey = localStorage.getItem("OSMOYUN_GEMINI_KEY");
    let currentModel = getGeminiModel();
    
    let actionsHtml = "";
    if(!savedKey) {
        actionsHtml = `
            <div style="background:rgba(231,76,60,0.1); padding:10px; margin-bottom:15px; border-radius:4px; border:1px solid #e74c3c;">
                <label style="color:#e74c3c; font-weight:bold; display:block; text-align:center;">⚠️ YZ Hakem İçin API Anahtarı ve Model</label>
                <p style="font-size:11px; margin:5px 0; text-align:center;">Savaş başlatabilmek için geçerli bir Gemini anahtarı ve model adı girin.</p>
                <input type="text" id="lobby_api_key" placeholder="AIza..." style="width:100%; margin-bottom:6px;">
                <div style="display:flex; align-items:center; gap:6px; margin-bottom:8px;">
                    <span style="font-size:11px; color:var(--muted); white-space:nowrap;">Model:</span>
                    <input type="text" id="lobby_model_name" value="${currentModel}" placeholder="gemini-3.8-flash" style="flex:1;">
                </div>
                <button id="btn_verify_key" class="btn green" style="width:100%;" onclick="saveAndVerifyLobbyKey()">Doğrula ve Kaydet</button>
            </div>
            <button class="btn" style="width:100%;" onclick="closeModal()">KAPAT</button>
        `;
    } else {
        actionsHtml = `
            <div style="background:var(--panel-light); padding:8px 10px; margin-bottom:10px; border-radius:4px; border:1px solid var(--line); display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:12px; color:var(--text);">🤖 Aktif YZ Modeli: <b style="color:var(--gold);">${currentModel}</b></span>
                <button class="btn" style="padding:2px 8px; font-size:11px;" onclick="promptChangeModel()">Değiştir</button>
            </div>
            <button class="btn red" style="width:100%; margin-bottom:5px;" onclick="openCreateBattleModal()">🔥 YENİ SAVAŞ OLUŞTUR (ADMIN)</button>
            <button class="btn" style="width:100%;" onclick="closeModal()">KAPAT</button>
            <button class="btn" style="width:100%; margin-top:5px; border:1px solid var(--gold); color:var(--gold);" onclick="clearGeminiApiKey()">🔑 API VE MODEL AYARLARINI SIFIRLA</button>
        `;
    }

    let html = `
        <h2>⚔️ SAVAŞ LOBİSİ</h2>
        <div style="max-height: 250px; overflow-y:auto; margin-bottom:15px;">
            ${listHtml}
        </div>
        <div class="actions">
            ${actionsHtml}
        </div>
    `;
    modal(html);
};

// --- 2. YENİ SAVAŞ OLUŞTURMA ---
window.openCreateBattleModal = function() {
    let stateOptions = (typeof db !== 'undefined' && db.states ? db.states : []).map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    
    let mapProvinces = Object.keys(typeof db !== 'undefined' && db.mapProvinceOwners ? db.mapProvinceOwners : {}).sort();
    let locInput = mapProvinces.length > 0 
        ? `<select id="cb_location" style="width:100%;"><option value="">-- Haritadan Bölge Seç --</option>${mapProvinces.map(p => `<option value="${p}">${p}</option>`).join('')}</select>`
        : `<input type="text" id="cb_location" placeholder="Örn: Viyana Kuşatması" style="width:100%;">`;

    let html = `
        <h2>🔥 YENİ SAVAŞ OLUŞTUR</h2>
        <label>Hedef / Bölge Adı</label>
        ${locInput}
        
        <div style="display:flex; gap:10px; margin-top:10px;">
            <div style="flex:1;">
                <label style="color:#e74c3c;">🗡️ Saldıran Devlet</label>
                <select id="cb_att_id" style="width:100%;"><option value="">-- Seç --</option>${stateOptions}</select>
            </div>
            <div style="flex:1;">
                <label style="color:#3498db;">🛡️ Savunan Devlet</label>
                <select id="cb_def_id" style="width:100%;"><option value="">-- Seç --</option>${stateOptions}</select>
            </div>
        </div>
        
        <button class="btn green" style="width:100%; margin-top:20px;" onclick="createBattleSubmit()">SAVAŞI BAŞLAT</button>
        <button class="btn" style="width:100%; margin-top:5px;" onclick="openBattleLobby()">İPTAL</button>
    `;
    modal(html);
};

window.createBattleSubmit = async function() {
    const loc = document.getElementById('cb_location').value.trim();
    const attId = document.getElementById('cb_att_id').value;
    const defId = document.getElementById('cb_def_id').value;
    
    if(!loc || !attId || !defId) return alert("Eksik bilgi!");
    
    const attState = getState(attId);
    const defState = getState(defId);
    
    // Tüyosuz, saf atmosferik ve coğrafi hava durumları
    const havaDurumlari = [
        '☀️ Açık ve Kuru Meydan',
        '🌧️ Şiddetli Sağanak Yağış ve Balçık Zemin',
        '🌫️ Yoğun Sabah Sisi',
        '❄️ Dondurucu Ayaz ve Tipi',
        '🌪️ Şiddetli Rüzgar ve Toz Fırtınası',
        '🌲 Sık Ormanlık ve Engebeli Vadi'
    ];
    const secilenHava = havaDurumlari[Math.floor(Math.random() * havaDurumlari.length)];

    const attTop = (attState.kucuk_top||0) + (attState.orta_top||0) + (attState.buyuk_top||0);
    const defTop = (defState.kucuk_top||0) + (defState.orta_top||0) + (defState.buyuk_top||0);

    const supabaseClient = (typeof sb !== 'undefined' ? sb : null);
    const { data, error } = await supabaseClient.from('savaslar').insert([{
        bolge: loc,
        saldiran_id: attState.name,
        savunan_id: defState.name,
        saldiran_ordu: {Piyade: attState.piyade||0, Nişancı: attState.nisanci||0, Süvari: attState.suvari||0, Topçu: attTop, Moral: 100},
        savunan_ordu: {Piyade: defState.piyade||0, Nişancı: defState.nisanci||0, Süvari: defState.suvari||0, Topçu: defTop, Moral: 100},
        durum: 'aktif'
    }]).select('*');

    if(error) return alert("Hata: " + error.message);
    
    if(data && data[0]) {
        await supabaseClient.from('savas_mesajlari').insert([{
            savas_id: data[0].id,
            gonderen: 'Sistem',
            mesaj: `⚔️ SAVAŞ BAŞLADI!\n📍 Hedef: ${loc}\n☁️ Meydan Şartları: ${secilenHava}\n(Komutanlar, lütfen ordularınıza gizli harp emirlerinizi verin. Her iki taraf da emrini ilettikten sonra 'Turu Değerlendir' butonuna basarak hakemi çağırın.)`
        }]);
        openBattleRoom(data[0].id);
    }
};

// --- 3. CANLI SAVAŞ ODASI ---
window.openBattleRoom = async function(savasId) {
    const supabaseClient = (typeof sb !== 'undefined' ? sb : null);
    currentActiveBattleId = savasId;
    
    const { data: bData, error: bErr } = await supabaseClient.from('savaslar').select('*').eq('id', savasId).single();
    if(bErr) return alert("Savaş odası bulunamadı!");
    currentBattleData = bData;

    const myStateName = getMyStateName();
    currentBattleRole = myStateName === bData.saldiran_id ? 'saldiran'
                       : myStateName === bData.savunan_id ? 'savunan'
                       : null;
    const isParticipant = currentBattleRole !== null;
    const isGameMaster = typeof isAdmin !== 'undefined' ? isAdmin : false;

    let chatInputHtml = "";
    if (isParticipant) {
        chatInputHtml += `
            <div style="margin-top:10px;">
                <div style="font-size:11px; color:var(--muted); margin-bottom:4px; display:flex; justify-content:space-between;">
                    <span>📜 Gizli Harp Emrin (Düşman göremez):</span>
                    <span>Hızlı Taktik Seç:</span>
                </div>
                <div style="display:flex; flex-wrap:wrap; gap:4px; margin-bottom:6px;">
                    <button type="button" class="btn" style="font-size:10px; padding:2px 6px; background:rgba(255,255,255,0.06);" onclick="applyQuickTactic('🏹 Hilal Taktiği & Sahte Ricat:')">🏹 Hilal Taktiği</button>
                    <button type="button" class="btn" style="font-size:10px; padding:2px 6px; background:rgba(255,255,255,0.06);" onclick="applyQuickTactic('🛡️ Tabur Cengi (Kalkan & Siper):')">🛡️ Tabur Cengi</button>
                    <button type="button" class="btn" style="font-size:10px; padding:2px 6px; background:rgba(255,255,255,0.06);" onclick="applyQuickTactic('🐎 Kanat Kuşatması:')">🐎 Kanat Kuşatması</button>
                    <button type="button" class="btn" style="font-size:10px; padding:2px 6px; background:rgba(255,255,255,0.06);" onclick="applyQuickTactic('💣 Topçu Barajı Ateşi:')">💣 Topçu Barajı</button>
                    <button type="button" class="btn" style="font-size:10px; padding:2px 6px; background:rgba(255,255,255,0.06);" onclick="applyQuickTactic('⚡ Yarma Taarruzu:')">⚡ Yarma Taarruzu</button>
                </div>
                <div style="display:flex; gap:5px;">
                    <input type="text" id="chat_input" placeholder="Gizli taktik emrini yaz..." style="flex:1;" onkeypress="if(event.key==='Enter') sendBattleMessage()">
                    <button class="btn blue" onclick="sendBattleMessage()">Emri İlet</button>
                </div>
            </div>`;
    } else {
        chatInputHtml += `
            <div style="margin-top:10px; text-align:center; color:var(--muted); font-size:12px; padding:8px; border:1px dashed var(--line); border-radius:4px;">
                👁️ İzleyici modundasın. Sadece savaşa taraf olan komutanlar gizli emir verebilir.
            </div>`;
    }

    if (isGameMaster) {
        chatInputHtml += `
            <div style="margin-top:10px; padding:10px; background:rgba(46, 204, 113, 0.1); border:1px solid #2ecc71; border-radius:4px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                    <label style="color:#2ecc71; font-size:11px; font-weight:bold;">🛡️ YÖNETİCİ KONTROLLERİ</label>
                    <small style="color:var(--gold); font-size:10px;">Model: ${getGeminiModel()}</small>
                </div>
                <button class="btn green" style="width:100%;" onclick="evaluateTurnWithGemini()" title="Turu Değerlendirir">⚔️ Turu Değerlendir (Yapay Zeka Hakem)</button>
            </div>`;
    }

    let html = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <h2 style="margin:0;">⚔️ Savaş Odası</h2>
            ${isGameMaster ? `<button class="btn red" onclick="endBattle('${savasId}')">SAVAŞI BİTİR</button>` : ``}
        </div>
        
        <div style="background:rgba(197,160,89,0.1); border:1px solid var(--border-gold); padding:8px 12px; border-radius:4px; margin:10px 0; display:flex; justify-content:space-between; align-items:center;">
            <div>
                <span style="font-size:10px; color:var(--muted); text-transform:uppercase; letter-spacing:1px;">Muharebe Meydanı</span>
                <div style="color:var(--gold); font-weight:bold; font-size:14px;">📍 ${bData.bolge}</div>
            </div>
            <div id="battle_weather_badge" style="text-align:right; font-size:12px; font-weight:bold; color:var(--text);">
                ☁️ Şartlar okunuyor...
            </div>
        </div>

        <div id="own_army_info" style="font-size:11px; color:var(--muted); margin-bottom:10px;"></div>
        
        <div id="live_chat_box" style="background:var(--panel-light); border:1px solid var(--line); border-radius:4px; height:340px; overflow-y:auto; padding:10px; display:flex; flex-direction:column; gap:8px;">
            <div style="text-align:center; color:var(--gold); font-size:11px;">Meydan bağlantısı kuruluyor...</div>
        </div>
        
        ${chatInputHtml}
        
        <div style="margin-top:15px; padding-top:10px; border-top:1px solid var(--line); display:flex; gap:5px;">
            <button class="btn" style="width:100%;" onclick="openBattleLobby()">ÇIKIŞ</button>
        </div>
    `;
    modal(html);

    renderOwnArmyInfo();
    fetchAndRenderMessages(savasId);
    setupRealtimeSubscription(savasId);
};

window.applyQuickTactic = function(prefix) {
    const input = document.getElementById('chat_input');
    if(!input) return;
    input.value = prefix + " ";
    input.focus();
};

window.renderOwnArmyInfo = function() {
    const el = document.getElementById('own_army_info');
    if(!el || !currentBattleData) return;

    if(currentBattleRole === 'saldiran') {
        const o = currentBattleData.saldiran_ordu || {};
        el.innerHTML = `<span style="color:#e74c3c; font-weight:bold;">🗡️ Saldıran Kolordusu (${currentBattleData.saldiran_id})</span>: 🧍${o.Piyade||0} 🎯${o["Nişancı"]||0} 🐎${o["Süvari"]||0} 💣${o["Topçu"]||0} | 🛡️ Moral: <b style="color:${(o.Moral||100)>50?'#2ecc71':'#e74c3c'}">%${o.Moral||100}</b>`;
    } else if(currentBattleRole === 'savunan') {
        const o = currentBattleData.savunan_ordu || {};
        el.innerHTML = `<span style="color:#3498db; font-weight:bold;">🛡️ Savunan Kolordusu (${currentBattleData.savunan_id})</span>: 🧍${o.Piyade||0} 🎯${o["Nişancı"]||0} 🐎${o["Süvari"]||0} 💣${o["Topçu"]||0} | 🛡️ Moral: <b style="color:${(o.Moral||100)>50?'#2ecc71':'#e74c3c'}">%${o.Moral||100}</b>`;
    } else {
        el.innerHTML = `<span style="color:var(--muted)">👁️ İzleyici modundasın — cephedeki ordu sayıları gizlidir.</span>`;
    }
};

window.fetchAndRenderMessages = async function(savasId) {
    const supabaseClient = (typeof sb !== 'undefined' ? sb : null);
    const { data: msgs, error } = await supabaseClient.from('savas_mesajlari').select('*').eq('savas_id', savasId).order('gonderilme_tarihi', { ascending: true });
    
    const chatBox = document.getElementById('live_chat_box');
    if(!chatBox) return;
    chatBox.innerHTML = "";
    
    if(msgs) msgs.forEach(msg => appendMessageToChat(msg));
    chatBox.scrollTop = chatBox.scrollHeight;
};

window.appendMessageToChat = function(msg) {
    const chatBox = document.getElementById('live_chat_box');
    if(!chatBox) return;
    
    // Meydan şartlarını banner'a çek
    if(msg.gonderen === 'Sistem') {
        const match = msg.mesaj.match(/(?:Meydan Şartları|Hava Durumu):\s*([^\n\r(]+)/);
        if(match) {
            const badge = document.getElementById('battle_weather_badge');
            if(badge) badge.innerText = match[1].trim();
        }
    }

    const currentUser = (typeof currentUserEmail !== 'undefined' && currentUserEmail) ? currentUserEmail.split('@')[0] : 'Misafir';
    const isGameMaster = typeof isAdmin !== 'undefined' ? isAdmin : false;
    let isSystem = msg.gonderen === 'Sistem';
    let isGM = msg.gonderen.includes('Game Master');
    let isMe = msg.gonderen === currentUser;
    
    let color = "var(--text)";
    let bg = "rgba(0,0,0,0.3)";
    let border = "1px solid var(--line)";
    
    if(isSystem) { color = "var(--gold)"; bg = "transparent"; border="none"; }
    else if(isGM) { border = "1px solid var(--border-gold)"; bg = "rgba(197,160,89,0.1)"; }
    
    let align = isSystem ? "center" : "left";
    let safeMsg = msg.mesaj.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
    
    // Düşmanın yazdığı taktikleri gizle! (Sadece GM ve yazan kişinin kendisi bilsin)
    if(!isSystem && !isGM && !isMe && !isGameMaster) {
        safeMsg = `<div style="font-style:italic; color:var(--gold); display:flex; align-items:center; gap:6px;">
            <span>📜</span> <span><b>${msg.gonderen}</b> gizli harp emrini mühürledi...</span>
        </div>`;
    }

    if(isGM) safeMsg = formatGeminiResponse(msg.mesaj);

    const html = `
        <div style="align-self:stretch; text-align:${align}; background:${bg}; border:${border}; padding:8px; border-radius:4px;">
            ${!isSystem ? `<div style="font-size:10px; color:var(--muted); margin-bottom:2px;"><b>${msg.gonderen}</b> - ${new Date(msg.gonderilme_tarihi).toLocaleTimeString()}</div>` : ''}
            <div style="font-size:13px; color:${color}; line-height:1.4;">${safeMsg}</div>
        </div>
    `;
    chatBox.insertAdjacentHTML('beforeend', html);
    chatBox.scrollTop = chatBox.scrollHeight;
};

window.formatGeminiResponse = function(raw) {
    if(raw.includes('Değerlendiriyor') || raw.includes('değerlendiriyor')) return raw;
    try {
        let cleanStr = raw.replace(/```json/gi, "").replace(/```/gi, "").trim();
        let obj = JSON.parse(cleanStr);
        let out = `<b>🌍 Meydan ve Çevre Şartları:</b> ${obj.adim_1_hava_ve_arazi}<br><br>`;
        out += `<b>♟️ Manevra ve Taktik Üstünlük:</b> ${obj.adim_2_taktik_carpismasi}<br><br>`;
        out += `<i>${obj.savas_raporu}</i><br><br>`;
        
        let attO = obj.saldiran_oluler || {piyade:0, nisanci:0, suvari:0, topcu:0};
        let attK = obj.saldiran_kalan || {piyade:0, nisanci:0, suvari:0, topcu:0, moral:100};
        let defO = obj.savunan_oluler || {piyade:0, nisanci:0, suvari:0, topcu:0};
        let defK = obj.savunan_kalan || {piyade:0, nisanci:0, suvari:0, topcu:0, moral:100};

        let attName = currentBattleData ? currentBattleData.saldiran_id : "Saldıran";
        let defName = currentBattleData ? currentBattleData.savunan_id : "Savunan";

        out += `<div style="background:rgba(231,76,60,0.1); padding:6px 10px; border-left:3px solid #e74c3c; margin-bottom:6px; border-radius:2px;">`;
        out += `<b>🗡️ ${attName} Kayıpları:</b> 💀${attO.piyade||0} Piyade, 🎯${attO.nisanci||0} Nişancı, 🐎${attO.suvari||0} Süvari, 💣${attO.topcu||0} Topçu<br>`;
        out += `<small style="color:#e74c3c">Kalan Ordu: 🧍${attK.piyade||0} | 🎯${attK.nisanci||0} | 🐎${attK.suvari||0} | 💣${attK.topcu||0} | <b>%${attK.moral||100} Moral</b></small></div>`;

        out += `<div style="background:rgba(52,152,219,0.1); padding:6px 10px; border-left:3px solid #3498db; margin-bottom:10px; border-radius:2px;">`;
        out += `<b>🛡️ ${defName} Kayıpları:</b> 💀${defO.piyade||0} Piyade, 🎯${defO.nisanci||0} Nişancı, 🐎${defO.suvari||0} Süvari, 💣${defO.topcu||0} Topçu<br>`;
        out += `<small style="color:#3498db">Kalan Ordu: 🧍${defK.piyade||0} | 🎯${defK.nisanci||0} | 🐎${defK.suvari||0} | 💣${defK.topcu||0} | <b>%${defK.moral||100} Moral</b></small></div>`;

        out += `<div style="padding:6px; background:rgba(197,160,89,0.15); border:1px solid var(--border-gold); text-align:center; font-weight:bold; color:var(--gold); border-radius:3px;">`;
        out += `⚔️ Muharebe Durumu: ${obj.kazanan}</div>`;
        return out;
    } catch(e) {
        return raw.replace(/\n/g, '<br>');
    }
};

window.sendBattleMessage = async function() {
    if(!currentBattleRole) return;

    const input = document.getElementById('chat_input');
    const msgText = input.value.trim();
    if(!msgText || !currentActiveBattleId) return;
    
    input.value = "";
    input.disabled = true;
    
    const supabaseClient = (typeof sb !== 'undefined' ? sb : null);
    const currentUser = (typeof currentUserEmail !== 'undefined' && currentUserEmail) ? currentUserEmail.split('@')[0] : 'Misafir';
    
    await supabaseClient.from('savas_mesajlari').insert([{
        savas_id: currentActiveBattleId,
        gonderen: currentUser,
        mesaj: msgText
    }]);
    
    input.disabled = false;
    input.focus();
};

window.setupRealtimeSubscription = function(savasId) {
    const supabaseClient = (typeof sb !== 'undefined' ? sb : null);
    if(currentBattleSubscription) supabaseClient.removeChannel(currentBattleSubscription);
    
    currentBattleSubscription = supabaseClient.channel(`room_${savasId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'savas_mesajlari', filter: `savas_id=eq.${savasId}` }, payload => {
            appendMessageToChat(payload.new);
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'savaslar', filter: `id=eq.${savasId}` }, payload => {
            currentBattleData = payload.new;
            renderOwnArmyInfo();
        })
        .subscribe();
};

window.endBattle = async function(savasId) {
    if(!confirm("Savaşı bitirmek ve BÜTÜN chat geçmişini temizlemek istediğinize emin misiniz?")) return;
    
    const supabaseClient = (typeof sb !== 'undefined' ? sb : null);
    await supabaseClient.from('savaslar').delete().eq('id', savasId);
    alert("Savaş ve cephe kayıtları silindi.");
    if(currentBattleSubscription) supabaseClient.removeChannel(currentBattleSubscription);
    openBattleLobby();
};

// --- 4. GEMINI ASKERİ HAKEM ENTEGRASYONU ---
window.evaluateTurnWithGemini = async function(retryCount = 0) {
    const apiKey = localStorage.getItem("OSMOYUN_GEMINI_KEY");
    const activeModel = getGeminiModel();
    if(!apiKey) return alert("Gemini API anahtarı bulunamadı!");
    if(!currentBattleData) return;

    const supabaseClient = (typeof sb !== 'undefined' ? sb : null);
    
    const { data: msgs } = await supabaseClient.from('savas_mesajlari').select('gonderen,mesaj').eq('savas_id', currentActiveBattleId).order('gonderilme_tarihi', { ascending: true });
    let chatHistoryText = (msgs || []).map(m => `${m.gonderen}: ${m.mesaj}`).join("\n");
    
    const attName = currentBattleData.saldiran_id;
    const defName = currentBattleData.savunan_id;

    const systemPrompt = `Sen Osmanlı ve Erken Modern Dönem harp tarihine hakim, adil, gerçekçi ve edebi bir Askeri Hakem ve Savaş Yöneticisisin (Game Master).

HARP DOKTRİNİ VE KURALLAR:
1. MEYDAN VE HAVA ŞARTLARI: Savaşın geçtiği coğrafyayı ve atmosferik hava durumunu (sohbetteki Sistem mesajında yer alır) mutlaka hesaba kat. (Örn: Çamurlu zemin süvari manevrasını ve top taşınmasını aksatır; sisli hava görüş mesafesini daraltır; dondurucu soğuk askerlerin direncini kırar).
2. ESNEK & MANTIKLI KAYIP ÇERÇEVESİ:
   - Normal, karşılıklı bir çarpışmada bir turdaki kayıplar makul seviyede kalmalıdır (her iki taraf da mevcut ordusunun yaklaşık %4 - %10'unu kaybeder).
   - ANCAK: Eğer komutanlardan biri hava şartlarını dahi bir taktikle lehine çevirdiyse, düşmanın zayıf kanadını yakaladıysa, pusu kurduysa veya düşmanın manevrasını boşa düşürdüyse; BU TAKTİKSEL ÜSTÜNLÜĞÜ ÖDÜLLENDİR ve gafil avlanan tarafa ağır darbe (%15 - %25 kayıp veya kanat çökmesi) yaz.
3. ASIL KIRILMA NOKTASI MORALDİR:
   - Savaşlar son askere kadar ölümle değil, ordunun moralinin kırılması ve paniğe kapılmasıyla kazanılır.
   - Ağır kayıplar, süvari kuşatması, topçu barajı ve komutan taktikleri morali eritir. Başarılı savunma ve manevralar morali korur.
   - Eğer bir ordunun Morali %25'in altına düşerse ORDU PANİĞE KAPILIR VE BOZGUN (RİCAT) BAŞLAR. Bu durumda savaşı bitir, kazanan tarafın süvarilerinin kaçan düşmanı takibiyle son bir kayıp işlet ve kazananı ilan et!
4. BİRİMLER:
   - Birimler tam olarak şunlardır: Piyade, Nişancı, Süvari, Topçu.
   - Asla taraf isimlerini karıştırma. Saldıran: ${attName}, Savunan: ${defName}.
5. EDEBİ VE SÜRÜKLEYİCİ SAVAŞ RAPORU:
   - İki komutanın gizli emirlerini, aralarındaki manevra düellosunu ve meydandaki kanlı çarpışmayı dönemin ruhuna uygun, heyecanlı bir dille anlat.

DÖNECEĞİN JSON FORMATI:
{
    "adim_1_hava_ve_arazi": "Hava ve zemin şartlarının muharebeye etkisi",
    "adim_2_taktik_carpismasi": "İki komutanın hamlelerinin çarpışması ve manevra üstünlüğü",
    "savas_raporu": "Destansı ve edebi meydan muharebesi anlatımı.",
    "saldiran_oluler": {"piyade": 150, "nisanci": 40, "suvari": 20, "topcu": 0},
    "savunan_oluler": {"piyade": 320, "nisanci": 90, "suvari": 110, "topcu": 2},
    "saldiran_kalan": {"piyade": 9850, "nisanci": 1960, "suvari": 4980, "topcu": 200, "moral": 92},
    "savunan_kalan": {"piyade": 4680, "nisanci": 890, "suvari": 1880, "topcu": 38, "moral": 78},
    "kazanan": "Savaş Devam Ediyor" 
}
(Eğer bir tarafın morali %25'in altına düşerse veya ordusu tükenirse kazanan kısmına "... Devleti Kazandı (Düşman Bozguna Uğradı)" yaz).`;

    const userPrompt = `[Bölge: ${currentBattleData.bolge}]\nSaldıran (${attName}) Ordusu: ${JSON.stringify(currentBattleData.saldiran_ordu)}\nSavunan (${defName}) Ordusu: ${JSON.stringify(currentBattleData.savunan_ordu)}\n[SOHBET VE HAMLELER]\n${chatHistoryText}`;

    const requestBody = {
        contents: [{ parts: [{ text: systemPrompt + "\n\n" + userPrompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2
        }
    };
    
    try {
        if(retryCount === 0) {
            await supabaseClient.from('savas_mesajlari').insert([{
                savas_id: currentActiveBattleId,
                gonderen: 'Sistem',
                mesaj: `⏳ Game Master (${activeModel}) cephedeki son durumu değerlendiriyor...`
            }]);
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": apiKey
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            if((response.status === 503 || response.status === 429) && retryCount < 4) {
                console.warn(`Gemini API Meşgul (${response.status}), tekrar deneniyor... (${retryCount + 1}. deneme)`);
                let waitTime = response.status === 429 ? 10000 : 2000;
                await new Promise(r => setTimeout(r, waitTime));
                return window.evaluateTurnWithGemini(retryCount + 1);
            }
            throw new Error(`HTTP ${response.status} (${response.statusText})`);
        }
        
        const data = await response.json();
        const rawResponse = data.candidates[0].content.parts[0].text;
        
        await supabaseClient.from('savas_mesajlari').delete().like('mesaj', '%Game Master (% cephedeki son durumu değerlendiriyor%').eq('savas_id', currentActiveBattleId);
        await supabaseClient.from('savas_mesajlari').insert([{ savas_id: currentActiveBattleId, gonderen: `Game Master (${activeModel})`, mesaj: rawResponse }]);
        
        // Savaş verisini güncelle (Sonraki tur için)
        try {
            let cleanStr2 = rawResponse.replace(/```json/gi, "").replace(/```/gi, "").trim();
            let obj2 = JSON.parse(cleanStr2);
            if(obj2.saldiran_kalan && obj2.savunan_kalan) {
                let sK = obj2.saldiran_kalan;
                let dK = obj2.savunan_kalan;
                let attUpdate = {"Piyade": sK.piyade||0, "Nişancı": sK.nisanci||0, "Süvari": sK.suvari||0, "Topçu": sK.topcu||0, "Moral": sK.moral||100};
                let defUpdate = {"Piyade": dK.piyade||0, "Nişancı": dK.nisanci||0, "Süvari": dK.suvari||0, "Topçu": dK.topcu||0, "Moral": dK.moral||100};
                await supabaseClient.from('savaslar').update({saldiran_ordu: attUpdate, savunan_ordu: defUpdate}).eq('id', currentActiveBattleId);
            }
        } catch(ex) {
            console.warn("Ordu güncelleme ayrıştırma hatası:", ex);
        }
        
    } catch(e) {
        await supabaseClient.from('savas_mesajlari').delete().like('mesaj', '%Game Master (% cephedeki son durumu değerlendiriyor%').eq('savas_id', currentActiveBattleId);
        await supabaseClient.from('savas_mesajlari').insert([{ 
            savas_id: currentActiveBattleId, 
            gonderen: 'Sistem', 
            mesaj: `❌ Hata oluştu: ${e.message}. Lütfen hamlenizi tekrar iletin veya API/Model ayarlarını kontrol edin.` 
        }]);
        console.error("Savaş Botu Hatası: ", e);
    }
};
