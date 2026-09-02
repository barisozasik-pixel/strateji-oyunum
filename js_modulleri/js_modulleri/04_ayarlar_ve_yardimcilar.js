// Ne işe yarar: Oyun içi sabit ayarları, yardımcı metin temizleme ve hesaplama (esc, money, num) araçlarını barındırır.

const defaultSettings={
 prices:{piyade:21,suvari:40,nisanci:30,kucuk_top:10000,orta_top:25000,buyuk_top:45000,kucuk_gemi:65000,orta_gemi:95000,buyuk_gemi:130000,kucuk_liman:100000,orta_liman:180000,buyuk_liman:300000,kucuk_ocak:80000,orta_ocak:150000,buyuk_ocak:250000,okul:120000,istihbarat_binasi:200000},
 capacity:{kucuk_liman:5,orta_liman:7,buyuk_liman:10,kucuk_ocak:10,orta_ocak:20,buyuk_ocak:35},
 upkeep:{piyade:35,suvari:55,nisanci:45,kucuk_top:7500,orta_top:15000,buyuk_top:25000,kucuk_gemi:20000,orta_gemi:35000,buyuk_gemi:50000},
 garrisonUpkeep:{fortress:8},
 populationBuildingGrowth:{hastane:0.5,asevi:0.4,su_degirmeni:0.6,kervansaray:0.3,pazar:0.4},
 populationBuildingCostPerPerson:{hastane:0.10,asevi:0.05,su_degirmeni:0.08,kervansaray:0.12,pazar:0.10},
 populationBuildingUpkeep:{hastane:0,asevi:0,su_degirmeni:0,kervansaray:0,pazar:0},
 schoolCapacityPerBuilding:500,
 schoolUpkeep:10000,
 educatedTaxMultiplier:1.5,
 infrastructureUpkeep:{kucuk_liman:0,orta_liman:0,buyuk_liman:0,kucuk_ocak:0,orta_ocak:0,buyuk_ocak:0,istihbarat_binasi:0},
 edictCost:{erzak:2, karakol:1.5, panayir:1, ibadethane:3, anit:2.5, denetim:0.5},
 campaignCost:{piyade:2, suvari:5, nisanci:3, kucuk_top:200, orta_top:500, buyuk_top:1000},
 schoolEducation:2,
 mapIntelReportCost:100000,
 images:{piyade:"",suvari:"",nisanci:"",kucuk_top:"",orta_top:"",buyuk_top:"",kucuk_gemi:"",orta_gemi:"",buyuk_gemi:"",kucuk_liman:"",orta_liman:"",buyuk_liman:"",kucuk_ocak:"",orta_ocak:"",buyuk_ocak:"",okul:"",istihbarat_binasi:"",fortress:"",fortress_garrison:"",hastane:"",asevi:"",su_degirmeni:"",kervansaray:"",pazar:""},
 customItems: [] 
};

const EDICTS = [
    { id: 'erzak', name: 'Erzak Dağıtımı', desc: 'Ambarları açarak halkı doyur.', pts: 10, icon: '🍞' },
    { id: 'karakol', name: 'Karakol İnşası', desc: 'Güvenliği sağla.', pts: 8, icon: '🛡️' },
    { id: 'panayir', name: 'Panayır Düzenle', desc: 'Şenlikler düzenle.', pts: 7, icon: '🎪' },
    { id: 'ibadethane', name: 'İbadethane / Hamam', desc: 'Manevi yapılar kur.', pts: 7, icon: '🕌' },
    { id: 'anit', name: 'Anıt İnşası', desc: 'Görkemli anıtlar dik.', pts: 5, icon: '🏛️' },
    { id: 'denetim', name: 'Pazar Denetimi', desc: 'Karaborsayı engelle.', pts: '5-9', icon: '⚖️' }
];

