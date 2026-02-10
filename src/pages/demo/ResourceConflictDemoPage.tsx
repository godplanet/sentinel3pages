/**
 * RESOURCE CONFLICT & TIME TRACKING DEMO
 *
 * Demonstrates:
 * 1. Conflict detection with overlap and fatigue warnings
 * 2. Time logging with automatic budget rollup
 * 3. Budget vs Actual visualization
 */

import { useState } from 'react';
import { PageHeader } from '@/shared/ui';
import { ConflictWarningCard } from '@/features/resources';
import { BudgetTrackerCard } from '@/features/execution';
import type { ConflictCheck } from '@/features/resources/conflicts';
import type { BudgetSummary } from '@/features/execution/time-tracking';

export default function ResourceConflictDemoPage() {
  const [selectedDemo, setSelectedDemo] = useState<'conflict' | 'budget'>('conflict');

  const mockConflictCheck: ConflictCheck = {
    hasConflict: true,
    overlappingEngagements: [
      {
        id: '1',
        title: 'Cybersecurity Audit 2026',
        start_date: '2026-01-15',
        end_date: '2026-03-30',
        status: 'IN_PROGRESS',
        overlap_days: 45,
      },
      {
        id: '2',
        title: 'IT General Controls Review',
        start_date: '2026-02-01',
        end_date: '2026-02-28',
        status: 'PLANNING',
        overlap_days: 28,
      },
    ],
    fatigueWarning: {
      burnout_zone: 'RED',
      fatigue_score: 85,
      active_hours_last_3_weeks: 165,
      consecutive_high_stress_projects: 3,
      message: '⚠️ BURNOUT RISK - Auditor is in RED zone',
    },
    warnings: [
      'Auditor has 2 concurrent audits.',
      '⚠️ BURNOUT RISK - Auditor is in RED zone',
    ],
  };

  const mockNoConflict: ConflictCheck = {
    hasConflict: false,
    overlappingEngagements: [],
    fatigueWarning: null,
    warnings: [],
  };

  const mockBudgetSummary: BudgetSummary = {
    engagement_id: '1',
    title: 'Q1 Financial Audit 2026',
    estimated_hours: 320,
    actual_hours: 380,
    variance_hours: 60,
    utilization_percent: 118.75,
    budget_status: 'OVER_BUDGET',
  };

  const mockOnBudget: BudgetSummary = {
    engagement_id: '2',
    title: 'IT General Controls Review',
    estimated_hours: 160,
    actual_hours: 145,
    variance_hours: -15,
    utilization_percent: 90.63,
    budget_status: 'ON_BUDGET',
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <PageHeader
        title="Resource Conflict & Time Tracking Demo"
        description="Live demonstration of conflict detection and budget tracking systems"
        breadcrumbs={[
          { label: 'Demo', href: '/demo' },
          { label: 'Resource Conflicts' },
        ]}
      />

      <div className="max-w-7xl mx-auto mt-8 space-y-8">
        <div className="flex gap-4">
          <button
            onClick={() => setSelectedDemo('conflict')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedDemo === 'conflict'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            Conflict Detection
          </button>
          <button
            onClick={() => setSelectedDemo('budget')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedDemo === 'budget'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            Budget Tracking
          </button>
        </div>

        {selectedDemo === 'conflict' && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Scenario 1: HIGH RISK - Conflicts Detected
              </h3>
              <ConflictWarningCard conflictCheck={mockConflictCheck} />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Scenario 2: SAFE - No Conflicts
              </h3>
              <ConflictWarningCard conflictCheck={mockNoConflict} />
            </div>
          </div>
        )}

        {selectedDemo === 'budget' && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Scenario 1: Over Budget (118%)
              </h3>
              <BudgetTrackerCard budget={mockBudgetSummary} />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Scenario 2: On Budget (91%)
              </h3>
              <BudgetTrackerCard budget={mockOnBudget} />
            </div>
          </div>
        )}

        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Implementation Details
          </h3>
          <div className="space-y-4 text-sm text-slate-600">
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">
                Conflict Detection Algorithm
              </h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Checks overlapping audit engagements by date range</li>
                <li>Queries talent_profiles.burnout_zone for fatigue status</li>
                <li>Generates warnings: "Auditor has N concurrent audits"</li>
                <li>Blocks assignments if auditor is in RED zone</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-2">
                Time Tracking & Rollup Flow
              </h4>
              <ul className="list-disc list-inside space-y-1">
                <li>logWorkpaperTime() inserts into workpaper_time_logs</li>
                <li>DB Trigger → Updates workpapers.total_hours_spent</li>
                <li>DB Trigger → Updates audit_engagements.actual_hours</li>
                <li>Budget variance calculated automatically</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-2">
                Files Created
              </h4>
              <ul className="list-disc list-inside space-y-1">
                <li>src/features/resources/conflicts.ts - Conflict detection logic</li>
                <li>src/features/execution/time-tracking.ts - Time logging API</li>
                <li>src/features/resources/ui/ConflictWarningCard.tsx - UI component</li>
                <li>src/features/execution/ui/BudgetTrackerCard.tsx - UI component</li>
                <li>supabase/migrations/*_create_workpaper_time_logs_and_rollup.sql</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
