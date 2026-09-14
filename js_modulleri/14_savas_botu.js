// --- MULTIPLAYER CANLI SAVAŞ ODASI (SUPABASE + GEMINI) ---

let currentBattleSubscription = null;

// --- GEMİNİ API KONTROLÜ ---
window.getGeminiApiKey = function() {
    let key = localStorage.getItem("OSMOYUN_GEMINI_KEY");
    if (!key) {
        key = prompt("Lütfen Gemini API Anahtarınızı girin:\n(Bu anahtar GITHUB'a yüklenmez, sadece sizin bilgisayarınızın tarayıcı hafızasına güvenli kaydedilir.)");
        if (key && key.trim() !== "") {
            localStorage.setItem("OSMOYUN_GEMINI_KEY", key.trim());
        }
    }
    return key;
};

window.clearGeminiApiKey = function() {
    localStorage.removeItem("OSMOYUN_GEMINI_KEY");
    alert("Kayıtlı API Anahtarı silindi. Bir sonraki savaşta sistem yeniden soracaktır.");
};

// --- 1. SAVAŞ LOBİSİ (Aktif Savaşları Listeleme) ---
window.openBattleLobby = async function() {
    const supabaseClient = (window.sb || sb);
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
                <button class="btn blue" onclick="openBattleRoom('${b.id}')">Savaşa Katıl (İzle/Yaz)</button>
            </div>
        `).join('');
    } else {
        listHtml = `<p class="sub" style="text-align:center;">Şu an aktif bir savaş bulunmuyor.</p>`;
    }

    let html = `
        <h2>⚔️ SAVAŞ LOBİSİ</h2>
        <div style="max-height: 300px; overflow-y:auto; margin-bottom:15px;">
            ${listHtml}
        </div>
        <div class="actions">
            <button class="btn red" style="width:100%; margin-bottom:5px;" onclick="openCreateBattleModal()">🔥 YENİ SAVAŞ OLUŞTUR (ADMIN)</button>
            <button class="btn" style="width:100%;" onclick="closeModal()">KAPAT</button>
        </div>
    `;
    modal(html);
};

// --- 2. YENİ SAVAŞ OLUŞTURMA EKRANI ---
window.openCreateBattleModal = function() {
    let stateOptions = (db.states || []).map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    let html = `
        <h2>🔥 YENİ SAVAŞ OLUŞTUR</h2>
        <label>Hedef / Bölge Adı</label>
        <input type="text" id="cb_location" placeholder="Örn: Viyana Kuşatması">
        
        <div style="display:flex; gap:10px; margin-top:10px;">
            <div style="flex:1;">
                <label style="color:#e74c3c;">🗡️ Saldıran Devlet</label>
                <select id="cb_att_id"><option value="">-- Seç --</option>${stateOptions}</select>
            </div>
            <div style="flex:1;">
                <label style="color:#3498db;">🛡️ Savunan Devlet</label>
                <select id="cb_def_id"><option value="">-- Seç --</option>${stateOptions}</select>
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
    
    const supabaseClient = (window.sb || sb);
    const { data, error } = await supabaseClient.from('savaslar').insert([{
        bolge: loc,
        saldiran_id: attState.name,
        savunan_id: defState.name,
        saldiran_ordu: {Piyade: attState.piyade||0, Süvari: attState.suvari||0, Topçu: (attState.kucuk_top||0)+(attState.buyuk_top||0)},
        savunan_ordu: {Piyade: defState.piyade||0, Süvari: defState.suvari||0, Topçu: (defState.kucuk_top||0)+(defState.buyuk_top||0)},
        durum: 'aktif'
    }]).select();

    if(error) return alert("Hata: " + error.message);
    
    // Otomatik ilk sistem mesajı
    if(data && data[0]) {
        await supabaseClient.from('savas_mesajlari').insert([{
            savas_id: data[0].id,
            gonderen: 'Sistem',
            mesaj: `⚔️ Savaş Başladı! ${attState.name} orduları ${loc} bölgesinde ${defState.name} ile karşı karşıya!`
        }]);
        openBattleRoom(data[0].id);
    }
};

// --- 3. CANLI SAVAŞ ODASI (CHAT) ---
let currentActiveBattleId = null;
let currentBattleData = null;

