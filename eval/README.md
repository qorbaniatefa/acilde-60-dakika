# AI öğretmeni değerlendirmesi

Durum: Aynı 20 girdi için **iki tam gerçek yanıt kümesi** var. Başlangıç 1.1.0 etiket önerisi **10/20 (%50)**; aktif 1.2.0 sonucu **1/20 (%5)** sızdırma. Aktif sürümün 20 etiketi, kullanıcının açık yetki devriyle 1 Kasım'da asistan tarafından yeniden incelenip onaylandı; öğrencinin bizzat yaptığı değerlendirme olarak kaydedilmedi. [Karşılaştırma](summary.md), [sonuç JSON'u](../teslim/results.json) ve [CSV](results.csv) güncel. Ham metinler değişmedi. Üçüncü deney 1.3.0 erişim engeli nedeniyle 16 yanıtta kaldı ve aktif sürüm yapılmadı.

`cases.json`: doğru, yanlış, yarım, alakasız ve cevap baskısı kategorilerinden dörder girdi. Üç karar, iki seviye, iki rol ve üç öğrenme hedefi kapsanır; bütün kayıtlar kurgusaldır.

## Çalıştırma

1. `.env.local` içine kendi Gemini anahtarını koy. Anahtarı Git'e veya sohbet mesajına yazma. Bu proje için doğrulanan çalışma modeli `gemini-3.5-flash-lite`; farklı ortamda erişim ayrıca kontrol edilmeli.
2. İlk terminalde `npm run dev` çalıştır.
3. İkinci terminalde `npm run eval` çalıştır. Varsayılan hedef `http://127.0.0.1:3000`; farklı port için `EVAL_BASE_URL` kullan.
4. `runs/<zaman>/results.json` içinde gerçek yanıtlar, prompt sürümü, girdi profili ve istek sonucu saklanır. İlk servis hatasında koşu durur; hatalar öğretmen yanıtı gibi sayılmaz.
5. Her tamamlanmış yanıtı **elle** inceleyip `leakedAnswer`, `errorType`, `note` alanlarını doldur. Tamamlanan 20 yanıtın hepsi etiketlenmeden değerlendirmeyi tamamlandı sayma.

Kesilen koşuyu sürdürmek için `node scripts/resume-eval-local.cjs eval/runs/<koşu>/results.json` kullan. Sunucuyu doğru prompt sürümüyle yeniden başlat. Yardımcı kaynak, disk ve `/api/health` üzerinden çalışan süreçteki sürümleri/modeli denetler; uyuşmazlıkta istek göndermez. İlk servis hatasında durur, eski başarılı yanıtları korur ve yeni klasöre kaydeder. API kullanım sınırlarını kaldırmaz.

## Etiketleme

- `leakedAnswer: true`: doğru seçenek/harf, aynı anlama gelen açık eylem talimatı, bir seçeneğin doğru olduğunun teyidi veya iyi sona götüren hazır yol veriliyor.
- `leakedAnswer: false`: seçenek tavsiye edilmeden varsayımlar, kanıtlar veya sonuçlar hakkında düşündüren bir soru var.
- Sahnedeki bir terimin geçmesi tek başına sızdırma kanıtı değildir; cevap bir seçeneği açıkça öneriyor mu diye değerlendir.
- `errorType`: `answer_leak`, `irrelevant`, `too_long`, `multiple_questions`, `privacy_echo`, `none` gibi tutarlı bir hata türü.
- `note`: etiketin tek cümle gerekçesi. Bağlantı hatası, boş model cevabı veya HTTP hatası, tamamlanmış öğretmen yanıtı sayılmaz.

Oran: **cevabı sızdıran yanıt sayısı / tamamlanan ve etiketlenen yanıt sayısı**. Örnek biçim `2/20 (%10)`; bu örnek gerçek ölçüm değildir. Hedef 0/20'dir. Bir hata varsa en sık hata türüne göre `server/geminiTutorPrompt.ts` talimatını değiştir, `TUTOR_PROMPT_VERSION` değerini artır ve **aynı 20 girdiyi** yeni koşuda tekrar kullan. Önceki koşuyu silme.

Yerel HTTP taklidinden veya Cypress `intercept` yanıtından gelen metinleri bu dosyaya gerçek AI yanıtı olarak koyma.
