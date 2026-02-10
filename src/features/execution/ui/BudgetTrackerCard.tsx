/**
 * BUDGET TRACKER CARD
 *
 * Displays "Budget vs Actual" progress bar for engagements.
 */

import { Clock, TrendingUp, TrendingDown } from 'lucide-react';
import type { BudgetSummary } from '../time-tracking';

interface BudgetTrackerCardProps {
  budget: BudgetSummary;
  showDetails?: boolean;
}

export function BudgetTrackerCard({ budget, showDetails = true }: BudgetTrackerCardProps) {
  const utilizationPercent = Math.round(budget.utilization_percent);
  const isOverBudget = budget.budget_status === 'OVER_BUDGET';
  const isUnderBudget = budget.budget_status === 'UNDER_BUDGET';

  const getProgressColor = () => {
    if (utilizationPercent >= 110) return 'bg-red-500';
    if (utilizationPercent >= 90) return 'bg-amber-500';
    return 'bg-green-500';
  };

  const getStatusBadge = () => {
    const baseClass = 'px-2 py-1 rounded text-xs font-medium';
    if (isOverBudget) {
      return <span className={`${baseClass} bg-red-100 text-red-700`}>Over Budget</span>;
    }
    if (isUnderBudget) {
      return <span className={`${baseClass} bg-green-100 text-green-700`}>Under Budget</span>;
    }
    return <span className={`${baseClass} bg-blue-100 text-blue-700`}>On Budget</span>;
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-slate-600" />
          <span className="font-semibold text-slate-900">Budget Tracker</span>
        </div>
        {getStatusBadge()}
      </div>

      {showDetails && (
        <div className="mb-4">
          <div className="text-2xl font-bold text-slate-900">
            {budget.title}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex justify-between items-baseline">
          <span className="text-sm text-slate-600">Actual Hours</span>
          <span className="text-2xl font-bold text-slate-900">
            {budget.actual_hours}
          </span>
        </div>

        <div className="flex justify-between items-baseline">
          <span className="text-sm text-slate-600">Estimated Hours</span>
          <span className="text-lg font-semibold text-slate-600">
            {budget.estimated_hours}
          </span>
        </div>

        <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${getProgressColor()} transition-all duration-500`}
            style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-600">Utilization</span>
          <span className="font-semibold text-slate-900">
            {utilizationPercent}%
          </span>
        </div>

        <div
          className={`flex items-center gap-2 p-3 rounded-lg ${
            budget.variance_hours > 0
              ? 'bg-red-50 text-red-700'
              : 'bg-green-50 text-green-700'
          }`}
        >
          {budget.variance_hours > 0 ? (
            <>
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">
                +{budget.variance_hours}h over budget
              </span>
            </>
          ) : (
            <>
              <TrendingDown className="h-4 w-4" />
              <span className="text-sm font-medium">
                {Math.abs(budget.variance_hours)}h under budget
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
