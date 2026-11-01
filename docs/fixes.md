# Teslim öncesi düzeltmeler — 30 Ekim 2026

İnceleme raporundaki sekiz uygulama/kurulum sorunu giderildi. **Bu, bütün ödev teslimlerinin tamamlandığı anlamına gelmez:** gerçek AI değerlendirmesi, Cypress koşusu, demo videosu ve güncel barındırma bağlantısı aşağıda ayrı gösterilmiştir.

**1 Kasım güncel durum:** Kullanıcının PowerShell'inde Cypress 16.2.1 ile 12/12 test geçti; test videosu doğrulandı. Ayrı 59,72 saniyelik demo gerçek öğretmen yanıtıyla kaydedildi. [Güncel teslim adımları](../teslim/SON-ADIMLAR.md) esas alınmalı; aşağıdaki erişim engelleri önceki oturumların tarihsel kayıtlarıdır.

## Düzeltilenler

1. Gereksiz doğrudan `esbuild` ve `tsx` bağımlılıkları kaldırıldı. Normal `npm install` artık `--legacy-peer-deps` gerektirmiyor; `package-lock.json` oluştu. Vitest arşivdeki kopyaları saymıyor.
2. `.env.local` ve `.env`, AI istemcisi oluşturulmadan önce okunuyor. Barındırma ortamının mevcut anahtarı dosyadaki değerle ezilmiyor. Yerel anahtar önceliği test edildi.
3. Sistem kapasitesi iyi/kötü sondan ayrı hesaplanıyor. A-A-B, A-B-A ve A-B-B yollarında yanlış darboğaz etiketi gösterilmiyor; A-B-A anlatısındaki ölçülmemiş gecikme iddiası kaldırıldı.
4. Seçim öncesi rol açıklamalarındaki doğrudan çözüm talimatları, kanıt ve varsayım sorularına dönüştürüldü. Teknik bağlamdaki hazır çözüm açıklaması sadeleştirildi.
5. Sahne kaldırıldığında eski AI isteği iptal ediliyor. Sunucu bağlantı kapanmasını SDK sinyaline iletiyor ve 15 saniyelik üst sınır uyguluyor. Sağlayıcı iptali görmezden gelse bile sunucu 504 dönüyor. Bunun sağlayıcıda zaten başlamış işi veya faturalandırmayı iptal edeceği iddia edilmiyor.
6. AI öğretmeni öğrenme hedefini de kullanıyor; gelecekteki sahneler ve cevap anahtarı bağlama eklenmiyor. Öğrenci metni kullanıcı içeriği, sunucunun oluşturduğu bağlam sistem talimatı olarak ayrıldı. Prompt sürümü `1.1.0`.
7. Sunucu seviye, rol ve hedefin izinli değerlerini doğruluyor. Hatalı gövde/profil 400, büyük gövde 413, sağlayıcı sorunu 502, eksik istemci 503, zaman aşımı 504 olarak belgeleniyor.
8. Yeni sahnede klavye odağı başlığa taşınıyor. Ana açıklama metinlerinin küçük olanları mobil okunabilirlik için 16px'e çıkarıldı.

Sunucu `server.ts` başlangıcı, `server/app.ts` HTTP sınırı, `server/config.ts` ortam yükleme ve `server/tutor.ts` gerçek SDK bağlantısı olarak ayrıldı. Sunucuyu yerel Node TypeScript desteğiyle başlatmak için en az Node 22.18 gerekir. Üretim başlangıcı `npm run build` ardından `npm start`.

## Doğrulama

| Kontrol | Gerçek sonuç |
|---|---|
| Normal `npm install --ignore-scripts` | Başarılı; eş bağımlılık atlama bayrağı yok |
| `npm test` | **43/43**; üç farklı test dosyası, arşiv kopyaları hariç |
| `npm run lint` | Başarılı TypeScript kontrolü |
| `npm run build` | Başarılı üretim derlemesi |
| `npm run dev` | Native Node ile gerçek Express + Vite başlangıcı başarılı |
| `npm start` | Gerçek Express + derlenmiş istemci başlangıcı başarılı |
| Edge/Playwright, 375×812 | **8/8 yol**; seçim kilidi, gizli geri bildirim ve sıfırlama çalışıyor |
| A-A-B durum etiketi | Anlatı ve KONTROLLÜ etiketi tutarlı |
| İstemci yaşam döngüsü | İlk/yeni başlık odakta; eski AI isteği iptal edildi |
| Gerçek sunucuya olumsuz API girdileri | **6/6** beklenen 400 yanıtı |
| Gerçek SDK + yerel HTTP fixture | Başarı 200, sağlayıcı hatası 502, gecikme 504 |

