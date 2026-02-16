import React from 'react';
import { 
  Scale, 
  Search, 
  GitPullRequestArrow, 
  AlertTriangle, 
  CheckCircle2, 
  Target, 
  Bookmark, 
  Quote
} from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

// --- Types ---
interface ZenReaderWidgetProps {
  data: any; 
  layout: 'flow' | 'book';
  warmth?: number; // 0-50
}

// --- Dynamic Paper Color ---
const getPaperStyle = (warmth: number = 0) => {
  // Base White (255) -> Warm Sepia/Cream
  const r = 255 - (warmth * 0.05);
  const g = 255 - (warmth * 0.20); 
  const b = 255 - (warmth * 0.50); 
  
  return {
    backgroundColor: `rgb(${r}, ${g}, ${b})`,
    color: '#1e293b' // Slate-800 for high contrast
  };
};

// --- Helper: Risk Badge Calculation ---
const getRiskBadge = (data: any) => {
  const score = data.risk_score || (data.impact * data.likelihood) || 0;
  let severity = data.severity || 'LOW';
  
  // Eğer severity string olarak gelmemişse skordan hesapla
  if (!data.severity) {
      if (score >= 20) severity = 'CRITICAL';
      else if (score >= 12) severity = 'HIGH';
      else if (score >= 6) severity = 'MEDIUM';
      else severity = 'LOW';
  }

  const badges: Record<string, { label: string, classes: string, icon: any }> = {
    'CRITICAL': { label: 'KRİTİK', classes: 'bg-rose-100 text-rose-700 border-rose-200', icon: AlertTriangle },
    'HIGH': { label: 'YÜKSEK', classes: 'bg-orange-100 text-orange-700 border-orange-200', icon: AlertTriangle },
    'MEDIUM': { label: 'ORTA', classes: 'bg-amber-100 text-amber-700 border-amber-200', icon: AlertTriangle },
    'LOW': { label: 'DÜŞÜK', classes: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
    'OBSERVATION': { label: 'GÖZLEM', classes: 'bg-slate-100 text-slate-700 border-slate-200', icon: Search },
  };

  return badges[severity] || badges['LOW'];
};

// --- Helper Components ---
const SectionBlock = ({ title, icon: Icon, content, colorClass }: any) => {
  if (!content || content === '<p><br></p>') return null;
  return (
    <section className="mb-10 group">
      <div className="flex items-center gap-3 mb-4 border-b border-black/5 pb-2">
        <Icon size={18} className={cn("opacity-70", colorClass)} />
        <h3 className="font-sans text-xs font-bold uppercase tracking-widest opacity-50">
          {title}
        </h3>
      </div>
      <div 
        className="font-serif text-lg leading-loose opacity-90 prose prose-slate max-w-none"
        dangerouslySetInnerHTML={{ __html: content }} 
      />
    </section>
  );
};

export const ZenReaderWidget: React.FC<ZenReaderWidgetProps> = ({ 
  data, 
  layout, 
  warmth = 0 
}) => {
  const paperStyle = getPaperStyle(warmth);
  const riskInfo = getRiskBadge(data);
  const RiskIcon = riskInfo.icon;

  // --- SOL SAYFA: BULGU DETAYI ---
  const LeftPage = () => (
    <article 
      className={cn(
        "relative p-12 md:p-16 transition-all duration-500",
        // MOD AYRIMI: 
        // Book: Sabit yükseklik, scroll içeride, sağ köşe düz (cilt), border yok
        // Flow: Otomatik yükseklik, scroll yok, tam yuvarlak köşe, derin gölge
        layout === 'book' 
          ? "h-full overflow-y-auto custom-scrollbar rounded-l-2xl" 
          : "h-auto rounded-xl shadow-xl border border-stone-100/50 hover:shadow-2xl transition-shadow"
      )}
      style={paperStyle}
    >
      {/* Header */}
      <header className="mb-12 border-b-2 border-black/10 pb-6">
        {/* Top Row: Ref & Risk Badge */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex flex-col gap-2">
            <span className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border w-fit",
              riskInfo.classes
            )}>
              <RiskIcon size={12} />
              {riskInfo.label} RİSK
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-40 ml-1">
              REF: {data.id?.toUpperCase()}
            </span>
          </div>
          <Bookmark size={24} className="opacity-10 text-slate-900" />
        </div>
        
        <h1 className="font-serif text-4xl md:text-5xl font-bold leading-[1.1] mb-6 text-slate-900">
          {data.title || 'Başlıksız Bulgu'}
        </h1>
        
        {/* Risk Scores */}
        <div className="flex flex-wrap gap-3 text-xs font-medium opacity-60">
           <span className="flex items-center gap-1 px-2 py-1 bg-black/5 rounded">
             <AlertTriangle size={12} /> Etki: {data.impact}/5
           </span>
           <span className="flex items-center gap-1 px-2 py-1 bg-black/5 rounded">
             <Target size={12} /> Olasılık: {data.likelihood}/5
           </span>
        </div>
      </header>

      {/* 5C İçerik */}
      <div className="space-y-2">
        <SectionBlock title="Kriter" icon={Scale} content={data.criteria} colorClass="text-blue-600" />
        <SectionBlock title="Tespit" icon={Search} content={data.condition} colorClass="text-amber-600" />
        <SectionBlock title="Kök Neden" icon={GitPullRequestArrow} content={data.cause} colorClass="text-rose-600" />
        <SectionBlock title="Risk / Etki" icon={AlertTriangle} content={data.consequence} colorClass="text-orange-600" />
        <SectionBlock title="Öneri" icon={CheckCircle2} content={data.corrective_action} colorClass="text-emerald-600" />
      </div>

      {/* Footer Decoration */}
      <div className="mt-16 flex justify-center opacity-10">
        <Quote size={32} />
      </div>
    </article>
  );

  // --- SAĞ SAYFA: AKSİYON PLANI ---
  const RightPage = () => (
    <aside 
      className={cn(
        "relative p-10 transition-all duration-500 flex flex-col",
        // MOD AYRIMI
        layout === 'book' 
          ? "h-full overflow-y-auto custom-scrollbar rounded-r-2xl" 
          : "h-auto rounded-xl shadow-xl border border-stone-100/50 hover:shadow-2xl transition-shadow mt-8"
      )}
      style={layout === 'book' ? paperStyle : { backgroundColor: '#fff' }}
    >
      <div className="mb-8 pb-4 border-b border-black/5">
        <h3 className="font-sans font-bold text-sm uppercase tracking-widest opacity-50 flex items-center gap-2">
          <Target size={16} /> Yönetim Aksiyon Planı
        </h3>
      </div>

      <div className="space-y-6 flex-1">
        {/* Sorumlu Kartı */}
        <div className="p-4 bg-black/5 rounded-lg border border-black/5">
          <div className="grid grid-cols-2 gap-4">
             <div>
               <div className="text-[10px] uppercase opacity-50 mb-1">Sorumlu</div>
               <div className="font-serif text-sm font-semibold">Ahmet Yılmaz</div>
             </div>
             <div>
               <div className="text-[10px] uppercase opacity-50 mb-1">Vade</div>
               <div className="font-serif text-sm font-semibold">
                 {data.target_date ? format(new Date(data.target_date), 'dd MMM yyyy', {locale: tr}) : '-'}
               </div>
             </div>
          </div>
        </div>

        {/* Notlar */}
        <div className="prose prose-sm prose-slate max-w-none">
           <h4 className="font-serif font-bold opacity-80">Alınacak Aksiyonlar</h4>
           <p className="opacity-70 italic">
             {data.action_plan_description || "Henüz bir aksiyon planı girilmemiştir."}
           </p>
        </div>
      </div>
      
      {/* Page Number Mock */}
      <div className="mt-auto pt-8 text-center text-xs opacity-30 font-mono">
         Sayfa 2 / 2
      </div>
    </aside>
  );

  // --- RENDER LAYOUT ---
  
  if (layout === 'book') {
    return (
      // Fix: Gölgeler artık scrollable alanın (Page) dışında, sabit container içinde.
      <div className="flex w-full h-[calc(100vh-140px)] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] rounded-2xl overflow-hidden gap-0 border border-stone-200/50 my-4 transform transition-transform hover:-translate-y-1 duration-500 bg-transparent relative">
        
        {/* LEFT PANE CONTAINER */}
        <div className="w-1/2 h-full relative z-10">
           {/* SOL GÖLGE (Spine - Content scroll edince kaybolmasın diye burada) */}
           <div className="absolute top-0 right-0 bottom-0 w-16 bg-gradient-to-l from-black/10 via-black/5 to-transparent pointer-events-none z-20 mix-blend-multiply" />
           <LeftPage />
        </div>

        {/* RIGHT PANE CONTAINER */}
        <div className="w-1/2 h-full relative z-0">
           {/* SAĞ GÖLGE (Spine) */}
           <div className="absolute top-0 left-0 bottom-0 w-16 bg-gradient-to-r from-black/10 via-black/5 to-transparent pointer-events-none z-20 mix-blend-multiply" />
           <RightPage />
        </div>

      </div>
    );
  }

  // Flow Layout (Sonsuz Akış)
  return (
    <div className="max-w-3xl mx-auto pb-20 space-y-12">
       <LeftPage />
       <RightPage />
    </div>
  );
};