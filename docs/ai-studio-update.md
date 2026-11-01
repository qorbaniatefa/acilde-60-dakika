# AI Studio'ya güncel kodu aktarma

Bu oturumda Google AI Studio hesabını yöneten bağlı araç bulunmuyor. Plugin aramasında da bu işlemi gerçekleştirecek bağlantı bulunamadı. Dolayısıyla yerel dosyaların hazırlanması, uzaktaki projenin güncellendiği anlamına gelmez.

## Yapılacak tek işlem

1. [Mevcut AI Studio projesini](https://ai.studio/apps/ce35fb73-e633-48c7-b88f-e6629bf4015f) aç.
2. `teslim/AI-STUDIO-GUNCELLEME.txt` dosyasının tamamını projenin mesaj alanına yapıştırıp gönder. Metin, aktarılacak güncel dosyaları yol ve içerikleriyle birlikte içerir. Dosya ekleme destekleniyorsa metin dosyasını da ekleyebilirsin.
3. Uygulama açıldığında güncel kaynakları ve AI Studio'nun verdiği kontrol sonucunu dışa aktar; yeni bir alt klasör olarak bu çalışma klasörüne koy. Çalışan paylaşım bağlantısını da bildir.

Güncel kaynakların sıkıştırılmış kopyası `teslim/acilde-60-dakika-guncel-kaynak.zip` içindedir. Arşiv, önceki export klasörünün üzerine otomatik yazılmaz.

## Sonraki sıra

Güncel uygulama kontrolü → 20 gerçek AI yanıtı → elle etiketleme ve oran → Cypress → 60 saniyelik demo → GitHub ve teslim bağlantıları.

Aktarım metni anahtar içermez. Gemini anahtarı AI Studio'nun Secrets alanında kalmalı. Tamamlanmış model değerlendirmesi veya Cypress koşusu bulunmadan bunların başarılı olduğu yazılmamalı.
