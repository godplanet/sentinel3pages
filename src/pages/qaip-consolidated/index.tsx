import { useState } from 'react';
import { PageHeader } from '@/shared/ui';
import { Award, FileCheck, MessageSquare, TrendingUp } from 'lucide-react';
import clsx from 'clsx';
import { QAIPReviewWidget } from '@/widgets/QAIPReview';

type TabKey = 'reviews' | 'surveys' | 'kpi';

const TABS = [
  { key: 'reviews' as TabKey, label: 'İç Değerlendirme', icon: FileCheck },
  { key: 'surveys' as TabKey, label: 'Anketler', icon: MessageSquare },
  { key: 'kpi' as TabKey, label: 'KPI Göstergeleri', icon: TrendingUp },
];

export default function QAIPConsolidatedPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('reviews');

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <PageHeader
        title="Kalite Güvence Programı (QAIP)"
        subtitle="İç Değerlendirme, Anketler ve Performans Göstergeleri"
        icon={Award}
      />

      <div className="border-b border-slate-200 bg-white px-6">
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={clsx(
                'flex items-center gap-2 px-6 py-3 font-medium text-sm transition-all relative',
                activeTab === tab.key
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              )}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <FileCheck size={20} className="text-blue-600" />
              İç Değerlendirme ve Denetim
            </h3>
            <p className="text-slate-600 mb-6">
              Denetim dosyalarının kalite incelemesi ve gözden geçirme.
            </p>
            <QAIPReviewWidget />
          </div>
        )}

        {activeTab === 'surveys' && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <MessageSquare size={20} className="text-green-600" />
              Müşteri Memnuniyeti Anketleri
            </h3>
            <p className="text-slate-600 mb-4">
              Denetlenen birimlerin denetim sürecine ilişkin geri bildirimleri.
            </p>
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
              <MessageSquare className="mx-auto text-slate-400 mb-4" size={48} />
              <p className="text-slate-600 font-medium">Anket Modülü Hazırlanıyor</p>
              <p className="text-slate-500 text-sm mt-2">Yakında kullanıma açılacak</p>
            </div>
          </div>
        )}

        {activeTab === 'kpi' && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-purple-600" />
              Performans Göstergeleri (KPI)
            </h3>
            <p className="text-slate-600 mb-4">
              Denetim biriminin performans metrikleri ve hedef izleme.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-6 border border-slate-200 rounded-lg">
                <p className="text-sm text-slate-600 mb-2">Plana Uyum Oranı</p>
                <p className="text-3xl font-bold text-green-600">92%</p>
              </div>
              <div className="p-6 border border-slate-200 rounded-lg">
                <p className="text-sm text-slate-600 mb-2">Ortalama Tamamlanma Süresi</p>
                <p className="text-3xl font-bold text-blue-600">45 gün</p>
              </div>
              <div className="p-6 border border-slate-200 rounded-lg">
                <p className="text-sm text-slate-600 mb-2">Müşteri Memnuniyeti</p>
                <p className="text-3xl font-bold text-purple-600">4.2/5</p>
              </div>
            </div>
            <div className="mt-6 text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
              <TrendingUp className="mx-auto text-slate-400 mb-4" size={48} />
              <p className="text-slate-600 font-medium">Detaylı KPI Dashboard Hazırlanıyor</p>
              <p className="text-slate-500 text-sm mt-2">Yakında kullanıma açılacak</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
