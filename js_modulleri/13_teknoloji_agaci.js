// TEKNOLOJİ AĞACI VERİLERİ
const ALL_TECHS = {
    // OSMANLI
    "os_eco_1": { name: "Tarım Geliştirme", cost: 20000, effect: { taxBonus: 2 }, req: [], next: "os_eco_2" },
    "os_eco_2": { name: "Ticaret Yolları", cost: 40000, effect: { taxBonus: 3 }, req: ["os_eco_1"], next: "os_eco_3" },
    "os_eco_3": { name: "Vergi Sistemi", cost: 60000, effect: { taxBonus: 5 }, req: ["os_eco_2"], next: "os_eco_4" },
    "os_eco_4": { name: "Zanaat İşçiliği", cost: 80000, effect: { buildDiscount: 10 }, req: ["os_eco_3"], next: null },
    
    "os_mil_1": { name: "Okçuluk", cost: 25000, effect: { recruitDiscount: 2 }, req: [], next: "os_mil_2" },
    "os_mil_2": { name: "Piyade Teknolojisi", cost: 50000, effect: { recruitDiscount: 5 }, req: ["os_mil_1"], next: "os_mil_3" },
    "os_mil_3": { name: "Topçu", cost: 75000, effect: { artilleryDiscount: 10 }, req: ["os_mil_2"], next: "os_mil_4" },
    "os_mil_4": { name: "Denizcilik", cost: 100000, effect: { navyDiscount: 10 }, req: ["os_mil_3"], next: null },

    "os_gov_1": { name: "Merkezi İdare", cost: 30000, effect: { milUpkeepDiscount: 2 }, req: [], next: "os_gov_2" },
    "os_gov_2": { name: "Diplomasi", cost: 50000, effect: { milUpkeepDiscount: 3 }, req: ["os_gov_1"], next: "os_gov_3" },
    "os_gov_3": { name: "Adalet Sistemi", cost: 70000, effect: { milUpkeepDiscount: 5 }, req: ["os_gov_2"], next: "os_gov_4" },
    "os_gov_4": { name: "İstihbarat", cost: 90000, effect: { recruitDiscount: 5 }, req: ["os_gov_3"], next: null },

    "os_sci_1": { name: "Medrese", cost: 40000, effect: { buildDiscount: 2 }, req: [], next: "os_sci_2" },
    "os_sci_2": { name: "Matbaa", cost: 60000, effect: { taxBonus: 5 }, req: ["os_sci_1"], next: "os_sci_3" },
    "os_sci_3": { name: "Tıp Bilgisi", cost: 80000, effect: { buildDiscount: 5 }, req: ["os_sci_2"], next: "os_sci_4" },
    "os_sci_4": { name: "Astronomi", cost: 100000, effect: { navyDiscount: 5 }, req: ["os_sci_3"], next: null },

    "os_inf_1": { name: "Yol Ağı", cost: 30000, effect: { buildDiscount: 3 }, req: [], next: "os_inf_2" },
    "os_inf_2": { name: "Köprüler", cost: 50000, effect: { buildDiscount: 4 }, req: ["os_inf_1"], next: "os_inf_3" },
    "os_inf_3": { name: "Limanlar", cost: 70000, effect: { navyDiscount: 5 }, req: ["os_inf_2"], next: "os_inf_4" },
    "os_inf_4": { name: "Su Sistemleri", cost: 90000, effect: { buildDiscount: 5 }, req: ["os_inf_3"], next: null },

    // KIRIM
    "kr_eco_1": { name: "Hayvancılık", cost: 20000, effect: { taxBonus: 2 }, req: [], next: "kr_eco_2" },
    "kr_eco_2": { name: "Tarım", cost: 40000, effect: { taxBonus: 3 }, req: ["kr_eco_1"], next: "kr_eco_3" },
    "kr_eco_3": { name: "Ticaret", cost: 60000, effect: { taxBonus: 5 }, req: ["kr_eco_2"], next: "kr_eco_4" },
    "kr_eco_4": { name: "Atölyeler", cost: 80000, effect: { buildDiscount: 10 }, req: ["kr_eco_3"], next: null },

    "kr_mil_1": { name: "Süvari Birlikleri", cost: 25000, effect: { recruitDiscount: 5 }, req: [], next: "kr_mil_2" },
    "kr_mil_2": { name: "Okçuluk", cost: 50000, effect: { recruitDiscount: 5 }, req: ["kr_mil_1"], next: "kr_mil_3" },
    "kr_mil_3": { name: "Topçu", cost: 75000, effect: { artilleryDiscount: 10 }, req: ["kr_mil_2"], next: "kr_mil_4" },
    "kr_mil_4": { name: "Denizcilik", cost: 100000, effect: { navyDiscount: 10 }, req: ["kr_mil_3"], next: null },

    "kr_gov_1": { name: "Hanlık Yönetimi", cost: 30000, effect: { milUpkeepDiscount: 5 }, req: [], next: "kr_gov_2" },
    "kr_gov_2": { name: "Diplomasi", cost: 50000, effect: { milUpkeepDiscount: 2 }, req: ["kr_gov_1"], next: "kr_gov_3" },
    "kr_gov_3": { name: "Casusluk", cost: 70000, effect: { recruitDiscount: 5 }, req: ["kr_gov_2"], next: "kr_gov_4" },
    "kr_gov_4": { name: "Vergi Sistemi", cost: 90000, effect: { taxBonus: 5 }, req: ["kr_gov_3"], next: null },

    "kr_sci_1": { name: "İslam Bilimleri", cost: 40000, effect: { buildDiscount: 2 }, req: [], next: "kr_sci_2" },
    "kr_sci_2": { name: "Tıp", cost: 60000, effect: { buildDiscount: 5 }, req: ["kr_sci_1"], next: "kr_sci_3" },
    "kr_sci_3": { name: "Haritacılık", cost: 80000, effect: { navyDiscount: 5 }, req: ["kr_sci_2"], next: "kr_sci_4" },
    "kr_sci_4": { name: "Astronomi", cost: 100000, effect: { navyDiscount: 5 }, req: ["kr_sci_3"], next: null },

    "kr_inf_1": { name: "Kervan Yolları", cost: 30000, effect: { taxBonus: 2 }, req: [], next: "kr_inf_2" },
    "kr_inf_2": { name: "Limanlar", cost: 50000, effect: { buildDiscount: 3 }, req: ["kr_inf_1"], next: "kr_inf_3" },
    "kr_inf_3": { name: "Kale Güçlendirme", cost: 70000, effect: { buildDiscount: 5 }, req: ["kr_inf_2"], next: "kr_inf_4" },
    "kr_inf_4": { name: "Su Yapıları", cost: 90000, effect: { buildDiscount: 5 }, req: ["kr_inf_3"], next: null },

    // GÜNEŞ (ÇAĞATAY)
    "gn_eco_1": { name: "Tarım", cost: 20000, effect: { taxBonus: 2 }, req: [], next: "gn_eco_2" },
    "gn_eco_2": { name: "Hayvancılık", cost: 40000, effect: { taxBonus: 3 }, req: ["gn_eco_1"], next: "gn_eco_3" },
    "gn_eco_3": { name: "Ticaret", cost: 60000, effect: { taxBonus: 5 }, req: ["gn_eco_2"], next: "gn_eco_4" },
    "gn_eco_4": { name: "İpek Yolu", cost: 80000, effect: { taxBonus: 10 }, req: ["gn_eco_3"], next: null },

    "gn_mil_1": { name: "Süvari", cost: 25000, effect: { recruitDiscount: 5 }, req: [], next: "gn_mil_2" },
    "gn_mil_2": { name: "Okçuluk", cost: 50000, effect: { recruitDiscount: 5 }, req: ["gn_mil_1"], next: "gn_mil_3" },
    "gn_mil_3": { name: "Mancınık", cost: 75000, effect: { artilleryDiscount: 10 }, req: ["gn_mil_2"], next: "gn_mil_4" },
    "gn_mil_4": { name: "Zırh Teknolojisi", cost: 100000, effect: { milUpkeepDiscount: 10 }, req: ["gn_mil_3"], next: null },

    "gn_gov_1": { name: "Hanlık Yönetimi", cost: 30000, effect: { milUpkeepDiscount: 5 }, req: [], next: "gn_gov_2" },
    "gn_gov_2": { name: "Diplomasi", cost: 50000, effect: { milUpkeepDiscount: 2 }, req: ["gn_gov_1"], next: "gn_gov_3" },
    "gn_gov_3": { name: "Yazı ve Kayıt", cost: 70000, effect: { buildDiscount: 5 }, req: ["gn_gov_2"], next: "gn_gov_4" },
    "gn_gov_4": { name: "Vergi Sistemi", cost: 90000, effect: { taxBonus: 5 }, req: ["gn_gov_3"], next: null },

    "gn_sci_1": { name: "Astronomi", cost: 40000, effect: { navyDiscount: 5 }, req: [], next: "gn_sci_2" },
    "gn_sci_2": { name: "Matematik", cost: 60000, effect: { buildDiscount: 5 }, req: ["gn_sci_1"], next: "gn_sci_3" },
    "gn_sci_3": { name: "Tıp", cost: 80000, effect: { buildDiscount: 5 }, req: ["gn_sci_2"], next: "gn_sci_4" },
    "gn_sci_4": { name: "Uygur Yazısı", cost: 100000, effect: { taxBonus: 5 }, req: ["gn_sci_3"], next: null },

    "gn_inf_1": { name: "Yol Ağı", cost: 30000, effect: { buildDiscount: 3 }, req: [], next: "gn_inf_2" },
    "gn_inf_2": { name: "Kervansaray", cost: 50000, effect: { taxBonus: 2 }, req: ["gn_inf_1"], next: "gn_inf_3" },
    "gn_inf_3": { name: "Sulama Sistemleri", cost: 70000, effect: { buildDiscount: 5 }, req: ["gn_inf_2"], next: "gn_inf_4" },
    "gn_inf_4": { name: "Şehir Planlama", cost: 90000, effect: { buildDiscount: 5 }, req: ["gn_inf_3"], next: null }
};

