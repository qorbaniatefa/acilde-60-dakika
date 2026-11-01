import type {
  UserProfile,
  DecisionChoices,
  ChoiceOption,
  GameState,
  EndingResult,
  DecisionSummaryItem,
} from '../types';

export function canStartShift(profile: UserProfile): boolean {
  return profile.level !== null && profile.role !== null && profile.goal !== null;
}

export function createInitialGameState(): GameState {
  return {
    screen: 'profile',
    profile: {
      level: null,
      role: null,
      goal: null,
    },
    currentDecisionId: 1,
    choices: {},
    isChoiceLocked: false,
  };
}

export function getNextDecisionState(
  currentState: GameState,
  choice: ChoiceOption
): GameState {
  // If already locked for this decision, do not change choice
  if (currentState.isChoiceLocked) {
    return currentState;
  }

  return {
    ...currentState,
    choices: {
      ...currentState.choices,
      [currentState.currentDecisionId]: choice,
    },
    isChoiceLocked: true,
  };
}

export function advanceToNextStep(currentState: GameState): GameState {
  if (currentState.currentDecisionId < 3) {
    return {
      ...currentState,
      currentDecisionId: (currentState.currentDecisionId + 1) as 2 | 3,
      isChoiceLocked: false,
    };
  }

  return {
    ...currentState,
    screen: 'ending',
  };
}

