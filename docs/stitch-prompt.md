# Google Stitch için hazır tasarım metni

Aşağıdaki metni Google Stitch'te yeni bir tasarım oluştururken kullan. Bu dosya tasarım brief'idir; üretilmiş ekran veya Stitch çıktısı değildir.

---

“Acilde 60 Dakika” adında, Türkçe ve mobil öncelikli bir eğitim macerası için birbiriyle tutarlı üç ekran türü tasarla: giriş, sahne ve son. Hedef kullanıcı yazılım mühendisliği öğrencisi. Hikâye kurgusal bir hastanenin acil servisinde geçiyor. Yoğunluk hasta kayıt uygulamasını yavaşlatmış; oyuncu nöbetçi yazılım mühendisi olarak üç teknik karar veriyor. Gerçek hasta verisi kullanma.

## Tasarım karakteri

- Bir gece nöbeti macerası hissi ver: kısa ekip mesajları, nöbet saati, teknik bildirimler ve bölüm ilerlemesi.
- Ciddi ve okunabilir bir arayüzü, karakterli bir hikâye anlatımıyla birleştir. Korku, kan, yaralı hasta görseli, puan yağmuru veya çocuklara yönelik çizgi film estetiği kullanma.
- Koyu lacivert `#0B1424` zemin, biraz daha açık `#152238` yüzeyler, amber `#FFB454` ana vurgu, kırık beyaz `#F4F1E9` metin. Başarıda yeşil, sorunda mercan kırmızısı kullan; anlamı yalnızca renkle aktarma.
- Türkçe karakterleri eksiksiz destekleyen okunabilir bir yazı ailesi seç. Gövde metni en az 16 piksel olsun. Küçük teknik durum etiketleri için monospace kullanılabilir.
- 375 piksel genişlikte yatay kaydırma olmasın. Dokunma alanları en az 44 piksel olsun. Masaüstünde içerik rahat okunabilen ortalanmış bir genişliğe otursun.
- Ece ve Deniz için aynı görsel dilde küçük avatarlar veya açık ad etiketleri kullan. Üç ekran arasında renk, tipografi ve düğme biçimleri tutarlı olsun.

## Ekran 1 — Nöbete giriş

Başlık: “Acilde 60 Dakika”

Kısa giriş: “Kayıt ekranları donuyor. Bekleyenler artıyor. Bu gece nöbet sende.”

Küçük etiket: “Tek hikâye · 3 karar · 2 son”

Üç zorunlu soruyu tek ekranda göster:

1. “Seviyen?” — “Yeni başlayan”, “Deneyimli”
2. “Rolün?” — “Geliştirici”, “Test mühendisi”
3. “Öğrenme hedefin?” — “Mimari”, “Test”, “Veri güvenliği”

Ana düğme: “Nöbete başla”. Sorular tamamlanmadığında devre dışı ve anlaşılır olsun.

Alt bilgi: “Yaklaşık 5–8 dakika. Tüm olaylar ve kayıtlar kurgusaldır.” Başlıktaki 60 dakika hikâye zamanıdır; geri sayım ekleme.

## Ekran 2 — Hikâye sahnesi

Üç kararda tekrar kullanılacak ekran türünü, ilk kararın içeriğiyle tasarla.

Üstte “Gece nöbeti · 20.00”, “Karar 1 / 3” ve bölüm başlığı “Yoğunluğu yönet” bulunsun.

Ece'nin mesajı: “Kayıt ekranları yine yanıt vermiyor. Aynı işlem için tekrar tekrar deniyorlar.”

Deniz'in mesajı: “Veritabanına erişebiliyoruz. Eşzamanlı istekler kapasiteyi aşıyor. Mevcut kalıcı kuyruk desteği şu an kapalı.”

Teknik durum kartında “İstek yoğunluğu: yüksek” ve “Kayıt akışı: yavaş” yazsın. Bunlar kurgusal hikâye göstergeleridir; gerçek izleme paneli gibi canlı veri iddia etmesin.