const FACTION_TREES = {
    ottoman: {
        color: "#8b0000",
        bg: "linear-gradient(to bottom, rgba(74, 0, 0, 0.8), rgba(26, 0, 0, 0.9))",
        title: "OSMANLI İMPARATORLUĞU",
        subtitle: "Devlet-i Âliyye'nin gücü, ilimde, sanatta ve teknolojide saklıdır.",
        columns: [
            { title: "EKONOMİ", root: "os_eco_1" },
            { title: "ASKERİ", root: "os_mil_1" },
            { title: "YÖNETİM", root: "os_gov_1" },
            { title: "BİLİM & KÜLTÜR", root: "os_sci_1" },
            { title: "ALTYAPI", root: "os_inf_1" }
        ]
    },
    crimea: {
        color: "#00477e",
        bg: "linear-gradient(to bottom, rgba(0, 34, 68, 0.8), rgba(0, 10, 26, 0.9))",
        title: "KIRIM HANLIĞI",
        subtitle: "Bozkırın özgürlüğü, denizin gücüyle birleşir.",
        columns: [
            { title: "EKONOMİ", root: "kr_eco_1" },
            { title: "ASKERİ", root: "kr_mil_1" },
            { title: "YÖNETİM", root: "kr_gov_1" },
            { title: "BİLİM & KÜLTÜR", root: "kr_sci_1" },
            { title: "ALTYAPI", root: "kr_inf_1" }
        ]
    },
    sun: {
        color: "#b8860b",
        bg: "linear-gradient(to bottom, rgba(77, 57, 0, 0.8), rgba(26, 19, 0, 0.9))",
        title: "GÜNEŞ DEVLETİ",
        subtitle: "Gök kubbenin altında, atın izi ve bilginin ışığı.",
        columns: [
            { title: "EKONOMİ", root: "gn_eco_1" },
            { title: "ASKERİ", root: "gn_mil_1" },
            { title: "YÖNETİM", root: "gn_gov_1" },
            { title: "BİLİM & KÜLTÜR", root: "gn_sci_1" },
            { title: "ALTYAPI", root: "gn_inf_1" }
        ]
    }
};

