
# Acilde 60 Dakika — The Primer v2

Oyuncu, kurgusal bir acil servisin kayıt sistemindeki yazılım krizini üç mühendislik kararıyla yönetir. Küçük model oyuncunun davranışından **anlatımı derinleştirme tercihini** öğrenir: p≥0.5 olduğunda cevap vermeyen ek düşünme sorusu ve terim açıklaması açılır. Doğru kararlar ve sekiz hikâye yolu önceki sürümle aynıdır.

**Teslim henüz tamam değil.** Veride **15 gerçek, 180 sentetik oturum** bulunuyor. ML paketleri kuruldu, `model.onnx`, metrikli `config.json` ve 5+300 Python oracle referansı üretildi. Sentetik testte dengeli doğruluk **0.76861702**, destek recall **0.75**, sklearn/ONNX max fark **1.23363796e-7**. İkinci eğitim aynı metrikleri verdi; dosya hash'lerinin eşitlik kontrolü erişim engelinden tamamlanamadı. Yerel runtime indirildi; **gerçek Edge/WASM ile 5+300 parite geçti**, maksimum fark **1.1920929e-7**. [Tarayıcı kanıtı](docs/checks/2026-11-04-runtime-browser.json). Cypress regresyon koşusu, gerçek oturumlar, HF yayını, yeni canlı uygulama ve V2 demo hâlâ tamamlanmalı. [Teslim kontrolü](docs/ODEV7-TESLIM.md).

**5 Kasım gerçek eval sonucu:** 15 gerçek oturumla eğitim denendi; dengeli doğruluk **0.50**, kabul eşiği **0.75** olduğundan durdu. Yeni model yayınlanmadı. Üstteki .76861702 ve parite kanıtları önceki sentetik pilota aittir. Eğitim verisindeki tanı raporu için `npm run diagnose:ml`; [başarısız eval kaydı](artifacts/primer-v2/real-eval-failure.json). Eşik, seed ve etiketler değiştirilmedi.

## Kurulum — üç komut

Node.js ≥22.18, Python **3.12** önerilir; internet gerekir. Python 3.14'te wheel uyumu ayrıca kontrol edilmeli.

```sh
npm ci
python scripts/setup-ml.py
npm run dev
```

İkinci komut `.venv` oluşturur, sabit sürümlü ML paketlerini yükler ve tek eğitim çalıştırır. Kabul kapısı geçmezse durur. Başarılı eğitim ONNX/config dosyalarını, 5 ve 300 Python referansını ve model kartı ölçümlerini üretir. Adres `http://localhost:3000`; model laboratuvarı `http://localhost:3000/?parite`.

Küçük model ve toplama modu API anahtarı istemez. Ayrı v1 Gemini öğretmeni için `.env.example` dosyasını `.env.local` olarak kopyalayıp kendi anahtarını ayarla. Anahtarı istemciye/Git'e koyma. Statik GitHub Pages'te `/api/tutor` çalışmaz; manuel öğretmen hata gösterirken oyun ve küçük model çalışabilir. Tam öğretmen için Node sunucusu veya AI Studio gerekir.

## Gerçek oturumları topla

Girişte veri toplama rızasını işaretle. En az üç gönüllüye beşer tam oyun oynat: **15 oturum / en az 45 gerçek satır**. Her seçimden sonra sonuç görünmeden açıklama tercihi sorulur. Üçüncü etiketten sonra oturum CSV'ye eklenir; yarım oyun eklenmez. Sekmeyi kapatmadan CSV indir. Yeniden başlatma yeni UUID ve rıza gerektirir. [Veri sözlüğü](data/SOZLUK.md).

```sh
node scripts/ml-command.mjs scripts/merge-data.py dosya1.csv dosya2.csv
npm run train
```

Birleştirme mevcut sentetik satırları korur; çelişkili satırları reddeder. Gerçek insan katılımını araç kanıtlayamaz; gönüllü deneylerini dürüstçe yürütmek ekip sorumluluğudur. Test/demo verisini `gercek` diye kaydetme. Veriler sekme belleğindedir; ad, e-posta, cihaz kimliği, konum, gerekçe metni veya tıbbi veri CSV'ye girmez. İsteğe bağlı Gemini öğretmenine yazılan metin ayrı sunucu isteğidir.

## Tekrarlanabilir eğitim ve altın standart

`npm run train` `.venv` Python'u ile `train.py` çalıştırır; aktif sanal ortamda `python train.py` yeterlidir. **Eğitimden önce** [spec](spec.md) ve [model-policy.json](model-policy.json) içinde sabitlendi:

- Seed=42; oturum bazında %25 test. Aynı oturum iki kümeye sızmaz. ≥15 gerçek oturum varsa holdout gerçek oturumlardandır; aksi halde yalnız sentetik pilot ölçülür.
- StandardScaler + LogisticRegression, liblinear, class_weight=balanced, random_state=42. Ölçekleyici ONNX grafiğinde bulunur.
- Balanced accuracy ≥0.75 ve pozitif recall ≥0.70; iki sınıf da testte bulunmalı. Eşik altı koşu eski artefaktları değiştirmeden hata verir.
- sklearn ↔ Python ONNX farkı **<1e-4**. Beş sabit ve 300 ek oracle girdisi model hash'ine bağlanır; tarayıcı testi ayrı yürütülür.
- Config özellik sırasını, sınıfları, tensör adlarını, metrikleri, veri/model/politika SHA256'sını ve paket sürümlerini taşır. [JSON şeması](model/config.schema.json), [model kartı](model/README.md).

Eşik sonuca göre düşürülmez. Gerçek veride başarısızlık varsa veri/etiket sorunu araştırılıp yeni veri toplanır. Sentetik başarı gerçek öğrenme kazanımı değildir. Aynı kişi tekrar oynadığı için oturum ayrımı kişi düzeyinde bağımsızlık da göstermez.

## Sentetik veri kuralı

`python scripts/generate-synthetic.py`, **seed=42**, 180 oturum × 3 karar üretir; gerçek satırları korur. Sentetik UUIDv5, gerçek UUIDv4 kullanılır. Deneyim uniform 0/1, bekleme uniform 2–140 sn, düzenleme 0–24. Önceki yanlışlar karar başına p=.25, ipuçları p=.30 artar. Etiket `Bernoulli(sigmoid(s))` ile örneklenir:

`s = -3.4 + .047*bekleme_sn + .13*duzenleme_sayisi + .8*onceki_yanlis + .15*onceki_ipucu - 1.1*deneyim`

Kural varsayımsaldır; gerçek insan tercihlerinin kanıtı değildir. Etiket gürültülü olduğundan kusursuz sınıflandırma beklenmez.

## Testler

```sh
npm test
npm run test:ml
npm run lint
npm run build
npm run parite
```

Uygulama açıkken Cypress'i kurup çalıştır:

```sh
npx cypress install
npm run test:e2e
```

Önceki `adventure.cy.ts` 12 regresyonu korur. `model.cy.ts` gerçek WASM ile 5 ve 300 Python girdisini karşılaştırır; iki profilin farklı desteğini, rızayı ve model hatasında devamı kontrol eder. Model/olasılıklar parite testinde stub edilmez. Kanıt `artifacts/primer-v2/browser-parity.json` içine yazılır; yayın betiği zorunlu tutar.

Güncel koşu: **58 JavaScript ve 9 Python testi, lint ve üretim derlemesi geçti**. Gerçek eğitim CLI'sında kötü adayın reddedilmesi ve eski artefaktın korunması 9 testin içindedir. Eski AI öğretmeninin 1/20 cevap sızdırma oranı küçük model metriği değildir. [V1 kayıtları](docs/primer-v1-README.md) korunmuştur; başlangıç kontrolü [eski kayıtta](docs/checks/2026-11-04-primer-v2.json), bu devam oturumunun durumu [güncel kayıtta](docs/checks/2026-11-04-primer-v2-continuation.json).

Ek oynanış kontrolünün kaynağı `scripts/check-browser.cjs` dosyasıdır (Playwright ve Edge gerektirir); bu kontrol gerçek ONNX paritesi veya Cypress koşusu yerine sayılmaz. Toplama testi yalnız geçici otomasyon verisi üretir ve eğitim CSV'sine eklemez.

## Yayın ve demo

[RELEASE.md](RELEASE.md) mimari ödünleşim matrisini, shadow → %5 canary → %25/%50/%100 planını ve rollback'i açıklar. Bunlar uygulanmış üretim deneyi diye sunulmaz.

≥15 gerçek oturum, gerçek eval ve bütün parite kapıları geçtikten sonra:

```sh
.venv/Scripts/hf.exe auth login
npm run publish:model -- kullanici/acilde-primer-v2
```

Linux/macOS HF komutu `.venv/bin/hf`. Token HF kimlik deposunda/ortamda kalır. Betik yeniden eğitimle tekrarlanabilirliği denetler; public HF reposuna yalnız model dosyalarını yükler, oturumsuz indirmeyle hash'i doğrular. Manifest tam **40 karakterlik commit SHA** kullanır; istemci `main` kabul etmez. Sonra web uygulamasını yeniden derleyip yayınlamak gerekir; GitHub/AI Studio otomatik güncellenmez.

