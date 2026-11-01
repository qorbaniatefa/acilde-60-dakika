---
name: Nocturnal Systems Console
colors:
  surface: '#0a1323'
  surface-dim: '#0a1323'
  surface-bright: '#31394b'
  surface-container-lowest: '#050e1e'
  surface-container-low: '#131c2c'
  surface-container: '#172030'
  surface-container-high: '#212a3b'
  surface-container-highest: '#2c3546'
  on-surface: '#dae2f9'
  on-surface-variant: '#d6c3b1'
  inverse-surface: '#dae2f9'
  inverse-on-surface: '#283042'
  outline: '#9f8e7d'
  outline-variant: '#524436'
  surface-tint: '#ffb961'
  primary: '#ffd8af'
  on-primary: '#472a00'
  primary-container: '#ffb454'
  on-primary-container: '#734600'
  inverse-primary: '#865300'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffd5d3'
  on-tertiary: '#670211'
  tertiary-container: '#ffaeab'
  on-tertiary-container: '#95272d'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffddb9'
  primary-fixed-dim: '#ffb961'
  on-primary-fixed: '#2b1700'
  on-primary-fixed-variant: '#663e00'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdad8'
  tertiary-fixed-dim: '#ffb3b0'
  on-tertiary-fixed: '#410006'
  on-tertiary-fixed-variant: '#881d24'
  background: '#0a1323'
  on-background: '#dae2f9'
  surface-variant: '#2c3546'
typography:
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-code-lg:
    fontFamily: JetBrains Mono
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  label-code-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-code-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 1.5rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

Bu tasarım sistemi, yüksek stresli ve kritik sistem mühendisliği kararlarının verildiği simüle edilmiş bir gece nöbeti operasyon konsolunu temsil eder. Tıbbi kan, korku ya da çizgi film estetiğinden tamamen arındırılmıştır; bunun yerine bir telemetri istasyonu, kritik altyapı yönetim paneli ve interaktif kod tanı terminalinin soğukkanlı ciddiyetini taşır.

Tasarım dili, **Hassas Teknik Minimalizm** ile **Karanlık Mod Telemetri** estetiğini birleştirir:
- **Karakter & Ton:** Odaklanmış, analitik, hatasız ve sakin. Kullanıcıyı paniğe sevk etmek yerine net telemetri verileriyle rasyonel problem çözmeye yönlendirir.
- **Hedef Kitle:** Yazılım mimarları, SRE mühendisleri ve sistem güvenilirliği üzerine çalışan profesyoneller.
- **Hissiyat:** Gece yarısı sessiz bir operasyon odasında parlayan yüksek çözünürlüklü göstergeler, hassas durum raporları ve kesin telemetri verileri.

## Colors

Renk paleti, gece nöbetinin düşük ışıklı operasyonel ortamında göz yorgunluğunu en aza indirmek ve bilgi hiyerarşisini anında ayırt etmek için tasarlanmıştır.

- **Zemin & Katmanlar:**
  - `Canvas / Derin Zemin`: `#0B1424` (Sonsuz derinlik, gece konsolu tabanı)
  - `Card / Yüzey Seviye 1`: `#152238` (Konteyner paneller, telemetri modülleri)
  - `Surface Elevated / Yüzey Seviye 2`: `#1D2D49` (Açılır menüler, modal paneller, aktif kartlar)
  - `Borders / Düşük Kontrastlı Sınırlar`: `rgba(244, 241, 233, 0.08)` ve odak durumları için `rgba(255, 180, 84, 0.3)`
- **Tipografi:**
  - `Ana Metin`: `#F4F1E9` (Kırık beyaz, göz kamaştırmayan yüksek okunabilirlik)
  - `İkincil / Açıklama`: `rgba(244, 241, 233, 0.65)`
  - `Devre Dışı / Telsiz Boşluğu`: `rgba(244, 241, 233, 0.38)`
- **Vurgu & Durumlar:**
  - `Primary (Kehribar Konsol Işığı)`: `#FFB454` (Zamanlayıcılar, önemli etkileşimler, aktif durumlar)
  - `Success / Telemetri Nominal`: `#10B981` (Sistem kurtarma, başarılı dağıtım, test geçişi)
  - `Danger / Sistem Alarmı`: `#F87171` (Kritik kesintiler, başarısız testler, bellek sızıntıları)
  - `Info / Teknik Bildirim`: `#60A5FA` (Log kayıtları, sistem mesajları)

## Typography

