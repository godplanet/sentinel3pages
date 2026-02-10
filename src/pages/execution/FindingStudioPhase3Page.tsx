import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, AlertCircle, Plus } from 'lucide-react';
import { WorkflowStepper, type ActionPlan as WorkflowActionPlan } from '@/widgets/FindingStudio/WorkflowStepper';
import { FindingSidebar } from '@/widgets/FindingStudio/FindingSidebar';
import { ActionPlanCard, type ActionPlan } from '@/features/finding-studio/components/ActionPlanCard';
import { FindingSignOff } from '@/features/finding-studio/components/FindingSignOff';
import { useSignoffs } from '@/features/finding-studio/api/useSignoffs';
import clsx from 'clsx';

// Mock users for owner selection
const MOCK_USERS = [
  { id: 'user-1', name: 'Ahmet Yılmaz', role: 'Kıdemli Denetçi' },
  { id: 'user-2', name: 'Mehmet Kara', role: 'Şube Müdürü' },
  { id: 'user-3', name: 'Ayşe Demir', role: 'Operasyon Müdürü' },
  { id: 'user-4', name: 'Fatma Arslan', role: 'Uyum Sorumlusu' },
];

// Mock finding data
const MOCK_FINDING = {
  id: 'AUD-2025-BR-64',
  title: 'Kasa İşlemlerinde Çift Anahtar Kuralı İhlali',
  status: 'negotiation', // Start in negotiation phase
  risk_level: 'critical',
  auditor: {
    name: 'Ahmet Aslan',
    role: 'Kıdemli Müfettiş',
  },
  created_at: '12 Ocak 2025',
  updated_at: '15 Ocak 2025',
  engagement: {
    name: 'İstanbul Anadolu Yakası Şubeler Denetimi 2025-Q1',
  },
  timeline: [
    { date: '12.01.2025', action: 'Bulgu oluşturuldu', user: 'Ahmet Aslan' },
    { date: '13.01.2025', action: 'Risk değerlendirmesi yapıldı', user: 'Ahmet Aslan' },
    { date: '15.01.2025', action: 'Müzakere aşamasına geçildi', user: 'Sistem' },
  ],
  ai_similarity: {
    percentage: 87,
    description: 'Bu bulgu, 2024 yılında Ankara şubelerinde tespit edilen "Kasa Güvenlik Prosedürü İhlali" bulgusu ile %87 benzerlik göstermektedir.',
    similar_findings: [
      { id: 'AUD-2024-AN-23', title: 'Kasa Güvenlik Prosedürü İhlali', similarity: 0.87, branch: 'Ankara Çankaya' },
      { id: 'AUD-2024-IZ-15', title: 'İki Kişilik Kontrol Eksikliği', similarity: 0.72, branch: 'İzmir Karşıyaka' },
    ],
    quality_control: 'UYARI: Bu bulgu geçmişte 3 kez raporlandı ancak aksiyon planları tamamlanmadı. Takip mekanizması güçlendirilmeli.',
  },
};

