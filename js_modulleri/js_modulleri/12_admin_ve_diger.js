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


function organizeAdminTabs(){
 const root=document.getElementById('modalContent');
 if(!root)return;
 const children=Array.from(root.children);
 const title=children.find(el=>el.tagName==='H2');
 const footer=children.find(el=>el.classList?.contains('actions')&&el.querySelector?.('[onclick*="saveAdmin"]'));
 const defs=[
   ['actions','⚙️ İşlemler'],['divan','👑 Divan'],['strategic','⭐ Stratejik Bölgeler'],['images','🖼️ Görseller'],
   ['custom','🌟 Özel Birimler'],['economy','💰 Fiyatlar & Ordu'],['population','🏰 Nüfus & Garnizon']
 ];
 const panels={};
 defs.forEach(([id])=>{const panel=document.createElement('div');panel.id='admin-tab-'+id;panel.className='admin-tab-content'+(id==='actions'?' active':'');panels[id]=panel;});
 let current='actions';
 children.forEach(node=>{
   if(node===title||node===footer)return;
   if(node.tagName==='H4'){
     const heading=(node.textContent||'').toLocaleUpperCase('tr-TR');
     if(heading.includes('DİVAN'))current='divan';
     else if(heading.includes('STRATEJİK'))current='strategic';
     else if(heading.includes('GÖRSEL'))current='images';
     else if(heading.includes('ÖZEL BİRİM'))current='custom';
     else if(heading.includes('GARNİZON')||heading.includes('NÜFUS'))current='population';
     else if(heading.includes('SATIN ALMA')||heading.includes('KAPASİTE')||heading.includes('BAKIM')||heading.includes('FERMAN')||heading.includes('SEFER'))current='economy';
   }
   panels[current].appendChild(node);
 });
 const tabs=document.createElement('div');
 tabs.className='hoi-tabs';
 tabs.innerHTML=defs.map(([id,label])=>`<div id="admin-tab-btn-${id}" class="admin-hoi-tab${id==='actions'?' active':''}" onclick="switchAdminTab('${id}')">${label}</div>`).join('');
 const panelWrap=document.createElement('div');
 defs.forEach(([id])=>panelWrap.appendChild(panels[id]));
 root.replaceChildren(...[title,tabs,panelWrap,footer].filter(Boolean));
}

function removeCustomItem(id){
   if(!confirm("Emin misiniz?")) return;
   db.settings.customItems = db.settings.customItems.filter(x => x.id !== id);
   saveAdmin(false);
}

function switchAdminTab(tabId){
 document.querySelectorAll('#modalContent .admin-hoi-tab').forEach(el=>el.classList.remove('active'));
 document.querySelectorAll('#modalContent .admin-tab-content').forEach(el=>el.classList.remove('active'));
 document.getElementById('admin-tab-btn-'+tabId)?.classList.add('active');
 document.getElementById('admin-tab-'+tabId)?.classList.add('active');
}

function openWarGarrisonModal()
{
 if(!isAdmin) return;
 const opts=`<option value="">Devlet seçin…</option>`+db.states.map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join("");
 modal(`<h2>⚔️ SAVAŞ VE ASKERİ KAYIPLAR</h2>
   <p class="sub">Buradan sildiğiniz askerler "Terhis" edilmiş sayılmaz, "Şehit/Ölü" sayılır. Yani elverişli nüfus havuzuna geri dönmezler ve ülkenin toplam nüfusundan kalıcı olarak düşülürler.</p>
   <div class="formgrid">
     <div class="full"><label>Hedef Devlet</label><select id="war_state" onchange="renderWarGarrisonFields()">${opts}</select></div>
   </div>
   <div id="war_garrison_fields"><p class="sub">İşlem yapmak için önce bir devlet seçin.</p></div>
   <div class="actions" style="margin-top:14px"><button class="btn" onclick="openAdmin()">GERİ</button></div>`);
}

