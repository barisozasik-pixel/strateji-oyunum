function buyBulk(id,key, labelName)
{
   const s=getState(id);
 if(!s) return;
 if(!isAdmin && s.ownerEmail !== currentUserEmail) return; 
 if(rejectDebtPurchase(s))return;
 
 const isBuilding = (typeof BUILDING_CONSTRUCTION_CONFIG !== 'undefined') && (key in BUILDING_CONSTRUCTION_CONFIG);
 const buildYears = isBuilding ? BUILDING_CONSTRUCTION_CONFIG[key].years : 0;

 const qty = Math.floor(Number(document.getElementById(`qty_${id}_${key}`)?.value)) || 0;
 if(qty <= 0) { alert("⛔ Hata: Sıfır veya eksi bir değer giremezsiniz!"); return; } // EKSİ SAYI KORUMASI
 
 // OKUL İÇİN TOPRAK KOTASI KONTROLÜ (Mevcut + Yapımdakiler)
 if(key === "okul") {
     const ownedCount = getOwnedMapProvinceIds(id).length;
     const status = typeof getBuildingStatus === 'function' ? getBuildingStatus(s, key) : { total: s[key] || 0, currentCount: s[key] || 0, inProgress: 0 };
     if((status.total + qty) > ownedCount) {
         alert(`⛔ KOTA DOLU: Haritadaki toprak sayınız kadar (${ownedCount} adet) Okul inşa edebilirsiniz! (Mevcut: ${status.currentCount}, Yapımda: ${status.inProgress})`);
         return;
     }
 }
 
  let basePrice=db.settings.prices[key]||0;
  if (key === 'okul' && s) {
      const ownedCount = typeof getOwnedMapProvinceIds === 'function' ? Math.max(1, getOwnedMapProvinceIds(id).length) : 1;
      const popPerProv = Math.round((Number(s.population) || 0) / ownedCount);
      const schoolBase = Number(db?.settings?.schoolBaseCost || db?.settings?.prices?.okul) || 100000;
      const schoolPopMult = Number(db?.settings?.schoolCostPerPerson) || 0.15;
      basePrice = Math.max(schoolBase, Math.round(schoolBase + (popPerProv * schoolPopMult)));
  }
 const adv = getAdvisorEffects(s);
 const disc = key.includes("liman") || key.includes("ocak") || key === "okul" || key === "istihbarat_binasi" ? adv.infraDiscount : adv.recruitDiscount;
 const baseUnitPrice = Math.max(1, Math.round(basePrice * (1 - (disc / 100))));
 
 const calc = typeof calculateBuildingCost === 'function'
   ? calculateBuildingCost(s, key, baseUnitPrice, qty)
   : { totalCost: baseUnitPrice * qty };
 const totalCost = calc.totalCost;

 if(s.treasury<totalCost){alert(`Hazine yetersiz! Toplam maliyet: ${money(totalCost)}`);return}
 const p = calcPop(s);
 if(["piyade","suvari","nisanci"].includes(key) && p.elig < qty){alert("Elverişli nüfus yetersiz!");return}
  if(key.includes("liman")){
    const coastalCount = typeof getOwnedCoastalProvinceCount === 'function' ? getOwnedCoastalProvinceCount(id) : 0;
    if(coastalCount <= 0){
      alert("⛔ KARAYA KİLİTLİ DEVLET: Denize kıyısı olan bir toprağa sahip olmadan tersane/liman inşa edemezsiniz!");
      return;
    }
    const portStatus = typeof getTotalPortCount === 'function' ? getTotalPortCount(s) : { total: (s.kucuk_liman||0)+(s.orta_liman||0)+(s.buyuk_liman||0) };
    if((portStatus.total + qty) > coastalCount){
      alert(`⛔ KIYI KOTASI DOLU: Haritada ${coastalCount} adet deniz toprağınız var. En fazla ${coastalCount} adet Liman inşa edebilirsiniz! (Mevcut: ${portStatus.current || 0}, Yapımda: ${portStatus.inQueue || 0})`);
      return;
    }
  }
  if(key.includes("gemi")){
    if(typeof stateHasSeaAccess === 'function' && !stateHasSeaAccess(id)){
      alert("⛔ KARAYA KİLİTLİ DEVLET: Denize kıyısı olan bir toprağa sahip olmadan savaş gemisi inşa edemezsiniz!");
      return;
    }
  }
 if(key.includes("gemi") && (shipCapacity(s) + qty) > shipCapMax(s)){alert("Limanda boş kapasite yok.");return}
 if(key.includes("top") && (gunCapacity(s) + qty) > gunCapMax(s)){alert("Top ocağında boş kapasite yok.");return}
 
 const oldT = s.treasury;
 const oldUnitCount = s[key] || 0;
 s.treasury -= totalCost; 

 if (isBuilding) {
   s.constructionQueue = s.constructionQueue || [];
   s.constructionQueue.push({
     key: key,
     label: labelName,
     qty: qty,
     remainingYears: buildYears,
     yearStarted: db.gameYear || 1453
   });
   addLog({
       stateId: s.id,
       stateName: s.name,
       action: `İnşaat Başlatıldı: ${labelName} x${qty} (${buildYears} Yıl)`,
       cost: totalCost,
       qty: qty,
       oldTreasury: oldT,
       newTreasury: s.treasury,
       unitName: labelName,
       oldUnit: oldUnitCount,
       newUnit: oldUnitCount
   });
   queueSave();
   openDetail(id);
   toast(`${labelName} inşası başlatıldı (${qty} adet). ${buildYears} yıl sonra tamamlanacak.`, true);
 } else {
   s[key] = oldUnitCount + qty;
   addLog({
       stateId: s.id,
       stateName: s.name,
       action: `Birim Üretimi: ${labelName}`,
       cost: totalCost,
       qty: qty,
       oldTreasury: oldT,
       newTreasury: s.treasury,
       unitName: labelName,
       oldUnit: oldUnitCount,
       newUnit: s[key]
   });
   queueSave();
   openDetail(id);
 }
}

