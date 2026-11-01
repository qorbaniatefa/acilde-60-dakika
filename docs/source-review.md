# Kaynak kod kontrolü — 30 Ekim 2026

Bu ilk incelemenin tarihsel kaydıdır. Sonraki düzeltmeler ve güncel doğrulama durumu [fixes.md](fixes.md) içinde bulunur.

Sonuç: Temel oyun akışı çalışıyor; teslimden önce aşağıdaki hatalar giderilmeli. Bu kontrolde uygulamanın kaynak kodu ve paket tanımları değiştirilmedi.

## Gerçekte çalıştırılan kontroller

| Kontrol | Sonuç | Sınır |
|---|---|---|
| Standart npm kurulumu | Başarısız: `ERESOLVE` | Vite ve esbuild sürümleri uyuşmuyor |
| İnceleme amaçlı kurulum | Başarılı | `--legacy-peer-deps --ignore-scripts --no-package-lock` ile; standart kurulum sorununu çözmez |
| `npm.cmd test` | 2 dosya, 36 başarılı test | Aynı 18 test ana dizinde ve export klasöründe tekrar çalışıyor |
| `npm.cmd run lint` | Başarılı | Script TypeScript tip kontrolü çalıştırıyor |
| `npm.cmd run build` | Başarılı | İstemci derlemesi; tek başına gerçek AI bağlantısını doğrulamaz |
| Edge/Playwright, 375×812 | Sekiz yol tamamlandı | A-A-A iyi son; diğer yedi yol kötü son |
| Tarayıcı akışı | Profil doğrulama, seçim öncesinde geri bildirimin gizlenmesi, seçim kilidi ve yeniden başlatma çalıştı | Son etiketinin doğruluğu ayrıca aşağıda hatalı bulundu |
| Mobil taşma | İncelenen giriş/sahne/son ekranlarında yatay taşma yok | Harici fontlar engellendi; sistem yazı tipi yedekleriyle kontrol edildi |
| Tarayıcı JavaScript hatası | 0 | İncelenen sekiz yol için |
| Sunucu API doğrulaması | 5/5 beklenen 400 yanıtı | Geçersiz sahne, eksik profil, boş gerekçe, 2001 karakter gerekçe ve `null` gövde |
| Gerçek Gemini yanıtı | Değerlendirilmedi | Sunucu ortamında anahtar tanımlı görünüyor; bu kontrolde gerçek model isteği gönderilmedi |

Ham tarayıcı/API sonuçları: [results.json](checks/2026-10-30/results.json). Görüntüler: [iyi son](checks/2026-10-30/ending-AAA.png), [A-A-B hatası](checks/2026-10-30/ending-AAB.png). Tanılama betiğinin kopyası aynı klasörde saklandı.

`npm.cmd run dev`, bu Windows çalışma ortamında `tsx` içindeki `os.userInfo()` çağrısında `uv_os_get_passwd / ENOMEM` hatası verdi. Bu, tek başına uygulamanın her ortamda açılmadığı anlamına gelmez. Tarayıcı/API incelemesi için özgün TypeScript'in geçici, yalnızca türleri çıkarılmış JavaScript kopyasıyla gerçek Express sunucusu ve derlenmiş istemci çalıştırıldı. Uygulama mantığı taklit edilmedi; geçici sunucu kopyaları inceleme sonunda kaldırıldı.

## Öncelikli düzeltmeler

### 1. Standart kurulum başarısız — yüksek öncelik

Kaynak: `package.json:24`, `package.json:32`.

`vite: ^8.3.0` kurulurken çözülen Vite 8.3.5, isteğe bağlı eş bağımlılık olarak `esbuild ^0.27.0 || ^0.28.0` bekliyor. Proje doğrudan `esbuild ^0.25.0` istediği için normal kurulum `ERESOLVE` ile duruyor. Doğrudan esbuild bağımlılığının gerçekten gerekli olup olmadığı kontrol edilerek kaldırılması veya uyumlu sürüme taşınması gerekir. Tanılama için kullanılan `--legacy-peer-deps` kalıcı çözüm olarak sunulmamalı.

