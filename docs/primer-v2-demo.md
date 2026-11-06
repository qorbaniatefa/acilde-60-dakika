# V2 demo — 75 saniye

**Önkoşul:** ONNX/config üretilmiş ve parite geçmiş olmalı. V1 videosu yeni ödevin iki model kararı şartını göstermez. Yeni video henüz yok.

| Zaman | Ekran ve anlatım |
|---|---|
| 0–10 sn | Hikâye girişi: “Küçük model derin açıklama tercihimi tahmin ediyor.” Gerçek oturum sayısını ve eval kaynağını belirt. |
| 10–25 sn | `/?parite` laboratuvarında aynı sahne: “Akıcı ilerleyen oyuncu”, [5,0,0,0,1,1], gerçek ONNX p<0.5, kısa anlatım. Model bilgisini aç. |
| 25–45 sn | “Düşünerek ilerleyen oyuncu”, [90,18,0,0,1,0], p≥0.5 ve ek soru/terim açıklaması. Çıktının elle ayarlanmadığını açıkla. |
| 45–60 sn | Beş referansı çalıştır; Python/tarayıcı olasılıklarını ve Δ<1e-4 sonucunu göster. |
| 60–75 sn | Hikâyeye dön; karar kilidi ve Devam akışını göster. Commit'li model URL'si ve model kartını aç. |

Laboratuvar test/demo olarak işaretlidir; davranış profilleri gerçek katılımcı kanıtı diye sunulmaz. İstersen gerçek oyunda biri hızlı, diğeri bekleyip düşünce defterini düzenleyerek iki etkiyi kaydet. İki gerçek kişi varmış gibi kurgu yapma. MP4 60–90 sn olmalı, oturumsuz erişilen yere yüklenmeli. Manifest henüz yoksa commit URL'si varmış gibi gösterme.
