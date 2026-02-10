import { PageHeader } from '@/shared/ui';
import { Award, FileCheck, Calendar, Users, CheckCircle2, AlertCircle } from 'lucide-react';

const EXTERNAL_REVIEWS = [
  {
    id: '1',
    reviewer: 'Deloitte Türkiye',
    type: 'External Quality Assessment (EQA)',
    date: '2023-11-15',
    status: 'completed',
    rating: 'Generally Conforms',
    findings: 3,
  },
  {
    id: '2',
    reviewer: 'Ernst & Young',
    type: 'ISO 27001 Denetimi',
    date: '2024-01-22',
    status: 'completed',
    rating: 'Certified',
    findings: 1,
  },
  {
    id: '3',
    reviewer: 'KPMG',
    type: 'QAIP Peer Review',
    date: '2024-06-10',
    status: 'planned',
    rating: '-',
    findings: 0,
  },
];

export default function ExternalReviewPage() {
  return (
    <div className="p-8 space-y-6">
      <PageHeader
        title="Dış Değerlendirme"
        description="External Quality Assessment (EQA) ve akreditasyon süreçleri"
        badge="MODÜL 7: KALİTE (QAIP)"
      />

      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-800 mb-2">IIA Quality Assurance Standards</h3>
            <p className="text-slate-600 text-sm">
              IIA standartlarına göre her 5 yılda bir dış değerlendirme (EQA) zorunludur.
              Sentinel, dış değerlendirme raporlarını, aksiyon planlarını ve akreditasyon
              süreçlerini merkezi bir platformda yönetmenizi sağlar.
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle2 size={20} className="text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">2</div>
              <div className="text-sm text-slate-600">Tamamlanan Değerlendirme</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Calendar size={20} className="text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">1</div>
              <div className="text-sm text-slate-600">Planlanan Değerlendirme</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <AlertCircle size={20} className="text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">4</div>
              <div className="text-sm text-slate-600">Takip Edilen Bulgu</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileCheck size={20} className="text-blue-600" />
            Dış Değerlendirmeler
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">
                  Denetçi
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">
                  Değerlendirme Tipi
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">
                  Tarih
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">
                  Sonuç
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">
                  Bulgular
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {EXTERNAL_REVIEWS.map((review) => (
                <tr key={review.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {review.reviewer[0]}
                      </div>
                      <div className="font-semibold text-slate-800">{review.reviewer}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{review.type}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(review.date).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-6 py-4">
                    {review.status === 'completed' ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                        Tamamlandı
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                        Planlandı
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-800">{review.rating}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
                      {review.findings} Bulgu
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Award size={20} className="text-amber-600" />
            IIA Conformance Levels
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="font-bold text-green-800 mb-1">Generally Conforms (GC)</div>
              <div className="text-sm text-green-700">
                En yüksek uyum seviyesi. IIA standartlarına tam uyum gösterir.
              </div>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="font-bold text-amber-800 mb-1">Partially Conforms (PC)</div>
              <div className="text-sm text-amber-700">
                Kısmi uyum. Bazı iyileştirmeler gerektirir.
              </div>
            </div>
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="font-bold text-red-800 mb-1">Does Not Conform (DNC)</div>
              <div className="text-sm text-red-700">
                Uyumsuzluk. Ciddi iyileştirmeler gereklidir.
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Users size={20} className="text-purple-600" />
            Sonraki EQA Planı
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div className="font-bold text-blue-800">2024 Q2 - KPMG Peer Review</div>
                <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">Planlandı</span>
              </div>
              <div className="text-sm text-blue-700 mb-2">
                QAIP süreçlerimizin IIA standartlarına uygunluğu değerlendirilecek.
              </div>
              <div className="text-xs text-blue-600">Tarih: 10 Haziran 2024</div>
            </div>

            <div className="p-4 border border-slate-200 rounded-lg">
              <div className="font-bold text-slate-800 mb-2">Hazırlık Checklist</div>
              <div className="space-y-2">
                {[
                  { item: 'QAIP dokümantasyonu güncellemesi', done: true },
                  { item: 'İç değerlendirme raporları', done: true },
                  { item: 'KPI raporları ve trend analizleri', done: false },
                  { item: 'Denetim planı ve risk değerlendirmesi', done: false },
                ].map((task, i) => (
                  <label key={i} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={task.done}
                      className="rounded border-slate-300"
                      readOnly
                    />
                    <span className={task.done ? 'text-slate-400 line-through' : 'text-slate-700'}>
                      {task.item}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
