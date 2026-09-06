const TECH_TREE = [
    // Ekonomi Teknolojileri
    { id: "tech_matbaa", name: "Matbaa", desc: "Vergi gelirlerini %5 artırır.", cost: 40000, req: [], type: "eco" },
    { id: "tech_tarim_reformu", name: "Tarım Reformu", desc: "Vergi gelirlerini %10 artırır.", cost: 80000, req: ["tech_matbaa"], type: "eco" },
    { id: "tech_bankacilik", name: "Modern Bankacılık", desc: "Bina yapım maliyetlerini %10 düşürür.", cost: 120000, req: ["tech_tarim_reformu"], type: "eco" },

    // Savaş Teknolojileri
    { id: "tech_atesli_silahlar", name: "Ateşli Silahlar", desc: "Ordu (Piyade/Süvari vb.) asker alım maliyetini %10 düşürür.", cost: 50000, req: [], type: "war" },
    { id: "tech_nizami_ordu", name: "Nizami Ordu", desc: "Ordu bakım masraflarını %10 azaltır.", cost: 90000, req: ["tech_atesli_silahlar"], type: "war" },
    { id: "tech_agir_topcu", name: "Ağır Topçu", desc: "Topçu alım maliyetlerini %15 düşürür.", cost: 110000, req: ["tech_nizami_ordu"], type: "war" },
    { id: "tech_kalyon", name: "Kalyon Üretimi", desc: "Donanma gemi alım maliyetlerini %15 düşürür.", cost: 100000, req: ["tech_atesli_silahlar"], type: "war" }
];

function getTechBonus(s) {
    let bonus = {
        taxBonus: 0,
        buildDiscount: 0,
        recruitDiscount: 0,
        milUpkeepDiscount: 0,
        artilleryDiscount: 0,
        navyDiscount: 0
    };
    if(!s.technologies) return bonus;

    if(s.technologies["tech_matbaa"]) bonus.taxBonus += 5;
    if(s.technologies["tech_tarim_reformu"]) bonus.taxBonus += 10;
    if(s.technologies["tech_bankacilik"]) bonus.buildDiscount += 10;
    
    if(s.technologies["tech_atesli_silahlar"]) bonus.recruitDiscount += 10;
    if(s.technologies["tech_nizami_ordu"]) bonus.milUpkeepDiscount += 10;
    if(s.technologies["tech_agir_topcu"]) bonus.artilleryDiscount += 15;
    if(s.technologies["tech_kalyon"]) bonus.navyDiscount += 15;

    return bonus;
}

function renderTechTree(s) {
    if(!s.technologies) s.technologies = {};
    
    let html = `<div>
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <h4 style="color:var(--border-gold); margin:0; font-family:'Oswald';">🌲 TEKNOLOJİ VE SAVAŞ AĞACI</h4>
    </div>
    <p class="sub">Devlet hazinesini kullanarak teknoloji geliştirin. Her teknoloji kalıcı bonuslar sağlar.</p>
    
    <div class="tech-grid" style="display:flex; flex-wrap:wrap; gap:10px;">`;
    
    TECH_TREE.forEach(tech => {
        const isUnlocked = !!s.technologies[tech.id];
        let canUnlock = true;
        let reqText = "";
        
        if(tech.req.length > 0) {
            const reqNames = tech.req.map(rId => TECH_TREE.find(t => t.id === rId)?.name).join(", ");
            if(!tech.req.every(rId => !!s.technologies[rId])) {
                canUnlock = false;
                reqText = `<div style="font-size:11px; color:var(--red); margin-bottom:4px;">Gereksinim: ${reqNames}</div>`;
            } else {
                reqText = `<div style="font-size:11px; color:var(--green); margin-bottom:4px;">Gereksinim: ${reqNames} (Sağlandı)</div>`;
            }
        }
        
        const isAffordable = s.treasury >= tech.cost;
        const typeColor = tech.type === 'eco' ? 'var(--green)' : 'var(--red)';
        const typeIcon = tech.type === 'eco' ? '💰' : '⚔️';
        
        let btnHtml = "";
        const canManage = (typeof isAdmin !== 'undefined' && isAdmin) || (s.ownerEmail === currentUserEmail);
        
        if(isUnlocked) {
            btnHtml = `<button class="btn green small" disabled style="width:100%; opacity:1;">AÇILDI</button>`;
        } else if(!canManage) {
            btnHtml = `<button class="btn small" disabled style="width:100%;">YETKİ YOK</button>`;
        } else if(canUnlock) {
            if(isAffordable) {
                btnHtml = `<button class="btn gold small" style="width:100%;" onclick="researchTech('${s.id}', '${tech.id}')">ARAŞTIR (${money(tech.cost)})</button>`;
            } else {
                btnHtml = `<button class="btn small" disabled style="width:100%;">YETERSİZ BÜTÇE (${money(tech.cost)})</button>`;
            }
        } else {
            btnHtml = `<button class="btn small" disabled style="width:100%;">KİLİTLİ</button>`;
        }
        
        html += `
        <div class="tech-card" style="border:1px solid ${isUnlocked ? 'var(--green)' : 'var(--line)'}; border-radius:5px; padding:10px; width:calc(50% - 5px); background:rgba(0,0,0,0.5); min-width: 200px; display:flex; flex-direction:column;">
            <div style="font-weight:bold; color:${isUnlocked ? 'var(--green)' : typeColor}; margin-bottom:5px;">
                ${typeIcon} ${tech.name}
            </div>
            <div style="font-size:12px; margin-bottom:8px; min-height: 35px;">${tech.desc}</div>
            ${reqText}
            <div style="margin-top:auto;">
                ${btnHtml}
            </div>
        </div>`;
    });
    
    html += `</div></div>`;
    return html;
}

function researchTech(stateId, techId) {
    const s = getState(stateId);
    if(!s) return;
    if(!isAdmin && s.ownerEmail !== currentUserEmail) return;
    
    const tech = TECH_TREE.find(t => t.id === techId);
    if(!tech) return;
    
    if(!s.technologies) s.technologies = {};
    if(s.technologies[tech.id]) {
        alert("Bu teknoloji zaten açılmış!");
        return;
    }
    
    if(s.treasury < tech.cost) {
        alert("Hazine yetersiz!");
        return;
    }
    
    if(tech.req.some(rId => !s.technologies[rId])) {
        alert("Gereksinimler karşılanmıyor!");
        return;
    }
    
    const oldT = s.treasury;
    s.treasury -= tech.cost;
    s.technologies[tech.id] = true;
    
    addLog({
        stateId: s.id,
        stateName: s.name,
        action: `Teknoloji Araştırıldı: ${tech.name}`,
        cost: tech.cost,
        qty: 1,
        oldTreasury: oldT,
        newTreasury: s.treasury,
        unitName: "Teknoloji",
        oldUnit: 0,
        newUnit: 1
    });
    
    queueSave();
    openDetail(stateId);
}
