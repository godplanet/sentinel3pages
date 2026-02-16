import React from 'react';
import { 
  Scale, 
  Search, 
  GitPullRequestArrow, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  User, 
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

  // --- SOL SAYFA: BULGU DETAYI ---
  const LeftPage = () => (
    <article 
      className={cn(
        "relative p-12 md:p-16 h-full overflow-y-auto custom-scrollbar transition-colors duration-500",
        // Kitap modunda sağ kenar düz, sol kenar yuvarlak
        layout === 'book' ? "rounded-l-2xl border-r-0" : "rounded-xl shadow-sm border"
      )}
      style={paperStyle}
    >
      {/* Kitap Modu İçin Orta Gölge (Spine) */}
      {layout === 'book' && (
        <div className="absolute top-0 right-0 bottom-0 w-12 bg-gradient-to-l from-black/5 to-transparent pointer-events-none z-10" />
      )}

      {/* Header */}
      <header className="mb-12 border-b-2 border-black/10 pb-6">
        <div className="flex items-center justify-between mb-6">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-40">
            REF: {data.id?.toUpperCase()}
          </span>
          <Bookmark size={18} className="opacity-20" />
        </div>
        
        <h1 className="font-serif text-4xl md:text-5xl font-bold leading-[1.1] mb-6 text-slate-900">
          {data.title || 'Başlıksız Bulgu'}
        </h1>
        
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
        "relative p-10 h-full overflow-y-auto custom-scrollbar transition-colors duration-500 flex flex-col",
        // Kitap modunda sol kenar düz, sağ kenar yuvarlak
        layout === 'book' ? "rounded-r-2xl border-l-0" : "rounded-xl mt-8 border"
      )}
      style={layout === 'book' ? paperStyle : { backgroundColor: '#fff' }}
    >
      {/* Kitap Modu İçin Orta Gölge (Spine - Sol Taraf) */}
      {layout === 'book' && (
        <div className="absolute top-0 left-0 bottom-0 w-12 bg-gradient-to-r from-black/5 to-transparent pointer-events-none z-10" />
      )}

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
      <div className="flex w-full h-[calc(100vh-140px)] shadow-2xl rounded-2xl overflow-hidden border border-stone-200/50">
        <div className="w-1/2 h-full border-r border-black/5 relative">
           <LeftPage />
        </div>
        <div className="w-1/2 h-full relative">
           <RightPage />
        </div>
      </div>
    );
  }

  // Flow Layout
  return (
    <div className="max-w-3xl mx-auto pb-20 space-y-8">
       <LeftPage />
       <RightPage />
    </div>
  );
};