function addNewAdvisor() {
    const name = document.getElementById("f_adv_new_name").value.trim();
    const role = document.getElementById("f_adv_new_role").value.trim();
    const stars = Number(document.getElementById("f_adv_new_stars").value) || 1;
    const faction = document.getElementById("f_adv_new_faction").value;
    const salary = Number(document.getElementById("f_adv_new_salary").value) || 0;
    const ageYears = Math.max(0, Number(document.getElementById("f_adv_new_ageYears").value) || 0);
    const maxAge = Math.max(ageYears + 1, Number(document.getElementById("f_adv_new_maxAge").value) || 20);
    const icon = cleanUrl(document.getElementById("f_adv_new_icon").value);
    
    const taxBonus = Number(document.getElementById("f_adv_new_taxBonus").value) || 0;
    const milUpkeepDiscount = Number(document.getElementById("f_adv_new_milUpkeepDiscount").value) || 0;
    const navyUpkeepDiscount = Number(document.getElementById("f_adv_new_navyUpkeepDiscount").value) || 0;
    const artUpkeepDiscount = Number(document.getElementById("f_adv_new_artUpkeepDiscount").value) || 0;
    const recruitDiscount = Number(document.getElementById("f_adv_new_recruitDiscount").value) || 0;
    const infraDiscount = Number(document.getElementById("f_adv_new_infraDiscount").value) || 0;
    const happinessBonus = Number(document.getElementById("f_adv_new_happinessBonus").value) || 0;
    const stopAnarchy = document.getElementById("f_adv_new_stopAnarchy").value === 'true';
    const spyAccuracyBonus = document.getElementById("f_adv_new_spyAccuracyBonus").value === 'true';

    const buff = document.getElementById("f_adv_new_buff").value.trim();
    const debuff = document.getElementById("f_adv_new_debuff").value.trim();
    
    if(!name || !role) { alert("Paşa ismi ve rolü boş olamaz!"); return; }
    
    db.advisors = db.advisors || [];
    db.advisors.push({
        id: "adv_" + crypto.randomUUID().split("-")[0],
        name, role, stars, faction, salary, maxAge, icon,
        ageYears, yearsSinceUpgrade: 0,
        taxBonus, milUpkeepDiscount, navyUpkeepDiscount, artUpkeepDiscount,
        recruitDiscount, infraDiscount, happinessBonus, stopAnarchy, spyAccuracyBonus,
        buff, debuff
    });
    queueSave();
    openAdmin();
}

function saveAdmin(doClose = true){
 const mapIntelCostEl=document.getElementById("f_map_intel_cost"); if(mapIntelCostEl)db.settings.mapIntelReportCost=Math.max(0,Number(mapIntelCostEl.value)||0);
 const schoolCapacityEl=document.getElementById("f_school_capacity"); if(schoolCapacityEl)db.settings.schoolCapacityPerBuilding=Math.max(0,Math.floor(Number(schoolCapacityEl.value)||0));
 const schoolUpkeepEl=document.getElementById("f_school_upkeep"); if(schoolUpkeepEl)db.settings.schoolUpkeep=Math.max(0,Number(schoolUpkeepEl.value)||0);
 const educatedMultiplierEl=document.getElementById("f_educated_tax_multiplier"); if(educatedMultiplierEl)db.settings.educatedTaxMultiplier=Math.max(0,Number(educatedMultiplierEl.value)||0);
 Object.keys(db.settings.prices).forEach(k=>{ const el=document.getElementById("f_p_"+k); if(el) db.settings.prices[k]=Number(el.value||0); });
 Object.keys(db.settings.capacity).forEach(k=>{ const el=document.getElementById("f_c_"+k); if(el) db.settings.capacity[k]=Number(el.value||0); });
 Object.keys(db.settings.upkeep).forEach(k=>{ const el=document.getElementById("f_u_"+k); if(el) db.settings.upkeep[k]=Number(el.value||0); });
 Object.keys(db.settings.garrisonUpkeep).forEach(k=>{ const el=document.getElementById("f_gu_"+k); if(el) db.settings.garrisonUpkeep[k]=Math.max(0,Number(el.value||0)); });
 Object.keys(db.settings.populationBuildingGrowth).forEach(k=>{ const el=document.getElementById("f_pg_"+k); if(el) db.settings.populationBuildingGrowth[k]=Math.max(0,Number(el.value||0)); });
 Object.keys(db.settings.populationBuildingCostPerPerson).forEach(k=>{ const el=document.getElementById("f_pc_"+k); if(el) db.settings.populationBuildingCostPerPerson[k]=Math.max(0,Number(el.value||0)); });
 Object.keys(db.settings.populationBuildingUpkeep).forEach(k=>{ const el=document.getElementById("f_pbu_"+k); if(el) db.settings.populationBuildingUpkeep[k]=Math.max(0,Number(el.value||0)); });
 Object.keys(db.settings.infrastructureUpkeep).forEach(k=>{ const el=document.getElementById("f_iu_"+k); if(el) db.settings.infrastructureUpkeep[k]=Math.max(0,Number(el.value||0)); });
 Object.keys(db.settings.edictCost).forEach(k=>{ const el=document.getElementById("f_ec_"+k); if(el) db.settings.edictCost[k]=Number(el.value||0); });
 Object.keys(db.settings.campaignCost).forEach(k=>{ const el=document.getElementById("f_cc_"+k); if(el) db.settings.campaignCost[k]=Number(el.value||0); });
 
 db.settings.images = db.settings.images || {};
 const imgKeys = ["piyade","suvari","nisanci","kucuk_top","orta_top","buyuk_top","kucuk_gemi","orta_gemi","buyuk_gemi","kucuk_liman","orta_liman","buyuk_liman","kucuk_ocak","orta_ocak","buyuk_ocak","okul","istihbarat_binasi","fortress","fortress_garrison","hastane","asevi","su_degirmeni","kervansaray","pazar"];
 imgKeys.forEach(k => {
     const el = document.getElementById("f_img_" + k);
     if(el) db.settings.images[k] = cleanUrl(el.value);
 });

 if(doClose){ closeModal(); queueSave(); if(currentId) openDetail(currentId); } else { queueSave(); openAdmin(); }
}

