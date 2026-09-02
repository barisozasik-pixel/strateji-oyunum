// Ne işe yarar: Supabase bağlantısını kurar, kaydetme, yükleme ve gerçek zamanlı güncellemeleri (Realtime) yapar.

function initSupabase(){
 if(!window.supabase || typeof window.supabase.createClient!=="function") throw new Error("Supabase kütüphanesi yüklenemedi.");
 sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true}});
}

async function loadDB(silent = false){
 if(!silent) toast("Veriler yeni tablolardan yükleniyor…");
 if(!sb){toast("Supabase bağlantısı kurulamadı.");return}
 
 try {
   const [coreRes, statesRes, advisorsRes, lettersRes, logsRes] = await Promise.all([
     sb.from('game_core').select('*').eq('id', 1).single(),
     sb.from('game_states').select('*'),
     sb.from('game_advisors').select('*'),
     sb.from('game_letters').select('*'),
     sb.from('game_logs').select('*').order('created_at', { ascending: false }).limit(300)
   ]);
   if(coreRes.error && coreRes.error.code !== "PGRST116") throw coreRes.error;
   const core = coreRes.data || {};
   
   db = {
     settings: normalizeSettings(core.settings || {}),
     gameYear: core.game_year || 1453,
     timerSeconds: core.timer_seconds || 0,
     timerRunning: core.timer_running || false,
     mapProvinceOwners: core.map_data?.mapProvinceOwners || {},
     mapProvinceDetails: core.map_data?.mapProvinceDetails || {},
     valuableRegions: core.map_data?.valuableRegions || {},
     pendingEvents: core.events_data?.pendingEvents || [],
     eventHistory: core.events_data?.eventHistory || [],
     states: statesRes.data ? statesRes.data.map(r => r.data) : [],
     advisors: advisorsRes.data ? advisorsRes.data.map(r => r.data) : [],
     letters: lettersRes.data ? lettersRes.data.map(r => r.data) : [],
     purchaseLog: logsRes.data ? logsRes.data.map(r => r.data) : []
   };
   if(!db.advisors || db.advisors.length === 0) {
      if(typeof DEFAULT_45_ADVISORS !== 'undefined') db.advisors = structuredClone(DEFAULT_45_ADVISORS);
   } else {
      const existingIds = new Set(db.advisors.map(a => a.id));
      if(typeof DEFAULT_45_ADVISORS !== 'undefined'){
         DEFAULT_45_ADVISORS.forEach(def => {
             if(!existingIds.has(def.id)) db.advisors.push(structuredClone(def));
         });
      }
   }
   db.states.forEach(s => { 
      s.customLedger = s.customLedger || []; 
      s.permanentLedger = s.permanentLedger || [];
      s.rulerImage = cleanUrl(s.rulerImage || "");
      s.bgImage = cleanUrl(s.bgImage || "");
      s.hiredAdvisors = s.hiredAdvisors || [];
      s.advisorHiredYears = s.advisorHiredYears || {}; 
      s.advisorSlots = s.advisorSlots || 3;
   });
   dbBaseSnapshot = structuredClone(db);
   if(!silent) toast("Yeni Sistem Aktif", true);
 } catch(e) {
   toast("Yükleme hatası: " + e.message);
 }
}

