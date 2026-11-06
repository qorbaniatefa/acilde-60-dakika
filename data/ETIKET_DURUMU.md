# Veri kökeni ve etiket kalitesi — 6 Kasım 2026

Kullanıcı, insan davranışı içeren 15 oturumun tamamını kendisinin oynadığını ve açıklama isteği Evet/Hayır etiketlerini rastgele seçtiğini bildirdi. Önceki üç gönüllü planı uygulanmış kabul edilmez. Bu kayıtlar gerçek insan davranışı içerir; `kaynak=gercek` değeri değiştirilmez. Ancak rastgele hedefler gerçek öğrenme tercihi olarak geçerli değildir.

- Etkin eğitim: `oturumlar.csv`, **180 sentetik oturum / 540 satır**, seed=42.
- Dışlanan davranış kayıtları: `arsiv/tek-oyuncu-rastgele-etiketler.csv`, **tek kişi / 15 oturum / 45 satır**. Orijinal etiketler korunur.
- Tam eski karma veri yedeği: `arsiv/oturumlar-karisik-2026-11-06.csv`, 585 satır. Önceki başarısız eval'in bağlamını korur; eğitim girdisi olarak kullanılmaz.
- Makineyle okunur dışlama listesi: `etiket_kalitesi.json`. Bu UUID'lerin tekrar eğitim, birleştirme veya yayına girmesi reddedilir.

Kullanıcının seçimiyle yalnız sentetik pilot hazırlanır. Yönergedeki yalnız sentetik veri sınırlaması gereği Veri kalemi yarım değerlendirilir; diğer kalemler kendi kanıtlarına bağlıdır. Bu karar doğruluk eşiğini düşürmez. İnsan davranışı kaydı sayısı, geçerli tercih etiketi veya gerçek kullanıcı başarısının kanıtı olarak kullanılmaz.

İlk gerçek değerlendirmedeki .50 sonucu geriye dönük olarak silinmez; sonradan açıklanan etiket kalitesi problemiyle birlikte raporlanır. Yeni sentetik modelin .7686 başarısı yalnız üretici simülasyonuna aittir.
