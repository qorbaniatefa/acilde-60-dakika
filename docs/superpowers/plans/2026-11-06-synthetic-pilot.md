# Sentetik pilot teslimi — kullanıcı seçimi 1

Kullanıcı 6 Kasım'da sentetik pilotu seçti. Kullanıcı beyanı: mevcut 15 insan oturumunun tamamını kendisi oynadı; açıklama isteği etiketlerini rastgele seçti. Bunlar üç gönüllüden toplanmış geçerli tercih etiketleri olarak sunulamaz.

- [x] 45 rastgele etiketli gerçek davranış satırı kaynak/etiketleri korunarak arşivlendi; etkin eğitim CSV'sinde 540 sentetik satır kaldı. Tekrarlanabilir işlem ve tam eski CSV yedeği hazır.
- [x] Arşivlenen UUID'ler için etiket kalitesi kaydı oluşturuldu; eğitim/yayın/birleştirme geri girişi reddediyor.
- [x] Açık `--synthetic-pilot` yayın seçeneği eklendi. Varsayılan gerçek veri yayını ≥15 geçerli gerçek oturum istiyor. Her iki modda eval/parite/hash/tekrar eğitim kapıları korundu.
- [x] Config/model kartı synthetic_pilot, gerçek doğrulama=false ve 2.0.0-pilot taşıyor; model giriş/çıkışları aynı.
- [x] Geçmiş kayıtlar ve açıklama korunarak README/spec/RELEASE güncellendi; sentetik veri puan sınırlaması açık.
- [x] 61JS,14Python testi, lint/build, eğitim, oracle geçti; bağımsız incelemede Important/Critical bulgu yok. Sıradaki tek adım kullanıcının HF terminal girişi.

Değişmeyen eşikler: balanced_accuracy≥.75, recall≥.70, olasılık eşiği=.5, parite farkı<1e-4, seed=42. Pilot, başarısız gerçek modelin yayını olarak sunulmaz. Aynı hipotezli sentetik simülasyonda ölçülen bir demo sürümüdür.
