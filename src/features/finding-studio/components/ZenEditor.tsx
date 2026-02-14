import { useState, useEffect } from 'react';
import { RichTextEditor } from '@/shared/ui/RichTextEditor'; // <-- ORTAK BİLEŞEN
import { GitBranch, AlertCircle, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

export interface FindingEditorData {
  criteria: string;
  condition: string;
  effect: string;
  recommendation: string;
  root_cause_analysis: { method: 'five_whys', five_whys: string[] };
}

interface ZenEditorProps {
  initialData: FindingEditorData;
  onChange?: (data: FindingEditorData) => void;
  readOnly?: boolean;
}

const SECTIONS = [
  { id: 'criteria', title: '1. KRİTER (Ne Olmalıydı?)', placeholder: 'İlgili mevzuat, prosedür veya en iyi uygulama standardını buraya yazın...', color: 'border-blue-200 bg-blue-50/30' },
  { id: 'condition', title: '2. TESPİT (Ne Oldu?)', placeholder: 'Sahada gözlemlenen durum, kanıtlar ve örneklem detayları...', color: 'border-amber-200 bg-amber-50/30' },
  // Kök Neden (3. Madde) araya özel bileşen olarak girecek
  { id: 'effect', title: '4. ETKİ & RİSK (Sonuç Nedir?)', placeholder: 'Kuruma olan finansal, operasyonel veya itibar etkisi...', color: 'border-red-200 bg-red-50/30' },
  { id: 'recommendation', title: '5. ÖNERİ (Ne Yapılmalı?)', placeholder: 'Kök nedeni ortadan kaldıracak kalıcı çözüm önerisi...', color: 'border-emerald-200 bg-emerald-50/30' },
];

export function ZenEditor({ initialData, onChange, readOnly = false }: ZenEditorProps) {
  const [data, setData] = useState<FindingEditorData>(initialData);

  // Dışarıdan gelen veri değişirse state'i güncelle (Senkronizasyon)
  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const handleChange = (field: keyof FindingEditorData, value: any) => {
    const newData = { ...data, [field]: value };
    setData(newData);
    onChange?.(newData);
  };

  const handleRootCauseChange = (index: number, value: string) => {
    const newWhys = [...data.root_cause_analysis.five_whys];
    newWhys[index] = value;
    const newData = { 
      ...data, 
      root_cause_analysis: { ...data.root_cause_analysis, five_whys: newWhys } 
    };
    setData(newData);
    onChange?.(newData);
  };

  return (
    <div className="space-y-8 pb-20 max-w-4xl mx-auto">
      
      {/* 5C BÖLÜMLERİ */}
      {SECTIONS.map((section, index) => {
        // Kök Neden Analizini 2. ve 3. madde arasına ekle
        if (section.id === 'effect') {
             return (
                 <div key="rca-wrapper">
                     <RootCauseSection 
                        whys={data.root_cause_analysis.five_whys} 
                        onChange={handleRootCauseChange}
                        readOnly={readOnly}
                     />
                     <div key={section.id} className={clsx("p-1 rounded-xl transition-all duration-300", section.color, "mt-8")}>
                        <div className="bg-white rounded-lg p-6 border border-slate-100 shadow-sm">
                            <h3 className="text-xs font-black text-slate-400 uppercase mb-3 tracking-widest flex items-center gap-2">
                                <span className={clsx("w-2 h-2 rounded-full", section.color.replace('border-', 'bg-').replace('bg-', 'text-'))} />
                                {section.title}
                            </h3>
                            <RichTextEditor 
                                value={(data as any)[section.id]} 
                                onChange={(val) => handleChange(section.id as keyof FindingEditorData, val)}
                                placeholder={section.placeholder}
                                readOnly={readOnly}
                                minHeight="150px"
                            />
                        </div>
                     </div>
                 </div>
             );
        }

        return (
          <div key={section.id} className={clsx("p-1 rounded-xl transition-all duration-300", section.color)}>
             <div className="bg-white rounded-lg p-6 border border-slate-100 shadow-sm">
                 <h3 className="text-xs font-black text-slate-400 uppercase mb-3 tracking-widest flex items-center gap-2">
                    <span className={clsx("w-2 h-2 rounded-full", section.color.replace('border-', 'bg-').replace('bg-', 'text-'))} />
                    {section.title}
                 </h3>
                 <RichTextEditor 
                    value={(data as any)[section.id]} 
                    onChange={(val) => handleChange(section.id as keyof FindingEditorData, val)}
                    placeholder={section.placeholder}
                    readOnly={readOnly}
                    minHeight="150px"
                 />
             </div>
          </div>
        );
      })}

    </div>
  );
}

// --- KÖK NEDEN ÖZEL BİLEŞENİ ---
function RootCauseSection({ whys, onChange, readOnly }: { whys: string[], onChange: (i: number, v: string) => void, readOnly: boolean }) {
    return (
        <div className="p-1 rounded-xl border-purple-200 bg-purple-50/30 my-8">
            <div className="bg-white rounded-lg p-6 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-black text-purple-600 uppercase tracking-widest flex items-center gap-2">
                        <GitBranch size={14} /> 3. KÖK NEDEN ANALİZİ (5 Neden)
                    </h3>
                    {!readOnly && <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-bold">AI Destekli</span>}
                </div>
                
                <div className="space-y-3 pl-2 relative">
                    <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-purple-200 to-transparent" />
                    
                    {whys.map((why, i) => (
                        <div key={i} className="flex items-start gap-3 relative group">
                             <div className={clsx(
                                 "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 z-10 border-2 transition-colors mt-1.5",
                                 why ? "bg-purple-600 border-purple-600 text-white" : "bg-white border-purple-200 text-purple-300"
                             )}>
                                 {i + 1}
                             </div>
                             <div className="flex-1">
                                 <input 
                                     value={why}
                                     onChange={(e) => onChange(i, e.target.value)}
                                     disabled={readOnly}
                                     placeholder={`${i + 1}. Neden?`}
                                     className={clsx(
                                         "w-full bg-transparent border-b border-transparent py-1.5 text-sm focus:outline-none transition-all placeholder:text-slate-300 text-slate-700",
                                         !readOnly && "focus:border-purple-300 hover:border-slate-200 border-slate-100"
                                     )}
                                 />
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}