export function evaluateEnding(choices: DecisionChoices): EndingResult {
  const c1 = choices[1] || 'B';
  const c2 = choices[2] || 'B';
  const c3 = choices[3] || 'B';

  const isGood = c1 === 'A' && c2 === 'A' && c3 === 'A';
  const hasCapacityIssue = c1 === 'B';
  const hasUnverifiedTesting = c2 === 'B';
  const hasDataBreach = c3 === 'B';

  // Construct decision summaries
  const summaries: DecisionSummaryItem[] = [];

  // Decision 1 summary
  if (c1 === 'A') {
    summaries.push({
      id: 1,
      orderLabel: '01.',
      title: 'YOĞUNLUK YÖNETİMİ',
      appliedText: 'Kalıcı kuyruk etkinleştirildi · Kontrollü işleme',
      badgeText: 'UYGULANDI',
      isPositive: true,
    });
  } else {
    summaries.push({
      id: 1,
      orderLabel: '01.',
      title: 'YOĞUNLUK YÖNETİMİ',
      appliedText: 'Sınırsız istek kabul edildi · Kapasite aşıldı ve zaman aşımı oluştu',
      badgeText: 'KAPASİTE AŞIMI',
      isPositive: false,
    });
  }

  // Decision 2 summary
  if (c2 === 'A') {
    if (c1 === 'A') {
      summaries.push({
        id: 2,
        orderLabel: '02.',
        title: 'TEST & ZAMAN AŞIMI',
        appliedText: 'Yük ve kayıt akışı test edildi · Stabil gecikme doğrulandı',
        badgeText: 'UYGULANDI',
        isPositive: true,
      });
    } else {
      summaries.push({
        id: 2,
        orderLabel: '02.',
        title: 'TEST & ZAMAN AŞIMI',
        appliedText: 'Yük testi aşırı yük nedeniyle başarısız oldu · Ayar canlıya alınmadı',
        badgeText: 'TESTTE KALDI',
        isPositive: false,
      });
    }
  } else {
    summaries.push({
      id: 2,
      orderLabel: '02.',
      title: 'TEST & ZAMAN AŞIMI',
      appliedText: 'Test adımı atlandı · Zaman aşımı ayarı doğrulanmadan uygulandı',
      badgeText: 'DOĞRULANMADI',
      isPositive: false,
    });
  }

  // Decision 3 summary
  if (c3 === 'A') {
    summaries.push({
      id: 3,
      orderLabel: '03.',
      title: 'VERİ GÜVENLİĞİ',
      appliedText: 'Kişisel veriler temizlendi · Gizlilik korundu',
      badgeText: 'GÜVENLİ',
      isPositive: true,
    });
  } else {
    summaries.push({
      id: 3,
      orderLabel: '03.',
      title: 'VERİ GÜVENLİĞİ',
      appliedText: 'Ham kayıt paylaşıldı · Gereksiz kişisel bilgi aktarıldı',
      badgeText: 'VERİ İHLALİ',
      isPositive: false,
    });
  }

  const keyLearnings = [
    {
      title: 'Rate-Limiting & Geri Basınç',
      description:
        'Sistemi aşırı yükten korumak, yavaş ama tutarlı bir kuyruk akışı sağlamaktan geçer.',
    },
    {
      title: 'Sentetik Test Doğrulaması',
      description:
        'Canlı sisteme müdahale etmeden önce izole ortamda yük kontrolü yapmak kestirilemeyen arızaları önler.',
    },
    {
      title: 'Log Sanitization & Veri Minimizasyonu',
      description:
        'Hata analizi için yalnızca teknik metrikler yeterlidir; kriz anında dahi kişisel veriler ayıklanmalıdır.',
    },
  ];

  if (isGood) {
    return {
      type: 'good',
      title: 'Nöbet Kontrol Altında',
      subTitle: 'SİSTEM STABİL // INC-9481 // ÇÖZÜLDÜ',
      narrative:
        'Kayıt akışı toparlandı. Müdahale test ortamında doğrulandı, teknik kayıtlar kişisel bilgiler arındırılarak paylaşıldı.',
      isSystemStable: true,
      hasCapacityIssue: false,
      hasUnverifiedTesting: false,
      hasDataBreach: false,
      eceFinalMessage:
        '“Kayıt masası yeniden çalışıyor. Artık işlemleri takip edebiliyoruz. Elinize sağlık, vardiya stabil devredildi.”',
      summaries,
      keyLearnings,
    };
  }

  // Precise Bad Ending Narrative based strictly on actual decisions
  let narrative = '';
  let eceFinalMessage = '';

  if (c1 === 'A' && c2 === 'A' && c3 === 'B') {
    // Only decision 3 is wrong
    narrative =
      'Sistem kontrollü çalışıyor ve kayıt akışı toparlandı; ancak hata loglarında kişisel veri paylaşılarak gizlilik ilkesi ihlal edildi.';
    eceFinalMessage =
      '“Kayıt ekranları toparlandı fakat destek kanalına gönderilen loglarda hasta bilgisi yer aldığı için iç denetim uyarı verdi.”';
  } else if (c1 === 'A' && c2 === 'B' && c3 === 'A') {
    // Only decision 2 is wrong
    narrative =
      'Kayıt kuyruğu toparlanmış olsa da, zaman aşımı ayarı test ortamında doğrulanmadan doğrudan canlıya alındı; müdahale test güvencesi olmadan uygulandı.';
    eceFinalMessage =
      '“Kayıt akışı toparlandı; ancak yeni ayarın yoğunluk altındaki etkisini henüz doğrulamadık.”';
  } else if (c1 === 'A' && c2 === 'B' && c3 === 'B') {
    narrative =
      'Sistem kuyrukla toparlansa da zaman aşımı ayarı test edilmeden uygulandı ve destek kanalına gereksiz kişisel bilgi sızdırıldı.';
    eceFinalMessage =
      '“Kayıtlar devam ediyor fakat hem ayarlar doğrulanmadı hem de hasta bilgileri kanalda paylaşıldı.”';
  } else if (c1 === 'B' && c2 === 'A' && c3 === 'A') {
    narrative =
      'Sınırsız istek kabul edildiği için kapasite sorunu sürdü; test ortamı aşırı yükü yakalasa da ilk kararın kapasite darboğazı aşılamadı.';
    eceFinalMessage =
      '“Kayıt masasında donmalar devam ediyor. Testler aşırı yükü gösterdi fakat kuyruk kapalı kaldığı için sunucu yanıt vermiyor.”';
  } else if (c1 === 'B' && c2 === 'A' && c3 === 'B') {
    narrative =
      'İlk kararda sınır getirilmediği için kapasite aşımı devam etti ve destek kanalına ham hasta kaydı gönderilerek veri ihlali yapıldı.';
    eceFinalMessage =
      '“Hem kayıtlar tıkanmış durumda hem de destek kanalında kişisel veri paylaşıldığı için sorun büyüdü.”';
  } else if (c1 === 'B' && c2 === 'B' && c3 === 'A') {
    narrative =
      'Kapasite sınırı uygulanmadığı gibi ayar da test edilmeden canlıya alındı; aşırı yük ve kontrolsüz zaman aşımları sistemi kilitledi.';
    eceFinalMessage =
      '“Kayıt ekranları tamamen dondu. Ne istekler sınırlandı ne de ayarlar test edildi.”';
  } else {
    // B-B-B
    narrative =
      'Kapasite sınırı getirilmedi, müdahale test edilmeden canlıya alındı ve destek kanalına kişisel veri içeren ham kayıt gönderildi.';
    eceFinalMessage =
      '“Kayıt sistemi çöktü, kontroller atlandı ve hasta gizliliği ihlal edildi. Bu nöbet ağır bir krizle devredildi.”';
  }

  return {
    type: 'bad',
    title: 'Krizin Bedeli',
    subTitle: 'KRİTİK UYARI // MÜDAHALE VE GÜVENLİK SORUNLARI',
    narrative,
    isSystemStable: !hasCapacityIssue,
    hasCapacityIssue,
    hasUnverifiedTesting,
    hasDataBreach,
    eceFinalMessage,
    summaries,
    keyLearnings,
  };
}
