# Acilde 60 Dakika — The Primer v2, sentetik pilot

Yazılım mühendisliği öğrencisi, kurgusal bir acil servisin kayıt sistemi krizini üç kararla yönetir. Küçük lojistik regresyon modeli bekleme, düşünce defteri düzenleme, önceki yanlış ve ipucu davranışlarından anlatım derinliği önerir. p≥0.5 ek düşünme sorusu/terim açıklaması açar; p<0.5 kısa anlatım sürer. Hikâyenin sekiz karar yolu korunur. Sağlık/klinik çıkarım yapılmaz.

**Seçilen teslim yalnız sentetik pilottur.** Eğitim CSV'sinde **180 sentetik oturum / 540 karar** var. Kullanıcı 15 insan oturumunu kendisinin oynadığını ve açıklama isteği etiketlerini rastgele seçtiğini bildirdi. Bu 45 satır kaynak ve etiketleri değiştirilmeden arşivlendi, eğitimden dışlandı. Üç gönüllüden geçerli tercih verisi toplanmış veya model gerçek kullanıcıda doğrulanmış gibi sunulmaz. [Etiket durumu](data/ETIKET_DURUMU.md).

Yönerge yalnız sentetik veriye izin veriyor ve **Veri kaleminin yarım puanlanacağını** belirtiyor; diğer kalemler kendi kanıtlarına bağlıdır. HF pilotu yayınlandı; canlı V2 ve yeni demo henüz tamamlanmadı. [Güncel teslim listesi](docs/ODEV7-TESLIM.md).

## Kurulum — üç komut

Node.js ≥22.18, Python 3.12/3.13 ve internet gerekir. Python 3.14 için paket uyumu ayrıca doğrulanmalıdır.

```sh
npm ci
python scripts/setup-ml.py
npm run dev
```

İkinci komut `.venv` oluşturur, sabit ML bağımlılıklarını kurar ve tek komutluk eğitimi çalıştırır. Başarılı eğitim `model/model.onnx`, `model/config.json`, model kartı ve Python'un 5+300 referansını üretir. `public/model/` kopyaları uygulamaya sunulur. Başarısız eval eski artefaktı değiştirmez.

Yerel adres `http://localhost:3000`, model laboratuvarı `http://localhost:3000/?parite`. İlk kurulumda `npm run vendor:ort` sabit ONNX Runtime Web 1.24.3 dosyalarını indirir. İndirme mevcut dosyaları korur, WASM için UNPKG/CDN alternatiflerini kullanır, ilerlemeyi gösterir ve tamamlanmış dosyalar için manifest yazar. Yerel manifest varsa runtime aynı origin'den tam URL ile yüklenir; yoksa CDN kullanılır. Tam çevrimdışı çalışma ayrıca doğrulanmadı.

Küçük model API anahtarı istemez. V1'in ayrı Gemini öğretmeni için `.env.example` → `.env.local` ve kendi anahtarın gerekir. Anahtar istemciye/Git'e konmaz. Statik barındırmada `/api/tutor` yoksa manuel öğretmen hata mesajı gösterir; hikâye ve küçük model devam eder.

## Veri ve rastgele etiketlerin ayrılması

- Etkin veri: [data/oturumlar.csv](data/oturumlar.csv), yalnız `kaynak=sentetik`.
- Sözlük: [data/SOZLUK.md](data/SOZLUK.md); altı sayısal girdi, birimleri ve etiket tanımı.
- Rastgele hedefli insan davranışı: `data/arsiv/tek-oyuncu-rastgele-etiketler.csv`, 15 oturum/45 satır. `kaynak=gercek` korunur; bu etiketler geçerli tercih etiketi olarak kullanılmaz.
- Eski karma CSV'nin yedeği: `data/arsiv/oturumlar-karisik-2026-11-06.csv`. Önceki başarısız deneyin izidir; eğitim girdisi değildir.
- [data/etiket_kalitesi.json](data/etiket_kalitesi.json), dışlanan UUID'leri ve arşiv hash'ini taşır. Eğitim/yayın/birleştirme bu kayıtların geri girişini reddeder.

`npm run prepare:pilot` arşivlemeyi tekrarlanabilir biçimde uygular; mevcut arşivi kaybetmez. Rastgele etiketler yeni değerlerle değiştirilmedi veya sentetik davranış diye yeniden adlandırılmadı. Ad/e-posta/cihaz kimliği/konum, gerekçe metni veya tıbbi veri CSV'ye girmez. Uygulamadaki rızalı toplama modu gelecekteki geçerli deneyler için durur; bu teslimde kullanıldığı iddia edilmez. Manuel Gemini öğretmenine gönderilen metin ayrı bir sunucu isteğidir.

## Sentetik üretici

`python scripts/generate-synthetic.py`, **seed=42**, 180 oturum × 3 karar üretir. Deneyim uniform 0/1, bekleme uniform 2–140 sn, düzenleme 0–24. Önceki yanlışlar karar başına p=.25, ipuçları p=.30 artar. Hedef `Bernoulli(sigmoid(s))` ile örneklenir:

