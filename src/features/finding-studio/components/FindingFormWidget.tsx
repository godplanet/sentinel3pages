import React, { useState } from 'react';
import { 
  Activity, 
  Tags, 
  Building, 
  AlertTriangle, 
  Layers, 
  X, 
  GitPullRequestArrow,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/shared/utils/cn';

// --- Types ---
interface FindingFormWidgetProps {
  finding: any; // ComprehensiveFinding
  onUpdate: (field: string, value: any) => void;
}

// --- Mock Data ---
const CATEGORIES = [
  'Bilgi Teknolojileri (IT)',
  'Kredi Riski',
  'Operasyonel Risk',
  'Uyum ve Mevzuat',
  'İnsan Kaynakları',
  'Finansal Raporlama'
];

const DEPARTMENTS = [
  'Genel Müdürlük',
  'Yazılım Geliştirme',
  'Sistem ve Ağ Yönetimi',
  'Krediler Tahsis',
  'Şube Operasyonları'
];

// --- Helpers ---
const getRiskColor = (score: number) => {
  if (score >= 20) return 'text-rose-600 bg-rose-50 border-rose-200 ring-rose-100'; // Critical (Veto)
  if (score >= 12) return 'text-orange-600 bg-orange-50 border-orange-200 ring-orange-100'; // High
  if (score >= 6) return 'text-amber-600 bg-amber-50 border-amber-200 ring-amber-100'; // Medium
  return 'text-emerald-600 bg-emerald-50 border-emerald-200 ring-emerald-100'; // Low
};

const getRiskLabel = (score: number) => {
  if (score >= 20) return 'KRİTİK (VETO)';
  if (score >= 12) return 'YÜKSEK';
  if (score >= 6) return 'ORTA';
  return 'DÜŞÜK';
};

export const FindingFormWidget: React.FC<FindingFormWidgetProps> = ({ finding, onUpdate }) => {
  // Local state for Tag Input
  const [tagInput, setTagInput] = useState('');

  // Derived Values
  const impact = finding.impact || 1;
  const likelihood = finding.likelihood || 1;
  const controlEffectiveness = finding.control_effectiveness || 1; // 1: Güçlü, 3: Zayıf
  const riskScore = impact * likelihood;
  const isVetoed = riskScore > 20;

  const riskColorClass = getRiskColor(riskScore);

  // Handlers
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      const currentTags = finding.tags || [];
      if (!currentTags.includes(tagInput.trim())) {
        onUpdate('tags', [...currentTags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = finding.tags || [];
    onUpdate('tags', currentTags.filter((t: string) => t !== tagToRemove));
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 border-r border-slate-200 w-full lg:max-w-xs overflow-y-auto">
      
      {/* --- 1. RISK ENGINE COCKPIT --- */}
      <div className="p-6 border-b border-slate-200 bg-white relative overflow-hidden group">
        
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <Activity size={18} className="text-slate-400" />
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Risk Motoru
          </h3>
        </div>

        {/* Dynamic Gauge */}
        <div className="flex justify-center mb-8 relative">
          <div 
            className={cn(
              "w-32 h-32 rounded-full border-[6px] flex flex-col items-center justify-center transition-all duration-500",
              riskColorClass,
              isVetoed ? "animate-pulse shadow-[0_0_20px_rgba(244,63,94,0.4)]" : "shadow-sm"
            )}
          >
            <span className="text-4xl font-black tracking-tighter transition-all">
              {riskScore}
            </span>
            <span className="text-[10px] font-bold uppercase mt-1 tracking-wider opacity-80">
              {getRiskLabel(riskScore)}
            </span>
          </div>

          {/* Shockwave Effect for Veto */}
          {isVetoed && (
             <div className="absolute inset-0 rounded-full border-4 border-rose-500/30 animate-ping pointer-events-none" />
          )}
        </div>

        {/* Sliders */}
        <div className="space-y-6">
          
          {/* Impact Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium text-slate-600">
              <span>Etki (Impact)</span>
              <span className="text-slate-900 font-bold">{impact}</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="5" 
              step="1"
              value={impact}
              onChange={(e) => onUpdate('impact', parseInt(e.target.value))}
              className={cn(
                "w-full h-2 rounded-lg appearance-none cursor-pointer transition-colors accent-indigo-600 bg-slate-200",
              )}
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium px-1">
              <span>Önemsiz</span>
              <span>Felaket</span>
            </div>
          </div>

          {/* Likelihood Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium text-slate-600">
              <span>Olasılık (Likelihood)</span>
              <span className="text-slate-900 font-bold">{likelihood}</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="5" 
              step="1"
              value={likelihood}
              onChange={(e) => onUpdate('likelihood', parseInt(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-200 accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium px-1">
              <span>Nadir</span>
              <span>Kesin</span>
            </div>
          </div>
          
           {/* Control Effectiveness (Optional Metadata) */}
           <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex justify-between text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1">Kontrol Etkinliği <HelpCircle size={10} /></span>
              <span className="text-slate-700 font-bold">{controlEffectiveness}/3</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="3" 
              step="1"
              value={controlEffectiveness}
              onChange={(e) => onUpdate('control_effectiveness', parseInt(e.target.value))}
              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-200 accent-slate-500"
            />
             <div className="flex justify-between text-[10px] text-slate-400 px-1">
              <span>Güçlü</span>
              <span>Zayıf</span>
            </div>
          </div>

        </div>
      </div>

      {/* --- 2. METADATA FORM --- */}
      <div className="p-6 space-y-6 flex-1">
        
        {/* Category */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Layers size={14} /> Kategori
          </label>
          <select 
            value={finding.category || ''}
            onChange={(e) => onUpdate('category', e.target.value)}
            className="w-full text-sm p-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm transition-all"
          >
            <option value="">Seçiniz...</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Department */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
             <Building size={14} /> İlgili Departman
          </label>
          <select 
            value={finding.department || ''}
            onChange={(e) => onUpdate('department', e.target.value)}
            className="w-full text-sm p-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm transition-all"
          >
            <option value="">Seçiniz...</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Tags (Interactive) */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
             <Tags size={14} /> Etiketler
          </label>
          <div className="bg-white border border-slate-200 rounded-lg p-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
            <div className="flex flex-wrap gap-2 mb-2">
              {(finding.tags || []).map((tag: string) => (
                <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="hover:text-rose-500">
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
            <input 
              type="text" 
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Etiket ekle + Enter"
              className="w-full text-xs outline-none bg-transparent placeholder:text-slate-300"
            />
          </div>
        </div>

      </div>

      {/* --- 3. ACTIONS FOOTER --- */}
      <div className="p-4 border-t border-slate-200 bg-white">
        <button 
          onClick={() => console.log('Open Root Cause Tool')}
          className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wide rounded-lg border border-slate-200 flex items-center justify-center gap-2 transition-colors active:scale-95"
        >
          <GitPullRequestArrow size={16} />
          Kök Neden Analizi Başlat
        </button>

        {isVetoed && (
          <div className="mt-3 p-2 bg-rose-50 border border-rose-100 rounded text-[10px] text-rose-600 flex items-start gap-2 leading-tight">
            <AlertTriangle size={12} className="shrink-0 mt-0.5" />
            <span>
              <strong>Dikkat:</strong> 20 puan üzeri riskler otomatik olarak Yönetim Kurulu gündemine alınır.
            </span>
          </div>
        )}
      </div>

    </div>
  );
};