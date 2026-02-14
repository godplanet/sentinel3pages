import { ComprehensiveFinding } from '../model/types';

export const mockComprehensiveFindings: ComprehensiveFinding[] = [
  {
    id: 'find-001',
    tenant_id: 'tenant-1',
    engagement_id: 'eng-2025-Q1',
    audit_id: 'audit-branches',
    
    // Kimlik
    code: 'BUL-2025-042',
    finding_code: 'OPR-CSH-001',
    title: 'Kasa İşlemlerinde Çift Anahtar (Dual-Control) Kuralı İhlali',
    severity: 'CRITICAL',
    
    // Durum ve Süreç
    state: 'NEGOTIATION', // Şu an müzakere aşamasında
    main_status: 'ACIK',
    process_stage: 'NEGOTIATION',
    
    // Risk Skorlama
    impact_score: 5,
    likelihood_score: 4,
    financial_impact: 1250000, // 1.25M TL
    gias_category: 'Operasyonel Risk',
    
    // Zengin Metin (Rich Text Editor'den gelecek HTML)
    detection_html: `
      <p>Şişli Şubesi nezdinde yapılan nakit operasyonları incelemesinde, <strong>12-14 Ekim 2025</strong> tarihleri arasında gerçekleştirilen toplam <strong>14.5 Milyon TL</strong> tutarındaki 8 adet ana kasa devir işleminin, sadece Operasyon Yöneticisi tarafından tek anahtarla gerçekleştirildiği tespit edilmiştir.</p>
      <p>Banka içi "Nakit Yönetimi Yönetmeliği" Madde 4.2 uyarınca, ana kasa açılış ve kapanışlarının biri Yönetici, diğeri Yetkili olmak üzere iki personel tarafından (Dual-Control) yapılması zorunludur.</p>
    `,
    impact_html: `
      <p>Bu durum, şube kasasında yetkisiz erişim ve zimmet riskini doğurmaktadır. Tek personelin inisiyatifine bırakılan kasa işlemleri, bankayı potansiyel olarak <strong>tam kasa bakiyesi kadar</strong> zarara uğratabilir.</p>
    `,
    recommendation_html: `
      <ol>
        <li>Şube personeline Çift Anahtar prensibi konusunda acil hatırlatma eğitimi verilmelidir.</li>
        <li>Kasa dairesi kamera kayıtları geriye dönük 30 gün süreyle incelenmelidir.</li>
        <li>Sistemsel olarak tek kullanıcının kasa açmasına izin veren yetki profili kapatılmalıdır.</li>
      </ol>
    `,
    
    // Denetlenen Bilgisi
    auditee_department: 'Şişli Şube Müdürlüğü',
    auditee_id: 'dept-sisli',
    
    // Tarihler
    created_at: '2025-10-15T09:00:00Z',
    updated_at: '2025-10-18T14:30:00Z',
    
    // ----------------------------------------------------------------
    // MODÜL 5: GİZLİ KATMAN (IRON CURTAIN - Sadece Denetçi Görür)
    // ----------------------------------------------------------------
    secrets: {
      finding_id: 'find-001',
      internal_notes: 'Şube müdürü ile yapılan görüşmede, ikinci anahtarın kaybolduğu ve yedeğinin merkezden istenmediği şifahen öğrenilmiştir. Bu durum ihmal şüphesini artırmaktadır.',
      detection_methodology: 'Kamera kayıtları ve Log analizi çapraz kontrolü.',
      root_cause_analysis_internal: 'Personel yetkinlik eksikliği değil, prosedür ihlali ve denetim eksikliği.',
      why_1: 'Tek personel kasa açabildi.',
      why_2: 'İkinci anahtar personelde yoktu.',
      why_3: 'Anahtar kaybolmuştu ve raporlanmamıştı.',
      why_4: 'Yedek anahtar prosedürü işletilmedi.',
      why_5: 'Şube yöneticisi inisiyatif alarak risk kabulü yaptı (Hatalı Karar).',
    },

    // ----------------------------------------------------------------
    // MODÜL 5: GÖZDEN GEÇİRME NOTLARI (Review Notes)
    // ----------------------------------------------------------------
    review_notes: [
      {
        id: 'rn-1',
        finding_id: 'find-001',
        note_text: 'Finansal etkiyi sadece o günkü işlem hacmiyle sınırlamayalım, sigorta limitlerini de kontrol et.',
        reviewer_name: 'Mehmet Öz (Başdenetçi)',
        reviewer_id: 'u-head',
        status: 'CLEARED',
        resolution_text: 'Sigorta limitleri kontrol edildi, etki tutarı revize edildi.',
        created_at: '2025-10-16T10:00:00Z',
        updated_at: '2025-10-16T11:00:00Z'
      }
    ],

    // ----------------------------------------------------------------
    // MODÜL 5: AKSİYON PLANLARI (Müzakere Sonucu)
    // ----------------------------------------------------------------
    action_plans: [
      {
        id: 'ap-1',
        finding_id: 'find-001',
        title: 'Yedek Anahtar Temini ve Zimmetleme',
        description: 'Kaybolan anahtarın tutanağı tutulacak, merkezden yedek set istenecek ve operasyon yetkilisine zimmetlenecektir.',
        responsible_person: 'Ali Veli (Şube Müdürü)',
        responsible_department: 'Şişli Şube',
        target_date: '2025-11-01',
        status: 'IN_PROGRESS',
        priority: 'CRITICAL',
        current_state: 'ACCEPTED', // Denetçi kabul etti
        created_at: '2025-10-17T09:00:00Z'
      },
      {
        id: 'ap-2',
        finding_id: 'find-001',
        title: 'Kasa Yetki Matrisi Güncellemesi',
        description: 'Core bankacılık sisteminde tekil onayın engellenmesi için BT talebi açılacaktır.',
        responsible_person: 'Ayşe Yılmaz (BT Güvenlik)',
        responsible_department: 'Bilgi Teknolojileri',
        target_date: '2025-12-01',
        status: 'DRAFT',
        priority: 'HIGH',
        current_state: 'PROPOSED', // Henüz onaylanmadı
        created_at: '2025-10-17T09:30:00Z'
      }
    ],

    // ----------------------------------------------------------------
    // MODÜL 5: ONAY ZİNCİRİ (Sign-Off Chain)
    // ----------------------------------------------------------------
    sign_offs: [
      {
        id: 'sig-1',
        finding_id: 'find-001',
        role: 'PREPARER',
        user_id: 'u-audit-1',
        user_name: 'Ahmet Yılmaz',
        status: 'SIGNED',
        signed_at: '2025-10-15T17:00:00Z'
      },
      {
        id: 'sig-2',
        finding_id: 'find-001',
        role: 'REVIEWER',
        user_id: 'u-head',
        user_name: 'Mehmet Öz',
        status: 'PENDING', // Henüz imzalamadı
      }
    ]
  }
];