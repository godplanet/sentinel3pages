import type { FindingEditorData } from '../components/ZenEditor';

export const ZEN_DEMO_DATA: FindingEditorData = {
  criteria: `
    <p><strong>BDDK Bilgi Sistemleri Yönetmeliği - Madde 12/3:</strong></p>
    <p><em>"Bankalar, hassas varlıklara erişimi ve kritik işlem adımlarını 'bilmesi gereken' prensibine göre sınırlandırmak ve yetki aşımı riskini önlemek için çift faktörlü kimlik doğrulama ve dört göz (dual-control) mekanizmalarını işletmekle yükümlüdür."</em></p>
    <p>SWIFT mesajlaşma altyapısı prosedürlerinde (PR-SEC-005), 50.000 USD üzeri EFT işlemlerinin onay mekanizmasında Maker-Checker ayrılığı zorunlu kılınmıştır.</p>
  `,
  condition: `
    <p>12.02.2026 tarihinde <strong>Hazine Operasyonları</strong> departmanında gerçekleştirilen <em>"Giden EFT İşlem Logları"</em> incelemesinde aşağıdaki bulgulara rastlanmıştır:</p>
    <ul>
      <li>Toplam <strong>14 adet</strong> yüksek tutarlı (100.000 USD üzeri) işlemin, tek bir kullanıcı ID'si (u_ahmet.y) tarafından hem giriş hem de onay adımlarının tamamlandığı görülmüştür.</li>
      <li>Söz konusu işlemlerin yapıldığı saat aralığında (12:30 - 13:30) Checker yetkisine sahip yöneticinin sistemde aktif olmadığı log kayıtlarından doğrulanmıştır.</li>
      <li>Sistem parametrelerinde "Acil Durum Onayı" (Emergency Override) yetkisinin, şube müdürü onayı olmaksızın vezne personeline tanımlandığı tespit edilmiştir.</li>
    </ul>
  `,
  root_cause_analysis: {
    method: 'five_whys',
    five_whys: [
      'Personel tek başına onay verebildi.',
      'Sistemde "Maker" ve "Checker" yetkileri aynı profilde birleştirilmiş.',
      'Geçen ay yapılan rol tanımlama güncellemesinde "Süper Kullanıcı" profili yanlışlıkla operasyonel ekibe atandı.',
      'Yetki matrisi değişikliği Bilgi Güvenliği onayı olmadan canlıya alındı.',
      'Değişiklik Yönetimi (Change Management) sürecinde "Acil Geçiş" adımı suistimal edildi.'
    ]
  },
  effect: `
    <p><strong>Finansal Risk:</strong> Onaylanan 14 işlemin toplam hacmi <strong>3.2 Milyon USD</strong> olup, bu işlemlerin yetkisiz veya hileli olma ihtimali bankayı doğrudan zarara uğratabilir.</p>
    <p><strong>Uyum Riski:</strong> BDDK denetimlerinde bu durum "Asli Kusur" olarak değerlendirilebilir ve bankaya idari para cezası (ciro bazlı) uygulanabilir.</p>
  `,
  recommendation: `
    <p><strong>Acil Aksiyonlar:</strong></p>
    <ol>
      <li>İlgili kullanıcının (u_ahmet.y) tüm yetkileri askıya alınmalı ve işlemler incelenmelidir.</li>
      <li>"Süper Kullanıcı" profili operasyonel ortamdan derhal kaldırılmalıdır.</li>
    </ol>
    <p><strong>Kalıcı Çözüm:</strong></p>
    <ul>
      <li>IAM (Identity Access Management) sistemi üzerinde SOD (Segregation of Duties) kuralları hard-coded olarak tanımlanmalı.</li>
      <li>Tüm kritik yetki değişiklikleri CISO onayına bağlanmalıdır.</li>
    </ul>
  `
};

export const ZEN_DEMO_ACTIONS = [
  {
    id: 'act-1',
    title: 'IAM Rol Tanımlarının Düzeltilmesi',
    description: 'Süper kullanıcı yetkilerinin operasyonel ekiplerden alınması ve SoD kurallarının işletilmesi.',
    owner: 'Hakan Y. (IT)',
    dueDate: '15.03.2026',
    status: 'DEVAM EDİYOR',
    statusColor: 'bg-orange-100 text-orange-700'
  },
  {
    id: 'act-2',
    title: 'Acil Durum (Override) Prosedürü',
    description: 'Acil durum yetki tanımlamalarının sadece CISO onayı ile yapılması için süreç değişikliği.',
    owner: 'Merve K. (Risk)',
    dueDate: '01.02.2026',
    status: 'GECİKMİŞ',
    statusColor: 'bg-red-100 text-red-700'
  }
];