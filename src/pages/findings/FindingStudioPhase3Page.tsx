import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FileText, AlertCircle, Plus, ArrowLeft, Save, 
  CheckCircle2, Scale, Users 
} from 'lucide-react';
import clsx from 'clsx';

// --- MİMARİ BAĞLANTILAR (Single Source of Truth) ---
import { mockComprehensiveFindings } from '@/entities/finding/api/mock-comprehensive-data';
import type { ComprehensiveFinding, ActionPlan } from '@/entities/finding/model/types';
import { useParameterStore } from '@/shared/stores/parameter-store';

// --- BİLEŞENLER ---
import { ViewSwitcher } from '@/features/finding-studio/components/ViewSwitcher';
import { WorkflowStepper } from '@/widgets/FindingStudio/WorkflowStepper';
import { UniversalFindingDrawer } from '@/widgets/UniversalFindingDrawer';
import { ActionPlanCard } from '@/features/finding-studio/components/ActionPlanCard';
import { FindingSignOff } from '@/features/finding-studio/components/FindingSignOff';

// Mock Kullanıcı Listesi (Burası ileride bir User Entity'den gelebilir)
const MOCK_USERS = [
  { id: 'u1', name: 'Ahmet Yılmaz', role: 'Kıdemli Denetçi' },
  { id: 'u2', name: 'Mehmet Kara', role: 'Şube Müdürü' },
  { id: 'u3', name: 'Ayşe Demir', role: 'Operasyon Yöneticisi' },
  { id: 'u4', name: 'Fatma Arslan', role: 'Uyum Sorumlusu' },
];

