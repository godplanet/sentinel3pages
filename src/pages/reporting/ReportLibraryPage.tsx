import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  X,
  TrendingUp,
  Shield,
  Building2,
  Scale,
  Presentation,
} from 'lucide-react';
import clsx from 'clsx';
import { PageHeader } from '@/shared/ui/PageHeader';
import { MOCK_REPORT_ARCHIVE, MOCK_REPORT_TYPES, MOCK_REPORT_TEMPLATES } from '@/shared/data/mock-reports';

const TYPE_ICONS = {
  [MOCK_REPORT_TYPES.SUBE_DENETIMI]: Building2,
  [MOCK_REPORT_TYPES.SORUSTURMA]: AlertTriangle,
  [MOCK_REPORT_TYPES.BILGI_NOTU]: FileText,
  [MOCK_REPORT_TYPES.UYUM_RAPORU]: Scale,
  [MOCK_REPORT_TYPES.GENEL_MUDUR_SUNUMU]: Presentation,
  [MOCK_REPORT_TYPES.YILLIK_DEGERLENDIRME]: TrendingUp,
  [MOCK_REPORT_TYPES.RISK_ANALIZI]: Shield,
};

const RISK_COLORS = {
  CRITICAL: 'border-red-400 bg-gradient-to-br from-red-50 to-red-100',
  HIGH: 'border-orange-400 bg-gradient-to-br from-orange-50 to-orange-100',
  MEDIUM: 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-yellow-100',
  LOW: 'border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100',
};

