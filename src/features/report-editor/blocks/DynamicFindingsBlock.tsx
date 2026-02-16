/**
 * SENTINEL v3.0 - DYNAMIC FINDINGS TABLE BLOCK
 *
 * Live-updating table that fetches findings from Supabase database.
 * Eliminates copy-pasting by pulling real-time data directly from audit_findings table.
 *
 * DESIGN STANDARD: Report Studio (Apple Glass / Remarkable Paper)
 */

import { useEffect, useState } from 'react';
import { RefreshCw, AlertCircle, Database } from 'lucide-react';
import { fetchFindingsByEngagement } from '@/entities/finding/api/supabase-api';
import type { ComprehensiveFinding } from '@/entities/finding/model/types';

interface DynamicFindingsBlockProps {
  engagementId?: string;
  onRemove?: () => void;
  readOnly?: boolean;
  filterBySeverity?: string[]; // ['CRITICAL', 'HIGH'] gibi filtreleme
}

export function DynamicFindingsBlock({
  engagementId,
  onRemove,
  readOnly = false,
  filterBySeverity,
}: DynamicFindingsBlockProps) {
  const [findings, setFindings] = useState<ComprehensiveFinding[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadFindings = async () => {
    if (!engagementId) {
      setError('Engagement seçilmedi');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchFindingsByEngagement(engagementId);

      // Filter by severity if provided
      const filteredData = filterBySeverity && filterBySeverity.length > 0
        ? data.filter(f => filterBySeverity.includes(f.severity))
        : data;

      setFindings(filteredData);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('Failed to load findings:', err);
      setError(err.message || 'Bulgular yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFindings();
  }, [engagementId, filterBySeverity?.join(',')]);

  if (!engagementId) {
    return (
      <div className="border-2 border-dashed border-indigo-300 bg-indigo-50 rounded-xl p-8 text-center">
        <Database className="w-12 h-12 text-indigo-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-indigo-900 mb-2">
          Veri Kaynağı Bekleniyor
        </h3>
        <p className="text-sm text-indigo-700">
          Bulgular tablosunu görmek için bir engagement seçin.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-2 border-dashed border-rose-300 bg-rose-50 rounded-xl p-8 text-center">
        <AlertCircle className="w-12 h-12 text-rose-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-rose-900 mb-2">Hata Oluştu</h3>
        <p className="text-sm text-rose-700 mb-4">{error}</p>
        <button
          onClick={loadFindings}
          className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors font-medium"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  const getSeverityBadge = (severity: string): { color: string; label: string } => {
    const upper = severity.toUpperCase();
    switch (upper) {
      case 'CRITICAL':
        return { color: 'bg-rose-600 text-white', label: 'KRİTİK' };
      case 'HIGH':
        return { color: 'bg-orange-500 text-white', label: 'YÜKSEK' };
      case 'MEDIUM':
        return { color: 'bg-amber-500 text-white', label: 'ORTA' };
      case 'LOW':
        return { color: 'bg-emerald-500 text-white', label: 'DÜŞÜK' };
      case 'OBSERVATION':
        return { color: 'bg-slate-400 text-white', label: 'GÖZLEM' };
      default:
        return { color: 'bg-slate-400 text-white', label: severity };
    }
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString || dateString === 'TBD') return 'Belirlenmedi';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('tr-TR', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return 'Belirlenmedi';
    }
  };

  const stripHTML = (html: string): string => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  return (
    <div className="relative">
      {!readOnly && (
        <div className="flex items-center justify-between mb-4 p-3 bg-indigo-50/50 border border-indigo-200 rounded-lg backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-indigo-700">
              <Database className="w-4 h-4" />
              <span className="font-medium">Canlı Veri</span>
            </div>
            {lastUpdated && (
              <span className="text-xs text-indigo-600">
                Güncelleme: {lastUpdated.toLocaleTimeString('tr-TR')}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadFindings}
              disabled={loading}
              className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-white border border-indigo-300 rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Yenileniyor...' : 'Yenile'}
            </button>
            {onRemove && (
              <button
                onClick={onRemove}
                className="px-3 py-1.5 text-xs font-medium text-rose-700 bg-white border border-rose-300 rounded-lg hover:bg-rose-50 transition-colors"
              >
                Kaldır
              </button>
            )}
          </div>
        </div>
      )}

      {loading && !findings.length ? (
        <div className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-xl border border-slate-200">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-600 font-medium">Bulgular yükleniyor...</p>
        </div>
      ) : findings.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-500 italic">Bu engagement için bulgu bulunamadı</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-slate-100 to-slate-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide border-b border-slate-200">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide border-b border-slate-200">
                  Bulgu
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wide border-b border-slate-200">
                  Şiddet
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide border-b border-slate-200">
                  Neden
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide border-b border-slate-200">
                  Öneri
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wide border-b border-slate-200">
                  Hedef Tarih
                </th>
              </tr>
            </thead>
            <tbody>
              {findings.map((finding, index) => {
                const severityBadge = getSeverityBadge(finding.severity);
                return (
                  <tr
                    key={finding.id}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-slate-900 border-b border-slate-200">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm border-b border-slate-200">
                      <div className="font-semibold text-slate-900">{finding.title}</div>
                      <div className="text-xs text-slate-600 mt-1 line-clamp-2">
                        {stripHTML(finding.condition || finding.cause || '')}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center border-b border-slate-200">
                      <span
                        className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full ${severityBadge.color}`}
                      >
                        {severityBadge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 border-b border-slate-200 max-w-xs">
                      <div className="line-clamp-2">{stripHTML(finding.cause || 'Belirtilmedi')}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 border-b border-slate-200 max-w-xs">
                      <div className="line-clamp-2">
                        {stripHTML(finding.corrective_action || 'Belirtilmedi')}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 text-center border-b border-slate-200">
                      {formatDate(finding.target_date)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {findings.length > 0 && (
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <span>Toplam {findings.length} bulgu</span>
          {filterBySeverity && filterBySeverity.length > 0 && (
            <span className="text-indigo-600 font-medium">
              Filtre: {filterBySeverity.join(', ')}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * DYNAMIC STATISTICS BLOCK
 * Engagement için bulgu istatistiklerini gösterir
 */
export function DynamicStatisticsBlock({ engagementId }: { engagementId?: string }) {
  const [findings, setFindings] = useState<ComprehensiveFinding[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!engagementId) return;

    setLoading(true);
    fetchFindingsByEngagement(engagementId)
      .then(setFindings)
      .catch((err) => console.error('Stats fetch error:', err))
      .finally(() => setLoading(false));
  }, [engagementId]);

  if (!engagementId) {
    return (
      <div className="text-center p-4 border-2 border-dashed border-indigo-300 rounded-xl bg-indigo-50">
        <Database className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
        <p className="text-sm text-indigo-600 font-medium">İstatistik için engagement seçin</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8 bg-white/50 backdrop-blur-sm rounded-xl border border-slate-200">
        <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mx-auto" />
      </div>
    );
  }

  const stats = {
    critical: findings.filter((f) => f.severity === 'CRITICAL').length,
    high: findings.filter((f) => f.severity === 'HIGH').length,
    medium: findings.filter((f) => f.severity === 'MEDIUM').length,
    low: findings.filter((f) => f.severity === 'LOW').length,
    observation: findings.filter((f) => f.severity === 'OBSERVATION').length,
  };

  return (
    <div className="grid grid-cols-4 gap-4 my-6">
      <div className="bg-gradient-to-br from-rose-50 to-rose-100 border-2 border-rose-200 rounded-xl p-5 text-center shadow-sm hover:shadow-md transition-shadow">
        <div className="text-4xl font-bold text-rose-700 mb-1">{stats.critical}</div>
        <div className="text-xs text-rose-600 font-semibold uppercase tracking-wide">Kritik</div>
      </div>
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl p-5 text-center shadow-sm hover:shadow-md transition-shadow">
        <div className="text-4xl font-bold text-orange-700 mb-1">{stats.high}</div>
        <div className="text-xs text-orange-600 font-semibold uppercase tracking-wide">Yüksek</div>
      </div>
      <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 rounded-xl p-5 text-center shadow-sm hover:shadow-md transition-shadow">
        <div className="text-4xl font-bold text-amber-700 mb-1">{stats.medium}</div>
        <div className="text-xs text-amber-600 font-semibold uppercase tracking-wide">Orta</div>
      </div>
      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-xl p-5 text-center shadow-sm hover:shadow-md transition-shadow">
        <div className="text-4xl font-bold text-emerald-700 mb-1">{stats.low}</div>
        <div className="text-xs text-emerald-600 font-semibold uppercase tracking-wide">Düşük</div>
      </div>
    </div>
  );
}