function getEffectDesc(effect) {
    let desc = [];
    if(effect.taxBonus) desc.push(`Vergi +%${effect.taxBonus}`);
    if(effect.buildDiscount) desc.push(`Bina Mal. -%${effect.buildDiscount}`);
    if(effect.recruitDiscount) desc.push(`Asker Alımı -%${effect.recruitDiscount}`);
    if(effect.milUpkeepDiscount) desc.push(`Ordu Bakımı -%${effect.milUpkeepDiscount}`);
    if(effect.artilleryDiscount) desc.push(`Topçu Alımı -%${effect.artilleryDiscount}`);
    if(effect.navyDiscount) desc.push(`Gemi Alımı -%${effect.navyDiscount}`);
    return desc.join(", ");
}

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

    for (let techId in s.technologies) {
        if(s.technologies[techId] && ALL_TECHS[techId]) {
            let eff = ALL_TECHS[techId].effect;
            if(eff.taxBonus) bonus.taxBonus += eff.taxBonus;
            if(eff.buildDiscount) bonus.buildDiscount += eff.buildDiscount;
            if(eff.recruitDiscount) bonus.recruitDiscount += eff.recruitDiscount;
            if(eff.milUpkeepDiscount) bonus.milUpkeepDiscount += eff.milUpkeepDiscount;
            if(eff.artilleryDiscount) bonus.artilleryDiscount += eff.artilleryDiscount;
            if(eff.navyDiscount) bonus.navyDiscount += eff.navyDiscount;
        }
    }
    return bonus;
}

