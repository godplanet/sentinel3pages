/**
 * PAGE INVENTORY & COVERAGE REPORT
 *
 * PURPOSE: "Ghost Hunter" - Shows which pages have live data vs mock/empty
 * LOGIC:
 * 1. Scan all routes from navigation config
 * 2. Query DB for each module's record count
 * 3. Display status: 🟢 Live Data | 🟡 Mock Data | 🔴 Empty/Ghost
 */

import { useState, useEffect } from 'react';
import { FileCheck2, Database, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '@/shared/api/supabase';
import { PageHeader } from '@/shared/ui/PageHeader';

interface PageStatus {
  name: string;
  route: string;
  module: string;
  dataSource: string;
  status: 'live' | 'mock' | 'empty' | 'unknown';
  recordCount?: number;
  error?: string;
}

export default function PageInventoryPage() {
  const [pages, setPages] = useState<PageStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ live: 0, mock: 0, empty: 0, total: 0 });

  useEffect(() => {
    scanAllPages();
  }, []);

  async function scanAllPages() {
    setLoading(true);

    // Define all major pages and their DB dependencies
    const pageDefinitions = [
      // DASHBOARD
      { name: 'Dashboard', route: '/', module: 'Dashboard', table: 'audit_engagements' },
      { name: 'Strategic Analysis', route: '/dashboard/strategic', module: 'Dashboard', table: 'audit_risks' },
      { name: 'Ecosystem View', route: '/dashboard/ecosystem', module: 'Dashboard', table: 'user_profiles' },

      // STRATEGY & RISK
      { name: 'Risk Heatmap', route: '/strategy/heatmap', module: 'Strategy', table: 'audit_risks' },
      { name: 'Audit Universe', route: '/strategy/universe', module: 'Strategy', table: 'audit_universe' },
      { name: 'Neural Map', route: '/strategy/neural-map', module: 'Strategy', table: 'audit_risks' },
      { name: 'Risk Simulation', route: '/strategy/risk-simulation', module: 'Strategy', table: 'audit_risks' },
      { name: 'Strategic Planning', route: '/planning/strategic', module: 'Strategy', table: 'audit_engagements' },

      // EXECUTION (CORE FLOW)
      { name: 'New Engagement', route: '/execution/new', module: 'Execution', table: 'program_templates' },
      { name: 'Agile Engagements', route: '/execution/agile', module: 'Execution', table: 'audit_engagements' },
      { name: 'Sprint Board', route: '/execution/sprint-board', module: 'Execution', table: 'sprints' },
      { name: 'Workpapers', route: '/execution/workpapers', module: 'Execution', table: 'workpapers' },
      { name: 'Finding Hub', route: '/execution/findings', module: 'Execution', table: 'audit_findings' },
      { name: 'Finding Studio', route: '/execution/finding-studio', module: 'Execution', table: 'audit_findings' },

      // LIBRARY
      { name: 'Program Library', route: '/library/programs', module: 'Library', table: 'program_templates' },
      { name: 'Risk Library', route: '/library/risks', module: 'Library', table: 'audit_risks' },
      { name: 'Procedures', route: '/library/procedures', module: 'Library', table: 'audit_procedures' },

      // REPORTING
      { name: 'Report Library', route: '/reporting/library', module: 'Reporting', table: 'audit_reports' },
      { name: 'Report Builder', route: '/reporting/builder', module: 'Reporting', table: 'audit_reports' },
      { name: 'Report Editor', route: '/reporting/editor/:id', module: 'Reporting', table: 'audit_reports' },
      { name: 'Executive Dashboard', route: '/reporting/executive', module: 'Reporting', table: 'audit_reports' },

      // CCM & MONITORING
      { name: 'CCM Predator', route: '/ccm/predator', module: 'CCM', table: 'ccm_anomalies' },
      { name: 'Anomaly Dashboard', route: '/ccm/anomaly', module: 'CCM', table: 'ccm_anomalies' },
      { name: 'Watchtower', route: '/monitoring/watchtower', module: 'Monitoring', table: 'sentinel_probes' },

      // INVESTIGATION
      { name: 'Investigation Hub', route: '/investigation/hub', module: 'Investigation', table: 'investigation_cases' },
      { name: 'Triage Cockpit', route: '/investigation/triage', module: 'Investigation', table: 'whistleblower_tips' },
      { name: 'Whistleblower Portal', route: '/governance/whistleblower', module: 'Investigation', table: 'whistleblower_tips' },

      // GOVERNANCE
      { name: 'Policy Library', route: '/governance/policy', module: 'Governance', table: 'policy_documents' },
      { name: 'Board Reporting', route: '/governance/board', module: 'Governance', table: 'audit_reports' },

      // COMPLIANCE
      { name: 'Compliance Mapper', route: '/compliance', module: 'Compliance', table: 'compliance_frameworks' },
      { name: 'Gap Analysis', route: '/compliance/gap', module: 'Compliance', table: 'compliance_requirements' },

      // TALENT & RESOURCES
      { name: 'Talent OS', route: '/talent-os', module: 'Talent', table: 'auditor_profiles' },
      { name: 'Resource Management', route: '/resources', module: 'Resources', table: 'resource_allocations' },

      // SPECIALIZED MODULES
      { name: 'SOX Manager', route: '/sox', module: 'SOX', table: 'sox_controls' },
      { name: 'ESG Dashboard', route: '/esg', module: 'ESG', table: 'esg_metrics' },
      { name: 'TPRM Dashboard', route: '/tprm', module: 'TPRM', table: 'vendor_assessments' },
      { name: 'Advisory Hub', route: '/advisory', module: 'Advisory', table: 'advisory_projects' },
      { name: 'QAIP Dashboard', route: '/qaip', module: 'QAIP', table: 'qaip_checklists' },

      // AI AGENTS
      { name: 'Mission Control', route: '/ai-agents/mission-control', module: 'AI', table: 'ai_chat_sessions' },
      { name: 'Field Agent', route: '/execution/field-agent', module: 'AI', table: 'ai_chat_sessions' },

      // AUDITEE PORTAL
      { name: 'Auditee Dashboard', route: '/auditee/dashboard', module: 'Auditee', table: 'audit_findings' },
      { name: 'Vendor Portal', route: '/vendor-portal', module: 'Vendor', table: 'vendor_assessments' },
    ];

    const results: PageStatus[] = [];

    for (const page of pageDefinitions) {
      try {
        // Query the table to check if it has data
        const { count, error } = await supabase
          .from(page.table)
          .select('*', { count: 'exact', head: true });

        if (error) {
          results.push({
            ...page,
            dataSource: page.table,
            status: 'empty',
            error: error.message,
          });
        } else if (count === 0) {
          results.push({
            ...page,
            dataSource: page.table,
            status: 'empty',
            recordCount: 0,
          });
        } else {
          results.push({
            ...page,
            dataSource: page.table,
            status: 'live',
            recordCount: count || 0,
          });
        }
      } catch (err) {
        results.push({
          ...page,
          dataSource: page.table,
          status: 'unknown',
          error: 'Query failed',
        });
      }
    }

    setPages(results);

    // Calculate summary
    const liveCount = results.filter((p) => p.status === 'live').length;
    const emptyCount = results.filter((p) => p.status === 'empty').length;
    const mockCount = results.filter((p) => p.status === 'mock').length;

    setSummary({
      live: liveCount,
      mock: mockCount,
      empty: emptyCount,
      total: results.length,
    });

    setLoading(false);
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'live':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'mock':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'empty':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Database className="w-5 h-5 text-gray-400" />;
    }
  }

  function getStatusBadge(status: string) {
    const colors = {
      live: 'bg-green-100 text-green-800 border-green-200',
      mock: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      empty: 'bg-red-100 text-red-800 border-red-200',
      unknown: 'bg-gray-100 text-gray-800 border-gray-200',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colors[status as keyof typeof colors]}`}>
        {status.toUpperCase()}
      </span>
    );
  }

  const coveragePercentage = summary.total > 0 ? Math.round((summary.live / summary.total) * 100) : 0;

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Page Inventory & Coverage Report"
        subtitle="Ghost Hunter - Analyze which pages have live data vs mock/empty"
        icon={<FileCheck2 className="w-8 h-8 text-blue-600" />}
      />

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
            <Database className="w-4 h-4" />
            <span>Total Pages</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{summary.total}</div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-700 text-sm mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>Live Data</span>
          </div>
          <div className="text-3xl font-bold text-green-700">{summary.live}</div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-700 text-sm mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span>Mock Data</span>
          </div>
          <div className="text-3xl font-bold text-yellow-700">{summary.mock}</div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700 text-sm mb-1">
            <XCircle className="w-4 h-4" />
            <span>Empty/Ghost</span>
          </div>
          <div className="text-3xl font-bold text-red-700">{summary.empty}</div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-700 text-sm mb-1">
            <FileCheck2 className="w-4 h-4" />
            <span>Coverage</span>
          </div>
          <div className="text-3xl font-bold text-blue-700">{coveragePercentage}%</div>
        </div>
      </div>

      {/* COVERAGE BAR */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Data Coverage Progress</span>
          <span className="text-sm text-gray-600">{summary.live} / {summary.total} Pages</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${coveragePercentage}%` }}
          />
        </div>
      </div>

      {/* PAGE TABLE */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Page Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Module</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data Source</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Records</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    <Database className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <div>Scanning all pages...</div>
                  </td>
                </tr>
              ) : (
                pages.map((page, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(page.status)}
                        {getStatusBadge(page.status)}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{page.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{page.module}</td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-500">{page.route}</td>
                    <td className="px-4 py-3 text-sm font-mono text-blue-600">{page.dataSource}</td>
                    <td className="px-4 py-3 text-right">
                      {page.status === 'live' ? (
                        <span className="font-semibold text-green-600">{page.recordCount}</span>
                      ) : page.status === 'empty' ? (
                        <span className="text-red-600">0</span>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ACTION PLAN */}
      {summary.empty > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Action Required</h3>
              <p className="text-sm text-red-800">
                {summary.empty} pages have no data. Run the <strong>Turkey Bank Seeder</strong> to populate the database
                with a complete scenario (Users, Entities, Risks, Engagements, Findings).
              </p>
              <button
                onClick={() => window.location.href = '/dev/diagnostics'}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Go to Diagnostics & Run Seeder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
