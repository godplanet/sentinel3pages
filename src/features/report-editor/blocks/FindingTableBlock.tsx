/**
 * Finding Table Block - Dynamic Table from unified_findings
 *
 * Fetches and displays open findings in a formatted table
 * for embedding in reports and PDF exports.
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/shared/api/supabase';
import { Loader2, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Finding {
  id: string;
  finding_title: string;
  severity: string;
  status: string;
  risk_score: number;
  entity_name?: string;
  created_at: string;
}

interface FindingTableBlockProps {
  statusFilter?: 'OPEN' | 'CLOSED' | 'ALL';
  limit?: number;
  showStats?: boolean;
}

export function FindingTableBlock({
  statusFilter = 'OPEN',
  limit = 10,
  showStats = true,
}: FindingTableBlockProps) {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFindings();
  }, [statusFilter, limit]);

  const fetchFindings = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('audit_findings')
        .select(
          `
          id,
          finding_title,
          severity,
          status,
          risk_score,
          created_at,
          audit_universe!inner(entity_name)
        `
        )
        .order('created_at', { ascending: false })
        .limit(limit);

      if (statusFilter !== 'ALL') {
        query = query.eq('status', statusFilter);
      }

      const { data, error: err } = await query;

      if (err) throw err;

      const formattedData = (data || []).map((item: any) => ({
        id: item.id,
        finding_title: item.finding_title,
        severity: item.severity,
        status: item.status,
        risk_score: item.risk_score,
        entity_name: item.audit_universe?.entity_name || 'Unknown',
        created_at: item.created_at,
      }));

      setFindings(formattedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load findings');
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    const styles: Record<string, { bg: string; text: string; icon: any }> = {
      Critical: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        icon: AlertTriangle,
      },
      High: {
        bg: 'bg-orange-100',
        text: 'text-orange-700',
        icon: AlertCircle,
      },
      Medium: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        icon: AlertCircle,
      },
      Low: {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        icon: CheckCircle2,
      },
    };

    const style = styles[severity] || styles.Medium;
    const Icon = style.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${style.bg} ${style.text}`}
      >
        <Icon className="w-3 h-3" />
        {severity}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const isOpen = status === 'OPEN' || status === 'Open';
    return (
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${
          isOpen
            ? 'bg-amber-100 text-amber-700'
            : 'bg-green-100 text-green-700'
        }`}
      >
        {status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
          <p className="text-sm text-slate-600">Loading Findings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center bg-red-50 border-2 border-dashed border-red-300 rounded-lg p-12">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const criticalCount = findings.filter((f) => f.severity === 'Critical').length;
  const highCount = findings.filter((f) => f.severity === 'High').length;
  const avgRiskScore =
    findings.length > 0
      ? (findings.reduce((sum, f) => sum + (f.risk_score || 0), 0) / findings.length).toFixed(1)
      : '0';

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
      <div className="px-4 py-3 bg-gradient-to-r from-slate-800 to-slate-900 text-white">
        <h3 className="font-bold text-sm">
          {statusFilter === 'OPEN' ? 'Open Findings' : statusFilter === 'CLOSED' ? 'Closed Findings' : 'All Findings'}
        </h3>
        <p className="text-xs text-slate-400">
          Total: {findings.length} | As of {new Date().toLocaleDateString()}
        </p>
      </div>

      {showStats && (
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div>
              <div className="text-slate-500">Critical Findings</div>
              <div className="font-bold text-red-600 text-lg">{criticalCount}</div>
            </div>
            <div>
              <div className="text-slate-500">High Findings</div>
              <div className="font-bold text-orange-600 text-lg">{highCount}</div>
            </div>
            <div>
              <div className="text-slate-500">Avg Risk Score</div>
              <div className="font-bold text-slate-900 text-lg">{avgRiskScore}</div>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-slate-100 border-b border-slate-200">
            <tr>
              <th className="px-3 py-2 text-left font-semibold text-slate-700">Finding Title</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-700">Entity</th>
              <th className="px-3 py-2 text-center font-semibold text-slate-700">Severity</th>
              <th className="px-3 py-2 text-center font-semibold text-slate-700">Risk Score</th>
              <th className="px-3 py-2 text-center font-semibold text-slate-700">Status</th>
              <th className="px-3 py-2 text-center font-semibold text-slate-700">Date</th>
            </tr>
          </thead>
          <tbody>
            {findings.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-slate-500">
                  No findings found matching criteria
                </td>
              </tr>
            ) : (
              findings.map((finding) => (
                <tr key={finding.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-3 py-2">
                    <div className="font-medium text-slate-900 max-w-md truncate">
                      {finding.finding_title}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-slate-600">{finding.entity_name}</td>
                  <td className="px-3 py-2 text-center">{getSeverityBadge(finding.severity)}</td>
                  <td className="px-3 py-2 text-center">
                    <span
                      className={`font-bold ${
                        finding.risk_score >= 90
                          ? 'text-red-600'
                          : finding.risk_score >= 70
                            ? 'text-orange-600'
                            : finding.risk_score >= 40
                              ? 'text-yellow-600'
                              : 'text-green-600'
                      }`}
                    >
                      {finding.risk_score || 'N/A'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">{getStatusBadge(finding.status)}</td>
                  <td className="px-3 py-2 text-center text-slate-600">
                    {new Date(finding.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-500 text-right">
        Generated from live database query
      </div>
    </div>
  );
}
