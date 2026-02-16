import React, { useEffect } from 'react';
import * as Icons from 'lucide-react'; 
import { cn } from '@/shared/utils/cn';

// --- Stores & Hooks ---
import { useMethodologyStore } from '@/features/admin/methodology/model/store';
import { useFindingStudio, ComprehensiveFinding } from '@/features/finding-studio/hooks/useFindingStudio';

// --- Shared UI Components ---
import { RichTextEditor } from '@/shared/ui/RichTextEditor'; 
// Root Cause Engine (Varsa import et, yoksa RichTextEditor fallback yap)
import { RootCauseEngine } from '@/features/finding-studio/components/RootCauseEngine';

// --- Types ---
interface ZenEditorProps {
  finding: ComprehensiveFinding;
}

// Renk Temaları (5C Metodolojisine göre görsel kodlama)
const SECTION_THEMES: Record<string, string> = {
  criteria: 'border-l-blue-500 bg-blue-50/30', 
  condition: 'border-l-amber-500 bg-amber-50/30', 
  cause: 'border-l-rose-500 bg-rose-50/30', 
  consequence: 'border-l-orange-500 bg-orange-50/30', 
  corrective_action: 'border-l-emerald-500 bg-emerald-50/30', 
};

// Yardımcı: Lucide string isminden bileşen üretme
const DynamicIcon = ({ name, className }: { name: string; className?: string }) => {
  const IconComponent = (Icons as any)[name] || Icons.HelpCircle;
  return <IconComponent className={className} size={20} />;
};

export const ZenEditor: React.FC<ZenEditorProps> = ({ finding }) => {
  // 1. Store Connections
  const { findingSections, fetchConfig, isLoading } = useMethodologyStore();
  const { updateField } = useFindingStudio();

  // 2. Initial Fetch
  useEffect(() => {
    if (findingSections.length === 0) {
      fetchConfig();
    }
  }, [fetchConfig, findingSections.length]);

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse p-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-slate-100 rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-12 relative">
      {/* Sol taraftaki Timeline Çizgisi */}
      <div className="absolute left-[19px] top-4 bottom-12 w-0.5 bg-slate-200 -z-10" />

      {findingSections
        .filter((section) => section.is_active)
        .sort((a, b) => a.order - b.order)
        .map((section, index) => {
          
          // Theme Determination
          const themeClass = SECTION_THEMES[section.key] || 'border-l-slate-300 bg-slate-50';
          const isRootCauseSection = section.key === 'cause';
          
          // Current Value (Dynamic Access)
          const currentValue = finding[section.key as keyof ComprehensiveFinding] || '';

          return (
            <div 
              key={section.id} 
              className={cn(
                "group relative pl-4 transition-all duration-300",
                "hover:translate-x-1"
              )}
            >
              {/* --- Section Header --- */}
              <div className="flex items-center gap-3 mb-3">
                {/* Icon Bubble */}
                <div 
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border bg-white shadow-sm z-10 transition-colors",
                    isRootCauseSection ? "border-rose-200 text-rose-600" : "border-slate-200 text-slate-500 group-hover:border-indigo-300 group-hover:text-indigo-600"
                  )}
                >
                  <DynamicIcon name={section.icon} />
                </div>

                {/* Title & Metadata */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                      {section.label.tr}
                    </h3>
                    {section.required && (
                      <span className="text-rose-500 text-lg leading-none" title="Zorunlu Alan">*</span>
                    )}
                    {section.is_ai_supported && (
                      <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-100 text-indigo-600 border border-indigo-200 flex items-center gap-1">
                        <Icons.Sparkles size={8} /> AI
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 font-light">
                    {index + 1}. Adım
                  </span>
                </div>
              </div>

              {/* --- Editor Area --- */}
              <div 
                className={cn(
                  "ml-5 p-4 rounded-xl border-l-4 transition-all shadow-sm group-hover:shadow-md",
                  themeClass,
                  "bg-white border-slate-200 border-l-slate-300" 
                )}
                style={{ borderLeftColor: isRootCauseSection ? '#f43f5e' : undefined }}
              >
                {/* Kök Neden Analizi için Özel Motor, Diğerleri için Standart Editör */}
                {isRootCauseSection ? (
                   <RootCauseEngine
                     initialValue={currentValue}
                     onChange={(val) => updateField(section.key, val)}
                     placeholder={section.placeholder.tr}
                     findingId={finding.id}
                   />
                ) : (
                  <RichTextEditor
                    value={currentValue}
                    onChange={(val) => updateField(section.key, val)}
                    placeholder={section.placeholder.tr}
                    minHeight="120px"
                    className="prose-sm focus:outline-none"
                  />
                )}

                {/* Helper Text */}
                {!currentValue && !isRootCauseSection && (
                   <p className="mt-2 text-xs text-slate-400 italic flex items-center gap-1">
                     <Icons.Info size={12} />
                     İpucu: {section.placeholder.tr}
                   </p>
                )}
              </div>
            </div>
          );
        })}
       
       {/* Akış Sonu İndikatörü */}
       <div className="flex items-center gap-3 pl-4 opacity-50 mt-8">
          <div className="w-10 h-10 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center">
            <div className="w-3 h-3 bg-slate-300 rounded-full" />
          </div>
          <span className="text-sm text-slate-400 font-medium">Akış Sonu</span>
       </div>
    </div>
  );
};