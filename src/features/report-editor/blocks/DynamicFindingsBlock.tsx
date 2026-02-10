/**
 * DYNAMIC FINDINGS TABLE BLOCK
 *
 * Live-updating table that fetches findings from selected engagement.
 * Eliminates copy-pasting by pulling real-time data from database.
 */

import { useEffect, useState } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import {
  fetchEngagementFindings,
  generateFindingsTableHTML,
  type FindingData,
} from '@/features/reporting/integration';

interface DynamicFindingsBlockProps {
  engagementId?: string;
  onRemove?: () => void;
  readOnly?: boolean;
}

export function DynamicFindingsBlock({
  engagementId,
  onRemove,
  readOnly = false,
}: DynamicFindingsBlockProps) {
  const [findings, setFindings] = useState<FindingData[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadFindings = async () => {
    if (!engagementId) {
      setError('No engagement selected');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchEngagementFindings(engagementId);
      setFindings(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load findings:', err);
      setError('Failed to load findings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFindings();
  }, [engagementId]);

  if (!engagementId) {
    return (
      <div className="border-2 border-dashed border-amber-300 bg-amber-50 rounded-lg p-8 text-center">
        <AlertCircle className="w-12 h-12 text-amber-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-amber-900 mb-2">
          No Engagement Selected
        </h3>
        <p className="text-sm text-amber-700">
          Please select an engagement from the Data Sources panel to display findings.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-2 border-dashed border-red-300 bg-red-50 rounded-lg p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Findings</h3>
        <p className="text-sm text-red-700 mb-4">{error}</p>
        <button
          onClick={loadFindings}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const getRiskBadgeClass = (level: string): string => {
    switch (level) {
      case 'Critical':
        return 'bg-red-600 text-white';
      case 'High':
        return 'bg-orange-500 text-white';
      case 'Medium':
        return 'bg-amber-500 text-white';
      case 'Low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-slate-400 text-white';
    }
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString || dateString === 'TBD') return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative">
      {!readOnly && (
        <div className="flex items-center justify-between mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <RefreshCw className="w-4 h-4" />
              <span className="font-medium">Live Data</span>
            </div>
            {lastUpdated && (
              <span className="text-xs text-blue-600">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadFindings}
              disabled={loading}
              className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-white border border-blue-300 rounded hover:bg-blue-50 transition-colors disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            {onRemove && (
              <button
                onClick={onRemove}
                className="px-3 py-1.5 text-xs font-medium text-red-700 bg-white border border-red-300 rounded hover:bg-red-50 transition-colors"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      )}

      {loading && !findings.length ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-600">Loading findings...</p>
        </div>
      ) : findings.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-lg">
          <p className="text-slate-500 italic">No findings available for this engagement</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase border">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase border">
                  Finding
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase border">
                  Risk
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase border">
                  Root Cause
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase border">
                  Recommendation
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase border">
                  Management Response
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase border">
                  Target Date
                </th>
              </tr>
            </thead>
            <tbody>
              {findings.map((finding, index) => (
                <tr key={finding.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900 border">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-900 border">
                    <div className="font-semibold">{finding.title}</div>
                    <div className="text-xs text-slate-600 mt-1">
                      {finding.description.substring(0, 100)}
                      {finding.description.length > 100 ? '...' : ''}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center border">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getRiskBadgeClass(
                        finding.risk_level
                      )}`}
                    >
                      {finding.risk_level}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 border max-w-xs">
                    <div className="line-clamp-2">{finding.root_cause}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 border max-w-xs">
                    <div className="line-clamp-2">{finding.recommendation}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 border max-w-xs">
                    <div className="line-clamp-2">{finding.management_response}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 text-center border">
                    {formatDate(finding.target_completion_date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {findings.length > 0 && (
        <div className="mt-4 text-xs text-slate-500 text-right">
          Total Findings: {findings.length}
        </div>
      )}
    </div>
  );
}

export function DynamicStatisticsBlock({ engagementId }: { engagementId?: string }) {
  const [findings, setFindings] = useState<FindingData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!engagementId) return;

    setLoading(true);
    fetchEngagementFindings(engagementId)
      .then(setFindings)
      .finally(() => setLoading(false));
  }, [engagementId]);

  if (!engagementId) {
    return (
      <div className="text-center p-4 border-2 border-dashed border-slate-300 rounded-lg">
        <p className="text-sm text-slate-500">Select an engagement to view statistics</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
      </div>
    );
  }

  const stats = {
    critical: findings.filter((f) => f.risk_level === 'Critical').length,
    high: findings.filter((f) => f.risk_level === 'High').length,
    medium: findings.filter((f) => f.risk_level === 'Medium').length,
    low: findings.filter((f) => f.risk_level === 'Low').length,
  };

  return (
    <div className="grid grid-cols-4 gap-4 my-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <div className="text-3xl font-bold text-red-700">{stats.critical}</div>
        <div className="text-sm text-red-600 font-medium">Critical</div>
      </div>
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
        <div className="text-3xl font-bold text-orange-700">{stats.high}</div>
        <div className="text-sm text-orange-600 font-medium">High</div>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
        <div className="text-3xl font-bold text-amber-700">{stats.medium}</div>
        <div className="text-sm text-amber-600 font-medium">Medium</div>
      </div>
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <div className="text-3xl font-bold text-green-700">{stats.low}</div>
        <div className="text-sm text-green-600 font-medium">Low</div>
      </div>
    </div>
  );
}