### 2. Yerel anahtar dosyası talimatı sunucuyla uyuşmuyor — yüksek öncelik

Kaynak: `README.md:18`, `server.ts:11`, `server.ts:22`.

README anahtarı `.env.local` içine koymayı söylüyor. Sunucu ise varsayılan `dotenv.config()` ile `.env` dosyasını okuyup AI istemcisini bundan hemen sonra oluşturuyor. Ortamdan ayrıca anahtar gelmeyen bir bilgisayarda README'yi izlemek, öğretmenin 503 vermesine neden olur. Belgelenen dosya sunucu başlangıcında, AI istemcisinden önce yüklenmeli. Bu incelemedeki sunucuda ortam anahtarı bulunduğu için sorun o koşulda maskeleniyor.

### 3. Çalışan sistem hatalı biçimde darboğazlı gösteriliyor

Kaynak: `src/game/engine.ts:234`, `src/components/EndingScreen.tsx:70`.

Bütün kötü sonlarda `isSystemStable: false` dönüyor. A-A-B yolunda anlatı “Sistem kontrollü çalışıyor” derken durum kartı “DARBOĞAZ VAR” yazıyor. Hata hem fonksiyon çıktısıyla hem gerçek tarayıcı görüntüsüyle doğrulandı. A-B-A ve A-B-B de ilk karar doğru olduğu halde aynı etiket sorununu taşıyor. Teknik sistem durumu ile genel iyi/kötü son birbirinden ayrı hesaplanmalı.

### 4. Seçimden önce doğru cevabı söyleyen sabit metinler var

Kaynak: `src/game/storyData.ts:24`, `src/game/storyData.ts:30`, `src/game/storyData.ts:101`, `src/game/storyData.ts:180`; gösterim: `src/components/SceneScreen.tsx:191`.

Geliştirici rolü için “kalıcı kuyruk altyapısını ayağa kaldırmak gerekiyor”, test sahnesinde test yapılmadan izin verilemeyeceği, veri sahnesinde hassas alanları maskeleyip yalnızca teknik parametreleri gönderme talimatı, oyuncu seçim yapmadan gösteriliyor. Bunlar genel düşünme sorusundan öte, doğru seçeneği doğrudan tarif ediyor. Bu sabit rol açıklamaları tarafsız düşünme sorularına çevrilmeli. Bu bulgu gerçek AI modelinin cevap sızdırdığı iddiası değildir.

### 5. Sahne değişiminde AI isteği iptal edilmiyor

Kaynak: `src/components/SceneScreen.tsx:53`, `src/App.tsx:84`, `server.ts:103`.

Sahne bileşeni karar kimliğiyle yeniden oluşturuluyor. İsteği iptal etmeyi amaçlayan effect, bileşen kaldırılırken çalışacak bir cleanup döndürmüyor. Yeni bileşenin boş ref'i eski isteği iptal edemez. Yeniden başlatma ve sahne değişiminde eski istek sürer; yeni ekrana yazması yeniden oluşturma sayesinde engellenir, ancak bu iptal edildiği anlamına gelmez. Ayrıca tarayıcının 15 saniyelik iptali, sunucunun Gemini çağrısına aktarılmıyor; sunucuda da uygun zaman aşımı/iptal tanımlanmalı. Bu bulgu kaynak incelemesine dayanır; gerçek sağlayıcıya gecikme enjekte edilmedi.

### 6. AI öğretmeni öğrenme hedefini kullanmıyor

Kaynak: `server/geminiTutorPrompt.ts:27`.