Ham sonuçlar ve ekranlar: [güncel kontrol klasörü](checks/2026-10-30-fixed). API sözleşmesi: [openapi.json](../api/openapi.json).

Testler önce hataları gösterdi: durum/hedef grubunda dört başarısız beklenti; sunucu grubunda altı başarısız beklenti; tarayıcıda üç başarısız odak/iptal kontrolü. Ek katı zaman aşımı testi de önce 200 alıp başarısız oldu. Düzeltmelerden sonra bütün bu kontroller geçti.

Bağımsız son kod incelemesi önemli/kritik bir hata bulmadı. **Ertelenen küçük not:** İlk sahnenin `P99 > 12.4s` teknik etiketi yeni başlayanlar için ayrıca açıklanabilir. Bu, düzeltmelerin oluşturduğu bir hata değil; mevcut metin açıklığı notudur.

## 31 Ekim güncellemesi

İki tam gerçek model ölçümü alındı: başlangıç 1.1.0 için 10/20, aktif 1.2.0 için 1/20 sızdırma etiket önerisi. Öğrenci onayı bekleniyor. [Karşılaştırma](../eval/summary.md) ve [sonuç JSON'u](../teslim/results.json) günceldir. Sonraki 1.3.0 deneyi erişim engeliyle 16 yanıtta kaldı ve aktif sürüm yapılmadı.

Cypress çalıştırıcısı bulundu; yerel cache kopyasında da `uv_os_get_passwd / ENOMEM` ile başlayamadı. Geçerli Cypress koşusu ve video hâlâ eksik. Aşağıdaki bölüm önceki kontrollerin tarihsel sınırlarını kaydeder.

## Önceki gerçek AI ve Cypress sınırları

- Model kontrolü `EACCES` ağ/işletim sistemi erişim engeliyle başarısız oldu. Hiçbir gerçek yanıt tamamlanmadı; modelin kullanılabilirliği veya cevap sızdırmama başarısı doğrulanmadı. 20 girdi ve çalıştırma/etiketleme akışı [eval](../eval/README.md) altında hazır. Oran raporlanmadı.
- Cypress paketi ve testleri hazır, ancak çalıştırıcı indirmesi başarısız oldu; indirme adresine erişim kontrolü de `EACCES` verdi. **Cypress koşusu başarılıymış gibi raporlanmadı.** Yerel Playwright sonuçları ayrı tutuldu.
- 60 saniyelik video çekilmedi. [Çekim planı](demo-script.md) hazır; gerçek değerlendirme ve Cypress çalıştıktan sonra uygulanmalı.
- Postman CLI 1.82.0 ile yerel mock üretildi. Simulation çalıştırma, `~/.postman` altındaki dataset durumuna erişim izni yüzünden başlamadı. Bunun yerine üretilen CommonJS HTTP handler doğrudan Node ile çalıştırıldı; gerçek Express ve gerçek Google SDK üzerinden üç senaryo doğrulandı. Handler logunda üç `POST /v1beta/models/test-model:generateContent` isteği görüldü. Bu sonuç **başarılı Postman simulation koşusu** veya gerçek Gemini başarısı olarak sunulmaz. Bağlam kaydı `postman/simulations/tutor/success.context.yaml` içinde.

## Uygulama kararları

- Git reposu bulunmadığı için düzeltmeler kullanıcının istediği proje kökünde yapıldı. Özgün export arşivi korunuyor; yanlış klasör tercih edilirse maliyet dosyaları taşımaktır.
- Native Node başlangıcı seçildi; Node 22.18 altı için eski çalıştırıcıyı geri eklemek gerekebilir. Kullanılan desteğin kaynağı [Node belgeleri](https://nodejs.org/api/typescript.html).
- Harici erişim engelleri, yerel testlerle gizlenmedi. Postman handler'ı ve tarayıcı yanıt taklitleri yalnızca ilgili bağlantı/arayüz davranışını kanıtlıyor; gerçek model kalitesi hakkında karar vermiyor.

## Aktarma ve teslim

`teslim/acilde-60-dakika-guncel-kaynak.zip`, güncel kod ve belgelerin aktarım arşividir; tamamlanmış ödev kanıtı değildir. Gizli anahtarlar, `node_modules`, eski export kopyası, geçici inceleme araçları ve uygulama dışı araç/plaka veri kümesi arşive alınmaz. Bu dosyalar çalışma klasöründen silinmez.

Yerel düzeltmeler AI Studio'daki özgün projeye henüz aktarılmadı. Aktarımdan sonra uygulama linki, gerçek öğretmen değerlendirmesi, Cypress videosu ve GitHub repo linki kontrol edilerek README tamamlanmalı.
