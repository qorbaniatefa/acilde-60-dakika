# Acilde 60 Dakika — Uygulama Tasarım Kuralları

30 Ekim 2026. Bu dosya, kullanıcının getirdiği gerçek Stitch çıktılarının uygulama için düzenlenmiş sürümüdür. Özgün dosyalar değiştirilmemiştir. Davranış konusunda `spec.md`, görünüm konusunda aşağıdaki ekranlar ve burada belirtilen ortak kurallar esas alınır.

## Kaynaklar

- `stitch_acilde_60_dakika/ekran_1_n_bete_giri/screen.png` ve `code.html`: giriş.
- `stitch_acilde_60_dakika/ekran_2_hik_ye_sahnesi/screen.png` ve `code.html`: sahne.
- `stitch_acilde_60_dakika/ekran_3_n_betin_sonu/screen.png` ve `code.html`: son; HTML içinde iyi ve kötü durum örnekleri bulunur.
- `stitch_acilde_60_dakika/nocturnal_systems_console/DESIGN.md`: dışa aktarılan tasarım sistemi.
- `stitch_acilde_60_dakika/design.md_acilde_60_dakika.md`: açıklayıcı tasarım özeti.

Özgün tasarım sisteminin açıklama metni, YAML renkleri ve HTML arasında küçük farklar vardır. Aşağıdaki palet, üç HTML'de ortak kullanılan gerçek `tailwind.config` değerlerini esas alır; iki farklı palet bir arada uygulanmaz. Hedef kitle, özgün sistem açıklamasındaki profesyonel SRE kitlesi yerine onaylı spec'teki yazılım mühendisliği öğrencileridir.

## Görsel yön

Gece nöbeti atmosferinde, karakter mesajlarıyla ilerleyen teknik macera. Koyu lacivert yüzeyler, amber aksiyonlar ve okunaklı metinler kullanılır. Ece ve Deniz'in adları görünür; AI öğretmeni ekip diyaloğundan ayrı bir bölümde bulunur. Kan, korku, gerçek hasta görselleri, puan yağmuru ve çocuklara yönelik çizgi film estetiği kullanılmaz.

## Ortak renkler

| Token | Değer | Kullanım |
|---|---|---|
| `surface` | `#0a1323` | Sayfa zemini |
| `surface-container-low` | `#131c2c` | İkincil paneller |
| `surface-container` | `#172030` | Diyalog ve içerik kartları |
| `surface-container-high` | `#212a3b` | Karar seçenekleri ve iç paneller |
| `surface-container-highest` | `#2c3546` | Girdiler, seçili profil yüzeyi |
| `on-surface` | `#dae2f9` | Ana metin |
| `on-surface-variant` | `#d6c3b1` | Yardımcı metin |
| `primary-container` | `#ffb454` | Ana düğme dolgusu |
| `on-primary-container` | `#734600` | Ana düğme metni |
| `primary` | `#ffd8af` | Amber tonlu metin ve odak vurgusu |
| `secondary` | `#4edea3` | Başarı ve kontrollü durum |
| `error` | `#ffb4ab` | Sorun ve hata durumu |
| `outline` | `#9f8e7d` | Yardımcı sınır ve alan ipuçları |

Renk durumları metin veya simgeyle desteklenir. Seçim öncesinde A ve B seçenekleri aynı görsel ağırlıktadır. Klavye odağı açıkça görünür; sadece `outline-none` kullanılarak kaldırılmaz.

## Yazı, boşluk ve boyutlar

- Ana yazı ailesi: `Plus Jakarta Sans`, ardından sistem sans-serif yedeği.
- Teknik etiketler: `JetBrains Mono`, ardından sistem monospace yedeği.
- Mobil ana başlık: 28px/36px, 700; büyük ekranda 36px/44px kullanılabilir.
- Bölüm başlığı: 20–24px, 600.
- Diyalog, seçenek, sonuç, öğretmen yanıtı ve metin girdisi: en az 16px/24px. Stitch HTML'deki 14px metin alanı uygulamada 16px'e çıkarılır.
- Yardımcı teknik etiketler: 12–14px; önemli açıklamalar küçük etikete dönüştürülmez.
- Kart köşeleri: 8px, küçük kontroller 4–8px; avatar dairesel olabilir. Özgün YAML ve HTML sınıf adlarındaki köşe farkı bu ortak ölçekle giderilir.
- Boşluk ölçeği: 4, 8, 16, 24, 32px. Mobil yan boşluk 16px.
- Dokunma hedefi en az 44×44px; ana aksiyonlar en az 48px yüksekliğinde.
- Tek sütunlu içerik yaklaşık 480px azami genişlikte ortalanır. 375px genişlikte metin ve seçim grupları gerektiğinde alt satıra iner; yatay taşma `overflow-x:hidden` ile gizlenerek çözülmez.
- Sabit üst çubuk varsa içeriğin başlangıcını veya klavye odağını örtmez.
- Avatar/font/simge kaynağı yüklenmezse ad etiketi, baş harf veya sistem yazısı ile kullanım sürer.

