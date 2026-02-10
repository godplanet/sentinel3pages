/*
  # Audit Execution Helper Functions & Sample Data

  1. JSONB Helper Functions
    - `update_workpaper_test_result` - Updates a single test result in workpaper JSONB data
    - `update_workpaper_field` - Updates any field in workpaper JSONB data
    - `merge_workpaper_data` - Merges new data into existing workpaper JSONB

  2. Sample Data
    - Sample audit steps for banking audit (KYC, AML, Credit Risk procedures)
    - Demonstrates the flexible JSONB structure

  3. Performance
    - Optimized JSONB operations using jsonb_set
*/

-- =============================================
-- JSONB HELPER FUNCTIONS
-- =============================================

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS update_workpaper_test_result(UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS update_workpaper_field(UUID, TEXT[], JSONB);
DROP FUNCTION IF EXISTS merge_workpaper_data(UUID, JSONB);
DROP FUNCTION IF EXISTS get_workpaper_completion(UUID);
DROP FUNCTION IF EXISTS jsonb_object_keys_count(JSONB);

-- Function: Update a single test result in workpaper data
CREATE FUNCTION update_workpaper_test_result(
  p_workpaper_id UUID,
  p_test_key TEXT,
  p_result TEXT
)
RETURNS void AS $$
BEGIN
  UPDATE public.workpapers
  SET
    data = jsonb_set(
      COALESCE(data, '{}'::jsonb),
      ARRAY['test_results', p_test_key],
      to_jsonb(p_result),
      true
    ),
    version = version + 1,
    updated_at = now()
  WHERE id = p_workpaper_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Update any field in workpaper data
CREATE FUNCTION update_workpaper_field(
  p_workpaper_id UUID,
  p_field_path TEXT[],
  p_value JSONB
)
RETURNS void AS $$
BEGIN
  UPDATE public.workpapers
  SET
    data = jsonb_set(
      COALESCE(data, '{}'::jsonb),
      p_field_path,
      p_value,
      true
    ),
    version = version + 1,
    updated_at = now()
  WHERE id = p_workpaper_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Merge new data into existing workpaper JSONB
CREATE FUNCTION merge_workpaper_data(
  p_workpaper_id UUID,
  p_new_data JSONB
)
RETURNS void AS $$
BEGIN
  UPDATE public.workpapers
  SET
    data = COALESCE(data, '{}'::jsonb) || p_new_data,
    version = version + 1,
    updated_at = now()
  WHERE id = p_workpaper_id;
END;
$$ LANGUAGE plpgsql;

-- Helper function to count JSONB object keys
CREATE FUNCTION jsonb_object_keys_count(p_jsonb JSONB)
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM jsonb_object_keys(p_jsonb));
END;
$$ LANGUAGE plpgsql;

