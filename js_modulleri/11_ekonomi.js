function addLedgerItem(stateId) {
    if(!isAdmin) return;
    let s = getState(stateId);
    let desc = document.getElementById('ledger_desc_'+stateId).value.trim();
    let amt = Number(document.getElementById('ledger_amt_'+stateId).value) || 0;
    let type = document.getElementById('ledger_type_'+stateId).value;
    if(!desc) { alert("Açıklama yazmalısınız."); return; }
    
    if(type === 'perm') {
        s.permanentLedger = s.permanentLedger || [];
        s.permanentLedger.push({ desc, amount: amt, type: amt >= 0 ? 'income' : 'expense' });
    } else {
        s.customLedger = s.customLedger || [];
        s.customLedger.push({ desc, amount: amt, type: amt >= 0 ? 'income' : 'expense' });
    }
    queueSave(); openDetail(stateId);
}
function removeLedgerItem(stateId, index) {
    if(!isAdmin) return;
    let s = getState(stateId);
    if(!s || !s.customLedger) return;
    if(index < 0 || index >= s.customLedger.length) return;
    s.customLedger.splice(index, 1);
    queueSave(); openDetail(stateId);
}
function removePermLedgerItem(stateId, index) {
    if(!isAdmin) return;
    let s = getState(stateId);
    if(!s || !s.permanentLedger) return;
    if(index < 0 || index >= s.permanentLedger.length) return;
    s.permanentLedger.splice(index, 1);
    queueSave(); openDetail(stateId);
}

function calcPop(s)
{
  const adv = getAdvisorEffects(s);
  let hap = (Number(s.happiness) || 0) + adv.happinessBonus;
  let pop = Number(s.population) || 0;
  let children = Math.max(0, Math.floor(Number(s.children)||0));
  if(children > pop) children = pop;
  let adults = Math.max(0, pop - children);
  let edu = Number(s.education) || 0;
  
  const taxRate = Math.max(0, Math.min(75, Number(s.tax)||0));
  let anarRate = hap >= 60 ? 0 : (60 - hap);
  anarRate += Math.max(0, (taxRate - 50) * 0.5);
  if(anarRate > 100) anarRate = 100;
  if(adv.stopAnarchy) anarRate = 0;
  
  let anarCount = Math.floor(adults * (anarRate/100));
  
  // ✅ FIX #5: Garnizon toplam askerden ÇIKARILDI (garnizon ayrı gösterilecek)
  let armySize = (s.piyade||0) + (s.suvari||0) + (s.nisanci||0);
  if(db?.settings?.customItems) 
  {
     db.settings.customItems.filter(x => x.category === 'asker' && (!x.faction || x.faction === s.id)).forEach(x => armySize += (s[x.id]||0));
  }
 
  // SİVİL YETİŞKİNLER (Askerler ve Anarşistler ayrıldıktan sonra)
  const activeMilitary = armySize + (s.fortressGarrison || 0);
  let baseCivilian = Math.max(0, adults - anarCount - activeMilitary);
  let remCount = baseCivilian;
  
  // Eğitimli halk — doğrudan s.educatedPopulation (kişi sayısı) koda bağlandı (Fallback: Toplam nüfus * oran)
  let eduCount = 0;
  if(s.educatedPopulation !== undefined && s.educatedPopulation !== null && Number(s.educatedPopulation) > 0) {
      eduCount = Math.floor(Number(s.educatedPopulation) || 0);
  } else {
      eduCount = Math.floor(pop * (edu / 100));
  }
  eduCount = Math.min(remCount, eduCount);
  let otherCount = Math.max(0, remCount - eduCount);
  
  // Eğitim oranı: Eğitimli / (Eğitimli + Sıradan Halk)
  const totalTaxpayers = eduCount + otherCount;
  const calculatedEduRate = totalTaxpayers > 0 ? (eduCount / totalTaxpayers) * 100 : 0;
  
  // ✅ BOŞTAKİ ELVERİŞLİ ASKER (1:1 DÜŞÜM FORMÜLÜ)
  // Ülkenin toplam asker çıkarma potansiyeli (Tavan): Askere elverişli sıradan yetişkin havuzu
  let ordinaryAdultPool = Math.max(0, adults - anarCount - eduCount);
  let eligRate = hap * 0.3;
  let totalEligibleManpower = Math.floor(ordinaryAdultPool * (eligRate / 100));
  
  // Boştaki Elverişli Asker = Toplam Asker Potansiyeli - Halihazırda Orduda / Garnizonda Olanlar
  let availableElig = Math.max(0, totalEligibleManpower - activeMilitary);
  
  const debtYears = Math.max(0, Math.floor(Number(s.debtYears)||0));
  if(debtYears >= 3) availableElig = Math.floor(availableElig * 0.9);
  
  return { anar: anarCount, anarRate, elig: availableElig, maxElig: totalEligibleManpower, eligRate: eligRate.toFixed(1), armySize: armySize, garrison: s.fortressGarrison||0, edu: eduCount, eduTotal: adults, eduRate: calculatedEduRate, other: otherCount, remaining: remCount, children, adults };
}


function calcIncome(s){
  const p = calcPop(s);
  const baseTaxPer = Number(db?.settings?.baseTaxPerPerson ?? s.baseTaxPerPerson ?? 5);
  const baseTax = baseTaxPer * ((Number(s.tax)||0)/100);
  const adjustedBaseTax = baseTax * (1 + (adv.taxBonus / 100));
  const educatedMultiplier = Math.max(0, Number(db.settings.educatedTaxMultiplier??1.5));
  return Math.floor((p.other * adjustedBaseTax) + (p.edu * adjustedBaseTax * educatedMultiplier));
}
function calcPermIncome(s){
  let t = 0;
  if(s.permanentLedger && s.permanentLedger.length > 0) {
      s.permanentLedger.forEach(item => {
          // Pozitif tutarlar gelir, negatif tutarlar giderdir; net toplamı döndürür
          t += (Number(item.amount) || 0);
      });
  }
  return t;
}
function calcPermExpense(s){
  let t = 0;
  if(s.permanentLedger && s.permanentLedger.length > 0) {
      s.permanentLedger.forEach(item => {
          const a = Number(item.amount) || 0;
          if(a < 0 || item.type === 'expense') t += Math.abs(a);
      });
  }
  return t;
}
 
function calcMilitaryUpkeep(s)
{
  const adv = getAdvisorEffects(s);
  const discountFactor = Math.max(0, 1 - (adv.milUpkeepDiscount / 100));
  let raw = (s.piyade||0)*(db.settings.upkeep?.piyade||35)+(s.suvari||0)*(db.settings.upkeep?.suvari||55)+(s.nisanci||0)*(db.settings.upkeep?.nisanci||45);
  return Math.round(raw * discountFactor);
}
 
function calcArtilleryUpkeep(s)
{
  const adv = getAdvisorEffects(s);
  const discountFactor = Math.max(0, 1 - (adv.artUpkeepDiscount / 100));
  let raw = (s.kucuk_top||0)*(db.settings.upkeep?.kucuk_top||7500)+(s.orta_top||0)*(db.settings.upkeep?.orta_top||15000)+(s.buyuk_top||0)*(db.settings.upkeep?.buyuk_top||25000);
  return Math.round(raw * discountFactor);
}
 
function calcNavyUpkeep(s)
{
  const adv = getAdvisorEffects(s);
  const discountFactor = Math.max(0, 1 - (adv.navyUpkeepDiscount / 100));
  let raw = (s.kucuk_gemi||0)*(db.settings.upkeep?.kucuk_gemi||20000)+(s.orta_gemi||0)*(db.settings.upkeep?.orta_gemi||35000)+(s.buyuk_gemi||0)*(db.settings.upkeep?.buyuk_gemi||50000);
  return Math.round(raw * discountFactor);
}
 
function calcCustomUpkeep(s)
{
  const adv = getAdvisorEffects(s);
  const discountFactor = Math.max(0, 1 - (adv.milUpkeepDiscount / 100));
  let c = 0;
  if(db?.settings?.customItems) {
    db.settings.customItems.forEach(item => {
      const itemCost = (s[item.id]||0) * (item.upkeep||0);
      if(item.category === 'asker' || item.type === 'military' || item.isMilitary) {
        c += Math.round(itemCost * discountFactor);
      } else {
        c += itemCost;
      }
    });
  }
  return c;
}
 
function calcAdvisorExpenses(s){
  let total = 0;
  const hired = s.hiredAdvisors || [];
  if(hired.length > 0 && db.advisors) {
      db.advisors.forEach(a => {
          if(hired.includes(a.id)) total += (Number(a.salary) || 0);
      });
  }
  return total;
}
 
function calcFortressGarrisonExpense(s)
{
  return Math.max(0,Number(s.fortressGarrison)||0)*Math.max(0,Number(db.settings.garrisonUpkeep?.fortress)||0);
}
 
function calcPopulationBuildingExpense(s)
{
  const upkeep=db.settings.populationBuildingUpkeep||{};
  return ["hastane","asevi","su_degirmeni","kervansaray","pazar"].reduce((total,key)=>
    total + Math.max(0,Number(s[key])||0)*Math.max(0,Number(upkeep[key])||0),0);
}
function calcInfrastructureExpense(s){
  const upkeep=db.settings.infrastructureUpkeep||{};
  return ["kucuk_liman","orta_liman","buyuk_liman","kucuk_ocak","orta_ocak","buyuk_ocak","istihbarat_binasi"]
    .reduce((total,key)=>total+Math.max(0,Number(s[key])||0)*Math.max(0,Number(upkeep[key])||0),0);
}
function calcExpenses(s){
  const schoolExpense = Math.max(0, Number(s.okul)||0) * Math.max(0, Number(db.settings.schoolUpkeep)||0);
  return calcMilitaryUpkeep(s) + calcArtilleryUpkeep(s) + calcNavyUpkeep(s) + calcCustomUpkeep(s) + calcAdvisorExpenses(s) + calcFortressGarrisonExpense(s) + calcPopulationBuildingExpense(s) + calcInfrastructureExpense(s) + schoolExpense + Number(s.civilExpense||0);
}
function hasTreasuryDebt(s){return Number(s?.treasury||0)<0;}
function rejectDebtPurchase(s){if(hasTreasuryDebt(s)){alert("Bu devlet borçlu olduğu için yeni alım veya inşa yapamaz.");return true;}return false;}

function addLog(data) {
    if(!db.purchaseLog) db.purchaseLog = [];
    const now = new Date();
    const dateStr = now.toLocaleDateString("tr-TR") + " " + now.toLocaleTimeString("tr-TR", {hour:'2-digit', minute:'2-digit'});
    const nowIso = now.toISOString();
    
    db.purchaseLog.unshift({
        logId: crypto.randomUUID(),
        created_at: nowIso,
        stateId: data.stateId || "",
        state: data.stateName || "Bilinmeyen Devlet",
        item: data.action || "",
        qty: data.qty || 1,
        cost: data.cost || 0,
        date: dateStr,
        user: currentUserEmail,
        oldTreasury: data.oldTreasury,
        newTreasury: data.newTreasury,
        unitName: data.unitName || "",
        oldUnit: data.oldUnit,
        newUnit: data.newUnit,
        logType: data.logType || "",
        eventChoice: data.eventChoice || "",
        choiceText: data.choiceText || "",
        eventChanges: Array.isArray(data.eventChanges) ? data.eventChanges : []
    });
    if(db.purchaseLog.length > 300) db.purchaseLog.pop();
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

function buyEdict(id, edictId) {
    const s = getState(id);
    if(!s) return;
    if(!isAdmin && s.ownerEmail !== currentUserEmail) return;
    if(rejectDebtPurchase(s))return;
    let edict = EDICTS.find(e => e.id === edictId);
    let totalCost = Math.floor(s.population * (db.settings.edictCost[edictId] || 0));
    if(s.treasury < totalCost) { alert(`Hazine yetersiz! Gerekli: ${money(totalCost)}`); return; }
    let pts = edictId === 'denetim' ? Math.floor(Math.random() * 5) + 5 : edict.pts; 
    
    const oldT = s.treasury;
    s.treasury -= totalCost;
    s.happiness = Math.min(100, (s.happiness||0) + Number(pts||0));
    
    addLog({
        stateId: s.id,
        stateName: s.name,
        action: `Ferman: ${edict.name}`,
        cost: totalCost,
        qty: 1,
        oldTreasury: oldT,
        newTreasury: s.treasury
    });

    queueSave(); openDetail(id);
}

function shipCapacity(s){return (s.kucuk_gemi||0)+(s.orta_gemi||0)+(s.buyuk_gemi||0)}
function shipCapMax(s){return (s.kucuk_liman||0)*db.settings.capacity.kucuk_liman+(s.orta_liman||0)*db.settings.capacity.orta_liman+(s.buyuk_liman||0)*db.settings.capacity.buyuk_liman}
function gunCapacity(s){return (s.kucuk_top||0)+(s.orta_top||0)+(s.buyuk_top||0)}
function gunCapMax(s){return (s.kucuk_ocak||0)*db.settings.capacity.kucuk_ocak+(s.orta_ocak||0)*db.settings.capacity.orta_ocak+(s.buyuk_ocak||0)*db.settings.capacity.buyuk_ocak}

