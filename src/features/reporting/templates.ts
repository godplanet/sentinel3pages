export interface ReportTemplate {
  id: string;
  title: string;
  description: string;
  category: 'branch' | 'investigation' | 'compliance' | 'sox' | 'general';
  content: string;
}

export const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'branch-audit',
    title: 'Şube Denetim Raporu',
    description: 'BDDK uyumlu şube denetim rapor şablonu',
    category: 'branch',
    content: `
      <h1>Şube Denetim Raporu</h1>

      <h2>1. Yönetici Özeti</h2>
      <p>Bu denetim, [Şube Adı] şubesinin operasyonel faaliyetlerinin değerlendirilmesi amacıyla [Tarih] tarihinde gerçekleştirilmiştir.</p>

      <h3>1.1 Denetim Kapsamı</h3>
      <p>Denetim kapsamına aşağıdaki süreçler dahil edilmiştir:</p>
      <ul>
        <li>Müşteri işlemleri ve hesap açılış süreçleri</li>
        <li>Kredi değerlendirme ve onay süreçleri</li>
        <li>Kasa ve vezne işlemleri</li>
        <li>Mali suç uyum kontrolleri</li>
      </ul>

      <h3>1.2 Metodoloji</h3>
      <p>Denetim, risk odaklı yaklaşım ile gerçekleştirilmiş olup, örnekleme yöntemi kullanılmıştır.</p>

      <h2>2. Şube Risk Karnesi</h2>
      <chart-node></chart-node>

      <h2>3. Tespit Edilen Bulgular</h2>
      <p>Denetim sürecinde aşağıdaki bulgular tespit edilmiştir:</p>

      <h3>3.1 Kritik Önem Seviyesindeki Bulgular</h3>
      <p>[Kritik bulguları buraya ekleyin]</p>

      <h3>3.2 Yüksek Önem Seviyesindeki Bulgular</h3>
      <p>[Yüksek seviye bulguları buraya ekleyin]</p>

      <h2>4. Sonuç ve Öneriler</h2>
      <p>Şube operasyonları genel olarak yeterli seviyede olmakla birlikte, tespit edilen bulgular için aksiyonların alınması gerekmektedir.</p>
    `,
  },
  {
    id: 'investigation',
    title: 'Soruşturma Raporu',
    description: 'İhbar ve olay soruşturma rapor şablonu',
    category: 'investigation',
    content: `
      <h1>Soruşturma Raporu</h1>

      <h2>1. Olay Özeti</h2>
      <p><strong>Olay No:</strong> [Otomatik]</p>
      <p><strong>Bildirim Tarihi:</strong> [Tarih]</p>
      <p><strong>Olay Tarihi:</strong> [Tarih]</p>
      <p><strong>İlgili Birim:</strong> [Birim Adı]</p>

      <h3>1.1 Olay Tanımı</h3>
      <p>[Olayın detaylı açıklaması]</p>

      <h3>1.2 Soruşturma Kapsamı</h3>
      <p>Soruşturma aşağıdaki yöntemler kullanılarak gerçekleştirilmiştir:</p>
      <ul>
        <li>İlgili personel ile görüşmeler</li>
        <li>Sistem kayıtlarının incelenmesi</li>
        <li>Belge ve delil analizi</li>
        <li>Süreç haritalama</li>
      </ul>

      <h2>2. İfade Tutanakları</h2>

      <h3>2.1 İfade Veren: [İsim]</h3>
      <p><strong>Tarih:</strong> [Tarih]</p>
      <p><strong>İfade:</strong></p>
      <p>[İfade içeriği]</p>

      <h2>3. Bulgular ve Kanıtlar</h2>
      <p>[Tespit edilen bulgular ve destekleyici kanıtlar]</p>

      <h2>4. Hukuki Değerlendirme</h2>
      <p>[Olayın hukuki boyutu ve olası ihlaller]</p>

      <h2>5. Sonuç ve Tavsiyeler</h2>
      <p>[Soruşturma sonucu ve önerilen aksiyonlar]</p>
    `,
  },
  {
    id: 'compliance',
    title: 'Uyum Değerlendirme Raporu',
    description: 'Mevzuat ve regülasyon uyum raporu',
    category: 'compliance',
    content: `
      <h1>Uyum Değerlendirme Raporu</h1>

      <h2>1. Kapsam</h2>
      <p>Bu rapor, [Düzenleme Adı] kapsamında kurumun uyum durumunu değerlendirmektedir.</p>

      <h3>1.1 İlgili Mevzuat</h3>
      <ul>
        <li>BDDK Tebliğ No: [Numara]</li>
        <li>Kanun/Yönetmelik: [Ad]</li>
        <li>Uluslararası Standartlar: [Basel III, IFRS vb.]</li>
      </ul>

      <h2>2. Değerlendirme Kriterleri</h2>
      <p>Uyum değerlendirmesi aşağıdaki kriterler üzerinden yapılmıştır:</p>

      <h3>2.1 Politika ve Prosedürler</h3>
      <p>[Değerlendirme]</p>

      <h3>2.2 Organizasyon ve Roller</h3>
      <p>[Değerlendirme]</p>

      <h3>2.3 Sistem ve Kontroller</h3>
      <p>[Değerlendirme]</p>

      <h2>3. Uyum Durumu Özeti</h2>
      <chart-node></chart-node>

      <h2>4. Tespit Edilen Uyumsuzluklar</h2>
      <p>[Detaylı bulgular]</p>

      <h2>5. Aksiyon Planı</h2>
      <p>[Uyumsuzlukların giderilmesi için önerilen aksiyonlar]</p>
    `,
  },
  {
    id: 'sox-control',
    title: 'SOX Kontrol Test Raporu',
    description: 'Sarbanes-Oxley kontrol etkinlik raporu',
    category: 'sox',
    content: `
      <h1>SOX Kontrol Test Raporu</h1>

      <h2>1. Test Kapsamı</h2>
      <p><strong>Süreç:</strong> [Süreç Adı]</p>
      <p><strong>Kontrol ID:</strong> [Numara]</p>
      <p><strong>Kontrol Sahibi:</strong> [İsim]</p>
      <p><strong>Test Dönemi:</strong> [Tarih Aralığı]</p>

      <h2>2. Kontrol Tanımı</h2>
      <p><strong>Kontrol Tipi:</strong> [Preventive / Detective]</p>
      <p><strong>Kontrol Sıklığı:</strong> [Günlük / Haftalık / Aylık]</p>
      <p><strong>Kontrol Açıklaması:</strong></p>
      <p>[Detaylı açıklama]</p>

      <h2>3. Test Prosedürleri</h2>
      <ol>
        <li>Örneklem seçimi (n=[Sayı])</li>
        <li>Kontrol kanıtlarının incelenmesi</li>
        <li>İstisna analizi</li>
        <li>Kontrol etkinliği değerlendirmesi</li>
      </ol>

      <h2>4. Test Sonuçları</h2>

      <h3>4.1 Örnek İnceleme Özeti</h3>
      <chart-node></chart-node>

      <h3>4.2 Tespit Edilen İstisnalar</h3>
      <p>[İstisnalar ve sebepleri]</p>

      <h2>5. Sonuç</h2>
      <p><strong>Kontrol Etkinliği:</strong> [Etkin / Yetersiz / Etkin Değil]</p>
      <p>[Gerekçe ve öneriler]</p>
    `,
  },
  {
    id: 'executive-summary',
    title: 'Yönetici Özet Raporu',
    description: 'Üst yönetim için özet sunum raporu',
    category: 'general',
    content: `
      <h1>Yönetici Özet Raporu</h1>

      <h2>1. Genel Bakış</h2>
      <p>Bu rapor, [Dönem] dönemi içerisinde gerçekleştirilen denetim faaliyetlerinin özetini sunmaktadır.</p>

      <h2>2. Kilit Metrikler</h2>
      <chart-node></chart-node>

      <h2>3. Ana Bulgular</h2>
      <p>Dönem içerisinde [Sayı] adet bulgu tespit edilmiştir:</p>
      <ul>
        <li><strong>Kritik:</strong> [Sayı] adet</li>
        <li><strong>Yüksek:</strong> [Sayı] adet</li>
        <li><strong>Orta:</strong> [Sayı] adet</li>
        <li><strong>Düşük:</strong> [Sayı] adet</li>
      </ul>

      <h2>4. Risk Odak Alanları</h2>
      <ol>
        <li>[Risk Alanı 1]</li>
        <li>[Risk Alanı 2]</li>
        <li>[Risk Alanı 3]</li>
      </ol>

      <h2>5. Yönetim Aksiyonları</h2>
      <p>[Alınan ve alınması planlanan aksiyonlar]</p>

      <h2>6. İleriye Dönük Odak</h2>
      <p>[Gelecek dönem için planlanan denetim konuları]</p>
    `,
  },
];

export function getTemplateById(id: string): ReportTemplate | undefined {
  return REPORT_TEMPLATES.find((t) => t.id === id);
}

export function getTemplatesByCategory(category: string): ReportTemplate[] {
  return REPORT_TEMPLATES.filter((t) => t.category === category);
}

export function applyTemplate(templateId: string): string {
  const template = getTemplateById(templateId);
  return template?.content || '';
}
