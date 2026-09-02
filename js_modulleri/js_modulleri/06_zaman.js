// Ne işe yarar: 3 saatlik sayacı yönetir, yılları atlatır ve paşaların yaşlandırılmasını sağlar.

function startGlobalClock() {
    if(globalClockInterval) clearInterval(globalClockInterval);
    globalClockInterval = setInterval(() => {
        if(db.timerRunning) {
            db.timerSeconds = (db.timerSeconds || 0) + 1;
            if(db.timerSeconds >= 10800) {
                db.timerRunning = false;
                toast("⚠️ 3 Saatlik Süre Doldu! Yıl geçişi onay bekliyor.", false);
            }
            updateAdminTimerUI();
            queueSave();
        }
    }, 1000);
}

function updateAdminTimerUI() {
    const box = document.getElementById("adminTimerDisplay");
    if(!box) return;
    const hrs = Math.floor(db.timerSeconds / 3600);
    const mins = Math.floor((db.timerSeconds % 3600) / 60);
    const secs = db.timerSeconds % 60;
    const timeStr = `${String(hrs).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
    
    box.innerHTML = `
        <div class="admin-timer-box">
            <span>⏱️ Süre: <b>${timeStr}</b> / 03:00:00</span>
            <button class="btn small ${db.timerRunning?'red':'green'}" onclick="toggleTimer()">${db.timerRunning?'DURDUR':'BAŞLAT'}</button>
            <button class="btn small gold" onclick="resetTimer()">SIFIRLA</button>
            ${db.timerSeconds >= 10800 ? '<button class="btn green small" onclick="passOneYear()">YILI GEÇİR</button>' : ''}
        </div>
    `;
}

function toggleTimer() {
    db.timerRunning = !db.timerRunning;
    queueSave();
    updateAdminTimerUI();
}

function resetTimer() {
    if(!confirm("Sayacı sıfırlamak istediğinize emin misiniz?")) return;
    db.timerSeconds = 0;
    db.timerRunning = false;
    queueSave();
    updateAdminTimerUI();
}

function passOneYear(){
    if(!isAdmin) return;
    if(!confirm("⏳ Tüm devletler için 1 tam yıl geçirilecek.\n\nVergiler toplanacak, paşalar yaşlanacak ve gelişim gösterecek. Onaylıyor musunuz?")) return;
    
    db.timerSeconds = 0;
    db.timerRunning = false;
    db.gameYear = (Number(db.gameYear) || 1453) + 1;
    
    db.settings.lastYearReport = { year: db.gameYear, states: {} };
    
    db.states.forEach(s => {
        let rpt = { name: s.name, events: [], rebellions: [], debts: [], advisors: [] };
        
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
        
        s.debtYears=Math.max(0,Math.floor(Number(s.debtYears)||0));
        if(Number(s.treasury||0)<0){
            s.debtYears++;
            const interest=Math.ceil(Math.abs(Number(s.treasury||0))*0.013);
            s.treasury-=interest;
            rpt.debts.push(`${s.debtYears}. borç yılı, %1,3 faiz: -${money(interest)}`);
            if(s.debtYears>=3)s.happiness=Math.max(0,Number(s.happiness||0)-5);
        }else s.debtYears=0;
        
        let totalGrowthPercent = 0;
        ["hastane", "asevi", "su_degirmeni", "kervansaray", "pazar"].forEach(key => {
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
          
            s.population = newPop + extraPeople;
            rpt.events.push(`Binalardan +${num(extraPeople)} Nüfus`);
        }
        
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
                }
            }
        }
        
        const generated = createYearEventsForState(s);
        db.pendingEvents.push(...generated);
        if(generated.length) rpt.events.push(`Yeni Yıl: Karar bekleyen ${generated.length} adet olay var.`);
        
        db.settings.lastYearReport.states[s.id] = rpt;
    });
    
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
            
            if(adv.ageYears >= adv.maxAge) {
                rpt.advisors.push(`⚠️ <b>${adv.name}</b> yaşlılıktan vefat etti. (Yerine orijinal hali atandı)`);
                delete s.advisorHiredYears[advId];
                
                db.advisors = (db.advisors || []).filter(x => x.id !== advId); 
                
                let original = (typeof DEFAULT_45_ADVISORS !== 'undefined' ? DEFAULT_45_ADVISORS.find(x => x.id === advId) : null);
                if(original) {
                    db.advisors.push(structuredClone(original)); 
                }
            } else {
                survivingHired.push(advId);
                rpt.advisors.push(`👤 ${adv.name} (Yaş: ${adv.ageYears}) ${adv.lastUpgradeMsg ? `<b style="color:var(--green)">${adv.lastUpgradeMsg}</b>` : ''}`);
            }
        });
        s.hiredAdvisors = survivingHired;
    });
    
    queueMapSave();
    if(currentId) openDetail(currentId); else renderHome();
    showYearReportModal();
}

function showYearReportModal() {
    const yr = db.settings.lastYearReport;
    if(!yr) return;
 
    localStorage.setItem('lastSeenYearReport', yr.year);
 
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
    
    html += "</div></div><div class='actions' style='margin-top:12px;'><button class='btn blue' style='width:100%;' onclick='closeModal(); if(currentId) openDetail(currentId); else renderHome();'>KAPAT</button></div>";
    modal(html);
}