function saveAdvisorEdit(advId) {
    const a = (db.advisors||[]).find(x => x.id === advId);
    if(!a) return;
    a.name = document.getElementById("f_adv_edit_name").value.trim() || a.name;
    a.role = document.getElementById("f_adv_edit_role").value.trim() || a.role;
    a.stars = Number(document.getElementById("f_adv_edit_stars").value) || 1;
    a.faction = document.getElementById("f_adv_edit_faction").value;
    a.salary = Number(document.getElementById("f_adv_edit_salary").value) || 0;
    a.ageYears = Math.max(0, Number(document.getElementById("f_adv_edit_ageYears").value) || 0);
    a.maxAge = Math.max(a.ageYears + 1, Number(document.getElementById("f_adv_edit_maxAge").value) || 20);
    a.icon = cleanUrl(document.getElementById("f_adv_edit_icon").value);
    
    a.taxBonus = Number(document.getElementById("f_adv_edit_taxBonus").value) || 0;
    a.milUpkeepDiscount = Number(document.getElementById("f_adv_edit_milUpkeepDiscount").value) || 0;
    a.navyUpkeepDiscount = Number(document.getElementById("f_adv_edit_navyUpkeepDiscount").value) || 0;
    a.artUpkeepDiscount = Number(document.getElementById("f_adv_edit_artUpkeepDiscount").value) || 0;
    a.recruitDiscount = Number(document.getElementById("f_adv_edit_recruitDiscount").value) || 0;
    a.infraDiscount = Number(document.getElementById("f_adv_edit_infraDiscount").value) || 0;
    a.happinessBonus = Number(document.getElementById("f_adv_edit_happinessBonus").value) || 0;
    a.stopAnarchy = document.getElementById("f_adv_edit_stopAnarchy").value === 'true';
    a.spyAccuracyBonus = document.getElementById("f_adv_edit_spyAccuracyBonus").value === 'true';

    a.buff = document.getElementById("f_adv_edit_buff").value.trim();
    a.debuff = document.getElementById("f_adv_edit_debuff").value.trim();
    queueSave();
    openAdmin();
}

