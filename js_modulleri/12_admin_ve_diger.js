// Ne işe yarar: Admin paneli, log kaydetme, devlet aktarımı ve ferman satın alma işlemleri yer alır.

function openAdmin(){
 if(!isAdmin) return;
 let stateHtml = db.states.map(s => {
    return `<div class="list-item"><span><b>${esc(s.name)}</b><br><small>${esc(s.ownerEmail||'Sahipsiz')}</small></span>
    <div><button class="btn green small" onclick="openStateForm('${s.id}')">DÜZENLE</button>
    <button class="btn red small" onclick="deleteState('${s.id}')">SİL</button></div></div>`;
 }).join('');
 modal(`<h2>⚙ YÖNETİM PANELİ</h2>
 <div class="formgrid">
 <div class="full actions"><button class="btn green" onclick="openGameMap()">🗺️ HARİTA VE ATAMA</button><button class="btn blue" onclick="openStrategicRegionAdmin()">⭐ STRATEJİK BÖLGELER</button></div>
 <div class="full" style="background:rgba(10,12,14,0.6); padding:10px; border:1px solid var(--border-gold); margin-bottom:10px;">
 <h4 style="margin-top:0;">Paşa & Divan Efekt Güncellemesi</h4>
 <p class="sub">Paşaların yetenekleri değiştiğinde oyundaki mevcut paşalara da uygula.</p>
 <button class="btn gold" onclick="restoreOriginalAdvisorEffects()">TÜM PAŞALARIN EFEKTLERİNİ GÜNCELLE</button>
 </div>
 ${field("set_mapIntelReportCost", "İstihbarat Raporu Maliyeti", db.settings.mapIntelReportCost||100000, "number")}
 ${field("set_educatedTaxMultiplier", "Eğitimli Sınıf Vergi Çarpanı", db.settings.educatedTaxMultiplier??1.5, "number", "0.1")}
 </div>
 <h3>Fiyatlar</h3><div class="formgrid">
 ${field("p_piyade", "Piyade Fiyat", db.settings.prices.piyade, "number")}
 ${field("p_suvari", "Süvari Fiyat", db.settings.prices.suvari, "number")}
 ${field("p_nisanci", "Nişancı Fiyat", db.settings.prices.nisanci, "number")}
 ${field("p_kucuk_top", "K. Top Fiyat", db.settings.prices.kucuk_top, "number")}
 ${field("p_orta_top", "O. Top Fiyat", db.settings.prices.orta_top, "number")}
 ${field("p_buyuk_top", "B. Top Fiyat", db.settings.prices.buyuk_top, "number")}
 ${field("p_kucuk_gemi", "K. Gemi", db.settings.prices.kucuk_gemi, "number")}
 ${field("p_orta_gemi", "O. Gemi", db.settings.prices.orta_gemi, "number")}
 ${field("p_buyuk_gemi", "B. Gemi", db.settings.prices.buyuk_gemi, "number")}
 ${field("p_kucuk_liman", "K. Liman", db.settings.prices.kucuk_liman, "number")}
 ${field("p_orta_liman", "O. Liman", db.settings.prices.orta_liman, "number")}
 ${field("p_buyuk_liman", "B. Liman", db.settings.prices.buyuk_liman, "number")}
 ${field("p_kucuk_ocak", "K. Ocak", db.settings.prices.kucuk_ocak, "number")}
 ${field("p_orta_ocak", "O. Ocak", db.settings.prices.orta_ocak, "number")}
 ${field("p_buyuk_ocak", "B. Ocak", db.settings.prices.buyuk_ocak, "number")}
 ${field("p_okul", "Okul Fiyatı", db.settings.prices.okul, "number")}
 ${field("p_istihbarat_binasi", "İstihbarat Fiyat", db.settings.prices.istihbarat_binasi, "number")}
 </div>
 <h3>Bakım & Kapasite</h3><div class="formgrid">
 ${field("u_piyade", "Piyade Bakım", db.settings.upkeep.piyade, "number")}
 ${field("u_suvari", "Süvari Bakım", db.settings.upkeep.suvari, "number")}
 ${field("u_nisanci", "Nişancı Bakım", db.settings.upkeep.nisanci, "number")}
 ${field("c_kucuk_liman", "K. Liman Kap.", db.settings.capacity.kucuk_liman, "number")}
 ${field("c_orta_liman", "O. Liman Kap.", db.settings.capacity.orta_liman, "number")}
 ${field("c_buyuk_liman", "B. Liman Kap.", db.settings.capacity.buyuk_liman, "number")}
 ${field("c_kucuk_ocak", "K. Ocak Kap.", db.settings.capacity.kucuk_ocak, "number")}
 ${field("c_orta_ocak", "O. Ocak Kap.", db.settings.capacity.orta_ocak, "number")}
 ${field("c_buyuk_ocak", "B. Ocak Kap.", db.settings.capacity.buyuk_ocak, "number")}
 ${field("c_okul_capacity", "Okul Kapasitesi", db.settings.schoolCapacityPerBuilding, "number")}
 ${field("u_okul_upkeep", "Okul Bakımı", db.settings.schoolUpkeep, "number")}
 </div>
 
 <h3>Mevcut Devletler</h3><div class="cards" style="margin-bottom:10px;">${stateHtml}</div>
 <div class="actions"><button class="btn" onclick="closeModal()">İPTAL</button><button class="btn green" onclick="saveSettings()">KAYDET</button></div>`);
}

