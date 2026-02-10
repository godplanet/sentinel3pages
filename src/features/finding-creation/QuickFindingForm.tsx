import { useState } from 'react';
import { comprehensiveFindingApi, findingSecretsApi } from '@/entities/finding/api/module5-api';
import type { Finding, FindingSeverity } from '@/entities/finding/model/types';
import { AlertTriangle, Save, X, Loader2 } from 'lucide-react';

interface QuickFindingFormProps {
  engagementId: string;
  workpaperId?: string;
  onSuccess?: (finding: Finding) => void;
  onCancel?: () => void;
}

const SEVERITY_OPTIONS: { value: FindingSeverity; label: string; color: string }[] = [
  { value: 'CRITICAL', label: 'Critical', color: 'bg-red-100 text-red-700 border-red-300' },
  { value: 'HIGH', label: 'High', color: 'bg-orange-100 text-orange-700 border-orange-300' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { value: 'LOW', label: 'Low', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { value: 'OBSERVATION', label: 'Observation', color: 'bg-slate-100 text-slate-700 border-slate-300' },
];

export function QuickFindingForm({ engagementId, workpaperId, onSuccess, onCancel }: QuickFindingFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    severity: 'MEDIUM' as FindingSeverity,
    description: '',
    description_public: '',
    risk_rating: 'MEDIUM' as const,
    gias_category: '',
    impact_score: 3,
    likelihood_score: 3,
  });

  const [secretData, setSecretData] = useState({
    internal_notes: '',
    root_cause_summary: '',
    why_1: '',
    why_2: '',
    why_3: '',
    why_4: '',
    why_5: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      const finding = await comprehensiveFindingApi.create({
        engagement_id: engagementId,
        workpaper_id: workpaperId,
        ...formData,
        state: 'DRAFT',
        code: `F-${Date.now().toString(36).toUpperCase()}`,
        finding_code: `FIND-${Date.now()}`,
      });

      const hasTenantId = engagementId;
      if (hasTenantId && (secretData.internal_notes || secretData.root_cause_summary || secretData.why_1)) {
        await findingSecretsApi.upsert({
          finding_id: finding.id,
          tenant_id: 'YOUR_TENANT_ID',
          ...secretData,
        });
      }

      onSuccess?.(finding);
    } catch (error) {
      console.error('Failed to create finding:', error);
      alert('Failed to create finding. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-slate-200 shadow-lg p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Create Finding</h3>
            <p className="text-sm text-slate-600">Document audit finding and internal analysis</p>
          </div>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Public Information (Visible to Auditee) */}
      <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2 text-blue-900 font-semibold text-sm">
          <AlertTriangle size={16} />
          <span>PUBLIC SECTION (Visible to Auditee)</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Finding Title *</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            placeholder="Brief, clear title for the finding"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Severity *</label>
            <select
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value as FindingSeverity })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              {SEVERITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">GIAS Category</label>
            <input
              type="text"
              value={formData.gias_category}
              onChange={(e) => setFormData({ ...formData, gias_category: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              placeholder="e.g., Operasyonel Risk"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Public Description *</label>
          <textarea
            required
            value={formData.description_public}
            onChange={(e) => setFormData({ ...formData, description_public: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            placeholder="Description that will be shared with the auditee..."
          />
        </div>
      </div>

      {/* Internal Information (Auditor Only - IRON CURTAIN) */}
      <div className="space-y-4 p-4 bg-slate-50 border border-slate-300 rounded-lg">
        <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
          <span className="px-2 py-1 bg-slate-900 text-white text-xs rounded">AUDITOR ONLY</span>
          <span>INTERNAL SECTION (Iron Curtain)</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Internal Notes</label>
          <textarea
            value={secretData.internal_notes}
            onChange={(e) => setSecretData({ ...secretData, internal_notes: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            placeholder="Internal observations, methodology notes..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">5 Whys Root Cause Analysis</label>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((num) => (
              <div key={num}>
                <input
                  type="text"
                  value={secretData[`why_${num}` as keyof typeof secretData]}
                  onChange={(e) =>
                    setSecretData({ ...secretData, [`why_${num}`]: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                  placeholder={`Why ${num}?`}
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Root Cause Summary</label>
          <textarea
            value={secretData.root_cause_summary}
            onChange={(e) => setSecretData({ ...secretData, root_cause_summary: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            placeholder="Summarize the root cause..."
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 shadow-md hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Creating...</span>
            </>
          ) : (
            <>
              <Save size={18} />
              <span>Create Finding</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
