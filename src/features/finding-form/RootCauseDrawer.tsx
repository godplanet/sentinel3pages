import { useState } from 'react';
import { X, CheckCircle2, GitBranch, Target, Cpu, Users, Settings, Activity, FileText, Share } from 'lucide-react';
import clsx from 'clsx';

interface RootCauseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (htmlSummary: string) => void;
}

type RcaMethod = '5whys' | 'ishikawa';

export const RootCauseDrawer = ({ isOpen, onClose, onApply }: RootCauseDrawerProps) => {
  const [activeMethod, setActiveMethod] = useState<RcaMethod>('5whys');

  // 5-Whys State (Güvenli dizi başlatma)
  const [whys, setWhys] = useState<string[]>(['', '', '', '', '']);

  // Ishikawa State (Güvenli obje başlatma)
  const [ishikawa, setIshikawa] = useState({
    man: '', machine: '', material: '', method: '', measurement: '', environment: ''
  });

  const handleApply = () => {
    let generatedHtml = '';

    if (activeMethod === '5whys') {
      const filledWhys = whys.filter(w => w.trim() !== '');
      if (filledWhys.length === 0) {
          // Eğer hiçbir neden girilmediyse, çekmeceyi boş kapat.
          onApply('');
          return;
      }
      
      // Güvenli HTML Template Literal
      generatedHtml = `
        <p><strong>Gelişmiş Analiz: 5-Neden (5-Whys)</strong></p>
        <ol>
          ${filledWhys.map((w, i) => `<li><strong>${i + 1}. Neden:</strong> ${w}</li>`).join('')}
        </ol>
      `;
    } else {
      // Ishikawa analizi için, en az bir alanın doldurulup doldurulmadığını kontrol edelim
      const isAnyFieldFilled = Object.values(ishikawa).some(val => val.trim() !== '');
      if (!isAnyFieldFilled) {
          onApply('');
          return;
      }

      generatedHtml = `
        <p><strong>Gelişmiş Analiz: Balık Kılçığı (Ishikawa 6M)</strong></p>
        <ul>
            ${ishikawa.man ? `<li><strong>🧑‍🤝‍🧑 İnsan (Man):</strong> ${ishikawa.man}</li>` : ''}
            ${ishikawa.machine ? `<li><strong>💻 Makine (Machine):</strong> ${ishikawa.machine}</li>` : ''}
            ${ishikawa.method ? `<li><strong>⚙️ Metot (Method):</strong> ${ishikawa.method}</li>` : ''}
            ${ishikawa.material ? `<li><strong>📦 Malzeme (Material):</strong> ${ishikawa.material}</li>` : ''}
            ${ishikawa.measurement ? `<li><strong>📏 Ölçüm (Measurement):</strong> ${ishikawa.measurement}</li>` : ''}
            ${ishikawa.environment ? `<li><strong>🌍 Ortam (Environment):</strong> ${ishikawa.environment}</li>` : ''}
        </ul>
      `;
    }

    onApply(generatedHtml);
  };

  const updateWhy = (index: number, value: string) => {
      const newWhys = [...whys];
      newWhys[index] = value;
      setWhys(newWhys);
  };

  if (!isOpen) return null; // Eğer çekmece açık değilse, React boşuna render etmesin (Hata önleyici)

  return (
    <>
      <div 
        className={clsx("fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[10000]", isOpen ? "block" : "hidden")} 
        onClick={onClose} 
      />
      
      <div className={clsx(
        "fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-[10001] flex flex-col transform transition-transform duration-300",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        
        {/* HEADER */}
        <div className="bg-slate-900 p-6 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-black text-white flex items-center gap-2"><Target className="text-blue-400 w-6 h-6" /> Kök Neden Analizi</h2>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"><X className="w-5 h-5"/></button>
          </div>
          <p className="text-sm text-slate-400">Karmaşık bulgular için profesyonel analiz laboratuvarı.</p>
        </div>

        {/* METOT TABS */}
        <div className="flex border-b border-slate-200 shrink-0 bg-slate-50">
          <button onClick={() => setActiveMethod('5whys')} className={clsx("flex-1 py-3.5 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors", activeMethod === '5whys' ? "border-blue-600 text-blue-700 bg-white" : "border-transparent text-slate-500 hover:text-slate-800")}>
            <ListOrdered className="w-4 h-4" /> 5-Whys Analizi
          </button>
          <button onClick={() => setActiveMethod('ishikawa')} className={clsx("flex-1 py-3.5 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors", activeMethod === 'ishikawa' ? "border-indigo-600 text-indigo-700 bg-white" : "border-transparent text-slate-500 hover:text-slate-800")}>
            <GitBranch className="w-4 h-4" /> Balık Kılçığı
          </button>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          
          {/* 5-WHYS METHOD */}
          {activeMethod === '5whys' && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
                <p className="text-xs text-blue-800 font-medium">Bu metodoloji, sorunun kök nedenine ulaşana kadar art arda "Neden?" sorusunu sormaya dayanır.</p>
              </div>
              
              {whys.map((why, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-black border border-blue-200">
                    {idx + 1}
                  </div>
                  <input type="text" value={why} onChange={(e) => updateWhy(idx, e.target.value)} 
                    className="w-full pl-14 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 shadow-sm text-sm" 
                    placeholder={`${idx + 1}. Neden kaynaklandı?`} 
                  />
                  {idx < 4 && <div className="absolute left-7 top-10 w-0.5 h-6 bg-blue-100 z-0"></div>}
                </div>
              ))}
            </div>
          )}

          {/* ISHIKAWA METHOD */}
          {activeMethod === 'ishikawa' && (
            <div className="space-y-4">
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mb-6">
                <p className="text-xs text-indigo-800 font-medium">Balık kılçığı diyagramı; sorunu insan, sistem, süreç gibi temel bileşenlere ayırarak haritalamanızı sağlar.</p>
              </div>

              {[
                { id: 'man', label: 'İnsan (Man)', icon: Users, desc: 'Eğitim, farkındalık eksikliği' },
                { id: 'machine', label: 'Sistem/Makine (Machine)', icon: Cpu, desc: 'Yazılım hataları, altyapı' },
                { id: 'method', label: 'Süreç/Metot (Method)', icon: Settings, desc: 'Prosedürler, politikalar' },
                { id: 'material', label: 'Veri/Malzeme (Material)', icon: FileText, desc: 'Hatalı veri, eksik bilgi' },
                { id: 'measurement', label: 'Ölçüm (Measurement)', icon: Activity, desc: 'Yanlış raporlama, KRI' },
                { id: 'environment', label: 'Ortam/Çevre (Environment)', icon: Share, desc: 'Fiziksel şartlar, kültür' }
              ].map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm focus-within:border-indigo-400 transition-colors">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-2">
                    <item.icon className="w-4 h-4 text-indigo-500" /> {item.label}
                  </label>
                  <input type="text" value={ishikawa[item.id as keyof typeof ishikawa]} 
                    onChange={(e) => setIshikawa({ ...ishikawa, [item.id]: e.target.value })} 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500" 
                    placeholder={`${item.desc}...`} 
                  />
                </div>
              ))}
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="p-5 border-t border-slate-200 bg-white shrink-0">
          <button onClick={handleApply} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-md active:scale-95">
            <CheckCircle2 className="w-5 h-5" /> Analizi Ana Forma Aktar
          </button>
        </div>

      </div>
    </>
  );
};