function renderWarGarrisonFields()
{
 const stateId=document.getElementById("war_state")?.value;
 const box=document.getElementById("war_garrison_fields");
 const s=getState(stateId);
 if(!box) return;
 if(!s){box.innerHTML='<p class="sub">İşlem yapmak için önce bir devlet seçin.</p>';return;}
 
 let customUnits = (db.settings.customItems||[]).filter(x => x.category === 'asker' && (!x.faction || x.faction === s.id));
 let customStatus = ""; let customInputs = "";
 customUnits.forEach(c => {
    customStatus += `${esc(c.name)}: <b>${num(s[c.id]||0)}</b> | `;
    customInputs += field("war_death_" + c.id, "Ölen " + esc(c.name), 0, "number");
 });
 box.innerHTML=`<div class="event-result" style="margin-top:10px; font-size:12px;">
     <b>${esc(s.name)} Mevcut Ordusu:</b><br>
     Piyade: <b>${num(s.piyade||0)}</b> | Süvari: <b>${num(s.suvari||0)}</b> | Nişancı: <b>${num(s.nisanci||0)}</b><br>
     K. Top: <b>${num(s.kucuk_top||0)}</b> | O. Top: <b>${num(s.orta_top||0)}</b> | B. Top: <b>${num(s.buyuk_top||0)}</b><br>
     K. Gemi: <b>${num(s.kucuk_gemi||0)}</b> | O. Gemi: <b>${num(s.orta_gemi||0)}</b> | B. Gemi: <b>${num(s.buyuk_gemi||0)}</b><br>
     Kale Garnizonu: <b>${num(s.fortressGarrison||0)}</b><br>
     ${customStatus ? customStatus + '<br>' : ''}
     <div class="sub" style="margin-top:4px; color:var(--red);">Bugüne kadar verilen toplam SAVAŞ ŞEHİDİ (Nüfustan düşülen): ${num((s.warCasualties||0)+(s.garrisonWarDeaths||0))} İnsan</div>
   </div>
   <div class="formgrid" style="margin-top:10px;">
     ${field("war_death_piyade","Ölen Piyade",0,"number")}
     ${field("war_death_suvari","Ölen Süvari",0,"number")}
     ${field("war_death_nisanci","Ölen Nişancı",0,"number")}
     ${customInputs}
     <div class="full" style="border-top:1px dashed var(--line); margin-top:5px; padding-top:5px;"></div>
     ${field("war_death_kucuk_top","Patlayan K. Top",0,"number")}
     ${field("war_death_orta_top","Patlayan O. Top",0,"number")}
     ${field("war_death_buyuk_top","Patlayan B. Top",0,"number")}
     ${field("war_death_kucuk_gemi","Batan K. Gemi",0,"number")}
     ${field("war_death_orta_gemi","Batan O. Gemi",0,"number")}
     ${field("war_death_buyuk_gemi","Batan B. Gemi",0,"number")}
     ${field("war_death_garrison","Ölen Kale Garnizonu",0,"number")}
   </div>
   <button class="btn red" style="width:100%;margin-top:10px;" onclick="applyWarGarrisonDeaths('${s.id}')">KAYIPLARI UYGULA (NÜFUSTAN DÜŞ)</button>`;
}

function addCustomItem(){
   const name = document.getElementById("f_ci_name").value.trim(), cat = document.getElementById("f_ci_cat").value, faction = document.getElementById("f_ci_faction").value;
   const price = Number(document.getElementById("f_ci_price").value)||0, upkeep = Number(document.getElementById("f_ci_upkeep").value)||0, campCost = Number(document.getElementById("f_ci_campCost").value)||0, icon = cleanUrl(document.getElementById("f_ci_icon").value);
   if(!name){alert("İsim gerekli!"); return;}
   const id = "c_" + crypto.randomUUID().split("-")[0];
   db.settings.customItems = db.settings.customItems || [];
   db.settings.customItems.push({id, name, category: cat, price, upkeep, campCost, icon, faction});
   saveAdmin(false);
}

function executeAdminGrant() {
    if(!isAdmin) return;
    const targetId = document.getElementById("grant_target").value;
    const target = getState(targetId);
    const amt = Math.floor(Number(document.getElementById("grant_amt").value) || 0);
    const desc = document.getElementById("grant_desc").value.trim() || "Genel Hazine Desteği";

    if(!target || amt <= 0) { alert("Geçerli bir tutar ve hedef devlet seçmelisiniz!"); return; }

    const oldT = target.treasury || 0;
    target.treasury = oldT + amt;

    addLog({
        stateId: target.id,
        stateName: target.name,
        action: `Admin Para Yardımı (${desc})`,
        cost: amt,
        qty: 1,
        oldTreasury: oldT,
        newTreasury: target.treasury
    });
    
    closeModal();
    queueSave();
    if(currentId) openDetail(currentId); else renderHome();
    alert(`Başarıyla ${target.name} hazinesine ${money(amt)} aktarıldı!`);
}

function removeAdvisor(advId) {
    if(!confirm("Bu paşayı silmek istediğinize emin misiniz?")) return;
    db.advisors = (db.advisors||[]).filter(x => x.id !== advId);
    db.states.forEach(s => {
        if(s.hiredAdvisors) s.hiredAdvisors = s.hiredAdvisors.filter(id => id !== advId);
    });
    queueSave();
    openAdmin();
}

function mergePurchaseLogs(remoteLogs,localLogs){
 const result=[],seen=new Set();
 for(const log of [...(localLogs||[]),...(remoteLogs||[])]){
  const key=log.logId||[log.stateId,log.state,log.item,log.date,log.user,log.qty,log.cost].join('|');
  if(seen.has(key))continue;
  seen.add(key);result.push(log);
  if(result.length>=300)break;
 }
 return result;
}