async function saveDB(){
 if(!sb)return false;
 if(saveInFlight){saveQueued=true;return false;}
 saveInFlight=true;
 
 try{
   const promises = [];
   db.states.forEach(s => {
       const baseState = dbBaseSnapshot.states.find(x => x.id === s.id);
       if(!baseState || !valuesEqual(s, baseState)){
           promises.push(sb.from('game_states').upsert({ id: s.id, name: s.name, owner_email: s.ownerEmail, data: s }));
       }
   });
   dbBaseSnapshot.states.forEach(baseState => {
       if(!db.states.find(x => x.id === baseState.id)){
           promises.push(sb.from('game_states').delete().eq('id', baseState.id));
       }
   });
   db.advisors.forEach(a => {
       const baseAdv = dbBaseSnapshot.advisors.find(x => x.id === a.id);
       if(!baseAdv || !valuesEqual(a, baseAdv)){
           promises.push(sb.from('game_advisors').upsert({ id: a.id, data: a })); 
       }
   });
   dbBaseSnapshot.advisors.forEach(baseAdv => {
       if(!db.advisors.find(x => x.id === baseAdv.id)){
           promises.push(sb.from('game_advisors').delete().eq('id', baseAdv.id));
       }
   });
   db.letters.forEach(l => {
       const baseLetter = dbBaseSnapshot.letters.find(x => x.id === l.id);
       if(!baseLetter || !valuesEqual(l, baseLetter)){
           promises.push(sb.from('game_letters').upsert({ id: l.id, to_state_id: l.toStateId, from_state_id: l.fromStateId, read: l.read, data: l }));
       }
   });
   dbBaseSnapshot.letters.forEach(baseLetter => {
       if(!db.letters.find(x => x.id === baseLetter.id)){
           promises.push(sb.from('game_letters').delete().eq('id', baseLetter.id));
       }
   });
   db.purchaseLog.forEach(log => {
       const baseLog = dbBaseSnapshot.purchaseLog.find(x => x.logId === log.logId);
       if(!baseLog){
           promises.push(sb.from('game_logs').insert({ id: log.logId, state_id: log.stateId, log_type: log.logType||'purchase', data: log }));
       }
   });
   const coreChanged = 
       db.gameYear !== dbBaseSnapshot.gameYear ||
       db.timerSeconds !== dbBaseSnapshot.timerSeconds ||
       db.timerRunning !== dbBaseSnapshot.timerRunning ||
       !valuesEqual(db.settings, dbBaseSnapshot.settings) ||
       !valuesEqual(db.mapProvinceOwners, dbBaseSnapshot.mapProvinceOwners) ||
       !valuesEqual(db.mapProvinceDetails, dbBaseSnapshot.mapProvinceDetails) ||
       !valuesEqual(db.valuableRegions, dbBaseSnapshot.valuableRegions) ||
       !valuesEqual(db.pendingEvents, dbBaseSnapshot.pendingEvents) ||
       !valuesEqual(db.eventHistory, dbBaseSnapshot.eventHistory);
   if(coreChanged){
       const coreData = {
           game_year: db.gameYear,
           timer_seconds: db.timerSeconds,
           timer_running: db.timerRunning,
           settings: db.settings,
           map_data: {
               mapProvinceOwners: db.mapProvinceOwners,
               mapProvinceDetails: db.mapProvinceDetails,
               valuableRegions: db.valuableRegions
           },
           events_data: {
               pendingEvents: db.pendingEvents,
               eventHistory: db.eventHistory
           }
       };
       promises.push(sb.from('game_core').update(coreData).eq('id', 1));
   }
   if(promises.length > 0){
       await Promise.all(promises);
       toast("Kaydedildi " + new Date().toLocaleTimeString("tr-TR"), true);
   }
   dbBaseSnapshot = structuredClone(db);
   return true;
 }catch(error){
   console.error(error);
   toast("Kayıt hatası: "+(error.message||error));
   return false;
 }finally{
   saveInFlight=false;
   if(saveQueued){saveQueued=false;queueSave();}
 }
}

function setupGameRealtime(){
 if(!sb||gameSyncChannel)return;
 gameSyncChannel = sb.channel('game-sync-channel')
   .on('postgres_changes', { event: '*', schema: 'public', table: 'game_states' }, handleRealtimeUpdate)
   .on('postgres_changes', { event: '*', schema: 'public', table: 'game_core' }, handleRealtimeUpdate)
   .on('postgres_changes', { event: '*', schema: 'public', table: 'game_letters' }, handleRealtimeUpdate)
   .on('postgres_changes', { event: '*', schema: 'public', table: 'game_advisors' }, handleRealtimeUpdate)
   .subscribe();
}

async function handleRealtimeUpdate(payload) {
   if(document.getElementById('modal')?.classList.contains('show')) return;
   
   if(valuesEqual(db, dbBaseSnapshot)){
     const oldYear = dbBaseSnapshot.gameYear;
     const activeTab = document.querySelector('.hoi-tab.active')?.id?.replace('tab-btn-', '');
     const scrollTop = window.scrollY;
     
     await loadDB(true); 
     
     if(db.gameYear > oldYear && !isAdmin) {
         showYearReportModal();
     } else if (!document.getElementById('mapScreen')?.classList.contains('hidden')) {
         if(typeof applyMapOwnership === 'function') applyMapOwnership();
     } else if(currentId) {
         openDetail(currentId); 
         if(activeTab) { switchTab(activeTab); window.scrollTo(0, scrollTop); }
     } else {
         renderHome();
     }
   }
   else {
     const oldDb = structuredClone(db);
     const oldYear = dbBaseSnapshot.gameYear;
     const activeTab = document.querySelector('.hoi-tab.active')?.id?.replace('tab-btn-', '');
     const scrollTop = window.scrollY;
     
     await loadDB(true);
     
     let conflicts = [];
     db = mergeStateThreeWay(dbBaseSnapshot, oldDb, db, "root", conflicts);
     dbBaseSnapshot = structuredClone(db);
     
     if(db.gameYear > oldYear && !isAdmin) {
         showYearReportModal();
     } else if (!document.getElementById('mapScreen')?.classList.contains('hidden')) {
         if(typeof applyMapOwnership === 'function') applyMapOwnership();
     } else if(currentId) {
         openDetail(currentId); 
         if(activeTab) { switchTab(activeTab); window.scrollTo(0, scrollTop); }
     } else {
         renderHome();
     }
   }
}

function queueSave(){clearTimeout(saveTimer);saveTimer=setTimeout(saveDB,250)}

async function saveMapDB()
{
 const ok=await saveDB();
 if(ok)mapSyncChannel?.postMessage({type:"map-saved",owners:structuredClone(db.mapProvinceOwners||{}),details:structuredClone(db.mapProvinceDetails||{}),valuableRegions:structuredClone(db.valuableRegions||{})});
 return ok;
}
function queueMapSave(){mapSavePending=true;clearTimeout(mapSaveTimer);mapSaveTimer=setTimeout(()=>{mapSavePending=false;saveMapDB();},250)}