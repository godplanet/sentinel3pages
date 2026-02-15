import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Save, 
  ArrowLeft, 
  Share2, 
  Activity,
  AlertOctagon,
  Clock,
  ShieldAlert,
  Lock
} from 'lucide-react';

// Architecture Imports
import { useUIStore } from '@/shared/stores/ui-store';
import { GlassCard } from '@/shared/ui/GlassCard';
import { cn } from '@/lib/utils';
import { useFindingStudio } from '@/features/finding-studio/hooks/useFindingStudio';

// Components
import { FindingFormWidget } from '@/features/finding-studio/components/FindingFormWidget';
import { ZenEditor } from '@/features/finding-studio/components/ZenEditor';
import { WorkflowStatusBar } from '@/shared/ui/WorkflowStatusBar';
import { UniversalFindingDrawer } from '@/widgets/UniversalFindingDrawer'; 

export const FindingStudioPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // 1. Smart Layout Integration
  const { isSidebarExpanded } = useUIStore();
  
  // 2. Logic Layer (Brain)
  const { 
    finding, 
    isLoading, 
    isSaving, 
    hasUnsavedChanges,
    updateField, 
    saveFinding,
    riskScore,
    isVetoed,
    slaStatus
  } = useFindingStudio(id);

  // Layout Calculations (Matches NewFindingModal logic)
  const contentLeftPosition = isSidebarExpanded ? '280px' : '80px';

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <span className="text-sm font-medium text-slate-400 animate-pulse">Sentinel Studio Yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (!finding) return null; // Error handled in hook via Toast

  return (
    <div className="relative min-h-screen bg-slate-950 font-sans text-slate-200 selection:bg-blue-500/30">
      
      {/* 3. Dynamic Smart Header (Visual Constitution) */}
      <div 
        className={cn(
          "fixed top-0 right-0 z-20 flex h-16 items-center justify-between border-b border-white/5 bg-slate-950/80 backdrop-blur-xl transition-all duration-300 px-6",
          isVetoed && "border-red-500/30 bg-red-950/10" // Veto Visual Feedback
        )}
        style={{ left: contentLeftPosition }}
      >
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="group rounded-full p-2 hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-400 group-hover:text-white" />
          </button>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 font-mono">
                {finding.reference_code || 'DRAFT-001'}
              </span>
              
              {/* Veto / Criticality Badge */}
              {isVetoed && (
                <span className="flex items-center gap-1 rounded bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-400 border border-red-500/30 animate-pulse">
                  <AlertOctagon className="h-3 w-3" />
                  KRİTİK VETO
                </span>
              )}

              {/* SLA Status Badge */}
              {slaStatus && (
                <span className={cn(
                  "flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold border",
                  slaStatus.isOverdue 
                    ? "bg-orange-500/20 text-orange-400 border-orange-500/30" 
                    : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                )}>
                  <Clock className="h-3 w-3" />
                  {slaStatus.label}
                </span>
              )}
            </div>
            <h1 className="text-lg font-semibold text-white truncate max-w-md">
              {finding.title || "Adsız Bulgu Başlığı"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <WorkflowStatusBar status={finding.status || 'DRAFT'} />
          
          <div className="h-8 w-[1px] bg-white/10 mx-2"></div>

          {/* Action Buttons */}
          <button className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all">
            <Share2 className="h-4 w-4" />
            <span>Paylaş</span>
          </button>

          <button 
            onClick={saveFinding}
            disabled={isSaving || !hasUnsavedChanges}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-bold text-white transition-all shadow-lg active:scale-95",
              hasUnsavedChanges 
                ? "bg-blue-600 hover:bg-blue-500 shadow-blue-900/20" 
                : "bg-slate-700 text-slate-400 cursor-not-allowed"
            )}
          >
            {isSaving ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{isSaving ? 'Kaydediliyor...' : 'Kaydet'}</span>
          </button>
        </div>
      </div>

      {/* 4. Main Content Area (Layout Container) */}
      <div 
        className="pt-24 pb-12 px-8 transition-all duration-300 min-h-screen"
        style={{ paddingLeft: `calc(${contentLeftPosition} + 2rem)` }}
      >
        <div className="grid grid-cols-12 gap-8 max-w-[1920px] mx-auto">
          
          {/* LEFT COLUMN: Risk Engine & Attributes */}
          <div className="col-span-12 lg:col-span-4 xl:col-span-3 space-y-6">
            
            {/* Risk Engine Integration */}
            <FindingFormWidget 
              finding={finding} 
              onUpdate={updateField} 
              riskScore={riskScore}
            />
            
            {/* Audit Trail (Activity Stream) */}
            <GlassCard className="p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Activity className="h-4 w-4 text-purple-400" />
                Hareket Dökümü
              </h3>
              <div className="space-y-4 relative before:absolute before:left-1.5 before:top-2 before:h-full before:w-0.5 before:bg-white/5">
                {/* Mock Trail Items */}
                <div className="relative pl-6">
                  <div className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                  <p className="text-xs text-slate-200 font-medium">Risk Puanı Güncellendi</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Etki değeri 3'ten 4'e yükseltildi.</p>
                  <span className="text-[10px] text-slate-600 block mt-1">Az önce - Sistem</span>
                </div>
              </div>
            </GlassCard>

            {/* Blind Mode Indicator Help */}
            <div className="rounded-lg border border-white/5 bg-white/5 p-3 flex items-start gap-3">
              <Lock className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-slate-300">Güvenli Mod Aktif</p>
                <p className="text-[10px] text-slate-500">Kilit simgesi olan alanlar (Denetçi Notları) denetlenen birim tarafından görülemez.</p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: The Zen Editor */}
          <div className="col-span-12 lg:col-span-8 xl:col-span-9 space-y-6">
            {/* Blind Mode Indicator for Title */}
            <div className="relative group">
               <div className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <div className="tooltip bg-slate-800 text-xs text-white px-2 py-1 rounded">Public Visible</div>
               </div>
               <ZenEditor 
                content={finding.description} 
                onChange={(val) => updateField('description', val)}
                title={finding.title}
                onTitleChange={(val) => updateField('title', val)}
              />
            </div>
          </div>

        </div>
      </div>

      {/* 5. Universal Drawer (Rendered via Portal) */}
      <UniversalFindingDrawer />

    </div>
  );
};

export default FindingStudioPage;