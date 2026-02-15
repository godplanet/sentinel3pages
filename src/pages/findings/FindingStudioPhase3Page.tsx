import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  MessageSquare, 
  FileSignature, 
  Lock, 
  Eye,
  ArrowRight
} from 'lucide-react';

// Architecture Imports
import { useUIStore } from '@/shared/stores/ui-store';
import { GlassCard } from '@/shared/ui/GlassCard';
import { cn } from '@/lib/utils';
import { useFindingStudio } from '@/features/finding-studio/hooks/useFindingStudio';

// Phase 3 Specific Components
import { NegotiationChat } from '@/features/finding-studio/components/NegotiationChat';
import { ActionPlanCard } from '@/features/finding-studio/components/ActionPlanCard';
import { FindingFormWidget } from '@/features/finding-studio/components/FindingFormWidget'; // Read-only mode
import { WorkflowStatusBar } from '@/shared/ui/WorkflowStatusBar';

export const FindingStudioPhase3Page: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isSidebarExpanded } = useUIStore();
  
  const { 
    finding, 
    isLoading, 
    riskScore, 
    slaStatus,
    advanceWorkflow 
  } = useFindingStudio(id);

  // Layout Calculations
  const contentLeftPosition = isSidebarExpanded ? '280px' : '80px';

  if (isLoading || !finding) return null;

  return (
    <div className="relative min-h-screen bg-slate-950 font-sans text-slate-200">
      
      {/* 1. Header (Negotiation Mode) */}
      <div 
        className="fixed top-0 right-0 z-20 flex h-16 items-center justify-between border-b border-indigo-500/20 bg-slate-900/90 backdrop-blur-xl transition-all duration-300 px-6 shadow-[0_0_30px_rgba(79,70,229,0.1)]"
        style={{ left: contentLeftPosition }}
      >
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono">
                PHASE 3: MÜZAKERE
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
            </div>
            <h1 className="text-sm font-medium text-white opacity-80">
              {finding.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <Lock className="h-3 w-3 text-yellow-500" />
            <span className="text-xs font-medium text-yellow-200">Denetçi Görünümü (Gizli Veriler Aktif)</span>
          </div>
          
          <WorkflowStatusBar status="NEGOTIATION" />

          <button 
            onClick={() => advanceWorkflow('final')}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-bold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-900/20 transition-all"
          >
            <span>Mutabakatı Tamamla</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 2. Main Workspace (Split View) */}
      <div 
        className="pt-24 pb-12 px-8 transition-all duration-300 min-h-screen grid grid-cols-12 gap-8"
        style={{ paddingLeft: `calc(${contentLeftPosition} + 2rem)` }}
      >
        
        {/* LEFT: Context & Read-Only Finding (The "Fact" Sheet) */}
        <div className="col-span-12 xl:col-span-4 space-y-6 h-fit sticky top-24">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="h-4 w-4 text-slate-400" />
            <h3 className="text-xs font-bold text-slate-500 uppercase">Denetlenen Ne Görüyor?</h3>
          </div>
          
          {/* Read-Only Risk Widget */}
          <div className="opacity-90 pointer-events-none grayscale-[30%]">
             <FindingFormWidget 
               finding={finding} 
               onUpdate={() => {}} 
               riskScore={riskScore} 
             />
          </div>

          <GlassCard className="p-5 border-yellow-500/30 bg-yellow-500/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 bg-yellow-500/20 rounded-bl-lg border-b border-l border-yellow-500/30">
                <Lock className="h-3 w-3 text-yellow-500" />
            </div>
            <h3 className="text-sm font-bold text-yellow-500 mb-2">Gizli Denetçi Notları</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Bu bulgu için yönetim kuruluna "Kritik" raporlama yapılması önerilmektedir. 
              Denetlenen birim bütçe kısıtını mazeret gösterebilir, ancak mevzuat gereği bu kabul edilemez.
            </p>
          </GlassCard>
        </div>

        {/* RIGHT: Negotiation Stream (The "Action" Zone) */}
        <div className="col-span-12 xl:col-span-8 space-y-6">
          
          {/* A. Action Plan Proposal (From Auditee) */}
          <ActionPlanCard 
            status="proposal" // 'proposal' | 'accepted' | 'rejected'
            auditeeName="Ahmet Yılmaz (IT Md.)"
            proposedDate="2026-05-15"
            content="Firewall kurallarını ISO 27001 standardına göre 3 ay içinde güncellemeyi taahhüt ediyoruz."
          />

          {/* B. Negotiation Chat Stream */}
          <div className="relative">
            <div className="absolute -left-3 top-0 bottom-0 w-0.5 bg-indigo-500/10"></div>
            <NegotiationChat findingId={finding.id} />
          </div>

        </div>

      </div>
    </div>
  );
};

export default FindingStudioPhase3Page;