function getFactionKey(s) {
    const name = (s.name || "").toLocaleLowerCase('tr-TR');
    if (name.includes('osmanlı') || name.includes('osmanli') || name.includes('osmali') || name.includes('ottoman')) return 'ottoman';
    if (name.includes('kırım') || name.includes('kirim') || name.includes('crimea')) return 'crimea';
    if (name.includes('güneş') || name.includes('gunes') || name.includes('sun')) return 'sun';
    return 'ottoman'; // default to ottoman
}

function renderTechTree(s) {
    if(!s.technologies) s.technologies = {};
    const factionKey = getFactionKey(s);
    const treeData = FACTION_TREES[factionKey];
    
    // Add custom CSS for the tree layout
    let html = `
    <style>
        .tech-tree-container {
            background: ${treeData.bg};
            border: 2px solid ${treeData.color};
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            font-family: 'Oswald', sans-serif;
            overflow-x: auto;
        }
        .tech-tree-header h2 {
            margin: 0;
            color: ${treeData.color};
            font-size: 28px;
            text-shadow: 1px 1px 2px #000;
        }
        .tech-tree-header p {
            margin: 5px 0 20px;
            color: #ccc;
            font-size: 14px;
        }
        .tech-tree-grid {
            display: flex;
            justify-content: center;
            gap: 20px;
            min-width: 800px;
        }
        .tech-branch {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 150px;
            position: relative;
        }
        .tech-branch-title {
            color: #dfbe72;
            font-weight: bold;
            border: 1px solid #dfbe72;
            border-radius: 12px;
            padding: 4px 15px;
            margin-bottom: 20px;
            background: rgba(0,0,0,0.6);
            z-index: 2;
        }
        /* Vertical connection line */
        .tech-branch::before {
            content: '';
            position: absolute;
            top: 40px;
            bottom: 60px;
            left: 50%;
            width: 2px;
            background: #555;
            z-index: 1;
            transform: translateX(-50%);
        }
        .tech-node-wrapper {
            position: relative;
            z-index: 2;
            margin-bottom: 30px;
            width: 100%;
        }
        .tech-node {
            background: #111;
            border: 2px solid #444;
            border-radius: 8px;
            padding: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.6);
            transition: transform 0.2s;
            cursor: pointer;
        }
        .tech-node:hover {
            transform: translateY(-2px);
            border-color: #dfbe72;
        }
        .tech-node.unlocked {
            border-color: #28d17c;
            background: #0a1f11;
        }
        .tech-node.available {
            border-color: #dfbe72;
            background: #1a160b;
        }
        .tech-node.locked {
            opacity: 0.7;
            filter: grayscale(100%);
        }
        .tech-name {
            font-size: 13px;
            font-weight: bold;
            margin-bottom: 5px;
            color: #fff;
        }
        .tech-desc {
            font-size: 10px;
            color: #aaa;
            margin-bottom: 8px;
            min-height: 24px;
        }
        .tech-cost {
            font-size: 11px;
            font-weight: bold;
            color: #dfbe72;
            margin-bottom: 5px;
        }
        .tech-btn {
            width: 100%;
            padding: 4px;
            font-size: 10px;
        }
    </style>
    <div class="tech-tree-container">
        <div class="tech-tree-header">
            <h2>${treeData.title}</h2>
            <p>${treeData.subtitle}</p>
        </div>
        <div class="tech-tree-grid">
    `;
    
    const canManage = (typeof isAdmin !== 'undefined' && isAdmin) || (s.ownerEmail === currentUserEmail);

    treeData.columns.forEach(col => {
        html += `<div class="tech-branch"><div class="tech-branch-title">${col.title}</div>`;
        
        let currNodeId = col.root;
        while(currNodeId) {
            const tech = ALL_TECHS[currNodeId];
            if(!tech) break;
            
            const isUnlocked = !!s.technologies[currNodeId];
            const canUnlock = tech.req.every(rId => !!s.technologies[rId]);
            const isAffordable = s.treasury >= tech.cost;
            
            let stateClass = "locked";
            if (isUnlocked) stateClass = "unlocked";
            else if (canUnlock) stateClass = "available";
            
            let btnHtml = "";
            if(isUnlocked) {
                btnHtml = `<button class="btn green tech-btn" disabled>AÇILDI</button>`;
            } else if(!canManage) {
                btnHtml = `<button class="btn tech-btn" disabled>YETKİ YOK</button>`;
            } else if(canUnlock) {
                if(isAffordable) {
                    btnHtml = `<button class="btn gold tech-btn" onclick="researchTech('${s.id}', '${currNodeId}')">ARAŞTIR</button>`;
                } else {
                    btnHtml = `<button class="btn tech-btn" disabled style="color:var(--red);">YETERSİZ</button>`;
                }
            } else {
                btnHtml = `<button class="btn tech-btn" disabled>KİLİTLİ</button>`;
            }
            
            html += `
            <div class="tech-node-wrapper">
                <div class="tech-node ${stateClass}">
                    <div class="tech-name" style="${isUnlocked ? 'color:#28d17c;' : ''}">${tech.name}</div>
                    <div class="tech-desc">${getEffectDesc(tech.effect)}</div>
                    <div class="tech-cost">💰 ${money(tech.cost)}</div>
                    ${btnHtml}
                </div>
            </div>`;
            
            currNodeId = tech.next;
        }
        
        html += `</div>`; // end branch
    });
    
    html += `</div></div>`;
    return html;
}

function researchTech(stateId, techId) {
    const s = getState(stateId);
    if(!s) return;
    if(!isAdmin && s.ownerEmail !== currentUserEmail) return;
    
    const tech = ALL_TECHS[techId];
    if(!tech) return;
    
    if(!s.technologies) s.technologies = {};
    if(s.technologies[techId]) {
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
    s.technologies[techId] = true;
    
    if(typeof addLog === 'function') {
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
    }
    
    if(typeof queueSave === 'function') queueSave();
    if(typeof openDetail === 'function') openDetail(stateId);
}
