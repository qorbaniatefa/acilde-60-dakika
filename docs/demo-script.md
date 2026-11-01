# 60 saniyelik demo

**Durum:** [Demo MP4](../artifacts/demo/acilde-60-dakika.mp4) hazır: 59,72 saniye, 376×812, H.264. Kendi PowerShell'inde çalıştırdığın 12/12 başarılı Cypress koşusunun [test videosu](../artifacts/cypress/videos/adventure.cy.ts.mp4) ayrıca korunuyor.

Demo, yerel uygulamanın gerçek kullanıcı akışını Playwright ile kaydeder. Öğretmen isteği gerçek `/api/tutor` çağrısıdır: HTTP 200, model `gemini-3.5-flash-lite`, prompt 1.2.0. Hazır yanıt eklenmedi. Kayıt ve soru metni `checks/2026-11-01-demo/recording.json`, süre/hash/görsel kontrol bilgileri `checks/2026-11-01-demo/verification.json` içinde.

Başlangıçtaki sayfa yükleme beklemesi kesildi; gerçek profil ekranı üç saniye gösterildi, kapanış ekranı kısa süre sabit tutuldu. Oyun ve yanıtlar değiştirilmedi; oynatma hızı değişmedi. Video bütünüyle çözümlendi ve öğretmen/son/yeniden başlatma görüntüleri kontrol edildi. Bu kayıt, başarısız bağlantı taklidini kullanan Cypress test videosundan ayrıdır.

Kayıtta izlenen akış:

- **00–10 sn:** Girişte üç soruyu göster; seviye, rol ve hedef seçip nöbete başla.
- **10–20 sn:** Mimari kararını seç; “Ne oldu?” ve “Neden oldu?” açıklamalarını göster.
- **20–35 sn:** Öğretmene kısa gerekçe gönder, gerçek modelin verdiği düşünme sorusunu göster. Servis bağlantısı yoksa çalışıyormuş gibi sabit yanıt koyma; çekimden önce bağlantıyı düzelt.
- **35–45 sn:** İkinci ve üçüncü kararları tamamla.
- **45–55 sn:** Sonu ve üç kararın özetini göster.
- **55–60 sn:** Yeniden oyna; profilin temizlendiğini göster.

Zamanlar çekim planının yaklaşık hedefleridir; nihai video akışı aynı sırayla gösterir. Gerçek 20 yanıtlık değerlendirme ve 12 testlik Cypress koşusu kayıt öncesinde tamamlandı. Kalan iş, videoyu paylaşılabilir bir bağlantıyla yayımlayıp GitHub/video bağlantılarını README'ye eklemektir.
