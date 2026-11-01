Mevcut Acilde 60 Dakika projesini aşağıdaki güncel kaynaklarla güncelle. Yeni bir uygulama veya farklı hikâye oluşturma. Dosya yollarını koru; listelenen dosyaları verilen içerikle değiştir veya ekle.

Bu, 3 karar ve 2 son içeren Türkçe sağlık yazılımı macerasıdır. Davranışın kaynağı spec.md, görünümün kaynağı DESIGN.md dosyasıdır.

1. Önce bütün dosyaları uygula. node_modules, eski export arşivi ve yerel inceleme araçları bu aktarımın parçası değildir. package.json için npm kullan; paket kilidini bu manifestle tutarlı hale getir.
2. Node.js en az 22.18 olmalı. GEMINI_API_KEY değerini yalnızca mevcut sunucu Secrets/ortam değişkeninden al. Metne veya istemciye anahtar yazma. GEMINI_MODEL hesabın tarafından desteklenen model olmalı; gerçek servis sonucu yoksa desteklendiğini varsayma.
3. npm test, npm run lint ve npm run build komutlarını gerçekten çalıştır; çıktılarını kısa raporla. Yereldeki son doğrulama 43 testti. Sonuçları aynen tekrar etmek yerine bu projede elde edilen gerçek çıktıyı kullan.
4. npm run dev ile web önizlemesini aç. Giriş, üç karar, A-A-A iyi sonu ve A-A-B sonunda çalışan sistemin KONTROLLÜ etiketi kontrol edilsin. Yeniden oyna profili temizlesin.
5. API bağlantısı hazırsa tek bir gerçek öğretmen isteğiyle bağlantı durumunu kontrol et. Bu tek istek 20 örnekli değerlendirme sayılmaz. Bir servis veya model hatası varsa gerçek hata türünü anahtarları gizleyerek bildir.
6. Bu aşamanın sonunda güncel paylaşım bağlantısını, değişen dosyaları ve gerçekten geçen kontrolleri kısaca bildir. Değerlendirme, Cypress veya video kanıtı üretmediysen bunları yapılmış gibi sunma. Sonraki aşamada eval/runs çıktıları incelenecek.

Aşağıda her DOSYA bloğu ayrı bir gerçek proje dosyasıdır. Markdown ayraçlarını dosya içeriğine ekleme.
