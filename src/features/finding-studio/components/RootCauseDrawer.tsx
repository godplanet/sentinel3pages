import { useState } from 'react';
import { 
  X, Check, GitBranch, Target, Cpu, Users, Settings, Activity, 
  FileText, Share, ListOrdered, ShieldAlert, Info, AlertTriangle, Sparkles 
} from 'lucide-react';
import clsx from 'clsx';

interface RootCauseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (htmlSummary: string) => void;
}

type RcaMethod = '5whys' | 'ishikawa' | 'bowtie';

export const RootCauseDrawer = ({ isOpen, onClose, onApply }: RootCauseDrawerProps) => {
  const [activeMethod, setActiveMethod] = useState<RcaMethod>('5whys');
  
  // 5-Whys State
  const [whys, setWhys] = useState<string[]>(['', '', '', '', '']);
  const whyPlaceholders = [
      "Sorun tam olarak neydi ve neden meydana geldi?",
      "Bir önceki adımda belirttiğiniz durum neden oluştu?",
      "Bu eksikliğin veya hatanın altında yatan sebep neydi?",
      "Sürecin bu noktada tıkanmasına / bozulmasına ne yol açtı?",
      "Sistemsel, kültürel veya yönetimsel asıl (kök) neden nedir?"
  ];

  // Ishikawa State
  const [ishikawa, setIshikawa] = useState({
    man: '', machine: '', material: '', method: '', measurement: '', environment: ''
  });

  // Bowtie State
  const [bowtie, setBowtie] = useState({
    preventive: '', event: '', corrective: '', consequences: ''
  });

  const updateWhy = (index: number, value: string) => {
      const newWhys = [...whys];
      newWhys[index] = value;
      setWhys(newWhys);
  };

  // HTML Generator
  const generateHtmlPreview = () => {
    if (activeMethod === '5whys') {
      const filledWhys = whys.filter(w => w?.trim() !== '');
      if (filledWhys.length === 0) return '<p class="text-slate-400 italic">Analiz verisi girilmedi...</p>';
      
      return `
        <div style="background:#f8fafc; padding:15px; border-left:4px solid #3b82f6; border-radius:4px;">
            <p style="margin:0 0 10px 0; color:#1e3a8a;"><strong>🔍 Gelişmiş Analiz: 5-Neden (5-Whys)</strong></p>
            <ol style="margin:0; padding-left:20px;">
              ${filledWhys.map((w, i) => `<li><strong>${i + 1}. Neden:</strong> ${w}</li>`).join('')}
            </ol>
        </div>
      `;
    } 
    else if (activeMethod === 'ishikawa') {
      // ... Ishikawa HTML logic similar to above
      return `<p><strong>🐟 Ishikawa Analizi Eklendi</strong></p>`; // Kısaltıldı, mantık aynı
    }
    return '';
  };

  if (!isOpen) return null;

  return (
    <>
      {/* MASK */}
      <div 
        className={clsx("fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9990] transition-opacity duration-300", isOpen ? "opacity-100" : "opacity-0 pointer-events-none")} 
        onClick={onClose} 
      />
      
      {/* DRAWER */}
      <div className={clsx(
        "fixed bottom-0 right-0 top-0 w-full max-w-2xl bg-white shadow-2xl z-[9991] flex flex-col transform transition-transform duration-300 ease-in-out border-l border-slate-200",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        
        {/* HEADER */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Target className="text-blue-600 w-6 h-6" /> Kök Neden Laboratuvarı
            </h2>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5"/>
            </button>
          </div>
          <p className="text-sm text-slate-500 font-medium">Karmaşık bulgular için profesyonel analiz araçları.</p>
        </div>

        {/* TABS */}
        <div className="flex border-b border-slate-200 shrink-0 bg-white">
          <button onClick={() => setActiveMethod('5whys')} className={clsx("flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors", activeMethod === '5whys' ? "border-blue-600 text-blue-700 bg-blue-50/30" : "border-transparent text-slate-500 hover:bg-slate-50")}>
            <ListOrdered className="w-4 h-4" /> 5-Whys
          </button>
          <button onClick={() => setActiveMethod('ishikawa')} className={clsx("flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors", activeMethod === 'ishikawa' ? "border-indigo-600 text-indigo-700 bg-indigo-50/30" : "border-transparent text-slate-500 hover:bg-slate-50")}>
            <GitBranch className="w-4 h-4" /> Balık Kılçığı
          </button>
          <button onClick={() => setActiveMethod('bowtie')} className={clsx("flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors", activeMethod === 'bowtie' ? "border-rose-600 text-rose-700 bg-rose-50/30" : "border-transparent text-slate-500 hover:bg-slate-50")}>
            <ShieldAlert className="w-4 h-4" /> Papyon (Bow-Tie)
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
            {activeMethod === '5whys' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3 text-blue-900 text-sm">
                        <Info className="shrink-0 w-5 h-5"/>
                        <p>Sorunun köküne inmek için ardışık olarak 5 kez "Neden?" sorusunu sorun.</p>
                    </div>
                    {whys.map((why, idx) => (
                        <div key={idx} className="relative">
                            <div className="absolute left-3 top-3 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold border border-blue-200">{idx + 1}</div>
                            <textarea 
                                value={why} 
                                onChange={(e) => updateWhy(idx, e.target.value)} 
                                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 shadow-sm text-sm text-slate-700 resize-none min-h-[80px]" 
                                placeholder={whyPlaceholders[idx]} 
                            />
                        </div>
                    ))}
                </div>
            )}
            
            {/* ... Diğer metodlar (Ishikawa, Bowtie) benzer şekilde buraya gelir ... */}
        </div>

        {/* FOOTER */}
        <div className="p-5 border-t border-slate-200 bg-slate-50 shrink-0">
          <button onClick={() => onApply(generateHtmlPreview())} className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-md active:scale-95">
            <Check className="w-5 h-5" /> Analizi Ana Forma Aktar
          </button>
        </div>
      </div>
    </>
  );
};