export default function FindingStudioPhase3Page() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [finding] = useState(MOCK_FINDING);
  const [workflowStatus, setWorkflowStatus] = useState(finding.status);
  const [activeTab, setActiveTab] = useState<'detay' | 'tarihce' | 'ai' | 'muzakere'>('detay');
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([
    {
      id: 'action-1',
      description: 'Şube Müdürü tarafından günlük kasa kontrol formlarının imzalanması ve arşivlenmesi sağlanacaktır.',
      agreement_status: 'PENDING',
    },
  ]);

  // Sign-off management
  const { hasSigned } = useSignoffs(finding.id);

  // Auto-open negotiation tab when in negotiation phase
  useEffect(() => {
    if (workflowStatus === 'negotiation') {
      setActiveTab('muzakere');
    }
  }, [workflowStatus]);

  const handleAddActionPlan = () => {
    const newPlan: ActionPlan = {
      id: `action-${Date.now()}`,
      description: '',
      agreement_status: 'PENDING',
    };
    setActionPlans((prev) => [...prev, newPlan]);
  };

  const handleUpdateActionPlan = (id: string, updates: Partial<ActionPlan>) => {
    setActionPlans((prev) =>
      prev.map((plan) => (plan.id === id ? { ...plan, ...updates } : plan))
    );
  };

  const handleDeleteActionPlan = (id: string) => {
    setActionPlans((prev) => prev.filter((plan) => plan.id !== id));
  };

  const handleStatusChange = (newStatus: string) => {
    setWorkflowStatus(newStatus);
    // In real app, save to database here
    console.log('Workflow status changed to:', newStatus);
  };

  // Convert action plans to workflow format
  const workflowActionPlans: WorkflowActionPlan[] = actionPlans.map((plan) => ({
    id: plan.id,
    agreement_status: plan.agreement_status,
    owner_user_id: plan.owner_user_id,
    due_date: plan.due_date,
    disagreement_reason: plan.disagreement_reason,
    risk_acceptance_confirmed: plan.risk_acceptance_confirmed,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-purple-50">
      <div className="max-w-[1800px] mx-auto px-8 py-8">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white">
              <FileText size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Finding Studio</h1>
              <p className="text-sm text-slate-600">Phase 3: Agreement & Negotiation</p>
            </div>
          </div>
        </div>

        {/* Workflow Stepper */}
        <div className="mb-8">
          <WorkflowStepper
            currentStatus={workflowStatus}
            actionPlans={workflowActionPlans}
            onStatusChange={handleStatusChange}
            hasReviewerSignature={hasSigned('REVIEWER')}
          />
        </div>

        {/* Warning Banner if in Negotiation Phase */}
        {workflowStatus === 'negotiation' && (
          <div className="mb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl px-6 py-4 shadow-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-lg mb-1">⚖️ Mutabakat Aşaması Aktif</div>
                <div className="text-sm text-blue-100">
                  Bu bulgu için auditee ile mutabakat sağlanması gerekmektedir. Tüm aksiyon planları için
                  "Mutabıkım" veya "Mutabık Değilim" seçeneği işaretlenmelidir. Müzakere kaydı sağ paneldedir.
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-12 gap-8">
          {/* Main Content: Action Plans */}
          <div className="col-span-8">
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Aksiyon Planları</h2>
                  <p className="text-sm text-slate-600">
                    Her aksiyon için mutabakat durumu belirleyin
                  </p>
                </div>
                <button
                  onClick={handleAddActionPlan}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Yeni Aksiyon Ekle
                </button>
              </div>

              <div className="space-y-6">
                {actionPlans.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="w-16 h-16 mx-auto mb-3 opacity-30" />
                    <p>Henüz aksiyon planı eklenmemiş</p>
                    <button
                      onClick={handleAddActionPlan}
                      className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      İlk aksiyonu ekleyin
                    </button>
                  </div>
                ) : (
                  actionPlans.map((plan) => (
                    <ActionPlanCard
                      key={plan.id}
                      actionPlan={plan}
                      onUpdate={(updates) => handleUpdateActionPlan(plan.id, updates)}
                      onDelete={() => handleDeleteActionPlan(plan.id)}
                      availableOwners={MOCK_USERS}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Sign-Off Chain */}
            <FindingSignOff
              findingId={finding.id}
              currentUserId="user-1"
              currentUserName="Ahmet Yılmaz"
              currentUserRole="MANAGER"
              tenantId="default-tenant"
              riskLevel={finding.risk_level}
            />
          </div>

          {/* Right Sidebar */}
          <div className="col-span-4">
            <FindingSidebar
              finding={finding}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              currentUserId="user-1"
              currentUserName="Ahmet Yılmaz"
              currentUserRole="AUDITOR"
              tenantId="default-tenant"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