`s = -3.4 + .047*bekleme_sn + .13*duzenleme_sayisi + .8*onceki_yanlis + .15*onceki_ipucu - 1.1*deneyim`

Sentetik UUID'ler UUIDv5, insan oturumları UUIDv4'tür. Kural bir simülasyon varsayımıdır. Modelin aynı varsayımla üretilen test verisinde başarısı insan tercihleri veya öğrenme kazanımı kanıtı değildir.

## Eğitim, kabul kapısı ve sözleşme

`npm run train` veya aktif sanal ortamda `python train.py`. [model-policy.json](model-policy.json) **eğitimden önce** yazıldı; eşikler sonuca göre değiştirilmedi:

- StandardScaler + LogisticRegression; liblinear, class_weight=balanced, random_state=42. Ölçekleyici ONNX grafiğine dahildir.
- %25 test, oturum bazında seed=42 ayrımı. Aynı UUID iki kümeye giremez. Pilotun eğitim ve testi sentetiktir.
- Balanced accuracy ≥0.75 **ve** destek recall ≥0.70. İki sınıf da bulunmalı.
- sklearn ↔ Python ONNX ve Python ↔ tarayıcı olasılık farkı **<1e-4**.
- Config özellik sırasını, sınıfları, tensör adlarını, metrikleri, veri/model/politika hash'lerini ve ortam sürümlerini taşır. [Şema](model/config.schema.json), [model kartı](model/README.md).
- Pilot config'i `publication_mode=synthetic_pilot`, `validated_on_real_data=false` ve `release_eligible=false` taşır. Son alan varsayılan gerçek veri yayınının kapalı olduğunu gösterir; açık pilot yayın yolu ayrı seçilir.

İlk sentetik pilot ölçümü: balanced accuracy **0.76861702**, recall **0.75**, sklearn/ONNX max fark **1.23363796e-7**. Güncel yeniden eğitim kaydı model kartı/config'te üretilir. Önceki rastgele insan etiketli deneyin .50 sonucu [saklandı](artifacts/primer-v2/real-eval-failure.json); daha sonra açıklanan etiket kalitesi problemi bu sonucun yorumunu sınırlar. İnsan verisinde başarı iddia edilmez.

## Testler

```sh
npm test
npm run test:ml
npm run lint
npm run build
npm run parite
```

Uygulama açıkken `npm run test:e2e` çalıştır. Microsoft Edge ve kurulmuş Cypress gerekir; ilk seferde `npx cypress install` kullanılabilir. `adventure.cy.ts` 12 hikâye regresyonunu, `model.cy.ts` 5 model/toplama/hata kontrolünü içerir. Parite testinde ONNX veya olasılıklar stub edilmez. 5+300 gerçek WASM sonucu Python oracle ile karşılaştırılır; kanıt model SHA'sına bağlı `artifacts/primer-v2/browser-parity.json` dosyasına yazılır.

Kullanıcı 4 Kasım'da normal PowerShell'de **17/17 Cypress** geçtiğini bildirdi; [koşu kaydı](docs/checks/2026-11-04-cypress-v2.json). Agent ayrıca gerçek Edge/WASM ile 305 girdide max fark **1.1920929e-7** ölçtü: [kanıt](docs/checks/2026-11-04-runtime-browser.json). Yeni model hash'i farklıysa eski kanıt geçerli olmaz. Ek Playwright kontrol kaynağı `scripts/check-runtime-browser.cjs`; bu, Cypress regresyonu diye sunulmaz.

6 Kasım'da HF commit'ine sabitlenmiş kaynakla kullanıcı Cypress'i tekrar çalıştırdı: **17/17 geçti**, 0 hata; 5+300 parite girdisinde max fark **1.1920929e-7**. [HF kaynaklı koşu kaydı](docs/checks/2026-11-06-cypress-hf.json).

## Pilot yayın ve sürümleme

[RELEASE.md](RELEASE.md) ücretsiz tarayıcı/mobil/sunucu ödünleşimlerini, shadow/canary planını ve rollback'i açıklar. HF hesabında kendi terminalinde giriş yap:

```powershell
npm.cmd run login:hf
npm.cmd run publish:pilot -- kullanici/acilde-primer-v2-pilot
```

Linux/macOS giriş komutu `npm run login:hf`. Yardımcı betik resmi Python SDK'sının `login(token=..., add_to_git_credential=False)` yöntemini kullanır; token gizli terminal girdisinden alınır, komut argümanına veya Git'e yazılmaz. Opsiyonel `hf` CLI'sının eksik Click bağımlılığı bu yolda kullanılmaz. Token sohbetten istenmez. `publish:pilot` açık `--synthetic-pilot` bayrağını kullanır; eval, parite, veri/politika/model hash'leri ve tekrar eğitim kontrolü yine zorunludur. Varsayılan `publish:model` geçerli gerçek kullanıcı verisi istemeye devam eder.

Başarılı pilot yüklemesi public model reposunda commit SHA döndürür; oturumsuz indirme ve hash doğrulanır. `public/model-release.json` tam 40 karakterli SHA'ya sabitlenir; istemci `main` kabul etmez. HF pilot yayını tamamlandı; uygulamanın V2 dağıtımı bekliyor.