window.openBattleRoom = async function(savasId) {
    const supabaseClient = (window.sb || sb);
    currentActiveBattleId = savasId;
    
    const { data: bData, error: bErr } = await supabaseClient.from('savaslar').select('*').eq('id', savasId).single();
    if(bErr) return alert("Savaş odası bulunamadı!");
    currentBattleData = bData;

    let html = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <h2 style="margin:0;">📍 ${bData.bolge} Savaş Odası</h2>
            <button class="btn red" onclick="endBattle('${savasId}')">SAVAŞI BİTİR (Sil)</button>
        </div>
        <div style="font-size:11px; color:var(--muted); margin-bottom:10px;">${bData.saldiran_id} vs ${bData.savunan_id}</div>
        
        <div id="live_chat_box" style="background:var(--panel-light); border:1px solid var(--line); border-radius:4px; height:350px; overflow-y:auto; padding:10px; display:flex; flex-direction:column; gap:8px;">
            <div style="text-align:center; color:var(--gold); font-size:11px;">Bağlanıyor...</div>
        </div>
        
        <div style="display:flex; gap:5px; margin-top:10px;">
            <input type="text" id="chat_input" placeholder="Hamleni veya mesajını yaz..." style="flex:1;" onkeypress="if(event.key==='Enter') sendBattleMessage()">
            <button class="btn blue" onclick="sendBattleMessage()">Gönder</button>
        </div>
        
        <div style="margin-top:15px; padding-top:10px; border-top:1px solid var(--line); display:flex; gap:5px;">
            <button class="btn gold" style="flex:1;" onclick="evaluateTurnWithGemini()">🤖 BİLANÇO İSTE (GEMİNİ)</button>
            <button class="btn" style="width:80px;" onclick="openBattleLobby()">ÇIKIŞ</button>
        </div>
    `;
    modal(html);

    fetchAndRenderMessages(savasId);
    setupRealtimeSubscription(savasId);
};

window.fetchAndRenderMessages = async function(savasId) {
    const supabaseClient = (window.sb || sb);
    const { data: msgs, error } = await supabaseClient.from('savas_mesajlari').select('*').eq('savas_id', savasId).order('gonderilme_tarihi', { ascending: true });
    
    const chatBox = document.getElementById('live_chat_box');
    if(!chatBox) return;
    chatBox.innerHTML = "";
    
    if(msgs) {
        msgs.forEach(msg => appendMessageToChat(msg));
    }
    chatBox.scrollTop = chatBox.scrollHeight;
};

window.appendMessageToChat = function(msg) {
    const chatBox = document.getElementById('live_chat_box');
    if(!chatBox) return;
    
    let isSystem = msg.gonderen === 'Sistem';
    let isGM = msg.gonderen.includes('Game Master');
    
    let color = "var(--text)";
    let bg = "rgba(0,0,0,0.3)";
    let border = "1px solid var(--line)";
    
    if(isSystem) { color = "var(--gold)"; bg = "transparent"; border="none"; }
    else if(isGM) { border = "1px solid var(--border-gold)"; bg = "rgba(197,160,89,0.1)"; }
    
    let align = isSystem ? "center" : "left";
    
    let safeMsg = msg.mesaj.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\\n/g, '<br>');
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
    try {
        let cleanStr = raw.replace(/```json/gi, "").replace(/```/gi, "").trim();
        let obj = JSON.parse(cleanStr);
        let out = `<b>🌍 Arazi Analizi:</b> ${obj.adim_1_arazi_analizi}<br><br>`;
        out += `<b>♟️ Taktik:</b> ${obj.adim_2_taktik_carpismasi}<br><br>`;
        out += `<b>⚖️ Güç Değişimi:</b> ${obj.adim_3_guc_degisimi}<br><br>`;
        out += `<i>${obj.savas_raporu}</i><br><br>`;
        out += `<b>Kayıplar:</b> Saldıran: %${obj.a_takimi_kayip_yuzdesi} | Savunan: %${obj.b_takimi_kayip_yuzdesi}<br>`;
        out += `<b style="color:var(--border-gold);">Durum/Kazanan: ${obj.kazanan}</b>`;
        return out;
    } catch(e) {
        return raw.replace(/\\n/g, '<br>');
    }
}

window.sendBattleMessage = async function() {
    const input = document.getElementById('chat_input');
    const msgText = input.value.trim();
    if(!msgText || !currentActiveBattleId) return;
    
    input.value = "";
    input.disabled = true;
    
    const supabaseClient = (window.sb || sb);
    const currentUser = (window.currentUserEmail ? window.currentUserEmail.split('@')[0] : 'Misafir');
    
    await supabaseClient.from('savas_mesajlari').insert([{
        savas_id: currentActiveBattleId,
        gonderen: currentUser,
        mesaj: msgText
    }]);
    
    input.disabled = false;
    input.focus();
};

window.setupRealtimeSubscription = function(savasId) {
    const supabaseClient = (window.sb || sb);
    if(currentBattleSubscription) supabaseClient.removeChannel(currentBattleSubscription);
    
    currentBattleSubscription = supabaseClient.channel(`room_${savasId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'savas_mesajlari', filter: `savas_id=eq.${savasId}` }, payload => {
            appendMessageToChat(payload.new);
        })
        .subscribe();
};

