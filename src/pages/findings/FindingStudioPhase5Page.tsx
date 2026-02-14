import { useState, useEffect } from 'react';
import { 
  History, Upload, CheckCircle2, Clock, 
  ExternalLink, FileCheck, AlertOctagon 
} from 'lucide-react';
import clsx from 'clsx';

// --- MİMARİ BAĞLANTILAR (Single Source of Truth) ---
import { mockComprehensiveFindings } from '@/entities/finding/api/mock-comprehensive-data';
import type { ComprehensiveFinding, ActionPlan } from '@/entities/finding/model/types';

interface Phase5Props {
  findingId: string;
}

export default function FindingStudioPhase5Page({ findingId }: Phase5Props) {
  // STATE
  const [finding, setFinding] = useState<ComprehensiveFinding | null>(null);
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);

  // 1. VERİ YÜKLEME
  useEffect(() => {
    const data = mockComprehensiveFindings.find(f => f.id === findingId);
    if (data) {
        setFinding(data);
        // Tip dönüşümü (Mock veriden gelen veriyi ActionPlan tipine zorluyoruz)
        setActionPlans(data.action_plans as unknown as ActionPlan[] || []);
    }
  }, [findingId]);

  if (!finding) return <div className="p-8 text-center text-slate-500">Veriler yükleniyor...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 pb-24">
      
      {/* Header Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex items-start gap-4">
        <div className="p-3 bg-blue-100 rounded-full text-blue-600">
            <History size={24} />
        </div>
        <div>
          <h3 className="font-bold text-blue-900 text-lg">Takip Süreci (Follow-up)</h3>
          <p className="text-blue-800/80 text-sm mt-1 leading-relaxed">
            Bu bulgu <strong>{new Date().toLocaleDateString('tr-TR')}</strong> tarihinde kapatılmıştır. 
            Aksiyon planlarının gerçekleşme durumları ve kanıt yüklemeleri bu ekrandan takip edilir.
          </p>
        </div>
      </div>

      {/* Aksiyon Takip Tablosu */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Clock size={18} className="text-slate-500"/> Aksiyon Takip Listesi
            </h3>
            <span className="text-xs font-bold bg-slate-200 text-slate-700 px-3 py-1 rounded-full">
                {actionPlans.length} Aksiyon
            </span>
        </div>
        
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
            <tr>
              <th className="p-4 w-1/3">Aksiyon Başlığı</th>
              <th className="p-4">Sorumlu</th>
              <th className="p-4">Vade</th>
              <th className="p-4">Kalan Süre</th>
              <th className="p-4">Durum</th>
              <th className="p-4 text-right">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {actionPlans.map(plan => (
              <tr key={plan.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <div className="font-bold text-slate-800">{plan.title}</div>
                  <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">{plan.description}</div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-600">
                      {plan.responsible_person ? plan.responsible_person.charAt(0) : '?'}
                    </div>
                    <span className="text-slate-700 font-medium">{plan.responsible_person || 'Atanmadı'}</span>
                  </div>
                </td>
                <td className="p-4 font-mono text-slate-600 font-medium">
                    {plan.target_date}
                </td>
                <td className="p-4">
                  {/* Mock Kalan Süre Mantığı */}
                  <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100 inline-flex items-center gap-1">
                    <Clock size={10}/> 12 Gün
                  </span>
                </td>
                <td className="p-4">
                  <span className={clsx("px-2 py-1 rounded text-xs font-bold border flex w-fit items-center gap-1", 
                    plan.status === 'COMPLETED' 
                        ? 'bg-green-100 text-green-700 border-green-200' 
                        : 'bg-blue-50 text-blue-700 border-blue-100'
                  )}>
                    {plan.status === 'COMPLETED' ? <CheckCircle2 size={12}/> : <Clock size={12}/>}
                    {plan.status === 'COMPLETED' ? 'TAMAMLANDI' : 'DEVAM EDİYOR'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button className="text-indigo-600 font-bold hover:underline text-xs flex items-center gap-1 justify-end ml-auto group">
                    <Upload size={14} className="group-hover:-translate-y-0.5 transition-transform"/> Kanıt Yükle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Kanıt Doğrulama (Audit Trail) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <FileCheck size={18} className="text-emerald-600"/> Son Aktiviteler (Audit Trail)
          </h3>
          <div className="space-y-6 pl-2 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              
              <div className="flex gap-4 items-start relative">
                  <div className="w-9 h-9 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-slate-500 shrink-0 z-10">
                      <Upload size={14}/>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 w-full">
                      <div className="flex justify-between items-start">
                          <p className="text-sm text-slate-800"><span className="font-bold">Mehmet Kara</span> "Kasa Tutanakları.pdf" dosyasını yükledi.</p>
                          <span className="text-[10px] text-slate-400 font-mono">14:30</span>
                      </div>
                      <button className="mt-2 text-xs text-blue-600 font-bold hover:underline flex items-center gap-1">
                          <ExternalLink size={12}/> Dosyayı İncele
                      </button>
                  </div>
              </div>

              <div className="flex gap-4 items-start relative">
                  <div className="w-9 h-9 rounded-full bg-white border-2 border-orange-200 flex items-center justify-center text-orange-500 shrink-0 z-10">
                      <AlertOctagon size={14}/>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 w-full">
                      <div className="flex justify-between items-start">
                          <p className="text-sm text-orange-900"><span className="font-bold">Sistem</span> aksiyon vadesine 3 gün kaldığı için sorumluya hatırlatma e-postası gönderdi.</p>
                          <span className="text-[10px] text-orange-400 font-mono">Dün, 09:00</span>
                      </div>
                  </div>
              </div>

          </div>
      </div>

    </div>
  );
}