function field(id, label, value, type="text", step="1") {
    const isStep = type === 'number' ? `step="${step}"` : '';
    return `<div><label>${label}</label><input type="${type}" id="f_${id}" value="${esc(value)}" ${isStep}></div>`;
}

function saveSettings(){
 if(!isAdmin) return;
 const v = (id) => Number(document.getElementById("f_"+id).value) || 0;
 db.settings.prices = { piyade:v('p_piyade'),suvari:v('p_suvari'),nisanci:v('p_nisanci'), kucuk_top:v('p_kucuk_top'),orta_top:v('p_orta_top'),buyuk_top:v('p_buyuk_top'), kucuk_gemi:v('p_kucuk_gemi'),orta_gemi:v('p_orta_gemi'),buyuk_gemi:v('p_buyuk_gemi'), kucuk_liman:v('p_kucuk_liman'),orta_liman:v('p_orta_liman'),buyuk_liman:v('p_buyuk_liman'), kucuk_ocak:v('p_kucuk_ocak'),orta_ocak:v('p_orta_ocak'),buyuk_ocak:v('p_buyuk_ocak'), okul:v('p_okul'), istihbarat_binasi:v('p_istihbarat_binasi') };
 db.settings.upkeep = { piyade:v('u_piyade'),suvari:v('u_suvari'),nisanci:v('u_nisanci') };
 db.settings.capacity = { kucuk_liman:v('c_kucuk_liman'),orta_liman:v('c_orta_liman'),buyuk_liman:v('c_buyuk_liman'), kucuk_ocak:v('c_kucuk_ocak'),orta_ocak:v('c_orta_ocak'),buyuk_ocak:v('c_buyuk_ocak') };
 db.settings.schoolCapacityPerBuilding = v('c_okul_capacity');
 db.settings.schoolUpkeep = v('u_okul_upkeep');
 db.settings.mapIntelReportCost = v('set_mapIntelReportCost');
 db.settings.educatedTaxMultiplier = Number(document.getElementById("f_set_educatedTaxMultiplier").value) || 1.5;
 queueSave(); closeModal();
}

function openStateForm(id=null) {
 if(!isAdmin) return;
 const s = id ? getState(id) : {};
 const m = id ? "DÜZENLE" : "EKLE";
 
 modal(`<h2>DEVLET ${m}</h2>
 <div class="formgrid">
 ${field("s_name","Devlet Adı",s.name||"")}
 ${field("s_ruler","Hükümdar / Lider",s.ruler||"")}
 ${field("s_title","Unvan / Rejim Türü",s.title||"Devlet")}
 ${field("s_owner","Oyuncu Email",s.ownerEmail||"")}
 ${field("s_treasury","Hazine (TL)",s.treasury||3000000,"number")}
 ${field("s_population","Toplam Nüfus",s.population||1000000,"number")}
 ${field("s_tax","Vergi Oranı (%)",s.tax||30,"number")}
 ${field("s_civil","Sivil Saray Gideri",s.civilExpense||200000,"number")}
 ${field("s_hap","Mutluluk (0-100)",s.happiness||100,"number")}
 ${field("s_debt","Borç Yılı",s.debtYears||0,"number")}
 ${field("s_color","Devlet Rengi (Harita / Kart)",s.color||"#c5a059","color")}
 <div class="full"><label>Portre URL</label><input type="text" id="f_s_rulerImage" value="${esc(s.rulerImage||"")}"></div>
 <div class="full"><label>Arkaplan URL</label><input type="text" id="f_s_bgImage" value="${esc(s.bgImage||"")}"></div>
 </div>
 <div class="actions"><button class="btn" onclick="closeModal()">İPTAL</button><button class="btn green" onclick="saveState('${id||''}')">KAYDET</button></div>`);
}

