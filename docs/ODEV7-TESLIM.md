# Ödev 7 — sentetik pilot teslimi

Son tarih **6 Kasım 2026 23:59 (Türkiye)**. Kullanıcı 1. seçeneği seçti: yalnız sentetik pilot. Veri kaleminin yönergedeki yarım puan sınırlaması kabul edilir; toplam puan sonucu iddia edilmez.

## Veri durumu

Etkin eğitimde **180 sentetik oturum / 540 satır** var. Tek kişinin oynadığı 15 insan oturumu/45 satırın hedefleri kullanıcı beyanına göre rastgeleydi. Bunlar kaynak ve etiketleri değiştirilmeden `data/arsiv/` içine alındı; geçerli kullanıcı tercihi verisi veya üç gönüllü kanıtı olarak kullanılmaz. `data/etiket_kalitesi.json` UUID'lerin eğitim/yayına geri girişini engeller. Ayrıntı: [etiket durumu](../data/ETIKET_DURUMU.md).

| Kalem | Durum / kalan |
|---|---|
| Spec ve önceden belirlenen eşik | Korundu: .75 balanced accuracy, .70 recall, parite<1e-4. 6 Kasım pilot kararı spec'e eklendi. |
| Veri | Yalnız sentetik; geçerli gerçek tercih etiketi yok. Veri kalemi yarım değerlendirilir. |
| Eğitim | **Pilot yeniden eğitildi:** balanced accuracy=.76861702, recall=.75; ikinci eğitim aynı metrik/model SHA'sını verdi. Yalnız sentetik simülasyon. |
| Artefakt | ONNX + config + şema + kart üretildi; sürüm2.0.0-pilot, gerçek doğrulama=false. |
| Parite / regresyon | HF commit'li kaynakla Cypress **17/17** tekrar geçti; 5+300 girdide max fark1.1920929e-7. [Koşu kaydı](checks/2026-11-06-cypress-hf.json). |
| HF yayını | **Tamamlandı:** Atefa/acilde-primer-v2-pilot, commit816ac3e612d7684e79ba6b2f28d6104e0e7c3139. Oturumsuz indirme/hash doğrulandı. |
| Mimari / rollout / rollback | RELEASE hazır; uygulanmış gerçek üretim deneyi değil. |
| GitHub | Eski V1 uzak depoda; entegrasyon yazma403. Kullanıcı tarafında kaynak aktarımı gerekli. |
| Canlı uygulama | V2 aktarımı ve oturumsuz erişim kontrolü kaldı. |
| V2 video | İki farklı gerçek model kararı gösteren 60–90sn kayıt/public link kaldı. |
| Sınav tasarımı / AI beyanı | Hazır; öğrencinin kendi görüşüyle incelemesi gerekiyor. |
| Bonus sunucu | Yapılmadı, zorunlu değil. |

## Sıra

1. `npm run train`; sentetik pilot metadata'sı ve oracle üretilir. Eşik düşürülmez.
2. `npm test`, `npm run test:ml`, `npm run lint`, `npm run build`, `npm run parite`; model değiştiyse uygulama açıkken `npm run test:e2e`.
3. Kullanıcının normal PowerShell'inde `npm.cmd run login:hf`. Token gizli terminal girdisine yazılır, sohbetten gönderilmez. SDK giriş yolu eksik Click bağımlılığı olan `hf` CLI'sını kullanmaz.
4. `npm.cmd run publish:pilot -- kullanici/acilde-primer-v2-pilot`; tam commit URL'si üretilir. Varsayılan `publish:model` gerçek veri şartını korur.
5. Kaynakları GitHub'a ve canlı V2'ye aktar. Statik web'de manuel Gemini API yoktur; küçük ONNX ve hikâye çalışabilir.
6. [Demo senaryosuyla](primer-v2-demo.md) 60–90sn videoyu çek. Dört public bağlantıyı gizli pencerede açıp [formu](https://forms.gle/pr9QVEfLJuaFiXw39) doldur.

Geçmiş veri toplama ve başarısız gerçek eval kaydı [arşivlenmiştir](history/2026-11-05-ODEV7-before-pilot.md). Önceki .50 sonucu silinmez; daha sonra açıklanan rastgele etiketler nedeniyle gerçek tercih başarısı ölçümü olarak yorumlanmaz. Eski V1 `teslim/` paketi güncel V2 paketi değildir. `.env*`, `.venv`, `node_modules`, `.review-tools` ve uygulama dışı `test/images`/`test/labels` yüklenmez.

6 Kasım hazırlık kanıtı: [sentetik pilot doğrulama kaydı](checks/2026-11-06-synthetic-pilot.json). HF girişi, yayın ve HF kaynaklı Cypress koşusu tamamlandı. Sıradaki adım kaynak klasöründe `npm.cmd run prepare:github`; ardından GitHub/canlı V2/video. Hesap bilgileri/token sohbetten gönderilmez.