function esc(x){return String(x??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function cleanUrl(u){
    if(!u) return "";
    let s = String(u).trim();
    let m = s.match(/https?:\/\/[^\s"'<>\[\]\)]+/);
    return m ? m[0] : s;
}
function money(n){return Number(n||0).toLocaleString("tr-TR")+" TL"}
function num(n){return Number(n||0).toLocaleString("tr-TR")}
function getState(id){return db.states.find(s=>s.id===id)}
function valuesEqual(a,b){return JSON.stringify(a)===JSON.stringify(b)}
function normalizeSettings(settings){
 const s={...defaultSettings,...(settings||{})};
 ["prices","capacity","upkeep","garrisonUpkeep","populationBuildingGrowth","populationBuildingCostPerPerson","populationBuildingUpkeep","infrastructureUpkeep","edictCost","campaignCost","images"].forEach(k=>{s[k]={...defaultSettings[k],...(s[k]||{})};});
 s.customItems=Array.isArray(s.customItems)?s.customItems:[];
 return s;
}
function mergeStateThreeWay(base,local,remote,path="",conflicts=[]){
 if(valuesEqual(local,base))return structuredClone(remote);
 if(valuesEqual(remote,base))return structuredClone(local);
 if(valuesEqual(local,remote))return structuredClone(local);
 if(Array.isArray(local)||Array.isArray(remote)){
   const baseArr=Array.isArray(base)?base:[];
   const localArr=Array.isArray(local)?local:[];
   const remoteArr=Array.isArray(remote)?remote:[];
   const keyOf=it=>(it&&typeof it==='object')?(it.id??it.uid??it.logId??it.stateId??JSON.stringify(it)):it;
   const byKey=arr=>{const m=new Map();arr.forEach(it=>m.set(keyOf(it),it));return m;};
   const baseMap=byKey(baseArr),localMap=byKey(localArr),remoteMap=byKey(remoteArr);

   const order=[],seen=new Set();
   [...remoteArr,...localArr].forEach(it=>{const k=keyOf(it);if(!seen.has(k)){seen.add(k);order.push(k);}});

   const merged=[];
   order.forEach(k=>{
     const inLocal=localMap.has(k),inRemote=remoteMap.has(k),inBase=baseMap.has(k);
     if(!inLocal&&!inRemote)return;              
     if(!inLocal&&inBase)return;                 
     if(!inRemote&&inBase)return;                
     if(!inLocal){merged.push(structuredClone(remoteMap.get(k)));return;}   
     if(!inRemote){merged.push(structuredClone(localMap.get(k)));return;}  
     merged.push(mergeStateThreeWay(baseMap.get(k),localMap.get(k),remoteMap.get(k),`${path}[${k}]`,conflicts));
   });
   return merged;
 }
 if(local===null||remote===null||typeof local!=="object"||typeof remote!=="object"){
   conflicts.push(path||"root");return structuredClone(remote);
 }
 const merged={},keys=new Set([...Object.keys(base||{}),...Object.keys(local||{}),...Object.keys(remote||{})]);
 keys.forEach(key=>{
   const childPath=path?path+"."+key:key;
   merged[key]=mergeStateThreeWay(base?.[key],local?.[key],remote?.[key],childPath,conflicts);
 });
 return merged;
}
function closeModal(){document.getElementById("modal").classList.remove("show")}
function modal(html){document.getElementById("modalContent").innerHTML=html;document.getElementById("modal").classList.add("show")}
function toast(msg,ok=false){document.getElementById("syncText").textContent=(ok?"✓ ":"⚠ ")+msg}

function getAdvisorEffects(s) {
    const hired = s.hiredAdvisors || [];
    let eff = {
        taxBonus: 0,
        milUpkeepDiscount: 0,
        navyUpkeepDiscount: 0,
        artUpkeepDiscount: 0,
        recruitDiscount: 0,
        infraDiscount: 0,
        happinessBonus: 0,
        stopAnarchy: false,
        spyAccuracyBonus: false
    };

    if(hired.length > 0 && db.advisors) {
        db.advisors.forEach(a => {
            if(hired.includes(a.id)) {
                eff.taxBonus += Number(a.taxBonus || 0);
                eff.milUpkeepDiscount += Number(a.milUpkeepDiscount || 0);
                eff.navyUpkeepDiscount += Number(a.navyUpkeepDiscount || 0);
                eff.artUpkeepDiscount += Number(a.artUpkeepDiscount || 0);
                eff.recruitDiscount += Number(a.recruitDiscount || 0);
                eff.infraDiscount += Number(a.infraDiscount || 0);
                eff.happinessBonus += Number(a.happinessBonus || 0);
                if(a.stopAnarchy) eff.stopAnarchy = true;
                if(a.spyAccuracyBonus) eff.spyAccuracyBonus = true;
            }
        });
    }
    return eff;
}

function restoreOriginalAdvisorEffects(){
 if(db.advisorEffectVersion===3)return;
 const effectKeys=['taxBonus','milUpkeepDiscount','navyUpkeepDiscount','artUpkeepDiscount','recruitDiscount','infraDiscount','happinessBonus','stopAnarchy','spyAccuracyBonus','buff','debuff'];
 (db.advisors||[]).forEach(a=>{const original=DEFAULT_45_ADVISORS.find(x=>x.id===a.id);if(original)effectKeys.forEach(key=>a[key]=structuredClone(original[key]));});
 db.advisorEffectVersion=3;
 delete db.advisorStarBalanceVersion;
}