import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { differenceInDays, parseISO, isValid } from 'date-fns';

// --- Imports (External Modules) ---
import { useMethodologyStore } from '@/features/admin/methodology/model/store';
import { useRiskConfigStore } from '@/features/admin/risk-configuration/model/store';
import { mockComprehensiveFindings } from '@/entities/finding/api/mock-comprehensive-data';

// --- Types ---

// UI Modları
export type FindingMode = 'zen' | 'edit' | 'negotiation';

// SLA Durumu
export interface SLAStatus {
  daysRemaining: number | null;
  isOverdue: boolean;
  label: string;
  statusColor: 'green' | 'amber' | 'red';
}

// Genişletilmiş Bulgu Tipi (Dinamik alanları destekler)
export interface ComprehensiveFinding {
  id: string;
  title: string;
  status: 'draft' | 'review' | 'negotiation' | 'approved' | 'closed';
  impact: number; // 1-5
  likelihood: number; // 1-5
  target_date?: string; // ISO String
  
  // Güvenlik / Yetki Alanları
  internal_notes?: string;
  secrets?: string;

  // Dinamik Metodoloji Alanları (criteria, condition, cause vb.)
  [key: string]: any;
}

// --- Constants ---
// TEST İÇİN: Bu rolü 'auditee' yaparsan internal_notes verisi silinir.
const CURRENT_ROLE: 'auditor' | 'auditee' | 'viewer' = 'auditor'; 

