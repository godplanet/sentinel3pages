/**
 * WORKFLOW ACTION BUTTONS
 *
 * Context-aware buttons that trigger state transitions.
 * Displays validation errors in modal before transition.
 */

import { useState } from 'react';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';
import { supabase } from '@/shared/api/supabase';
import { transitionFindingState, getAvailableActions, type FindingWorkflowState } from '../workflow';
import {
  notifyFindingIssued,
  notifyFindingValidated,
  notifyFindingClosed,
} from '../notifications';

interface WorkflowActionButtonsProps {
  findingId: string;
  currentState: FindingWorkflowState;
  auditeeId?: string;
  responseDueDate?: string;
  onStateChange: (newState: FindingWorkflowState) => void;
  userId: string;
  tenantId: string;
}

export function WorkflowActionButtons({
  findingId,
  currentState,
  auditeeId,
  responseDueDate,
  onStateChange,
  userId,
  tenantId,
}: WorkflowActionButtonsProps) {
  const [loading, setLoading] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);

  const actions = getAvailableActions(currentState);

  const handleAction = async (targetState: FindingWorkflowState) => {
    setLoading(true);
    setValidationErrors([]);
    setValidationWarnings([]);

    try {
      const result = await transitionFindingState(findingId, targetState, userId, tenantId);

      if (!result.success) {
        setValidationErrors([result.error || 'Unknown error']);
        setShowValidationModal(true);
        setLoading(false);
        return;
      }

      if (result.validation && (result.validation.errors.length > 0 || result.validation.warnings.length > 0)) {
        setValidationErrors(result.validation.errors);
        setValidationWarnings(result.validation.warnings);
        setShowValidationModal(true);
        setLoading(false);
        return;
      }

      // Trigger notifications
      if (targetState === 'ISSUED_FOR_RESPONSE' && auditeeId && responseDueDate) {
        const { data: finding } = await supabase
          .from('audit_findings')
          .select('title')
          .eq('id', findingId)
          .single();

        if (finding) {
          await notifyFindingIssued(
            findingId,
            finding.title,
            auditeeId,
            responseDueDate,
            tenantId
          );
        }
      }

      if (targetState === 'VALIDATED' && auditeeId) {
        const { data: finding } = await supabase
          .from('audit_findings')
          .select('title')
          .eq('id', findingId)
          .single();

        if (finding) {
          await notifyFindingValidated(findingId, finding.title, auditeeId, tenantId);
        }
      }

      if (targetState === 'CLOSED' && auditeeId) {
        const { data: finding } = await supabase
          .from('audit_findings')
          .select('title')
          .eq('id', findingId)
          .single();

        if (finding) {
          await notifyFindingClosed(findingId, finding.title, auditeeId, tenantId);
        }
      }

      onStateChange(targetState);
    } catch (error) {
      console.error('Transition error:', error);
      setValidationErrors(['An unexpected error occurred']);
      setShowValidationModal(true);
    } finally {
      setLoading(false);
    }
  };

  if (actions.length === 0) {
    return null;
  }

  return (
    <>
      <div className="flex gap-3 flex-wrap">
        {actions.map((action) => (
          <button
            key={action.action}
            onClick={() => handleAction(action.targetState)}
            disabled={loading}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${action.buttonClass} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? 'Processing...' : action.label}
          </button>
        ))}
      </div>

      {showValidationModal && (
        <ValidationModal
          errors={validationErrors}
          warnings={validationWarnings}
          onClose={() => setShowValidationModal(false)}
        />
      )}
    </>
  );
}

interface ValidationModalProps {
  errors: string[];
  warnings: string[];
  onClose: () => void;
}

function ValidationModal({ errors, warnings, onClose }: ValidationModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">
              {errors.length > 0 ? 'Transition Blocked' : 'Validation Warnings'}
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {errors.length > 0 && (
            <div className="mb-4">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-red-900 mb-2">
                    Cannot proceed:
                  </h4>
                  <ul className="space-y-1 text-sm text-red-700">
                    {errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {warnings.length > 0 && (
            <div className="mb-4">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-amber-900 mb-2">
                    Warnings:
                  </h4>
                  <ul className="space-y-1 text-sm text-amber-700">
                    {warnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
