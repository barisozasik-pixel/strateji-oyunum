// --- MULTIPLAYER CANLI SAVAŞ ODASI (SUPABASE + GEMINI) ---

let currentBattleSubscription = null;
let currentActiveBattleId = null;
let currentBattleData = null;
let currentBattleRole = null; // 'saldiran' | 'savunan' | null (izleyici)
let refereeDebounceTimer = null;
const REFEREE_DEBOUNCE_MS = 4000; // katılımcı yazmayı bitirsin diye kısa bir bekleme

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
                alert(`⚔️ DİKKAT! Devletin (${myStateName}) savaşa girdi! Hedef: ${b.bolge}\n(Lütfen hamleni chat'e yaz)`);
                openBattleRoom(b.id);
            }
        })
        .subscribe();
};
setTimeout(window.initGlobalBattleListener, 3000);

// --- GEMİNİ API KONTROLÜ ---
window.clearGeminiApiKey = function() {
    localStorage.removeItem("OSMOYUN_GEMINI_KEY");
    alert("Kayıtlı API Anahtarı silindi.");
    openBattleLobby();
};

window.saveAndVerifyLobbyKey = async function() {
    const val = document.getElementById('lobby_api_key').value.trim();
    if(!val) return alert("Lütfen anahtarı girin!");
    
    const btn = document.getElementById('btn_verify_key');
    btn.innerText = "⏳ Doğrulanıyor...";
    btn.disabled = true;
    
    try {
        // Küçük bir deneme isteği atarak şifrenin gerçekten çalışıp çalışmadığını test ediyoruz
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": val
            },
            body: JSON.stringify({contents: [{parts: [{text: "merhaba"}]}]})
        });
        
        if(!response.ok) {
            throw new Error("Reddedildi (Geçersiz veya Hatalı Anahtar)");
        }
        
        // Eğer 200 OK dönerse, şifre kesinlikle doğrudur. Kaydediyoruz.
        localStorage.setItem("OSMOYUN_GEMINI_KEY", val);
        alert("✅ Başarılı! API Anahtarı doğrulandı ve kabul edildi.");
        openBattleLobby(); // Lobiyi yeniden yükle (Artık savaş butonu görünecek)
        
    } catch(e) {
        alert("❌ Hata: " + e.message);
        btn.innerText = "Doğrula ve Kaydet";
        btn.disabled = false;
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
    
    // Eğer şifre yoksa Savaş Oluşturmayı engelle ve şifre kutusu çıkart
    let actionsHtml = "";
    if(!savedKey) {
        actionsHtml = `
            <div style="background:rgba(231,76,60,0.1); padding:10px; margin-bottom:15px; border-radius:4px; border:1px solid #e74c3c;">
                <label style="color:#e74c3c; font-weight:bold; display:block; text-align:center;">⚠️ YZ Hakem İçin API Anahtarı Eksik</label>
                <p style="font-size:11px; margin:5px 0; text-align:center;">Savaş başlatabilmek için önce geçerli bir Gemini şifresi girmelisin.</p>
                <input type="text" id="lobby_api_key" placeholder="AIza..." style="width:100%; margin-bottom:5px;">
                <button id="btn_verify_key" class="btn green" style="width:100%;" onclick="saveAndVerifyLobbyKey()">Doğrula ve Kaydet</button>
            </div>
            <button class="btn" style="width:100%;" onclick="closeModal()">KAPAT</button>
        `;
    } else {
        actionsHtml = `
            <button class="btn red" style="width:100%; margin-bottom:5px;" onclick="openCreateBattleModal()">🔥 YENİ SAVAŞ OLUŞTUR (ADMIN)</button>
            <button class="btn" style="width:100%;" onclick="closeModal()">KAPAT</button>
            <button class="btn" style="width:100%; margin-top:5px; border:1px solid var(--gold); color:var(--gold);" onclick="clearGeminiApiKey()">🔑 API ANAHTARI SIFIRLA</button>
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
    
    const havaDurumlari = ['☀️ Güneşli (Açık Alan)', '🌧️ Yağmurlu (Çamur, Topçu Etkisiz)', '🌫️ Sisli (Görüş Kısıtlı, Pusu Uygun)', '❄️ Karlı (Dondurucu Soğuk)'];
    const secilenHava = havaDurumlari[Math.floor(Math.random() * havaDurumlari.length)];

    const supabaseClient = (typeof sb !== 'undefined' ? sb : null);
    const { data, error } = await supabaseClient.from('savaslar').insert([{
        bolge: loc,
        saldiran_id: attState.name,
        savunan_id: defState.name,
        saldiran_ordu: {Piyade: attState.piyade||0, Okçu: attState.okcu||0, Süvari: attState.suvari||0, Topçu: (attState.kucuk_top||0)+(attState.buyuk_top||0), Moral: 100},
        savunan_ordu: {Piyade: defState.piyade||0, Okçu: defState.okcu||0, Süvari: defState.suvari||0, Topçu: (defState.kucuk_top||0)+(defState.buyuk_top||0), Moral: 100},
        durum: 'aktif'
    }]).select('*');

    if(error) return alert("Hata: " + error.message);
    
    if(data && data[0]) {
        await supabaseClient.from('savas_mesajlari').insert([{
            savas_id: data[0].id,
            gonderen: 'Sistem',
            mesaj: `⚔️ SAVAŞ BAŞLADI!\n📍 Hedef: ${loc}\n☁️ Hava Durumu: ${secilenHava}\n(Komutanlar, lütfen ordularınıza emirlerinizi verin. Her iki taraf da gizli emrini ilettikten sonra 'Turu Değerlendir' butonuna basın.)`
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

    // Kullanıcının bu savaştaki rolünü belirle: saldıran / savunan / izleyici
    const myStateName = getMyStateName();
    currentBattleRole = myStateName === bData.saldiran_id ? 'saldiran'
                       : myStateName === bData.savunan_id ? 'savunan'
                       : null;
    const isParticipant = currentBattleRole !== null;
    
    // Global isAdmin değişkenini kullan (01_degiskenler_ve_durum.js'den gelir)
    const isGameMaster = typeof isAdmin !== 'undefined' ? isAdmin : false;

    let chatInputHtml = "";
    if (isParticipant) {
        chatInputHtml += `
            <div style="display:flex; gap:5px; margin-top:10px;">
                <input type="text" id="chat_input" placeholder="Gizli hamleni yaz..." style="flex:1;" onkeypress="if(event.key==='Enter') sendBattleMessage()">
                <button class="btn blue" onclick="sendBattleMessage()">Emri İlet</button>
            </div>`;
    } else {
        chatInputHtml += `
            <div style="margin-top:10px; text-align:center; color:var(--muted); font-size:12px; padding:8px; border:1px dashed var(--line); border-radius:4px;">
                👁️ İzleyici modundasın. Sadece savaşan taraflar emir verebilir.
            </div>`;
    }

    // Admin kontrolleri (Sadece admin görebilir)
    if (isGameMaster) {
        chatInputHtml += `
            <div style="margin-top:10px; padding:10px; background:rgba(46, 204, 113, 0.1); border:1px solid #2ecc71; border-radius:4px;">
                <label style="color:#2ecc71; font-size:11px; font-weight:bold; display:block; margin-bottom:5px;">🛡️ YÖNETİCİ KONTROLLERİ</label>
                <button class="btn green" style="width:100%; margin-bottom:5px;" onclick="evaluateTurnWithGemini()" title="Turu Değerlendirir">⚔️ Turu Değerlendir (Yapay Zeka)</button>
            </div>`;
    }

    let html = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <h2 style="margin:0;">📍 ${bData.bolge} Savaş Odası</h2>
            ${isGameMaster ? `<button class="btn red" onclick="endBattle('${savasId}')">SAVAŞI BİTİR</button>` : ``}
        </div>
        <div id="own_army_info" style="font-size:11px; color:var(--muted); margin-bottom:10px;"></div>
        
        <div id="live_chat_box" style="background:var(--panel-light); border:1px solid var(--line); border-radius:4px; height:350px; overflow-y:auto; padding:10px; display:flex; flex-direction:column; gap:8px;">
            <div style="text-align:center; color:var(--gold); font-size:11px;">Bağlanıyor...</div>
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

// Sadece kendi tarafının ordu sayılarını gösterir. İzleyiciye hiçbir sayı gösterilmez
// (aksi halde izleyici gördüğü sayıları savaşan taraflardan birine sızdırabilir).
window.renderOwnArmyInfo = function() {
    const el = document.getElementById('own_army_info');
    if(!el || !currentBattleData) return;

    if(currentBattleRole === 'saldiran') {
        const o = currentBattleData.saldiran_ordu;
        el.innerHTML = `<span style="color:#e74c3c">🗡️ Kendi Ordun (${currentBattleData.saldiran_id})</span>: 🧍${o.Piyade} 🏹${o["Okçu"]||0} 🐎${o["Süvari"]} 💣${o["Topçu"]} | 🛡️ Moral: %${o.Moral||100}`;
    } else if(currentBattleRole === 'savunan') {
        const o = currentBattleData.savunan_ordu;
        el.innerHTML = `<span style="color:#3498db">🛡️ Kendi Ordun (${currentBattleData.savunan_id})</span>: 🧍${o.Piyade} 🏹${o["Okçu"]||0} 🐎${o["Süvari"]} 💣${o["Topçu"]} | 🛡️ Moral: %${o.Moral||100}`;
    } else {
        el.innerHTML = `<span style="color:var(--muted)">👁️ İzleyici modundasın — ordu sayıları gizli.</span>`;
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
    
    const currentUser = (typeof currentUserEmail !== 'undefined' && currentUserEmail) ? currentUserEmail.split('@')[0] : 'Misafir';
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
    
    // Düşmanın yazdığı taktikleri gizle! (Sadece GM bilsin)
    if(!isSystem && !isGM && !isMe) {
        safeMsg = "<i style='color:var(--muted);'>Gizli bir hamle emri verdi...</i>";
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
        let out = `<b>🌍 Çevre ve Arazi:</b> ${obj.adim_1_hava_ve_arazi}<br><br>`;
        out += `<b>♟️ Çarpışma:</b> ${obj.adim_2_taktik_carpismasi}<br><br>`;
        out += `<i>${obj.savas_raporu}</i><br><br>`;
        
        let attO = obj.saldiran_oluler || {piyade:0, okcu:0, suvari:0, topcu:0};
        let attK = obj.saldiran_kalan || {piyade:0, okcu:0, suvari:0, topcu:0, moral:100};
        let defO = obj.savunan_oluler || {piyade:0, okcu:0, suvari:0, topcu:0};
        let defK = obj.savunan_kalan || {piyade:0, okcu:0, suvari:0, topcu:0, moral:100};

        let attName = currentBattleData ? currentBattleData.saldiran_id : "Saldıran";
        let defName = currentBattleData ? currentBattleData.savunan_id : "Savunan";

        out += `<div style="background:rgba(231,76,60,0.1); padding:5px; border-left:3px solid #e74c3c; margin-bottom:5px;">`;
        out += `<b>${attName} Kayıpları:</b> 💀${attO.piyade} Piyade, 💀${attO.okcu||0} Okçu, 💀${attO.suvari} Süvari, 💀${attO.topcu} Topçu<br>`;
        out += `<small style="color:#e74c3c">Kalan Ordu: 🧍${attK.piyade} | 🏹${attK.okcu||0} | 🐎${attK.suvari} | 💣${attK.topcu} | <b>%${attK.moral||100} Moral</b></small></div>`;

        out += `<div style="background:rgba(52,152,219,0.1); padding:5px; border-left:3px solid #3498db; margin-bottom:10px;">`;
        out += `<b>${defName} Kayıpları:</b> 💀${defO.piyade} Piyade, 💀${defO.okcu||0} Okçu, 💀${defO.suvari} Süvari, 💀${defO.topcu} Topçu<br>`;
        out += `<small style="color:#3498db">Kalan Ordu: 🧍${defK.piyade} | 🏹${defK.okcu||0} | 🐎${defK.suvari} | 💣${defK.topcu} | <b>%${defK.moral||100} Moral</b></small></div>`;

        out += `<b style="color:var(--border-gold);">Durum/Kazanan: ${obj.kazanan}</b>`;
        return out;
    } catch(e) {
        return raw.replace(/\n/g, '<br>');
    }
}

window.sendBattleMessage = async function() {
    // İzleyiciler mesaj gönderemez. Arayüzde zaten input kutusu yok, bu ekstra bir güvenlik katmanı.
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
            // Ordu sayıları GM değerlendirmesinden sonra güncellenince, kendi ordu paneli canlı yenilensin.
            currentBattleData = payload.new;
            renderOwnArmyInfo();
        })
        .subscribe();
};

window.endBattle = async function(savasId) {
    if(!confirm("Savaşı bitirmek ve BÜTÜN chat geçmişini sonsuza dek silmek istediğine emin misin? (Veritabanı temizliği için önerilir)")) return;
    
    const supabaseClient = (typeof sb !== 'undefined' ? sb : null);
    await supabaseClient.from('savaslar').delete().eq('id', savasId);
    alert("Savaş ve tüm geçmişi silindi.");
    if(currentBattleSubscription) supabaseClient.removeChannel(currentBattleSubscription);
    openBattleLobby();
};

// --- 4. GEMINI ENTEGRASYONU ---
window.evaluateTurnWithGemini = async function(retryCount = 0) {
    const apiKey = localStorage.getItem("OSMOYUN_GEMINI_KEY");
    if(!apiKey) return;
    if(!currentBattleData) return;

    const supabaseClient = (typeof sb !== 'undefined' ? sb : null);
    
    const { data: msgs } = await supabaseClient.from('savas_mesajlari').select('gonderen,mesaj').eq('savas_id', currentActiveBattleId).order('gonderilme_tarihi', { ascending: true });
    let chatHistoryText = msgs.map(m => `${m.gonderen}: ${m.mesaj}`).join("\n");
    
    const attName = currentBattleData.saldiran_id;
    const defName = currentBattleData.savunan_id;

    const systemPrompt = `Sen gerçekçi bir savaş simülasyonu oyununun (Wargame) Oyun Yöneticisi ve Hakemisin.
KURAL 1: Savaşın geçtiği HAVA DURUMUNU (sohbette Sistem mesajında yazar) mutlaka dikkate al. (Örn: Yağmurda topçular ve atlılar zayıflar, siste okçular isabet ettiremez ve pusu kolaylaşır).
KURAL 2: Orduların MORAL durumunu takip et. Ağır kayıplar, pusular veya hava şartları morali düşürür. Etkili taktikler morali sabit tutar veya artırır.
KURAL 3: Eğer bir ordunun Morali %20'nin altına düşerse ordu PANİĞE KAPILIR ve KAÇAR. Bu durumda kalan askerleri öldürme ama savaşı bitir ve kazananı ilan et!
KURAL 4: Tarafların taktiklerine göre kayıpları NET TAM SAYI olarak hesapla. Tek turda herkesin ölmesi gerekmez, savaşlar genelde aşama aşama ilerler. Savaş bitmediyse Kazanan kısmına "Savaş Devam Ediyor" yaz.
KURAL 5: Taraf isimlerini KESİNLİKLE uydurma. Saldıran: ${attName}, Savunan: ${defName}.
KURAL 6: Sohbetteki gizli emirleri ve arazinin durumunu analiz etip, edebi ve heyecanlı bir savaş raporu sun.

Format:
{
    "adim_1_hava_ve_arazi": "Hava durumu ve arazi analizi",
    "adim_2_taktik_carpismasi": "Taktik durumu",
    "savas_raporu": "Destansı savaş raporu.",
    "saldiran_oluler": {"piyade": 100, "okcu": 50, "suvari": 0, "topcu": 0},
    "savunan_oluler": {"piyade": 50, "okcu": 20, "suvari": 10, "topcu": 0},
    "saldiran_kalan": {"piyade": 9900, "okcu": 1950, "suvari": 5000, "topcu": 200, "moral": 85},
    "savunan_kalan": {"piyade": 4950, "okcu": 980, "suvari": 1990, "topcu": 40, "moral": 90},
    "kazanan": "Savaş Devam Ediyor (veya ... Devleti Kazandı)"
}`;

    const userPrompt = `[Bölge: ${currentBattleData.bolge}]\nSaldıran (${attName}) Ordusu: ${JSON.stringify(currentBattleData.saldiran_ordu)}\nSavunan (${defName}) Ordusu: ${JSON.stringify(currentBattleData.savunan_ordu)}\n[SOHBET VE HAMLELER]\n${chatHistoryText}`;

    const requestBody = {
        contents: [{ parts: [{ text: systemPrompt + "\n\n" + userPrompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.1
        }
    };
    
    try {
        if(retryCount === 0) {
            await supabaseClient.from('savas_mesajlari').insert([{
                savas_id: currentActiveBattleId,
                gonderen: 'Sistem',
                mesaj: `⏳ Game Master (Gemini) cephedeki son durumu değerlendiriyor...`
            }]);
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent`, {
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
            throw new Error(`HTTP Error ${response.status}`);
        }
        
        const data = await response.json();
        const rawResponse = data.candidates[0].content.parts[0].text;
        
        await supabaseClient.from('savas_mesajlari').delete().like('mesaj', '%Game Master (Gemini) cephedeki son durumu değerlendiriyor%').eq('savas_id', currentActiveBattleId);
        await supabaseClient.from('savas_mesajlari').insert([{ savas_id: currentActiveBattleId, gonderen: 'Game Master (Gemini)', mesaj: rawResponse }]);
        
        // Sadece odanın geçici hafızasını güncelle (2. tur için)
        try {
            let cleanStr2 = rawResponse.replace(/```json/gi, "").replace(/```/gi, "").trim();
            let obj2 = JSON.parse(cleanStr2);
            if(obj2.saldiran_kalan && obj2.savunan_kalan) {
                let sK = obj2.saldiran_kalan;
                let dK = obj2.savunan_kalan;
                let attUpdate = {"Piyade": sK.piyade, "Okçu": sK.okcu, "Süvari": sK.suvari, "Topçu": sK.topcu, "Moral": sK.moral||100};
                let defUpdate = {"Piyade": dK.piyade, "Okçu": dK.okcu, "Süvari": dK.suvari, "Topçu": dK.topcu, "Moral": dK.moral||100};
                await supabaseClient.from('savaslar').update({saldiran_ordu: attUpdate, savunan_ordu: defUpdate}).eq('id', currentActiveBattleId);
            }
        } catch(ex) {}
        
    } catch(e) {
        await supabaseClient.from('savas_mesajlari').delete().like('mesaj', '%Game Master (Gemini) cephedeki son durumu değerlendiriyor%').eq('savas_id', currentActiveBattleId);
        await supabaseClient.from('savas_mesajlari').insert([{ 
            savas_id: currentActiveBattleId, 
            gonderen: 'Sistem', 
            mesaj: `❌ Hata oluştu: ${e.message}. Lütfen hamlenizi tekrar yazın veya bir süre bekleyin.` 
        }]);
        console.error("Savaş Botu Hatası: ", e);
    }
};
