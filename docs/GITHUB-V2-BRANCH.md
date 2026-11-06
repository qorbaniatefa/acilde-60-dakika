# V2 çalışma dalının kapsamı

**GitHub dalı henüz oluşturulamadı.** Kaynak ağacı oluşturma isteği entegrasyon tarafından `403 Resource not accessible by integration` ile reddedildi. Aşağıdaki kapsam yerelde hazırlanmış 49 dosyalık kaynak değişikliğini tarif eder; uzaktan yayınlanmış sürüm veya tamamlanmış Ödev 7 teslimi değildir.

- Yerelde sentetik pilot eğitildi: balanced accuracy=.76861702, recall=.75; sklearn/ONNX farkı 1.23363796e-7. Python oracle 5+300 kontrolü geçti.
- Model kartı yerel eğitimden gelen ölçümleri taşır. Yeni ONNX/config ve yeni 300 girdilik dosyaların sandbox okuma erişimi engellendiğinden bu kaynak dalına aktarılmadı. Klonlayan kişi README'deki üç komutla bunları yeniden üretmelidir. Beş girdilik mevcut oracle dosyası kaynak dalındadır.
- Bu dalın kaynakları mevcut main üzerine eklenir; önceki V1 video ve ölçümleri korunur ve V2 model kanıtı sayılmaz.
- Gerçek kullanıcı oturumu 0/15; HF yayını, uygulama içi gerçek WASM paritesi, Cypress koşusu ve V2 video tamamlanmadı.
- Yerel runtime hazırlama komutu eklendi, indirme henüz doğrulanmadı. İndirme için izin yükseltme otomatik politika tarafından reddedildi; başka bir yolla aşılmadı.

Güncel işler: [ODEV7-TESLIM.md](ODEV7-TESLIM.md).
