import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { differenceInDays, parseISO, isValid } from 'date-fns';

// --- Imports ---
import { useMethodologyStore } from '@/features/admin/methodology/model/store';
import { useRiskConfigurationStore } from '@/features/admin/risk-configuration/model/store';
import { mockComprehensiveFindings } from '@/entities/finding/api/mock-comprehensive-data';
import type { Finding } from '@/entities/finding/model/types'; // Ana tipleri buradan çekiyoruz (Varsa)

// --- Types ---
export type FindingMode = 'zen' | 'edit' | 'negotiation';

export interface SLAStatus {
  daysRemaining: number | null;
  isOverdue: boolean;
  label: string;
  statusColor: 'green' | 'amber' | 'red';
}

// UI Tarafında kullanılan Genişletilmiş Tip (Mevcut tiplerle uyumlu olmalı)
export interface ComprehensiveFinding {
  id: string;
  title: string;
  status: 'draft' | 'review' | 'negotiation' | 'approved' | 'closed' | string; // string eklendi çünkü DB'den farklı gelebilir
  impact: number;
  likelihood: number;
  target_date?: string;
  internal_notes?: string;
  secrets?: any; // Tip esnekliği için any yapıldı
  category?: string;
  department?: string;
  tags?: string[];
  severity?: string;
  audit_framework?: 'STANDARD' | 'BDDK';
  bddk_deficiency_type?: string | null;
  control_effectiveness?: number;
  [key: string]: any; // Dinamik alanlar için
}

const CURRENT_ROLE: 'auditor' | 'auditee' | 'viewer' = 'auditor';

export const useFindingStudio = () => {
  // 1. Router Integration
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const mode = (searchParams.get('mode') as FindingMode) || 'edit';

  // 2. Global Stores
  const { findingSections, fetchConfig } = useMethodologyStore();
  const riskConfig = useRiskConfigurationStore((state: any) => state.config);

  // 3. Local State
  const [finding, setFinding] = useState<ComprehensiveFinding | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // --- Helper: Data Sanitization ---
  const sanitizeData = useCallback((data: ComprehensiveFinding): ComprehensiveFinding => {
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
    let isMounted = true;

    const initStudio = async () => {
      setIsLoading(true);
      
      try {
        // 1. Metodolojiyi yükle (Eğer boşsa)
        if (findingSections.length === 0) {
           await fetchConfig();
        }

        // Simüle edilmiş ağ gecikmesi
        await new Promise((resolve) => setTimeout(resolve, 600));

        if (!isMounted) return;

        if (id === 'new') {
          // --- YENİ KAYIT ---
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
            control_effectiveness: 1,
            audit_framework: 'STANDARD',
            ...dynamicFields,
          };
          
          setFinding(newTemplate);

        } else {
          // --- MEVCUT KAYIT ---
          // Mock veriden bulma işlemi (Tip zorlaması ile)
          const found = mockComprehensiveFindings.find((f: any) => f.id === id);
          
          if (!found) {
            // Eğer mock veride yoksa, demo amaçlı ilk kaydı yükle veya hata ver
            // Güvenlik için 'find-001' fallback yapabiliriz veya hata dönebiliriz.
            if (id === 'find-001') { // Sadece demo ID'si için fallback
               const demoFinding = mockComprehensiveFindings[0];
               if (demoFinding) {
                 setFinding(sanitizeData(demoFinding as unknown as ComprehensiveFinding));
                 setIsLoading(false);
                 return;
               }
            }

            console.warn(`Finding with ID ${id} not found in mock data.`);
            // Demo modunda olduğumuz için hata verip çıkmak yerine, kullanıcıyı listeden atmayalım diye
            // boş bir şablon ile devam etme (isteğe bağlı) veya redirect:
            // navigate('/findings'); 
            // return;
            
            // DEMO FIX: Hata vermemek için ilk kaydı zorla yükle (Geliştirme aşaması için)
             const fallbackFinding = mockComprehensiveFindings[0] as unknown as ComprehensiveFinding;
             setFinding(sanitizeData(fallbackFinding));
             
          } else {
            setFinding(sanitizeData(found as unknown as ComprehensiveFinding));
          }
        }

      } catch (error) {
        console.error("Finding Studio Init Error:", error);
        toast.error('Veri yüklenirken bir hata oluştu.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initStudio();

    return () => { isMounted = false; };
  }, [id, navigate, sanitizeData, fetchConfig]); // findingSections dependency array'den çıkarıldı


  // --- Logic: Risk Engine Calculation ---
  const riskCalculation = useMemo(() => {
    if (!finding) return { score: 0, level: 'Low', color: 'gray', isVetoed: false };

    const simpleScore = (finding.impact || 1) * (finding.likelihood || 1);
    const isVetoed = simpleScore > 20;
    
    return {
      score: simpleScore,
      level: simpleScore > 20 ? 'Critical' : simpleScore > 10 ? 'High' : 'Low',
      color: simpleScore > 20 ? 'red' : 'green',
      isVetoed
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
    else if (diff <= 3) color = 'amber';

    return {
      daysRemaining: diff,
      isOverdue,
      label: isOverdue ? `${Math.abs(diff)} Gün Gecikmeli` : `${diff} Gün Kaldı`,
      statusColor: color
    };
  }, [finding?.target_date]);


  // --- Actions ---

  const updateField = useCallback((field: string, value: any) => {
    setFinding((prev) => {
      if (!prev) return null;
      return { ...prev, [field]: value };
    });
    setHasUnsavedChanges(true);
  }, []);

  const setMode = useCallback((newMode: FindingMode) => {
    setSearchParams({ mode: newMode });
  }, [setSearchParams]);

  const saveFinding = useCallback(async () => {
    if (!finding) return;
    setIsSaving(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setHasUnsavedChanges(false);
      toast.success(
        finding.id === 'new' 
          ? 'Yeni bulgu taslağı oluşturuldu.' 
          : 'Değişiklikler başarıyla kaydedildi.'
      );

      if (id === 'new') {
        const newId = `gen_${Math.floor(Math.random() * 10000)}`;
        navigate(`/findings/${newId}?mode=${mode}`, { replace: true });
      }

    } catch (err) {
      toast.error('Kaydetme başarısız oldu.');
    } finally {
      setIsSaving(false);
    }
  }, [finding, id, mode, navigate]);

  return {
    finding,
    mode,
    riskScore: riskCalculation.score,
    riskLevel: riskCalculation.level,
    isVetoed: riskCalculation.isVetoed,
    slaStatus,
    isLoading,
    isSaving,
    hasUnsavedChanges,
    userRole: CURRENT_ROLE,
    updateField,
    setMode,
    saveFinding,
    isEditable: mode === 'edit' || id === 'new',
  };
};