-- Function: Get workpaper completion percentage
CREATE FUNCTION get_workpaper_completion(p_workpaper_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total_tests INTEGER;
  completed_tests INTEGER;
BEGIN
  SELECT
    COALESCE(jsonb_object_keys_count(data->'test_results'), 0),
    COALESCE(
      (SELECT COUNT(*)
       FROM jsonb_each_text(data->'test_results')
       WHERE value IN ('pass', 'fail')),
      0
    )
  INTO total_tests, completed_tests
  FROM public.workpapers
  WHERE id = p_workpaper_id;

  IF total_tests = 0 THEN
    RETURN 0;
  END IF;

  RETURN (completed_tests * 100 / total_tests);
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- SAMPLE AUDIT STEPS DATA
-- =============================================

-- KYC (Know Your Customer) Procedures
INSERT INTO public.audit_steps (step_code, title, description, risk_weight, required_evidence_types) VALUES
('KYC-001', 'Customer Identification Verification', 'Verify customer identity documents are collected and validated according to regulatory requirements', 1.5, ARRAY['customer_documents', 'id_verification_logs']),
('KYC-002', 'Beneficial Ownership Analysis', 'Verify beneficial ownership information is documented for all corporate customers', 1.3, ARRAY['ownership_charts', 'board_resolutions']),
('KYC-003', 'PEP Screening', 'Test that Politically Exposed Persons (PEP) screening is performed and documented', 1.4, ARRAY['screening_reports', 'approval_documents']),
('KYC-004', 'Customer Risk Rating', 'Verify customer risk ratings are assigned based on documented criteria', 1.2, ARRAY['risk_assessment_forms', 'approval_matrix'])
ON CONFLICT DO NOTHING;

-- AML (Anti-Money Laundering) Procedures
INSERT INTO public.audit_steps (step_code, title, description, risk_weight, required_evidence_types) VALUES
('AML-001', 'Transaction Monitoring System', 'Test effectiveness of automated transaction monitoring alerts', 1.8, ARRAY['alert_logs', 'system_config', 'investigation_reports']),
('AML-002', 'Suspicious Activity Reporting', 'Verify STR/SAR filing process and timeliness', 1.9, ARRAY['filing_records', 'regulatory_receipts']),
('AML-003', 'Sanctions Screening', 'Test sanctions list screening at onboarding and ongoing', 1.7, ARRAY['screening_logs', 'match_resolution_docs']),
('AML-004', 'AML Training Program', 'Verify all relevant staff completed AML training', 1.0, ARRAY['training_records', 'certificates', 'attendance_logs'])
ON CONFLICT DO NOTHING;

-- Credit Risk Procedures
INSERT INTO public.audit_steps (step_code, title, description, risk_weight, required_evidence_types) VALUES
('CR-001', 'Credit Approval Process', 'Test credit approval limits and authorization matrix', 1.6, ARRAY['approval_documents', 'authorization_matrix']),
('CR-002', 'Collateral Valuation', 'Verify collateral is independently valued and revalued periodically', 1.5, ARRAY['valuation_reports', 'appraiser_credentials']),
('CR-003', 'Loan Loss Provisioning', 'Test adequacy and calculation of loan loss provisions', 1.8, ARRAY['provision_calculations', 'impairment_analysis']),
('CR-004', 'Credit Monitoring', 'Verify ongoing monitoring of credit exposures and early warning indicators', 1.3, ARRAY['monitoring_reports', 'watchlist_documentation'])
ON CONFLICT DO NOTHING;

-- Operational Risk Procedures
INSERT INTO public.audit_steps (step_code, title, description, risk_weight, required_evidence_types) VALUES
('OR-001', 'Business Continuity Planning', 'Test BCP/DR plans are documented, tested, and updated', 1.4, ARRAY['bcp_documents', 'test_results', 'update_logs']),
('OR-002', 'Incident Management', 'Verify operational incidents are logged, investigated, and resolved', 1.2, ARRAY['incident_logs', 'investigation_reports', 'resolution_evidence']),
('OR-003', 'Third-Party Risk Management', 'Test vendor due diligence and ongoing monitoring', 1.5, ARRAY['vendor_assessments', 'contracts', 'monitoring_reports']),
('OR-004', 'Data Security Controls', 'Verify data encryption, access controls, and security monitoring', 1.7, ARRAY['security_logs', 'access_reviews', 'encryption_evidence'])
ON CONFLICT DO NOTHING;

-- IT General Controls (ITGC)
INSERT INTO public.audit_steps (step_code, title, description, risk_weight, required_evidence_types) VALUES
('IT-001', 'Change Management Process', 'Test IT change management approvals and testing procedures', 1.6, ARRAY['change_tickets', 'approval_evidence', 'test_results']),
('IT-002', 'User Access Management', 'Verify user access provisioning, modification, and termination', 1.5, ARRAY['access_logs', 'approval_forms', 'access_reviews']),
('IT-003', 'Backup and Recovery', 'Test data backup procedures and restoration capabilities', 1.4, ARRAY['backup_logs', 'restoration_tests', 'recovery_procedures']),
('IT-004', 'System Monitoring and Logging', 'Verify system monitoring, logging, and log review procedures', 1.3, ARRAY['monitoring_dashboards', 'log_review_evidence'])
ON CONFLICT DO NOTHING;