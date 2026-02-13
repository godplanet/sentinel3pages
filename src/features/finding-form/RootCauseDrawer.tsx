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

  // --- 1. METOT: 5-Whys State ---
  const [whys, setWhys] = useState<string[]>(['', '', '', '', '']);
  
  // 5-Whys için kademeli ve yönlendirici ipucu metinleri
  const whyPlaceholders = [
      "Sorun tam olarak neydi ve neden meydana geldi?",
      "Bir önceki adımda belirttiğiniz durum neden oluştu?",
      "Bu eksikliğin veya hatanın altında yatan sebep neydi?",
      "Sürecin bu noktada tıkanmasına / bozulmasına ne yol açtı?",
      "Sistemsel, kültürel veya yönetimsel asıl (kök) neden nedir?"
  ];

  // --- 2. METOT: Ishikawa (Balık Kılçığı) State ---
  const [ishikawa, setIshikawa] = useState({
    man: '', machine: '', material: '', method: '', measurement: '', environment: ''
  });

  // --- 3. METOT: Papyon (Bow-Tie) State ---
  const [bowtie, setBowtie] = useState({
    preventive: '', event: '', corrective: '', consequences: ''
  });

  const updateWhy = (index: number, value: string) => {
      const newWhys = [...whys];
      newWhys[index] = value;
      setWhys(newWhys);
  };

  // CANLI ÖNİZLEME (LIVE PREVIEW) VE AKTARIM İÇİN HTML ÜRETİCİ
  const generateHtmlPreview = () => {
    if (activeMethod === '5whys') {
      const filledWhys = whys.filter(w => w.trim() !== '');
      if (filledWhys.length === 0) return '<p class="text-slate-400 italic">Analiz verisi girilmedi...</p>';
      
      return `
        <p><strong>🔍 Gelişmiş Analiz: 5-Neden (5-Whys)</strong></p>
        <ol>
          ${filledWhys.map((w, i) => `<li><strong>${i + 1}. Neden:</strong> ${w}</li>`).join('')}
        </ol>
      `;
    } 
    else if (activeMethod === 'ishikawa') {
      const isAnyFieldFilled = Object.values(ishikawa).some(val => val.trim() !== '');
      if (!isAnyFieldFilled) return '<p class="text-slate-400 italic">Analiz verisi girilmedi...</p>';

      return `
        <p><strong>🐟 Gelişmiş Analiz: Balık Kılçığı (Ishikawa 6M)</strong></p>
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
    else if (activeMethod === 'bowtie') {
      if (!bowtie.preventive && !bowtie.event && !bowtie.corrective && !bowtie.consequences) {
          return '<p class="text-slate-400 italic">Analiz verisi girilmedi...</p>';
      }

      return `
        <p><strong>🎀 Gelişmiş Analiz: Papyon (Bow-Tie) Risk Modeli</strong></p>
        <ul>
            ${bowtie.preventive ? `<li><strong>🛡️ Önleyici Kontroller:</strong> ${bowtie.preventive}</li>` : ''}
            ${bowtie.event ? `<li><strong>💥 Gerçekleşen Olay (Risk):</strong> ${bowtie.event}</li>` : ''}
            ${bowtie.corrective ? `<li><strong>🩹 Düzeltici Kontroller:</strong> ${bowtie.corrective}</li>` : ''}
            ${bowtie.consequences ? `<li><strong>📉 Nihai Sonuç ve Etki:</strong> ${bowtie.consequences}</li>` : ''}
        </ul>
      `;
    }
    return '';
  };

  const handleApply = () => {
      const html = generateHtmlPreview();
      // Eğer sadece boş mesaj dönüyorsa işlem yapma
      if (html.includes('Analiz verisi girilmedi')) {
          onApply('');
      } else {
          onApply(html);
      }
  };

  return (
    <>
      {/* ARKA PLAN MASKESİ - Z-index çok yükseğe çekildi */}
      <div 
        className={clsx("fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[99998] transition-opacity duration-300", isOpen ? "opacity-100" : "opacity-0 pointer-events-none")} 
        onClick={onClose} 
      />
      
      {/* ÇEKMECE (DRAWER) PANELİ - Genişletildi (max-w-2xl) ve Z-index artırıldı */}
      <div className={clsx(
        "fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl z-[99999] flex flex-col transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        
        {/* HEADER */}
        <div className="bg-slate-900 p-6 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-black text-white flex items-center gap-2"><Target className="text-blue-400 w-6 h-6" /> Kök Neden Laboratuvarı</h2>
            <div className="flex items-center gap-3">
                <button type="button" className="px-3 py-1.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg hover:bg-blue-500/40 transition-colors text-xs font-bold flex items-center gap-1.5 shadow-sm">
                    <Sparkles size={14} /> AI Analiz
                </button>
                <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"><X className="w-5 h-5"/></button>
            </div>
          </div>
          <p className="text-sm text-slate-400">Karmaşık bulgular için profesyonel analiz ve metodoloji aracı.</p>
        </div>

        {/* METOT SEKMELERİ (TABS) */}
        <div className="flex border-b border-slate-200 shrink-0 bg-slate-50 overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveMethod('5whys')} className={clsx("flex-1 py-3.5 px-2 text-xs md:text-sm font-bold flex items-center justify-center gap-1.5 border-b-2 transition-colors whitespace-nowrap", activeMethod === '5whys' ? "border-blue-600 text-blue-700 bg-white" : "border-transparent text-slate-500 hover:text-slate-800")}>
            <ListOrdered className="w-4 h-4" /> 5-Whys
          </button>
          <button onClick={() => setActiveMethod('ishikawa')} className={clsx("flex-1 py-3.5 px-2 text-xs md:text-sm font-bold flex items-center justify-center gap-1.5 border-b-2 transition-colors whitespace-nowrap", activeMethod === 'ishikawa' ? "border-indigo-600 text-indigo-700 bg-white" : "border-transparent text-slate-500 hover:text-slate-800")}>
            <GitBranch className="w-4 h-4" /> Kılçık (6M)
          </button>
          <button onClick={() => setActiveMethod('bowtie')} className={clsx("flex-1 py-3.5 px-2 text-xs md:text-sm font-bold flex items-center justify-center gap-1.5 border-b-2 transition-colors whitespace-nowrap", activeMethod === 'bowtie' ? "border-rose-600 text-rose-700 bg-white" : "border-transparent text-slate-500 hover:text-slate-800")}>
            <ShieldAlert className="w-4 h-4" /> Papyon
          </button>
        </div>

        {/* İÇERİK ALANI */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          
          <div className="grid grid-cols-1 gap-6">
              
              {/* ANALİZ GİRİŞ ALANI */}
              <div className="flex-1">
                  {/* 1. METOT: 5-WHYS */}
                  {activeMethod === '5whys' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="bg-blue-50/80 p-4 rounded-xl border border-blue-200 mb-6 flex gap-3">
                        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-bold text-blue-900 mb-1">Müfettiş İpucu</h4>
                            <p className="text-xs text-blue-800 leading-relaxed">Belirtiden (görünen sorundan) başlayıp art arda "Neden?" diye sorarak asıl kaynağa inin. İnsan hatasında durmayın; "Süreç neden o hataya izin verdi?" sorusu asıl kök nedeni bulmanızı sağlar.</p>
                        </div>
                      </div>
                      
                      {whys.map((why, idx) => (
                        <div key={idx} className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-black border border-blue-200 z-10">
                            {idx + 1}
                          </div>
                          <input type="text" value={why} onChange={(e) => updateWhy(idx, e.target.value)} 
                            className="w-full pl-14 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 shadow-sm text-sm font-medium text-slate-700" 
                            placeholder={whyPlaceholders[idx]} 
                          />
                          {idx < 4 && <div className="absolute left-7 top-10 w-0.5 h-8 bg-blue-200 z-0"></div>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 2. METOT: ISHIKAWA */}
                  {activeMethod === 'ishikawa' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="bg-indigo-50/80 p-4 rounded-xl border border-indigo-200 mb-6 flex gap-3">
                        <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-bold text-indigo-900 mb-1">Müfettiş İpucu</h4>
                            <p className="text-xs text-indigo-800 leading-relaxed">Sorunu ana dallara ayırın. Her bir alan için "Bu bileşende ne eksikti veya yanlış gitti?" sorusunu sorarak yapısal zafiyetleri ortaya çıkarın.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[
                            { id: 'man', label: 'İnsan (Man)', icon: Users, desc: 'Eğitim eksikliği, dikkatsizlik...' },
                            { id: 'machine', label: 'Makine (Machine)', icon: Cpu, desc: 'Yazılım hatası, altyapı...' },
                            { id: 'method', label: 'Süreç (Method)', icon: Settings, desc: 'Hatalı prosedür, eksik politika...' },
                            { id: 'material', label: 'Malzeme (Material)', icon: FileText, desc: 'Hatalı veri girişi, eksik döküman...' },
                            { id: 'measurement', label: 'Ölçüm (Measurement)', icon: Activity, desc: 'Yanlış KRI, hatalı raporlama...' },
                            { id: 'environment', label: 'Ortam (Environment)', icon: Share, desc: 'Fiziksel şartlar, kültür...' }
                          ].map((item) => (
                            <div key={item.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-400 transition-all">
                              <label className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-2 uppercase tracking-wide">
                                <item.icon className="w-4 h-4 text-indigo-500" /> {item.label}
                              </label>
                              <input type="text" value={ishikawa[item.id as keyof typeof ishikawa]} 
                                onChange={(e) => setIshikawa({ ...ishikawa, [item.id]: e.target.value })} 
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-indigo-300 text-slate-700" 
                                placeholder={item.desc} 
                              />
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* 3. METOT: BOW-TIE (PAPYON) */}
                  {activeMethod === 'bowtie' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="bg-rose-50/80 p-4 rounded-xl border border-rose-200 mb-6 flex gap-3">
                        <Info className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-bold text-rose-900 mb-1">Müfettiş İpucu (Papyon Modeli)</h4>
                            <p className="text-xs text-rose-800 leading-relaxed">Ortaya olayı koyun. Sol tarafa bu olayı önlemesi gereken, sağ tarafa ise etkiyi azaltması gereken kontrolleri yazın.</p>
                        </div>
                      </div>

                      <div className="relative border-l-2 border-rose-200 pl-4 ml-2 space-y-5 py-2">
                          <div className="relative">
                              <div className="absolute -left-[23px] top-2 w-3 h-3 bg-white border-2 border-rose-400 rounded-full"></div>
                              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">1. Önleyici Kontroller</label>
                              <textarea rows={2} value={bowtie.preventive} onChange={e => setBowtie({...bowtie, preventive: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-1 focus:ring-rose-500 resize-none" placeholder="Hangi kontroller bu olayı önlemeliydi?" />
                          </div>
                          
                          <div className="relative">
                              <div className="absolute -left-[27px] top-2 w-5 h-5 bg-rose-100 border-2 border-rose-500 rounded-full flex items-center justify-center"><AlertTriangle className="w-3 h-3 text-rose-600" /></div>
                              <label className="block text-xs font-bold text-rose-700 mb-1 uppercase">2. Gerçekleşen Olay (Risk)</label>
                              <textarea rows={2} value={bowtie.event} onChange={e => setBowtie({...bowtie, event: e.target.value})} className="w-full px-3 py-2 border border-rose-200 rounded-lg text-sm bg-rose-50 focus:ring-1 focus:ring-rose-500 resize-none font-medium" placeholder="Ne oldu? (Örn: Hatalı para transferi yapıldı)" />
                          </div>

                          <div className="relative">
                              <div className="absolute -left-[23px] top-2 w-3 h-3 bg-white border-2 border-rose-400 rounded-full"></div>
                              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">3. Düzeltici Kontroller</label>
                              <textarea rows={2} value={bowtie.corrective} onChange={e => setBowtie({...bowtie, corrective: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-1 focus:ring-rose-500 resize-none" placeholder="Olay olduktan sonra sistem bunu neden yakalayamadı?" />
                          </div>

                          <div className="relative">
                              <div className="absolute -left-[23px] top-2 w-3 h-3 bg-slate-800 border-2 border-slate-800 rounded-full"></div>
                              <label className="block text-xs font-bold text-slate-800 mb-1 uppercase">4. Sonuç (Etki)</label>
                              <textarea rows={2} value={bowtie.consequences} onChange={e => setBowtie({...bowtie, consequences: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-100 focus:ring-1 focus:ring-slate-500 resize-none" placeholder="Kurum ne kaybetti? (İtibar, Para, Zaman...)" />
                          </div>
                      </div>
                    </div>
                  )}
              </div>
              
              {/* CANLI ÖNİZLEME (LIVE PREVIEW) */}
              <div className="bg-slate-100 rounded-xl p-5 border border-slate-200 mt-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Ana Forma Eklenecek Çıktı (Önizleme)</h4>
                  <div 
                      className="prose prose-sm prose-slate max-w-none bg-white p-4 rounded-lg border border-slate-200 shadow-inner"
                      dangerouslySetInnerHTML={{ __html: generateHtmlPreview() }}
                  />
              </div>

          </div>

        </div>

        {/* FOOTER - KAYDET BUTONU */}
        <div className="p-5 border-t border-slate-200 bg-white shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
          <button onClick={handleApply} className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-black flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-md active:scale-95">
            <Check className="w-5 h-5" /> Analizi Ana Forma Aktar
          </button>
        </div>

      </div>
    </>
  );
};