export default function FindingStudioPhase3Page() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getSeverityColor } = useParameterStore();

  // STATE YÖNETİMİ
  const [finding, setFinding] = useState<ComprehensiveFinding | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // 1. VERİ YÜKLEME
  useEffect(() => {
    const found = mockComprehensiveFindings.find(f => f.id === id) || mockComprehensiveFindings[0];
    
    if (found) {
        setFinding(found);
        // Tip dönüşümü yaparak aksiyon planlarını state'e alıyoruz
        setActionPlans(found.action_plans as unknown as ActionPlan[] || []);
    }
    setLoading(false);
  }, [id]);

  // --- HANDLERS ---

  const handleAddActionPlan = () => {
    const newPlan: ActionPlan = {
      id: `ap-${Date.now()}`,
      finding_id: finding?.id || '',
      title: 'Yeni Aksiyon Planı',
      description: '',
      responsible_person: '',
      target_date: new Date().toISOString().split('T')[0],
      status: 'DRAFT',
      current_state: 'PROPOSED', // NegotiationState
      created_at: new Date().toISOString()
    };
    setActionPlans([...actionPlans, newPlan]);
  };

  const handleUpdateActionPlan = (planId: string, updates: Partial<ActionPlan>) => {
    setActionPlans(prev => prev.map(p => p.id === planId ? { ...p, ...updates } : p));
  };

  const handleDeleteActionPlan = (planId: string) => {
    setActionPlans(prev => prev.filter(p => p.id !== planId));
  };

  if (loading || !finding) return <div className="h-screen flex items-center justify-center bg-slate-50">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-purple-50 font-sans">
      
      {/* --- HEADER --- */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-6 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate('/execution/findings')} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                <ArrowLeft size={20} />
            </button>
            <div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">{finding.code}</span>
                    <span className={clsx("px-2 py-0.5 rounded text-[10px] font-bold border", getSeverityColor(finding.severity))}>
                        {finding.severity}
                    </span>
                </div>
                <h1 className="text-sm font-bold text-slate-900 truncate max-w-[400px]">{finding.title}</h1>
            </div>
        </div>

        {/* ORTAK GÖRÜNÜM DEĞİŞTİRİCİ */}
        <ViewSwitcher findingId={finding.id} />

        <div className="flex items-center gap-2">
            <button 
                onClick={() => setIsDrawerOpen(true)} 
                className="px-4 py-2 border border-slate-200 bg-white text-slate-600 rounded-lg font-bold text-xs hover:bg-slate-50"
            >
                Detaylar
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-xs hover:bg-indigo-700 shadow-sm transition-all active:scale-95">
                <Save size={14} /> Değişiklikleri Kaydet
            </button>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <div className="max-w-[1800px] mx-auto px-8 py-8">
        
        {/* Sayfa Başlığı */}
        <div className="mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <Scale size={20} />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Müzakere Stüdyosu</h1>
                <p className="text-sm text-slate-600">Phase 3: Mutabakat ve Aksiyon Planlama</p>
            </div>
        </div>

        {/* Süreç Adımları (Stepper) */}
        <div className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <WorkflowStepper
            currentStatus={finding.state}
            actionPlans={actionPlans as any}
          />
        </div>

        {/* Müzakere Uyarısı */}
        <div className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl px-6 py-4 shadow-lg flex items-start gap-4">
            <div className="p-2 bg-white/20 rounded-lg"><AlertCircle className="w-6 h-6" /></div>
            <div>
                <div className="font-bold text-lg mb-1">⚖️ Mutabakat Aşaması Aktif</div>
                <div className="text-sm text-blue-100 leading-relaxed">
                    Bu bulgu için denetlenen birim (Auditee) ile mutabakat süreci devam etmektedir. 
                    Tüm aksiyon planları için <strong>"Kabul Edildi"</strong> veya <strong>"Reddedildi"</strong> durumu belirlenmelidir.
                </div>
            </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          
          {/* SOL PANEL: AKSİYON PLANLARI */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Aksiyon Planları</h2>
                  <p className="text-sm text-slate-500">Mutabakat durumunu yönetin</p>
                </div>
                <button
                  onClick={handleAddActionPlan}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-bold text-xs"
                >
                  <Plus className="w-4 h-4" /> Yeni Aksiyon
                </button>
              </div>

              <div className="p-6 space-y-6">
                {actionPlans.length === 0 ? (
                  <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/30">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <p className="text-slate-500 font-medium">Henüz aksiyon planı eklenmemiş</p>
                    <button
                      onClick={handleAddActionPlan}
                      className="mt-4 text-indigo-600 hover:text-indigo-700 font-bold text-sm underline"
                    >
                      İlk aksiyonu ekleyin
                    </button>
                  </div>
                ) : (
                  actionPlans.map((plan) => (
                    <ActionPlanCard
                      key={plan.id}
                      actionPlan={plan}
                      onUpdate={(updates: any) => handleUpdateActionPlan(plan.id, updates)}
                      onDelete={() => handleDeleteActionPlan(plan.id)}
                      availableOwners={MOCK_USERS}
                    />
                  ))
                )}
              </div>
            </div>

            {/* İMZA KUTUSU */}
            <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
                <FindingSignOff
                    findingId={finding.id}
                    currentUserId="u1"
                    currentUserName="Ahmet Yılmaz"
                    currentUserRole="MANAGER"
                    tenantId="default-tenant"
                    riskLevel={finding.severity}
                />
            </div>

          </div>

          {/* SAĞ PANEL: ÖZET BİLGİ */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-24">
                 <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                     <Users size={18} className="text-indigo-600"/> Taraf Bilgileri
                 </h3>
                 
                 <div className="space-y-4">
                     <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                         <div className="text-xs text-slate-400 font-bold uppercase mb-1">Denetçi</div>
                         <div className="flex items-center gap-2">
                             <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-xs">AY</div>
                             <div className="text-sm font-bold text-slate-700">Ahmet Yılmaz</div>
                         </div>
                     </div>

                     <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                         <div className="text-xs text-slate-400 font-bold uppercase mb-1">Denetlenen Birim</div>
                         <div className="flex items-center gap-2">
                             <div className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-xs">MK</div>
                             <div>
                                 <div className="text-sm font-bold text-slate-700">Mehmet Kara</div>
                                 <div className="text-xs text-slate-500">{finding.auditee_department}</div>
                             </div>
                         </div>
                     </div>
                 </div>

                 <div className="mt-6 pt-6 border-t border-slate-100">
                     <button 
                        onClick={() => setIsDrawerOpen(true)}
                        className="w-full py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                     >
                         Bulgu Detaylarını Görüntüle
                     </button>
                 </div>
             </div>
          </div>

        </div>
      </div>

      {/* --- UNIVERSAL DRAWER (SIDEBAR) --- */}
      <UniversalFindingDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        findingId={finding.id}
        defaultTab="detay"
        currentViewMode="studio"
      />

    </div>
  );
}