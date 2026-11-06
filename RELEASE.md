# 2.0.0-pilot — yalnız sentetik veri

**6 Kasım kullanıcı kararı:** Yalnız sentetik model teslim edilir. Rastgele hedefli 15 insan oturumu/45 satır arşivlenmiş ve eğitimden çıkarılmıştır. Kaynakları/etiketleri değiştirilmez. Kullanıcı bu oturumların tek kişi tarafından oynandığını bildirdi. Model gerçek kullanıcı tercihlerinde doğrulanmış diye sunulmaz. Eski başarısız eval ve önceki yayın planı [tarihsel kayıtta](docs/history/2026-11-05-RELEASE-before-pilot.md) korunur.

## Davranış ve yayın kapısı

V1 profile göre sabit anlatım sunar. Pilot altı davranış girdisiyle derin anlatım olasılığı üretir; p≥.5 ek soru/terim açıklaması açar. Üç karar ve sekiz son yolu korunur. Çıkarım yazılım eğitimi içindir, tıbbi karar vermez.

**Eşikler değişmedi:** balanced_accuracy≥.75, destek recall≥.70, sklearn/ONNX ve Python/tarayıcı farkı<1e-4. `model-policy.json` seed42 ve eşikleri taşır. Config model/veri/politika hash'lerini, özellik sırasını ve metrikleri taşır. Pilot `publication_mode=synthetic_pilot`, `validated_on_real_data=false`, `release_eligible=false` içerir.

Public pilot için **`npm run publish:pilot -- kullanici/acilde-primer-v2-pilot`** gerekir. Açık bayrak yalnız sentetik-only veri kabul eder; arşivlenmiş rastgele etiketleri reddeder; eval, Python oracle, model SHA'sıyla eşleşen 5+300 tarayıcı kanıtı ve tekrar eğitimde aynı metrik/model hash'ini kontrol eder. Varsayılan `publish:model` önceki ≥15 geçerli gerçek oturum şartını korur. Bu karar başarısız insan eval'inin eşiğini düşürmez; ayrı ve açıkça sınırlı bir sentetik simülasyon yayınıdır.

