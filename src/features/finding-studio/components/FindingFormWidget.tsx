import React from 'react';
import { 
  Info, 
  TrendingUp, 
  ShieldAlert, 
  Scale, 
  GitBranch, 
  BookOpen
} from 'lucide-react';
import { GlassCard } from '@/shared/ui/GlassCard';
import { cn } from '@/lib/utils';
import { Finding, RiskScore } from '@/entities/finding/model/types';
import { useUIStore } from '@/shared/stores/ui-store'; // To trigger drawers

interface FindingFormWidgetProps {
  finding: Finding;
  onUpdate: (field: keyof Finding, value: any) => void;
  riskScore: RiskScore;
}

export const FindingFormWidget: React.FC<FindingFormWidgetProps> = ({ 
  finding, 
  onUpdate,
  riskScore 
}) => {
  const { openDrawer } = useUIStore(); // Hook to open specific drawers

  // Visual Constitution: Risk Colors
  const getRiskColor = (score: number) => {
    if (score >= 20) return "text-red-500 border-red-500/50 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.3)]";
    if (score >= 12) return "text-orange-500 border-orange-500/50 bg-orange-500/10 shadow-[0_0_15px_rgba(249,115,22,0.3)]";
    if (score >= 6) return "text-yellow-500 border-yellow-500/50 bg-yellow-500/10 shadow-[0_0_15px_rgba(234,179,8,0.3)]";
    return "text-emerald-500 border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.3)]";
  };

  const getRiskLabel = (score: number) => {
    if (score >= 20) return "KRİTİK";
    if (score >= 12) return "YÜKSEK";
    if (score >= 6) return "ORTA";
    return "DÜŞÜK";
  };

  return (
    <GlassCard className="p-6 space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
      
      {/* 1. Category Selection */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Info className="h-3 w-3" />
          Bulgu Kategorisi
        </label>
        <select
          value={finding.category || ''}
          onChange={(e) => onUpdate('category', e.target.value)}
          className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer hover:bg-slate-900"
        >
          <option value="" disabled>Kategori Seçiniz...</option>
          <option value="IT_SECURITY">Bilgi Güvenliği & Siber Risk</option>
          <option value="COMPLIANCE">Yasal Uyum (Mevzuat)</option>
          <option value="OPERATIONAL">Operasyonel Süreçler</option>
          <option value="FINANCIAL">Finansal Raporlama</option>
          <option value="SHARIAH">Katılım Finans (Şer'i) Uyum</option>
        </select>
      </div>

      {/* 2. Live Risk Engine (WIF Integration) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <ShieldAlert className="h-3 w-3" />
            Risk Matrisi
          </label>
          
          {/* Dynamic Score Badge */}
          <div className={cn(
            "px-3 py-1 rounded-full text-xs font-black border transition-all duration-300 flex items-center gap-2",
            getRiskColor(riskScore.total)
          )}>
            <TrendingUp className="h-3 w-3" />
            {getRiskLabel(riskScore.total)} ({riskScore.total})
          </div>
        </div>

        {/* Impact Slider */}
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-300 font-medium">Etki Değeri (Impact)</span>
            <span className="font-mono text-blue-400 font-bold bg-blue-500/10 px-2 rounded">{finding.impact_score || 1}</span>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={finding.impact_score || 1}
            onChange={(e) => onUpdate('impact_score', parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
          />
          <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold tracking-wider">
            <span>Önemsiz</span>
            <span>Kritik</span>
          </div>
        </div>

        {/* Probability Slider */}
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-300 font-medium">Olasılık (Likelihood)</span>
            <span className="font-mono text-purple-400 font-bold bg-purple-500/10 px-2 rounded">{finding.likelihood_score || 1}</span>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={finding.likelihood_score || 1}
            onChange={(e) => onUpdate('likelihood_score', parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400 transition-all"
          />
          <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold tracking-wider">
            <span>Nadir</span>
            <span>Kesin</span>
          </div>
        </div>

        {/* Control Efficiency (Buttons) */}
        <div className="space-y-3 pt-2">
           <label className="text-xs font-semibold text-slate-400 flex items-center gap-2">
             <Scale className="h-3 w-3" />
             Kontrol Etkinliği
           </label>
           <div className="grid grid-cols-3 gap-2">
             {[
               { val: 1, label: 'Güçlü', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
               { val: 2, label: 'Kısmi', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
               { val: 3, label: 'Zayıf', color: 'bg-red-500/20 text-red-400 border-red-500/30' }
             ].map((opt) => (
               <button
                 key={opt.val}
                 onClick={() => onUpdate('control_effectiveness', opt.val)}
                 className={cn(
                   "py-2 px-1 text-xs font-bold rounded border transition-all duration-200",
                   finding.control_effectiveness === opt.val 
                    ? opt.color + " shadow-[0_0_10px_rgba(0,0,0,0.2)] scale-[1.02]" 
                    : "bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-400"
                 )}
               >
                 {opt.label}
               </button>
             ))}
           </div>
        </div>
      </div>

      {/* 3. Action Triggers (Smart Drawer Connections) */}
      <div className="pt-4 border-t border-white/5 space-y-2">
        
        {/* RCA Trigger */}
        <button 
          onClick={() => openDrawer('rca', { findingId: finding.id })}
          className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-900/50 hover:bg-slate-800 transition-colors group border border-white/5 hover:border-blue-500/30"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-blue-500/10 text-blue-400 group-hover:text-blue-300">
              <GitBranch className="h-4 w-4" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-slate-200">Kök Neden Analizi</p>
              <p className="text-[10px] text-slate-500">5 Neden / Balık Kılçığı</p>
            </div>
          </div>
          <div className="h-2 w-2 rounded-full bg-slate-700 group-hover:bg-blue-500 transition-colors"></div>
        </button>

        {/* Regulation/Compliance Library Trigger */}
        <button 
          onClick={() => openDrawer('compliance', { findingId: finding.id })}
          className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-900/50 hover:bg-slate-800 transition-colors group border border-white/5 hover:border-purple-500/30"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-purple-500/10 text-purple-400 group-hover:text-purple-300">
              <BookOpen className="h-4 w-4" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-slate-200">Mevzuat Eşleştirme</p>
              <p className="text-[10px] text-slate-500">BDDK / COBIT / ISO</p>
            </div>
          </div>
          <div className="h-2 w-2 rounded-full bg-slate-700 group-hover:bg-purple-500 transition-colors"></div>
        </button>

      </div>

    </GlassCard>
  );
};