## Giriş ekranı

Üç profil grubu: seviye, rol, hedef. Başlangıçta üçü de boş olur; Stitch örneğindeki hazır seçili “Yeni başlayan” değeri taşınmaz. “Nöbete başla” üçü açıkça seçilene kadar devre dışıdır. Form erişilebilir grup/alan etiketleri içerir.

Açılış bildirimi: “Eşzamanlı kayıt istekleri kapasiteyi aşıyor. Kayıt akışı yavaşlıyor.” Özgün girişteki veritabanı kilitlenmesi iddiası kullanılmaz; senaryoda veritabanı erişilebilirdir.

“Tek hikâye · 3 karar · 2 son” ve “Yaklaşık 5–8 dakika. Tüm olaylar ve kayıtlar kurgusaldır.” korunur.

## Sahne ekranı

“Gece nöbeti · 20.00”, “Karar 1 / 3”, bölüm başlığı, kısa Ece/Deniz diyalogları, teknik durum, iki seçenek ve öğretmen kutusu bulunur. Bu bileşen üç karar için tekrar kullanılır. Gerçek UTC saati, geri sayım, anlamsız altyapı kimliği veya hesap simgesi eklenmez; uygulama hesabı yoktur.

Kurgusal teknik göstergeler sabit sahne verileridir ve bu nitelikleri belirtilir. Yeni başlayan için P99 gibi kavramlar açıklanır veya basit karşılığıyla gösterilir.

Seçimden önce “Ne oldu?”, “Neden oldu?” ve “Devam” gösterilmez; erişilebilirlik ağacında da bulunmaz. Oyuncu seçim yaptığında karar kilitlenir, gerçek seçime uygun geri bildirim açılır. A ve B için aynı sabit başarı metni kullanılmaz. Sonuç okunabildikten sonra Devam ile sıradaki karar açılır; sahne değişiminde odak başlığa taşınır.

Öğretmen bölümünde etiketli gerekçe alanı, İpucu iste düğmesi ve boş/yükleniyor/yanıt/hata durumları bulunur. Stitch'teki örnek yanıt otomatik gerçek AI cevabı gibi gösterilmez. Öğretmen hatası oyun kararlarını engellemez.

## Son ekranı

Son, yalnızca oyuncunun üç kararı üzerinden hesaplanır. Özgün HTML'deki “Nominal Son / Krizin Bedeli” önizleme düğmeleri oyuncuya sunulmaz.

- A-A-A: “Nöbet Kontrol Altında”.
- Diğer yedi yol: “Krizin Bedeli”; nedenler üç kararın gerçek değerlerinden üretilir.
- İlk iki karar doğru, yalnızca üçüncü karar hatalıysa sistem çalışır; gereksiz bilgi paylaşımı açıklanır.
- Üçüncü karar doğruysa veri paylaşımı ihlali uydurulmaz. Kontrol atlandıysa ölçülmemiş bir çöküş gerçekleşmiş gibi anlatılmaz.
- Ekip bildirim kanalı kurum içi yetkili kanaldır. Tasarımın eklediği harici servise sızma, KVKK soruşturması ve kesin çalışma oranı iddiaları kullanılmaz.
- Üç karar özeti ve öğrenilenler gerçek seçimlerle eşleşir. Her yolda aynı “güvenli/uygulandı” durumu gösterilmez.
- Süre ölçülmüyorsa “42dk 18sn” gibi sahte ölçüm gösterilmez. Geri sayım yoktur.
- Yeniden oyna, profil/karar/öğretmen durumunu tamamen temizleyip girişe döner. `history.back()` kullanılmaz.
- Alt metin: “Aynı hikâyeyi farklı kararlarla yeniden oyna.” İkinci veya rastgele senaryo sözü verilmez.

## İnceleme sınırı

Üç PNG, üç HTML ve iki özgün Markdown dosyası incelendi. PNG genişlikleri 780 pikseldir; bunlar tek başına 375px tarayıcı doğrulaması sayılmaz. Uygulama üretildikten sonra gerçek mobil akış, AI bağlantısı ve sekiz karar yolu ayrıca test edilecektir.
