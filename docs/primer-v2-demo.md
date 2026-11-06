# V2 demo — 75 saniye

**Üretilen V2 video:** [primer-v2-pilot.mp4](../artifacts/demo/primer-v2-pilot.mp4). Süre78,04sn, 720×1080; Türkçe açıklama yazıları var, ses yok. Yerel uygulama kaydıdır: ağ erişimi reddedildiğinden kayıt sunucusu yerel ONNX dosyasını seçer. Uygulama ve model baytları değişmez; model SHA'sı yayımlanmış HF modeliyle aynıdır. Bu kayıt canlı sitenin agent tarafından doğrulandığı anlamına gelmez.

Kayıtta iki demo profili aynı sahnede p=.00862962 ve p=.90221643 ile farklı anlatım açar. 5+300 Python referansı gerçek tarayıcı ONNX/WASM ile karşılaştırılır, max fark1.1920928955078125e-7. Son bölümde hikâye profili ve karar/geri bildirim gösterilir. Oturumlar ve iki profil gerçek katılımcı kanıtı olarak sunulmaz. [Kayıt kanıtı](checks/2026-11-06-v2-demo/recording.json), [MP4 doğrulaması](checks/2026-11-06-v2-demo/encoded.json). Video tümüyle decode edilerek hata vermediği ve60–90sn aralığında olduğu kontrol edildi; örnek kareler görsel olarak incelendi.

Yeniden üretim: proje build'i `/acilde-60-dakika/` tabanıyla hazırlanır; Playwright/Edge bulunan ortamda `node scripts/record-primer-v2-demo.cjs`, sonra FFmpeg bulunan ortamda `node scripts/render-primer-v2-demo.cjs` çalıştırılır. Araçlar bu çalışma ortamındaki kurulumu kullanır; taşınabilir ortamda Playwright ve FFmpeg ayrıca gerekir (`PRIMER_FFMPEG` ile FFmpeg yolu seçilebilir). Üretici uygulama dosyalarını düzenlemez ve olasılıkları stub etmez.

Public video için MP4'ün hash'i aynı kopyası `public/demo/primer-v2-pilot.mp4` içine hazırlandı. Yeni Pages dağıtımı tamamlandığında [video adresi](https://qorbaniatefa.github.io/acilde-60-dakika/demo/primer-v2-pilot.mp4) kullanılacak; public erişim kontrolü hâlâ gerekiyor. Ücretsiz mevcut Pages barındırması kullanılır, ayrı hesap gerekmez.

**Elle kayıt için önceki senaryo:** ONNX/config üretilmiş ve parite geçmiş olmalı. V1 videosu yeni ödevin iki model kararı şartını göstermez.

| Zaman | Ekran ve anlatım |
|---|---|
| 0–10 sn | Hikâye girişi: “Küçük model derin açıklama tercihimi tahmin ediyor.” Gerçek oturum sayısını ve eval kaynağını belirt. |
| 10–25 sn | `/?parite` laboratuvarında aynı sahne: “Akıcı ilerleyen oyuncu”, [5,0,0,0,1,1], gerçek ONNX p<0.5, kısa anlatım. Model bilgisini aç. |
| 25–45 sn | “Düşünerek ilerleyen oyuncu”, [90,18,0,0,1,0], p≥0.5 ve ek soru/terim açıklaması. Çıktının elle ayarlanmadığını açıkla. |
| 45–60 sn | Beş referansı çalıştır; Python/tarayıcı olasılıklarını ve Δ<1e-4 sonucunu göster. |
| 60–75 sn | Hikâyeye dön; karar kilidi ve Devam akışını göster. Commit'li model URL'si ve model kartını aç. |

Laboratuvar test/demo olarak işaretlidir; davranış profilleri gerçek katılımcı kanıtı diye sunulmaz. İstersen gerçek oyunda biri hızlı, diğeri bekleyip düşünce defterini düzenleyerek iki etkiyi kaydet. İki gerçek kişi varmış gibi kurgu yapma. MP4 60–90 sn olmalı, oturumsuz erişilen yere yüklenmeli. Manifest henüz yoksa commit URL'si varmış gibi gösterme.