function saveState(id){
 if(!isAdmin) return;
 const s = id ? getState(id) : {id: crypto.randomUUID(), customLedger: [], permanentLedger: [], customItems: [], hiredAdvisors: [], advisorHiredYears: {}};
 s.name = document.getElementById("f_s_name").value;
 s.ruler = document.getElementById("f_s_ruler").value;
 s.title = document.getElementById("f_s_title").value;
 s.ownerEmail = document.getElementById("f_s_owner").value.toLowerCase();
 s.treasury = Number(document.getElementById("f_s_treasury").value);
 s.population = Number(document.getElementById("f_s_population").value);
 s.tax = Number(document.getElementById("f_s_tax").value);
 s.civilExpense = Number(document.getElementById("f_s_civil").value);
 s.happiness = Number(document.getElementById("f_s_hap").value);
 s.debtYears = Number(document.getElementById("f_s_debt").value);
 s.color = document.getElementById("f_s_color").value;
 s.rulerImage = document.getElementById("f_s_rulerImage").value;
 s.bgImage = document.getElementById("f_s_bgImage").value;
 
 if(!id) db.states.push(s);
 queueSave(); closeModal(); renderHome();
}

function deleteState(id){
 if(!isAdmin) return;
 if(confirm("Bu devleti silmek istediğinize emin misiniz?")) {
     db.states = db.states.filter(s => s.id !== id);
     queueSave(); closeModal(); renderHome();
 }
}

function openAdminGrantModal(stateId=null) {
 if(!isAdmin) return;
 let opts = db.states.map(s => `<option value="${s.id}" ${s.id===stateId?'selected':''}>${esc(s.name)}</option>`).join('');
 modal(`<h2>💸 HAZİNEYE PARA GÖNDER (ADMİN)</h2>
 <div class="formgrid">
 <div><label>Devlet</label><select id="admin_grant_to">${opts}</select></div>
 <div><label>Miktar (TL)</label><input type="number" id="admin_grant_amt" value="1000000"></div>
 </div>
 <div class="actions"><button class="btn" onclick="closeModal()">İPTAL</button><button class="btn gold" onclick="processAdminGrant()">GÖNDER</button></div>`);
}
function processAdminGrant() {
 if(!isAdmin) return;
 const toId = document.getElementById('admin_grant_to').value;
 const amt = Number(document.getElementById('admin_grant_amt').value) || 0;
 const s = getState(toId);
 if(!s) return;
 const oldT = s.treasury;
 s.treasury += amt;
 addLog({stateId: s.id, stateName: s.name, action: `Admin Para Gönderdi`, cost: amt, qty: 1, oldTreasury: oldT, newTreasury: s.treasury});
 queueSave(); closeModal();
 if(currentId) openDetail(currentId);
 toast("Para gönderildi.", true);
}

function openDeduct(stateId) {
 if(!isAdmin) return;
 let s = getState(stateId);
 if(!s) return;
 modal(`<h2>💰 HAZİNEDEN KESİNTİ YAP</h2>
 <div class="formgrid">
 <div><label>Miktar (TL)</label><input type="number" id="deduct_amt" value="500000"></div>
 </div>
 <div class="actions"><button class="btn" onclick="closeModal()">İPTAL</button><button class="btn red" onclick="processDeduct('${stateId}')">KESİNTİ YAP</button></div>`);
}
function processDeduct(stateId) {
 if(!isAdmin) return;
 const amt = Number(document.getElementById('deduct_amt').value) || 0;
 const s = getState(stateId);
 const oldT = s.treasury;
 s.treasury -= amt;
 addLog({stateId: s.id, stateName: s.name, action: `Admin Tarafından Kesinti`, cost: amt, qty: 1, oldTreasury: oldT, newTreasury: s.treasury});
 queueSave(); closeModal(); openDetail(stateId);
}

