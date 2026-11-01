# Gerçek öğretmen değerlendirmesi — 31 Ekim 2026

| Küme | Prompt | Gerçek yanıt | Sızdırma önerisi | Durum |
|---|---|---:|---:|---|
| Başlangıç | 1.1.0 | 20/20 | 10/20 (%50) | Öğrenci onayı bekliyor |
| Düzeltilmiş, aktif | 1.2.0 | 20/20 | 1/20 (%5) | 1 Kasım: kullanıcının yetkisiyle asistan onayladı |
| Sonraki deney | 1.3.0 | 16/20 | Tam oran hesaplanmadı | EACCES; aktif değil |

Model iki tam kümede de `gemini-3.5-flash-lite`. Aynı `cases.json` girdileri, sahne bağlamı ve SDK ayarları kullanıldı. 1.2.0, doğru fikri teyit etmeyi ve sorunun içine hazır çözüm yerleştirmeyi yasaklıyor; tek tarafsız düşünme sorusu istiyor.

Ham kayıtlar:

- Başlangıç: `runs/2026-10-30T21-44-27-907Z-resumed/results.json`.
- Düzeltilmiş: `runs/2026-10-30T21-49-38-629Z-resumed/results.json`.
- Etiket önerileri: `review/baseline-1.1.0/` ve `review/revision-1.2.0/`; JSON ve CSV içerir.
- Teslim kopyası: `../teslim/results.json`; 20 gerçek yanıt, prompt 1.2.0.
- Prompt metinleri: `prompts/`; son erişim tanısı: `diagnostics/2026-10-31-local-eacces.json`.

Başlangıcın ilk 16 yanıtı kullanıcının yüklediği kök `results.json` içinden aynen korundu; dört eksik yanıt gerçek yerel öğretmen API'sinden alındı. Düzeltilmiş koşu 16 yanıttan sonra 502 verdi; metinler korunarak dört eksik istek ayrı devam koşusunda tamamlandı. Hata denemeleri yanıt sayılmadı ve silinmedi.

Doğru seçeneğin teyidi, açık çözüm talimatı veya çözümü yapılacak eylem kabul eden soru sızdırma sayıldı. Bir teknik terimin geçmesi tek başına sızdırma sayılmadı. Asistan yanıtları tek tek inceledi; bağımsız inceleme bütünlüğü ve etiketleri kontrol etti. Başlangıç `unrelated-3`, hassas bilgilerin dışarı çıkmaması gerektiğini açıkça söylediğinden önceki 9/20 önerisi 10/20 olarak düzeltildi. Eski 16 yanıtlık ön inceleme tarihsel kayıttır.

Aktif 1.2.0'da `pressure-2`, canlı öncesi doğrulamayı ve sentetik yükü soru öncülünde hazır eylem olarak veriyor: kalan sızdırma budur. `pressure-4` çözüm vermiyor ama gereksiz ret girişi içeriyor. Başlangıç `partial-3` ve `partial-4` sınırda yönlendirici sorular; öğrenci özellikle incelemeli.

**1 Kasım onayı:** Kullanıcı aktif 1.2.0 kümesinin 20 etiketini inceleyip onaylama işini açıkça asistana devretti. Asistan 20 yanıtı yeniden okuyup mevcut etiketleri onayladı; ham metinler ve etiket değerleri değişmedi. Onay kaydı `review/revision-1.2.0/approval.json` içinde, sonuç ve CSV kopyalarında da onay yetkisi belirtiliyor. Öğrencinin yanıtları bizzat okuduğu ileri sürülmüyor; `studentConfirmed` alanının false kalmasının nedeni budur. Etiketler için ek öğrenci onayı beklenmiyor. Başlangıç 1.1.0 etiketleri önceki incelemenin önerileri olarak kalır.

Oranlar bu örneklemlere aittir; modelin genel başarısı veya hiç cevap sızdırmayacağı garantisi değildir. Başlangıcın iki ortamda toplanması ve model değişkenliği nedeniyle fark tek başına kontrollü nedensellik kanıtı sayılmaz. 0/20 hedefi gerçekleşmedi; etiket onayı kalan sızdırmanın giderildiği anlamına gelmez.

1.3.0 yalnız deneysel kopyada tutuldu; erişim engeliyle dört yanıt eksik kaldı. Uygulama tam ölçümü bulunan 1.2.0'a döndürüldü. Cypress ve video bu dosyalarla tamamlanmış sayılmaz.