Tipografi stratejisi, analitik kesinlik ile gece koşullarında üstün okunabilirlik üzerine kuruludur:
- **Okunabilirlik Standardı:** Mobil cihazlarda ana içerik hiçbir zaman 16px altına inmez. Satır yükseklikleri kriz senaryosu metinlerinin taranmasını kolaylaştırmak için ferah tutulmuştur.
- **İkili Tipografi Düzeni:** Genel anlatı ve arayüz yönlendirmeleri için ergonomik ve modern `Plus Jakarta Sans`, zaman sayaçları, telemetri kodları, HTTP yanıtları ve log pencereleri için ise net ve monospaced `JetBrains Mono` kullanılır.
- **Rakam Gösterimi:** Süre sayaçlarında (örneğin "59:42") rakamların zıplamasını engellemek için `font-variant-numeric: tabular-nums` kuralı zorunludur.

## Layout & Spacing

Sistem, dar mobil ekranlardan (en dar hedef 375px genişlik) operasyon merkezi monitörlerine kadar kesintisiz ölçeklenir:
- **Grid Modeli:** Mobil için 4 sütunlu esnek grid (16px margin, 12px gutter); masaüstü telemetri düzeni için 12 sütunlu grid (24px margin, 24px gutter).
- **Dokunma Ergonomisi:** Kritik aksiyon alanları ve interaktif konsol butonları mobil cihazlarda daima minimum **48px x 48px** (en az `44px`) dokunma alanı sunar.
- **Dikey Ritim:** Kart içi öğeler `space-sm` (8px) ve `space-md` (16px) katlarıyla ayrılır; modüller arası mesafe `space-lg` (24px) olarak kilitlenmiştir.

## Elevation & Depth

Tasarım sistemi, ağır ve gerçekçi olmayan gölgeler yerine **Karanlık Tonal Katmanlama** ve **Hafif Lojik Sınırlar** kullanır:
- **Katmanlama Modeli:** Derinlik, ışık gölgeleriyle değil, arka plan tonunun koyudan açığa doğru (`#0B1424` -> `#152238` -> `#1D2D49`) kademelenmesiyle elde edilir.
- **Sınır Konturları:** Kartlar ve modüller `1px solid rgba(244, 241, 233, 0.07)` sınır çizgisine sahiptir. Bu, arayüze hassas ve kalibre edilmiş bir donanım cihazı hissi kazandırır.
- **Odak & Uyarı İşıması:** Kritik bir alarm veya aktif durum seçildiğinde, yaygın yumuşak bir ışık (`box-shadow: 0 0 20px rgba(255, 180, 84, 0.15)`) ilgili elemanı öne çıkarır.

## Shapes

Endüstriyel konsol hissini pekiştirmek için yumuşak fakat kontrollü kenar kıvrımları tercih edilmiştir (`roundedness: 1`):
- **Kartlar ve Konteynerler:** `8px` (`rounded-lg`) köşe yuvarlatma, düzenli ve profesyonel bir yapı sunar.
- **Butonlar ve Girdiler:** `6px` ile `8px` arasında kompakt, hassas köşeler.
- **Telemetri Çipleri & Durum Etiketleri:** `4px` hafif kırılmış köşelerle monospaced içeriğin formunu korur. Yuvarlak kapsül (pill) formundan endüstriyel ciddiyeti korumak adına kaçınılmıştır.

## Components

### Butonlar
- **Primary (Konsol Aksiyonu):** Kehribar `#FFB454` dolgu, zemin rengi `#0B1424` kalın yazı. Minimum yükseklik mobil için 48px. Üzerine gelindiğinde veya tıklandığında hafif parlama efekti.
- **Secondary (Telemetri İnceleme):** Şeffaf zemin, `#152238` kart çerçevesi, `#F4F1E9` metin.
- **Danger (Acil Durdurma/Yama Geri Alma):** `#F87171` sınır çizgisi ve açık mercan metin.

### Kartlar & Telemetri Panelleri
- `#152238` yüzey, `1px solid rgba(244, 241, 233, 0.08)` kenarlık. Kart başlığında monospaced sistem saati veya servis durumu yer alır.

### Durum Çipleri & Göstergeler
- `JetBrains Mono` fontu, büyük harf, `12px`.
- *Nominal*: `#10B981` metin, `rgba(16, 185, 129, 0.12)` dolgu ve `1px solid rgba(16, 185, 129, 0.25)` kenarlık.
- *Kritik Uyarı*: `#F87171` metin, `rgba(248, 113, 113, 0.12)` dolgu ve `1px solid rgba(248, 113, 113, 0.25)` kenarlık.

### Terminal & Kod Blokları
- İç girinti `16px`, zemin `#090F1B`, monospaced metin, satır numaralandırmaları soluk (`rgba(244, 241, 233, 0.3)`). Mobilde sağa-sola kaydırma (horizontal scroll) mekanizması akıcı ve göstergelidir.

### Seçim Elemanları (Radio / Checkbox)
- En az 24px boyutunda, 48px dokunma alanına sahip kare/dairesel kutular. Seçildiğinde kehribar `#FFB454` renk dolgusu ile anında geri bildirim sağlar.