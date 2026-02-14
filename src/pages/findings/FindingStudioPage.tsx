import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FileText, Users, Scale, CheckCircle, ArrowLeft, 
  Save, AlertTriangle, Play, Lock, CheckCircle2, Plus 
} from 'lucide-react';
import clsx from 'clsx';

// --- TEK GERÇEK VERİ KAYNAĞI (Single Source of Truth) ---
import { mockComprehensiveFindings } from '@/entities/finding/api/mock-comprehensive-data';
import type { ComprehensiveFinding } from '@/entities/finding/model/types';
import { useParameterStore } from '@/shared/stores/parameter-store';

// --- BİLEŞENLER (Modüller) ---
import { WorkflowStepper, type ActionPlan as WorkflowActionPlan } from '@/widgets/FindingStudio/WorkflowStepper';
import { FindingSidebar } from '@/widgets/FindingStudio/FindingSidebar';
import { ZenEditor, type FindingEditorData } from '@/features/finding-studio/components/ZenEditor'; // Faz 1
import { FindingPaper } from '@/widgets/FindingStudio/FindingPaper'; // Faz 2
import { ActionPlanCard, type ActionPlan } from '@/features/finding-studio/components/ActionPlanCard'; // Faz 3
import { FindingSignOff } from '@/features/finding-studio/components/FindingSignOff'; // Faz 4

// FAZ TANIMLARI
const PHASES = [
  { id: 'DRAFT', label: '1. Taslak & Tespit', icon: FileText, desc: 'Bulgu yazımı ve kanıt yükleme' },
  { id: 'REVIEW', label: '2. Kalite Kontrol', icon: Users, desc: 'Yönetici onayı ve 2024 GIAS kontrolü' },
  { id: 'NEGOTIATION', label: '3. Müzakere', icon: Scale, desc: 'Denetlenen aksiyon planı ve mutabakat' },
  { id: 'FINAL', label: '4. Finalizasyon', icon: CheckCircle, desc: 'Raporlama ve Kapanış' },
];

// MOCK KULLANICILAR (Aksiyon Atama İçin)
const MOCK_USERS = [
  { id: 'u1', name: 'Ahmet Yılmaz', role: 'Kıdemli Denetçi' },
  { id: 'u2', name: 'Mehmet Kara', role: 'Birim Yöneticisi' },
];