const STATUS_CONFIG = {
  draft: { label: 'Taslak', color: 'bg-slate-100 text-slate-700', icon: Clock },
  review: { label: 'İncelemede', color: 'bg-amber-100 text-amber-700', icon: Eye },
  published: { label: 'Yayımlandı', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  archived: { label: 'Arşiv', color: 'bg-slate-200 text-slate-600', icon: FileText },
};

export default function ReportLibraryPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const years = useMemo(() => {
    const yearSet = new Set(
      MOCK_REPORT_ARCHIVE.map((r) => new Date(r.created_at).getFullYear().toString())
    );
    return Array.from(yearSet).sort((a, b) => Number(b) - Number(a));
  }, []);

  const filteredReports = useMemo(() => {
    return MOCK_REPORT_ARCHIVE.filter((report) => {
      const matchesSearch =
        searchQuery === '' ||
        report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.auditor_name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = selectedType === 'ALL' || report.type === selectedType;
      const matchesRisk = selectedRiskLevel === 'ALL' || report.risk_level === selectedRiskLevel;
      const matchesStatus = selectedStatus === 'ALL' || report.status === selectedStatus;
      const matchesYear =
        selectedYear === 'ALL' || new Date(report.created_at).getFullYear().toString() === selectedYear;

      return matchesSearch && matchesType && matchesRisk && matchesStatus && matchesYear;
    });
  }, [searchQuery, selectedType, selectedRiskLevel, selectedStatus, selectedYear]);

  const handleCreateReport = (templateId?: string) => {
    setShowTemplateModal(false);
    navigate(`/reporting/editor/new${templateId ? `?template=${templateId}` : ''}`);
  };

  const handleReportClick = (reportId: string) => {
    navigate(`/reporting/editor/${reportId}`);
  };

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    MOCK_REPORT_ARCHIVE.forEach((r) => {
      counts[r.type] = (counts[r.type] || 0) + 1;
    });
    return counts;
  }, []);

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar Filters */}
      <div className="w-72 bg-white border-r border-slate-200 flex flex-col overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={18} className="text-slate-600" />
            <h3 className="text-sm font-bold text-slate-900">Filtreler</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-2 block">YIL</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="ALL">Tüm Yıllar</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 mb-2 block">RAPOR TİPİ</label>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedType('ALL')}
                  className={clsx(
                    'w-full px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors',
                    selectedType === 'ALL'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  )}
                >
                  Tümü ({MOCK_REPORT_ARCHIVE.length})
                </button>
                {Object.entries(MOCK_REPORT_TYPES).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedType(label)}
                    className={clsx(
                      'w-full px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors flex items-center justify-between',
                      selectedType === label
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-slate-600 hover:bg-slate-100'
                    )}
                  >
                    <span>{label}</span>
                    <span className="text-xs">{typeCounts[label] || 0}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 mb-2 block">RİSK SEVİYESİ</label>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedRiskLevel('ALL')}
                  className={clsx(
                    'w-full px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors',
                    selectedRiskLevel === 'ALL'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  )}
                >
                  Tümü
                </button>
                {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setSelectedRiskLevel(level)}
                    className={clsx(
                      'w-full px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors',
                      selectedRiskLevel === level
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-slate-600 hover:bg-slate-100'
                    )}
                  >
                    {level === 'CRITICAL'
                      ? 'Kritik'
                      : level === 'HIGH'
                      ? 'Yüksek'
                      : level === 'MEDIUM'
                      ? 'Orta'
                      : 'Düşük'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 mb-2 block">DURUM</label>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedStatus('ALL')}
                  className={clsx(
                    'w-full px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors',
                    selectedStatus === 'ALL'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  )}
                >
                  Tümü
                </button>
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedStatus(key)}
                    className={clsx(
                      'w-full px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors',
                      selectedStatus === key
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-slate-600 hover:bg-slate-100'
                    )}
                  >
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 text-xs text-slate-500 text-center border-t border-slate-200 mt-auto">
          Toplam {filteredReports.length} rapor gösteriliyor
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          title="Rapor Kütüphanesi"
          subtitle="Denetim raporları, soruşturmalar ve yönetim sunumları"
          icon={<FileText className="text-blue-600" />}
        >
          <button
            onClick={() => setShowTemplateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus size={18} />
            Yeni Rapor Oluştur
          </button>
        </PageHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rapor ara... (başlık, açıklama, denetçi)"
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              />
            </div>
          </div>

          {/* Report Cards Grid */}
          {filteredReports.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Rapor Bulunamadı</h3>
              <p className="text-slate-500 mb-4">Farklı filtreler deneyin veya yeni rapor oluşturun</p>
              <button
                onClick={() => setShowTemplateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Yeni Rapor Oluştur
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-6">
              {filteredReports.map((report) => {
                const TypeIcon = TYPE_ICONS[report.type] || FileText;
                const statusCfg = STATUS_CONFIG[report.status];
                const StatusIcon = statusCfg.icon;

                return (
                  <div
                    key={report.id}
                    className="group relative bg-white rounded-2xl border-2 border-slate-200 overflow-hidden hover:border-blue-400 hover:shadow-xl transition-all"
                  >
                    {/* Cover Abstract / Header */}
                    <div className={clsx('p-6 border-b-2', RISK_COLORS[report.risk_level])}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            <TypeIcon size={18} className="text-slate-700" />
                          </div>
                          <span className="text-xs font-bold text-slate-700">{report.type}</span>
                        </div>
                        <span
                          className={clsx(
                            'px-2 py-1 text-xs font-bold rounded-full',
                            statusCfg.color
                          )}
                        >
                          {statusCfg.label}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-700 transition-colors">
                        {report.title}
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {report.cover_abstract}
                      </p>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <User size={14} />
                          <span>{report.auditor_name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Calendar size={14} />
                          <span>{new Date(report.created_at).toLocaleDateString('tr-TR')}</span>
                        </div>
                      </div>

                      {report.finding_count > 0 && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
                          <AlertTriangle size={14} className="text-orange-600" />
                          <span className="text-xs font-semibold text-slate-700">
                            {report.finding_count} Bulgu
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <span
                          className={clsx(
                            'px-2 py-0.5 rounded font-medium',
                            report.risk_level === 'CRITICAL'
                              ? 'bg-red-100 text-red-700'
                              : report.risk_level === 'HIGH'
                              ? 'bg-orange-100 text-orange-700'
                              : report.risk_level === 'MEDIUM'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-blue-100 text-blue-700'
                          )}
                        >
                          {report.risk_level === 'CRITICAL'
                            ? 'Kritik Risk'
                            : report.risk_level === 'HIGH'
                            ? 'Yüksek Risk'
                            : report.risk_level === 'MEDIUM'
                            ? 'Orta Risk'
                            : 'Düşük Risk'}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-3 pt-3 border-t border-slate-200">
                        <button
                          onClick={() => navigate(`/reporting/view/${report.id}`)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          <Eye size={16} />
                          Görüntüle
                        </button>
                        <button
                          onClick={() => handleReportClick(report.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
                        >
                          Düzenle
                        </button>
                      </div>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Template Selection Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Rapor Şablonu Seçin</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Standart şablonlardan biri ile başlayın veya boş sayfa ile devam edin
                </p>
              </div>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-slate-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              <button
                onClick={() => handleCreateReport()}
                className="w-full text-left border-2 border-dashed border-slate-300 rounded-xl p-6 hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <Plus size={32} className="text-slate-400 group-hover:text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">Boş Rapor</h3>
                    <p className="text-sm text-slate-600">
                      Sıfırdan başlayın, istediğiniz gibi özelleştirin
                    </p>
                  </div>
                </div>
              </button>

              {MOCK_REPORT_TEMPLATES.map((template) => {
                const TemplateIcon = TYPE_ICONS[template.type] || FileText;
                return (
                  <button
                    key={template.id}
                    onClick={() => handleCreateReport(template.id)}
                    className="w-full text-left border-2 border-slate-200 rounded-xl p-6 hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                        <TemplateIcon size={32} className="text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-slate-900 mb-1">{template.title}</h3>
                        <p className="text-sm text-slate-600 mb-2">{template.description}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                            {template.estimated_time}
                          </span>
                          {template.use_cases.slice(0, 2).map((useCase, i) => (
                            <span key={i} className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded">
                              {useCase}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
