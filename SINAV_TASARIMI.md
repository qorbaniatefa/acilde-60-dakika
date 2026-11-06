# Benimle uyumlanan klasik vize — 1 sayfa

**Senaryo (25 dakika, kapalı kitap):** “Acilde 60 Dakika” ekibindesin. Yeni küçük model daha uzun açıklama açıyor. Python oracle'ın 300 girdisinden 299'u web ile 0.00003 fark veriyor; birinde fark 0.00012. Kabul toleransı **fark<0.0001**. Model 15 gerçek oturumda dengeli doğrulukta 0.80 elde ediyor; önceki 12 hikâye testinden biri üçüncü sahneye ilerlemiyor. Eğitici “Doğruluk yükseldi; herkese yayınlayalım” diyor. Oyuncu “Açıklamalar daha uzun ama kavramı daha iyi anladığım söylenemez” diyor.

**Tek bütünlüklü soru:** Yayın kararını gerekçelendir. İlk inceleyeceğin kanıtı, nedenini ve sonraki deneyini yaz; şu bağları kur:

1. Python neden oracle olabilir; neyi tek başına bilemez? Bir sapmayı toleransla değerlendir. Tek hatayı 299 doğru içinde eritmenin sonucu nedir? Özellik sırası ve ONNX/config sürümünü nasıl kontrol edersin?
2. Parite, karakterizasyon ve regresyon testleri hangi ayrı soruları sorar? Eski beklentiyi yeni davranışa uydurmak ne zaman hatayı saklar?
3. “Gereksinime uygun model” ile “oyuncunun öğrenmesine yardım” iddialarını doğrulama/geçerleme bakımından ayır. Öğrenme kazanımı için etik küçük deney öner; destek öz bildirimi skoru neden yeterli değildir?
4. Aynı gönüllü beş oyun oynadıysa rastgele satır ayrımının riski nedir? Oturum ayrımı neyi düzeltir, kişi düzeyinde neyi çözmez? Sınıf dağılımı neden önemlidir?
5. Shadow, %5 canary ve ilerleyen yüzdelerde hangi kanıtla durur/devam edersin? Commit sabitleme ve config'i birlikte geri almayı olayla ilişkilendir.

**Uyumlanma:** Öğrenci başta güçlü alanını “test” veya “dağıtım” seçer. Senaryo/kavramlar aynıdır; test seçen 1–2 için karşı örnek, dağıtım seçen 4–5 için başarısızlık senaryosu üretir. Diğer maddeleri de gerekçelendirir. Terim tanımı tek başına puan getirmez; doğru bağ ve somut karşı örnek değerlendirilir. Öğretim öncesi/sonrası farklı senaryolarla kavram aktarımı ölçülür.

**Beklediğim kavramlar / çeldiriciler:** Yayın durmalı: tek parite sapması kapıyı ihlal eder, kırık regresyon bağımsız engeldir. Oracle insan için faydayı ispatlamaz. %80 doğruluk bütün testleri karşılamaz. Karakterizasyon eski davranışı kaydeder, doğruluğunu garanti etmez. 300 girdi bütün uzayı kapsamaz. Shadow sonucu değiştirmez, canary küçük grupta değiştirir. Hash kaliteyi, verinin gerçekliğini veya öğrenmeyi kanıtlamaz.

*Codex ile hazırlanmış taslak; öğrencinin kendi görüşüyle elle düzenlemesi henüz bekleniyor.*