[ONNX Runtime Web](https://onnxruntime.ai/docs/get-started/with-javascript/web.html) **1.24.3** kullanılır. `npm run vendor:ort` üç sabit sürümlü runtime dosyasını `public/ort/` altına indirir; tam indirme sonrası manifest üretir. İstemci bu manifest varsa yerel runtime'ı tam URL üzerinden, yoksa CDN'yi kullanır. Kullanıcının normal PowerShell koşusunda indirme tamamlandı; yerel runtime, iki farklı destek kararı ve 305 girdilik tarayıcı paritesi gerçek Edge/WASM ile doğrulandı. Çıkarım tarayıcıdadır, altı özellik inference sunucusuna gönderilmez. Tam çevrimdışı çalışma doğrulanmadı. [60–90 sn demo senaryosu](docs/primer-v2-demo.md) için video henüz çekilmedi.

## Teslim bağlantıları

| Bağlantı | Durum |
|---|---|
| [GitHub](https://github.com/qorbaniatefa/acilde-60-dakika) | V1 deposu; yerel V2 henüz yüklenmedi |
| Commit'li HF model linki | Henüz yok; eğitim/gerçek veri/parite sonrası |
| [Eski AI Studio uygulaması](https://ai.studio/apps/ce35fb73-e633-48c7-b88f-e6629bf4015f) | V2 değil; güncelleme ve oturumsuz erişim kontrolü gerekiyor |
| V2 demo video linki | Henüz yok; eski video V1'e ait |

Son tarih **6 Kasım 2026 23:59**, [teslim formu](https://forms.gle/pr9QVEfLJuaFiXw39). Dört link de gizli pencerede açılmalı. [Sınav tasarımı](SINAV_TASARIMI.md) ekibin kendi görüşleriyle gözden geçirmesi gereken özgün senaryo taslağıdır.

## Kaynaklar

- [Ders başlangıç reposu](https://github.com/seyyah/huggingface-hello-web): sklearn→ONNX→istemci yaşam döngüsü; örnek hedef kopyalanmadı, nöbet hikâyesine açıklama derinliği hedefi uyarlandı.
- [Amershi vd., 2019](https://www.microsoft.com/en-us/research/publication/software-engineering-for-machine-learning-a-case-study/): veri/etiketleme/eval/izlemeyi döngü olarak ele alma gerekçesi.
- [Shankar vd., 2022](https://arxiv.org/abs/2209.09125): Velocity, Validation, Versioning; tek komut, kapılar ve commit sabitlemenin dayanağı.
- [Mitchell vd., 2019](https://arxiv.org/abs/1810.03993): model kartında amaç, ölçüm ve kullanım sınırları.
- [Breck vd., 2017](https://research.google/pubs/the-ml-test-score-a-rubric-for-ml-production-readiness-and-technical-debt-reduction/): veri/model/altyapı testleri ve izleme.
- [HF revision](https://huggingface.co/docs/huggingface_hub/guides/download), [HF upload](https://huggingface.co/docs/huggingface_hub/guides/upload), [skl2onnx](https://onnx.ai/sklearn-onnx/), [Cypress](https://docs.cypress.io/app/end-to-end-testing/writing-your-first-end-to-end-test): resmi teknik başvurular.
- Sommerville, *Software Engineering* 10. baskı, Bl. 8/17/18/25: dersin V&V ve konfigürasyon yönetimi başvurusu; tam metin bu oturumda incelenmedi. Ödev 7 sunum eki klasörde bulunmadı; uygulama paylaşılan tam yönergeye dayanır.

## Coding agent kullanım beyanı

1. **Codex:** Eski proje incelendi; kullanıcının önceden seçtiği sağlık/yazılım hikâyesi korundu. V2 hedefi ve sayısal kabul önerilerini bu oturumda asistan seçti.
2. **Codex:** Eğitim, veri toplama, ONNX tüketici ve test kodunu hazırladı; eski sonuçlar yeni ölçüm diye kullanılmadı.
3. **Bağımsız Codex incelemesi:** Eski tahmin gösterimi, UUID gizliliği ve paralel parite sorunlarını buldu; asistan kodu düzeltti.
4. **Araştırma:** Yukarıdaki özgün kaynaklar/resmi belgeler incelendi. Postman `api-engineer` becerisi sözleşme ve kanıt ayrımını yönlendirdi; Postman bulutunda kaynak veya mesaj yayınlanmadı.
5. **İnsan incelemesi:** Bu V2 oturumunda ekip tarafından elle düzeltilmiş çıktı henüz belgelenmedi. Gerçek veri, sınav sorusunun kendi görüşüyle düzenlenmesi ve kavramları öğrenip açıklama ekipçe tamamlanmalıdır; yapılmış gibi beyan edilmez.
