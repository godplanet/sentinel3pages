import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFindingStore, findingApi, type FindingWithAssignment } from '@/entities/finding';
import { AlertCircle, TrendingUp, DollarSign, Clock, Sparkles, Search, Filter } from 'lucide-react';

export function FindingHubWidget() {
  const navigate = useNavigate();
  const { findings, setFindings, setLoading, isLoading } = useFindingStore();
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

  const stats = {
    total: findings.length,
    critical: findings.filter((f) => f.severity === 'CRITICAL' || f.severity === 'HIGH').length,
    financialImpact: findings.reduce((sum, f) => sum + (f.financial_impact || 0), 0),
    pendingActions: findings.filter((f) => f.assignment?.portal_status === 'PENDING').length,
  };

  const filteredFindings = findings.filter((f) => {
    const matchesSearch =
      f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = filterSeverity === 'ALL' || f.severity === filterSeverity;
    const matchesStatus = filterStatus === 'ALL' || f.main_status === filterStatus;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const severityColors = {
    CRITICAL: 'bg-red-100 text-red-800 border-red-300',
    HIGH: 'bg-orange-100 text-orange-800 border-orange-300',
    MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    LOW: 'bg-blue-100 text-blue-800 border-blue-300',
  };

  const severityLabels = {
    CRITICAL: 'Kritik',
    HIGH: 'Yüksek',
    MEDIUM: 'Orta',
    LOW: 'Düşük',
  };

  function handleRowClick(finding: FindingWithAssignment) {
    if (finding.assignment) {
      navigate(`/portal/${finding.id}`);
    } else {
      navigate(`/findings`);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-sm text-slate-500 font-medium">Toplam Bulgu</div>
          </div>
        </div>

        <div className="bg-white border border-red-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold text-red-900">{stats.critical}</div>
            <div className="text-sm text-red-700 font-medium">Kritik Risk</div>
          </div>
        </div>

        <div className="bg-white border border-green-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold text-green-900">
              {(stats.financialImpact / 1000000).toFixed(1)}M
            </div>
            <div className="text-sm text-green-700 font-medium">Mali Etki (TL)</div>
          </div>
        </div>

        <div className="bg-white border border-yellow-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold text-yellow-900">{stats.pendingActions}</div>
            <div className="text-sm text-yellow-700 font-medium">Bekleyen Aksiyon</div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 rounded-lg p-6 text-white shadow-lg">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm flex-shrink-0">
            <Sparkles className="w-6 h-6 text-purple-200" />
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="text-lg font-semibold">Sentinel AI İçgörü</h3>
            <p className="text-purple-100 leading-relaxed">
              {stats.critical > 0
                ? `Kritik seviye bulgular tespit edildi. ${stats.critical} adet yüksek öncelikli risk derhal değerlendirilmelidir. Mali etki toplamı ${stats.financialImpact.toLocaleString('tr-TR')} TL olarak hesaplanmıştır.`
                : 'Tüm bulgular kontrol altında. Önemli risk sinyali bulunmamaktadır.'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-slate-900">Bulgu Listesi</h2>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Tüm Seviyeler</option>
                <option value="CRITICAL">Kritik</option>
                <option value="HIGH">Yüksek</option>
                <option value="MEDIUM">Orta</option>
                <option value="LOW">Düşük</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Tüm Durumlar</option>
                <option value="ACIK">Açık</option>
                <option value="KAPALI">Kapalı</option>
              </select>
            </div>
          </div>
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Kod
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Başlık
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Risk Seviyesi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Mali Etki
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Atama
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredFindings.map((finding) => (
                  <tr
                    key={finding.id}
                    onClick={() => handleRowClick(finding)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded">
                        {finding.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">{finding.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded border ${
                          severityColors[finding.severity]
                        }`}
                      >
                        {severityLabels[finding.severity]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          finding.main_status === 'ACIK'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {finding.main_status === 'ACIK' ? 'Açık' : 'Kapalı'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-900">
                        {finding.financial_impact > 0
                          ? `${finding.financial_impact.toLocaleString('tr-TR')} TL`
                          : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {finding.assignment ? (
                        <span
                          className={`text-xs px-2 py-1 rounded ${
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
                            ? 'Kabul'
                            : 'Red'}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
