// js_modulleri/14_savas_botu.js

// DİKKAT: Bu API anahtarı sadece test amaçlıdır. Canlıya alırken Supabase Edge Functions'a taşınmalıdır.
const GEMINI_API_KEY = "AQ.Ab8RN6JkzqvOWl9jucgvfZEDMDhCQiUz1b2hzLQ0vlzyu1qXgw";

async function callGeminiAPI(promptText) {
    if (!GEMINI_API_KEY) {
        console.error("Lütfen 14_savas_botu.js dosyasındaki GEMINI_API_KEY değişkenine kendi API anahtarınızı yapıştırın.");
        return null;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const payload = {
        contents: [{
            parts: [{ text: promptText }]
        }],
        generationConfig: {
            responseMimeType: "application/json"
        }
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Gemini API Hatası:", errorData);
            return null;
        }

        const data = await response.json();
        const textResult = data.candidates[0].content.parts[0].text;
        return JSON.parse(textResult);
    } catch (error) {
        console.error("İstek sırasında hata oluştu:", error);
        return null;
    }
}

async function aiTaktikUret(savasVerileri) {
    const prompt = `
    Sen üst düzey bir askeri kurmay zekasın. Aşağıdaki sunucu verilerini analiz et.
    Genel askeri doktrinleri kullanarak, her iki takımın avantajlarını en iyi şekilde kullanabileceği 3'er adet gerçekçi taktik öner.
    
    Sunucu Verileri:
    ${JSON.stringify(savasVerileri, null, 2)}
    
    Cevabını SADECE şu JSON formatında ver:
    {
        "a_takimi_taktikleri": ["Taktik 1", "Taktik 2", "Taktik 3"],
        "b_takimi_taktikleri": ["Taktik 1", "Taktik 2", "Taktik 3"]
    }
    `;
    
    console.log("Kurmay heyeti toplanıyor... Taktikler belirleniyor...");
    return await callGeminiAPI(prompt);
}

async function aiSavasiCozumle(savasVerileri, aTaktigi, bTaktigi) {
    const prompt = `
    Sen acımasız ve tamamen gerçekçi bir savaş simülatörüsün. Görevin, verilen ham askeri güçleri arazi ve taktiklerle harmanlamaktır.

    KURAL 1: Taktikler ve arazi, ham gücü en fazla +%30 veya -%30 etkileyebilir. 
    KURAL 2: Mantıksal çıkarım yap. (Örn: Çamurlu arazide ağır süvari hücumu hız avantajını kaybeder.) Sabit kurallar yoktur, durumun dinamiklerine göre taktiklerin birbirine üstünlüğünü analiz et.
    KURAL 3: Savaşın sonucunu önce analiz et, kayıpları bu analize göre belirle.

    Sunucu Verileri: ${JSON.stringify(savasVerileri)}
    A Takımının Hamlesi: ${aTaktigi}
    B Takımının Hamlesi: ${bTaktigi}

    Cevabını SADECE aşağıdaki JSON formatında ver. JSON dışında hiçbir metin yazma:
    {
        "adim_1_arazi_analizi": "Arazinin iki ordu tipine olan avantajı/dezavantajı nedir?",
        "adim_2_taktik_carpismasi": "A takımının taktiği ile B takımının taktiği bu arazide karşılaştığında mantıksal olarak kimin taktiği diğerini boşa düşürdü?",
        "adim_3_guc_degisimi": "Seçilen taktiklere göre güç dengesi kime kaydı?",
        "savas_raporu": "Tüm bu adımları özetleyen, destansı ama gerçekçi ve soğukkanlı nihai savaş raporu.",
        "a_takimi_kayip_yuzdesi": 45,
        "b_takimi_kayip_yuzdesi": 80,
        "kazanan": "A Takımı veya B Takımı veya Beraberlik"
    }
    `;
    
    console.log("Savaş meydanında kan dökülüyor... Çarpışma simüle ediliyor...");
    return await callGeminiAPI(prompt);
}

// Test fonksiyonu: Tarayıcı konsolundan testSavasBotu() yazarak çalıştırabilirsiniz.
async function testSavasBotu() {
    const savasVerisi = {
        "arazi_ve_hava": "Açık bozkır, zemin kuru. Rüzgarsız ve görüş mesafesi yüksek.",
        "a_takimi": {
            "isim": "Osmanlı Ordusu",
            "birlikler": "5000 Zırhlı Mızraklı Piyade, 2000 Arbaletçi",
            "carpanlar": { "saldiri_gucu": 0.8, "savunma_gucu": 1.6, "moral": 1.2, "hareket_hizi": 0.7 }
        },
        "b_takimi": {
            "isim": "Kırım Hanlığı",
            "birlikler": "4000 Ağır Süvari, 1000 Atlı Okçu",
            "carpanlar": { "saldiri_gucu": 1.8, "savunma_gucu": 0.9, "moral": 1.0, "hareket_hizi": 1.5 }
        }
    };

    console.log("--- SAVAŞ SİMÜLASYONU TESTİ BAŞLIYOR ---");
    
    // 1. Taktik Üret
    const taktikler = await aiTaktikUret(savasVerisi);
    if (!taktikler) return;

    console.log("A Takımı Taktikleri:", taktikler.a_takimi_taktikleri);
    console.log("B Takımı Taktikleri:", taktikler.b_takimi_taktikleri);

    // 2. Rastgele Taktik Seç
    const secilenA = taktikler.a_takimi_taktikleri[0];
    const secilenB = taktikler.b_takimi_taktikleri[1];
    console.log(`\nSeçilen Taktikler:\n${savasVerisi.a_takimi.isim}: ${secilenA}\n${savasVerisi.b_takimi.isim}: ${secilenB}\n`);

    // 3. Savaşı Çözümle
    const sonuc = await aiSavasiCozumle(savasVerisi, secilenA, secilenB);
    if (!sonuc) return;

    console.log("=== SAVAŞ RAPORU ===");
    console.log("Arazi Analizi:", sonuc.adim_1_arazi_analizi);
    console.log("Taktik Çarpışması:", sonuc.adim_2_taktik_carpismasi);
    console.log("Güç Değişimi:", sonuc.adim_3_guc_degisimi);
    console.log("\nNihai Rapor:", sonuc.savas_raporu);
    console.log(`\nKayıplar:\n${savasVerisi.a_takimi.isim}: %${sonuc.a_takimi_kayip_yuzdesi}\n${savasVerisi.b_takimi.isim}: %${sonuc.b_takimi_kayip_yuzdesi}`);
    console.log(`Kazanan: ${sonuc.kazanan}`);
}

window.testSavasBotu = testSavasBotu;