function buyCustomBulk(id, itemId, labelName){
 const s = getState(id);
 if(!isAdmin && s.ownerEmail !== currentUserEmail) return; 
 if(rejectDebtPurchase(s))return;
 const item = (db.settings.customItems||[]).find(x=>x.id===itemId);
 if(!item) return;
 
 const adv = getAdvisorEffects(s);
 const disc = item.category === 'asker' ? adv.recruitDiscount : adv.infraDiscount;
 const price = Math.max(1, Math.round(item.price * (1 - (disc / 100))));

 const qty = Math.floor(Number(document.getElementById(`qty_${id}_${itemId}`).value)) || 0;
 if(qty <= 0) return;
 const totalCost = price * qty;
 if(s.treasury < totalCost){alert(`Hazine yetersiz! Gerekli: ${money(totalCost)}`);return;}
 const p = calcPop(s);
 if(item.category === 'asker' && p.elig < qty){alert("Elverişli nüfus yetersiz!"); return;}
 
 const oldT = s.treasury;
 const oldUnitCount = s[item.id] || 0;

 s.treasury -= totalCost; 
 s[item.id] = oldUnitCount + qty;

 addLog({
     stateId: s.id,
     stateName: s.name,
     action: `Özel Birim Üretimi: ${labelName}`,
     cost: totalCost,
     qty: qty,
     oldTreasury: oldT,
     newTreasury: s.treasury,
     unitName: labelName,
     oldUnit: oldUnitCount,
     newUnit: s[item.id]
 });

 queueSave(); openDetail(id);
}

function calcCampCost(id) {
    const s = getState(id);
    let total = 0;
    document.querySelectorAll('input[id^="camp_"]').forEach(el => {
        let k = el.id.replace('camp_','');
        let val = Number(el.value) || 0;
        let max = Number(el.max) || 0;
        if(val > max) { val = max; el.value = max; }
        if(val < 0) { val = 0; el.value = 0; }
        let cost = (db.settings.campaignCost||{})[k] !== undefined ? (db.settings.campaignCost||{})[k] : ((db.settings.customItems||[]).find(x=>x.id===k)?.campCost || 0);
        total += val * cost;
    });
    document.getElementById('campTotalCost').innerHTML = money(total);
}
function openCampaign(id) {
    const s = getState(id);
    const cc = db.settings.campaignCost || {};
    const units = [
        {key: 'piyade', label: 'Piyade', max: s.piyade||0, cost: cc.piyade||0},
        {key: 'suvari', label: 'Süvari', max: s.suvari||0, cost: cc.suvari||0},
        {key: 'nisanci', label: 'Nişancı', max: s.nisanci||0, cost: cc.nisanci||0},
        {key: 'kucuk_top', label: 'Küçük Top', max: s.kucuk_top||0, cost: cc.kucuk_top||0},
        {key: 'orta_top', label: 'Orta Top', max: s.orta_top||0, cost: cc.orta_top||0},
        {key: 'buyuk_top', label: 'Büyük Top', max: s.buyuk_top||0, cost: cc.buyuk_top||0}
    ];
    if(db.settings.customItems) {
        db.settings.customItems.forEach(ci => { if(ci.category === 'asker' && (!ci.faction || ci.faction === s.id)) units.push({ key: ci.id, label: ci.name, max: s[ci.id] || 0, cost: ci.campCost || 0 }); });
    }
    let html = `<h2>⚔️ SEFER LOJİSTİĞİ</h2><p class="sub">Ordunuzu sefere çıkarmak için gereken ikmal masrafı peşin ödenir.</p><div class="cards" style="margin-bottom:12px; max-height:40vh; overflow:auto;">`;
    units.forEach(u => {
        html += `<div class="list-item" style="flex-direction:column; align-items:flex-start;">
            <div style="width:100%; display:flex; justify-content:space-between; margin-bottom:4px;"><b>${u.label}</b><span style="color:var(--gold)">${money(u.cost)}/ad</span></div>
            <div style="width:100%; display:flex; justify-content:space-between; align-items:center;">
                <span class="sub">Mevcut: ${num(u.max)}</span>
                <input type="number" id="camp_${u.key}" min="0" max="${u.max}" value="0" style="width:70px;" oninput="calcCampCost('${id}')">
            </div>
        </div>`;
    });
    html += `</div><div style="background:rgba(10, 12, 14, 0.6); padding:10px; border-radius:3px; text-align:center; font-size:16px; border:1px solid var(--border-gold);">
        Toplam İkmal: <b id="campTotalCost" style="color:var(--gold)">0 TL</b></div>
    <div class="actions" style="margin-top:12px;"><button class="btn" onclick="closeModal()">İPTAL</button><button class="btn red" style="flex:1; font-weight:bold;" onclick="startCampaign('${id}')">SEFERİ BAŞLAT</button></div>`;
    modal(html);
}
function startCampaign(id) {
    const s = getState(id);
    let total = 0; let details = [];
    document.querySelectorAll('input[id^="camp_"]').forEach(el => {
        let k = el.id.replace('camp_','');
        let val = Number(el.value) || 0;
        if(val > 0) {
            let cost = (db.settings.campaignCost||{})[k] !== undefined ? (db.settings.campaignCost||{})[k] : ((db.settings.customItems||[]).find(x=>x.id===k)?.campCost || 0);
            let name = (db.settings.campaignCost||{})[k] !== undefined ? k.replace('_',' ') : ((db.settings.customItems||[]).find(x=>x.id===k)?.name);
            total += val * cost; details.push(`${num(val)} ${name}`); 
        }
    });
    if(total <= 0) return;
    if(s.treasury < total) { alert("Hazine yetersiz! Gerekli: " + money(total)); return; }
    
    const oldT = s.treasury;
    s.treasury -= total;
    
    addLog({
        stateId: s.id,
        stateName: s.name,
        action: `Sefer Ordusu İkmali (${details.join(', ')})`,
        cost: total,
        qty: 1,
        oldTreasury: oldT,
        newTreasury: s.treasury
    });

    closeModal(); queueSave(); openDetail(id);
}

