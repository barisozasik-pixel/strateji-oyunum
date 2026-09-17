window.switchStateEditTab = function(tabId) {
    document.querySelectorAll('.adm-tab').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.adm-tab-btn').forEach(el => {
        el.style.background = 'transparent';
        el.style.color = 'var(--text)';
        el.style.borderBottom = 'none';
    });
    const target = document.getElementById('adm-tab-' + tabId);
    if(target) target.style.display = 'block';
    const activeBtn = document.getElementById('adm-tab-btn-' + tabId);
    if(activeBtn){
       activeBtn.style.background = 'var(--bg-lighter)';
       activeBtn.style.color = 'var(--gold)';
       activeBtn.style.borderBottom = '2px solid var(--gold)';
    }
};

function openStateForm(id=null){
 if(!isAdmin) return;
 const populationBreakdown=calcPop(id?getState(id):{population:0,happiness:0,education:0});
 const s=id?getState(id):{name:"",ownerEmail:"",ruler:"",rulerImage:"",bgImage:"",title:"Devlet",color:"#c5a059",treasury:0,population:0,tax:20,happiness:75,education:30,educatedPopulation:0,baseTaxPerPerson:5,civilExpense:0,advisorSlots:3,piyade:0,suvari:0,nisanci:0,kucuk_top:0,orta_top:0,buyuk_top:0,kucuk_gemi:0,orta_gemi:0,buyuk_gemi:0,kucuk_liman:0,orta_liman:0,buyuk_liman:0,kucuk_ocak:0,orta_ocak:0,okul:0,istihbarat_binasi:0,hastane:0,asevi:0,su_degirmeni:0,kervansaray:0,pazar:0};
 
 let customFields = "";
 if(db.settings.customItems && db.settings.customItems.length > 0) {
    customFields += `<div class="full"><h4 style="margin:20px 0 10px; padding-bottom:5px; border-bottom:1px solid var(--line); color:var(--border-gold);">🌟 ÖZEL BİRİMLER</h4></div><div class="formgrid">`;
    db.settings.customItems.forEach(item => { customFields += field(item.id, item.name, s[item.id]||0, "number"); });
    customFields += `</div>`;
 }

 modal(`
  <div style="position:relative;">
    <button onclick="closeModal()" style="position:absolute; right:-10px; top:-10px; background:none; border:none; font-size:28px; color:var(--red); cursor:pointer; padding:5px; line-height:1;">&times;</button>
    <h2 style="margin-top:0; border-bottom:2px solid var(--border-gold); padding-bottom:10px;">${id?"🛠 DEVLET DÜZENLE":"➕ YENİ DEVLET EKLE"}</h2>
    
    <div style="display:flex; border-bottom:1px solid var(--line); margin-bottom:15px; overflow-x:auto;">
      <button type="button" class="adm-tab-btn" id="adm-tab-btn-genel" onclick="switchStateEditTab('genel')" style="flex:1; padding:10px; background:var(--bg-lighter); color:var(--gold); border:none; border-bottom:2px solid var(--gold); cursor:pointer; font-weight:bold;">Genel & Ekonomi</button>
      <button type="button" class="adm-tab-btn" id="adm-tab-btn-nufus" onclick="switchStateEditTab('nufus')" style="flex:1; padding:10px; background:transparent; color:var(--text); border:none; cursor:pointer; font-weight:bold;">Nüfus Yönetimi</button>
      <button type="button" class="adm-tab-btn" id="adm-tab-btn-ordu" onclick="switchStateEditTab('ordu')" style="flex:1; padding:10px; background:transparent; color:var(--text); border:none; cursor:pointer; font-weight:bold;">Ordu & Altyapı</button>
    </div>

    <div id="adm-tab-genel" class="adm-tab" style="display:block;">
      <h4 style="margin:10px 0 10px; padding-bottom:5px; border-bottom:1px solid var(--line); color:var(--border-gold);">📌 GENEL BİLGİLER</h4>
      <div class="formgrid">
        ${field("name","Devlet Adı",s.name,"text")}
        ${field("title","Unvan (İmparatorluk vb.)",s.title,"text")}
        ${field("ruler","Hükümdar İsmi",s.ruler,"text")}
        ${field("color","Tema Rengi",s.color,"color")}
        ${field("rulerImage","Hükümdar Portre URL",cleanUrl(s.rulerImage),"text")}
        ${field("bgImage","Arka Plan URL (İsteğe Bağlı)",cleanUrl(s.bgImage),"text")}
        <div class="full" style="background:rgba(231, 76, 60, 0.1); border:1px solid var(--red); padding:10px; border-radius:5px;">
           ${field("ownerEmail","Oyuncu E-postası (Sahip)",s.ownerEmail||"","email")}
           <p class="sub" style="color:#f1948a; margin:5px 0 0;">Devleti yönetecek kişinin sisteme kayıt olduğu e-posta adresini girin.</p>
        </div>
      </div>

      <h4 style="margin:20px 0 10px; padding-bottom:5px; border-bottom:1px solid var(--line); color:var(--border-gold);">💰 EKONOMİ & HAZİNE</h4>
      <div class="formgrid">
        ${field("treasury","Hazine (Altın)",s.treasury,"number")}
        ${field("tax","Vergi Oranı %",s.tax,"number")}
        ${field("happiness","Mutluluk %",s.happiness,"number")}
        ${field("civilExpense","Sivil Gider (Yıllık)",s.civilExpense,"number")}
        <div class="full" style="background:rgba(197, 160, 89, 0.15); border:1px solid var(--border-gold); padding:10px; border-radius:5px;">
           ${field("advisorSlots","Divan Üyesi Kotası (Kaç Danışman Seçebilir?)",s.advisorSlots||3,"number")}
        </div>
      </div>
    </div>

    <div id="adm-tab-nufus" class="adm-tab" style="display:none;">
      <h4 style="margin:10px 0 10px; padding-bottom:5px; border-bottom:1px solid var(--line); color:var(--border-gold);">👥 NÜFUS YÖNETİMİ</h4>
      <div class="formgrid">
        ${field("population","Mevcut Toplam Nüfus",s.population,"number")}
        ${field("children","Çocuk Nüfus (Vergi Dışı)",s.children||0,"number")}
        <div style="background:rgba(46, 204, 113, 0.15); border:1px solid var(--green); padding:10px; border-radius:5px;">
           <label style="color:var(--green); font-weight:bold;">⚡ Hızlı Nüfus Ekle/Çıkar (+ / -)</label>
           <input id="f_pop_modifier" type="number" value="0" placeholder="Örn: 50000" style="width:100%; padding:8px; border:1px solid var(--line); background:var(--bg); color:var(--text); border-radius:4px;">
           <p class="sub" style="color:var(--green); margin:5px 0 0;">Bitişik yaz! Buraya yazdığın sayı mevcuda eklenir (Eksi de yazabilirsin).</p>
        </div>
        ${field("educatedPopulation","Eğitimli Nüfus (Kişi)",s.educatedPopulation??0,"number")}
      </div>
    </div>

    <div id="adm-tab-ordu" class="adm-tab" style="display:none;">
      <h4 style="margin:10px 0 10px; padding-bottom:5px; border-bottom:1px solid var(--line); color:var(--border-gold);">⚔ TEMEL ORDU & ALTYAPI</h4>
      <div class="formgrid">
        ${field("piyade","Piyade",s.piyade,"number")}${field("suvari","Süvari",s.suvari,"number")}${field("nisanci","Nişancı",s.nisanci,"number")}
        ${field("fortressGarrison","Kale Garnizonu Askeri",s.fortressGarrison||0,"number")}
        ${field("kucuk_top","Küçük Top",s.kucuk_top,"number")}${field("orta_top","Orta Top",s.orta_top,"number")}${field("buyuk_top","Büyük Top",s.buyuk_top,"number")}
        ${field("kucuk_gemi","Küçük Gemi",s.kucuk_gemi,"number")}${field("orta_gemi","Orta Gemi",s.orta_gemi,"number")}${field("buyuk_gemi","Büyük Gemi",s.buyuk_gemi,"number")}
        ${field("kucuk_liman","Küçük Liman",s.kucuk_liman,"number")}${field("orta_liman","Orta Liman",s.orta_liman,"number")}${field("buyuk_liman","Büyük Liman",s.buyuk_liman,"number")}
        ${field("kucuk_ocak","Küçük Top Ocağı",s.kucuk_ocak,"number")}${field("orta_ocak","Orta Top Ocağı",s.orta_ocak,"number")}${field("buyuk_ocak","Büyük Top Ocağı",s.buyuk_ocak,"number")}
        ${field("okul","Okul",s.okul,"number")}
        ${field("istihbarat_binasi","İstihbarat Dairesi",s.istihbarat_binasi||0,"number")}
      </div>

      <h4 style="margin:20px 0 10px; padding-bottom:5px; border-bottom:1px solid var(--line); color:var(--border-gold);">🏥 NÜFUS BİNALARI</h4>
      <div class="formgrid">
        ${field("hastane","Hastane",s.hastane||0,"number")}${field("asevi","Aşevi",s.asevi||0,"number")}
        ${field("su_degirmeni","Su Değirmeni",s.su_degirmeni||0,"number")}${field("kervansaray","Kervansaray",s.kervansaray||0,"number")}
        ${field("pazar","Pazar",s.pazar||0,"number")}
      </div>
      
      ${customFields}
    </div>

    <div class="full actions" style="margin-top:20px; padding-top:15px; border-top:1px solid var(--line); display:flex; gap:10px; justify-content:flex-end;">
      ${id?`<button class="btn red" style="margin-right:auto;" onclick="deleteState('${id}')">SİL</button>`:""}
      <button class="btn" onclick="closeModal()">VAZGEÇ</button>
      <button class="btn green" style="padding:10px 30px; font-weight:bold;" onclick="saveState('${id||""}')">KAYDET</button>
    </div>
  </div>
 `);
}
function field(k,l,v,t="text"){return `<div><label style="font-weight:bold; margin-bottom:4px; display:block; color:var(--text);">${l}</label><input id="f_${k}" type="${t}" value="${esc(v)}" style="width:100%; padding:8px; border:1px solid var(--line); background:var(--bg); color:var(--text); border-radius:4px;"></div>`}

function saveState(id){
 const keys=["name","ownerEmail","ruler","rulerImage","bgImage","title","color","treasury","population","children","tax","educatedPopulation","civilExpense","advisorSlots","piyade","suvari","nisanci","fortressGarrison","kucuk_top","orta_top","buyuk_top","kucuk_gemi","orta_gemi","buyuk_gemi","kucuk_liman","orta_liman","buyuk_liman","kucuk_ocak","orta_ocak","buyuk_ocak","okul","istihbarat_binasi","hastane","asevi","su_degirmeni","kervansaray","pazar"];
 if(db.settings.customItems) { db.settings.customItems.forEach(item => keys.push(item.id)); }
 const o={};
 keys.forEach(k=>o[k]=["name","ownerEmail","ruler","rulerImage","bgImage","title","color"].includes(k)?document.getElementById("f_"+k).value:Number(document.getElementById("f_"+k).value||0));
 o.baseTaxPerPerson = Number(db.settings?.baseTaxPerPerson || 5);
 
 // Nüfus Ekle/Çıkar İşlemi
 const popModifier = Number(document.getElementById("f_pop_modifier")?.value || 0);
 o.population += popModifier;

 if(!o.name){alert("Devlet adı gerekli.");return}
 o.ownerEmail = (o.ownerEmail || "").trim().toLowerCase();
 o.tax=Math.max(0,Math.min(75,Number(o.tax)||0));
 o.rulerImage = cleanUrl(o.rulerImage); o.bgImage = cleanUrl(o.bgImage);
 let oldTax = id ? getState(id).tax : Number(document.getElementById("f_tax").value||0);
 o.happiness = Math.max(0, Math.min(100, Number(document.getElementById("f_happiness").value||0) + ((oldTax - o.tax) * 0.4)));
 if(id){ 
    let existing = getState(id);
    o.customLedger = existing.customLedger || []; o.permanentLedger = existing.permanentLedger || [];
    o.hiredAdvisors = existing.hiredAdvisors || [];
    o.advisorHiredYears = existing.advisorHiredYears || {};
    Object.assign(existing,o); 
 } else { 
    o.customLedger = []; o.permanentLedger = []; o.hiredAdvisors = []; o.advisorHiredYears = {}; db.states.push({id:crypto.randomUUID(),...o});
 }
 closeModal();queueSave();renderHome()
}
function deleteState(id){if(confirm("Bu devlet silinsin mi?")){db.states=db.states.filter(x=>x.id!==id);closeModal();queueSave();renderHome()}}

