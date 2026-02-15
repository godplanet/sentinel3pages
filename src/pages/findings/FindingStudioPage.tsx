import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  Share2, 
  MoreVertical,
  Activity,
  Maximize2
} from 'lucide-react';

// Internal Architecture Imports
import { useUIStore } from '@/shared/stores/ui-store';
import { Button } from '@/shared/ui/Button'; // Assuming generic button exists or use standard HTML
import { GlassCard } from '@/shared/ui/GlassCard';
import { PageHeader } from '@/shared/ui/PageHeader';
import { cn } from '@/lib/utils';

// Feature Components
import { FindingFormWidget } from '@/features/finding-studio/components/FindingFormWidget';
import { ZenEditor } from '@/features/finding-studio/components/ZenEditor';
import { WorkflowStatusBar } from '@/shared/ui/WorkflowStatusBar';
import { useFindingStudio } from '@/features/finding-studio/hooks/useFindingStudio';

// Global Universal Drawer (The One True Drawer)
import { UniversalFindingDrawer } from '@/widgets/UniversalFindingDrawer'; 

export const FindingStudioPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // 1. Smart Layout Integration
  const { isSidebarExpanded, sidebarColor } = useUIStore();
  
  // 2. State & Logic from Hook (Clean Architecture)
  const { 
    finding, 
    isLoading, 
    isSaving, 
    hasUnsavedChanges,
    updateField, 
    saveFinding,
    workflowStatus,
    riskScore 
  } = useFindingStudio(id);

  // Layout Calculations (Standardized with NewFindingModal logic)
  const contentLeftPosition = isSidebarExpanded ? '280px' : '80px';

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <span className="text-sm font-medium text-slate-400">Sentinel Studio Başlatılıyor...</span>
        </div>
      </div>
    );
  }

  if (!finding) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950">
        <GlassCard className="p-8 text-center">
          <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="text-xl font-bold text-white">Bulgu Bulunamadı</h2>
          <p className="mt-2 text-slate-400">Aradığınız bulgu silinmiş veya erişim yetkiniz yok.</p>
          <button 
            onClick={() => navigate('/findings')}
            className="mt-6 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
          >
            Listeye Dön
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-950 font-sans text-slate-200 selection:bg-blue-500/30">
      
      {/* 3. Dynamic Header (Visual Constitution) */}
      <div 
        className={cn(
          "fixed top-0 right-0 z-20 flex h-16 items-center justify-between border-b border-white/5 bg-slate-950/80 backdrop-blur-xl transition-all duration-300 px-6"
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
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                {finding.reference_code}
              </span>
              <span className="h-1 w-1 rounded-full bg-slate-600"></span>
              <span className="text-xs text-slate-400">Last saved: Just now</span>
            </div>
            <h1 className="text-lg font-semibold text-white truncate max-w-md">
              {finding.title || "Adsız Bulgu"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <WorkflowStatusBar status={workflowStatus} />
          
          <div className="h-8 w-[1px] bg-white/10 mx-2"></div>

          <button className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all">
            <Share2 className="h-4 w-4" />
            <span>Paylaş</span>
          </button>

          <button 
            onClick={saveFinding}
            disabled={isSaving || !hasUnsavedChanges}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-bold text-white transition-all shadow-lg",
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
        className="pt-24 pb-12 px-8 transition-all duration-300"
        style={{ paddingLeft: `calc(${contentLeftPosition} + 2rem)` }}
      >
        <div className="grid grid-cols-12 gap-8 max-w-[1920px] mx-auto">
          
          {/* LEFT COLUMN: Form & Logic (Risk Engine Integration) */}
          <div className="col-span-12 lg:col-span-4 xl:col-span-3 space-y-6">
            <FindingFormWidget 
              finding={finding} 
              onUpdate={updateField} 
              riskScore={riskScore}
            />
            
            {/* Quick Actions Card */}
            <GlassCard className="p-5 space-y-4">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Activity className="h-4 w-4 text-purple-400" />
                Audit Trail
              </h3>
              <div className="space-y-4 relative before:absolute before:left-1.5 before:top-2 before:h-full before:w-0.5 before:bg-white/5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="relative pl-6">
                    <div className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-slate-800 border border-slate-600"></div>
                    <p className="text-xs text-slate-300">Risk seviyesi güncellendi.</p>
                    <span className="text-[10px] text-slate-500">12:30 PM - M. Yılmaz</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* RIGHT COLUMN: The Zen Editor (Document Interface) */}
          <div className="col-span-12 lg:col-span-8 xl:col-span-9">
            <ZenEditor 
              content={finding.description} 
              onChange={(val) => updateField('description', val)}
              title={finding.title}
              onTitleChange={(val) => updateField('title', val)}
            />
          </div>

        </div>
      </div>

      {/* 5. Universal Drawer Implementation */}
      {/* This component handles logic to render itself via Portal if isOpen is true in store */}
      <UniversalFindingDrawer />

    </div>
  );
};

export default FindingStudioPage;