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
        ${field("baseTaxPerPerson","Kişi Başı Temel Vergi",s.baseTaxPerPerson,"number")}
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
 const keys=["name","ownerEmail","ruler","rulerImage","bgImage","title","color","treasury","population","tax","educatedPopulation","baseTaxPerPerson","civilExpense","advisorSlots","piyade","suvari","nisanci","kucuk_top","orta_top","buyuk_top","kucuk_gemi","orta_gemi","buyuk_gemi","kucuk_liman","orta_liman","buyuk_liman","kucuk_ocak","orta_ocak","buyuk_ocak","okul","istihbarat_binasi","hastane","asevi","su_degirmeni","kervansaray","pazar"];
 if(db.settings.customItems) { db.settings.customItems.forEach(item => keys.push(item.id)); }
 const o={};
 keys.forEach(k=>o[k]=["name","ownerEmail","ruler","rulerImage","bgImage","title","color"].includes(k)?document.getElementById("f_"+k).value:Number(document.getElementById("f_"+k).value||0));
 
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

        // 4. YENİ DOĞUMLAR: Taze nesil dünyaya gelir (taban %1.65 + şifahane refahı + binalar)
        let baseBirthPercent = 1.65 + (hospitalCoverage * 0.10); // %1.65 - %1.75
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

window.switchAdminSidebarTab = function(tabId) {
    currentAdminTab = tabId;
    document.querySelectorAll('.admin-sidebar-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.admin-tab-content-panel').forEach(pane => pane.classList.remove('active'));
    const btn = document.getElementById('admin-sb-' + tabId);
    if(btn) btn.classList.add('active');
    const pane = document.getElementById('admin-pane-' + tabId);
    if(pane) pane.classList.add('active');
};
window.switchAdminTab = window.switchAdminSidebarTab;

window.calcTaxPreview = function(val) {
    const b = Math.max(0, Number(val) || 0);
    const p100 = Math.round(100000 * b * 0.20);
    const p1m = Math.round(1000000 * b * 0.20);
    const p15m = Math.round(15000000 * b * 0.25 * 1.25);
    const e1 = document.getElementById('prev_100k');
    const e2 = document.getElementById('prev_1m');
    const e3 = document.getElementById('prev_15m');
    if(e1) e1.textContent = `~${money(p100)} / yıl (%20 Vergi)`;
    if(e2) e2.textContent = `~${money(p1m)} / yıl (%20 Vergi)`;
    if(e3) e3.textContent = `~${money(p15m)} / yıl (%25 Vergi)`;
};