export const useFindingStudio = () => {
  // 1. Router Integration
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // URL'den modu oku, yoksa varsayılan 'edit'
  const mode = (searchParams.get('mode') as FindingMode) || 'edit';

  // 2. Global Stores
  const { findingSections, fetchConfig } = useMethodologyStore();
  const { config: riskConfig } = useRiskConfigStore();

  // 3. Local State
  const [finding, setFinding] = useState<ComprehensiveFinding | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // --- Helper: Data Sanitization (Blind Mode) ---
  const sanitizeData = useCallback((data: ComprehensiveFinding): ComprehensiveFinding => {
    // Eğer kullanıcı Auditor değilse hassas veriyi temizle
    if (CURRENT_ROLE !== 'auditor') {
      const sanitized = { ...data };
      delete sanitized.internal_notes;
      delete sanitized.secrets;
      return sanitized;
    }
    return data;
  }, []);

  // --- Effect: Initialize & Fetch Data ---
  useEffect(() => {
    const initStudio = async () => {
      setIsLoading(true);
      
      try {
        // Önce metodoloji konfigürasyonunu yükle (Dinamik alanları bilmemiz lazım)
        // Eğer store zaten doluysa fetchConfig optimize çalışır (zustand yapısına bağlı)
        await fetchConfig(); 

        // Network gecikmesi simülasyonu
        await new Promise((resolve) => setTimeout(resolve, 600));

        if (id === 'new') {
          // --- SENARYO A: YENİ KAYIT ---
          // Methodology Store'daki "key"leri kullanarak boş bir şablon oluştur.
          // Örn: { criteria: '', condition: '', cause: '' ... }
          const dynamicFields = findingSections.reduce((acc, section) => {
            acc[section.key] = ''; 
            return acc;
          }, {} as Record<string, any>);

          const newTemplate: ComprehensiveFinding = {
            id: 'new',
            title: '',
            status: 'draft',
            impact: 1,
            likelihood: 1,
            ...dynamicFields, // Dinamik alanları inject et
          };
          
          setFinding(newTemplate);

        } else {
          // --- SENARYO B: MEVCUT KAYIT ---
          const found = mockComprehensiveFindings.find((f: any) => f.id === id);
          
          if (!found) {
            toast.error('Bulgu bulunamadı!');
            navigate('/findings'); // Geri at
            return;
          }

          // Güvenlik temizliği yap ve set et
          setFinding(sanitizeData(found as ComprehensiveFinding));
        }

      } catch (error) {
        console.error("Finding Studio Init Error:", error);
        toast.error('Veri yüklenirken bir hata oluştu.');
      } finally {
        setIsLoading(false);
      }
    };

    initStudio();
  }, [id, fetchConfig, navigate, sanitizeData, findingSections]); // findingSections dependency önemli, config değişirse yeniden init olabilir.


  // --- Logic: Risk Engine Calculation ---
  const riskCalculation = useMemo(() => {
    if (!finding) return { score: 0, level: 'Low', color: '#10b981', isVetoed: false };

    // Simple inline risk calculation
    const impact = finding.impact || 1;
    const likelihood = finding.likelihood || 1;
    const score = (impact * likelihood * 4); // Simple formula: score out of 100

    // Determine level and color based on score
    let level = 'Low';
    let color = '#10b981'; // green

    if (score >= 60) {
      level = 'Critical';
      color = '#dc2626'; // red
    } else if (score >= 40) {
      level = 'High';
      color = '#f97316'; // orange
    } else if (score >= 20) {
      level = 'Medium';
      color = '#fbbf24'; // yellow
    }

    return {
      score,
      level,
      color,
      isVetoed: score >= 80
    };
  }, [finding?.impact, finding?.likelihood]);


  // --- Logic: SLA Calculator ---
  const slaStatus = useMemo((): SLAStatus => {
    if (!finding?.target_date || !isValid(parseISO(finding.target_date))) {
      return { daysRemaining: null, isOverdue: false, label: 'Termin Yok', statusColor: 'gray' };
    }

    const today = new Date();
    const target = parseISO(finding.target_date);
    const diff = differenceInDays(target, today);
    const isOverdue = diff < 0;

    let color: SLAStatus['statusColor'] = 'green';
    if (isOverdue) color = 'red';
    else if (diff <= 3) color = 'amber'; // 3 günden az kaldıysa uyarı

    return {
      daysRemaining: diff,
      isOverdue,
      label: isOverdue ? `${Math.abs(diff)} Gün Gecikmeli` : `${diff} Gün Kaldı`,
      statusColor: color
    };
  }, [finding?.target_date]);


  // --- Actions ---

  // Alan güncelleme (Generic)
  const updateField = useCallback((field: string, value: any) => {
    setFinding((prev) => {
      if (!prev) return null;
      return { ...prev, [field]: value };
    });
    setHasUnsavedChanges(true);
  }, []);

  // Mod Değiştirme (URL Sync)
  const setMode = useCallback((newMode: FindingMode) => {
    setSearchParams({ mode: newMode });
  }, [setSearchParams]);

  // Kaydetme
  const saveFinding = useCallback(async () => {
    if (!finding) return;
    setIsSaving(true);

    try {
      // Mock API Save
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // TODO: Supabase update logic here
      // const { error } = await supabase.from('findings').upsert(finding);

      setHasUnsavedChanges(false);
      toast.success(
        finding.id === 'new' 
          ? 'Yeni bulgu taslağı oluşturuldu.' 
          : 'Değişiklikler başarıyla kaydedildi.'
      );

      // Eğer yeni oluşturulduysa URL'i güncelle (örn: /findings/new -> /findings/gen_123)
      if (id === 'new') {
        // Mock ID generation
        const newId = `gen_${Math.floor(Math.random() * 10000)}`;
        navigate(`/findings/${newId}?mode=${mode}`, { replace: true });
      }

    } catch (err) {
      toast.error('Kaydetme başarısız oldu.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }, [finding, id, mode, navigate]);

  return {
    // Data
    finding,
    mode,
    
    // Derived State (Calculated)
    riskScore: riskCalculation.score,
    riskLevel: riskCalculation.level,
    isVetoed: riskCalculation.isVetoed,
    slaStatus,
    
    // UI State
    isLoading,
    isSaving,
    hasUnsavedChanges,
    userRole: CURRENT_ROLE, // UI'da yetki kontrolü için

    // Actions
    updateField,
    setMode,
    saveFinding,
    
    // Helpers
    isEditable: mode === 'edit' || id === 'new',
  };
};