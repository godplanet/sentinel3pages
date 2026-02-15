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
  Bookmark
} from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

// --- Types ---
interface ZenReaderWidgetProps {
  data: any; // ComprehensiveFinding type
  layout: 'flow' | 'book';
  warmth?: number; // 0 (White) - 50 (Warm Sepia)
}

// --- Helper: Dynamic Paper Color ---
// Sıcaklık değerine göre Beyaz -> Krem/Sepia geçişi sağlar
const getPaperStyle = (warmth: number = 0) => {
  // Base: White (255, 255, 255) -> Target: Warm Beige (253, 246, 227)
  const r = 255 - (warmth * 0.04); // Min change
  const g = 255 - (warmth * 0.18); 
  const b = 255 - (warmth * 0.56); 
  
  return {
    backgroundColor: `rgb(${r}, ${g}, ${b})`,
    color: '#1e293b' // Slate-800 for high contrast text
  };
};

// --- Sub-Component: Typography Section Block ---
const SectionBlock = ({ 
  title, 
  icon: Icon, 
  content, 
  colorClass = "text-slate-400" 
}: { 
  title: string; 
  icon: any; 
  content: string; 
  colorClass?: string; 
}) => {
  if (!content) return null;

  return (
    <section className="mb-10 group">
      <div className="flex items-center gap-3 mb-3 border-b border-slate-100 pb-2">
        <Icon size={18} className={cn("transition-colors", colorClass)} />
        <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-slate-400">
          {title}
        </h3>
      </div>
      <div 
        className="font-serif text-lg leading-loose text-slate-800 prose prose-slate max-w-none"
        dangerouslySetInnerHTML={{ __html: content }} 
      />
    </section>
  );
};

// --- Sub-Component: Action Plan Card (Compact View) ---
const ActionPlanView = ({ data }: { data: any }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm h-full flex flex-col">
    <div className="flex items-center gap-2 mb-6 text-indigo-900 border-b border-indigo-50 pb-4">
      <Target size={20} className="text-indigo-600" />
      <h3 className="font-sans font-bold text-sm uppercase tracking-wide">Yönetim Aksiyon Planı</h3>
    </div>

    <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
      {/* Meta Data */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <User size={12} /> Sorumlu
          </div>
          <div className="text-sm font-semibold text-slate-700">Ahmet Yılmaz</div>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Calendar size={12} /> Termin
          </div>
          <div className="text-sm font-semibold text-slate-700">
            {data.target_date 
              ? format(new Date(data.target_date), 'dd MMM yyyy', { locale: tr }) 
              : 'Belirlenmedi'}
          </div>
        </div>
      </div>

      {/* Action Steps */}
      <div>
        <h4 className="text-xs font-bold text-slate-500 mb-2">Planlanan Adımlar</h4>
        <div className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100 italic">
          {data.corrective_action || "Henüz bir aksiyon planı girilmemiştir."}
        </div>
      </div>

      {/* History / Audit Trail Mock */}
      <div className="pt-4 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-400 mb-2">Tarihçe</h4>
        <ul className="space-y-3">
          <li className="text-xs text-slate-500 flex gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5" />
            <span>Bulgu taslağı oluşturuldu (12 Şub)</span>
          </li>
          <li className="text-xs text-slate-500 flex gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5" />
            <span>Risk analizi tamamlandı (14 Şub)</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
);

// ============================================================================
// MAIN WIDGET
// ============================================================================

export const ZenReaderWidget: React.FC<ZenReaderWidgetProps> = ({ 
  data, 
  layout, 
  warmth = 20 
}) => {
  const paperStyle = getPaperStyle(warmth);

  // Common Paper Content (Reused in both layouts)
  const PaperContent = () => (
    <article 
      className={cn(
        "relative p-12 md:p-16 rounded-xl shadow-sm border border-stone-200/60 transition-colors duration-500",
        "selection:bg-yellow-200/50"
      )}
      style={paperStyle}
    >
      {/* Decorative Top Gradient (Simulating slight paper curve/shadow) */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/[0.02] to-transparent pointer-events-none rounded-t-xl" />

      {/* Header */}
      <header className="mb-12 border-b-2 border-slate-900 pb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-xs text-slate-400 font-bold tracking-widest">
            REF: {data.id.toUpperCase()}
          </span>
          <Bookmark size={16} className="text-slate-300" />
        </div>
        
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-4">
          {data.title || 'İsimsiz Bulgu'}
        </h1>
        
        <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
          <span className="px-2 py-1 bg-slate-900 text-white text-xs rounded">
            {data.riskLevel || 'Risk Analizi Yok'}
          </span>
          <span>•</span>
          <span>Etki: {data.impact}/5</span>
          <span>•</span>
          <span>Olasılık: {data.likelihood}/5</span>
        </div>
      </header>

      {/* The 5C Content Flow */}
      <div className="space-y-2">
        <SectionBlock 
          title="1. KRİTER (Criteria)" 
          icon={Scale} 
          content={data.criteria}
          colorClass="text-blue-500"
        />
        
        <SectionBlock 
          title="2. TESPİT (Condition)" 
          icon={Search} 
          content={data.condition}
          colorClass="text-amber-500"
        />
        
        <SectionBlock 
          title="3. KÖK NEDEN (Cause)" 
          icon={GitPullRequestArrow} 
          content={data.cause}
          colorClass="text-rose-500"
        />
        
        <SectionBlock 
          title="4. ETKİ / RİSK (Consequence)" 
          icon={AlertTriangle} 
          content={data.consequence}
          colorClass="text-orange-500"
        />
        
        <SectionBlock 
          title="5. ÖNERİ (Recommendation)" 
          icon={CheckCircle2} 
          content={data.corrective_action} // Öneri kısmı genelde buraya map edilir veya ayrı bir alandır
          colorClass="text-emerald-600"
        />
      </div>

      {/* Footer / End Mark */}
      <div className="mt-16 flex justify-center opacity-30">
        <div className="w-16 h-1 bg-slate-900 rounded-full" />
      </div>
    </article>
  );

  // --- LAYOUT RENDERING ---

  // SCENARIO 1: BOOK LAYOUT (Split View)
  if (layout === 'book') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-140px)]">
        {/* Left Page: Finding (Scrollable) */}
        <div className="h-full overflow-y-auto pr-2 custom-scrollbar pb-10">
          <PaperContent />
        </div>
        
        {/* Right Page: Action Plan (Sticky/Fixed) */}
        <div className="h-full pb-10">
          <ActionPlanView data={data} />
        </div>
      </div>
    );
  }

  // SCENARIO 2: FLOW LAYOUT (Single Column)
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <PaperContent />
      
      {/* In Flow layout, Action Plan comes after the paper */}
      <div className="border-t border-dashed border-slate-300 pt-10">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-center font-sans font-bold text-slate-400 uppercase tracking-widest mb-8">
            — Yönetim Aksiyon Planı —
          </h2>
          <div className="h-auto">
             <ActionPlanView data={data} />
          </div>
        </div>
      </div>
    </div>
  );
};