function applyWarGarrisonDeaths(stateId)
{
 if(!isAdmin) return;
 const s=getState(stateId);
 if(!s) return;
 
 let totalHumanDeaths = 0;
 let totalEquipmentLost = 0;
 let details = [];
 
 // İnsan kayıpları (Nüfustan Düşecekler)
 const humanKeys = ["piyade", "suvari", "nisanci"];
 let customUnits = (db.settings.customItems||[]).filter(x => x.category === 'asker' && (!x.faction || x.faction === s.id));
 customUnits.forEach(c => humanKeys.push(c.id));
 
 for(const k of humanKeys) {
     const lost = Math.max(0, Math.floor(Number(document.getElementById("f_war_death_" + k)?.value)||0));
     if(lost > 0) {
         if(lost > (s[k]||0)) { alert(`${k} kaybı mevcut ordudan fazla olamaz!`); return; }
         s[k] -= lost;
         totalHumanDeaths += lost;
         details.push(`${num(lost)} ${k}`);
     }
 }
 
 // Garnizon kaybı (İnsan - Nüfustan Düşer)
 const dGarrison = Math.max(0, Math.floor(Number(document.getElementById("f_war_death_garrison")?.value)||0));
 if(dGarrison > 0) {
     if(dGarrison > (s.fortressGarrison||0)) { alert("Ölen garnizon mevcut garnizondan fazla olamaz!"); return; }
     s.fortressGarrison -= dGarrison;
     totalHumanDeaths += dGarrison;
     details.push(`${num(dGarrison)} garnizon`);
 }
 
 // Ekipman kayıpları (Toplar ve Gemiler - Nüfustan DÜŞMEZ)
 const equipmentKeys = ["kucuk_top", "orta_top", "buyuk_top", "kucuk_gemi", "orta_gemi", "buyuk_gemi"];
 for(const k of equipmentKeys) {
     const lost = Math.max(0, Math.floor(Number(document.getElementById("f_war_death_" + k)?.value)||0));
     if(lost > 0) {
         if(lost > (s[k]||0)) { alert(`${k} kaybı mevcuttan fazla olamaz!`); return; }
         s[k] -= lost;
         totalEquipmentLost += lost;
         details.push(`${num(lost)} ${k}`);
     }
 }
 
 if(totalHumanDeaths === 0 && totalEquipmentLost === 0){alert("En az bir kayıp sayısı girin.");return;}
 
 // Sadece ölen "İnsanlar" toplam nüfustan düşülür ve havuza dönmeleri engellenir.
 if(totalHumanDeaths > 0) {
     s.population = Math.max(0, (s.population||0) - totalHumanDeaths);
     s.warCasualties = (s.warCasualties || 0) + totalHumanDeaths;
 }
 
 if(dGarrison > 0) redistributeMapGarrisonsForStateIds([s.id]);
 
 addLog({stateId:s.id,stateName:s.name,action:`Savaş Zayiatı: ${details.join(', ')}`,qty:totalHumanDeaths + totalEquipmentLost,cost:0});
 queueSave();
 toast(`${s.name} savaş kayıpları işlendi.`);
 openWarGarrisonModal();
 const selector=document.getElementById("war_state");
 if(selector){selector.value=s.id;renderWarGarrisonFields();}
}

function deduct(id){
 if(!isAdmin) return;
 let s=getState(id),a=Number(document.getElementById("deductAmt").value||0),d=document.getElementById("deductDesc").value.trim();
 if(a<=0||a>s.treasury) return;
 
 const oldT = s.treasury;
 s.treasury -= a; 

 addLog({
     stateId: s.id,
     stateName: s.name,
     action: `Hazine Kesintisi (${d})`,
     cost: a,
     qty: 1,
     oldTreasury: oldT,
     newTreasury: s.treasury
 });

 closeModal();queueSave();openDetail(id)
}

function transfer(id){
 let s=getState(id);
 let t=getState(document.getElementById("transferTarget").value),a=Number(document.getElementById("transferAmt").value||0),d=document.getElementById("transferDesc").value.trim();
 if(!t||a<=0||a>s.treasury) return;
 if(rejectDebtPurchase(s))return;
 
 const oldST = s.treasury;
 const oldTT = t.treasury;
 
 s.treasury -= a;
 t.treasury += a; 
 
 addLog({
     stateId: s.id,
     stateName: s.name,
     action: `Transfer Gönderildi -> ${t.name} (${d})`,
     cost: a,
     qty: 1,
     oldTreasury: oldST,
     newTreasury: s.treasury
 });

 addLog({
     stateId: t.id,
     stateName: t.name,
     action: `Transfer Alındı <- ${s.name} (${d})`,
     cost: a,
     qty: 1,
     oldTreasury: oldTT,
     newTreasury: t.treasury
 });

 closeModal();queueSave();openDetail(id)
}

