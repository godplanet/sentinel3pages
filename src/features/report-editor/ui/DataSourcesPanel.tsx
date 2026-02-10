/**
 * DATA SOURCES PANEL
 *
 * Allows users to select an active engagement and drag dynamic data blocks
 * into the report. Eliminates manual copy-pasting.
 */

import { useEffect, useState } from 'react';
import { Database, Table, BarChart3, FileText, RefreshCw, ChevronDown } from 'lucide-react';
import { fetchActiveEngagements } from '@/features/reporting/integration';

interface DataSourcesPanelProps {
  selectedEngagementId: string | null;
  onEngagementSelect: (engagementId: string) => void;
  onBlockDrag: (blockType: string) => void;
}

interface Engagement {
  id: string;
  title: string;
  entity_name: string;
  status: string;
}

export function DataSourcesPanel({
  selectedEngagementId,
  onEngagementSelect,
  onBlockDrag,
}: DataSourcesPanelProps) {
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const loadEngagements = async () => {
    setLoading(true);
    try {
      const data = await fetchActiveEngagements();
      setEngagements(data);
    } catch (error) {
      console.error('Failed to load engagements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEngagements();
  }, []);

  const selectedEngagement = engagements.find((e) => e.id === selectedEngagementId);

  const blocks = [
    {
      id: 'findings-table',
      title: 'Findings Table',
      description: 'Live table of all findings from engagement',
      icon: Table,
      color: 'blue',
    },
    {
      id: 'statistics-summary',
      title: 'Statistics Summary',
      description: 'Risk distribution and key metrics',
      icon: BarChart3,
      color: 'green',
    },
    {
      id: 'executive-summary',
      title: 'Executive Summary',
      description: 'Auto-generated engagement summary',
      icon: FileText,
      color: 'purple',
    },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-2 mb-3">
          <Database className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900">Data Sources</h3>
        </div>
        <p className="text-xs text-slate-600">
          Select an engagement and drag blocks into your report
        </p>
      </div>

      <div className="p-4 border-b border-slate-200">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Select Engagement
        </label>
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            disabled={loading}
            className="w-full flex items-center justify-between px-3 py-2 bg-white border border-slate-300 rounded-lg hover:border-blue-400 transition-colors disabled:opacity-50"
          >
            <span className="text-sm text-slate-900 truncate">
              {loading
                ? 'Loading...'
                : selectedEngagement
                ? selectedEngagement.title
                : 'Choose engagement...'}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-slate-500 transition-transform ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
              {engagements.length === 0 ? (
                <div className="p-3 text-sm text-slate-500 text-center">
                  No active engagements found
                </div>
              ) : (
                engagements.map((engagement) => (
                  <button
                    key={engagement.id}
                    onClick={() => {
                      onEngagementSelect(engagement.id);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors ${
                      selectedEngagementId === engagement.id ? 'bg-blue-100' : ''
                    }`}
                  >
                    <div className="text-sm font-medium text-slate-900">
                      {engagement.title}
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      {engagement.entity_name} • {engagement.status}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <button
          onClick={loadEngagements}
          disabled={loading}
          className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          Refresh List
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <h4 className="text-xs font-semibold text-slate-600 uppercase mb-3">
          Dynamic Blocks
        </h4>

        {!selectedEngagementId && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-3">
            <p className="text-xs text-amber-700">
              Select an engagement first to enable dynamic blocks
            </p>
          </div>
        )}

        <div className="space-y-2">
          {blocks.map((block) => {
            const Icon = block.icon;
            const isDisabled = !selectedEngagementId;

            return (
              <div
                key={block.id}
                draggable={!isDisabled}
                onDragStart={(e) => {
                  if (!isDisabled) {
                    e.dataTransfer.setData('blockType', block.id);
                    e.dataTransfer.setData('engagementId', selectedEngagementId || '');
                    e.dataTransfer.effectAllowed = 'copy';
                  }
                }}
                className={`group border-2 border-dashed rounded-lg p-3 transition-all ${
                  isDisabled
                    ? 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed'
                    : `border-${block.color}-300 bg-${block.color}-50 cursor-move hover:border-${block.color}-500 hover:shadow-md`
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      isDisabled
                        ? 'bg-slate-200'
                        : `bg-${block.color}-100 group-hover:bg-${block.color}-200`
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        isDisabled ? 'text-slate-400' : `text-${block.color}-600`
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-semibold text-slate-900 mb-0.5">
                      {block.title}
                    </h5>
                    <p className="text-xs text-slate-600">{block.description}</p>
                    {!isDisabled && (
                      <p className="text-xs text-slate-500 mt-1 italic">
                        Drag to add to report
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="flex items-start gap-2 text-xs text-slate-600">
          <div className="w-2 h-2 rounded-full bg-green-500 mt-1 flex-shrink-0"></div>
          <p>
            <strong>Live Data:</strong> Blocks automatically fetch the latest data from the
            database. Changes to findings will be reflected in the report.
          </p>
        </div>
      </div>
    </div>
  );
}
