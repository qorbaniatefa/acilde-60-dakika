import type {
  DecisionDefinition,
  DecisionId,
  ChoiceOption,
  DecisionChoices,
  UserGoal,
} from '../types';

export const DECISIONS: Record<DecisionId, DecisionDefinition> = {
  1: {
    id: 1,
    orderLabel: '01.',
    title: 'Yoğunluğu Yönet',
    topic: 'architecture',
    topicLabel: 'MİMARİ',
    summaryLabel: 'YOĞUNLUK YÖNETİMİ',
    eceDialogue: '“Kayıt ekranları yine yanıt vermiyor. Aynı işlem için tekrar tekrar deniyorlar. Bekleyenler artıyor. Bir saat içinde sistemi toparlayabilir miyiz?”',
    denizDialogue: '“Veritabanına erişebiliyoruz. Eşzamanlı istekler kapasiteyi aşıyor. Sistemdeki mevcut kalıcı kuyruk desteği şu an kapalı.”',
    technicalContext:
      'Veritabanı bağlantısı sağlıklı ve erişilebilir durumdadır. Gelen kayıt istekleri sistemin aynı anda işleyebileceği sayıyı aşmaktadır. Sistemde kullanılabilecek kalıcı kuyruk desteği şu an kapalıdır. Bu kuyruk teknik kayıt istekleri içindir; tıbbi triyaj sırasını değiştirmez.',
    beginnerTerminology: {
      term: 'Eşzamanlı İşlem Sınırı & Kalıcı Kuyruk',
      definition:
        'Sistemin aynı anda işleyebileceği en fazla istek sayısını belirleme ve fazla gelen istekleri bellekte kaybolmayacak şekilde sıraya alma yöntemidir.',
    },
    beginnerThinkingPrompt:
      'Gelen istek hacmi anlık işleme kapasitesini aştığında, aradaki farkı yönetmek için sistem hangi mekanizmalara ihtiyaç duyar?',
    rolePerspectiveNote: {
      developer:
        'Geliştirici bakışı: İstekler işlem kapasitesini aştığında hangi kaynakların dolduğunu ve bekleyen işlerin nerede kaldığını nasıl gözlemlersin?',
      tester:
        'Test mühendisi bakışı: Müdahale öncesi ve sonrasını karşılaştırmak için hangi ölçümlere ihtiyaç duyarsın?',
    },
    telemetry: {
      label1: 'İstek Yoğunluğu',
      value1: 'YÜKSEK',
      sub1: '4.2k req/s (aşım)',
      label2: 'Kayıt Akışı',
      value2: 'YAVAŞ',
      sub2: 'P99 > 12.4s',
      note: '(Kurgusal simülasyon telemetrisi) BUFFER_MODE: OFF',
    },
    question: 'İlk müdahalen ne olacak?',
    choices: {
      A: {
        text: 'Mevcut kalıcı kuyruğu ve eşzamanlı işlem sınırını etkinleştir.',
        tacticalBadge: 'Taktik: Akış Kontrolü & Kuyruk',
      },
      B: {
        text: 'Sınırsız eşzamanlı istek kabul etmeyi sürdür.',
        tacticalBadge: 'Taktik: Tam Geçirgenlik Modu',
      },
    },
    getOutcome: (choice: ChoiceOption, _prev: DecisionChoices, goal: UserGoal | null) => {
      const isArchitectureGoal = goal === 'architecture';
      const goalSentence = isArchitectureGoal
        ? ' Mimari açıdan, kontrolsüz eşzamanlılık yerine kalıcı kuyruk ve geri basınç (backpressure) uygulanması sistemin tükenmesini engeller.'
        : '';

      if (choice === 'A') {
        return {
          whatHappened: 'İstekler kontrollü işlenmeye başladı.',
          whyHappened:
            'Aynı anda çalışan işlem sayısı sınırlandı; bekleyen işler kalıcı kuyrukta tutuldu.' +
            goalSentence,
        };
      } else {
        return {
          whatHappened:
            'Aşırı yük, zaman aşımı ve yeniden deneme trafiği devam etti; kayıt akışı kilitlendi.',
          whyHappened:
            'İstek sayısı işlem kapasitesini aştı; sınır ve kuyruk olmadığı için sistem kaynakları tükendi.' +
            goalSentence,
        };
      }
    },
  },

  2: {
    id: 2,
    orderLabel: '02.',
    title: 'Müdahaleyi Doğrula',
    topic: 'testing',
    topicLabel: 'TEST & DOĞRULAMA',
    summaryLabel: 'TEST & ZAMAN AŞIMI',
    eceDialogue: '“Kayıt ekranlarında durum belirsizliğini koruyor. Canlı sisteme yeni bir ayar daha geçilecek mi?”',
    denizDialogue: '“İlk kararın canlıda devrede. Şimdi bağlantı zaman aşımı sınırlarını düzenleyen ikinci ayar hazır. Bu ayar kuyruk veya eşzamanlı işlem sınırını değiştirmez. Sentetik yük altında çalışan ayrı test ortamımız hazır.”',
    technicalContext:
      'İlk tercihin yapılandırması canlı sisteme işlenmiştir. Bundan bağımsız olarak bağlantı zaman aşımı sürelerini düzenleyen ikinci bir konfigürasyon hazırlanmıştır. İlk kararın yapılandırmasını kullanan ayrı test ortamı ve sentetik test verisi hazırdır. İkinci ayarı devreye almadan önce kısa bir test yürütme fırsatı bulunmaktadır.',
    beginnerTerminology: {
      term: 'Sentetik Test Ortamı & Doğrulama',
      definition:
        'Canlı sistemi riske atmadan, kurgusal yoğunluk verisi üreterek yeni ayarların kayıt akışına ve gecikmeye etkisini önceden ölçümleyen izole ortamdır.',
    },
    beginnerThinkingPrompt:
      'Canlı ortama yapılacak bir konfigürasyon değişikliğini devreye almadan önce ayrı bir ortamda test etmenin getireceği güvenceler nelerdir?',
    rolePerspectiveNote: {
      developer:
        'Geliştirici bakışı: Zaman aşımı ayarının mevcut kayıt akışıyla etkileşimini anlamak için hangi kanıta ihtiyaç duyarsın?',
      tester:
        'Test mühendisi bakışı: Bu değişikliğin kabul ölçütlerini nasıl tanımlarsın; hangi sonuç bir varsayımını yanlışlayabilir?',
    },
    telemetry: {
      label1: 'Test Ortamı',
      value1: 'HAZIR',
      sub1: 'Sentetik Yük Hazır',
      label2: 'Doğrulama Durumu',
      value2: 'BEKLİYOR',
      sub2: 'Timeout Parametresi',
      note: '(Kurgusal simülasyon telemetrisi) ENV: STAGING_ISOLATED',
    },
    question: 'Zaman aşımı ayarını nasıl uygulayacaksın?',
    choices: {
      A: {
        text: 'Zaman aşımı ayarını yük ve temel kayıt akışı kontrolüyle doğrula; yalnızca kontroller geçerse uygula.',
        tacticalBadge: 'Taktik: Sentetik Yük Kontrolü',
      },
      B: {
        text: 'Kontrolleri atlayıp zaman aşımı ayarını doğrudan uygula.',
        tacticalBadge: 'Taktik: Doğrudan Canlıya Alma',
      },
    },
    getOutcome: (choice: ChoiceOption, prev: DecisionChoices, goal: UserGoal | null) => {
      const isTestGoal = goal === 'testing';
      const goalSentence = isTestGoal
        ? ' Test mühendisliği açısından, sentetik yük doğrulaması yapılmadan canlıya alınan konfigürasyon değişiklikleri kestirilemeyen gecikme dalgalanmalarına yol açar.'
        : '';

      if (choice === 'A') {
        const firstChoice = prev[1];
        if (firstChoice === 'A') {
          return {
            whatHappened:
              'Test ortamında yük ve temel kayıt kontrolleri başarıyla geçti; zaman aşımı ayarı güvenle uygulandı.',
            whyHappened:
              'İlk adımdaki kuyruk ve sınırlandırma sayesinde sistem kontrollü çalışıyordu; testler stabil gecikmeyi doğruladı.' +
              goalSentence,
          };
        } else {
          return {
            whatHappened:
              'Test ortamındaki aşırı yük kontrolü başarısız oldu; ikinci ayar uygulanmadı ve mevcut kapasite sorunu raporlandı.',
            whyHappened:
              'İlk kararda sınırsız istek bırakıldığı için aşırı yük devam ediyordu; doğrulama hatayı yakaladı fakat ilk kararın kapasite sorununu tek başına çözemez.' +
              goalSentence,
          };
        }
      } else {
        return {
          whatHappened:
            'Zaman aşımı ayarı test ortamında doğrulanmadan doğrudan canlıya uygulandı.',
          whyHappened:
            'Müdahalenin yük altındaki etkisi ve kayıt akışı test edilmedi; doğrulama eksikliği oluştu.' +
            goalSentence,
        };
      }
    },
  },

  3: {
    id: 3,
    orderLabel: '03.',
    title: 'Ekibi Bilgilendir',
    topic: 'security',
    topicLabel: 'VERİ GÜVENLİĞİ',
    summaryLabel: 'VERİ GÜVENLİĞİ',
    eceDialogue: '“Kayıt masası tarafında bazı isteklerin neden beklediğine dair hata detayını nöbet destek kanalında paylaşabilir misiniz?”',
    denizDialogue: '“Nöbetçi destek ekibi hata örneği bekliyor. Elimdeki sentetik test kaydında kurgusal bir hasta adı ve kimlik numarası alanı yer alıyor. Teşhis için teknik hata kodu, istek kimliği ve süre bilgisi yeterli.”',
    technicalContext:
      'Yetkili kurum içi destek kanalı hata teşhisi için kayıt örneği talep etmiştir. Sentetik kayıtta kurgusal hasta adı ve bir kimlik numarası alanı mevcuttur; gerçek hasta bilgisi bulunmamaktadır. Teknik hata kodu, istek kimliği ve süre bilgisi teşhis için tamamen yeterlidir.',
    beginnerTerminology: {
      term: 'Veri Minimizasyonu & Arındırma (Sanitization)',
      definition:
        'Hata analizi veya log paylaşımı sırasında sadece amaca hizmet eden teknik verilerin aktarılması; gereksiz kişisel kimlik bilgilerinin ayıklanması prensibidir.',
    },
    beginnerThinkingPrompt:
      'Teknik bir arızayı çözmek için log paylaşırken, kişisel veriler ile teknik hata göstergeleri arasındaki sınır nasıl korunmalıdır?',
    rolePerspectiveNote: {
      developer:
        'Geliştirici bakışı: Hatanın nedenini anlamak için kayıttaki hangi alanlar arasında ilişki kurman gerekir?',
      tester:
        'Test mühendisi bakışı: Paylaşacağın örneğin teşhise yeterliliğini ve paylaşım sınırlarını hangi ölçütlerle değerlendirirsin?',
    },
    telemetry: {
      label1: 'Paylaşım Kanalı',
      value1: 'KURUM İÇİ',
      sub1: 'Yetkili Destek Kanalı',
      label2: 'Kayıt Türü',
      value2: 'SENTETİK',
      sub2: 'Kurgusal Hasta Verisi',
      note: '(Kurgusal simülasyon telemetrisi) LOG_PII_SCAN: ACTIVE',
    },
    question: 'Destek kanalına hangi hata kaydını göndereceksin?',
    choices: {
      A: {
        text: 'Kişisel alanları çıkararak teknik özeti yetkili destek kanalına gönder.',
        tacticalBadge: 'Taktik: Veri Minimizasyonu',
      },
      B: {
        text: 'Kişisel alanları içeren ham kaydı yetkili destek kanalına gönder.',
        tacticalBadge: 'Taktik: Ham Kayıt Paylaşımı',
      },
    },
    getOutcome: (choice: ChoiceOption, _prev: DecisionChoices, goal: UserGoal | null) => {
      const isSecurityGoal = goal === 'security';
      const goalSentence = isSecurityGoal
        ? ' Veri güvenliği açısından, yetkili kurum içi kanallarda dahi telemetri veya hata loglarında kişisel kimlik bilgilerinin arındırılması (sanitization) zorunludur.'
        : '';

      if (choice === 'A') {
        return {
          whatHappened:
            'Kişisel veriler temizlenerek sadece teknik hata kodu, istek kimliği ve süre bilgisi paylaşıldı.',
          whyHappened:
            'Hata teşhisi için teknik metrikler yeterlidir; hasta gizliliği ilkesine uygun hareket edildi.' +
            goalSentence,
        };
      } else {
        return {
          whatHappened:
            'Kurgusal hasta adı ve kimlik alanlarını içeren ham kayıt paylaşıldı.',
          whyHappened:
            'Teşhis için gereksiz olduğu halde kişisel veriler paylaşıldı; veri minimizasyonu ilkesi ihlal edildi.' +
            goalSentence,
        };
      }
    },
  },
};
