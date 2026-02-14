import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { FindingPaper } from '@/widgets/FindingStudio/FindingPaper';
import { FindingSidebar } from '@/widgets/FindingStudio/FindingSidebar';
import { WorkflowStepper } from '@/widgets/FindingStudio/WorkflowStepper';

const MOCK_FINDING = {
  id: 'AUD-2025-BR-64',
  title: 'Kasa İşlemlerinde Çift Anahtar Kuralı İhlali',
  status: 'draft',
  risk_level: 'critical',
  risk_type: 'Operasyonel Risk',
  impact_type: 'Yüksek Uyum',
  financial_impact: '1.250.000 TL',
  engagement: {
    name: '1. Çeyrek Şube Denetimsel',
    scope: 'Kasa İşlemleri'
  },
  auditor: {
    name: 'Ahmet Aslan',
    role: 'Kıdemli Denetçi',
    avatar_color: 'blue',
    initials: 'AA'
  },
  created_at: '12 Ekim 2025',
  updated_at: '14:00',
  sections: {
    ai_summary: 'Bu bulgu, gebe kasa güvenliğinde kritik bir zafiyet olduğunu ve çift anahtarlı dual-control prensibinin ihlal edildiğini göstermektedir. Söz konusu kontrol boşluğu tek personel eğilimi yeteneceğin tek gönderi gerçekleştiriği tarafsız zamanın.',
    criteria: {
      title: 'Kriter / Mevzuat (Zorunluluğu)',
      content: 'Henüz bir kriter eklenmedi.',
      standard: 'Manuel Güneş',
      requirement: 'Kabul/Yazamaz Esitiz'
    },
    finding: {
      title: 'Tespit',
      content: 'Yapılan incelemelerde, 19.01.2026 tarihli kasa açılış işleminde şube yetkilisinin tek operatörün yetkilendiği hesabı bulunmayan gereken şarttır, işlem tek taraflı gerçekleştirdiğir CCTV kayıtlarından tespit edilmiştir.'
    },
    risk: {
      title: 'Risk & Etki',
      risk_tags: ['Operasyonel Risk', 'Yüksek Uyum'],
      financial_impact: '1.250.000 TL',
      impact_holder: 'Etki Taşıyın (TL)',
      description: 'Kasa güvenliği zafiyeti ve riskin zimmet durumu.',
      root_cause_title: 'Kök Neden Analizi',
      root_cause_type: 'Personel / İnsan Hatası',
      root_cause_description: 'Personel operasyonel yoğunluk sebebiyle prosesedür aklanmayıp.'
    },
    recommendation: {
      title: 'Öneri',
      content: 'Kasa açılış süreci için kuyrumdeki doğrulama ekleminin geçirşmiş veya dual-control process sisteminin olarak zorunlu hale getirilmelidir.'
    }
  },
  action_plan: {
    assignee: {
      name: 'Mehmet Yılmaz',
      role: 'Şube Müdürü',
      status: 'Mutabakat'
    },
    root_cause: 'Yoğunluk kaynakları.',
    priority: 'Acil (Kırmızı)',
    steps: [
      { id: 1, description: 'Personele eğitim verilecek.', due_date: '15.02.2025' },
      { id: 2, description: 'Yedek anahtar sorumlusu atanacak.', due_date: '28.02.2025' }
    ]
  },
  related_findings: [
    { id: 1, title: 'Bangi Teslita Düşsizlükleri', date: '12 Eylül 2025', similarity: 0.92, author: 'Ahmet Aslan' },
    { id: 2, title: 'Risk Seviye Gösterilmelisi', date: '12 Eylül 2025', similarity: 0.78, author: 'Ahmet Aslan' },
    { id: 3, title: 'Yüksekiz Onayıra Sürükibi', date: '12 Eylül 2025', similarity: 0.65, author: 'Ahmet Aslan' },
    { id: 4, title: 'Şube Muhakiriye İstisisi', date: '13 Eylül 2025', similarity: 0.58, author: 'System' }
  ],
  timeline: [
    { date: '14 Eylül 2025', time: '12:00', event: 'Bulgı Taslağı Oluşturulda', author: 'Ahmet Aslan' },
    { date: '12 Eylül 2025', time: '16:15', event: 'Risk Seviyesi Güncellendi', author: 'Ahmet Aslan' },
    { date: 'Teklıye -> KR1515', time: '', event: '', author: '' },
    { date: '12 Eylül 2025', time: '16:45', event: 'Yünetici Onayına Sunuldu', author: 'Ahmet Aslan' },
    { date: '13 Eylül 2025', time: '09:00', event: 'Şube Müdüriyle İletişil', author: 'System' },
    { date: '14 Eylül 2025', time: '11:20', event: 'Mutabakattaki Bölündü', author: 'Mehmet Yılmaz', note: 'Personel eksikliği giderilecelik ihmal edildi.' }
  ],
  ai_similarity: {
    percentage: 85,
    description: 'Bu bulgu, son 1 yıl içinde 3 farklı şubede mazi edilisir. Kalite önceyinde benzer bir tanıma yapılmıştır.',
    similar_findings: [
      { id: 'AUD-2025-SB-02', title: 'Kasa Anahtər Devir Eksikliği', branch: 'Kadıköy', similarity: 0.91 },
      { id: 'AUD-2025-SB-08', title: 'Çift Anahtar Prensibi İhlali', branch: 'Beyoğlu', similarity: 0.87 }
    ],
    quality_control: 'Bulgı hepida ve taleget huzursal sağlamda üstelğir. "Dual control" kavkrımı Türkçeye karşılığı ile kullanımında önerilir.'
  }
};

export default function FindingStudioPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'detay' | 'tarihce' | 'ai' | 'yorum'>('detay');

  const finding = MOCK_FINDING;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-[1800px] mx-auto px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/execution/findings')}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Bulgu Merkezi'ne Dön</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="text-sm text-slate-600">
                Son Güncelleme: <span className="font-medium text-slate-900">{finding.updated_at}</span>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm shadow-sm transition-all">
                Kaydet
              </button>
            </div>
          </div>

          <WorkflowStepper currentStatus={finding.status} />
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-8 py-8">
        <div className="flex gap-8">
          <div className="flex-1 max-w-4xl">
            <FindingPaper finding={finding} />
          </div>

          <div className="w-96 flex-shrink-0">
            <FindingSidebar
              finding={finding}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
