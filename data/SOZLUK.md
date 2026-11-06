# Veri sözlüğü — Primer v2

Her satır bir karardır. Her tamamlanmış oturumda sahne 1, 2 ve 3 birer kez bulunur. CSV UTF-8 (BOM kabul edilir), ondalık ayırıcı nokta, alan ayırıcı virgüldür. Eğitim eksik/tekrarlı sahneleri ve sözlük dışı sütunları reddeder.

| Sütun | Anlam / birim | Aralık |
|---|---|---|
| oturum_id | Oturum başında rastgele UUID; kişi veya cihaz kimliği değildir | metin |
| kaynak | Gerçek gönüllü oyunu veya açıkça sentetik üretim | gercek / sentetik |
| bekleme_sn | Sahnenin açılışından seçenek tıklamasına kadar duvar saati; iki ondalık, 180 sn'de kırpılır | 0–180 sn |
| duzenleme_sayisi | Düşünce defterindeki input değişim olayı sayısı; bir tuş da bir olaydır, anlamsal revizyon sayısı değildir. Metin saklanmaz | 0–60 olay |
| onceki_yanlis | Yalnız önceki sahnelerdeki B kararlarının sayısı; mevcut kararın sonucu dahil değil | 0–2 |
| onceki_ipucu | Yalnız önceki sahnelerdeki manuel öğretmen gönderim denemeleri; bağlantı hataları da sayılır | 0–6 |
| sahne_no | Hikâyedeki karar sırası | 1 / 2 / 3 |
| deneyim | Başlangıçta gönüllünün seçtiği öğrenme seviyesi | 0=yeni, 1=deneyimli |
| destek_istegi | Seçimden sonra **sonuç görünmeden önce** “Bu sahnede daha ayrıntılı açıklama ister miydin?” yanıtı | 0=hayır, 1=evet |

Model girdileri yukarıdaki altı sayısal sütundur; kimlik, kaynak ve hedef girdiye girmez. Hedef bir psikolojik tanı veya doğru/yanlış etiketi değil, öğrenme tercihidir. Sabit kuralla davranıştan türetilmez; gerçek oturumda oyuncu söyler.

## Gerçek veri toplama protokolü

1. En az üç gönüllüye beşer tam oyun oynat; toplam **en az 15 gerçek oturum, 45 satır**. Gönüllülere öğrenci oldukları söylenebilir; adları ve kişi eşleştirmesi kaydedilmez. Farklı kişilerden çeşitlilik sağlamak insan sorumluluğudur; CSV bunu doğrulayamaz.
2. Başlangıçta veri toplama rızası işaretlenir. Mevcut hikâye ve manuel öğretmen kullanılabilir; yeni modelin ek desteği kapalıdır. Kişisel bilgi yazmamaları söylenir.
3. Her kararda sonuçtan önce etiket seçilir; üçüncü etiketten sonra tamamlanmış oturum ihraca eklenir. Yeniden başlatma yeni UUID ve yeni rıza gerektirir. Tamamlanmamış oyun ihraca girmez.
4. Oturumlar yalnız sekme belleğinde tutulur. Sekmeyi kapatmadan CSV indir. Farklı cihazların CSV'lerini `python scripts/merge-data.py dosya1.csv dosya2.csv` ile birleştir. Betik mevcut sentetik satırları korur ve çakışan etiketleri reddeder.
5. Otomasyon, Cypress ve demo verisini gerçek CSV'ye ekleme. Deneyi yapan kişinin gerçek insan beyanı otomatik araçla kanıtlanamaz.

## Gizlilik ve sınırlar

Ad, e-posta, cihaz kimliği, konum, IP, ham tıklama koordinatı ve gerekçe metni bu CSV'ye girmez. Veri toplama **sunucuya gönderilmez**. Ayrı, isteğe bağlı v1 Gemini öğretmenine gönderilen düşünce metni mevcut `/api/tutor` akışını kullanır; bu istek CSV toplama değildir. Statik GitHub Pages'te bu sunucu olmadığı için manuel öğretmen kullanılamaz, küçük model ve hikâye çalışabilir.

Tekrarlı oynama öğrenme etkisi yaratır. Aynı kişiden farklı oturumlar bulunduğu için oturum ayrımı kişi düzeyinde bağımsızlık kanıtlamaz. Cihaz uykuya girerse bekleme süresi artabilir; yavaş düşünmek destek ihtiyacı demek değildir. Bunlar model kartında sınır olarak tutulur.

6 Kasım kullanıcı açıklaması ve sentetik pilot seçimi sonrası etkin `oturumlar.csv` yalnız **180 sentetik oturum / 540 satır** içerir. İnsan davranışı içeren 15 oturum/45 satırın tamamı tek kişi tarafından oynanmış ve tercih hedefleri rastgele seçilmiştir. Kaynak ve etiketler değiştirilmeden `arsiv/` içine alındı, eğitimden dışlandı. Geçerli gerçek tercih verisi veya üç gönüllü kanıtı sayılmaz. [Etiket durumu](ETIKET_DURUMU.md) ve `etiket_kalitesi.json` dışlama listesini açıklar; yukarıdaki gerçek veri protokolü gelecek deneyler içindir.
