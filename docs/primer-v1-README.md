# Acilde 60 Dakika

Yazılım mühendisliği öğrencileri için Türkçe, mobil öncelikli bir gece nöbeti macerası. Oyuncu acil servis kayıt sistemindeki yoğunluk krizinde mimari, test ve veri güvenliği kararları verir. Üç karar ve iki son vardır; yalnızca A-A-A iyi sonu açar. AI öğretmeni, oyuncunun gerekçesini sorularla ele alır.

## Kaynak düzeni

Çalışan ve düzeltilen kaynak **proje kökündedir**. `export_acilde_60_dakika/`, AI Studio'dan gelen özgün arşivdir; güncel sürüm olarak kullanılmamalı. Vitest yalnızca kökteki testleri çalıştırır.

Onaylı gereksinimler: [spec.md](spec.md). Tasarım: [DESIGN.md](DESIGN.md) ve `stitch_acilde_60_dakika/`. Düzeltmeler ve doğrulama durumu: [docs/fixes.md](docs/fixes.md).

## Çalıştırma

Node.js **22.18 veya üzeri** gerekir. Bu proje sunucu TypeScript dosyalarını Node'un [yerleşik tür kaldırma desteğiyle](https://nodejs.org/api/typescript.html) çalıştırır; `tsx` veya elle üretilen geçici sunucu dosyası gerektirmez.

```sh
npm install
```

`.env.example` dosyasını `.env.local` adıyla kopyala; kendi `GEMINI_API_KEY` değerini ve hesabında erişilebilir `GEMINI_MODEL` adını ayarla. Anahtarı Git'e veya istemci koduna koyma. Sunucu önce `.env.local`, sonra `.env` okur; barındırma ortamındaki mevcut değişkenleri ezmez.

```sh
npm run dev
```

Varsayılan adres `http://localhost:3000`. Port `PORT` değişkeniyle ayarlanabilir.

Üretim önizlemesinde AI uç noktalarını da çalıştırmak için:

```sh
npm run build
npm start
```

`npm run preview` yalnızca Vite'ın statik istemci önizlemesidir; tam uygulama için `npm start` kullan.

## Kontroller

```sh
npm test
npm run lint
npm run build
```

Öğretmen için gerçek 20 örnekli değerlendirme: uygulama çalışırken `npm run eval`. Girdiler, etiketleme kuralları ve oran hesabı [eval/README.md](eval/README.md) içinde.

Cypress çalıştırıcısını bir kez kur ve uygulama açıkken testleri başlat:

```sh
npx cypress install
npm run test:e2e
```

Varsayılan tarayıcı Microsoft Edge'dir. Başka tarayıcı için `npx cypress run --browser chrome` kullanılabilir. Temel hedef `http://127.0.0.1:3000`; farklı port için `--config baseUrl=http://127.0.0.1:<port>` ver. Videolar `artifacts/cypress/videos/` altına yazılır.

**Güncel AI durumu:** `gemini-3.5-flash-lite` ile aynı 20 girdinin iki tam ölçümü var. Başlangıç 1.1.0 etiket önerisi **10/20 (%50)**; aktif 1.2.0 sonucu **1/20 (%5)** cevap sızdırma. Aktif sürümün 20 etiketi 1 Kasım'da kullanıcının açık yetki devriyle asistan tarafından onaylandı. 0/20 hedefi sağlanmadı. [Karşılaştırma](eval/summary.md), [sonuç JSON'u](teslim/results.json) ve [etiket tablosu](eval/results.csv) güncel.

**Cypress ve demo:** Kullanıcının PowerShell'inde Cypress 16.2.1 / Edge 156 ile **12/12 test geçti**. [Test videosu](artifacts/cypress/videos/adventure.cy.ts.mp4) dosya olarak doğrulandı; [koşu özeti](docs/checks/2026-11-01-cypress.json) kullanıcı konsol çıktısına dayanır. [Yaklaşık 60 saniyelik demo](artifacts/demo/acilde-60-dakika.mp4) ayrıca kaydedildi: gerçek öğretmen HTTP 200, üç karar, iyi son ve yeniden başlatma. Demo yerel uygulamanın Playwright kaydıdır; Cypress videosu olarak sunulmaz.

**Kalan sınırlar:** Deneysel 1.3.0'ın eski ölçümü 16 yanıtta kaldı ve aktif değil. Son yerel demo çağrısında 1.2.0/Flash-Lite başarıyla yanıt verdi; bu tek çağrı önceki 20 yanıtlık oranı değiştirmez. Uzak AI Studio sürümü ve dış teslim bağlantıları ayrıca doğrulanmalı.

API sözleşmesi [api/openapi.json](api/openapi.json). Yerel SDK bağlantı kontrolü için Postman'da üretilmiş fixture `postman/mocks/gemini/` altında; sonuçların gerçek model kalitesiyle ilgisi yoktur. Çalıştırma kısıtları [docs/fixes.md](docs/fixes.md) içinde kaydedilir.

## Yapılmayan üç özellik

1. **Kullanıcı hesabı:** Kısa, tek oturumluk öğrenme deneyimine kayıt yükü eklememek için kapsam dışı.
2. **İkinci bölüm:** Üç mühendislik kararına odaklanmak ve bir haftalık ödev kapsamını korumak için kapsam dışı.
3. **Native mobil uygulama:** Kurulum gerektirmeden telefondan tarayıcıyla oynanması yeterli olduğu için kapsam dışı.

## Teslim bağlantıları

- **GitHub reposu:** [qorbaniatefa/acilde-60-dakika](https://github.com/qorbaniatefa/acilde-60-dakika).
- **Özgün AI Studio projesi:** https://ai.studio/apps/ce35fb73-e633-48c7-b88f-e6629bf4015f — kullanıcı son iki dosyanın aktarımını tamamladığını bildirdi. Uzak çalışan sürüm ve model bu oturumdan bağımsız doğrulanmadı.
- **60 saniyelik demo:** [MP4 dosyası](artifacts/demo/acilde-60-dakika.mp4) (59,72 saniye). Kaynaklar yüklendiğinde [GitHub video bağlantısı](https://github.com/qorbaniatefa/acilde-60-dakika/blob/main/artifacts/demo/acilde-60-dakika.mp4) üzerinden paylaşılabilir. [Kayıt bilgileri](docs/demo-script.md).

Teslimden önce [son adımları](teslim/SON-ADIMLAR.md) tamamla: kaynakları boş GitHub deposuna yükle, repo/video bağlantılarını ve uzak uygulamanın son sürümünü doğrula. Etiket kontrolü, AI Studio dosya aktarımı, Cypress koşusu ve yerel demo kaydı tamamlandı. `test/images` ve `test/labels` içindeki uygulama dışı veriler teslim arşivine dahil edilmez.
