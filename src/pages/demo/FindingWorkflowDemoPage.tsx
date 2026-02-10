/**
 * FINDING LIFECYCLE WORKFLOW DEMO
 *
 * Demonstrates:
 * 1. State machine with strict transitions
 * 2. Chevron progress bar
 * 3. Validation blocking
 * 4. Automated notifications
 */

import { useState } from 'react';
import { PageHeader } from '@/shared/ui';
import {
  WorkflowProgressBar,
  WorkflowChevronBar,
  type FindingWorkflowState,
  getStateDisplayInfo,
  getAllowedTransitions,
} from '@/features/finding-workflow';
import { CheckCircle, XCircle, AlertTriangle, Bell } from 'lucide-react';

export default function FindingWorkflowDemoPage() {
  const [selectedState, setSelectedState] = useState<FindingWorkflowState>('DRAFT');
  const [showChevron, setShowChevron] = useState(false);

  const stateInfo = getStateDisplayInfo(selectedState);
  const allowedTransitions = getAllowedTransitions(selectedState);

  const mockValidationResults = {
    DRAFT: {
      canIssue: false,
      errors: ['Root Cause is required', 'Impact description is required', 'Risk Rating must be assigned'],
      warnings: ['Consider setting a response due date'],
    },
    ISSUED_FOR_RESPONSE: {
      canValidate: false,
      errors: ['Management Response is required', 'Target Completion Date must be set'],
      warnings: ['No action plans linked'],
    },
    VALIDATED: {
      canClose: false,
      errors: ['Cannot close finding: 2 action plan(s) are not completed'],
      warnings: [],
    },
  };

  const states: FindingWorkflowState[] = [
    'DRAFT',
    'ISSUED_FOR_RESPONSE',
    'UNDER_REVIEW',
    'VALIDATED',
    'CLOSED',
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <PageHeader
        title="Finding Lifecycle State Machine Demo"
        description="Strict workflow enforcement with validation and automated notifications"
        breadcrumbs={[
          { label: 'Demo', href: '/demo' },
          { label: 'Finding Workflow' },
        ]}
      />

      <div className="max-w-7xl mx-auto mt-8 space-y-8">
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">
              Current State: {stateInfo.label}
            </h3>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={showChevron}
                  onChange={(e) => setShowChevron(e.target.checked)}
                  className="rounded"
                />
                Chevron Style
              </label>
            </div>
          </div>

          {showChevron ? (
            <WorkflowChevronBar currentState={selectedState} />
          ) : (
            <WorkflowProgressBar currentState={selectedState} />
          )}

          <div className="mt-6 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-sm text-slate-600 mb-2">
              <strong>Description:</strong> {stateInfo.description}
            </div>
            <div className="text-sm text-slate-600">
              <strong>Allowed transitions:</strong>{' '}
              {allowedTransitions.length > 0
                ? allowedTransitions.map((s) => getStateDisplayInfo(s).label).join(', ')
                : 'None'}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Simulate State Changes
            </h3>
            <div className="space-y-2">
              {states.map((state) => (
                <button
                  key={state}
                  onClick={() => setSelectedState(state)}
                  className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                    selectedState === state
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="font-medium text-slate-900">
                    {getStateDisplayInfo(state).label}
                  </div>
                  <div className="text-sm text-slate-600 mt-1">
                    {getStateDisplayInfo(state).description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Validation Rules
            </h3>
            <div className="space-y-4">
              {selectedState === 'DRAFT' && (
                <ValidationCard
                  title="DRAFT → ISSUED_FOR_RESPONSE"
                  passed={false}
                  errors={mockValidationResults.DRAFT.errors}
                  warnings={mockValidationResults.DRAFT.warnings}
                />
              )}

              {selectedState === 'ISSUED_FOR_RESPONSE' && (
                <ValidationCard
                  title="ISSUED → VALIDATED"
                  passed={false}
                  errors={mockValidationResults.ISSUED_FOR_RESPONSE.errors}
                  warnings={mockValidationResults.ISSUED_FOR_RESPONSE.warnings}
                />
              )}

              {selectedState === 'VALIDATED' && (
                <ValidationCard
                  title="VALIDATED → CLOSED"
                  passed={false}
                  errors={mockValidationResults.VALIDATED.errors}
                  warnings={mockValidationResults.VALIDATED.warnings}
                />
              )}

              {selectedState === 'UNDER_REVIEW' && (
                <ValidationCard
                  title="UNDER_REVIEW → VALIDATED"
                  passed={true}
                  errors={[]}
                  warnings={['All validation checks passed']}
                />
              )}

              {selectedState === 'CLOSED' && (
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-900">
                        Finding Closed
                      </h4>
                      <p className="text-sm text-green-700 mt-1">
                        All action items completed and verified.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-900">
              Automated Notifications
            </h3>
          </div>

          <div className="space-y-3">
            <NotificationExample
              type="FINDING_ISSUED"
              title="Action Required: New Finding"
              message='Please provide management response for Finding: "Weak Password Policy". Due: Feb 23, 2026'
              priority="HIGH"
            />

            <NotificationExample
              type="FINDING_OVERDUE"
              title="Reminder: Finding Response Overdue"
              message='Finding "Weak Password Policy" is 3 days overdue. Please provide your response as soon as possible.'
              priority="MEDIUM"
            />

            <NotificationExample
              type="FINDING_ESCALATED"
              title="⚠️ CRITICAL: Finding Response SEVERELY Overdue"
              message='Finding "Weak Password Policy" is 10 days overdue. This has been escalated to management.'
              priority="CRITICAL"
            />
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Implementation Details
          </h3>
          <div className="space-y-4 text-sm text-slate-600">
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">
                State Machine Logic
              </h4>
              <ul className="list-disc list-inside space-y-1">
                <li>5 strict states: DRAFT, ISSUED, REVIEW, VALIDATED, CLOSED</li>
                <li>Enforces allowed transitions only</li>
                <li>Validates each transition before allowing it</li>
                <li>Blocks invalid transitions with error messages</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-2">
                Validation Rules (The Guardrails)
              </h4>
              <ul className="list-disc list-inside space-y-1">
                <li>DRAFT → ISSUED: Requires root cause, impact, and risk rating</li>
                <li>ISSUED → VALIDATED: Requires management response and target date</li>
                <li>VALIDATED → CLOSED: Requires all action plans to be 100% complete</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-2">
                The Nagging Bot
              </h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Checks for overdue findings on system load</li>
                <li>Sends reminder notifications to auditees</li>
                <li>Escalates to manager if 7+ days overdue</li>
                <li>Marks as CRITICAL if 14+ days overdue</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-2">
                Files Created
              </h4>
              <ul className="list-disc list-inside space-y-1">
                <li>src/features/finding-workflow/workflow.ts - State machine logic</li>
                <li>src/features/finding-workflow/notifications.ts - Notification engine</li>
                <li>src/features/finding-workflow/ui/WorkflowProgressBar.tsx - Progress UI</li>
                <li>src/features/finding-workflow/ui/WorkflowActionButtons.tsx - Action buttons</li>
                <li>supabase/migrations/*_create_finding_lifecycle_notifications_v2.sql</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ValidationCardProps {
  title: string;
  passed: boolean;
  errors: string[];
  warnings: string[];
}

function ValidationCard({ title, passed, errors, warnings }: ValidationCardProps) {
  return (
    <div
      className={`p-4 rounded-lg border-2 ${
        passed
          ? 'bg-green-50 border-green-200'
          : 'bg-red-50 border-red-200'
      }`}
    >
      <div className="flex items-start gap-3 mb-3">
        {passed ? (
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        ) : (
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        )}
        <h4 className={`font-semibold ${passed ? 'text-green-900' : 'text-red-900'}`}>
          {title}
        </h4>
      </div>

      {errors.length > 0 && (
        <div className="ml-8">
          <p className="text-sm font-medium text-red-700 mb-1">Blocked by:</p>
          <ul className="space-y-1 text-sm text-red-600">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="ml-8 mt-2">
          <p className="text-sm font-medium text-amber-700 mb-1">Warnings:</p>
          <ul className="space-y-1 text-sm text-amber-600">
            {warnings.map((warning, index) => (
              <li key={index}>• {warning}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

interface NotificationExampleProps {
  type: string;
  title: string;
  message: string;
  priority: string;
}

function NotificationExample({ type, title, message, priority }: NotificationExampleProps) {
  const getPriorityColor = (p: string) => {
    if (p === 'CRITICAL') return 'border-red-500 bg-red-50';
    if (p === 'HIGH') return 'border-amber-500 bg-amber-50';
    return 'border-blue-500 bg-blue-50';
  };

  const getPriorityBadge = (p: string) => {
    if (p === 'CRITICAL') return 'bg-red-600 text-white';
    if (p === 'HIGH') return 'bg-amber-600 text-white';
    return 'bg-blue-600 text-white';
  };

  return (
    <div className={`p-4 rounded-lg border-l-4 ${getPriorityColor(priority)}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-4 h-4 text-slate-600" />
            <span className="text-xs font-medium text-slate-600">{type}</span>
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${getPriorityBadge(priority)}`}>
              {priority}
            </span>
          </div>
          <h4 className="font-semibold text-slate-900 mb-1">{title}</h4>
          <p className="text-sm text-slate-600">{message}</p>
        </div>
      </div>
    </div>
  );
}