async function openAdmin(initialTab = null){
    if(!isAdmin) return;
    try{if(!mapConfigCache)await loadMapAssets();}catch(_){}
    if(initialTab) currentAdminTab = initialTab;

    const p=db.settings.prices||{}, u=db.settings.upkeep||{}, c=db.settings.capacity||{},
          ec=db.settings.edictCost||{}, cc=db.settings.campaignCost||{},
          gu=db.settings.garrisonUpkeep||{}, pg=db.settings.populationBuildingGrowth||{},
          pc=db.settings.populationBuildingCostPerPerson||{}, pbu=db.settings.populationBuildingUpkeep||{},
          iu=db.settings.infrastructureUpkeep||{};
    const img=db.settings.images||{};
    const stateOpts = `<option value="">🌍 Tümü (Herkes Alabilir)</option>` + db.states.map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join("");

    const edictLabels = {
        erzak: "🍞 Erzak Dağıtımı",
        karakol: "🛡️ Asayiş Karakolu",
        panayir: "🎪 Panayır / Şenlik",
        ibadethane: "🕌 İbadethane / Hayrat",
        anit: "🏛️ Anıt İnşası",
        denetim: "⚖️ Pazar Denetimi",
        relief_fund: "💰 Afet Yardım Fonu",
        infrastructure: "🏗️ İmar & Bayındırlık"
    };

    const imgLabels = {
        piyade: "Piyade Resmi",
        suvari: "Süvari Resmi",
        nisanci: "Nişancı Resmi",
        kucuk_top: "Küçük Top Resmi",
        orta_top: "Orta Top Resmi",
        buyuk_top: "Büyük Top Resmi",
        kucuk_gemi: "Küçük Gemi Resmi",
        orta_gemi: "Orta Gemi Resmi",
        buyuk_gemi: "Büyük Gemi Resmi",
        kucuk_liman: "Küçük Liman Resmi",
        orta_liman: "Orta Liman Resmi",
        buyuk_liman: "Büyük Liman Resmi",
        kucuk_ocak: "Küçük Top Ocağı Resmi",
        orta_ocak: "Orta Top Ocağı Resmi",
        buyuk_ocak: "Büyük Top Ocağı Resmi",
        okul: "Okul / Medrese Resmi",
        istihbarat_binasi: "İstihbarat Dairesi Resmi",
        fortress: "Kale Resmi",
        fortress_garrison: "Kale Garnizonu Resmi",
        hastane: "Hastane / Şifahane Resmi",
        asevi: "Aşevi Resmi",
        su_degirmeni: "Su Değirmeni Resmi",
        kervansaray: "Kervansaray Resmi",
        pazar: "Pazar Resmi"
    };

    let customHtml = (db.settings.customItems||[]).map(x => {
        let fName = x.faction ? (getState(x.faction)?.name || "Silinmiş") : "Tümü";
        let safeIcon = cleanUrl(x.icon);
        return `<div class="list-item" style="display:flex; justify-content:space-between; align-items:center; background:#181c25; border:1px solid rgba(197, 160, 89, 0.2); padding:8px 12px; margin-bottom:6px; border-radius:4px;">
          <div style="display:flex; align-items:center; gap:10px;">
             ${safeIcon ? `<img src="${esc(safeIcon)}" style="width:36px;height:36px;object-fit:cover;border-radius:3px;border:1px solid var(--border-gold);">` : ''}
             <div>
                <b style="color:#f0cf82; font-family:'Oswald',sans-serif;">${esc(x.name)}</b> <span class="badge">${esc(fName)}</span>
                <div class="sub" style="font-size:11px; margin-top:2px;">Kategori: <b>${x.category==='asker'?'Askeri Birlik':'Altyapı'}</b> | Fyt: <span style="color:var(--gold);">${money(x.price)}</span> | Bkm: <span style="color:var(--red);">${money(x.upkeep)}/yıl</span> | İkm: ${money(x.campCost||0)}</div>
             </div>
          </div>
          <button class="btn red small" onclick="removeCustomItem('${x.id}')">SİL</button>
        </div>`;
    }).join("");

    let advisorsHtml = (db.advisors||[]).map((a) => {
        let fName = a.faction ? (getState(a.faction)?.name || "Özel Devlet") : (a.targetName || "Tümü");
        return `<div class="list-item" style="flex-direction:column; align-items:stretch; background:#181c25; border:1px solid rgba(197, 160, 89, 0.25); padding:10px 12px; margin-bottom:8px; border-radius:4px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:center; gap:8px;">
                ${a.icon ? `<img src="${esc(cleanUrl(a.icon))}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;border:1px solid var(--border-gold);">` : ''}
                <div>
                    <b style="color:#f0cf82; font-family:'Oswald',sans-serif; font-size:13px;">${esc(a.name)}</b>
                    <span style="color:#f39c12; font-size:12px; margin-left:4px;">${'★'.repeat(a.stars||1)}</span>
                    <span class="sub" style="margin-left:4px;">(${esc(a.role)})</span>
                    <span class="badge" style="margin-left:6px;">${esc(fName)}</span>
                </div>
            </div>
            <div style="display:flex; gap:6px;">
                <button class="btn gold small" style="padding:3px 8px;" onclick="document.querySelector('.modalbox')?.classList.remove('admin-modal-wide'); openEditAdvisorModal('${a.id}')">DÜZENLE</button>
                <button class="btn red small" style="padding:3px 8px;" onclick="removeAdvisor('${a.id}')">SİL</button>
            </div>
          </div>
          <div style="font-size:11px; margin-top:6px; display:flex; flex-wrap:wrap; gap:10px; color:#cbd5e1; border-top:1px solid rgba(255,255,255,0.06); padding-top:6px;">
            <span>Maaş: <b style="color:var(--gold);">${money(a.salary)}/yıl</b></span>
            <span>Yaş: <b>${a.ageYears||5} / ${a.maxAge||20}</b></span>
            ${a.buff ? `<span style="color:var(--green)">✓ ${esc(a.buff)}</span>` : ''}
            ${a.debuff ? `<span style="color:var(--red)">✗ ${esc(a.debuff)}</span>` : ''}
          </div>
        </div>`;
    }).join("");

    // Dynamic unhandled keys fallback
    const standardUnitKeys = ['piyade','suvari','nisanci'];
    const standardArtKeys = ['kucuk_top','orta_top','buyuk_top'];
    const standardArtFoundryKeys = ['kucuk_ocak','orta_ocak','buyuk_ocak'];
    const standardNavyKeys = ['kucuk_gemi','orta_gemi','buyuk_gemi'];
    const standardPortKeys = ['kucuk_liman','orta_liman','buyuk_liman'];
    const standardInfraKeys = ['okul','istihbarat_binasi'];
    const standardPopKeys = ['hastane','asevi','su_degirmeni','kervansaray','pazar'];
    const handledPrices = new Set([...standardUnitKeys, ...standardArtKeys, ...standardArtFoundryKeys, ...standardNavyKeys, ...standardPortKeys, ...standardInfraKeys, ...standardPopKeys]);
    const extraPrices = Object.keys(p).filter(k => !handledPrices.has(k));
    let extraPricesHtml = "";
    if(extraPrices.length > 0) {
        extraPricesHtml = `<div class="full" style="margin-top:10px;"><b style="color:var(--border-gold); font-size:11px;">DİĞER BİRİM / BİNA FİYATLARI:</b></div>` +
            extraPrices.map(k => field("p_" + k, k, p[k], "number")).join("");
    }

    const handledUpkeep = new Set([...standardUnitKeys, ...standardArtKeys, ...standardNavyKeys]);
    const extraUpkeep = Object.keys(u).filter(k => !handledUpkeep.has(k));
    let extraUpkeepHtml = "";
    if(extraUpkeep.length > 0) {
        extraUpkeepHtml = `<div class="full" style="margin-top:10px;"><b style="color:var(--border-gold); font-size:11px;">DİĞER BAKIM GİDERLERİ:</b></div>` +
            extraUpkeep.map(k => field("u_" + k, k, u[k], "number")).join("");
    }

    modal(`
    <div class="admin-header">
      <div class="admin-header-title-box">
        <span style="font-size:24px;">🏛️</span>
        <div>
          <h2 class="admin-header-title">KÜRESEL AYARLAR & SARAY DİVANI</h2>
          <p class="admin-header-sub">Sol menüden daire seçin. Tüm küresel fiyatlar, çarpanlar ve divan ayarları.</p>
        </div>
      </div>
      <div class="admin-header-actions">
        <button class="btn red small" onclick="document.querySelector('.modalbox')?.classList.remove('admin-modal-wide'); openWarGarrisonModal();">⚔️ SAVAŞ</button>
        <button class="btn gold small" onclick="document.querySelector('.modalbox')?.classList.remove('admin-modal-wide'); openEventHistoryAdmin();">🎲 OLAY GEÇMİŞİ</button>
        <button class="btn blue small" onclick="document.querySelector('.modalbox')?.classList.remove('admin-modal-wide'); openEventPoolAdmin();">🗂️ 100 OLAY HAVUZU</button>
        <button class="btn blue small" onclick="document.querySelector('.modalbox')?.classList.remove('admin-modal-wide'); openAdminLetters();">✉️ MEKTUPLAR</button>
        <button class="btn red small" style="padding:5px 9px; font-size:16px; line-height:1;" onclick="closeAdminModal()" title="Kapat">✕</button>
      </div>
    </div>

    <div class="admin-body">
      <!-- SOL MENÜ (SIDEBAR) -->
      <div class="admin-sidebar">
        <div class="admin-sidebar-section-title">YÖNETİM DAİRELERİ</div>
        
        <button id="admin-sb-maliye" class="admin-sidebar-btn ${currentAdminTab==='maliye'?'active':''}" onclick="switchAdminSidebarTab('maliye')">
          <span class="admin-sidebar-btn-icon">💰</span>
          <div class="admin-sidebar-btn-texts">
            <span class="admin-sidebar-btn-title">MALİYE & VERGİ</span>
            <span class="admin-sidebar-btn-sub">Vergi tabanı & fermanlar</span>
          </div>
        </button>

        <button id="admin-sb-askeriye" class="admin-sidebar-btn ${currentAdminTab==='askeriye'?'active':''}" onclick="switchAdminSidebarTab('askeriye')">
          <span class="admin-sidebar-btn-icon">⚔️</span>
          <div class="admin-sidebar-btn-texts">
            <span class="admin-sidebar-btn-title">ASKERİYE & DONANMA</span>
            <span class="admin-sidebar-btn-sub">Birlikler, ocaklar, tersaneler</span>
          </div>
        </button>

        <button id="admin-sb-nufus" class="admin-sidebar-btn ${currentAdminTab==='nufus'?'active':''}" onclick="switchAdminSidebarTab('nufus')">
          <span class="admin-sidebar-btn-icon">🏥</span>
          <div class="admin-sidebar-btn-texts">
            <span class="admin-sidebar-btn-title">NÜFUS & BİNALAR</span>
            <span class="admin-sidebar-btn-sub">Şifahane, aşevi, değirmen</span>
          </div>
        </button>

        <button id="admin-sb-divan" class="admin-sidebar-btn ${currentAdminTab==='divan'?'active':''}" onclick="switchAdminSidebarTab('divan')">
          <span class="admin-sidebar-btn-icon">👑</span>
          <div class="admin-sidebar-btn-texts">
            <span class="admin-sidebar-btn-title">DİVAN PAŞALARI</span>
            <span class="admin-sidebar-btn-sub">${(db.advisors||[]).length} Danışman & Vezir</span>
          </div>
        </button>

        <button id="admin-sb-ozel" class="admin-sidebar-btn ${currentAdminTab==='ozel'?'active':''}" onclick="switchAdminSidebarTab('ozel')">
          <span class="admin-sidebar-btn-icon">🌟</span>
          <div class="admin-sidebar-btn-texts">
            <span class="admin-sidebar-btn-title">ÖZEL BİRİMLER</span>
            <span class="admin-sidebar-btn-sub">Devlet birlikleri & strateji</span>
          </div>
        </button>

        <button id="admin-sb-gorsel" class="admin-sidebar-btn ${currentAdminTab==='gorsel'?'active':''}" onclick="switchAdminSidebarTab('gorsel')">
          <span class="admin-sidebar-btn-icon">🖼️</span>
          <div class="admin-sidebar-btn-texts">
            <span class="admin-sidebar-btn-title">GÖRSELLER & SİSTEM</span>
            <span class="admin-sidebar-btn-sub">Birim resimleri & istihbarat</span>
          </div>
        </button>
      </div>

      <!-- SAĞ İÇERİK ALANI -->
      <div class="admin-main-panel">
        
        <!-- 1. MALİYE & VERGİ TABI -->
        <div id="admin-pane-maliye" class="admin-tab-content-panel ${currentAdminTab==='maliye'?'active':''}">
          <div class="admin-card">
            <div class="admin-card-header">
              <span class="admin-card-title">💰 SADE MALİYE VE VERGİ KONTROL MERKEZİ</span>
              <span class="badge" style="color:var(--green); border-color:var(--green);">✨ Sadeleştirilmiş Vergi v3.0</span>
            </div>
            <p class="sub" style="margin-bottom:12px; line-height:1.5;">
              Vatandaşların yıllık ödeyeceği vergi miktarı, devletin belirlediği vergi oranı (%20, %25 vb.) ve temel vergi tabanına göre otomatik hesaplanır. Formül: <code>Nüfus × Vergi Oranı (%) × Kişi Başı Temel Vergi</code>.
            </p>
            
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:14px; margin-bottom:14px;">
              <div style="background:#181c25; padding:12px; border-radius:4px; border:1px solid rgba(197, 160, 89, 0.3);">
                <label style="color:var(--gold); font-weight:bold; margin-bottom:4px;">📊 CANLI VERGİ GELİRİ PROJEKSİYONU</label>
                <div style="font-size:12px; margin-top:8px; display:flex; flex-direction:column; gap:6px;">
                  <div style="display:flex; justify-content:space-between; background:#101319; padding:6px 8px; border-radius:3px;">
                    <span style="color:#94a3b8;">100.000 Kişilik Beylik:</span>
                    <b id="prev_100k" style="color:#f0cf82;">~20.000 TL / yıl (%20 Vergi)</b>
                  </div>
                  <div style="display:flex; justify-content:space-between; background:#101319; padding:6px 8px; border-radius:3px;">
                    <span style="color:#94a3b8;">1.000.000 Kişilik Devlet:</span>
                    <b id="prev_1m" style="color:#f0cf82;">~200.000 TL / yıl (%20 Vergi)</b>
                  </div>
                  <div style="display:flex; justify-content:space-between; background:#101319; padding:6px 8px; border-radius:3px; border:1px solid rgba(197,160,89,0.3);">
                    <span style="color:#e2e8f0; font-weight:bold;">15 Milyonluk Cihan Devleti:</span>
                    <b id="prev_15m" style="color:var(--green); font-weight:bold;">~4.700.000 TL / yıl (%25 Vergi)</b>
                  </div>
                </div>
                <p class="sub" style="font-size:11px; margin-top:8px; color:#94a3b8;">
                  💡 <i>15 Milyonluk bir imparatorluk yılda ~4.7 Milyon TL kazanır, 1.5 Milyon orduya ~3.5 Milyon TL öder, hazineye ~1.2 Milyon TL kâr kalır.</i>
                </p>
              </div>

              <div style="background:#181c25; padding:12px; border-radius:4px; border:1px solid rgba(52, 152, 219, 0.3);">
                <label style="color:var(--blue); font-weight:bold; margin-bottom:4px;">🎓 MEDRESE & EĞİTİMLİ SINIF AYARLARI</label>
                <div class="formgrid" style="margin-top:6px;">
                  ${field("school_capacity","Okul Başına Kapasite (Kişi)",db.settings.schoolCapacityPerBuilding||500,"number")}
                  ${field("school_upkeep","Okul Başı Yıllık Gider (TL)",db.settings.schoolUpkeep||0,"number")}
                  <div class="full">
                    ${field("educated_tax_multiplier","Eğitimli Nüfus Vergi Çarpanı",db.settings.educatedTaxMultiplier??1.5,"number")}
                    <p class="sub" style="font-size:11px; color:#38bdf8; margin:4px 0 0;">
                      ✓ Eğitimli vatandaşlar normal halkın katı kadar (Örn: 1.5x) vergi öder. Eski Eğitim % kaldırılmıştır.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- HALK FERMANLARI HARCAMALARI -->
          <div class="admin-card">
            <div class="admin-card-header">
              <span class="admin-card-title">📜 HALK FERMANI HARCAMALARI (Kişi Başı TL)</span>
              <span class="sub">Hükümdar ferman ilan ettiğinde nüfus başına hazineden kesilecek miktar.</span>
            </div>
            <div class="formgrid">
              ${Object.keys(ec).map(k=>field("ec_"+k, edictLabels[k] || k, ec[k], "number")).join("")}
            </div>
          </div>
        </div>

        <!-- 2. ASKERİYE & DONANMA TABI -->
        <div id="admin-pane-askeriye" class="admin-tab-content-panel ${currentAdminTab==='askeriye'?'active':''}">
          <!-- KARA BİRLİKLERİ -->
          <div class="admin-card">
            <div class="admin-card-header">
              <span class="admin-card-title">⚔️ KARA BİRLİKLERİ (FİYAT, BAKIM & İKMAL)</span>
            </div>
            <div class="formgrid">
              ${field("p_piyade", "Piyade Satın Alma", p.piyade||21, "number")}
              ${field("u_piyade", "Piyade Yıllık Bakım", u.piyade||35, "number")}
              ${field("cc_piyade", "Piyade Sefer İkmali", cc.piyade||2, "number")}
              
              ${field("p_suvari", "Süvari Satın Alma", p.suvari||40, "number")}
              ${field("u_suvari", "Süvari Yıllık Bakım", u.suvari||55, "number")}
              ${field("cc_suvari", "Süvari Sefer İkmali", cc.suvari||5, "number")}

              ${field("p_nisanci", "Nişancı Satın Alma", p.nisanci||30, "number")}
              ${field("u_nisanci", "Nişancı Yıllık Bakım", u.nisanci||45, "number")}
              ${field("cc_nisanci", "Nişancı Sefer İkmali", cc.nisanci||3, "number")}
            </div>
          </div>

          <!-- TOPÇULAR VE DÖKÜMHANELER -->
          <div class="admin-card">
            <div class="admin-card-header">
              <span class="admin-card-title">💣 TOPÇULAR & TOP OCAKLARI (DÖKÜMHANELER)</span>
            </div>
            <div class="formgrid">
              <div class="full" style="color:var(--border-gold); font-size:12px; font-weight:bold; border-bottom:1px solid rgba(197,160,89,0.2); padding-bottom:4px; margin-top:4px;">TOP BİRLİKLERİ (FİYAT, BAKIM, İKMAL):</div>
              ${field("p_kucuk_top", "Küçük Top Fiyatı", p.kucuk_top||10000, "number")}
              ${field("u_kucuk_top", "Küçük Top Bakımı", u.kucuk_top||7500, "number")}
              ${field("cc_kucuk_top", "Küçük Top İkmal", cc.kucuk_top||200, "number")}

              ${field("p_orta_top", "Orta Top Fiyatı", p.orta_top||25000, "number")}
              ${field("u_orta_top", "Orta Top Bakımı", u.orta_top||15000, "number")}
              ${field("cc_orta_top", "Orta Top İkmal", cc.orta_top||500, "number")}

              ${field("p_buyuk_top", "Büyük Top (Şahi) Fiyatı", p.buyuk_top||45000, "number")}
              ${field("u_buyuk_top", "Büyük Top Bakımı", u.buyuk_top||25000, "number")}
              ${field("cc_buyuk_top", "Büyük Top İkmal", cc.buyuk_top||1000, "number")}

              <div class="full" style="color:var(--border-gold); font-size:12px; font-weight:bold; border-bottom:1px solid rgba(197,160,89,0.2); padding-bottom:4px; margin-top:10px;">TOP OCAKLARI / DÖKÜMHANE BİNALARI (FİYAT, KAPASİTE, BAKIM):</div>
              ${field("p_kucuk_ocak", "Küçük Ocak Fiyatı", p.kucuk_ocak||80000, "number")}
              ${field("c_kucuk_ocak", "Küçük Ocak Kapasitesi", c.kucuk_ocak||10, "number")}
              ${field("iu_kucuk_ocak", "Küçük Ocak Yıllık Bakımı", iu.kucuk_ocak||0, "number")}

              ${field("p_orta_ocak", "Orta Ocak Fiyatı", p.orta_ocak||150000, "number")}
              ${field("c_orta_ocak", "Orta Ocak Kapasitesi", c.orta_ocak||20, "number")}
              ${field("iu_orta_ocak", "Orta Ocak Yıllık Bakımı", iu.orta_ocak||0, "number")}

              ${field("p_buyuk_ocak", "Büyük Ocak Fiyatı", p.buyuk_ocak||250000, "number")}
              ${field("c_buyuk_ocak", "Büyük Ocak Kapasitesi", c.buyuk_ocak||35, "number")}
              ${field("iu_buyuk_ocak", "Büyük Ocak Yıllık Bakımı", iu.buyuk_ocak||0, "number")}
            </div>
          </div>

          <!-- DONANMA VE TERSANELER -->
          <div class="admin-card">
            <div class="admin-card-header">
              <span class="admin-card-title">⛵ DONANMA GEMİLERİ & TERSANELER (LİMANLAR)</span>
            </div>
            <div class="formgrid">
              <div class="full" style="color:var(--border-gold); font-size:12px; font-weight:bold; border-bottom:1px solid rgba(197,160,89,0.2); padding-bottom:4px; margin-top:4px;">GEMİ BİRLİKLERİ (FİYAT, BAKIM, İKMAL):</div>
              ${field("p_kucuk_gemi", "Küçük Gemi Fiyatı", p.kucuk_gemi||65000, "number")}
              ${field("u_kucuk_gemi", "Küçük Gemi Bakımı", u.kucuk_gemi||20000, "number")}
              ${field("cc_kucuk_gemi", "Küçük Gemi İkmal", cc.kucuk_gemi||0, "number")}

              ${field("p_orta_gemi", "Orta Gemi Fiyatı", p.orta_gemi||95000, "number")}
              ${field("u_orta_gemi", "Orta Gemi Bakımı", u.orta_gemi||35000, "number")}
              ${field("cc_orta_gemi", "Orta Gemi İkmal", cc.orta_gemi||0, "number")}

              ${field("p_buyuk_gemi", "Büyük Gemi Fiyatı", p.buyuk_gemi||130000, "number")}
              ${field("u_buyuk_gemi", "Büyük Gemi Bakımı", u.buyuk_gemi||50000, "number")}
              ${field("cc_buyuk_gemi", "Büyük Gemi İkmal", cc.buyuk_gemi||0, "number")}

              <div class="full" style="color:var(--border-gold); font-size:12px; font-weight:bold; border-bottom:1px solid rgba(197,160,89,0.2); padding-bottom:4px; margin-top:10px;">TERSANE / LİMAN BİNALARI (FİYAT, KAPASİTE, BAKIM):</div>
              ${field("p_kucuk_liman", "Küçük Liman Fiyatı", p.kucuk_liman||100000, "number")}
              ${field("c_kucuk_liman", "Küçük Liman Kapasitesi", c.kucuk_liman||5, "number")}
              ${field("iu_kucuk_liman", "Küçük Liman Yıllık Bakımı", iu.kucuk_liman||0, "number")}

              ${field("p_orta_liman", "Orta Liman Fiyatı", p.orta_liman||180000, "number")}
              ${field("c_orta_liman", "Orta Liman Kapasitesi", c.orta_liman||7, "number")}
              ${field("iu_orta_liman", "Orta Liman Yıllık Bakımı", iu.orta_liman||0, "number")}

              ${field("p_buyuk_liman", "Büyük Liman Fiyatı", p.buyuk_liman||300000, "number")}
              ${field("c_buyuk_liman", "Büyük Liman Kapasitesi", c.buyuk_liman||10, "number")}
              ${field("iu_buyuk_liman", "Büyük Liman Yıllık Bakımı", iu.buyuk_liman||0, "number")}
            </div>
          </div>

          <!-- GARNİZON & ALTYAPI BİNALARI -->
          <div class="admin-card">
            <div class="admin-card-header">
              <span class="admin-card-title">🛡️ GARNİZON VE ALTYAPI BİNALARI</span>
            </div>
            <div class="formgrid">
              ${field("gu_fortress", "Kale Garnizonu Asker Başı / Yıl", gu.fortress||8, "number")}
              ${field("p_okul", "Okul / Medrese İnşa Fiyatı", p.okul||120000, "number")}
              ${field("p_istihbarat_binasi", "İstihbarat Dairesi İnşa Fiyatı", p.istihbarat_binasi||200000, "number")}
              ${field("iu_istihbarat_binasi", "İstihbarat Dairesi Yıllık Bakımı", iu.istihbarat_binasi||0, "number")}
              ${iu.okul !== undefined ? field("iu_okul", "Okul Yıllık Bakımı", iu.okul, "number") : ''}
              ${extraPricesHtml}
              ${extraUpkeepHtml}
              <div class="full" style="margin-top:10px;"><b style="color:var(--border-gold); font-size:11px;">SEFER & İKMAL GİDERLERİ:</b></div>
              ${Object.keys(cc).map(k=>field("cc_"+k, k + " Sefer İkmal", cc[k], "number")).join("")}
            </div>
          </div>
        </div>

        <!-- 3. NÜFUS & ŞEHİR BİNALARI TABI -->
        <div id="admin-pane-nufus" class="admin-tab-content-panel ${currentAdminTab==='nufus'?'active':''}">
          <!-- SAĞLIK SİSTEMİ & ŞİFAHANE -->
          <div class="admin-card">
            <div class="admin-card-header">
              <span class="admin-card-title">🏥 NÜFUS SAĞLIK & ŞİFAHANE SİSTEMİ</span>
              <span class="badge" style="color:var(--green); border-color:var(--green);">Salgın Direnci & Doğal Ömür</span>
            </div>
            <p class="sub" style="margin-bottom:12px;">Şifahaneler nüfusun salgın hastalıklardan kırılmasını önler ve doğal ecel oranını düşürür.</p>
            <div class="formgrid">
              ${field("hospital_capacity", "Şifahane Başına Sağlık Kapasitesi (Kişi)", db.settings.hospitalCapacityPerBuilding||60000, "number")}
              ${field("hospital_base_cost", "Şifahane Taban İnşaat Bedeli (TL)", db.settings.hospitalBaseCost||35000, "number")}
              ${field("pg_hastane", "Şifahane Nüfus Artış Oranı (%)", pg.hastane||0.5, "number")}
              ${field("pbu_hastane", "Şifahane Yıllık Gideri (Bina Başı)", pbu.hastane||0, "number")}
              ${field("pc_hastane", "Şifahane Kişi Başı İnşaat Maliyeti (TL)", pc.hastane||0.10, "number")}
            </div>
          </div>

          <!-- NÜFUS ARTIŞI ORANLARI -->
          <div class="admin-card">
            <div class="admin-card-header">
              <span class="admin-card-title">🌾 NÜFUS BİNALARI DOĞAL ARTIŞ ORANLARI (%)</span>
            </div>
            <div class="formgrid">
              ${field("pg_asevi", "Aşevi Nüfus Artışı (%)", pg.asevi||0.4, "number")}
              ${field("pg_su_degirmeni", "Su Değirmeni Nüfus Artışı (%)", pg.su_degirmeni||0.6, "number")}
              ${field("pg_kervansaray", "Kervansaray Nüfus Artışı (%)", pg.kervansaray||0.3, "number")}
              ${field("pg_pazar", "Pazar Nüfus Artışı (%)", pg.pazar||0.4, "number")}
            </div>
          </div>

          <!-- NÜFUS BİNALARI YILLIK GİDERLERİ -->
          <div class="admin-card">
            <div class="admin-card-header">
              <span class="admin-card-title">💸 NÜFUS BİNALARI YILLIK BAKIM GİDERLERİ (Bina Başı)</span>
            </div>
            <div class="formgrid">
              ${field("pbu_asevi", "Aşevi Yıllık Gideri", pbu.asevi||0, "number")}
              ${field("pbu_su_degirmeni", "Su Değirmeni Yıllık Gideri", pbu.su_degirmeni||0, "number")}
              ${field("pbu_kervansaray", "Kervansaray Yıllık Gideri", pbu.kervansaray||0, "number")}
              ${field("pbu_pazar", "Pazar Yıllık Gideri", pbu.pazar||0, "number")}
            </div>
          </div>

          <!-- NÜFUSA GÖRE BİNA MALİYETİ -->
          <div class="admin-card">
            <div class="admin-card-header">
              <span class="admin-card-title">🧱 NÜFUSA GÖRE BİNA İNŞAAT MALİYETİ (Kişi Başı TL)</span>
              <span class="sub">Bina Fiyatı = Devlet Nüfusu × Kişi Başı Maliyet</span>
            </div>
            <div class="formgrid">
              ${field("pc_asevi", "Aşevi Kişi Başı Maliyet", pc.asevi||0.05, "number")}
              ${field("pc_su_degirmeni", "Su Değirmeni Kişi Başı Maliyet", pc.su_degirmeni||0.08, "number")}
              ${field("pc_kervansaray", "Kervansaray Kişi Başı Maliyet", pc.kervansaray||0.12, "number")}
              ${field("pc_pazar", "Pazar Kişi Başı Maliyet", pc.pazar||0.10, "number")}
            </div>
          </div>
        </div>

        <!-- 4. DİVAN PAŞALARI TABI -->
        <div id="admin-pane-divan" class="admin-tab-content-panel ${currentAdminTab==='divan'?'active':''}">
          <div class="admin-card">
            <div class="admin-card-header">
              <span class="admin-card-title">👑 DİVAN PAŞALARI VE DANIŞMANLAR (${(db.advisors||[]).length} Paşa)</span>
            </div>
            <p class="sub" style="margin-bottom:12px;">Paşaların görev sürelerini, maaşlarını ve özelliklerini düzenleyin veya yeni paşa atayın.</p>
            <div style="max-height:280px; overflow-y:auto; margin-bottom:16px; padding-right:4px;">
              ${advisorsHtml || "<p class='sub' style='padding:10px;'>Henüz kayıtlı paşa bulunmamaktadır.</p>"}
            </div>
          </div>

          <div class="admin-card">
            <div class="admin-card-header">
              <span class="admin-card-title">➕ YENİ PAŞA / DANIŞMAN EKLE</span>
            </div>
            <div class="formgrid">
              ${field("adv_new_name", "Paşa İsmi", "", "text")}
              ${field("adv_new_role", "Unvanı / Rolü", "", "text")}
              <div><label>Yıldız Seviyesi</label><select id="f_adv_new_stars"><option value="1">1 Yıldız (★)</option><option value="2">2 Yıldız (★★)</option><option value="3" selected>3 Yıldız (★★★)</option><option value="4">4 Yıldız (★★★★)</option><option value="5">5 Yıldız (★★★★★)</option></select></div>
              <div><label>Hangi Devlete Özel?</label><select id="f_adv_new_faction">${stateOpts}</select></div>
              ${field("adv_new_salary", "Yıllık Maaş (TL)", "25000", "number")}
              ${field("adv_new_ageYears", "Başlangıç Yaşı (Yıl)", "1", "number")}
              ${field("adv_new_maxAge", "Maksimum / Ölüm Yaşı (Yıl)", "70", "number")}
              ${field("adv_new_icon", "Resim URL (İsteğe Bağlı)", "", "text")}

              <div class="full" style="color:var(--gold); font-size:11px; font-weight:bold; margin-top:8px; border-bottom:1px solid rgba(197,160,89,0.2); padding-bottom:4px;">MATEMATİKSEL ETKİLER & ÇARPANLAR:</div>
              ${field("adv_new_taxBonus", "Vergi Geliri Etkisi (+/- %)", "0", "number")}
              ${field("adv_new_milUpkeepDiscount", "Ordu Bakım İndirimi (%)", "0", "number")}
              ${field("adv_new_navyUpkeepDiscount", "Donanma Bakım İndirimi (%)", "0", "number")}
              ${field("adv_new_artUpkeepDiscount", "Topçu Bakım İndirimi (%)", "0", "number")}
              ${field("adv_new_recruitDiscount", "Asker Alım İndirimi (%)", "0", "number")}
              ${field("adv_new_infraDiscount", "Bina Yapım İndirimi (%)", "0", "number")}
              ${field("adv_new_happinessBonus", "Mutluluk Bonusu (+/- Puan)", "0", "number")}
              <div><label>İsyan / Anarşiyi Sıfırla?</label><select id="f_adv_new_stopAnarchy"><option value="false">Hayır</option><option value="true">Evet (%0 Yapar)</option></select></div>
              <div class="full"><label>Casusluk Sapmasını Sıfırla (Net Bilgi)?</label><select id="f_adv_new_spyAccuracyBonus"><option value="false">Hayır</option><option value="true">Evet (Tam Kesin Veri)</option></select></div>

              <div class="full">${field("adv_new_buff", "Artı Açıklaması (Görsel Metin)", "", "text")}</div>
              <div class="full">${field("adv_new_debuff", "Eksi Açıklaması (Görsel Metin)", "", "text")}</div>
              <div class="full actions" style="margin-top:10px;"><button class="btn green" style="width:100%; font-weight:bold;" onclick="addNewAdvisor()">➕ PAŞAYI KAYDET</button></div>
            </div>
          </div>
        </div>

        <!-- 5. ÖZEL BİRİMLER & STRATEJİ TABI -->
        <div id="admin-pane-ozel" class="admin-tab-content-panel ${currentAdminTab==='ozel'?'active':''}">
          <div class="admin-card">
            <div class="admin-card-header">
              <span class="admin-card-title">⭐ DEĞERLİ VE STRATEJİK BÖLGELER</span>
            </div>
            <p class="sub" style="margin-bottom:10px;">Haritadaki önemli vilayetleri işaretleyin. Oyuncular bu bölgelere tıkladığında özel simgeler ve garnizon bilgisi görünür.</p>
            <button class="btn gold" style="width:100%; font-weight:bold;" onclick="document.querySelector('.modalbox')?.classList.remove('admin-modal-wide'); openStrategicRegionAdmin();">⭐ STRATEJİK BÖLGELERİ YÖNET</button>
          </div>

          <div class="admin-card">
            <div class="admin-card-header">
              <span class="admin-card-title">🌟 DEVLETLERE ÖZEL BİRİMLER & BİNALAR</span>
            </div>
            <div style="max-height:220px; overflow-y:auto; margin-bottom:14px; padding-right:4px;">
              ${customHtml || "<p class='sub' style='padding:10px;'>Kayıtlı özel birim veya bina bulunmamaktadır.</p>"}
            </div>
          </div>

          <div class="admin-card">
            <div class="admin-card-header">
              <span class="admin-card-title">➕ YENİ ÖZEL BİRİM / BİNA EKLE</span>
            </div>
            <div class="formgrid">
              ${field("ci_name", "Birim Adı", "", "text")}
              <div class="full"><label>Hangi Devlete Özel?</label><select id="f_ci_faction">${stateOpts}</select></div>
              <div><label>Kategori</label><select id="f_ci_cat"><option value="asker">Askeri Birlik</option><option value="altyapi">Altyapı / Bina</option></select></div>
              ${field("ci_icon", "Resim URL (Doğrudan Link)", "", "text")}
              ${field("ci_price", "Satın Alma Fiyatı (TL)", "0", "number")}
              ${field("ci_upkeep", "Yıllık Bakım Gideri (TL)", "0", "number")}
              ${field("ci_campCost", "Sefer İkmal Maliyeti", "0", "number")}
              <div class="full actions" style="margin-top:10px;"><button class="btn green" style="width:100%; font-weight:bold;" onclick="addCustomItem()">➕ BİRİMİ KAYDET</button></div>
            </div>
          </div>
        </div>

        <!-- 6. GÖRSELLER & SİSTEM TABI -->
        <div id="admin-pane-gorsel" class="admin-tab-content-panel ${currentAdminTab==='gorsel'?'active':''}">
          <div class="admin-card">
            <div class="admin-card-header">
              <span class="admin-card-title">🗺️ HARİTA İSTİHBARATI</span>
            </div>
            <div class="formgrid">
              ${field("map_intel_cost", "İstihbaratsız Oyuncu Rapor Ücreti (TL)", db.settings.mapIntelReportCost||0, "number")}
            </div>
          </div>

          <div class="admin-card">
            <div class="admin-card-header">
              <span class="admin-card-title">🖼️ BİRLİK & BİNA RESİM URL'LERİ</span>
              <span class="sub">Tüm askeri birlik ve sivil binaların kart görselleri.</span>
            </div>
            <div class="formgrid">
              ${Object.keys(imgLabels).map(k => field("img_" + k, imgLabels[k], img[k]||"", "text")).join("")}
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- ALT BUTON VE DURUM BARI -->
    <div class="admin-footer">
      <span class="sub" style="color:#94a3b8;">💡 Değişikliklerin kaydedilmesi için <b>TÜMÜNÜ KAYDET</b> butonuna basınız.</span>
      <div style="display:flex; gap:10px;">
        <button class="btn" onclick="closeAdminModal()">İPTAL</button>
        <button class="btn green" style="padding:8px 24px; font-weight:bold;" onclick="saveAdmin(true)">💾 TÜMÜNÜ KAYDET</button>
      </div>
    </div>
    `);

    const mb = document.querySelector('.modalbox');
    if(mb) mb.classList.add('admin-modal-wide');
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
   const name = document.getElementById("f_ci_name").value.trim(), cat = document.getElementById("f_ci_cat").value, faction = document.getElementById("f_ci_faction").value;
   const price = Number(document.getElementById("f_ci_price").value)||0, upkeep = Number(document.getElementById("f_ci_upkeep").value)||0, campCost = Number(document.getElementById("f_ci_campCost").value)||0, icon = cleanUrl(document.getElementById("f_ci_icon").value);
   if(!name){alert("İsim gerekli!"); return;}
   const id = "c_" + crypto.randomUUID().split("-")[0];
   db.settings.customItems = db.settings.customItems || [];
   db.settings.customItems.push({id, name, category: cat, price, upkeep, campCost, icon, faction});
   saveAdmin(false);
}
function removeCustomItem(id){
   if(!confirm("Emin misiniz?")) return;
   db.settings.customItems = db.settings.customItems.filter(x => x.id !== id);
   saveAdmin(false);
}
function saveAdmin(doClose = true){
 const mapIntelCostEl=document.getElementById("f_map_intel_cost"); if(mapIntelCostEl)db.settings.mapIntelReportCost=Math.max(0,Number(mapIntelCostEl.value)||0);
 const schoolCapacityEl=document.getElementById("f_school_capacity"); if(schoolCapacityEl)db.settings.schoolCapacityPerBuilding=Math.max(0,Math.floor(Number(schoolCapacityEl.value)||0));
 const schoolUpkeepEl=document.getElementById("f_school_upkeep"); if(schoolUpkeepEl)db.settings.schoolUpkeep=Math.max(0,Number(schoolUpkeepEl.value)||0);
 const educatedMultiplierEl=document.getElementById("f_educated_tax_multiplier"); if(educatedMultiplierEl)db.settings.educatedTaxMultiplier=Math.max(0,Number(educatedMultiplierEl.value)||0);
 const hospCapEl=document.getElementById("f_hospital_capacity"); if(hospCapEl)db.settings.hospitalCapacityPerBuilding=Math.max(1,Math.floor(Number(hospCapEl.value)||60000));
 const hospBaseEl=document.getElementById("f_hospital_base_cost"); if(hospBaseEl)db.settings.hospitalBaseCost=Math.max(0,Math.floor(Number(hospBaseEl.value)||35000));
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