// ---------------- ASKERİ TERHİS / DAĞITMA (GİDER DÜŞÜRME) ----------------
function disbandUnit(id, key, labelName) {
    const s = getState(id);
    if(!s) return;
    if(!isAdmin && s.ownerEmail !== currentUserEmail) return;
    const currentCount = s[key] || 0;
    if(currentCount <= 0) { alert("Terhis edilecek birim bulunmuyor!"); return; }
    
    const qtyInput = document.getElementById(`qty_${id}_${key}`);
    const qty = Math.floor(Number(qtyInput?.value)) || 0;
    if(qty <= 0) { alert("⛔ Hata: Sıfır veya eksi bir değer giremezsiniz!"); return; }
    if(qty > currentCount) { alert(`Mevcut miktardan (${num(currentCount)}) fazla terhis edemezsiniz!`); return; }
    
    if(!confirm(`${num(qty)} adet ${labelName} terhis edilsin mi?\n\nAskerler sivil halka geri dönecek ve yıllık bakım masrafları kesilmeyecektir.`)) return;
    
    s[key] = currentCount - qty;
    
    addLog({
        stateId: s.id,
        stateName: s.name,
        action: `Birim Terhisi: ${labelName}`,
        cost: 0,
        qty: qty,
        oldTreasury: s.treasury||0,
        newTreasury: s.treasury||0,
        unitName: labelName,
        oldUnit: currentCount,
        newUnit: s[key]
    });
    
    queueSave();
    openDetail(id);
    toast(`${num(qty)} adet ${labelName} terhis edildi. Bakım masrafları düştü.`, true);
}

function disbandCustomUnit(id, itemId, labelName) {
    const s = getState(id);
    if(!s) return;
    if(!isAdmin && s.ownerEmail !== currentUserEmail) return;
    const currentCount = s[itemId] || 0;
    if(currentCount <= 0) { alert("Terhis edilecek özel birim bulunmuyor!"); return; }
    
    const qtyInput = document.getElementById(`qty_${id}_${itemId}`);
    const qty = Math.floor(Number(qtyInput?.value)) || 0;
    if(qty <= 0) { alert("⛔ Hata: Sıfır veya eksi bir değer giremezsiniz!"); return; }
    if(qty > currentCount) { alert(`Mevcut miktardan (${num(currentCount)}) fazla terhis edemezsiniz!`); return; }
    
    if(!confirm(`${num(qty)} adet ${labelName} terhis edilsin mi?\n\nBirimler sivil hayata geri dönecektir.`)) return;
    
    s[itemId] = currentCount - qty;
    
    addLog({
        stateId: s.id,
        stateName: s.name,
        action: `Özel Birim Terhisi: ${labelName}`,
        cost: 0,
        qty: qty,
        oldTreasury: s.treasury||0,
        newTreasury: s.treasury||0,
        unitName: labelName,
        oldUnit: currentCount,
        newUnit: s[itemId]
    });
    
    queueSave();
    openDetail(id);
    toast(`${num(qty)} adet ${labelName} terhis edildi.`, true);
}
