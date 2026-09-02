// Ne işe yarar: Kullanıcı girişi, kayıt olma, çıkış yapma ve oyunun ilk yüklendiğinde başlatılması (init) işlemlerini yapar.

async function init(){
 try{
  initSupabase();
  const {data:{session},error}=await sb.auth.getSession();
  if(error) throw error;
  sb.auth.onAuthStateChange((_e,s)=>{if(s) showApp(s); else showAuth()});
  if(session) showApp(session); else showAuth();
  
  startGlobalClock();
 }catch(e){
  const msg=document.getElementById("authMsg");
  if(msg){msg.className="error";msg.textContent="❌ Supabase Hatası: "+(e.message||e);}
  console.error(e);
 }
}

function showAuth(){
    document.getElementById("app").classList.add("hidden");
    document.getElementById("auth").classList.remove("hidden");
}

async function showApp(session){
 currentUserEmail = (session?.user?.email || "").trim().toLowerCase();
 isAdmin = SUPER_ADMINS.map(m => m.trim().toLowerCase()).includes(currentUserEmail);
 
 document.getElementById("auth").classList.add("hidden");
 document.getElementById("app").classList.remove("hidden");
 
 await loadDB();
 await loadEventAssets();
 setupGameRealtime();
 renderTopActions();
 renderHome();
 if(db.settings && db.settings.lastYearReport) {
   let lastSeenYear = Number(localStorage.getItem('lastSeenYearReport')) || 0;
   if(db.settings.lastYearReport.year > lastSeenYear && !isAdmin) {
   showYearReportModal();
     }
   }     
}

function renderTopActions() {
 const actionsDiv = document.getElementById("topActions");
 if(isAdmin){
    const hrs = Math.floor((db.timerSeconds||0) / 3600);
    const mins = Math.floor(((db.timerSeconds||0) % 3600) / 60);
    const secs = (db.timerSeconds||0) % 60;
    const timeStr = `${String(hrs).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;

    actionsDiv.innerHTML = `
    <div id="adminTimerDisplay" style="display:flex; align-items:center;">
        <div class="admin-timer-box">
            <span>⏱️ Süre: <b>${timeStr}</b> / 03:00:00</span>
            <button class="btn small ${db.timerRunning?'red':'green'}" onclick="toggleTimer()">${db.timerRunning?'DURDUR':'BAŞLAT'}</button>
            <button class="btn small gold" onclick="resetTimer()">SIFIRLA</button>
            ${(db.timerSeconds||0) >= 10800 ? '<button class="btn green small" onclick="passOneYear()">YILI GEÇİR</button>' : ''}
        </div>
    </div>
    <button class="btn gold" onclick="passOneYear()">⏳ 1 YIL GEÇİR</button>
    <button class="btn gold" onclick="openAdminGrantModal()">💸 PARA GÖNDER</button>
    <button class="btn" onclick="openPurchaseLogs()">📜 LOGLAR</button>
    <button class="btn gold" onclick="openEventHistoryAdmin()">🎲 OLAYLAR</button>
    <button class="btn green" onclick="openStateForm()">＋ DEVLET EKLE</button>
    <button class="btn blue" onclick="openAdmin()">⚙ ADMİN</button>
    <button class="btn red" onclick="logout()">ÇIKIŞ</button>`;
 } else {
    actionsDiv.innerHTML = `
    <button class="btn" onclick="openPurchaseLogs()">📜 LOGLAR</button>
    <span style="color:var(--muted); font-size:12px; margin:0 6px;">👤 ${esc(currentUserEmail)}</span>
    <button class="btn red" onclick="logout()">ÇIKIŞ</button>`;
 }
}

function setAuthMode(m){
    authMode=m;
    document.getElementById("authBtn").textContent=m==="login"?"Giriş Yap":"Kayıt Ol";
    document.getElementById("loginTab").className="btn "+(m==="login"?"blue":"");
    document.getElementById("signupTab").className="btn "+(m==="signup"?"blue":"");
}

async function logout(){await sb.auth.signOut()}

window.addEventListener("load",init);

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("loginTab").onclick=()=>setAuthMode("login");
    document.getElementById("signupTab").onclick=()=>setAuthMode("signup");

    document.getElementById("authBtn").onclick=async()=>{
     const email=document.getElementById("email").value.trim(), password=document.getElementById("password").value;
     const msg=document.getElementById("authMsg");msg.className="";msg.textContent="İşleniyor…";
     try{
      if(authMode==="signup"){
          const r=await sb.auth.signUp({email,password});
          if(r.error)throw r.error;
          msg.className="success";
          msg.textContent=r.data.session?"Hesap oluşturuldu.":"Hesap oluşturuldu. E-posta doğrulaması açıksa gelen kutunu kontrol et.";
      } else {
          const r=await sb.signInWithPassword({email,password});
          if(r.error)throw r.error;
      }
     }catch(e){
         msg.className="error";
         msg.textContent="❌ "+(e.message||e);
     }
    };
});