function openEditAdvisorModal(advId) {
    const a = (db.advisors||[]).find(x => x.id === advId);
    if(!a) return;
    const stateOpts = `<option value="" ${!a.faction ? 'selected' : ''}>🌍 Tümü (Herkes Alabilir)</option>` + db.states.map(x=>`<option value="${x.id}" ${a.faction===x.id ? 'selected' : ''}>${esc(x.name)}</option>`).join("");

    modal(`<h2>👑 PAŞAYI DÜZENLE</h2>
    <div class="formgrid">
        ${field("adv_edit_name", "Paşa İsmi", a.name, "text")}
        ${field("adv_edit_role", "Unvanı / Rolü", a.role, "text")}
        <div><label>Yıldız Seviyesi</label><select id="f_adv_edit_stars">
            <option value="1" ${a.stars===1?'selected':''}>1 Yıldız (★)</option>
            <option value="2" ${a.stars===2?'selected':''}>2 Yıldız (★★)</option>
            <option value="3" ${a.stars===3?'selected':''}>3 Yıldız (★★★)</option>
            <option value="4" ${a.stars===4?'selected':''}>4 Yıldız (★★★★)</option>
            <option value="5" ${a.stars===5?'selected':''}>5 Yıldız (★★★★★)</option>
        </select></div>
        <div><label>Hangi Devlete Özel?</label><select id="f_adv_edit_faction">${stateOpts}</select></div>
        ${field("adv_edit_salary", "Yıllık Maaş (TL)", a.salary, "number")}
        ${field("adv_edit_ageYears", "Mevcut Yaş (Yıl)", a.ageYears||5, "number")}
        ${field("adv_edit_maxAge", "Ölüm / Maksimum Yaş (Yıl)", a.maxAge||20, "number")}
        ${field("adv_edit_icon", "Resim URL", a.icon||"", "text")}
        
        <div class="full" style="color:var(--gold); font-size:11px; font-weight:bold; margin-top:6px;">MATEMATİKSEL ÇARPANLAR:</div>
        ${field("adv_edit_taxBonus", "Vergi Geliri Etkisi (+/- %)", a.taxBonus||0, "number")}
        ${field("adv_edit_milUpkeepDiscount", "Ordu Bakım İndirimi (%)", a.milUpkeepDiscount||0, "number")}
        ${field("adv_edit_navyUpkeepDiscount", "Donanma Bakım İndirimi (%)", a.navyUpkeepDiscount||0, "number")}
        ${field("adv_edit_artUpkeepDiscount", "Topçu Bakım İndirimi (%)", a.artUpkeepDiscount||0, "number")}
        ${field("adv_edit_recruitDiscount", "Asker Alım İndirimi (%)", a.recruitDiscount||0, "number")}
        ${field("adv_edit_infraDiscount", "Bina Yapım İndirimi (%)", a.infraDiscount||0, "number")}
        ${field("adv_edit_happinessBonus", "Mutluluk Bonusu (+/- Puan)", a.happinessBonus||0, "number")}
        <div><label>İsyan / Anarşiyi Sıfırla?</label><select id="f_adv_edit_stopAnarchy"><option value="false" ${!a.stopAnarchy?'selected':''}>Hayır</option><option value="true" ${a.stopAnarchy?'selected':''}>Evet (%0 Yapar)</option></select></div>
        <div class="full"><label>Casusluk Sapmasını Sıfırla (Net Bilgi)?</label><select id="f_adv_edit_spyAccuracyBonus"><option value="false" ${!a.spyAccuracyBonus?'selected':''}>Hayır</option><option value="true" ${a.spyAccuracyBonus?'selected':''}>Evet (Tam Kesin Veri)</option></select></div>

        <div class="full">${field("adv_edit_buff", "Artı Açıklaması", a.buff, "text")}</div>
        <div class="full">${field("adv_edit_debuff", "Eksi Açıklaması", a.debuff, "text")}</div>
        <div class="full actions" style="margin-top:10px;">
            <button class="btn" onclick="openAdmin()">GERİ</button>
            <button class="btn green" onclick="saveAdvisorEdit('${a.id}')">KAYDET</button>
        </div>
    </div>`);
}