function openTransfer(fromId) {
 const from = getState(fromId);
 if(!isAdmin && from.ownerEmail !== currentUserEmail) return;
 
 let opts = db.states.filter(s => s.id !== fromId).map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('');
 modal(`<h2>✉️ PARA AKTARIMI</h2>
 <div class="formgrid">
 <div><label>Alıcı Devlet</label><select id="transfer_to">${opts}</select></div>
 <div><label>Miktar (TL) [Mevcut: ${money(from.treasury)}]</label><input type="number" id="transfer_amt" max="${from.treasury}"></div>
 </div>
 <div class="actions"><button class="btn" onclick="closeModal()">İPTAL</button><button class="btn blue" onclick="processTransfer('${fromId}')">AKTAR</button></div>`);
}
function processTransfer(fromId) {
 const amt = Number(document.getElementById('transfer_amt').value) || 0;
 const toId = document.getElementById('transfer_to').value;
 const from = getState(fromId);
 const to = getState(toId);
 if(!to) return;
 if(amt <= 0 || from.treasury < amt) { alert("Yetersiz bakiye veya geçersiz tutar!"); return; }
 
 const oldFromT = from.treasury; const oldToT = to.treasury;
 from.treasury -= amt; to.treasury += amt;
 
 addLog({stateId: from.id, stateName: from.name, action: `Para Gönderildi -> ${to.name}`, cost: amt, qty: 1, oldTreasury: oldFromT, newTreasury: from.treasury});
 addLog({stateId: to.id, stateName: to.name, action: `Para Alındı <- ${from.name}`, cost: amt, qty: 1, oldTreasury: oldToT, newTreasury: to.treasury});
 
 queueSave(); closeModal(); openDetail(fromId);
 toast("Para aktarıldı.", true);
}

function buyEdict(stateId, edictId) {
 const s = getState(stateId);
 if(!isAdmin && s.ownerEmail !== currentUserEmail) return;
 if(rejectDebtPurchase(s))return;
 const e = EDICTS.find(x => x.id === edictId);
 if(!e) return;
 
 let cost = Math.floor(s.population * (db.settings.edictCost[edictId] || 0));
 if(s.treasury < cost) { alert("Hazine yetersiz!"); return; }
 
 const oldT = s.treasury;
 s.treasury -= cost;
 
 let pts = e.pts;
 if(edictId === 'denetim') pts = Math.floor(Math.random()*5) + 5; 
 
 const oldH = s.happiness;
 s.happiness = Math.min(100, s.happiness + pts);
 
 addLog({
     stateId: s.id, stateName: s.name, action: `Ferman: ${e.name}`, 
     cost: cost, qty: 1, oldTreasury: oldT, newTreasury: s.treasury, 
     unitName: "Mutluluk", oldUnit: oldH, newUnit: s.happiness
 });
 
 queueSave(); openDetail(stateId);
 toast(`${e.name} yayınlandı! Mutluluk +${pts}`, true);
}

function addLog(item) {
 item.logId = crypto.randomUUID();
 item.date = new Date().toLocaleString("tr-TR");
 item.user = currentUserEmail;
 db.purchaseLog.unshift(item);
 if(db.purchaseLog.length > 500) db.purchaseLog.pop();
}

function openPurchaseLogs() {
 const myLogs = isAdmin ? db.purchaseLog : db.purchaseLog.filter(l => l.user === currentUserEmail || l.stateName === getCurrentPlayerState()?.name);
 let html = myLogs.map(l => {
     let costStr = l.cost > 0 ? `<b style="color:var(--red);">-${money(l.cost)}</b>` : `<b style="color:var(--muted);">Bedelsiz / Bilgi</b>`;
     let diffHtml = '';
     if(l.eventChanges) {
         diffHtml = '<div style="margin-top:6px; font-size:12px;">' + l.eventChanges.map(c => `<div>${esc(c.label)}: <span class="muted">${c.kind==='money'?money(c.old):(c.kind==='percent'?num(c.old)+'%':num(c.old))}</span> → <b>${c.kind==='money'?money(c.new):(c.kind==='percent'?num(c.new)+'%':num(c.new))}</b></div>`).join('') + '</div>';
     } else if(l.oldTreasury !== undefined) {
         let unitStr = l.unitName ? `<br><b>${esc(l.unitName)}:</b> ${num(l.oldUnit)} → <b style="color:var(--green);">${num(l.newUnit)}</b>` : '';
         diffHtml = `<div style="font-size:12px; margin-top:4px; color:var(--muted);">Kasa: ${money(l.oldTreasury)} → <b style="color:#fff;">${money(l.newTreasury)}</b>${unitStr}</div>`;
     }
     return `<div class="list-item" style="flex-direction:column; align-items:flex-start;">
        <div style="width:100%; display:flex; justify-content:space-between; margin-bottom:4px;">
            <b style="color:var(--gold);">${esc(l.stateName)}</b>
            <span class="sub">${esc(l.date)} | ${esc(l.user)}</span>
        </div>
        <div>${esc(l.action)}</div>
        <div style="margin-top:4px;">${costStr}</div>
        ${diffHtml}
     </div>`;
 }).join('');
 if(!html) html = `<p class="sub">Log kaydı bulunmuyor.</p>`;
 modal(`<h2>📜 İŞLEM LOGLARI</h2><div style="max-height:60vh; overflow:auto;">${html}</div><div class="actions" style="margin-top:12px;"><button class="btn blue" onclick="closeModal()">KAPAT</button></div>`);
}
