import { ComprehensiveFinding } from '../model/types';

export const mockComprehensiveFindings: ComprehensiveFinding[] = [
  {
    id: 'find-001',
    reference_no: '2026-IST-OP-042',
    title: 'Kasa İşlemlerinde Çift Anahtar Prensibi İhlali',
    status: 'NEGOTIATION', // Müzakere ekranını test etmek için
    
    // Risk Verileri (Yüksek Risk - Veto Sınırında)
    risk_score: 15, 
    impact: 5,       // Felaket (Dolandırıcılık ihtimali)
    likelihood: 3,   // Orta (Bazen oluyor)
    control_effectiveness: 2, // Kısmi
    severity: 'HIGH',
    category: 'Operasyonel Risk',
    department: 'Merkez Şube Operasyon',
    tags: ['Nakit Yönetimi', 'Fiziki Güvenlik', 'BDDK'],

    // GÖREV 1: GIS 2024 Metadata Expansion
    risk_category: 'operational', // Risk Universe
    process_id: 'operations', // Process Map
    subprocess_id: 'Hesap İşlemleri', // Subprocess
    control_id: 'C001', // Control Library (4-Göz Prensibi)

    // GÖREV 3: Evidence Management
    evidence_files: ['kasa_kamera_kaydi_14022026.mp4', 'anahtar_zimmet_defteri.pdf'],

    // 5C İçerik (Zengin Metin)
    criteria: `
      <p><strong>Bankaların İç Sistemleri Hakkında Yönetmelik (Madde 42):</strong></p>
      <p>Fiziki değerlerin saklandığı kasa daireleri ve ana kasalar, en az iki yetkili personel tarafından müştereken açılıp kapatılmalı (Çift Anahtar Prensibi) ve gün içi işlemlerde yetki devri yapılmamalıdır.</p>
    `,
    condition: `
      <p>14.02.2026 tarihinde yapılan yerinde denetimlerde, Şube Operasyon Yöneticisinin (A Anahtarı Sorumlusu) şube dışına çıkarken anahtarını Gişe Yetkilisine (B Anahtarı Sorumlusu) teslim ettiği ve kasanın tek kişi tarafından açıldığı güvenlik kamerası kayıtlarıyla tespit edilmiştir.</p>
    `,
    cause: `
      <p>Şube personel sayısındaki yetersizlik ve öğle arası yoğunluğunda işlemleri hızlandırma isteği. Yedek anahtar sorumlusunun o gün izinli olması.</p>
    `,
    consequence: `
      <p>Banka varlıklarının zimmete geçirilmesi riski doğmuştur. Ayrıca BDDK denetimlerinde tespit edilmesi halinde idari para cezası riski bulunmaktadır.</p>
    `,
    corrective_action: `
      <p>Şube anahtar sorumluluk matrisi güncellenmeli, yedekleme sistemi işler hale getirilmeli ve ilgili personele disiplin yönetmeliği hatırlatılmalıdır.</p>
    `,

    // Hassas Veriler (Blind Mode Testi için)
    secrets: {
      internal_notes: 'Şube müdürü bu durumu normalleştirmiş görünüyor, etik soruşturma gerekebilir.',
      root_cause_internal: 'Bölge Müdürlüğü maliyet baskısı nedeniyle personel alımını durdurduğu için şube 1 yıldır %30 eksik kapasiteyle çalışıyor.',
      whistleblower_id: 'WB-2026-99',
      why_analysis: {
        why_1: 'Kasa tek kişi tarafından açıldı.',
        why_2: 'İkinci anahtar sahibi anahtarını diğerine verdi.',
        why_3: 'Yedek sorumlu izinliydi ve yerine kimse atanmadı.',
        why_4: 'Şube norm kadrosu eksik.',
        why_5: 'Genel Müdürlük IK politikası gereği işe alım donduruldu.'
      }
    },

    // İş Akışı Verileri
    target_date: '2026-03-01T00:00:00Z',
    
    action_plans: [
      {
        id: 'act-01',
        title: 'Personel Görevlendirmesi',
        description: 'İzinli personelin yerine geçici görevlendirme yapılması.',
        responsible_person: { id: 'u1', name: 'Ahmet Yılmaz', title: 'Şube Müdürü' },
        target_date: '2026-02-20',
        status: 'ACCEPTED',
        created_at: '2026-02-15'
      },
      {
        id: 'act-02',
        title: 'Biyometrik Giriş Sistemi',
        description: 'Anahtar yerine parmak izi/retina tarama sistemine geçiş için fizibilite.',
        responsible_person: { id: 'u3', name: 'Mehmet Öz', title: 'Güvenlik Müdürü' },
        target_date: '2026-06-01',
        status: 'PROPOSED',
        created_at: '2026-02-15'
      }
    ],

    review_notes: [
      {
        id: 'rev-01',
        note_text: 'Kök neden analizinde personel eksikliğine daha fazla vurgu yapılmalı.',
        reviewer_name: 'Başmüfettiş Selim',
        created_at: '2026-02-14T10:00:00Z',
        status: 'OPEN',
        type: 'TECHNICAL'
      }
    ],

    sign_offs: [
      {
        role: 'PREPARER',
        user_name: 'Kıdemli Müfettiş Can',
        status: 'SIGNED',
        signed_at: '2026-02-14T15:30:00Z'
      },
      {
        role: 'REVIEWER',
        user_name: 'Yönetici Selim',
        status: 'PENDING'
      }
    ],

    created_at: '2026-02-10T09:00:00Z',
    updated_at: '2026-02-15T11:20:00Z',
    author_id: 'user-007'
  },
  
  // "New" ID için boş şablon gerekmez, hook bunu handle ediyor. 
  // Ancak test için ikinci bir veri eklenebilir.
  {
    id: 'find-002',
    reference_no: '2026-IST-IT-105',
    title: 'Veri Tabanı Loglarının Şifrelenmemesi',
    status: 'DRAFT',
    risk_score: 25, // KRİTİK VETO ÖRNEĞİ
    impact: 5,
    likelihood: 5,
    control_effectiveness: 3,
    severity: 'CRITICAL',
    category: 'IT Security',
    
    criteria: '<p>ISO 27001 ve KVKK gereği...</p>',
    condition: '<p>Log sunucusunda loglar plain-text duruyor.</p>',
    cause: '<p>Konfigürasyon hatası.</p>',
    consequence: '<p>Veri sızıntısı durumunda hassas veriler ifşa olabilir.</p>',
    corrective_action: '<p>Acilen şifreleme modülü aktif edilmeli.</p>',
    
    action_plans: [],
    review_notes: [],
    sign_offs: [],
    
    created_at: '2026-02-15T08:00:00Z',
    updated_at: '2026-02-15T08:00:00Z',
    author_id: 'user-007'
  }
];