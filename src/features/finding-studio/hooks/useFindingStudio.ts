import { useState, useEffect, useCallback, useMemo } from 'react';
import { Finding, RiskScore } from '@/entities/finding/model/types';
import { calculateRiskScore } from '@/features/risk-engine/calculator';
import { useRiskConfigurationStore } from '@/features/admin/risk-configuration/model/store';
import { mockFindings } from '@/features/finding-hub/api/mock-hub-data';
import { toast } from 'sonner';

// Finding Workflow Status Types
export type WorkflowStage = 'draft' | 'review' | 'negotiation' | 'final' | 'followup';

export const useFindingStudio = (findingId?: string) => {
  const [finding, setFinding] = useState<Finding | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Parametric Risk Configuration (Global Store)
  const { weights, methodology, thresholds } = useRiskConfigurationStore();

  // Initial Data Fetch
  useEffect(() => {
    const fetchFinding = async () => {
      setIsLoading(true);
      try {
        // Simulating API Latency
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // In a real app, this is a Supabase call. 
        // Using Single Source of Truth Mock Data here.
        const found = mockFindings.find(f => f.id === findingId);
        
        if (found) {
          // Deep copy to prevent mutating the mock directly during edit session
          setFinding(JSON.parse(JSON.stringify(found)));
        } else {
          setFinding(null);
          toast.error("Bulgu bulunamadı veya erişim yetkiniz yok.");
        }
      } catch (error) {
        console.error("Failed to fetch finding", error);
        toast.error("Veri yüklenirken bir hata oluştu.");
      } finally {
        setIsLoading(false);
      }
    };

    if (findingId) {
      fetchFinding();
    }
  }, [findingId]);

  // LIVE RISK CALCULATION ENGINE (The Brain)
  const riskScore: RiskScore = useMemo(() => {
    if (!finding) return { total: 0, financial: 0, operational: 0, legal: 0, reputation: 0 };

    return calculateRiskScore({
      impact: finding.impact_score || 1,
      likelihood: finding.likelihood_score || 1,
      control: finding.control_effectiveness || 1,
      weights: weights,
      methodology: methodology
    });
  }, [finding?.impact_score, finding?.likelihood_score, finding?.control_effectiveness, weights, methodology]);

  // Veto & Criticality Checks
  const isVetoed = riskScore.total >= (thresholds?.critical || 20);
  const isHighRisk = riskScore.total >= (thresholds?.high || 12) && !isVetoed;

  // SLA / Overdue Calculation
  const slaStatus = useMemo(() => {
    if (!finding?.target_date) return null;
    const target = new Date(finding.target_date);
    const now = new Date();
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      daysLeft: diffDays,
      isOverdue: diffDays < 0,
      label: diffDays < 0 ? `${Math.abs(diffDays)} GÜN GECİKTİ` : `${diffDays} Gün Kaldı`
    };
  }, [finding?.target_date]);

  // Field Update Handler
  const updateField = useCallback((field: keyof Finding, value: any) => {
    setFinding(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [field]: value
      };
    });
    setHasUnsavedChanges(true);
  }, []);

  // Save Operation
  const saveFinding = useCallback(async () => {
    if (!finding) return;
    
    setIsSaving(true);
    try {
      // Simulate API Save
      await new Promise(resolve => setTimeout(resolve, 800));
      
      console.log("Saving Finding Payload to DB:", {
        ...finding,
        calculated_risk_score: riskScore,
        last_updated: new Date().toISOString()
      });
      
      setHasUnsavedChanges(false);
      toast.success("Değişiklikler başarıyla kaydedildi.");
    } catch (error) {
      console.error("Save failed", error);
      toast.error("Kaydetme işlemi başarısız oldu.");
    } finally {
      setIsSaving(false);
    }
  }, [finding, riskScore]);

  // Phase Transition Handler (Draft -> Review -> Negotiation)
  const advanceWorkflow = useCallback(async (nextStage: WorkflowStage) => {
    if (!finding) return;
    updateField('status', nextStage.toUpperCase()); // Simplified
    toast.info(`İş akışı ilerletildi: ${nextStage.toUpperCase()}`);
    saveFinding();
  }, [finding, updateField, saveFinding]);

  return {
    finding,
    isLoading,
    isSaving,
    hasUnsavedChanges,
    updateField,
    saveFinding,
    advanceWorkflow,
    riskScore,
    isVetoed,
    isHighRisk,
    slaStatus
  };
};