GitHub aktarımında kaynak çalışma klasöründe `npm run prepare:github` kullanılır. Komut mevcut, temiz `teslim/github-yukleme` Git deposuna V2 kaynaklarını ve artefaktları hash kontrolüyle kopyalar; `.env.local` ve kurulum klasörlerini dışlar. Commit/push yapmaz. Ardından bu Git klasöründe değişiklikler incelenip kaydedilir ve gönderilir. GitHub **Settings → Pages → Source: GitHub Actions** seçilir. Hazır workflow depo alt yoluyla statik `dist` derlemesini yayınlar; Gemini tutor API'si bu statik dağıtımda bulunmaz. [Vite dağıtım rehberi](https://vite.dev/guide/static-deploy#github-pages).

## Teslim bağlantıları

| Kalem | Durum |
|---|---|
| [GitHub deposu](https://github.com/qorbaniatefa/acilde-60-dakika) | Uzak V1; entegrasyon yazma isteği 403 döndürdü, V2 aktarımı bekliyor |
| [Commit'li HF pilot modeli](https://huggingface.co/Atefa/acilde-primer-v2-pilot/tree/816ac3e612d7684e79ba6b2f28d6104e0e7c3139) | Yayınlandı; commit 816ac3e612d7684e79ba6b2f28d6104e0e7c3139 |
| [Önceki AI Studio uygulaması](https://ai.studio/apps/ce35fb73-e633-48c7-b88f-e6629bf4015f) | V2 güncellemesi/oturumsuz erişim kontrolü bekliyor |
| V2 demo | Henüz yok; eski V1 videosu yeni model demosu sayılmaz |

Son tarih **6 Kasım 2026 23:59**, [form](https://forms.gle/pr9QVEfLJuaFiXw39). Dört link giriş yapmadan kontrol edilmeli. [Demo senaryosu](docs/primer-v2-demo.md) ve [sınav tasarımı](SINAV_TASARIMI.md) hazır; sınav metni öğrenci tarafından kendi görüşüyle gözden geçirilmeli. Bonus sunucu tüketicisi yapılmadı.

## Kaynaklar

- [Başlangıç reposu](https://github.com/seyyah/huggingface-hello-web): sklearn→ONNX→istemci yaşam döngüsü. Hedef, mevcut nöbet hikâyesine açıklama derinliği olarak uyarlandı.
- [Amershi vd.](https://www.microsoft.com/en-us/research/publication/software-engineering-for-machine-learning-a-case-study/): veri/etiketleme/eval/izleme döngüsü.
- [Shankar vd.](https://arxiv.org/abs/2209.09125): Velocity, Validation, Versioning; tek komut, kapılar ve commit sabitleme.
- [Mitchell vd.](https://arxiv.org/abs/1810.03993): model kartında amaç, ölçüm ve kullanım sınırları.
- [Breck vd.](https://research.google/pubs/the-ml-test-score-a-rubric-for-ml-production-readiness-and-technical-debt-reduction/): veri/model/altyapı testleri ve izleme.
- [HF revision](https://huggingface.co/docs/huggingface_hub/guides/download), [HF upload](https://huggingface.co/docs/huggingface_hub/guides/upload), [ONNX Web dağıtımı](https://onnxruntime.ai/docs/tutorials/web/deploy.html), [skl2onnx](https://onnx.ai/sklearn-onnx/): resmi teknik kaynaklar.
- Sommerville, *Software Engineering*, 10. baskı, Bl. 8/17/18/25: ders başvurusu; tam metni bu oturumda incelenmedi. Ödev 7 sunum eki klasörde bulunmadı; paylaşılan tam yönerge kullanıldı.

## Coding agent beyanı

1. **Codex:** Kullanıcının önceden seçtiği sağlık/yazılım hikâyesini korudu; V2 hedefini ve eşikleri önerip kodladı.
2. **Codex:** Eğitim, veri toplama, ONNX tüketici, parite ve yayın araçlarını hazırladı. Bağımsız Codex incelemeleri UUID, eski tahmin, tekrarlanabilirlik ve runtime yükleme sorunlarını buldu; asistan düzeltti.
3. **Kullanıcı:** Runtime komutunu ve Cypress'i kendi PowerShell'inde çalıştırıp çıktıları paylaştı; bütün insan oyunlarını kendisinin oynadığını ve hedefleri rastgele seçtiğini açıkladı. Veri durumu bu beyana göre düzeltildi.
4. **Codex:** Rastgele etiketli satırları koruyup dışladı; kullanıcı sentetik pilotu seçti. Gerçek başarı, üç gönüllü veya yeni video iddiası üretilmedi. Postman API Engineer becerisi sözleşme ve kanıt ayrımını yönlendirdi.
5. **İnsan incelemesi:** V2 kodu/sınav metni için öğrencinin elle yaptığı içerik düzeltmeleri henüz belgelenmedi. Öğrencinin kavramları öğrenip açıklaması ve metni kendi görüşüyle incelemesi bekleniyor.