**6 Kasım HF yayını tamamlandı:** [Atefa/acilde-primer-v2-pilot](https://huggingface.co/Atefa/acilde-primer-v2-pilot/tree/816ac3e612d7684e79ba6b2f28d6104e0e7c3139), commit **816ac3e612d7684e79ba6b2f28d6104e0e7c3139**. [Sabit model URL'si](https://huggingface.co/Atefa/acilde-primer-v2-pilot/resolve/816ac3e612d7684e79ba6b2f28d6104e0e7c3139/model.onnx), [eşleşen config](https://huggingface.co/Atefa/acilde-primer-v2-pilot/resolve/816ac3e612d7684e79ba6b2f28d6104e0e7c3139/config.json).

Kullanıcının çalıştırdığı yayın betiği yeniden eğitimi, oracle'ı, aynı modelin 5+300 tarayıcı kanıtını ve oturumsuz model indirmesinde SHA256 eşitliğini doğruladı. SHA256: `7c2dc8cb9b45fa53e670cb4797b52123cb18d5f54df3aad732d80b6f813f64aa`. Kayıt `artifacts/primer-v2/hf-release.json`, tüketici manifesti `public/model-release.json`. [HF revision](https://huggingface.co/docs/huggingface_hub/guides/download) belgelerine göre tam commit kullanılır; `main` kabul edilmez. Güncel istemcinin bu uzak kaynaktan yüklemesi için Cypress yeniden çalıştırılacak. Agent'ın ayrı web açma denemesi ortam erişim kısıtı nedeniyle sonuç vermedi; oturumsuz indirme kanıtı kullanıcının SDK koşusuna dayanır.

## Mimari ve feragat matrisi

| Seçenek | Ağ / gecikme | Veri cihazdan çıkar mı? | Model gizli mi? |
|---|---|---|---|
| **Seçilen tarayıcı / ONNX Web WASM** | İlk runtime/model indirmesi ağ ister; hesaplama yerel. Runtime aynı origin'den sunulabilir. Kalıcı offline önbellek doğrulanmadı. | Altı çıkarım özelliği inference sunucusuna gönderilmez. Dosya hizmetleri normal ağ metadatası görebilir. | Hayır; ONNX istemcide indirilebilir/incelenebilir. |
| React Native / Expo cihaz içi | Gömülü model offline çıkarım yapabilir; güncelleme ağ ister. | Yerel çıkarımda özellikler cihazda tutulabilir. | Hayır; paket içinden çıkarılabilir. |
| Ücretsiz kendi sunucusu / Rails veya FastAPI | Her istekte ağ; ücretsiz hizmette uyku/ilk istek gecikmesi olabilir. | Evet; kayıt politikası ve minimizasyon gerekir. | Dosya doğrudan verilmez; istek/yanıttan REA riski sürer. |

Tarayıcı seçimi ücretsiz statik dağıtım ve veri minimizasyonunu kolaylaştırır; model açıklığı ve ilk indirme yükü kabul edilir. [ONNX Web dağıtım belgeleri](https://onnxruntime.ai/docs/tutorials/web/deploy.html) temel alınmıştır. Ayrı manuel Gemini öğretmeni sunucu isteği kullanır; küçük modelin gizliliğiyle karıştırılmaz. Bonus sunucu yapılmadı.

## Shadow, canary ve aşamalı geçiş planı

Bu pilot gerçek kullanıcıda doğrulanmadığından üretim rollout'u uygulanmış gibi sunulmaz. Gelecekte geçerli etiketlerle onaylı sürüm için:

1. **Shadow:** Yeni model rızalı oturumlarda sessiz çalışır, anlatımı değiştirmez. Mevcut sürümle ve gerçek öz bildirimlerle karşılaştırılır. Veri toplama modu yeni desteği gizler; iki model yönlendiricisi henüz uygulanmadı.
2. **%5 canary:** Rastgele oturum UUID hash'inin mod100 değeri<5 olanlar yeni modeli alır; diğerleri eski sürümü kullanır. Aynı oturumda sürüm sabit tutulur. ≥20 aday oturum olmadan oran artırılmaz.
3. **%25 → %50 → %100:** Aynı kohort genişletilir; her aşamada ≥20 aday oturum ve 24 saat gözlem sonrası elle ilerlenir. Yükleme hatası>%2, herhangi bir parite farkı≥1e-4 veya geçerli gerçek eval eşiğinin altı durdurma sebebidir.
4. **Monitoring:** Rızalı yeni etiketler, confusion matrix, yanlış/kaçırılan destek ve yükleme hataları incelenir. Hassas tanı veya metin telemetrisi alınmaz. Holdout üzerinde tekrar tekrar ayar aranmaz.

## Rollback

Yayın öncesi eski manifest `artifacts/primer-v2/previous-model-release.json` olarak saklanır. Sorunda bu dosyayı `public/model-release.json` yerine koy, yeniden derle ve dağıt. Eski tam SHA ve eşleşen config/model birlikte gelir; parite tekrar çalıştırılır. Önceki ONNX sürümü yoksa V1 statik anlatıma dön. İstemci model hatasında uyarı verip hikâyeyi sürdürür. Henüz yayınlanmış SHA veya uygulanmış rollback varmış gibi gösterilmez.

## Kaynak gerekçesi

[Amershi vd.](https://www.microsoft.com/en-us/research/publication/software-engineering-for-machine-learning-a-case-study/) yaşayan veri/model döngüsü; [Shankar vd.](https://arxiv.org/abs/2209.09125) hız/doğrulama/sürümleme ayrımı için kullanıldı. Tek komut Velocity'ye, eval/parite Validation'a, hash ve HF commit'i Versioning'e karşılık gelir. [Model Cards](https://arxiv.org/abs/1810.03993) sınırları belgelemeyi, [ML Test Score](https://research.google/pubs/the-ml-test-score-a-rubric-for-ml-production-readiness-and-technical-debt-reduction/) veri/altyapı/izleme kanıtlarını skorun yanında değerlendirmeyi yönlendirdi. Yönergedeki Gartner/maliyet öngörüleri burada bağımsız doğrulanmış ölçüm olarak tekrarlanmadı.