Karar sorusu: “İlk müdahalen ne olacak?”

İki eşit görsel ağırlıkta seçenek:

- A — “Kalıcı kuyruğu ve eşzamanlı işlem sınırını etkinleştir.”
- B — “Sınırsız eşzamanlı istek kabul etmeyi sürdür.”

Seçim öncesinde bir seçeneği doğru gibi yeşile boyama, onay işareti ekleme veya görsel olarak öne çıkarma.

Ayrı bir “AI öğretmenin” alanı bulunsun. İçinde “Nasıl düşündüğünü yaz…” etiketli bir metin alanı ve “İpucu iste” düğmesi yer alsın. Açıklama: “Cevabı söylemez, düşünmene yardımcı olur.”

Genel örnek ipucu: “Mevcut kapasite ile gelen istek sayısı arasındaki farkı nasıl gözlemleyebilirsin?”

Seçimden sonraki aynı ekran durumunda iki ayrı alan gösterilebilsin: “Ne oldu?” ve “Neden oldu?”. Örnek sonuç: “İstekler kontrollü işlenmeye başladı.” Örnek neden: “Aynı anda çalışan işlem sayısı sınırlandı; bekleyen işler kalıcı kuyrukta tutuldu.” Altında “Devam” düğmesi olsun. Bu alanları karar verilmeden önce görünür kılma.

İkinci bölümde zaman aşımı ayarının yük ve kayıt akışı testleri, üçüncü bölümde hata kaydından kişisel alanları çıkararak ekibi bilgilendirme ele alınacak. Üçü için ayrı ekran tasarlamak yerine aynı sahne bileşenini kullan.

## Ekran 3 — Nöbetin sonu

Aynı ekran türünün iyi ve kötü son durumunu tasarla; iki ayrı görsel durum aynı yapıyı kullansın.

İyi son başlığı: “Nöbet Kontrol Altında”

İyi son metni: “Kayıt akışı toparlandı. Müdahale test edildi, teknik kayıtlar kişisel bilgiler çıkarılarak paylaşıldı.”

Ece'nin mesajı: “Kayıt masası yeniden çalışıyor. Artık işlemleri takip edebiliyoruz.”

Kötü son başlığı: “Krizin Bedeli”

Kötü son için örnek metin: “Sistem çalışıyor, ancak hata kaydında gereksiz kişisel bilgiler paylaşıldı.” Bu, yalnızca üçüncü kararın hatalı olduğu bir örnektir. Kötü son her zaman sistemin çöktüğünü söylemesin; açıklama oyuncunun kararlarına göre değişebilsin.

Her iki durumda üç kararın kısa özeti ve “Bu nöbetten öğrendiğin” alanı olsun. Her özetin metinle ifade edilen bir durumu bulunsun.

Ana düğme: “Yeniden oyna”. Yeni oyunda profil soruları tekrar yanıtlanacak.

## Kapsamı koru

Hesap oluşturma, giriş yapma, hasta listesi, gerçek kimlik bilgisi, gerçek tıbbi yönlendirme, ikinci hikâye, liderlik tablosu veya ödeme ekranı ekleme. Animasyon, ses ve gerçek geri sayım istemiyorum.

Üç ekran türünü aynı tasarım sistemiyle üret. Projenin tasarım kurallarını `DESIGN.md` olarak dışa aktarmaya uygun şekilde düzenle.

---

## Tasarım üretildikten sonra

Üç ekranın görsellerini/kodunu ve varsa `DESIGN.md` dosyasını dışa aktar. Orijinal çıktıları `design/stitch/` altında saklayacağız; `DESIGN.md` proje köküne konacak. Dosya adları veya dışa aktarma menüsü araç sürümüne göre değişirse gerçek çıktıyı esas al.

Bu adım tamamlanınca ekranlar, `DESIGN.md` ve `spec.md` ile AI Studio aşamasına geçilir.
