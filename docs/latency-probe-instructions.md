Mevcut provider.json, gemini-3.8-flash isteğinin ApiError/504 ile bittiğini gösteriyor. Şimdi tek değişkenli zaman aşımı tanısını yap.

Aşağıdaki iki dosyayı verilen içerikle projeye uygula. Bu değişiklik yalnızca tanı betiğinin bekleme sınırını 10 saniyeden 60 saniyeye çıkarıp güvenli hata mesajı ve geçen süre kaydı ekliyor. Oyun kodu, 15 saniyelik öğretmen isteği, model adı, prompt sürümü ve 20 değerlendirme girdisi bu deneyde aynı kalsın.

1. `npm test -- test/providerProbe.test.ts` komutunu çalıştır. İki test gerçek Gemini'ye çağrı yapmaz; kaydın yazılmasını ve anahtarın kayda girmemesini kontrol eder.
2. `node scripts/probe-model.ts` komutunu yalnızca bir kez çalıştır. Bu gerçek bir tanı çağrısıdır; tek denemedir ve en fazla 60 saniye bekler. Betik sonucu otomatik olarak `eval/diagnostics/provider.json` dosyasına kaydeder.
3. Başarılı ya da başarısız sonucu aynen koru. Özellikle elapsedMs, timeoutMs, responseReceived, status, timeoutOrigin ve maskelenmiş message alanları gerekli. Anahtar veya bütün ortam değişkenlerini yazdırma.
4. Bu tanıyı 20 yanıtlık değerlendirme sayma. Sonucu görmeden model/prompt ayarlarını değiştirme veya arka arkaya aynı isteği tekrarlama.
5. `eval/diagnostics/provider.json` dosyasını proje dosyalarında indirilebilir biçimde tut ve kısaca yolunu bildir.

DOSYALAR:
