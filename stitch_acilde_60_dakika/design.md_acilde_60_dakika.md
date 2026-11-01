# DESIGN.md — Acilde 60 Dakika Tasarım Sistemi

## 1. Genel Bakış ve Konsept
"Acilde 60 Dakika", yazılım mühendisliği öğrencilerine yönelik, kurgusal bir acil servis hasta kayıt sistemi krizini yönetmeyi öğreten metin tabanlı, mobil öncelikli interaktif bir teknik simülasyondur.

- **Atmosfer**: Gece nöbeti sakinliği, operasyonel ciddiyet ve teknik sorumluluk.
- **Karakter**: Ciddi, okunabilir, karakterli hikâye anlatımı (Ece ve Deniz ile ekip içi mesajlaşma, teknik durum telemetrisi, karar blokları).
- **Yasaklar**: Kan, korku, tıbbi grafikler, oyunlaştırılmış puan yağmuru, çizgi film estetiği ve gerçek hasta/kimlik verileri kesinlikle kullanılmaz.

---

## 2. Renk Paleti (Tokens)

| Token | Hex Kodu | Kullanım Alanı |
|---|---|---|
| `bg-primary` (Zemin) | `#0B1424` | Ana sayfa arka planı (Koyu lacivert) |
| `surface-card` (Yüzeyler) | `#152238` | Kartlar, mesaj baloncukları, seçenek konteynerleri |
| `surface-secondary` | `#1E2D4A` | Vurgulu yüzeyler, buton hover/seçili durumları |
| `border-subtle` | `#233554` | Sınır çizgileri ve ayrım hatları |
| `accent-primary` (Vurgu) | `#FFB454` | Amber ana vurgu rengi, aktif butonlar, kilit durum rozetleri |
| `text-primary` | `#F4F1E9` | Kırık beyaz ana metinler, başlıklar |
| `text-secondary` | `#94A3B8` | Yardımcı açıklamalar, alt bilgiler, zaman damgaları |
| `status-success` | `#2ECC71` | Başarı, kontrollü durumlar (yalnızca renkle değil simge/metinle de desteklenir) |
| `status-danger` | `#E74C3C` | Sorun, yüksek yoğunluk, risk bildirimleri (metinle destekli) |

---

## 3. Tipografi ve Hiyerarşi

- **Birincil Yazı Ailesi**: `Plus Jakarta Sans` / `Inter` (Tam Türkçe karakter seti desteği: ğ, ü, ş, ı, ö, ç).
- **Teknik / Durum Etiketleri**: `JetBrains Mono` / `ui-monospace` (Sistem telemetrisi, hata kodları, zaman damgası).
- **Boyut Kuralları**:
  - Sayfa Başlığı: `24px - 28px` / Bold
  - Bölüm / Karar Başlığı: `18px - 20px` / Semi-bold
  - Gövde Metni: En az `16px` / Regular / Satır yüksekliği: `1.5 - 1.6`
  - Teknik Etiketler ve Rozetler: `12px - 14px` / Monospace / Uppercase

---

## 4. Düzen ve Dokunma Standartları (Mobile-First)

- **Genişlik**: 375px mobil ekran genişliğinde kesinlikle yatay kaydırma (horizontal scroll) olamaz.
- **Dokunma Alanları**: Tüm butonlar, seçim kartları ve girdi alanları en az **44x44px** dokunma hedefi (touch target) sunar.
- **Masaüstü Uyumu**: Geniş ekranlarda `max-w-md` (~448px) veya `max-w-lg` genişliğinde ortalanmış kart görünümü korunur.

---

## 5. Ekran Bileşenleri

### 5.1. Ekran 1: Nöbete Giriş
- Başlık, alt başlık ve `Tek hikâye · 3 karar · 2 son` meta rozeti.
- 3 zorunlu seçim grubu: Seviye, Rol, Öğrenme Hedefi.
- Doğrulama kontrollü CTA: "Nöbete başla" (Tüm sorular seçilmeden disabled/devre dışı).
- Yasal/Bilgilendirme notu: "Yaklaşık 5–8 dakika. Tüm olaylar ve kayıtlar kurgusaldır."

### 5.2. Ekran 2: Hikâye Sahnesi
- Nöbet saati (`Gece nöbeti · 20.00`), karar aşaması (`Karar 1 / 3`) ve başlık (`Yoğunluğu yönet`).
- Ekip mesajlaşması: Ece ve Deniz için avatar ve açık ad etiketli sohbet blokları.
- Teknik telemetri kartı: `İstek yoğunluğu: yüksek` & `Kayıt akışı: yavaş`.
- İki eşit görsel ağırlıkta tarafsız karar seçeneği (seçim öncesi doğru cevap ipucu verilmez).
- Katlanabilir / destekleyici "AI Öğretmenin" alanı: Düşünce alanı + "İpucu iste" düğmesi.
- Karar sonrası tetiklenen "Ne oldu?" ve "Neden oldu?" analiz alanı ile "Devam" düğmesi.

### 5.3. Ekran 3: Nöbetin Sonu
- İki sonucu da temsil edebilen modüler yapı:
  - **İyi Son**: "Nöbet Kontrol Altında"
  - **Kötü Son / Bedel**: "Krizin Bedeli" (Sistem ayakta fakat veri sızıntısı var).
- 3 kararın geri bildirim özet tablosu.
- "Bu nöbetten öğrendiğin" ana çıkarım paneli.
- "Yeniden oyna" aksiyon butonu.
