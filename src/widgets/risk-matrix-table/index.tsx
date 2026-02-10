import { ArrowRight, Shield, AlertCircle, Calendar } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { AuditEntity } from '@/features/universe/types';

const SAMPLE_ENTITIES: AuditEntity[] = [
  { id: '1', code: 'AU-001', name: 'Kredi Operasyonlari', manager: 'Ahmet Yilmaz', category: 'Business', last_audit: '2025-08', audit_grade: 'C', audit_score: 2.4, total_score: 88 },
  { id: '2', code: 'AU-002', name: 'BT Altyapi Yonetimi', manager: 'Mehmet Oz', category: 'IT', last_audit: '2025-06', audit_grade: 'D', audit_score: 1.8, total_score: 82 },
  { id: '3', code: 'AU-003', name: 'Uyumluluk Birimi', manager: 'Zeynep Kara', category: 'Regulation', last_audit: '2025-09', audit_grade: 'B', audit_score: 3.2, total_score: 65 },
  { id: '4', code: 'AU-004', name: 'Hazine Islemleri', manager: 'Ali Demir', category: 'Business', last_audit: '2025-04', audit_grade: 'A', audit_score: 3.8, total_score: 42 },
  { id: '5', code: 'AU-005', name: 'Insan Kaynaklari', manager: 'Fatma Celik', category: 'Support', last_audit: '2025-07', audit_grade: 'B', audit_score: 3.0, total_score: 55 },
];

interface RiskMatrixTableProps {
  entities?: AuditEntity[];
  onViewDetail?: (id: string) => void;
}

const getRiskBadgeColor = (score: number) => {
  if (score >= 80) return 'bg-rose-50 text-rose-700 border-rose-200';
  if (score >= 60) return 'bg-orange-50 text-orange-700 border-orange-200';
  if (score >= 40) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
  return 'bg-emerald-50 text-emerald-700 border-emerald-200';
};

const getGradeColor = (grade: string) => {
  switch (grade) {
    case 'A': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'B': return 'bg-blue-50 text-blue-700 border-blue-100';
    case 'C': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'D': return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'F': return 'bg-rose-50 text-rose-700 border-rose-200';
    default: return 'bg-slate-100 text-slate-500 border-slate-200';
  }
};

export const RiskMatrixTable = ({ entities = SAMPLE_ENTITIES, onViewDetail }: RiskMatrixTableProps) => {
  if (entities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
        <Shield size={48} className="mb-4 opacity-20" />
        <p>Goruntülenecek varlik bulunamadi.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200 font-semibold tracking-wider">
            <tr>
              <th className="px-6 py-4 w-24">Kod</th>
              <th className="px-6 py-4">Varlik & Yonetici</th>
              <th className="px-6 py-4 w-32">Kategori</th>
              <th className="px-6 py-4 w-48">Son Denetim</th>
              <th className="px-6 py-4 text-center w-40">Risk Skoru</th>
              <th className="px-6 py-4 w-16"></th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {entities.map((entity) => (
              <tr
                key={entity.id}
                onClick={() => onViewDetail?.(entity.id)}
                className="group hover:bg-slate-50/80 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4 font-mono text-xs text-slate-400 group-hover:text-blue-500 transition-colors">
                  {entity.code}
                </td>

                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 text-base mb-0.5 group-hover:text-blue-700 transition-colors">
                      {entity.name}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      {entity.manager}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border",
                    entity.category === 'IT' && "bg-cyan-50 text-cyan-700 border-cyan-100",
                    entity.category === 'Business' && "bg-blue-50 text-blue-700 border-blue-100",
                    entity.category === 'Support' && "bg-orange-50 text-orange-700 border-orange-100",
                    entity.category === 'Regulation' && "bg-slate-100 text-slate-700 border-slate-200"
                  )}>
                    {entity.category}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar size={12} />
                      {entity.last_audit}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "flex items-center justify-center w-6 h-6 rounded-md shadow-sm text-xs font-bold border",
                        getGradeColor(entity.audit_grade)
                      )}>
                        {entity.audit_grade}
                      </div>
                      <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-slate-400 rounded-full"
                          style={{ width: `${(entity.audit_score / 4) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 text-center">
                  <div className={cn(
                    "inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm w-full transition-transform group-hover:scale-105",
                    getRiskBadgeColor(entity.total_score)
                  )}>
                    {entity.total_score >= 80 && <AlertCircle size={14} className="mr-1.5 animate-pulse" />}
                    {entity.total_score} <span className="text-[9px] opacity-60 ml-1">/ 100</span>
                  </div>
                </td>

                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0">
                    <ArrowRight size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
