import { FileText, Calendar, User, Tag, AlertTriangle, ShieldCheck } from 'lucide-react';
import clsx from 'clsx';
import type { ComprehensiveFinding } from '@/entities/finding/model/types';
import { useParameterStore } from '@/shared/stores/parameter-store';

export function FindingPaper({ finding }: { finding: ComprehensiveFinding }) {
  const { getSeverityColor } = useParameterStore();

  if (!finding) return null;

  return (
    <div className="bg-white shadow-sm border border-slate-200 min-h-[297mm] p-12 relative overflow-hidden font-serif text-slate-800">
      
      {/* KAĞIT FİLİGRANI (Opsiyonel) */}
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
         <ShieldCheck size={120} />
      </div>

      {/* BAŞLIK ALANI */}
      <div className="border-b-2 border-slate-900 pb-6 mb-8">
         <div className="flex justify-between items-start mb-4">
             <span className="text-xs font-sans font-bold text-slate-400 tracking-widest">BULGU NO: {finding.code}</span>
             <span className={clsx("font-sans text-xs px-3 py-1 rounded-full font-bold uppercase", getSeverityColor(finding.severity))}>
                 {finding.severity}
             </span>
         </div>
         <h1 className="text-3xl font-bold leading-tight">{finding.title}</h1>
      </div>

      {/* METADATA TABLOSU */}
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-8 font-sans">
          <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                  <span className="text-slate-400 text-xs block mb-1">Denetlenen Birim</span>
                  <div className="font-bold text-slate-700 flex items-center gap-2"><User size={14}/> {finding.auditee_department || 'Belirtilmemiş'}</div>
              </div>
              <div>
                  <span className="text-slate-400 text-xs block mb-1">Risk Kategorisi</span>
                  <div className="font-bold text-slate-700 flex items-center gap-2"><Tag size={14}/> {finding.gias_category}</div>
              </div>
              <div>
                  <span className="text-slate-400 text-xs block mb-1">Finansal Etki</span>
                  <div className="font-bold text-slate-700">{finding.financial_impact ? `${finding.financial_impact.toLocaleString()} TL` : '-'}</div>
              </div>
              <div>
                   <span className="text-slate-400 text-xs block mb-1">Tarih</span>
                   <div className="font-bold text-slate-700">{finding.created_at?.split('T')[0]}</div>
              </div>
          </div>
      </div>

      {/* İÇERİK BLOKLARI (HTML Render) */}
      <div className="space-y-8 prose prose-slate prose-sm max-w-none">
          
          <section>
              <h3 className="text-sm font-sans font-bold text-slate-900 uppercase border-b border-slate-200 pb-1 mb-3">1. Kriter & Mevzuat</h3>
              <div dangerouslySetInnerHTML={{ __html: finding.criteria_text || '<p class="text-slate-400 italic">Kriter belirtilmemiş.</p>' }} />
          </section>

          <section>
              <h3 className="text-sm font-sans font-bold text-slate-900 uppercase border-b border-slate-200 pb-1 mb-3">2. Tespit</h3>
              <div dangerouslySetInnerHTML={{ __html: finding.detection_html || finding.description || '' }} />
          </section>

          {/* KÖK NEDEN KUTUSU */}
          <section className="bg-slate-50 p-6 rounded-xl border-l-4 border-slate-400 not-prose my-6">
              <h3 className="text-sm font-sans font-bold text-slate-900 uppercase mb-3 flex items-center gap-2"><AlertTriangle size={14}/> Kök Neden Analizi</h3>
              {finding.secrets?.rca_details?.five_whys ? (
                  <ul className="space-y-2">
                      {finding.secrets.rca_details.five_whys.map((why, i) => (
                          <li key={i} className="text-sm flex gap-3 text-slate-700">
                              <span className="font-bold text-slate-400">{i+1}.</span> {why}
                          </li>
                      ))}
                  </ul>
              ) : (
                  <div dangerouslySetInnerHTML={{__html: finding.cause_text || 'Analiz yapılmamış.'}} />
              )}
          </section>

          <section>
              <h3 className="text-sm font-sans font-bold text-slate-900 uppercase border-b border-slate-200 pb-1 mb-3">4. Etki</h3>
              <div dangerouslySetInnerHTML={{ __html: finding.impact_html || '' }} />
          </section>

          <section>
              <h3 className="text-sm font-sans font-bold text-slate-900 uppercase border-b border-slate-200 pb-1 mb-3">5. Öneri</h3>
              <div dangerouslySetInnerHTML={{ __html: finding.recommendation_html || '' }} />
          </section>

      </div>

      {/* SAYFA ALT BİLGİSİ */}
      <div className="absolute bottom-8 left-12 right-12 border-t border-slate-200 pt-4 flex justify-between text-[10px] font-sans text-slate-400 uppercase tracking-widest">
          <span>Sentinel Audit System v3.0</span>
          <span>Gizli ve Hizmete Özel</span>
      </div>

    </div>
  );
}