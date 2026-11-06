---
language: tr
library_name: sklearn
tags:
- onnx
- tabular-classification
- education
---

# Acilde 60 Dakika — Anlatım Derinliği Model Kartı

**Durum:** Eğitim kaydı aşağıdaki üretim bölümünde tutulur. Eğitimden sonra gerçek değerlerin makineyle okunabilir kaynağı yanındaki `config.json` olur.

**Seçilen teslim: yalnız sentetik pilot (6 Kasım).** Kullanıcı tüm 15 insan oturumunu kendisinin oynadığını ve Evet/Hayır etiketlerini rastgele seçtiğini bildirdi. 45 davranış satırı kaynak ve etiketleri değiştirilmeden arşivlendi; eğitimden dışlandı. Bunlar üç gönüllüden alınmış gerçek açıklama tercihleri veya geçerli kullanıcı doğrulaması sayılmaz. Model yalnız sentetik eğitim/test verisine dayanır. Public pilot yayını için açık `--synthetic-pilot` seçimi gerekir; bu seçenek doğruluk/parite eşiklerini değiştirmez.

**Amaç:** Yazılım mühendisliği öğrenme hikâyesinde daha ayrıntılı açıklama tercihini tahmin etmek. Yüksek olasılık cevap vermeyen ek düşünme sorusu ve terim açıklaması açar. Öğrencinin yeteneğini puanlamaz veya oyun sonucunu belirlemez.

**Model ve sözleşme:** StandardScaler + LogisticRegression (liblinear, balanced class weights, random_state=42). Altı float32 girdisinin sırası, birimleri, aralıkları, sınıflar, giriş/çıkış tensör adları ve hash'ler `config.json` içindedir. Şema `config.schema.json`; önceden belirlenen kabul kapısı `../model-policy.json` içindedir. Pozitif sınıf `derin_anlatim`, karar eşiği 0.5.

**Veri:** İlk pilotta seed=42 ile 180 sentetik oturum / 540 karar. Gerçek verinin hedefi en az 15 tamamlanmış gönüllü oturumu. Hedef etiketi sonuç açıklanmadan alınan oyuncu öz bildirimidir. Sentetik etiket bağımsız Bernoulli örneklemesidir; üretim kuralı README'de. Kimlik, kaynak ve hedef model girdisi değildir. Hassas veri ve serbest metin kaydedilmez. Model dosyası veri satırlarını içermez.

**Eval:** Oturum bazında %25 test; aynı UUID iki kümeye giremez. En az 15 gerçek oturum varsa test yalnız gerçek satırlardan ayrılır; aksi halde sentetik pilot olarak raporlanır. Sabit seed ve sabit paket sürümleri kullanılır. Kabul: balanced_accuracy ≥0.75 ve pozitif recall ≥0.70; sklearn/ONNX maksimum olasılık farkı <1e-4. Confusion matrix sırası [0,1]. Eğitim model hash'i, veri hash'i, politika hash'i ve oturum ayrımını kaydeder. Aynı makine ve sabit bağımlılıklarda iki eğitim koşusunun metrikleri karşılaştırılmalıdır; farklı mimarilerde bit düzeyinde eşitlik iddia edilmez.

**Performansın yorumu:** Sentetik başarı, gerçek öğrenme kazanımı veya pedagogik etki kanıtı değildir. Gerçek veride sınıf başına örnek sayısı ve deneyim düzeyleri ayrıca incelenmelidir; küçük örneklemde oranlar oynaktır.

<!-- GENERATED:START -->
**Eğitildi.** Eval kaynağı: `sentetik`; gerçek oturum: 0.

- Balanced accuracy: 0.76861702 (kabul ≥0.75)
- Destek recall: 0.75000000 (kabul ≥0.70)
- sklearn/ONNX max |delta|: 1.23363796e-07 (<1e-4)
- Confusion matrix [0,1]: `[[37, 10], [22, 66]]`
- Varsayılan gerçek veri yayın kapısı: False
- Yayın türü: `synthetic_pilot`; gerçek kullanıcı doğrulaması: False
- Model SHA256: `7c2dc8cb9b45fa53e670cb4797b52123cb18d5f54df3aad732d80b6f813f64aa`

Pilot yalnız açık --synthetic-pilot seçimiyle, değişmeyen eval/parite kapılarından sonra yayınlanabilir.
Tarayıcı paritesi ayrı Cypress koşusu gerektirir.
<!-- GENERATED:END -->

**Sınırlar:** Bekleme süresi dikkati, cihazı veya erişilebilirlik ihtiyacını yansıtabilir. Tuş başına sayaç bir metin düzeltmesi ölçüsü değildir. Aynı kişi tekrar oynadığında öğrenme etkisi vardır; rastgele oturum UUID'si kişi düzeyinde genellemeyi doğrulamaz. Alt gruplarda adalet ve uzun dönem öğrenme sonucu ölçülmedi. Manuel öğretmen ayrı bir LLM'dir; küçük ONNX modelinin metrikleri onun yanıt kalitesini açıklamaz.

**Kullanılmaması gereken durumlar:** Tıbbi triyaj, hasta verisi, klinik karar, sınav notu, disiplin kararı, kişilik/engel veya sağlık teşhisi, işe alım, öğrenciyi yeteneğine göre eleme. Oyuncu destek istemekte her zaman serbesttir. Model bozulursa temel hikâye çalışmaya devam eder.

**İzleme:** Yayın sonrası rızalı yeni oturumlarda gerçek balanced accuracy/recall, destek kabulü ve yükleme hatası izlenir. Veri ve politika değişirse yeni sürüm eğitilir. Yayın/geri alma prosedürü `../RELEASE.md` içindedir. Model kartı yaklaşımı [Mitchell vd.](https://arxiv.org/abs/1810.03993) temel alınarak uyarlanmıştır.