window.endBattle = async function(savasId) {
    if(!confirm("Savaşı bitirmek ve BÜTÜN chat geçmişini sonsuza dek silmek istediğine emin misin? (Veritabanı temizliği için önerilir)")) return;
    
    const supabaseClient = (window.sb || sb);
    await supabaseClient.from('savaslar').delete().eq('id', savasId);
    alert("Savaş ve tüm geçmişi silindi.");
    if(currentBattleSubscription) supabaseClient.removeChannel(currentBattleSubscription);
    openBattleLobby();
};

// --- 4. GEMINI ENTEGRASYONU ---
window.evaluateTurnWithGemini = async function() {
    const apiKey = getGeminiApiKey();
    if(!apiKey) return alert("API Anahtarı eksik.");
    if(!currentBattleData) return;

    const supabaseClient = (window.sb || sb);
    const { data: msgs } = await supabaseClient.from('savas_mesajlari').select('gonderen,mesaj').eq('savas_id', currentActiveBattleId).order('gonderilme_tarihi', { ascending: true });
    
    let chatHistoryText = msgs.map(m => `${m.gonderen}: ${m.mesaj}`).join("\n");
    
    const systemPrompt = `Sen tarihi bir strateji oyununun Oyun Yöneticisi ve Savaş Hakemisin (Game Master).
Savaş canlı ve çok turludur. Sana oyuncuların savaş boyunca aralarında yaptığı sohbet/hamle geçmişi (Savaş Geçmişi) verilecek.

KURAL 1: Taktikler ve arazi, ham gücü en fazla +%30 veya -%30 etkileyebilir.
KURAL 2: Mantıksal çıkarım yap.
KURAL 3: Tüm chat geçmişini oku, özellikle oyuncuların SON hamlelerine odaklan. Sonuca göre iki tarafın kayıplarını belirle.
KURAL 4: Cevabını SADECE JSON formatında ver. Başka metin yazma.

Döndüreceğin format TAM OLARAK şu olmalıdır:
{
    "adim_1_arazi_analizi": "Arazinin avantajı/dezavantajı",
    "adim_2_taktik_carpismasi": "Kimin taktiği işe yaradı?",
    "adim_3_guc_degisimi": "Güç dengesi kime kaydı?",
    "savas_raporu": "Destansı savaş raporu (Bu Tur İçin).",
    "a_takimi_kayip_yuzdesi": 45,
    "b_takimi_kayip_yuzdesi": 80,
    "kazanan": "Saldıran / Savunan / Savaş Devam Ediyor"
}`;

    const userPrompt = `
[BAŞLANGIÇ VERİLERİ]
Bölge: ${currentBattleData.bolge}
Saldıran (${currentBattleData.saldiran_id}) Ordusu: ${JSON.stringify(currentBattleData.saldiran_ordu)}
Savunan (${currentBattleData.savunan_id}) Ordusu: ${JSON.stringify(currentBattleData.savunan_ordu)}

[SAVAŞ GEÇMİŞİ VE HAMLELER (CHAT)]
${chatHistoryText}

Lütfen son hamleleri değerlendirerek bilanço raporunu oluştur.`;

    const requestBody = {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: userPrompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.7 }
    };
    
    try {
        await supabaseClient.from('savas_mesajlari').insert([{
            savas_id: currentActiveBattleId,
            gonderen: 'Sistem',
            mesaj: `⏳ Game Master (Gemini) cephedeki son durumu değerlendiriyor...`
        }]);

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
        
        const data = await response.json();
        const rawResponse = data.candidates[0].content.parts[0].text;
        
        await supabaseClient.from('savas_mesajlari').insert([{
            savas_id: currentActiveBattleId,
            gonderen: 'Game Master (Gemini)',
            mesaj: rawResponse
        }]);
        
    } catch(e) {
        alert("Bağlantı hatası: " + e.message);
    }
};

window.addEventListener('beforeunload', () => {
    const supabaseClient = (window.sb || sb);
    if(currentBattleSubscription && supabaseClient) supabaseClient.removeChannel(currentBattleSubscription);
});
