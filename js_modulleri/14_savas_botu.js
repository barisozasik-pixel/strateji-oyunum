// --- PVP SAVAŞ ODASI (GEMINI GAME MASTER) SUNUCUSUZ ---
window.getGeminiApiKey = function() {
    let key = localStorage.getItem("OSMOYUN_GEMINI_KEY");
    if (!key) {
        key = prompt("Lütfen Gemini API Anahtarınızı girin:\n(Bu anahtar GITHUB'a yüklenmez, sadece sizin tarayıcınıza güvenli kaydedilir.)");
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

window.openPvPWarRoomModal = function() {
    let stateOptions = (db.states || []).map(s => `<option value="${s.id}">${s.name} (${s.ownerEmail || 'NPC'})</option>`).join('');
    
    let html = `
    <h2>⚔️ PVP SAVAŞ ODASI (Game Master)</h2>
    <div style="background:var(--panel-light); padding:12px; border-radius:4px; border:1px solid var(--line); margin-bottom:15px; height: 250px; overflow-y: auto;" id="war_chat_history">
        <p class="sub">Gemini (Game Master): Sistem hazır. İki tarafın güçlerini ve taktiklerini girin, savaşı başlatalım.</p>
    </div>
    
    <div class="formgrid">
        <div class="full" style="text-align:center;">
            <label style="font-size:14px; color:var(--border-gold);">Saldırılan Bölge (Hedef)</label>
            <input type="text" id="war_location" placeholder="Örn: Tahran, Viyana, Belgrad..." style="text-align:center; font-size:16px;">
        </div>
        
        <!-- SALDIRAN PANELİ -->
        <div style="grid-column: span 1; background: rgba(192, 57, 43, 0.1); padding:10px; border:1px solid #c0392b; border-radius:4px;">
            <h3 style="margin-top:0; color:#e74c3c; text-align:center;">🗡️ SALDIRAN DEVLET</h3>
            <label>Devlet Seç</label>
            <select id="war_attacker_id" onchange="updateArmyDisplay('attacker')">
                <option value="">-- Seç --</option>
                ${stateOptions}
            </select>
            <div id="war_attacker_display" style="color:var(--gold); font-size:11px; margin:5px 0;">Devlet bekleniyor...</div>
            
            <label>Taktik</label>
            <textarea id="war_attacker_tactic" rows="3" placeholder="Saldıranın hamlesi..."></textarea>
            
            <label style="display:flex; align-items:center; gap:5px; margin-top:8px; font-size:11px; cursor:pointer;">
                <input type="checkbox" id="war_attacker_custom" onchange="toggleCustomPanel('attacker')"> 
                Özel Ordu Miktarı Gir
            </label>
            <div id="panel_attacker_custom" class="hidden" style="margin-top:5px; font-size:11px;">
                <div style="display:flex; gap:5px; margin-bottom:4px;">
                    <div style="flex:1;"><label>Piyade</label><input type="number" id="war_a_piyade" value="0" min="0"></div>
                    <div style="flex:1;"><label>Süvari</label><input type="number" id="war_a_suvari" value="0" min="0"></div>
                </div>
                <div style="display:flex; gap:5px;">
                    <div style="flex:1;"><label>Nişancı</label><input type="number" id="war_a_nisanci" value="0" min="0"></div>
                    <div style="flex:1;"><label>Topçu</label><input type="number" id="war_a_top" value="0" min="0"></div>
                </div>
            </div>
        </div>
        
        <!-- SAVUNAN PANELİ -->
        <div style="grid-column: span 1; background: rgba(41, 128, 185, 0.1); padding:10px; border:1px solid #2980b9; border-radius:4px;">
            <h3 style="margin-top:0; color:#3498db; text-align:center;">🛡️ SAVUNAN DEVLET</h3>
            <label>Devlet Seç</label>
            <select id="war_defender_id" onchange="updateArmyDisplay('defender')">
                <option value="">-- Seç --</option>
                ${stateOptions}
            </select>
            <div id="war_defender_display" style="color:var(--gold); font-size:11px; margin:5px 0;">Devlet bekleniyor...</div>
            
            <label>Taktik</label>
            <textarea id="war_defender_tactic" rows="3" placeholder="Savunanın hamlesi..."></textarea>
            
            <label style="display:flex; align-items:center; gap:5px; margin-top:8px; font-size:11px; cursor:pointer;">
                <input type="checkbox" id="war_defender_custom" onchange="toggleCustomPanel('defender')"> 
                Özel Ordu Miktarı Gir
            </label>
            <div id="panel_defender_custom" class="hidden" style="margin-top:5px; font-size:11px;">
                <div style="display:flex; gap:5px; margin-bottom:4px;">
                    <div style="flex:1;"><label>Piyade</label><input type="number" id="war_d_piyade" value="0" min="0"></div>
                    <div style="flex:1;"><label>Süvari</label><input type="number" id="war_d_suvari" value="0" min="0"></div>
                </div>
                <div style="display:flex; gap:5px;">
                    <div style="flex:1;"><label>Nişancı</label><input type="number" id="war_d_nisanci" value="0" min="0"></div>
                    <div style="flex:1;"><label>Topçu</label><input type="number" id="war_d_top" value="0" min="0"></div>
                </div>
            </div>
        </div>
    </div>
    
    <div class="actions" style="margin-top:15px;">
        <button class="btn green" onclick="sendPvPWarMessage()" id="btn_war_send" style="width:100%; padding:10px; font-size:16px;">🔥 SAVAŞTIR (Gemini)</button>
        <div style="display:flex; width:100%; gap:5px; margin-top:5px;">
            <button class="btn" onclick="closeModal()" style="flex:1;">KAPAT</button>
            <button class="btn red" onclick="clearGeminiApiKey()" style="flex:1;">🔑 API ANAHTARINI SIFIRLA</button>
        </div>
    </div>
    `;
    modal(html);
};

window.toggleCustomPanel = function(side) {
    const isCustom = document.getElementById(`war_${side}_custom`).checked;
    const panel = document.getElementById(`panel_${side}_custom`);
    if(isCustom) panel.classList.remove("hidden");
    else panel.classList.add("hidden");
};

window.updateArmyDisplay = function(side) {
    const stateId = document.getElementById(`war_${side}_id`).value;
    const disp = document.getElementById(`war_${side}_display`);
    if(!stateId) { disp.innerHTML = "Devlet bekleniyor..."; return; }
    
    const s = getState(stateId);
    if(!s) return;
    
    let topcu = (s.kucuk_top||0) + (s.orta_top||0) + (s.buyuk_top||0);
    disp.innerHTML = `Toplam: ${s.piyade||0} Piyade, ${s.suvari||0} Süvari, ${s.nisanci||0} Nişancı, ${topcu} Topçu`;
};

window.getArmyDataForSide = function(side, stateId) {
    const s = getState(stateId);
    const isCustom = document.getElementById(`war_${side}_custom`).checked;
    if(isCustom) {
        return {
            "Piyade": parseInt(document.getElementById(`war_${side.charAt(0)}_piyade`).value)||0,
            "Süvari": parseInt(document.getElementById(`war_${side.charAt(0)}_suvari`).value)||0,
            "Nişancı": parseInt(document.getElementById(`war_${side.charAt(0)}_nisanci`).value)||0,
            "Topçu": parseInt(document.getElementById(`war_${side.charAt(0)}_top`).value)||0
        };
    } else {
        return {
            "Piyade": s.piyade||0,
            "Süvari": s.suvari||0,
            "Nişancı": s.nisanci||0,
            "Topçu": (s.kucuk_top||0) + (s.orta_top||0) + (s.buyuk_top||0)
        };
    }
};

window.sendPvPWarMessage = async function() {
    const location = document.getElementById("war_location").value.trim();
    const attId = document.getElementById("war_attacker_id").value;
    const defId = document.getElementById("war_defender_id").value;
    const attTactic = document.getElementById("war_attacker_tactic").value.trim();
    const defTactic = document.getElementById("war_defender_tactic").value.trim();
    
    if(!location || !attId || !defId || !attTactic || !defTactic) {
        alert("Eksik bilgi var! Lütfen Bölge, İki Devlet ve İki Taktiği de doldurun.");
        return;
    }
    
    const apiKey = getGeminiApiKey();
    if(!apiKey) {
        alert("Savaşı başlatabilmek için bir Gemini API Anahtarına ihtiyacınız var.");
        return;
    }
    
    const attState = getState(attId);
    const defState = getState(defId);
    const attArmy = getArmyDataForSide('attacker', attId);
    const defArmy = getArmyDataForSide('defender', defId);
    
    const btn = document.getElementById("btn_war_send");
    btn.disabled = true;
    btn.innerText = "⏳ SAVAŞILIYOR (GEMİNİ ANALİZ EDİYOR)...";
    
    const chatHistory = document.getElementById("war_chat_history");
    chatHistory.innerHTML += `<div style="margin-top:10px; border-left:3px solid var(--blue); padding-left:8px;">
        <span style="font-size:10px; color:var(--muted)">${new Date().toLocaleTimeString()} - Hedef: ${location}</span><br>
        <b>Saldıran (${attState.name}):</b> ${attTactic} <span style="color:#aaa;font-size:10px;">[Ordu: ${JSON.stringify(attArmy)}]</span><br>
        <b>Savunan (${defState.name}):</b> ${defTactic} <span style="color:#aaa;font-size:10px;">[Ordu: ${JSON.stringify(defArmy)}]</span>
    </div>`;
    chatHistory.scrollTop = chatHistory.scrollHeight;
    
    const systemPrompt = `Sen tarihi bir strateji oyununun Oyun Yöneticisi ve Savaş Hakemisin.
İki gerçek oyuncu savaş alanında karşı karşıya geliyor. Sana ordular ve komutlar iletilecek.

KURAL 1: Taktikler ve arazi, ham gücü en fazla +%30 veya -%30 etkileyebilir.
KURAL 2: Mantıksal çıkarım yap. Sabit kurallar yoktur, dinamiklere göre analiz et.
KURAL 3: Savaşın sonucunu önce analiz et, kayıpları bu analize göre belirle.
KURAL 4: Cevabını SADECE JSON formatında ver. Başka metin veya markdown (örn. \`\`\`json) yazma.

Döndüreceğin format TAM OLARAK şu olmalıdır:
{
    "adim_1_arazi_analizi": "Arazinin avantajı/dezavantajı",
    "adim_2_taktik_carpismasi": "Kimin taktiği işe yaradı?",
    "adim_3_guc_degisimi": "Güç dengesi kime kaydı?",
    "savas_raporu": "Destansı savaş raporu.",
    "a_takimi_kayip_yuzdesi": 45,
    "b_takimi_kayip_yuzdesi": 80,
    "kazanan": "Saldıran veya Savunan veya Beraberlik"
}`;
    
    const userPrompt = `
Sunucu Verileri: ${JSON.stringify({savas_bolgesi: location, saldiran_ordu: attArmy, savunan_ordu: defArmy})}
A Takımının (Saldıran - ${attState.name}) Hamlesi: ${attTactic}
B Takımının (Savunan - ${defState.name}) Hamlesi: ${defTactic}`;

    const requestBody = {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: userPrompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.7 }
    };
    
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            if (response.status === 400 || response.status === 403) {
                alert("API Anahtarınız geçersiz veya yetkisiz olabilir. Lütfen kontrol edin.");
                clearGeminiApiKey();
            }
            throw new Error(`HTTP Error ${response.status}`);
        }
        
        const data = await response.json();
        const rawResponse = data.candidates[0].content.parts[0].text;
        
        let resObj = null;
        try {
            let cleanStr = rawResponse.replace(/```json/gi, "").replace(/```/gi, "").trim();
            resObj = JSON.parse(cleanStr);
        } catch(e) {
            console.error("JSON Parse Error:", e, rawResponse);
            resObj = {
                savas_raporu: "Yapay zeka analiz sonucu düzgün bir formatta gelmedi. Saf yanıt:<br>" + rawResponse,
                kazanan: "Bilinmiyor"
            };
        }
        
        let kazananRenk = "var(--border-gold)";
        if(resObj.kazanan && resObj.kazanan.toLowerCase().includes(attState.name.toLowerCase())) kazananRenk = "#e74c3c";
        else if(resObj.kazanan && resObj.kazanan.toLowerCase().includes(defState.name.toLowerCase())) kazananRenk = "#3498db";
        
        let htmlOut = `<div style="margin-top:10px; border-left:4px solid ${kazananRenk}; padding-left:10px; background: rgba(10,12,14,0.6); padding-bottom:8px;">
            <h4 style="margin:5px 0; color:${kazananRenk};">⚔️ SAVAŞ ANALİZ RAPORU</h4>`;
        
        if(resObj.adim_1_arazi_analizi) htmlOut += `<div style="font-size:12px; margin-bottom:5px;"><b>🌍 Arazi Analizi:</b> ${resObj.adim_1_arazi_analizi}</div>`;
        if(resObj.adim_2_taktik_carpismasi) htmlOut += `<div style="font-size:12px; margin-bottom:5px;"><b>♟️ Taktik Çarpışması:</b> ${resObj.adim_2_taktik_carpismasi}</div>`;
        if(resObj.adim_3_guc_degisimi) htmlOut += `<div style="font-size:12px; margin-bottom:10px;"><b>⚖️ Güç Değişimi:</b> ${resObj.adim_3_guc_degisimi}</div>`;
        
        htmlOut += `<div style="font-size:14px; margin-bottom:10px; padding:8px; border:1px solid ${kazananRenk}; border-radius:4px; line-height:1.4;">${resObj.savas_raporu}</div>`;
        
        htmlOut += `<div style="display:flex; justify-content:space-between; gap:10px;">
            <div style="flex:1; background:rgba(231, 76, 60, 0.2); padding:5px; border-radius:3px; text-align:center;">
                <div style="font-size:10px; color:#e74c3c;">Saldıran (${attState.name}) Kaybı</div>
                <div style="font-weight:bold; font-size:16px;">%${resObj.a_takimi_kayip_yuzdesi||0}</div>
            </div>
            <div style="flex:1; background:rgba(52, 152, 219, 0.2); padding:5px; border-radius:3px; text-align:center;">
                <div style="font-size:10px; color:#3498db;">Savunan (${defState.name}) Kaybı</div>
                <div style="font-weight:bold; font-size:16px;">%${resObj.b_takimi_kayip_yuzdesi||0}</div>
            </div>
            <div style="flex:1; background:rgba(241, 196, 15, 0.2); padding:5px; border-radius:3px; text-align:center; border: 1px solid var(--gold);">
                <div style="font-size:10px; color:var(--gold);">Kazanan</div>
                <div style="font-weight:bold; font-size:14px; margin-top:2px;">${resObj.kazanan}</div>
            </div>
        </div></div>`;
        
        chatHistory.innerHTML += htmlOut;
        
    } catch(e) {
        alert("Bağlantı hatası: " + e.message);
        console.error(e);
    }
    
    btn.disabled = false;
    btn.innerText = "🔥 YENİDEN SAVAŞTIR";
    chatHistory.scrollTop = chatHistory.scrollHeight;
};