export default function FindingStudioPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getSeverityColor } = useParameterStore();

  // STATE YÖNETİMİ
  const [finding, setFinding] = useState<ComprehensiveFinding | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPhase, setCurrentPhase] = useState<string>('DRAFT'); // Sayfanın o anki görünümü
  const [activeTab, setActiveTab] = useState<'detay' | 'tarihce' | 'ai' | 'muzakere'>('detay');
  
  // VERİ EDİTÖRLERİ
  const [editorData, setEditorData] = useState<FindingEditorData | null>(null);
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);

  // 1. VERİYİ YÜKLE (Single Source of Truth)
  useEffect(() => {
    const found = mockComprehensiveFindings.find(f => f.id === id) || mockComprehensiveFindings[0];
    
    if (found) {
        setFinding(found);
        
        // Veritabanındaki duruma göre başlangıç fazını ayarla
        if (found.state === 'DRAFT') setCurrentPhase('DRAFT');
        else if (found.state === 'PENDING_APPROVAL' || found.state === 'PUBLISHED') setCurrentPhase('REVIEW');
        else if (found.state === 'NEGOTIATION') { setCurrentPhase('NEGOTIATION'); setActiveTab('muzakere'); }
        else if (found.state === 'CLOSED' || found.state === 'FINAL') setCurrentPhase('FINAL');

        // Zen Editor Verisini Hazırla (Mapping)
        setEditorData({
            criteria: '<p><strong>BDDK / COBIT Referansı:</strong> ...</p>',
            condition: found.description || found.detection_html || '',
            effect: found.impact_html || '',
            recommendation: found.recommendation_html || '',
            root_cause_analysis: { 
                method: 'five_whys', 
                five_whys: found.secrets?.why_1 ? [found.secrets.why_1, found.secrets.why_2 || ''] : [] 
            }
        });

        // Aksiyon Planlarını Yükle
        if (found.action_plans) {
            setActionPlans(found.action_plans as unknown as ActionPlan[]);
        }
    }
    setLoading(false);
  }, [id]);

  // FAZ DEĞİŞTİRME MANTIĞI
  const handlePhaseChange = (phaseId: string) => {
    setCurrentPhase(phaseId);
    // Faz değiştiğinde sağ paneli de ilgili yere odakla
    if (phaseId === 'NEGOTIATION') setActiveTab('muzakere');
    else setActiveTab('detay');
  };

  if (loading || !finding) return <div className="h-screen flex items-center justify-center bg-slate-50 text-slate-400">Yükleniyor...</div>;

  // Workflow Stepper için Veri Dönüşümü
  const workflowActions = actionPlans.map(ap => ({
      id: ap.id,
      agreement_status: ap.current_state === 'ACCEPTED' ? 'AGREED' : 'PENDING',
      owner_user_id: ap.responsible_person,
      due_date: ap.target_date,
      disagreement_reason: ap.auditor_rejection_reason,
      risk_acceptance_confirmed: false
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 flex flex-col">
      
      {/* --- HEADER --- */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-6 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate('/execution/findings')} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
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

        {/* ORTA: STEPPER NAVİGASYON */}
        <div className="flex bg-slate-100/80 p-1 rounded-lg">
            {PHASES.map((phase) => {
                const isActive = currentPhase === phase.id;
                const Icon = phase.icon;
                return (
                    <button 
                        key={phase.id}
                        onClick={() => handlePhaseChange(phase.id)}
                        className={clsx(
                            "flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all duration-200",
                            isActive ? "bg-white text-indigo-600 shadow-sm ring-1 ring-black/5" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                        )}
                    >
                        <Icon size={14} /> {phase.label}
                    </button>
                );
            })}
        </div>

        {/* SAĞ: AKSİYONLAR */}
        <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium mr-2">Son kayıt: 14:02</span>
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-xs hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all active:scale-95">
                <Save size={14} /> Kaydet
            </button>
        </div>
      </header>

      {/* --- ANA SAHNE --- */}
      <main className="flex-1 max-w-[1920px] mx-auto w-full p-6 grid grid-cols-12 gap-6 pb-20">
        
        {/* SOL TARAFTAKİ ANA ÇALIŞMA ALANI (DİNAMİK) */}
        <div className="col-span-8 space-y-6">
            
            {/* ÜST BİLGİ KARTI (STEPPER DURUMU) */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                 <WorkflowStepper 
                    currentStatus={currentPhase === 'FINAL' ? 'CLOSED' : currentPhase === 'NEGOTIATION' ? 'NEGOTIATION' : 'DRAFT'} 
                    actionPlans={workflowActions as any}
                 />
            </div>

            {/* --- FAZ 1: DRAFT (ZEN EDITOR) --- */}
            {currentPhase === 'DRAFT' && editorData && (
                <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden ring-1 ring-slate-900/5">
                    <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <div>
                            <h2 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                                <FileText className="text-indigo-500" size={20}/> Bulgu Editörü
                            </h2>
                            <p className="text-xs text-slate-500 mt-1">5C kuralına göre bulgu detaylarını giriniz.</p>
                        </div>
                    </div>
                    <div className="p-8">
                        <ZenEditor initialData={editorData} onChange={setEditorData} />
                    </div>
                </div>
            )}

            {/* --- FAZ 2: REVIEW (OKUMA MODU & ONAY) --- */}
            {currentPhase === 'REVIEW' && (
                <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 ring-1 ring-slate-900/5">
                    <div className="mb-6 p-4 bg-orange-50 border border-orange-100 rounded-lg flex items-start gap-3">
                        <AlertTriangle className="text-orange-600 shrink-0 mt-0.5" size={18} />
                        <div>
                            <h3 className="text-sm font-bold text-orange-900">Gözden Geçirme Gerekiyor</h3>
                            <p className="text-xs text-orange-800 mt-1 leading-relaxed">
                                Bu bulgu <strong>{finding.auditee_department || 'Belirsiz'}</strong> birimine gönderilmeden önce yönetici onayından geçmelidir. Lütfen risk seviyesini ve kök neden analizini kontrol ediniz.
                            </p>
                        </div>
                    </div>
                    
                    {/* Okuma Modülü (Read-Only) */}
                    <FindingPaper finding={finding} />

                    {/* Onay Butonları */}
                    <div className="mt-8 flex justify-between items-center pt-6 border-t border-slate-100">
                        <div className="text-xs text-slate-400 italic">Müfettiş: {finding.created_by || 'Ahmet Yılmaz'}</div>
                        <div className="flex gap-3">
                            <button className="px-6 py-2.5 border border-red-200 text-red-700 bg-red-50 rounded-lg font-bold text-sm hover:bg-red-100 transition-colors">
                                Revize İste
                            </button>
                            <button 
                                onClick={() => handlePhaseChange('NEGOTIATION')}
                                className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-bold text-sm hover:bg-emerald-700 shadow-lg shadow-emerald-200 flex items-center gap-2 transition-all"
                            >
                                <CheckCircle2 size={16}/> Onayla ve Gönder
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- FAZ 3: NEGOTIATION (AKSİYON PLANLARI - Sizin Beğendiğiniz Kısım) --- */}
            {currentPhase === 'NEGOTIATION' && (
                <div className="space-y-6">
                    {/* Müzakere Başlığı */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-2xl shadow-lg flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm"><Scale size={24} /></div>
                            <div>
                                <h2 className="text-lg font-bold">Müzakere Süreci</h2>
                                <p className="text-indigo-100 text-sm mt-1 opacity-90">Denetlenen birim ile aksiyonlar üzerinde mutabakat.</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs font-bold opacity-70 uppercase tracking-wider">Kalan Süre</div>
                            <div className="text-2xl font-bold font-mono">48:00</div>
                        </div>
                    </div>

                    {/* Aksiyon Kartları */}
                    {actionPlans.length > 0 ? (
                        actionPlans.map((plan) => (
                            <ActionPlanCard 
                                key={plan.id} 
                                actionPlan={plan} 
                                onUpdate={() => {}} 
                                onDelete={() => {}} 
                                availableOwners={MOCK_USERS} 
                            />
                        ))
                    ) : (
                        <div className="text-center py-16 border-2 border-dashed border-slate-300 rounded-2xl bg-white/50">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400"><FileText /></div>
                            <h3 className="font-bold text-slate-700">Henüz Aksiyon Planı Yok</h3>
                            <p className="text-slate-500 text-sm mt-1 mb-6">Denetlenen birim henüz bir aksiyon girmedi.</p>
                            <button className="px-5 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 shadow-sm">
                                <Plus size={14} className="inline mr-2" /> Müfettiş Olarak Ekle
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* --- FAZ 4: FINAL (KAPANIŞ & İMZA) --- */}
            {currentPhase === 'FINAL' && (
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center ring-1 ring-slate-900/5">
                    <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <Lock size={40} />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">Denetim Dosyası Kapatıldı</h2>
                    <p className="text-slate-500 max-w-lg mx-auto mb-10 text-lg">
                        Bu bulgu tüm onay süreçlerinden geçmiş, aksiyon planları mutabık kalınmış ve nihai rapora eklenmek üzere kilitlenmiştir.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
                        <FindingSignOff 
                            findingId={finding.id} 
                            currentUserId="u1" 
                            currentUserName="Sistem Yöneticisi" 
                            currentUserRole="SYSTEM" 
                            tenantId="default" 
                            riskLevel={finding.severity} 
                        />
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                            <h3 className="font-bold text-slate-800 mb-4">Kapanış Özeti</h3>
                            <ul className="space-y-3 text-sm text-slate-600">
                                <li className="flex justify-between"><span>Kapanış Tarihi:</span> <span className="font-mono font-bold">14.02.2026</span></li>
                                <li className="flex justify-between"><span>Toplam Aksiyon:</span> <span className="font-bold">{actionPlans.length} Adet</span></li>
                                <li className="flex justify-between"><span>Risk Puanı:</span> <span className="font-bold text-red-600">92 (Kritik)</span></li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

        </div>

        {/* --- SAĞ YAN PANEL (BAĞLAM & TARİHÇE) --- */}
        <div className="col-span-4 h-full sticky top-24">
            <FindingSidebar
                finding={finding}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                currentUserId="u1"
                currentUserName="Ahmet Yılmaz"
                currentUserRole="AUDITOR"
                tenantId="default"
            />
        </div>

      </main>
    </div>
  );
}