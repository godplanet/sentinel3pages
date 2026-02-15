export const HUB_DEMO_FINDINGS = [
  {
    id: 'mock-1',
    code: 'AUD-2026-001',
    title: 'Kasa İşlemlerinde Çift Anahtar Kuralı İhlali',
    severity: 'HIGH',
    main_status: 'ACIK',
    financial_impact: 250000,
    gias_category: 'Operasyonel Risk',
    assignment: { portal_status: 'PENDING' }
  },
  {
    id: 'mock-2',
    code: 'AUD-2026-002',
    title: 'Bilgi Güvenliği - Şifre Politikası Zafiyeti',
    severity: 'CRITICAL',
    main_status: 'ACIK',
    financial_impact: 0,
    gias_category: 'BT Güvenliği',
    assignment: { portal_status: 'DISAGREED' }
  }
];
import { useState, useEffect, useCallback } from 'react';
import { Finding, RiskScore } from '@/entities/finding/model/types';
import { calculateRiskScore } from '@/features/risk-engine/calculator'; // THE ENGINE
import { useRiskConfigurationStore } from '@/features/admin/risk-configuration/model/store'; // Config Store
import { mockFindings } from '@/features/finding-hub/api/mock-hub-data'; // Single Source of Mock

export const useFindingStudio = (findingId?: string) => {
  const [finding, setFinding] = useState<Finding | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Risk Configuration from Store (Parametric)
  const { weights, methodology } = useRiskConfigurationStore();

  // Initial Fetch
  useEffect(() => {
    const fetchFinding = async () => {
      setIsLoading(true);
      try {
        // Simulate API call with delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Find in mock data
        const found = mockFindings.find(f => f.id === findingId);
        
        if (found) {
          setFinding(JSON.parse(JSON.stringify(found))); // Deep copy to avoid mutating mock directly during edit
        } else {
          setFinding(null);
        }
      } catch (error) {
        console.error("Failed to fetch finding", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (findingId) {
      fetchFinding();
    }
  }, [findingId]);

  // Dynamic Risk Calculation (The Engine Logic)
  const riskScore: RiskScore = finding ? calculateRiskScore({
    impact: finding.impact_score || 1,
    likelihood: finding.likelihood_score || 1,
    control: finding.control_effectiveness || 1,
    weights: weights, // Passed from global config store
    methodology: methodology // Passed from global config store
  }) : { total: 0, financial: 0, operational: 0, legal: 0, reputation: 0 };

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

  // Save Handler
  const saveFinding = useCallback(async () => {
    if (!finding) return;
    
    setIsSaving(true);
    try {
      // Simulate API Save
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Saving Finding payload:", {
        ...finding,
        calculated_risk: riskScore
      });
      
      setHasUnsavedChanges(false);
      // Optional: Show toast notification here
    } catch (error) {
      console.error("Save failed", error);
    } finally {
      setIsSaving(false);
    }
  }, [finding, riskScore]);

  return {
    finding,
    isLoading,
    isSaving,
    hasUnsavedChanges,
    updateField,
    saveFinding,
    workflowStatus: finding?.status || 'DRAFT',
    riskScore // Export computed risk
  };
};