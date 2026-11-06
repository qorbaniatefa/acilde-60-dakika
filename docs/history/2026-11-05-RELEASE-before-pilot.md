# v2.0 — Anlatım derinliği modeli

**Durum: yayın hazırlığı.** Sentetik pilot ONNX ve ölçülmüş config üretildi; balanced accuracy=.76861702, recall=.75, sklearn/ONNX max fark=1.23363796e-7. Python oracle 5+300 doğrulandı. Gerçek oturum 0, HF commit'i ve Python–tarayıcı paritesi henüz yok. Aşağıdaki dağıtım aşamaları uygulanmış deney değil, yayın prosedürüdür.

## Değişiklik ve sürüm sözleşmesi

V1 profile göre sabit anlatım sunuyordu. V2 altı sayısal davranıştan derin açıklama tercihini tahmin eder; p≥0.5 ek düşünme sorusu ve terim açıklaması açar. Üç karar ve sekiz son yolu korunur. Tıbbi triyaj/klinik çıkarım yapılmaz.

`model-policy.json` eğitim öncesi eşikleri, `config.json` özellik sırası/aralığı, sınıflar, tensör adları, metrikler ve model/veri/politika hash'lerini taşır. Yayın betiği ≥15 tam gerçek oturum, gerçek holdout balanced_accuracy≥.75/recall≥.70, sklearn/ONNX farkı<1e-4, Python oracle, 5+300 tarayıcı paritesi ve tekrarlanan eğitimde aynı metrik/hash olmadan yüklemez. İnsan katılımının gerçekliğini otomatik kanıtlayamaz.

`npm run publish:model -- kullanici/acilde-primer-v2` başarılı olunca kesin commit/URL'ler `artifacts/primer-v2/hf-release.json`, tüketici manifesti `public/model-release.json` içine yazılır. Biçim `https://huggingface.co/<kullanici>/<repo>/resolve/<40-karakter-commit>/model.onnx`; bu örnek teslim linki değildir. [HF revision](https://huggingface.co/docs/huggingface_hub/guides/download) belgelerine göre tam commit kullanılır; istemci `main`/dal adı kabul etmez.

## Mimari karar ve feragat matrisi

| Seçenek | İnternet / gecikme | Veri cihazdan çıkar mı? | Model gizli kalır mı? |
|---|---|---|---|
| **Seçilen: tarayıcı / ONNX Runtime Web WASM** | İlk runtime/model indirmesinde ağ; hesaplama yerel. Kalıcı offline önbellek doğrulanmadı. WASM indirmesi küçük modelden büyük olabilir. | Altı özellik inference sunucusuna gönderilmez. CDN/HF dosya isteği ağ metadatası görebilir. CSV yalnız gönüllü indirmesiyle çıkar. | Hayır; indirilen ONNX incelenebilir. |
| Cihaz içi React Native / Expo | Gömülü model çevrimdışı çalışabilir; güncelleme ağ ister. | Yerel çıkarımda özellikler cihazda kalabilir. | Hayır; APK/paketten çıkarılabilir. |
| Kendi ücretsiz sunucusu / FastAPI veya Rails | Her istekte ağ; ücretsiz hizmette uyku/ilk istek gecikmesi olabilir. | Evet; veri minimizasyonu ve kayıt politikası gerekir. | Dosya istemciye verilmez; istek/yanıttan model çıkarımı (REA) riski sürer. |

Tarayıcı seçimi ücretsiz statik dağıtım ve veri minimizasyonu içindir. Model açıklığı, ilk indirme ve CDN bağımlılığı kabul edilir. [ONNX Runtime Web](https://onnxruntime.ai/docs/get-started/with-javascript/web.html) temel alınmıştır. Ayrı v1 Gemini öğretmeninin sunucu isteği küçük modelin gizliliğiyle karıştırılmaz. Bonus sunucu tüketicisi yapılmadı.

## Shadow → Canary → aşamalı geçiş

Bu ders uygulamasında yeterli trafik yoktur; yüzdeler uygulanmış gibi raporlanmaz. Devreye alma planı:

1. **Shadow:** Yeni aday rızalı pilotlarda sessiz olasılık üretir, anlatımı değiştirmez. V1 anlatımı sürer; gerçek öz bildirimle kıyaslanır. Toplama modu yeni desteği gizler; eşzamanlı iki model kıyaslama ve rollout yönlendiricisi henüz uygulanmadı.
2. **Canary %5:** Rastgele oturum UUID hash'inin mod100 değeri<5 olan oturumlar yeni modeli alır. Kişi/cihaz kimliği gerekmez. Oturum boyunca sürüm sabittir, kontrol eski sürümü alır. ≥20 aday oturum görülmeden artış yapılmaz; 15 oturumluk pilot bu aşamayı kanıtlamaz.
3. **%25 → %50 → %100:** Aynı kohort genişletilir; her aşamada ≥20 aday oturum ve 24 saat gözlem sonrası elle ilerlenir. Yükleme hatası>%2, oracle sapması≥1e-4, balanced_accuracy<.75 veya recall<.70 olduğunda durulur. Ders süresinde trafik oluşmazsa yalnız plan sunulur.
4. **Monitoring → veri:** Yeni rızalı etiketlerde confusion matrix, yanlış destek ve kaçırılan destek ile yükleme hataları izlenir. Hassas tanı/serbest metin telemetrisi yoktur. Drift görülürse veri/etiketleme incelenir; aynı holdout tekrar tekrar kullanılarak eşik ayarlanmaz.

## Rollback

Yüklemeden önce eski manifest `artifacts/primer-v2/previous-model-release.json` olarak saklanır. Sorunda bunu `public/model-release.json` yerine kopyala, `npm run build` ve aynı barındırmaya yeniden dağıt. Eski tam SHA ve eşleşen config/model birlikte döner. Eski paketle Python/5+300 tarayıcı paritesini yeniden çalıştır. Önceki ONNX yoksa v1 statik anlatıma dön; model yüklenemediğinde istemci zaten uyarı verip oyunu sürdürür. İlk geçerli modelin bile henüz olmadığı bu çalışma için eski commit uydurulmaz.

## Kaynak gerekçesi

[Amershi vd.](https://www.microsoft.com/en-us/research/publication/software-engineering-for-machine-learning-a-case-study/) yaşayan veri/model döngüsü; [Shankar vd.](https://arxiv.org/abs/2209.09125) hız/doğrulama/sürümleme ayrımı için kullanıldı. Tek komut eğitim Velocity'ye, eval/parite Validation'a, hash ve HF commit'i Versioning'e karşılık gelir. [Model Cards](https://arxiv.org/abs/1810.03993) sınırları belgelemeyi, [ML Test Score](https://research.google/pubs/the-ml-test-score-a-rubric-for-ml-production-readiness-and-technical-debt-reduction/) veri/altyapı/izleme kanıtını skorun yanında değerlendirmeyi yönlendirdi. Yönergedeki Gartner/maliyet öngörüleri doğrulanmış ölçüm diye tekrarlanmadı.
