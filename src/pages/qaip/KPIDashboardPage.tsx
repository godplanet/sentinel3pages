import { PageHeader } from '@/shared/ui';
import { KPIGrid } from '@/widgets/dashboard/KPIGrid';
import { Activity, Target, Clock, CheckCircle2 } from 'lucide-react';
import type { DashboardKPI } from '@/entities/dashboard/model/types';

const KPI_DATA: DashboardKPI[] = [
  {
    id: '1',
    label: 'Denetim Tamamlama Oranı',
    value: '87%',
    trendValue: '+5%',
    trendDirection: 'up',
    trendColor: 'green',
  },
  {
    id: '2',
    label: 'Ortalama Denetim Süresi',
    value: '42 gün',
    trendValue: '-8 gün',
    trendDirection: 'down',
    trendColor: 'green',
  },
  {
    id: '3',
    label: 'Bulgu Çözüm Oranı',
    value: '73%',
    trendValue: '+12%',
    trendDirection: 'up',
    trendColor: 'green',
  },
  {
    id: '4',
    label: 'Aksiyon Zamanında Kapanma',
    value: '68%',
    trendValue: '-4%',
    trendDirection: 'down',
    trendColor: 'red',
  },
  {
    id: '5',
    label: 'Risk Kapsamı (Risk Coverage)',
    value: '92%',
    trendValue: '+3%',
    trendDirection: 'up',
    trendColor: 'green',
  },
  {
    id: '6',
    label: 'Paydaş Memnuniyeti',
    value: '4.3/5',
    trendValue: '+0.2',
    trendDirection: 'up',
    trendColor: 'green',
  },
  {
    id: '7',
    label: 'Ortalama Ekip Kullanım Oranı',
    value: '76%',
    trendValue: '0%',
    trendDirection: 'flat',
    trendColor: 'gray',
  },
  {
    id: '8',
    label: 'Rapor Kalite Skoru',
    value: '8.7/10',
    trendValue: '+0.5',
    trendDirection: 'up',
    trendColor: 'green',
  },
];

export default function KPIDashboardPage() {
  return (
    <div className="p-8 space-y-6">
      <PageHeader
        title="Performans (KPI)"
        description="Denetim departmanı performans göstergeleri ve karşılaştırma (benchmarking)"
        badge="MODÜL 7: KALİTE (QAIP)"
      />

      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Real-Time Performance Monitoring</h3>
            <p className="text-slate-600 text-sm">
              Denetim departmanınızın performansını gerçek zamanlı izleyin. Sektör karşılaştırmaları (benchmarking)
              ve IIA standartlarına uyumu otomatik olarak ölçün.
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {[
          { label: 'Toplam Denetim', value: '48', icon: Target, color: 'blue' },
          { label: 'Devam Eden', value: '12', icon: Clock, color: 'amber' },
          { label: 'Tamamlanan', value: '36', icon: CheckCircle2, color: 'green' },
          { label: 'Gecikmeli', value: '3', icon: Activity, color: 'red' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}>
                <stat.icon size={20} className={`text-${stat.color}-600`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-800 mb-1">{stat.value}</div>
            <div className="text-sm text-slate-600">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Activity size={20} className="text-blue-600" />
            Ana Performans Göstergeleri (KPI)
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            IIA Standardlarına uygun performans metrikleri
          </p>
        </div>
        <div className="p-6">
          <KPIGrid kpis={KPI_DATA} />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Sektör Karşılaştırması</h3>
          <div className="space-y-4">
            {[
              { metric: 'Denetim Tamamlama Oranı', our: 87, sector: 82, unit: '%' },
              { metric: 'Ortalama Denetim Süresi', our: 42, sector: 55, unit: ' gün' },
              { metric: 'Bulgu Çözüm Oranı', our: 73, sector: 68, unit: '%' },
              { metric: 'Risk Kapsamı', our: 92, sector: 85, unit: '%' },
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-slate-700">{item.metric}</span>
                  <span className="text-slate-600">
                    Biz: <strong className="text-blue-600">{item.our}{item.unit}</strong> |
                    Sektör: <strong className="text-slate-500">{item.sector}{item.unit}</strong>
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${(item.our / 100) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">IIA Uyum Skoru</h3>
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-green-600 mb-2">8.4/10</div>
            <div className="text-sm text-slate-600">Uluslararası İç Denetim Standartları</div>
          </div>
          <div className="space-y-3">
            {[
              { standard: 'Standart 1000: Amaç & Yetki', score: 9.2 },
              { standard: 'Standart 1100: Bağımsızlık', score: 8.8 },
              { standard: 'Standart 1200: Yeterlilik', score: 8.1 },
              { standard: 'Standart 2000: İç Denetim Yönetimi', score: 8.5 },
              { standard: 'Standart 2100: İşin Niteliği', score: 7.9 },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-slate-700">{item.standard}</span>
                <span className="font-bold text-blue-600">{item.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
