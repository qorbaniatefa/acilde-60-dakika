# Ödev 7 teslim kontrolü

Son tarih **6 Kasım 2026 23:59 (Türkiye)**. Eksikleri gizlemeyen çalışma listesi:

| Kalem | Yerel durum | Kalan |
|---|---|---|
| Spec / önceden eşik / 3 yeni örnek | Hazır | Ekip incelemesi; yerel Git geçmişi yok |
| ≥15 gerçek oturum | **15/15 tamamlandı**, CSV kayıtları tekilleştirilerek birleştirildi | Gerçek test ayrımıyla yeniden eğitime geç |
| Veri / sözlük / kaynak | **585 satır: 45 gerçek + 540 sentetik** | Gerçek CSV'leri toplam ≥15 oturuma tamamla |
| Eğitim / eval kapısı | **Gerçek eval başarısız**: balanced accuracy=.50 < .75; yayın kapısı durdu. Eski .76861702 ölçümü yalnız sentetik pilota ait | Eksik öğrenme sinyalini incele; eşiği/etiketleri değiştirerek geçer sonuç üretme |
| ONNX / config / kart | **Üretildi**; sklearn/ONNX farkı 1.23363796e-7 | Yeni dosyalara sandbox erişimi engelli; yayın öncesi dosya erişimi ve hash tekrarını doğrula |
| HF commit yayını | **Eval başarısız olduğu için yayın engelli** | Gerçek eval'i geçen aday, yeni parite ve HF auth gerekli |
| Tarayıcı çıkarımı | **Gerçek Edge/WASM ve Cypress ile doğrulandı**, iki profil farklı destek açıyor | Gerçek veriyle eğitim sonrası yeni modeli tekrar doğrula |
| Python / 5+300 parite | **Python, Edge/WASM ve Cypress paritesi geçti**, max fark=1.1920929e-7 | Kanıt: docs/checks/2026-11-04-runtime-browser.json ve artifacts/primer-v2/browser-parity.json |
| Regresyon | **Cypress 17/17 geçti**: 12 eski hikâye + 5 model testi | Yeni eğitim sonrası tekrar çalıştır |
| RELEASE / matris / rollback / rollout | Plan hazır | Gerçek SHA henüz yok; rollout uygulanmadı |
| V2 demo 60–90 sn | Senaryo hazır | Eğitilmiş modelle kayıt/public video |
| Vize / AI beyanı / 3 komut kurulum | Hazır | Ekip kendi görüşüyle incelemeli |
| Bonus sunucu | Yapılmadı | Zorunlu değil |

## Sonraki adımlar

1. Pilot model, yerel runtime, tarayıcı paritesi ve kullanıcının normal PowerShell'indeki Cypress **17/17** koşusu tamamlandı. Kanıt: docs/checks/2026-11-04-cypress-v2.json.
2. `npm run dev` ile ≥15 gerçek tam oturum topla; CSV'leri birleştir, `npm run train`. Kötü eval'de eşiği düşürme.
3. `npm run parite`, `npm test`, `npm run test:ml`, `npm run lint`, `npm run build`, uygulama açıkken `npm run test:e2e` çalıştır.
4. HF auth ardından `npm run publish:model -- kullanici/acilde-primer-v2`. Commit URL'si `artifacts/primer-v2/hf-release.json` içinde oluşur.
5. V2 kaynağını GitHub ve canlı uygulamaya aktar; v1 linkleri kendiliğinden güncellenmez. Statik dağıtımda Gemini API yoktur; web ONNX çalışabilir.
6. Yeni videoyu çek; dört public linki gizli pencerede kontrol edip [formu](https://forms.gle/pr9QVEfLJuaFiXw39) doldur.

Eski `teslim/` paketi Ödev 6'ya aittir. V2 kaynağı köktedir. Export/yükleme klasörleriyle karıştırma. `test/images`, `test/labels`, `.env*`, `.review-tools`, `node_modules`, `.venv` teslim edilmez.

## Gerçek eval sonrası güncel karar — 5 Kasım

15 gerçek oturum toplandı; ilk gerçek holdout balanced accuracy=.50 ile kabul eşiğini geçmedi. Yeni model yayınlanmadı; eldeki ONNX ve test kanıtları eski sentetik pilotu tanımlar. Başarısızlık kanıtı `artifacts/primer-v2/real-eval-failure.json`.

Yalnız eğitim bölümünde yapılan üç katlı oturum bazlı karşılaştırmada karışık eğitim .50, yalnız gerçek eğitim ortalama .435 dengeli doğruluk verdi. Gerçek eğitim bölümündeki 33 kararda düzenleme ve önceki ipucu sayaçları değişmiyor; sentetik eğitim 540 satırla çok daha baskın. Sentetik veriyi çıkarmanın tek başına yeterli olmadığı görüldü. Final holdout bu tanı sırasında tekrar skorlanmadı; eşik, seed ve etiketler değişmedi.

Sonraki adım oyuncuların açıklama ihtiyacına hangi bilgiyle karar verdiğini anlamaktır. Yeni özellik veya veri toplama protokolü gerekiyorsa, yeni eğitimden önce belgelenmeli; sonraki değerlendirme bağımsız gerçek oturumlarla yapılmalıdır. Aynı final testinde ayar arayarak eşiği geçirme yoluna gidilmez.

## Bu devam oturumunda tamamlananlar

- Node bağımlılıkları yeniden kuruldu; 56 JavaScript testi yeniden geçti.
- ML bağımlılıkları `.venv` içine kuruldu ve eğitim kapısı geçti; model kartı otomatik ölçümlerle güncellendi.
- `npm run parite`: 5 ve 300 Python referans girdisinde fark=0.
- İkinci bağımsız eğitim aynı accuracy/recall/confusion matrix değerlerini verdi. Byte/hash eşitliği henüz doğrulanmış değil.
- `tests/test_training_integration.py` gerçek CLI'da kötü adayın reddedildiğini ve eski artefaktın korunduğunu doğruladı; 9 Python testinin içindedir.
- Yerel runtime hazırlama komutu eklendi; indirme ve tarayıcı çıkarımı henüz başarılı sayılmaz.
- Güncel kontroller: **58 JavaScript, 9 Python testi, lint ve üretim derlemesi geçti**. Yeni gerçek eğitim kapısı testi de 9 testin içindedir.
- GitHub için 49 değişen kaynak dosyası hazırlandı; `create_tree` yazma isteği `403 Resource not accessible by integration` ile reddedildi. Dal/commit oluşmadı, main değişmedi.

**Güncel engeller:** Gerçek veriyle yeniden eğitim/eval bekleniyor; HF kimlik doğrulaması yok; Cypress sandbox içinde `uv_os_get_passwd` hatası veriyor; yeni model/config dosyalarına sandbox doğrudan okuma izni yok; GitHub entegrasyonu yazma isteğinde HTTP 403 döndürüyor. Kaynaklar ve uzak uygulama henüz güncellenmedi. Önceki CDN/runtime indirme engeli kullanıcının başarılı yerel indirmesiyle aşıldı; gerçek tarayıcı paritesi artık geçti.

**Dışarıdan gerekenler:** Gerçek veriyle yeniden eğitim ve yeni model için tekrar test; Hugging Face'te `hf auth login`; GitHub bağlantısının bu depo için yazma yetkisi. Token/şifre sohbet içine gönderilmemelidir. Runtime kurulumu ve ilk Cypress koşusu artık tamamlandı.