Fonksiyon `profile` almasına rağmen yalnızca seviye ve rolü okuyor. Hedefi `architecture` yerine `security` yapmak aynı sahnede tamamen aynı öğretmen bağlamını üretiyor; fonksiyon karşılaştırmasıyla doğrulandı. Hedef, doğru cevabı açıklamadan soru vurgusuna eklenmeli. Sabit sonuç metinlerinde hedef uyarlaması bulunuyor; eksik olan AI öğretmeninin bağlamıdır.

### 7. Sunucu profil değerlerinin geçerliliğini kontrol etmiyor

Kaynak: `server.ts:65`.

Kontrol yalnızca üç alanın dolu olup olmadığına bakıyor. `level: 'bogus'`, `role: {}`, `goal: true` gibi geçersiz değerler bu kontrolden geçebilir. Seviye, rol ve hedef desteklenen string değerlerle sınanmalı. Bu örnek sağlayıcı çağrısı başlatabileceğinden gerçek anahtar bulunan sunucuya gönderilmedi; bulgu kaynak incelemesine dayanıyor. İsimlendirme farklılığı tek başına hata değildir: kodda `testing/security`, plandaki `testing/privacy` karşılıkları tutarlı eşlendiğinde korunabilir.

### 8. Yeni sahne başlığına klavye odağı taşınmıyor

Kaynak: `src/App.tsx:50`, `src/components/Header.tsx:53`.

Devam yalnızca durum güncelleyip sayfayı kaydırıyor. Odaklanan düğme kaldırıldığında yeni sahne başlığına odak verilmediği için ekran okuyucu/klavye kullanıcısı geçişi takip etmekte zorlanabilir. `DESIGN.md` içindeki başlığa odak taşıma kuralı uygulanmalı.

## Ödev için henüz bulunmayan kanıtlar

- 20 gerçek öğrenci girdisi, gerçek öğretmen yanıtları, elle sızdırma/hata etiketleri, pay/payda biçiminde oran ve gerekiyorsa önce/sonra koşuları.
- Cypress yapılandırması, bütün yolları içeren testler ve Cypress koşu kanıtı. Bu incelemedeki Playwright kontrolü, istenen Cypress tesliminin yerine geçmez.
- Yaklaşık 60 saniyelik demo video ve linki.
- GitHub repo linki. Klasör henüz Git reposu değil.
- Tek teslim README'si: export içindeki README üç kapsam dışı özelliği gerekçelendiriyor; kökteki README şablon halinde. Tek repoda gerçek sonuçlar ve teslim bağlantılarıyla birleştirilmeli.

## Korunanlar ve çalışma sınırı

Ana dizin ile `export_acilde_60_dakika` içindeki 18 kaynak/yapılandırma dosyası aynı; iki README farklı. Kontrol sonunda bu 18 dosyanın hash eşitliği doğrulandı. Aynı uygulamanın iki kopyası test sayısını ikiye katlıyor; tek uygulama kaynağı belirlenmeli, dışa aktarım arşivi otomatik test taramasına dahil edilmemeli.

`test/images` ve `test/labels` içinde araç/plaka veri kümesine benzeyen uygulama dışı dosyalar var. Oyunun gereksinimleriyle ilişkili görünmüyor; silinmedi veya taşınmadı. Yeni eklenen inceleme raporu, ham sonuç ve ekran görüntüleri uygulamanın düzeltildiği anlamına gelmez.

Geçici `.review-tools/` klasörünü topluca silme komutu otomatik izin denetiminde reddedildi; gerekli sandbox onayı bu oturumda kullanılamıyor. Klasör korundu ve `.gitignore` içine eklendi. Yalnızca bu incelemenin oluşturduğu iki geçici sunucu dosyası ayrı, sınırlı dosya işlemiyle kaldırıldı. Uygulamanın kaynakları ve paket tanımları korunuyor.

Önerilen sıra: kurulum ve yerel anahtar yükleme → durum/öğretmen hataları → testleri tekrar çalıştırma → 20 gerçek öğretmen değerlendirmesi → Cypress → demo ve teslim README'si.
