import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner'; // Varsayılan toast kütüphanesi
import { format, differenceInDays, parseISO } from 'date-fns';

// --- Imports (Mock & Utils) ---
import { mockComprehensiveFindings } from '@/entities/finding/api/mock-comprehensive-data';
import { calculateRiskScore } from '@/features/risk-engine/calculator';
import { useRiskConfigurationStore } from '@/features/risk-engine/store'; // Risk ağırlıkları için
import { useAuthStore } from '@/shared/stores/auth'; // Kullanıcı rolü için (Varsayım)

// --- Types ---
// Bu tipler normalde shared/types altında olur, hook bütünlüğü için burada tanımlıyoruz.
export type FindingStatus = 'draft' | 'review' | 'negotiation' | 'approved' | 'closed';
export type FindingMode = 'zen' | 'edit' | 'negotiation';

export interface Finding {
  id: string;
  title: string;
  status: FindingStatus;
  criteria?: string;
  condition?: string;
  cause?: string; // Kök neden
  consequence?: string;
  corrective_action?: string;
  impact: number;
  likelihood: number;
  target_date?: string; // ISO String
  internal_notes?: string; // Sadece Auditor görür
  secrets?: string; // Hassas veri
  [key: string]: any;
}

export const useFindingStudio = () => {
  // 1. Router & Params
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = (searchParams.get('mode') as FindingMode) || 'edit';

  // 2. Global Stores
  const { user } = useAuthStore(); // { role: 'auditor' | 'auditee' } varsayıyoruz
  const riskConfig = useRiskConfigurationStore((state) => state.config); // Ağırlıklar

  // 3. Local State
  const [finding, setFinding] = useState<Finding | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- Helper: Data Sanitization (Blind Mode) ---
  const sanitizeFinding = useCallback((data: Finding): Finding => {
    // Eğer kullanıcı Auditor değilse, hassas alanları temizle
    if (user?.role !== 'auditor') {
      const sanitized = { ...data };
      delete sanitized.internal_notes;
      delete sanitized.secrets;
      return sanitized;
    }
    return data;
  }, [user?.role]);

  // 4. Data Fetching
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Network gecikmesi simülasyonu
        await new Promise((resolve) => setTimeout(resolve, 600));

        if (id === 'new') {
          // Boş Şablon Başlat
          const newTemplate: Finding = {
            id: 'new',
            title: '',
            status: 'draft',
            impact: 1,
            likelihood: 1,
            criteria: '',
            condition: '',
            cause: '',
            consequence: '',
            corrective_action: '',
          };
          setFinding(newTemplate);
        } else {
          // Mock Veriden Çek
          const found = mockComprehensiveFindings.find((f: Finding) => f.id === id);
          
          if (!found) {
            throw new Error('Bulgu bulunamadı.');
          }

          // Güvenlik: Veriyi temizle
          setFinding(sanitizeFinding(found));
        }
      } catch (err: any) {
        setError(err.message || 'Veri yüklenirken hata oluştu.');
        toast.error('Bulgu yüklenemedi');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, sanitizeFinding]);

  // 5. Risk Engine Integration (Real-time Calculation)
  const liveRiskScore = useMemo(() => {
    if (!finding || !riskConfig) return 0;
    
    // Calculator.ts fonksiyonunu kullan
    return calculateRiskScore({
      impact: finding.impact,
      likelihood: finding.likelihood,
      weights: riskConfig.weights // { impactWeight: 0.6, likelihoodWeight: 0.4 } vb.
    });
  }, [finding?.impact, finding?.likelihood, riskConfig]);

  // 6. SLA Calculation (Extra Feature)
  const slaStatus = useMemo(() => {
    if (!finding?.target_date) return { isOverdue: false, daysRemaining: null };

    const today = new Date();
    const target = parseISO(finding.target_date);
    const daysDiff = differenceInDays(target, today);

    return {
      isOverdue: daysDiff < 0,
      daysRemaining: daysDiff,
      label: daysDiff < 0 ? `${Math.abs(daysDiff)} gün gecikti` : `${daysDiff} gün kaldı`
    };
  }, [finding?.target_date]);

  // 7. Actions & Handlers

  // Field Update Handler
  const updateField = useCallback((field: keyof Finding, value: any) => {
    setFinding((prev) => {
      if (!prev) return null;
      return { ...prev, [field]: value };
    });
    setHasUnsavedChanges(true);
  }, []);

  // Save Action
  const saveFinding = useCallback(async () => {
    if (!finding) return;
    setIsSaving(true);

    try {
      // Mock API Call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // TODO: Gerçek API isteği burada yapılacak
      // await api.post('/findings', finding);

      setHasUnsavedChanges(false);
      toast.success('Bulgu başarıyla kaydedildi.');
      
      // Eğer yeni oluşturulduysa ID ile URL güncelle
      if (id === 'new') {
        navigate(`/findings/${finding.id || 'gen_123'}?mode=${mode}`, { replace: true });
      }

    } catch (err) {
      toast.error('Kaydetme sırasında hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  }, [finding, id, mode, navigate]);

  // Workflow Action (Advance State)
  const advanceWorkflow = useCallback(async (nextStatus: FindingStatus) => {
    if (!finding) return;

    // --- Validation Logic ---
    if (nextStatus === 'review') {
      if (!finding.cause || finding.cause.length < 10) {
        toast.error('Onaya göndermek için "Kök Neden" (Cause) alanı doldurulmalıdır.');
        return;
      }
      if (finding.impact === 0 || finding.likelihood === 0) {
        toast.error('Risk değerleri (Etki/Olasılık) belirlenmelidir.');
        return;
      }
    }

    // --- State Transition ---
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      updateField('status', nextStatus);
      setHasUnsavedChanges(false); // Status değişimi de bir save işlemidir
      
      toast.success(`Durum güncellendi: ${nextStatus.toUpperCase()}`);
    } catch (err) {
      toast.error('İş akışı ilerletilemedi.');
    } finally {
      setIsSaving(false);
    }
  }, [finding, updateField]);

  return {
    // Data & State
    finding,
    mode,
    isLoading,
    isSaving,
    hasUnsavedChanges,
    error,
    
    // Computed Values
    liveRiskScore,
    slaStatus,
    userRole: user?.role, // UI'da koşullu render için

    // Actions
    updateField,
    saveFinding,
    advanceWorkflow,
    
    // Utilities
    isEditable: mode === 'edit' || mode === 'new',
    isBlindMode: user?.role !== 'auditor' // Yardımcı flag
  };
};