function openDeduct(id){ 
 if(!isAdmin) return;
 modal(`<h2>HAZİNEDEN KESİNTİ</h2><label>Tutar</label><input id="deductAmt" type="number" min="0"><label>Açıklama</label><textarea id="deductDesc"></textarea><div class="actions" style="margin-top:10px"><button class="btn" onclick="closeModal()">İPTAL</button><button class="btn red" onclick="deduct('${id}')">KAYDET</button></div>`) 
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


function openPurchaseLogs(){
    const myState = currentId ? getState(currentId) : null;
    let filteredLogs = db.purchaseLog || [];
    
    if(!isAdmin) {
        if(myState) {
            filteredLogs = filteredLogs.filter(l => l.stateId === myState.id || l.state === myState.name);
        } else {
            const myStateIds = db.states.filter(s => s.ownerEmail === currentUserEmail).map(s => s.id);
            filteredLogs = filteredLogs.filter(l => myStateIds.includes(l.stateId));
        }
    }
    
    let logHtml = filteredLogs.length ? filteredLogs.map(l => {
        let diffContent = [];
        
        if(l.oldTreasury !== undefined && l.newTreasury !== undefined) {
            let tDiff = l.newTreasury - l.oldTreasury;
            let diffClass = tDiff >= 0 ? 'diff-pos' : 'diff-neg';
            let diffSign = tDiff >= 0 ? '+' : '';
            diffContent.push(`<span>Hazine: <b>${money(l.oldTreasury)}</b> ➔ <b>${money(l.newTreasury)}</b> (<span class="${diffClass}">${diffSign}${money(tDiff)}</span>)</span>`);
        }
        
        if(l.unitName && l.oldUnit !== undefined && l.newUnit !== undefined) {
            let uDiff = l.newUnit - l.oldUnit;
            let diffClass = uDiff >= 0 ? 'diff-pos' : 'diff-neg';
            let diffSign = uDiff >= 0 ? '+' : '';
            diffContent.push(`<span>${esc(l.unitName)}: <b>${num(l.oldUnit)}</b> ➔ <b>${num(l.newUnit)}</b> (<span class="${diffClass}">${diffSign}${num(uDiff)}</span>)</span>`);
        }

        if(l.logType === "event" && Array.isArray(l.eventChanges)) {
            diffContent = [];
            l.eventChanges.forEach(change => {
                const oldValue=Number(change.old||0), newValue=Number(change.new||0), changeAmount=newValue-oldValue;
                if(!changeAmount) return;
                const diffClass=changeAmount>=0?'diff-pos':'diff-neg';
                const sign=changeAmount>=0?'+':'';
                const format=value=>change.kind==='money'?money(value):(change.kind==='percent'?`${Number(value).toLocaleString('tr-TR',{maximumFractionDigits:1})}%`:num(value));
                diffContent.push(`<span><b>${esc(change.label)}</b>: ${format(oldValue)} ➔ ${format(newValue)} (<span class="${diffClass}">${sign}${format(changeAmount)}</span>)</span>`);
            });
        }

        return `
        <div class="log-item">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                    <b>${esc(l.state)}</b>: ${esc(l.item)}
                    <div class="sub">${esc(l.user)} | ${l.date}</div>
                </div>
                <div style="text-align:right;" class="${l.logType==='event'?'hidden':''}">
                    <div>${l.qty > 1 ? l.qty + 'x ' : ''}<span style="color:var(--gold)">${money(l.cost)}</span></div>
                </div>
            </div>
            ${diffContent.length > 0 ? `<div class="log-diff-box">${diffContent.join(' | ')}</div>` : ''}
        </div>`;
    }).join("") : "<p class=\"sub\">Kayıtlı işlem bulunmuyor.</p>";

    modal(`<h2>📜 İŞLEM LOGLARI & DEĞİŞİM DEFTERİ</h2>
    <p class="sub" style="margin-bottom:12px;">Yapılan harcamalar, alımlar ve kaynak değişimleri.</p>
    <div style="max-height:60vh; overflow:auto; margin-bottom:12px;">${logHtml}</div>
    <div class="actions"><button class="btn blue" onclick="closeModal()">KAPAT</button></div>`);
}

// ---------------- 1 YIL GEÇİR (PAŞA GELİŞİMİ, ÖMÜR VE SÖZLEŞME GÜNCELLEMESİ) ----------------
function passOneYear(){
    if(!isAdmin) return;
    if(!confirm("⏳ Tüm devletler için 1 tam yıl geçirilecek.\n\nVergiler toplanacak, paşalar yaşlanacak ve gelişim gösterecek. Onaylıyor musunuz?")) return;
    
    db.timerSeconds = 0;
    db.timerRunning = false;
    db.gameYear = (Number(db.gameYear) || 1453) + 1;
    
    // ---------------- 2 YILDA BİR ESKİ MEKTUPLARI TEMİZLEME ----------------
    if(Array.isArray(db.letters) && db.letters.length > 0) {
        const curYr = Number(db.gameYear) || 1453;
        const initialCount = db.letters.length;
        db.letters = db.letters.filter(l => {
            const letterYear = Number(l.year) || (curYr - 1);
            return (curYr - letterYear) < 2;
        });
        const cleanedCount = initialCount - db.letters.length;
        if(cleanedCount > 0) {
            console.log(`🧹 ${cleanedCount} adet 2 yıldan eski mektup veritabanından temizlendi.`);
        }
    }
    
    // Veritabanına Yıl Sonu Raporunu Kaydetmek için Hazırlık
    db.settings.lastYearReport = { year: db.gameYear, states: {} };
    
    db.states.forEach(s => {
        let rpt = { name: s.name, events: [], rebellions: [], debts: [], advisors: [] };
        
        // ADIM 1: ÖNCE GEÇEN YILIN HAK EDİLEN PARASINI HESAPLA (Nüfus artmadan önce)
        let inc = calcIncome(s); 
        let permInc = calcPermIncome(s); 
        let exp = calcExpenses(s);
        let tempLedgerTotal = 0;
        if(s.customLedger && s.customLedger.length > 0) s.customLedger.forEach(item => { tempLedgerTotal += item.amount; });
        
        let net = inc + permInc - exp + tempLedgerTotal;
        const oldT = s.treasury; 
        s.treasury += net; 
        s.customLedger = []; 
        rpt.inc = inc; rpt.permInc = permInc; rpt.exp = exp; rpt.net = net; rpt.newT = s.treasury;
        
        addLog({stateId: s.id, stateName: s.name, action: `Yıl Sonu Hasılası`, cost: Math.abs(net), qty: 1, oldTreasury: oldT, newTreasury: s.treasury});
        
        // ✅ BUG 1 FIX: Savaş zayiatları her yıl sıfırlanır — aksi halde elverişli asker havuzu kalıcı olarak kilitlenir
        const oldCasualties = (s.warCasualties||0) + (s.garrisonWarDeaths||0);
        s.warCasualties = 0;
        s.garrisonWarDeaths = 0;
        if(oldCasualties > 0) rpt.events.push(`Savaş zayiatları sıfırlandı (${num(oldCasualties)} şehit anıldı)`);
        
        // ADIM 2: BORÇ VE FAİZ KONTROLÜ
        s.debtYears=Math.max(0,Math.floor(Number(s.debtYears)||0));
        if(Number(s.treasury||0)<0){
            s.debtYears++;
            const interest=Math.ceil(Math.abs(Number(s.treasury||0))*0.013);
            s.treasury-=interest;
            rpt.debts.push(`${s.debtYears}. borç yılı, %1,3 faiz: -${money(interest)}`);
            if(s.debtYears>=3)s.happiness=Math.max(0,Number(s.happiness||0)-5);
        }else s.debtYears=0;
        
        // ADIM 2.5: İNŞAAT KUYRUĞU İLERLEMESİ (Şifahane 1 Yıl, Okul 1 Yıl, Limanlar 2 Yıl, Top Ocakları 2 Yıl)
        if (s.constructionQueue && s.constructionQueue.length > 0) {
            const nextQueue = [];
            s.constructionQueue.forEach(item => {
                item.remainingYears = (Number(item.remainingYears) || 1) - 1;
                if (item.remainingYears <= 0) {
                    s[item.key] = (Number(s[item.key]) || 0) + (Number(item.qty) || 0);
                    rpt.events.push(`🏗️ İnşaat Tamamlandı: +${num(item.qty)} adet ${item.label || item.key} tamamlanıp hizmete açıldı!`);
                } else {
                    nextQueue.push(item);
                    rpt.events.push(`⏳ İnşaat Sürüyor: ${num(item.qty)} adet ${item.label || item.key} yapım aşamasında (${item.remainingYears} yıl kaldı)`);
                }
            });
            s.constructionQueue = nextQueue;
        }

        // ADIM 3: NÜFUS, ŞİFAHANELER, DOĞAL ÖLÜMLER, ÇOCUK HAVUZU VE EĞİTİM
        const hospitalCount = Math.max(0, Number(s.hastane) || 0);
        const hospitalCapacity = Math.max(1, Number(db.settings.hospitalCapacityPerBuilding) || 60000);
        const totalStatePop = Math.max(1, Number(s.population) || 0);
        // Sağlık Kapsama Oranı: Şifahanelerin toplam nüfusa koruma oranı (%0 - %100)
        const hospitalCoverage = Math.min(1.0, (hospitalCount * hospitalCapacity) / totalStatePop);

        // 1. DOĞAL ECEL VE YAŞLILIK VEFATLARI (Yetişkinler ve Eğitimli Sınıf)
        let currentChildren = Math.max(0, Math.floor(Number(s.children) || 0));
        let currentAdults = Math.max(0, (Number(s.population) || 0) - currentChildren);
        let deathRate = Math.max(0.0120, 0.0170 - (hospitalCoverage * 0.0040)); // Tarihsel %1.70 - %1.30 bandı

        let currentEdu = 0;
        if (s.educatedPopulation !== undefined && s.educatedPopulation !== null && Number(s.educatedPopulation) > 0) {
            currentEdu = Math.floor(Number(s.educatedPopulation) || 0);
        } else {
            currentEdu = Math.floor((Number(s.population) || 0) * ((Number(s.education) || 0) / 100));
        }
        currentEdu = Math.min(currentAdults, currentEdu);

        // A) Sıradan Yetişkin ve B) Eğitimli Sınıf Vefatları (Eğitimliler hekim ve refahla yarı ecel oranına tabidir)
        const ordinaryAdults = Math.max(0, currentAdults - currentEdu);
        const ordinaryDeaths = Math.floor(ordinaryAdults * deathRate);
        const eduDeathRate = deathRate * 0.50;
        const eduDeaths = Math.floor(currentEdu * eduDeathRate);
        const totalAdultDeaths = ordinaryDeaths + eduDeaths;

        if (totalAdultDeaths > 0) {
            s.population = Math.max(0, (Number(s.population) || 0) - totalAdultDeaths);
            currentAdults = Math.max(0, currentAdults - totalAdultDeaths);
            currentEdu = Math.max(0, currentEdu - eduDeaths);
            rpt.events.push(`🕊️ Doğal Vefatlar: -${num(totalAdultDeaths)} kişi (Ecel ve yaşlılık)`);
            if (eduDeaths > 0) {
                rpt.events.push(`🕊️ İlim İrfan Kaybı: -${num(eduDeaths)} eğitimli eceliyle vefat etti`);
            }
        }

        // 2. ÇOCUK HAVUZU: Salgın ve Çocuk Vefatları (Şifahaneler çocukları hayatta tutar)
        if (currentChildren > 0) {
            // Sağlıksız devlette çocuk vefat oranı %18, tam şifahaneli devlette %8 seviyesine iner
            const childDeathRate = Math.max(0.08, 0.18 - (hospitalCoverage * 0.10));
            const childDeaths = Math.floor(currentChildren * (childDeathRate * 0.15));
            if (childDeaths > 0) {
                s.children = Math.max(0, currentChildren - childDeaths);
                s.population = Math.max(0, (Number(s.population) || 0) - childDeaths);
                currentChildren = s.children;
                rpt.events.push(`🕊️ Çocuk Vefatları: -${num(childDeaths)} yavru salgın ve hastalıklardan vefat etti`);
            }
        }

        // 3. RÜŞTÜNE ERME: Sağlıklı büyüyen gençlerin %10'u yetişkin halka ve nefer havuzuna katılır
        let maturing = Math.floor(currentChildren * 0.10);
        if (maturing > 0) {
            s.children = Math.max(0, currentChildren - maturing);
            currentChildren = s.children;
            currentAdults += maturing; // Gençler artık yetişkin/sivil havuzuna katıldı
            rpt.events.push(`🌱 Genç Nesil: +${num(maturing)} genç rüştüne erip vergi mükellefi ve nefer havuzuna katıldı`);
        }

        // 4. YENİ DOĞUMLAR: Taze nesil dünyaya gelir (taban %2.00 + şifahane refahı + binalar)
        let baseBirthPercent = 2.00 + (hospitalCoverage * 0.10); // %2.00 - %2.10
        let totalGrowthPercent = baseBirthPercent;
        ["asevi", "su_degirmeni", "kervansaray", "pazar"].forEach(key => {
            const count = s[key] || 0;
            if (count > 0) {
                const growthRate = Math.max(0, Number(db.settings.populationBuildingGrowth?.[key]) || 0);
                const efficiency = Math.max(0.2, 1 - (count * 0.05));
                totalGrowthPercent += (growthRate * count * efficiency);
            }
        });

        let newPop = Number(s.population || 0);
        if (totalGrowthPercent > 0) {
            let growthMultiplier = 1 + (totalGrowthPercent / 100);
            let calculatedPop = Math.floor(newPop * growthMultiplier);
            let extraPeople = calculatedPop - newPop;

            if (extraPeople > 0) {
                s.population = newPop + extraPeople;
                s.children = (Number(s.children) || 0) + extraPeople;
                currentChildren = s.children;
                rpt.events.push(`👶 Doğumlar: +${num(extraPeople)} yeni çocuk nüfusa katıldı`);
            }
        }

        // Şifahane koruma raporu
        if (hospitalCount > 0) {
            const protectedPop = Math.min(Number(s.population) || 0, hospitalCount * hospitalCapacity);
            rpt.events.push(`🏥 Şifahaneler: ${num(hospitalCount)} şifahane ile ${num(protectedPop)} cana (%${(hospitalCoverage * 100).toFixed(1)}) sağlık ve salgın muhafazası sağlandı.`);
        }

        // 5. MEDRESE / OKUL MEZUNİYETİ: Yetişkin ve sivil halktan yeni ilim talebeleri mezun olur
        const schoolCount = Number(s.okul) || 0;
        if (schoolCount > 0) {
            const baseAdminCap = Number(db.settings.schoolCapacityPerBuilding) || 250;
            const popBonus = Math.round((Number(s.population) || 0) / 50000);
            const capacityPerSchool = Math.max(120, Math.min(500, Math.round((baseAdminCap * 0.5) + popBonus)));
            const potentialGraduates = schoolCount * capacityPerSchool;
            const civilianPool = Math.max(0, currentAdults - currentEdu - (s.piyade || 0) - (s.suvari || 0) - (s.nisanci || 0) - (s.fortressGarrison || 0));
            const actualGraduates = Math.min(civilianPool, potentialGraduates);
            if (actualGraduates > 0) {
                currentEdu += actualGraduates;
                rpt.events.push(`🎓 Medrese Mezunları: +${num(actualGraduates)} genç eğitimini tamamlayıp eğitimli sınıfa katıldı (Okul başı ${capacityPerSchool} talebe)`);
            }
        }

        // Kalıcı kaydet
        s.educatedPopulation = currentEdu;
        const totalP = Math.max(1, Number(s.population) || 0);
        s.education = Math.max(0, Math.min(100, (currentEdu / totalP) * 100));
        
        // ADIM 4: İSYANLAR
        const adv = getAdvisorEffects(s);
        let hapNow = Math.max(0, Math.min(100, Number(s.happiness || 0) + Number(adv.happinessBonus || 0)));
        if(hapNow <= 70 && !adv.stopAnarchy) {
            let rebellionChance = (70 - hapNow) * 0.01;
            if(Math.random() < rebellionChance) {
                let myProvinces = getOwnedMapProvinceIds(s.id);
                if(myProvinces.length > 0) {
                    let randomProv = myProvinces[Math.floor(Math.random() * myProvinces.length)];
                    db.mapProvinceOwners = db.mapProvinceOwners || {};
                    db.mapProvinceDetails = db.mapProvinceDetails || {};
                    db.mapProvinceOwners[randomProv] = "__rebel__";
                    db.mapProvinceDetails[randomProv] = { countryName: "İsyancılar (" + s.name + " Karşıtı)", color: "#000000", garrison: 5000 + Math.floor(Math.random() * 5000) };
                    rpt.rebellions.push(`${getTurkishMapName(randomProv)} bölgesinde İSYAN çıktı ve kontrol kaybedildi!`);
                    // ✅ FIX D TAM: İsyanda garnizon ve binalar güncelle + garnizonu kırp
                    const oldLandCount = myProvinces.length;
                    refreshMapFortressCounts();
                    const remainingLands = getOwnedMapProvinceIds(s.id).length;
                    if(remainingLands === 0) {
                        s.fortressGarrison = 0;
                    } else if((s.fortressGarrison||0) > 0) {
                        const lostGarrison = Math.min(s.fortressGarrison, Math.ceil(s.fortressGarrison / oldLandCount));
                        s.fortressGarrison = Math.max(0, s.fortressGarrison - lostGarrison);
                        if(lostGarrison > 0) rpt.rebellions.push(`İsyanda kaledeki ${num(lostGarrison)} garnizon askeri kaybedildi.`);
                        redistributeMapGarrisonsForStateIds([s.id]);
                    }
                }
            }
        }
        
        // ADIM 5: OLAYLAR
        const generated = createYearEventsForState(s);
        db.pendingEvents.push(...generated);
        if(generated.length) rpt.events.push(`Yeni Yıl: Karar bekleyen ${generated.length} adet olay var.`);
        
        db.settings.lastYearReport.states[s.id] = rpt;
    });
    
    // 2. DÖNGÜ: SADECE PAŞA YAŞLANDIRMALARI VE FABRİKA AYARLARINA DÖNÜŞ
    let globallyAgedAdvisors = new Set(); 
    
    db.states.forEach(s => {
        let rpt = db.settings.lastYearReport.states[s.id];
        
        s.advisorHiredYears = s.advisorHiredYears || {};
        (s.hiredAdvisors || []).forEach(advId => { s.advisorHiredYears[advId] = (s.advisorHiredYears[advId] || 0) + 1; });
        let survivingHired = [];
        
        (s.hiredAdvisors || []).forEach(advId => {
            let adv = (db.advisors||[]).find(a => a.id === advId);
            if(!adv) return;
            if(!globallyAgedAdvisors.has(advId)) {
                globallyAgedAdvisors.add(advId);
                adv.ageYears = Number.isFinite(Number(adv.ageYears)) ? Number(adv.ageYears) + 1 : 6;
                adv.maxAge = Number.isFinite(Number(adv.maxAge)) ? Number(adv.maxAge) : Math.floor(Math.random() * 21) + 60; 
                if(adv.ageYears < adv.maxAge) {
                    adv.yearsSinceUpgrade = (adv.yearsSinceUpgrade || 0) + 1;
                    if(adv.yearsSinceUpgrade >= 3) {
                        adv.yearsSinceUpgrade = 0;
                        let boostPercent = Math.floor(Math.random() * 8) + 1; 
                        if(Number(adv.taxBonus)>0) adv.taxBonus = Number((Number(adv.taxBonus) + boostPercent).toFixed(1));
                        if(Number(adv.milUpkeepDiscount)>0) adv.milUpkeepDiscount = Number((Number(adv.milUpkeepDiscount) + boostPercent).toFixed(1));
                        if(Number(adv.navyUpkeepDiscount)>0) adv.navyUpkeepDiscount = Number((Number(adv.navyUpkeepDiscount) + boostPercent).toFixed(1));
                        if(Number(adv.artUpkeepDiscount)>0) adv.artUpkeepDiscount = Number((Number(adv.artUpkeepDiscount) + boostPercent).toFixed(1));
                        if(Number(adv.recruitDiscount)>0) adv.recruitDiscount = Number((Number(adv.recruitDiscount) + boostPercent).toFixed(1));
                        if(Number(adv.infraDiscount)>0) adv.infraDiscount = Number((Number(adv.infraDiscount) + boostPercent).toFixed(1));
                        if(Number(adv.happinessBonus)>0) adv.happinessBonus = Number((Number(adv.happinessBonus) + boostPercent).toFixed(1));
                        adv.lastUpgradeMsg = `(Gelişti! Bonuslar +%${boostPercent} arttı)`;
                        adv.upgradeHistory = adv.upgradeHistory || [];
                        adv.upgradeHistory.push(`• ${adv.ageYears} Yaşında: +%${boostPercent} Gelişim`);
                    } else { adv.lastUpgradeMsg = null; }
                }
            }
            
            // FABRİKA AYARLARINA DÖNÜŞ MEKANİĞİ
            if(adv.ageYears >= adv.maxAge) {
                rpt.advisors.push(`⚠️ <b>${adv.name}</b> yaşlılıktan vefat etti. (Yerine orijinal hali atandı)`);
                delete s.advisorHiredYears[advId];
                
                db.advisors = (db.advisors || []).filter(x => x.id !== advId); // Şişmiş eskisini sil
                
                let original = (typeof DEFAULT_45_ADVISORS !== 'undefined' ? DEFAULT_45_ADVISORS.find(x => x.id === advId) : null);
                if(original) {
                    // Hiçbir özelliğini elleme, tamamen orijinal ham halini havuza geri at!
                    db.advisors.push(structuredClone(original)); 
                }
            } else {
                survivingHired.push(advId);
                rpt.advisors.push(`👤 ${adv.name} (Yaş: ${adv.ageYears}) ${adv.lastUpgradeMsg ? `<b style="color:var(--green)">${adv.lastUpgradeMsg}</b>` : ''}`);
            }
        });
        s.hiredAdvisors = survivingHired;
    });
    
    queueSave();
    queueMapSave();
    if(currentId) openDetail(currentId); else renderHome();
    showYearReportModal();
}
//oyuncular için açılabilir pencere ekranı 
function showYearReportModal() {
    const yr = db.settings.lastYearReport;
    if(!yr) return;
 
    localStorage.setItem('lastSeenYearReport_' + (currentUserEmail || 'guest'), yr.year);
 
    let statesToShow = [];
    if(isAdmin) {
        statesToShow = db.states.map(s => s.id);
    } else {
        const myState = getCurrentPlayerState();
        if(myState) statesToShow.push(myState.id);
    }
    
    if(statesToShow.length === 0) return;
    let html = `<h2>⏳ YENİ YIL: ${yr.year} - YIL SONU RAPORU</h2>
    <div style='max-height:70vh; overflow:auto;'><div class='cards' style='grid-template-columns:1fr;'>`;
    
    statesToShow.forEach(sid => {
        let rpt = yr.states[sid];
        if(!rpt) return;
        
        let col = rpt.net >= 0 ? 'var(--green)' : 'var(--red)';
        
        let eventHtml = '';
        if(rpt.rebellions && rpt.rebellions.length > 0) eventHtml += rpt.rebellions.map(r => `<div style="color:var(--red); font-weight:bold;">🔥 İSYAN: ${r}</div>`).join('');
        if(rpt.debts && rpt.debts.length > 0) eventHtml += rpt.debts.map(r => `<div style="color:var(--gold);">⚠️ BORÇ: ${r}</div>`).join('');
        if(rpt.events && rpt.events.length > 0) eventHtml += rpt.events.map(r => `<div>🔹 ${r}</div>`).join('');
        if(!eventHtml) eventHtml = `<div class="sub">Bu yıl özel bir gelişme olmadı.</div>`;
        
        html += `
        <div class="list-item" style="flex-direction:column; align-items:stretch; background:rgba(17, 20, 24, 0.9); border:1px solid var(--border-gold);">
            <div style="border-bottom:1px solid var(--border-gold); margin-bottom:8px; padding-bottom:6px; font-size:16px; font-family:'Playfair Display', serif; color:var(--border-gold);"><b>${esc(rpt.name)}</b></div>
            
            <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:10px; background:rgba(10, 12, 14, 0.6); padding:8px; border-radius:3px;">
                <div>Vergi: <span style="color:var(--green)">${money(rpt.inc)}</span> | Sabit: <span style="color:var(--green)">${money(rpt.permInc)}</span><br>Gider: <span style="color:var(--red)">-${money(rpt.exp)}</span></div>
                <div style="text-align:right;">Net Hasıla: <b style="color:${col}; font-size:15px;">${rpt.net>=0?'+':''}${money(rpt.net)}</b><br>Yeni Kasa: <b>${money(rpt.newT)}</b></div>
            </div>
            
            <div style="font-size:12px; margin-bottom:8px; border-left:3px solid var(--blue); padding-left:8px;">
                <b style="color:var(--blue)">ÜLKE GÜNDEMİ:</b><br>${eventHtml}
            </div>
            
            <div style="font-size:12px; border-left:3px solid var(--green); padding-left:8px;">
                <b style="color:var(--green)">DİVAN VE PAŞALAR:</b><br>${(rpt.advisors||[]).join('<br>') || '<span class="sub">Divanda paşa yok.</span>'}
            </div>
        </div>`;
    });
    
    // KAPAT BUTONU DÖNGÜNÜN DIŞINDA VE EN ALTTA OLMALI:
    html += "</div></div><div class='actions' style='margin-top:12px;'><button class='btn blue' style='width:100%;' onclick='closeModal(); if(currentId) openDetail(currentId); else renderHome();'>KAPAT</button></div>";
    modal(html);
}
 
let currentAdminTab = 'maliye';

window.closeAdminModal = function() {
    const mb = document.querySelector('.modalbox');
    if(mb) mb.classList.remove('admin-modal-wide');
    closeModal();
};

window.switchAdminTab = function(tabId){
 document.querySelectorAll('.admin-v2-tab-btn').forEach(el=>el.classList.remove('active'));
 document.querySelectorAll('.admin-v2-tab-content').forEach(el=>{
   el.classList.remove('active');
   el.style.display = 'none';
 });
 const activeBtn = document.getElementById('admin-tab-btn-'+tabId);
 const activeContent = document.getElementById('admin-content-'+tabId);
 if(activeBtn) activeBtn.classList.add('active');
 if(activeContent){
   activeContent.classList.add('active');
   activeContent.style.display = 'block';
 }
};
window.switchAdminSidebarTab = window.switchAdminTab;

window.switchAdminSubTab = function(subId){
 document.querySelectorAll('.admin-v2-subtab-btn').forEach(el=>el.classList.remove('active'));
 document.querySelectorAll('.admin-v2-subcontent').forEach(el=>{
   el.classList.remove('active');
   el.style.display = 'none';
 });
 const activeBtn = document.getElementById('admin-subtab-btn-'+subId);
 const activeSub = document.getElementById('admin-subcontent-'+subId);
 if(activeBtn) activeBtn.classList.add('active');
 if(activeSub){
   activeSub.classList.add('active');
   activeSub.style.display = 'block';
 }
};

function v2Field(id, label, val, type="number", extraClass=""){
 return `<div class="admin-v2-field"><label>${label}</label><input id="${id}" type="${type}" value="${esc(val)}" class="admin-v2-input ${extraClass}"></div>`;
}

async function openAdmin(defaultTab = 'askeriye'){
 if(!isAdmin) return;
 try{if(!mapConfigCache)await loadMapAssets();}catch(_){} 
 const box = document.querySelector("#modal .modalbox");
 if(box) box.classList.add("admin-modal-wide");

 const st = db?.settings || {};
 const p=st.prices||{}, u=st.upkeep||{}, c=st.capacity||{}, ec=st.edictCost||{}, cc=st.campaignCost||{}, gu=st.garrisonUpkeep||{}, pg=st.populationBuildingGrowth||{}, pc=st.populationBuildingCostPerPerson||{}, pbu=st.populationBuildingUpkeep||{}, iu=st.infrastructureUpkeep||{};
 const img=st.images||{};
 const stateOpts = `<option value="">🌍 Tümü (Herkes Alabilir)</option>` + (db?.states||[]).map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join("");
 
 let customHtml = (st.customItems||[]).map(x => {
    let fName = x.faction ? (getState(x.faction)?.name || "Silinmiş") : "Tümü";
    let safeIcon = cleanUrl(x.icon);
    return `<div class="list-item">
      <div style="display:flex; align-items:center;">
         ${safeIcon ? `<img src="${esc(safeIcon)}" style="width:32px;height:32px;object-fit:cover;margin-right:8px;border-radius:2px;">` : ''}
         <div><b>${esc(x.name)}</b> <span class="badge">${esc(fName)}</span><br><span class="sub" style="font-size:11px;">(${x.category}) Fyt:${num(x.price)} | Bkm:${num(x.upkeep)} | İkm:${num(x.campCost||0)}</span></div>
      </div>
      <div style="display:flex; gap:6px;">
        <button class="btn gold small" onclick="openEditCustomItemModal('${x.id}')">DÜZENLE</button>
        <button class="btn red small" onclick="removeCustomItem('${x.id}')">SİL</button>
      </div>
    </div>`;
 }).join("");

 let advisorsHtml = (db.advisors||[]).map(a => {
    let fName = a.faction ? (getState(a.faction)?.name || "Özel Devlet") : (a.targetName || "Tümü");
    return `<div class="list-item" style="flex-direction:column; align-items:stretch;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div><b>${esc(a.name)}</b> <span class="stars-span">${'★'.repeat(a.stars||1)}</span> <span class="sub">(${esc(a.role)})</span> <span class="badge">${esc(fName)}</span></div>
        <div>
            <button class="btn gold small" style="padding:2px 6px;" onclick="openEditAdvisorModal('${a.id}')">DÜZENLE</button>
            <button class="btn red small" style="padding:2px 6px;" onclick="removeAdvisor('${a.id}')">SİL</button>
        </div>
      </div>
      <div style="font-size:11px; margin-top:3px;"><span style="color:var(--green)">Artı: ${esc(a.buff)}</span> | <span style="color:var(--red)">Eksi: ${esc(a.debuff)}</span> | <span style="color:var(--gold)">Maaş: ${money(a.salary)}/yıl</span> | <span style="color:var(--muted)">Yaş: ${a.ageYears||5}/${a.maxAge||20}</span></div>
    </div>`;
 }).join("");

 const html = `
 <div class="admin-v2-container">
   <!-- HEADER -->
   <div class="admin-v2-header">
     <div class="admin-v2-title-box">
       <span style="font-size:24px;">⚙️</span>
       <div>
         <h1>DEVLET YÖNETİMİ & OYUN AYARLARI</h1>
         <p>Tüm askeriye, ekonomi, nüfus binaları ve paşaları modüler sekmelerden yönetin.</p>
       </div>
     </div>
     <div style="display:flex; align-items:center; gap:12px;">
       <span class="admin-v2-badge">● ADMİN PANELİ</span>
       <button class="admin-v2-close-btn" onclick="closeModal()" title="Kapat">&times;</button>
     </div>
   </div>

   <!-- TOP NAVIGATION TABS -->
   <div class="admin-v2-nav-tabs">
     <button id="admin-tab-btn-askeriye" class="admin-v2-tab-btn active" onclick="switchAdminTab('askeriye')"><span>⚔️</span><span>ASKERİYE & DONANMA</span></button>
     <button id="admin-tab-btn-nufus" class="admin-v2-tab-btn" onclick="switchAdminTab('nufus')"><span>🏥</span><span>NÜFUS, SAĞLIK & EĞİTİM BİNALARI</span></button>
     <button id="admin-tab-btn-maliye" class="admin-v2-tab-btn" onclick="switchAdminTab('maliye')"><span>💰</span><span>MALİYE & VERGİ SİSTEMİ</span></button>
     <button id="admin-tab-btn-divan" class="admin-v2-tab-btn" onclick="switchAdminTab('divan')"><span>👑</span><span>DİVAN PAŞALARI (${(db.advisors||[]).length})</span></button>
     <button id="admin-tab-btn-ozel" class="admin-v2-tab-btn" onclick="switchAdminTab('ozel')"><span>🌟</span><span>ÖZEL BİRİMLER</span></button>
     <button id="admin-tab-btn-sistem" class="admin-v2-tab-btn" onclick="switchAdminTab('sistem')"><span>🖼️</span><span>SİSTEM & İŞLEMLER</span></button>
   </div>

   <!-- CONTENT BODY -->
   <div class="admin-v2-content-body">
     
     <!-- TAB 1: ASKERİYE & DONANMA -->
     <div id="admin-content-askeriye" class="admin-v2-tab-content active">
       <div class="admin-v2-subtabs">
         <button id="admin-subtab-btn-kara" class="admin-v2-subtab-btn active" onclick="switchAdminSubTab('kara')">KARA ORDUSU & GARNİZON</button>
         <button id="admin-subtab-btn-topcu" class="admin-v2-subtab-btn" onclick="switchAdminSubTab('topcu')">TOPÇULAR & DÖKÜMHANE (TOP OCAKLARI)</button>
         <button id="admin-subtab-btn-donanma" class="admin-v2-subtab-btn" onclick="switchAdminSubTab('donanma')">DONANMA & TERSANELER (LİMANLAR)</button>
       </div>

       <!-- SUBTAB 1.1: KARA ORDUSU -->
       <div id="admin-subcontent-kara" class="admin-v2-subcontent active">
         <div class="admin-v2-grid-3">
           <div class="admin-v2-card">
             <div class="admin-v2-card-header"><span>🧍 PİYADE (AZAP / YAYA)</span><span class="admin-v2-card-badge" style="background:#3d1a1a;color:#f39c12;">Kara</span></div>
             ${v2Field("f_p_piyade", "Satın Alma Fiyatı (TL)", p.piyade||21, "number", "admin-v2-input-price")}
             ${v2Field("f_u_piyade", "Yıllık Bakım Masrafı (TL / Yıl)", u.piyade||35, "number", "admin-v2-input-upkeep")}
             ${v2Field("f_cc_piyade", "Sefer & İkmal Maliyeti (TL / Sefer)", cc.piyade||2, "number", "admin-v2-input-camp")}
           </div>
           <div class="admin-v2-card">
             <div class="admin-v2-card-header"><span>🎯 NİŞANCI (TÜFEK / OKÇU)</span><span class="admin-v2-card-badge" style="background:#1a2a3d;color:#3498db;">Menzilli</span></div>
             ${v2Field("f_p_nisanci", "Satın Alma Fiyatı (TL)", p.nisanci||30, "number", "admin-v2-input-price")}
             ${v2Field("f_u_nisanci", "Yıllık Bakım Masrafı (TL / Yıl)", u.nisanci||45, "number", "admin-v2-input-upkeep")}
             ${v2Field("f_cc_nisanci", "Sefer & İkmal Maliyeti (TL / Sefer)", cc.nisanci||3, "number", "admin-v2-input-camp")}
           </div>
           <div class="admin-v2-card">
             <div class="admin-v2-card-header"><span>🐎 SÜVARİ (SİPAHİ / ATLI)</span><span class="admin-v2-card-badge" style="background:#3d331a;color:#f1c40f;">Süvari</span></div>
             ${v2Field("f_p_suvari", "Satın Alma Fiyatı (TL)", p.suvari||40, "number", "admin-v2-input-price")}
             ${v2Field("f_u_suvari", "Yıllık Bakım Masrafı (TL / Yıl)", u.suvari||55, "number", "admin-v2-input-upkeep")}
             ${v2Field("f_cc_suvari", "Sefer & İkmal Maliyeti (TL / Sefer)", cc.suvari||5, "number", "admin-v2-input-camp")}
           </div>
         </div>

          <div class="admin-v2-card" style="margin-top:14px; background:#12161f; border-color:rgba(197,160,89,0.35);">
            <div class="admin-v2-card-header"><span>🏰 KALE GARNİZONU (ALIM VE BAKIM)</span><span class="admin-v2-card-badge" style="background:#262a33;color:#f0cf82;">Garnizon</span></div>
            <div class="admin-v2-grid-2" style="margin-top:10px;">
              <div>
                ${v2Field("f_p_fortress_garrison", "Garnizon Asker Alım Fiyatı (TL)", p.fortress_garrison||25, "number", "admin-v2-input-price")}
              </div>
              <div>
                ${v2Field("f_gu_fortress", "Asker Başı Yıllık Gider (TL)", gu.fortress||8, "number", "admin-v2-input-upkeep")}
              </div>
            </div>
            <p style="margin:10px 0 0; font-size:12px; color:#8c8270;">Serhat kalelerine konuşlandırılan muhafız garnizon askerlerinin tek seferlik donatım/alım bedeli ve hazineden kesilen yıllık bakım ödeneğidir.</p>
          </div>
       </div>

       <!-- SUBTAB 1.2: TOPÇULAR & DÖKÜMHANE -->
       <div id="admin-subcontent-topcu" class="admin-v2-subcontent" style="display:none;">
         <h4 style="margin:0 0 10px; font-family:'Oswald'; color:#f0cf82; font-size:14px;">💣 TOPÇU BATARYALARI (BİRİMLER)</h4>
         <div class="admin-v2-grid-3">
           <div class="admin-v2-card">
             <div class="admin-v2-card-header"><span>💣 KÜÇÜK TOP (PRANGI / ŞAKALOZ)</span><span class="admin-v2-card-badge" style="background:#262a33;color:#bdc3c7;">Hafif Sahra</span></div>
             ${v2Field("f_p_kucuk_top", "Satın Alma Fiyatı (TL)", p.kucuk_top||6500, "number", "admin-v2-input-price")}
             ${v2Field("f_u_kucuk_top", "Yıllık Bakım Masrafı (TL / Yıl)", u.kucuk_top||350, "number", "admin-v2-input-upkeep")}
             ${v2Field("f_cc_kucuk_top", "Sefer & İkmal Maliyeti (TL / Sefer)", cc.kucuk_top||200, "number", "admin-v2-input-camp")}
           </div>
           <div class="admin-v2-card">
             <div class="admin-v2-card-header"><span>💣 ORTA TOP (KOLUNBURNA / SAHRA)</span><span class="admin-v2-card-badge" style="background:#262a33;color:#e67e22;">Meydan Topu</span></div>
             ${v2Field("f_p_orta_top", "Satın Alma Fiyatı (TL)", p.orta_top||16000, "number", "admin-v2-input-price")}
             ${v2Field("f_u_orta_top", "Yıllık Bakım Masrafı (TL / Yıl)", u.orta_top||750, "number", "admin-v2-input-upkeep")}
             ${v2Field("f_cc_orta_top", "Sefer & İkmal Maliyeti (TL / Sefer)", cc.orta_top||500, "number", "admin-v2-input-camp")}
           </div>
           <div class="admin-v2-card">
             <div class="admin-v2-card-header"><span>💣 BÜYÜK TOP (BALYEMEZ / ŞAHİ)</span><span class="admin-v2-card-badge" style="background:#3d1a1a;color:#e74c3c;">Ağır Kuşatma</span></div>
             ${v2Field("f_p_buyuk_top", "Satın Alma Fiyatı (TL)", p.buyuk_top||32000, "number", "admin-v2-input-price")}
             ${v2Field("f_u_buyuk_top", "Yıllık Bakım Masrafı (TL / Yıl)", u.buyuk_top||1400, "number", "admin-v2-input-upkeep")}
             ${v2Field("f_cc_buyuk_top", "Sefer & İkmal Maliyeti (TL / Sefer)", cc.buyuk_top||1000, "number", "admin-v2-input-camp")}
           </div>
         </div>

         <h4 style="margin:20px 0 10px; font-family:'Oswald'; color:#e67e22; font-size:14px;">🔥 TOP DÖKÜMHANELERİ (TOP OCAKLARI ALTYAPISI)</h4>
         <div class="admin-v2-grid-3">
           <div class="admin-v2-card">
             <div class="admin-v2-card-header"><span>🏭 KÜÇÜK TOP OCAĞI</span><span class="admin-v2-card-badge" style="background:#262a33;color:#e67e22;">Darbzen Fırını</span></div>
             ${v2Field("f_p_kucuk_ocak", "İnşaat Fiyatı (TL)", p.kucuk_ocak||55000, "number", "admin-v2-input-price")}
             ${v2Field("f_c_kucuk_ocak", "Top Destek Kapasitesi (Adet)", c.kucuk_ocak||10, "number", "admin-v2-input-green")}
             ${v2Field("f_iu_kucuk_ocak", "Yıllık Sabit Bakım (TL / Yıl)", iu.kucuk_ocak||750, "number", "admin-v2-input-upkeep")}
           </div>
           <div class="admin-v2-card">
             <div class="admin-v2-card-header"><span>🏭 ORTA TOP OCAĞI</span><span class="admin-v2-card-badge" style="background:#262a33;color:#e67e22;">Sahra Dökümhanesi</span></div>
             ${v2Field("f_p_orta_ocak", "İnşaat Fiyatı (TL)", p.orta_ocak||110000, "number", "admin-v2-input-price")}
             ${v2Field("f_c_orta_ocak", "Top Destek Kapasitesi (Adet)", c.orta_ocak||20, "number", "admin-v2-input-green")}
             ${v2Field("f_iu_orta_ocak", "Yıllık Sabit Bakım (TL / Yıl)", iu.orta_ocak||1350, "number", "admin-v2-input-upkeep")}
           </div>
           <div class="admin-v2-card">
             <div class="admin-v2-card-header"><span>🏭 BÜYÜK TOP OCAĞI</span><span class="admin-v2-card-badge" style="background:#3d1a1a;color:#e74c3c;">Tophane-i Amire</span></div>
             ${v2Field("f_p_buyuk_ocak", "İnşaat Fiyatı (TL)", p.buyuk_ocak||195000, "number", "admin-v2-input-price")}
             ${v2Field("f_c_buyuk_ocak", "Top Destek Kapasitesi (Adet)", c.buyuk_ocak||35, "number", "admin-v2-input-green")}
             ${v2Field("f_iu_buyuk_ocak", "Yıllık Sabit Bakım (TL / Yıl)", iu.buyuk_ocak||2200, "number", "admin-v2-input-upkeep")}
           </div>
         </div>
       </div>

       <!-- SUBTAB 1.3: DONANMA & TERSANELER -->
       <div id="admin-subcontent-donanma" class="admin-v2-subcontent" style="display:none;">
         <h4 style="margin:0 0 10px; font-family:'Oswald'; color:#3498db; font-size:14px;">⛵ SAVAŞ GEMİLERİ (FİLO BİRİMLERİ)</h4>
         <div class="admin-v2-grid-3">
           <div class="admin-v2-card">
             <div class="admin-v2-card-header"><span>⛵ KÜÇÜK GEMİ (KALİTE / ÇEKTİRİ)</span><span class="admin-v2-card-badge" style="background:#1a2a3d;color:#3498db;">Devriye</span></div>
             ${v2Field("f_p_kucuk_gemi", "Satın Alma Fiyatı (TL)", p.kucuk_gemi||38000, "number", "admin-v2-input-price")}
             ${v2Field("f_u_kucuk_gemi", "Yıllık Bakım Masrafı (TL / Yıl)", u.kucuk_gemi||1200, "number", "admin-v2-input-upkeep")}
             ${v2Field("f_cc_kucuk_gemi", "Sefer & İkmal Maliyeti (TL / Sefer)", cc.kucuk_gemi||400, "number", "admin-v2-input-camp")}
           </div>
           <div class="admin-v2-card">
             <div class="admin-v2-card-header"><span>⛵ ORTA GEMİ (KLASİK KADIRGA)</span><span class="admin-v2-card-badge" style="background:#1a2a3d;color:#3498db;">Muharip Harp</span></div>
             ${v2Field("f_p_orta_gemi", "Satın Alma Fiyatı (TL)", p.orta_gemi||72000, "number", "admin-v2-input-price")}
             ${v2Field("f_u_orta_gemi", "Yıllık Bakım Masrafı (TL / Yıl)", u.orta_gemi||2200, "number", "admin-v2-input-upkeep")}
             ${v2Field("f_cc_orta_gemi", "Sefer & İkmal Maliyeti (TL / Sefer)", cc.orta_gemi||800, "number", "admin-v2-input-camp")}
           </div>
           <div class="admin-v2-card">
             <div class="admin-v2-card-header"><span>⛵ BÜYÜK GEMİ (MAVNA / BAŞTARDA)</span><span class="admin-v2-card-badge" style="background:#261a3d;color:#9b59b6;">Amiral Gemisi</span></div>
             ${v2Field("f_p_buyuk_gemi", "Satın Alma Fiyatı (TL)", p.buyuk_gemi||135000, "number", "admin-v2-input-price")}
             ${v2Field("f_u_buyuk_gemi", "Yıllık Bakım Masrafı (TL / Yıl)", u.buyuk_gemi||3800, "number", "admin-v2-input-upkeep")}
             ${v2Field("f_cc_buyuk_gemi", "Sefer & İkmal Maliyeti (TL / Sefer)", cc.buyuk_gemi||1500, "number", "admin-v2-input-camp")}
           </div>
         </div>

         <h4 style="margin:20px 0 10px; font-family:'Oswald'; color:#3498db; font-size:14px;">⚓ TERSANELER VE LİMANLAR (DENİZ ALTYAPISI)</h4>
         <div class="admin-v2-grid-3">
           <div class="admin-v2-card">
             <div class="admin-v2-card-header"><span>⚓ KÜÇÜK LİMAN</span><span class="admin-v2-card-badge" style="background:#1a2a3d;color:#3498db;">Kıyı İskelesi</span></div>
             ${v2Field("f_p_kucuk_liman", "İnşaat Fiyatı (TL)", p.kucuk_liman||75000, "number", "admin-v2-input-price")}
             ${v2Field("f_c_kucuk_liman", "Gemi Destek Kapasitesi (Adet)", c.kucuk_liman||6, "number", "admin-v2-input-green")}
             ${v2Field("f_iu_kucuk_liman", "Yıllık Rıhtım/Çekek Bakımı (TL / Yıl)", iu.kucuk_liman||1100, "number", "admin-v2-input-upkeep")}
           </div>
           <div class="admin-v2-card">
             <div class="admin-v2-card-header"><span>⚓ ORTA LİMAN</span><span class="admin-v2-card-badge" style="background:#1a2a3d;color:#3498db;">Sancak Tersanesi</span></div>
             ${v2Field("f_p_orta_liman", "İnşaat Fiyatı (TL)", p.orta_liman||145000, "number", "admin-v2-input-price")}
             ${v2Field("f_c_orta_liman", "Gemi Destek Kapasitesi (Adet)", c.orta_liman||12, "number", "admin-v2-input-green")}
             ${v2Field("f_iu_orta_liman", "Yıllık Rıhtım/Çekek Bakımı (TL / Yıl)", iu.orta_liman||2100, "number", "admin-v2-input-upkeep")}
           </div>
           <div class="admin-v2-card">
             <div class="admin-v2-card-header"><span>⚓ BÜYÜK LİMAN</span><span class="admin-v2-card-badge" style="background:#261a3d;color:#9b59b6;">Tersane-i Amire</span></div>
             ${v2Field("f_p_buyuk_liman", "İnşaat Fiyatı (TL)", p.buyuk_liman||260000, "number", "admin-v2-input-price")}
             ${v2Field("f_c_buyuk_liman", "Gemi Destek Kapasitesi (Adet)", c.buyuk_liman||20, "number", "admin-v2-input-green")}
             ${v2Field("f_iu_buyuk_liman", "Yıllık Rıhtım/Çekek Bakımı (TL / Yıl)", iu.buyuk_liman||3400, "number", "admin-v2-input-upkeep")}
           </div>
         </div>
       </div>

     </div>

      <!-- TAB 2: NÜFUS, SAĞLIK & EĞİTİM BİNALARI -->
      <div id="admin-content-nufus" class="admin-v2-tab-content" style="display:none;">
        <div class="admin-v2-grid-2" style="margin-bottom:16px;">
          <!-- ŞİFAHANE (SAĞLIK) KUTUSU -->
          <div class="admin-v2-card" style="background:linear-gradient(135deg, rgba(16,48,28,0.45), #181c24); border-color:rgba(46,204,113,0.4);">
            <div class="admin-v2-card-header">
              <span style="color:#2ecc71; font-size:14px;">🏥 ŞİFAHANE (HASTANE) VE SAĞLIK SİSTEMİ</span>
              <span class="admin-v2-badge">Salgın & Ecel Önleyici</span>
            </div>
            <div class="admin-v2-grid-2" style="margin-top:4px;">
              ${v2Field("f_hospital_base_cost", "Şifahane Taban Fiyatı (TL)", db?.settings?.hospitalBaseCost||35000, "number", "admin-v2-input-price")}
              ${v2Field("f_hospital_capacity", "Sağlık Kapasitesi (Kişi)", db?.settings?.hospitalCapacityPerBuilding||60000, "number", "admin-v2-input-green")}
            </div>
            <div class="admin-v2-grid-2" style="margin-top:6px;">
              ${v2Field("f_pc_hastane", "Kişi Başı Ek Maliyet (TL)", pc.hastane||0.10, "number", "admin-v2-input-price")}
              ${v2Field("f_pg_hastane", "Nüfus Artış Oranı (%)", pg.hastane||0.5, "number", "admin-v2-input-green")}
            </div>
            <div style="margin-top:6px;">
              ${v2Field("f_pbu_hastane", "Yıllık Bakım Gideri (Bina Başı TL)", pbu.hastane||8000, "number", "admin-v2-input-upkeep")}
            </div>
            <p style="margin:4px 0 0; font-size:11px; color:#8c8270;">İnşa Fiyatı = Taban Fiyat + (Vilayet Nüfusu × Kişi Başı Çarpan) olarak dinamik hesaplanır.</p>
          </div>

          <!-- MEDRESE (OKUL & EĞİTİM ALTYAPISI) KUTUSU -->
          <div class="admin-v2-card" style="background:linear-gradient(135deg, rgba(19,34,53,0.45), #181c24); border-color:rgba(52,152,219,0.4);">
            <div class="admin-v2-card-header">
              <span style="color:#3498db; font-size:14px;">🎓 MEDRESE (OKUL) VE EĞİTİM ALTYAPISI</span>
              <span class="admin-v2-card-badge" style="background:#1a2a3d; color:#3498db;">Talebe Yetiştirir</span>
            </div>
            <div class="admin-v2-grid-2" style="margin-top:4px;">
              ${v2Field("f_p_okul", "Okul Taban Fiyatı (TL)", db?.settings?.schoolBaseCost||p.okul||100000, "number", "admin-v2-input-price")}
              ${v2Field("f_school_capacity", "Okul Talebe Kapasitesi (Kişi)", st.schoolCapacityPerBuilding||500, "number", "admin-v2-input-green")}
            </div>
            <div class="admin-v2-grid-2" style="margin-top:6px;">
              ${v2Field("f_school_cost_per_person", "Kişi Başı Ek Maliyet (TL)", st.schoolCostPerPerson||0.15, "number", "admin-v2-input-price")}
              ${v2Field("f_school_upkeep", "Okul Yıllık Gideri (Bina Başı TL)", st.schoolUpkeep||30000, "number", "admin-v2-input-upkeep")}
            </div>
            <p style="margin:4px 0 0; font-size:11px; color:#8c8270;">İnşa Fiyatı = Taban Fiyat + (Vilayet Nüfusu × Kişi Başı Çarpan) olarak dinamik hesaplanır. Her medrese talebe eğitir.</p>
          </div>
        </div>

        <!-- DİĞER NÜFUS BİNALARI TABLOSU -->
        <div class="admin-v2-table-wrap">
          <div style="padding:10px 14px; background:#0f1217; border-bottom:1px solid #282f3d; display:flex; justify-content:space-between; align-items:center;">
            <span style="font-family:'Oswald'; color:#f0cf82; font-size:13px;">🌾 DOĞUM VE NÜFUS ARTIŞ BİNALARI (DİNAMİK ÖLÇEK)</span>
            <span style="font-size:11px; color:#8c8270;">Fiyat = Nüfus × Kişi Başı TL</span>
          </div>
          <table class="admin-v2-table">
            <thead>
              <tr>
                <th>Bina Adı</th>
                <th>Kişi Başı İnşaat (TL)</th>
                <th>Yıllık Bakım (Bina Başı TL)</th>
                <th>Nüfus Artış Bonusu (%)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>🍲 Aşevi</b></td>
                <td><input id="f_pc_asevi" type="number" step="0.01" value="${esc(pc.asevi||0.05)}" class="admin-v2-input admin-v2-input-price" style="width:140px;"></td>
                <td><input id="f_pbu_asevi" type="number" value="${esc(pbu.asevi||0)}" class="admin-v2-input admin-v2-input-upkeep" style="width:140px;"></td>
                <td><input id="f_pg_asevi" type="number" step="0.1" value="${esc(pg.asevi||0.4)}" class="admin-v2-input admin-v2-input-green" style="width:120px;"> %</td>
              </tr>
              <tr>
                <td><b>⚙️ Su Değirmeni</b></td>
                <td><input id="f_pc_su_degirmeni" type="number" step="0.01" value="${esc(pc.su_degirmeni||0.08)}" class="admin-v2-input admin-v2-input-price" style="width:140px;"></td>
                <td><input id="f_pbu_su_degirmeni" type="number" value="${esc(pbu.su_degirmeni||0)}" class="admin-v2-input admin-v2-input-upkeep" style="width:140px;"></td>
                <td><input id="f_pg_su_degirmeni" type="number" step="0.1" value="${esc(pg.su_degirmeni||0.6)}" class="admin-v2-input admin-v2-input-green" style="width:120px;"> %</td>
              </tr>
              <tr>
                <td><b>🐫 Kervansaray</b></td>
                <td><input id="f_pc_kervansaray" type="number" step="0.01" value="${esc(pc.kervansaray||0.12)}" class="admin-v2-input admin-v2-input-price" style="width:140px;"></td>
                <td><input id="f_pbu_kervansaray" type="number" value="${esc(pbu.kervansaray||0)}" class="admin-v2-input admin-v2-input-upkeep" style="width:140px;"></td>
                <td><input id="f_pg_kervansaray" type="number" step="0.1" value="${esc(pg.kervansaray||0.3)}" class="admin-v2-input admin-v2-input-green" style="width:120px;"> %</td>
              </tr>
              <tr>
                <td><b>⚖️ Pazar Yeri</b></td>
                <td><input id="f_pc_pazar" type="number" step="0.01" value="${esc(pc.pazar||0.10)}" class="admin-v2-input admin-v2-input-price" style="width:140px;"></td>
                <td><input id="f_pbu_pazar" type="number" value="${esc(pbu.pazar||0)}" class="admin-v2-input admin-v2-input-upkeep" style="width:140px;"></td>
                <td><input id="f_pg_pazar" type="number" step="0.1" value="${esc(pg.pazar||0.4)}" class="admin-v2-input admin-v2-input-green" style="width:120px;"> %</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- TAB 3: MALİYE & VERGİ SİSTEMİ -->
      <div id="admin-content-maliye" class="admin-v2-tab-content" style="display:none;">
        <div class="admin-v2-grid-2">
          <!-- GENEL VERGİ VE GELİR STANDARDI (TÜM DEVLETLER İÇİN ORTAK) -->
          <div class="admin-v2-card" style="background:linear-gradient(135deg, rgba(36,30,18,0.5), #181c24); border-color:rgba(197,160,89,0.5);">
            <div class="admin-v2-card-header">
              <span style="color:#f0cf82; font-size:14px;">👑 GENEL VERGİ VE GELİR STANDARDI</span>
              <span class="admin-v2-card-badge" style="background:#3d331a; color:#f1c40f;">Tüm Devletler</span>
            </div>
            ${v2Field("f_base_tax_per_person", "Kişi Başı Taban Vergi (TL / Yıl)", db?.settings?.baseTaxPerPerson||5, "number", "admin-v2-input-price")}
            <div style="margin-top:6px;">
              ${v2Field("f_educated_tax_multiplier", "Eğitimli Sınıf (Medrese Mezunu) Vergi Çarpanı", db?.settings?.educatedTaxMultiplier??1.5, "number", "admin-v2-input-camp")}
            </div>
            <div style="margin-top:6px;">
              ${v2Field("f_pop_per_province", "Toprak / Fetih Başına Nüfus (Kişi / Toprak)", db?.settings?.popPerProvince||60000, "number", "admin-v2-input-cap")}
            </div>
            <div style="margin-top:10px; padding:10px 12px; background:#0e1117; border:1px solid rgba(197,160,89,0.25); border-radius:4px;">
              <div style="font-size:11px; font-weight:700; color:#f0cf82; font-family:'Oswald';">📐 VERGİ MATEMATİĞİ:</div>
              <p style="margin:4px 0 0; font-size:11px; color:#8c8270; line-height:1.4;">
                Gelir = [(Sıradan Nüfus × Taban) + (Eğitimli × Taban × Çarpan)] × (% Vergi Oranı).<br>
                Belirlenen taban vergi, oyundaki tüm devletler için ortak taban olarak uygulanır.
              </p>
            </div>
          </div>

          <!-- FERMANLAR & İSTİHBARAT -->
          <div class="admin-v2-card">
            <div class="admin-v2-card-header">
              <span style="color:#f0cf82; font-size:14px;">📜 FERMANLAR & İSTİHBARAT MASRAFLARI</span>
              <span class="admin-v2-card-badge" style="background:#1e2530; color:#bdc3c7;">İdare Giderleri</span>
            </div>
            ${v2Field("f_map_intel_cost", "İstihbaratsız Oyuncu Harita Rapor Ücreti (TL)", st.mapIntelReportCost||100000, "number", "admin-v2-input-price")}
            <label style="font-size:11px; font-weight:600; color:#8c8270; margin-top:6px;">Ferman Nüfus Başı Maliyet Çarpanları:</label>
            <div class="admin-v2-grid-3" style="gap:8px;">
              ${v2Field("f_ec_erzak", "Erzak", ec.erzak||2, "number")}
              ${v2Field("f_ec_karakol", "Karakol", ec.karakol||1.5, "number")}
              ${v2Field("f_ec_panayir", "Panayır", ec.panayir||1, "number")}
              ${v2Field("f_ec_ibadethane", "İbadethane", ec.ibadethane||3, "number")}
              ${v2Field("f_ec_anit", "Anıt", ec.anit||2.5, "number")}
              ${v2Field("f_ec_denetim", "Denetim", ec.denetim||0.5, "number")}
            </div>
          </div>
        </div>
      </div>

     <!-- TAB 4: DİVAN PAŞALARI -->
     <div id="admin-content-divan" class="admin-v2-tab-content" style="display:none;">
       <div class="admin-v2-card" style="margin-bottom:14px;">
         <div class="admin-v2-card-header">
           <span>👑 DİVAN PAŞALARI YÖNETİMİ (${(db.advisors||[]).length} Paşa)</span>
           <span style="font-size:11px; color:#8c8270;">Ömür, maaş ve çarpanları düzenleyin</span>
         </div>
         <div style="max-height:240px; overflow-y:auto; padding-right:4px;">
           ${advisorsHtml || "<p class='sub'>Kayıtlı paşa bulunmuyor.</p>"}
         </div>
       </div>

        <!-- YENİ PAŞA EKLEME FORMU -->
        <div class="admin-v2-card" style="background:#12161f; border-color:rgba(197,160,89,0.4);">
          <div class="admin-v2-card-header"><span style="color:#f0cf82;">➕ YENİ DİVAN PAŞASI EKLE</span></div>
          <div class="admin-v2-grid-3">
            ${v2Field("f_adv_new_name", "Paşa İsmi", "", "text")}
            ${v2Field("f_adv_new_role", "Unvanı / Rolü", "", "text")}
            <div class="admin-v2-field">
              <label>Yıldız Seviyesi</label>
              <select id="f_adv_new_stars" class="admin-v2-input"><option value="1">1 Yıldız (★)</option><option value="2">2 Yıldız (★★)</option><option value="3" selected>3 Yıldız (★★★)</option><option value="4">4 Yıldız (★★★★)</option><option value="5">5 Yıldız (★★★★★)</option></select>
            </div>
            <div class="admin-v2-field">
              <label>Hangi Devlete Özel?</label>
              <select id="f_adv_new_faction" class="admin-v2-input">${stateOpts}</select>
            </div>
            ${v2Field("f_adv_new_salary", "Yıllık Maaş (TL)", 25000, "number")}
            ${v2Field("f_adv_new_ageYears", "Başlangıç Yaşı", 1, "number")}
            ${v2Field("f_adv_new_maxAge", "Maksimum Ömür (Yıl)", 70, "number")}
            ${v2Field("f_adv_new_icon", "Resim URL (İsteğe Bağlı)", "", "text")}
            ${v2Field("f_adv_new_taxBonus", "Vergi Geliri Etkisi (+/- %)", 0, "number")}
          </div>
          <div class="admin-v2-grid-3" style="margin-top:6px;">
            ${v2Field("f_adv_new_milUpkeepDiscount", "Ordu Bakım İndirimi (%)", 0, "number")}
            ${v2Field("f_adv_new_navyUpkeepDiscount", "Donanma Bakım İndirimi (%)", 0, "number")}
            ${v2Field("f_adv_new_artUpkeepDiscount", "Topçu Bakım İndirimi (%)", 0, "number")}
            ${v2Field("f_adv_new_recruitDiscount", "Asker Alım İndirimi (%)", 0, "number")}
            ${v2Field("f_adv_new_infraDiscount", "Bina Yapım İndirimi (%)", 0, "number")}
            ${v2Field("f_adv_new_happinessBonus", "Mutluluk Bonusu (+/- Puan)", 0, "number")}
          </div>
          <div class="admin-v2-grid-2" style="margin-top:6px;">
            <div class="admin-v2-field">
              <label>İsyanı Önleme (Nizam Yeteneği)</label>
              <select id="f_adv_new_stopAnarchy" class="admin-v2-input">
                <option value="false" selected>Hayır</option>
                <option value="true">Evet (Anarşi Zararını Sıfırlar)</option>
              </select>
            </div>
            <div class="admin-v2-field">
              <label>Casusluk Doğruluk Bonusu</label>
              <select id="f_adv_new_spyAccuracyBonus" class="admin-v2-input">
                <option value="false" selected>Hayır</option>
                <option value="true">Evet (Sapmayı %10'a Sabitler)</option>
              </select>
            </div>
          </div>
          <div class="admin-v2-grid-2" style="margin-top:6px;">
            ${v2Field("f_adv_new_buff", "Artı Açıklaması (Görsel Metin)", "", "text")}
            ${v2Field("f_adv_new_debuff", "Eksi Açıklaması (Görsel Metin)", "", "text")}
          </div>
          <button class="btn green" style="margin-top:10px; width:100%; font-weight:bold; padding:10px;" onclick="addNewAdvisor()">➕ PAŞAYI LİSTEYE KAYDET</button>
        </div>
     </div>

     <!-- TAB 5: ÖZEL BİRİMLER -->
     <div id="admin-content-ozel" class="admin-v2-tab-content" style="display:none;">
       <div class="admin-v2-card" style="margin-bottom:14px;">
         <div class="admin-v2-card-header"><span>🌟 DEVLETLERE HAS ÖZEL BİRİMLER</span></div>
         <div style="max-height:220px; overflow-y:auto;">
           ${customHtml || "<p class='sub'>Özel birim bulunmuyor.</p>"}
         </div>
       </div>

       <div class="admin-v2-card" style="background:#12161f; border-color:rgba(197,160,89,0.4);">
        <div class="admin-v2-card" style="background:#12161f; border-color:rgba(197,160,89,0.4);">
          <div class="admin-v2-card-header"><span style="color:#f0cf82;">➕ YENİ ÖZEL BİRİM / BİNA EKLE</span></div>
          <div class="admin-v2-grid-3">
            ${v2Field("f_ci_name", "Birim / Bina Adı", "", "text")}
            <div class="admin-v2-field">
              <label>Hangi Devlete Özel?</label>
              <select id="f_ci_faction" class="admin-v2-input">${stateOpts}</select>
            </div>
            <div class="admin-v2-field">
              <label>Kategori</label>
              <select id="f_ci_cat" class="admin-v2-input"><option value="asker">Askeri Birlik</option><option value="altyapi">Altyapı / Bina</option></select>
            </div>
            ${v2Field("f_ci_icon", "Resim URL (Doğrudan Link)", "", "text")}
            ${v2Field("f_ci_price", "Satın Alma Fiyatı (TL)", 0, "number")}
            ${v2Field("f_ci_upkeep", "Yıllık Bakım Gideri (TL)", 0, "number")}
            ${v2Field("f_ci_campCost", "Sefer İkmal Maliyeti (TL)", 0, "number")}
          </div>
          <button class="btn green" style="margin-top:10px; width:100%; font-weight:bold; padding:10px;" onclick="addCustomItem()">➕ ÖZEL BİRİMİ KAYDET</button>
        </div>
      </div>
     </div>

     <!-- TAB 6: SİSTEM & İŞLEMLER -->
     <div id="admin-content-sistem" class="admin-v2-tab-content" style="display:none;">
       <!-- HIZLI EYLEMLER -->
       <div class="admin-v2-card" style="margin-bottom:14px; background:#101319;">
         <div class="admin-v2-card-header"><span style="color:#f0cf82;">⚡ YÖNETİM MERKEZİ HIZLI EYLEMLERİ</span></div>
         <div style="display:flex; gap:10px; flex-wrap:wrap; padding:6px 0;">
           <button class="btn red" onclick="openWarGarrisonModal()">⚔️ SAVAŞ ZAYİATLARI</button>
           <button class="btn gold" onclick="openEventHistoryAdmin()">🎲 OLAY GEÇMİŞİ / SEÇİMLER</button>
           <button class="btn blue" onclick="openEventPoolAdmin()">🗂️ 100 OLAY HAVUZU</button>
           <button class="btn blue" onclick="openAdminLetters()">✉️ MEKTUPLAR</button>
           <button class="btn gold" onclick="openStrategicRegionAdmin()">⭐ STRATEJİK BÖLGELER</button>
         </div>
       </div>

       <!-- İSTİHBARAT DAİRESİ BİNA AYARI -->
       <div class="admin-v2-card" style="margin-bottom:14px;">
         <div class="admin-v2-card-header"><span>🕵️ İSTİHBARAT DAİRESİ BİNASI</span></div>
         <div class="admin-v2-grid-2">
           ${v2Field("f_p_istihbarat_binasi", "Satın Alma Fiyatı (TL)", p.istihbarat_binasi||200000, "number", "admin-v2-input-price")}
           ${v2Field("f_iu_istihbarat_binasi", "Yıllık Bakım Gideri (TL / Yıl)", iu.istihbarat_binasi||2000, "number", "admin-v2-input-upkeep")}
         </div>
       </div>

       <!-- DİĞER SABİT GİDERLER & RAPOR MALİYETİ -->
       <div class="admin-v2-card" style="margin-bottom:14px;">
         <div class="admin-v2-card-header"><span>📜 HARİTA RAPORU & SABİT GİDERLER</span></div>
         <div class="admin-v2-grid-2">
           ${v2Field("f_map_intel_cost", "Harita İstihbarat Raporu Fiyatı (TL)", db?.settings?.mapIntelReportCost||100000, "number", "admin-v2-input-price")}
         </div>
       </div>

       <!-- GÖRSEL URL AYARLARI -->
       <div class="admin-v2-card">
         <div class="admin-v2-card-header"><span>🖼️ BİRİM VE BİNA RESİM URL'LERİ</span></div>
         <p class="sub" style="margin-bottom:10px;">Kartlarda görünecek resimlerin doğrudan linklerini girin.</p>
         <div class="admin-v2-grid-3">
           ${v2Field("f_img_piyade", "Piyade Resmi URL", img.piyade||"", "text")}
           ${v2Field("f_img_suvari", "Süvari Resmi URL", img.suvari||"", "text")}
           ${v2Field("f_img_nisanci", "Nişancı Resmi URL", img.nisanci||"", "text")}
           ${v2Field("f_img_kucuk_top", "Küçük Top Resmi URL", img.kucuk_top||"", "text")}
           ${v2Field("f_img_orta_top", "Orta Top Resmi URL", img.orta_top||"", "text")}
           ${v2Field("f_img_buyuk_top", "Büyük Top Resmi URL", img.buyuk_top||"", "text")}
           ${v2Field("f_img_kucuk_gemi", "Küçük Gemi Resmi URL", img.kucuk_gemi||"", "text")}
           ${v2Field("f_img_orta_gemi", "Orta Gemi Resmi URL", img.orta_gemi||"", "text")}
           ${v2Field("f_img_buyuk_gemi", "Büyük Gemi Resmi URL", img.buyuk_gemi||"", "text")}
           ${v2Field("f_img_kucuk_liman", "Küçük Liman Resmi URL", img.kucuk_liman||"", "text")}
           ${v2Field("f_img_orta_liman", "Orta Liman Resmi URL", img.orta_liman||"", "text")}
           ${v2Field("f_img_buyuk_liman", "Büyük Liman Resmi URL", img.buyuk_liman||"", "text")}
           ${v2Field("f_img_kucuk_ocak", "Küçük Top Ocağı Resmi URL", img.kucuk_ocak||"", "text")}
           ${v2Field("f_img_orta_ocak", "Orta Top Ocağı Resmi URL", img.orta_ocak||"", "text")}
           ${v2Field("f_img_buyuk_ocak", "Büyük Top Ocağı Resmi URL", img.buyuk_ocak||"", "text")}
           ${v2Field("f_img_okul", "Okul Resmi URL", img.okul||"", "text")}
           ${v2Field("f_img_istihbarat_binasi", "İstihbarat Dairesi Resmi URL", img.istihbarat_binasi||"", "text")}
           ${v2Field("f_img_fortress", "Kale Resmi URL", img.fortress||"", "text")}
           ${v2Field("f_img_fortress_garrison", "Kale Garnizonu Resmi URL", img.fortress_garrison||"", "text")}
           ${v2Field("f_img_hastane", "Hastane Resmi URL", img.hastane||"", "text")}
           ${v2Field("f_img_asevi", "Aşevi Resmi URL", img.asevi||"", "text")}
           ${v2Field("f_img_su_degirmeni", "Su Değirmeni Resmi URL", img.su_degirmeni||"", "text")}
           ${v2Field("f_img_kervansaray", "Kervansaray Resmi URL", img.kervansaray||"", "text")}
           ${v2Field("f_img_pazar", "Pazar Resmi URL", img.pazar||"", "text")}
         </div>
       </div>
     </div>

   </div>

   <!-- FOOTER -->
   <div class="admin-v2-footer">
     <div class="admin-v2-footer-info">
       <span>ℹ️ Değişiklikler Supabase bulut veritabanına otomatik işlenir.</span>
     </div>
     <div class="admin-v2-footer-actions">
       <button class="btn" onclick="closeModal()">İPTAL</button>
       <button class="btn green" style="padding:8px 24px; font-weight:bold;" onclick="saveAdmin(true)">💾 DEĞİŞİKLİKLERİ KAYDET</button>
     </div>
   </div>
 </div>`;

 modal(html);
 if(defaultTab && typeof switchAdminTab === 'function') {
   switchAdminTab(defaultTab);
 }
}

// ---------------- SAVAŞTA GARNİZON KAYIPLARI (ADMİN) ----------------
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

// ---------------- DANIŞMAN DÜZENLEME & KAYDETME (ADMİN) ----------------
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

function addNewAdvisor() {
    const el = id => document.getElementById(id) || document.getElementById(id.replace(/^f_/, ''));
    const name = (el("f_adv_new_name")?.value || "").trim();
    const role = (el("f_adv_new_role")?.value || "").trim();
    const stars = Number(el("f_adv_new_stars")?.value) || 1;
    const faction = el("f_adv_new_faction")?.value || "";
    const salary = Number(el("f_adv_new_salary")?.value) || 0;
    const ageYears = Math.max(0, Number(el("f_adv_new_ageYears")?.value) || 0);
    const maxAge = Math.max(ageYears + 1, Number(el("f_adv_new_maxAge")?.value) || 20);
    const icon = cleanUrl(el("f_adv_new_icon")?.value || "");
    
    const taxBonus = Number(el("f_adv_new_taxBonus")?.value) || 0;
    const milUpkeepDiscount = Number(el("f_adv_new_milUpkeepDiscount")?.value) || 0;
    const navyUpkeepDiscount = Number(el("f_adv_new_navyUpkeepDiscount")?.value) || 0;
    const artUpkeepDiscount = Number(el("f_adv_new_artUpkeepDiscount")?.value) || 0;
    const recruitDiscount = Number(el("f_adv_new_recruitDiscount")?.value) || 0;
    const infraDiscount = Number(el("f_adv_new_infraDiscount")?.value) || 0;
    const happinessBonus = Number(el("f_adv_new_happinessBonus")?.value) || 0;
    const stopAnarchy = el("f_adv_new_stopAnarchy")?.value === 'true';
    const spyAccuracyBonus = el("f_adv_new_spyAccuracyBonus")?.value === 'true';

    const buff = (el("f_adv_new_buff")?.value || "").trim();
    const debuff = (el("f_adv_new_debuff")?.value || "").trim();
    
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
    openAdmin('pasalar');
    if(typeof toast === 'function') toast(`"${name}" adlı paşa başarıyla eklendi!`, true);
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

function addCustomItem(){
   const nameEl = document.getElementById("f_ci_name") || document.getElementById("ci_name");
   const catEl = document.getElementById("f_ci_cat") || document.getElementById("ci_cat");
   const factionEl = document.getElementById("f_ci_faction") || document.getElementById("ci_faction");
   const priceEl = document.getElementById("f_ci_price") || document.getElementById("ci_price");
   const upkeepEl = document.getElementById("f_ci_upkeep") || document.getElementById("ci_upkeep");
   const campCostEl = document.getElementById("f_ci_campCost") || document.getElementById("ci_campCost");
   const iconEl = document.getElementById("f_ci_icon") || document.getElementById("ci_icon");

   const name = nameEl ? nameEl.value.trim() : "";
   const cat = catEl ? catEl.value : "asker";
   const faction = factionEl ? factionEl.value : "";
   const price = priceEl ? Math.max(0, Number(priceEl.value) || 0) : 0;
   const upkeep = upkeepEl ? Math.max(0, Number(upkeepEl.value) || 0) : 0;
   const campCost = campCostEl ? Math.max(0, Number(campCostEl.value) || 0) : 0;
   const icon = iconEl ? cleanUrl(iconEl.value) : "";

   if(!name){ alert("İsim gerekli!"); return; }
   const id = "c_" + crypto.randomUUID().split("-")[0];
   if(!db.settings) db.settings = typeof defaultSettings !== 'undefined' ? structuredClone(defaultSettings) : {};
   db.settings.customItems = db.settings.customItems || [];
   db.settings.customItems.push({id, name, category: cat, price, upkeep, campCost, icon, faction});

   (db.states || []).forEach(s => {
       if (s[id] === undefined) s[id] = 0;
   });

   currentAdminTab = 'ozel';
   saveAdmin(false);
   toast(`"${name}" özel birimi başarıyla kaydedildi!`, true);
}

function openEditCustomItemModal(itemId) {
    if(!db.settings) db.settings = typeof defaultSettings !== 'undefined' ? structuredClone(defaultSettings) : {};
    const item = (db.settings.customItems || []).find(x => x.id === itemId);
    if (!item) return;
    const stateOpts = `<option value="" ${!item.faction ? 'selected' : ''}>🌍 Tümü (Herkes Alabilir)</option>` + (db.states || []).map(x => `<option value="${x.id}" ${item.faction === x.id ? 'selected' : ''}>${esc(x.name)}</option>`).join("");

    modal(`<h2>🌟 ÖZEL BİRİMİ DÜZENLE</h2>
    <div class="formgrid">
        ${field("ci_edit_name", "Birim / Bina Adı", item.name, "text")}
        <div><label>Hangi Devlete Özel?</label><select id="f_ci_edit_faction">${stateOpts}</select></div>
        <div><label>Kategori</label><select id="f_ci_edit_cat">
            <option value="asker" ${item.category === 'asker' ? 'selected' : ''}>Askeri Birlik</option>
            <option value="altyapi" ${item.category !== 'asker' ? 'selected' : ''}>Altyapı / Bina</option>
        </select></div>
        ${field("ci_edit_price", "Satın Alma Fiyatı (TL)", item.price, "number")}
        ${field("ci_edit_upkeep", "Yıllık Bakım Gideri (TL)", item.upkeep, "number")}
        ${field("ci_edit_campCost", "Sefer İkmal Maliyeti (TL)", item.campCost || 0, "number")}
        <div class="full">${field("ci_edit_icon", "Resim URL", item.icon || "", "text")}</div>
        <div class="full actions" style="margin-top:10px;">
            <button class="btn" onclick="openAdmin('ozel')">GERİ</button>
            <button class="btn green" onclick="saveCustomItemEdit('${item.id}')">KAYDET</button>
        </div>
    </div>`);
}

function saveCustomItemEdit(itemId) {
    if(!db.settings) db.settings = typeof defaultSettings !== 'undefined' ? structuredClone(defaultSettings) : {};
    const item = (db.settings.customItems || []).find(x => x.id === itemId);
    if (!item) return;
    const nameEl = document.getElementById("f_ci_edit_name") || document.getElementById("ci_edit_name");
    const catEl = document.getElementById("f_ci_edit_cat");
    const factionEl = document.getElementById("f_ci_edit_faction");
    const priceEl = document.getElementById("f_ci_edit_price") || document.getElementById("ci_edit_price");
    const upkeepEl = document.getElementById("f_ci_edit_upkeep") || document.getElementById("ci_edit_upkeep");
    const campCostEl = document.getElementById("f_ci_edit_campCost") || document.getElementById("ci_edit_campCost");
    const iconEl = document.getElementById("f_ci_edit_icon") || document.getElementById("ci_edit_icon");

    if (nameEl && nameEl.value.trim()) item.name = nameEl.value.trim();
    if (catEl) item.category = catEl.value;
    if (factionEl) item.faction = factionEl.value;
    if (priceEl) item.price = Math.max(0, Number(priceEl.value) || 0);
    if (upkeepEl) item.upkeep = Math.max(0, Number(upkeepEl.value) || 0);
    if (campCostEl) item.campCost = Math.max(0, Number(campCostEl.value) || 0);
    if (iconEl) item.icon = cleanUrl(iconEl.value);

    currentAdminTab = 'ozel';
    saveAdmin(false);
    toast(`"${item.name}" özel birimi başarıyla güncellendi!`, true);
}

function removeCustomItem(id){
   if(!confirm("Emin misiniz?")) return;
   if(!db.settings) db.settings = typeof defaultSettings !== 'undefined' ? structuredClone(defaultSettings) : {};
   db.settings.customItems = (db.settings.customItems || []).filter(x => x.id !== id);
   currentAdminTab = 'ozel';
   saveAdmin(false);
}
function saveAdmin(doClose = true){
  if(!db.settings) db.settings = typeof defaultSettings !== 'undefined' ? structuredClone(defaultSettings) : {};
  if(!db.settings.prices) db.settings.prices = {};
  if(!db.settings.capacity) db.settings.capacity = {};
  if(!db.settings.upkeep) db.settings.upkeep = {};
  if(!db.settings.garrisonUpkeep) db.settings.garrisonUpkeep = {};
  if(!db.settings.populationBuildingGrowth) db.settings.populationBuildingGrowth = {};
  if(!db.settings.populationBuildingCostPerPerson) db.settings.populationBuildingCostPerPerson = {};
  if(!db.settings.populationBuildingUpkeep) db.settings.populationBuildingUpkeep = {};
  if(!db.settings.infrastructureUpkeep) db.settings.infrastructureUpkeep = {};
  if(!db.settings.edictCost) db.settings.edictCost = {};
  if(!db.settings.campaignCost) db.settings.campaignCost = {};

  const baseTaxEl = document.getElementById("f_base_tax_per_person");
 if(baseTaxEl){
   db.settings.baseTaxPerPerson = Math.max(1, Number(baseTaxEl.value)||5);
   (db.states||[]).forEach(s => { s.baseTaxPerPerson = db.settings.baseTaxPerPerson; });
 }
 const mapIntelCostEl=document.getElementById("f_map_intel_cost"); if(mapIntelCostEl)db.settings.mapIntelReportCost=Math.max(0,Number(mapIntelCostEl.value)||0);
 const schoolCapacityEl=document.getElementById("f_school_capacity"); if(schoolCapacityEl)db.settings.schoolCapacityPerBuilding=Math.max(0,Math.floor(Number(schoolCapacityEl.value)||0));
 const schoolUpkeepEl=document.getElementById("f_school_upkeep"); if(schoolUpkeepEl)db.settings.schoolUpkeep=Math.max(0,Number(schoolUpkeepEl.value)||0);
 const schoolPopMultEl=document.getElementById("f_school_cost_per_person"); if(schoolPopMultEl)db.settings.schoolCostPerPerson=Math.max(0,Number(schoolPopMultEl.value)||0);
 const educatedMultiplierEl=document.getElementById("f_educated_tax_multiplier"); if(educatedMultiplierEl)db.settings.educatedTaxMultiplier=Math.max(0,Number(educatedMultiplierEl.value)||0);
 const popPerProvEl=document.getElementById("f_pop_per_province"); if(popPerProvEl)db.settings.popPerProvince=Math.max(1000,Number(popPerProvEl.value)||60000);
 const hospCapEl=document.getElementById("f_hospital_capacity"); if(hospCapEl)db.settings.hospitalCapacityPerBuilding=Math.max(1,Math.floor(Number(hospCapEl.value)||30000));
 const hospBaseEl=document.getElementById("f_hospital_base_cost"); if(hospBaseEl)db.settings.hospitalBaseCost=Math.max(0,Math.floor(Number(hospBaseEl.value)||120000));
 Object.keys(db.settings.prices).forEach(k=>{ const el=document.getElementById("f_p_"+k); if(el) db.settings.prices[k]=Number(el.value||0); });
 if (db.settings.prices.okul) db.settings.schoolBaseCost = db.settings.prices.okul;
 const garrisonPriceEl=document.getElementById("f_p_fortress_garrison"); if(garrisonPriceEl) db.settings.prices.fortress_garrison=Math.max(0,Number(garrisonPriceEl.value)||25);
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
      const el = document.getElementById("f_img_" + k) || document.getElementById("img_" + k);
      if(el) db.settings.images[k] = cleanUrl(el.value);
  });

 if(doClose){
     const mb = document.querySelector('.modalbox');
     if(mb) mb.classList.remove('admin-modal-wide');
     closeModal();
     queueSave();
     if(currentId) openDetail(currentId);
 } else {
     queueSave();
     openAdmin(currentAdminTab);
 }
}

window.addEventListener("load",init);
