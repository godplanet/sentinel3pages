import { useEffect, useState, useMemo } from 'react';
import { useFindingStore, findingApi, type FindingWithAssignment } from '@/entities/finding';
import { AlertCircle, DollarSign, Filter, Plus, Search } from 'lucide-react';
import { useRiskConstitution } from '@/features/risk-constitution';

interface FindingListProps {
  onSelectFinding?: (finding: FindingWithAssignment) => void;
  onCreateNew?: () => void;
}

const LEGACY_SCORE_MAP: Record<string, number> = {
  'CRITICAL': 95,
  'HIGH': 75,
  'MEDIUM': 50,
  'LOW': 25,
};

export function FindingList({ onSelectFinding, onCreateNew }: FindingListProps) {
  const { findings, setFindings, setLoading, isLoading } = useFindingStore();
  const { constitution } = useRiskConstitution();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  useEffect(() => {
    loadFindings();
  }, []);

  async function loadFindings() {
    setLoading(true);
    try {
      const data = await findingApi.getAll();
      setFindings(data);
    } catch (error) {
      console.error('Failed to load findings:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredFindings = findings.filter((f) => {
    const matchesSearch =
      f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = filterSeverity === 'ALL' || f.severity === filterSeverity;
    const matchesStatus = filterStatus === 'ALL' || f.main_status === filterStatus;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const getSeverityDisplay = useMemo(() => {
    if (!constitution) return (sev: string) => ({ color: '#64748b', label: sev, bgClass: 'bg-slate-100 text-slate-800' });

    return (severity: string) => {
      const score = LEGACY_SCORE_MAP[severity] ?? 50;
      const sorted = [...constitution.risk_ranges].sort((a, b) => b.min - a.min);
      const zone = sorted.find(r => score >= r.min && score <= r.max) || constitution.risk_ranges[0];

      const bgClass = `text-white`;
      return {
        color: zone?.color || '#64748b',
        label: zone?.label || severity,
        bgClass,
      };
    };
  }, [constitution]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Bulgu ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          className="px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">Tüm Öncelikler</option>
          <option value="CRITICAL">Kritik</option>
          <option value="HIGH">Yüksek</option>
          <option value="MEDIUM">Orta</option>
          <option value="LOW">Düşük</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">Tüm Durumlar</option>
          <option value="ACIK">Açık</option>
          <option value="KAPALI">Kapalı</option>
        </select>

        {onCreateNew && (
          <button
            onClick={onCreateNew}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Yeni Bulgu
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-500">Yükleniyor...</div>
      ) : filteredFindings.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          {searchTerm || filterSeverity !== 'ALL' || filterStatus !== 'ALL'
            ? 'Bulgu bulunamadı'
            : 'Henüz bulgu yok'}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFindings.map((finding) => (
            <div
              key={finding.id}
              onClick={() => onSelectFinding?.(finding)}
              className="bg-white border border-slate-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
                      {finding.code}
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded border ${getSeverityDisplay(finding.severity).bgClass}`}
                      style={{ backgroundColor: getSeverityDisplay(finding.severity).color }}
                    >
                      {getSeverityDisplay(finding.severity).label}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        finding.main_status === 'ACIK'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {finding.main_status === 'ACIK' ? 'Açık' : 'Kapalı'}
                    </span>
                  </div>

                  <h3 className="font-medium text-slate-900">{finding.title}</h3>

                  {finding.financial_impact > 0 && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <DollarSign className="w-4 h-4" />
                      <span>
                        Mali Etki: {finding.financial_impact.toLocaleString('tr-TR')} TL
                      </span>
                    </div>
                  )}
                </div>

                {finding.assignment && (
                  <div className="text-xs">
                    <span
                      className={`px-2 py-1 rounded ${
                        finding.assignment.portal_status === 'AGREED'
                          ? 'bg-green-100 text-green-800'
                          : finding.assignment.portal_status === 'DISAGREED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {finding.assignment.portal_status === 'PENDING'
                        ? 'Bekliyor'
                        : finding.assignment.portal_status === 'AGREED'
                        ? 'Kabul Edildi'
                        : 'Reddedildi'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
