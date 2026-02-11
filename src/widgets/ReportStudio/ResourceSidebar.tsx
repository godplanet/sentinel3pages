import { useState, useEffect } from 'react';
import { FileText, FileWarning, BarChart3, Plus, Search, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { getAllFindings } from '@/entities/finding/api/crud';
import type { Finding } from '@/entities/finding/model/types';

interface ResourceSidebarProps {
  engagementId?: string;
  onInsertFinding?: (finding: Finding) => void;
  onInsertChart?: () => void;
}

type TabType = 'toc' | 'findings' | 'charts';

export function ResourceSidebar({
  engagementId,
  onInsertFinding,
  onInsertChart,
}: ResourceSidebarProps) {
  const [activeTab, setActiveTab] = useState<TabType>('findings');
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (engagementId) {
      loadFindings();
    }
  }, [engagementId]);

  const loadFindings = async () => {
    setLoading(true);
    const data = await getAllFindings(engagementId);
    setFindings(data);
    setLoading(false);
  };

  const filteredFindings = findings.filter((f) =>
    f.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabs = [
    { id: 'toc' as TabType, label: 'İçindekiler', icon: FileText },
    { id: 'findings' as TabType, label: 'Bulgular', icon: FileWarning },
    { id: 'charts' as TabType, label: 'Grafikler', icon: BarChart3 },
  ];

  return (
    <div className="h-full flex flex-col bg-white border-r border-slate-200">
      <div className="flex-shrink-0 border-b border-slate-200">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors relative',
                  activeTab === tab.id
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                )}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'toc' && <TOCTab />}
        {activeTab === 'findings' && (
          <FindingsTab
            findings={filteredFindings}
            loading={loading}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onInsertFinding={onInsertFinding}
            onNavigateToHub={() => navigate('/execution/findings')}
          />
        )}
        {activeTab === 'charts' && <ChartsTab onInsertChart={onInsertChart} />}
      </div>
    </div>
  );
}

function TOCTab() {
  return (
    <div className="p-4">
      <div className="text-sm text-slate-500 mb-3 font-medium">DOKUMAN YAPISI</div>
      <div className="space-y-2">
        <div className="pl-0 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded cursor-pointer">
          1. Yönetici Özeti
        </div>
        <div className="pl-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded cursor-pointer">
          1.1 Kapsam
        </div>
        <div className="pl-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded cursor-pointer">
          1.2 Metodoloji
        </div>
        <div className="pl-0 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded cursor-pointer">
          2. Tespit Edilen Bulgular
        </div>
        <div className="pl-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded cursor-pointer">
          2.1 Kritik Bulgular
        </div>
        <div className="pl-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded cursor-pointer">
          2.2 Yüksek Riskli Bulgular
        </div>
        <div className="pl-0 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded cursor-pointer">
          3. Öneriler
        </div>
      </div>
      <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
        İçindekiler otomatik olarak başlıklarınızdan oluşturulacaktır.
      </div>
    </div>
  );
}

interface FindingsTabProps {
  findings: Finding[];
  loading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onInsertFinding?: (finding: Finding) => void;
  onNavigateToHub?: () => void;
}

function FindingsTab({
  findings,
  loading,
  searchQuery,
  onSearchChange,
  onInsertFinding,
  onNavigateToHub,
}: FindingsTabProps) {
  const severityColors = {
    Critical: 'bg-red-100 text-red-700 border-red-300',
    High: 'bg-orange-100 text-orange-700 border-orange-300',
    Medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    Low: 'bg-blue-100 text-blue-700 border-blue-300',
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 p-4 border-b border-slate-200 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Bulgu ara..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {onNavigateToHub && (
          <button
            onClick={onNavigateToHub}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-md transition-all text-sm font-medium"
          >
            <ExternalLink size={14} />
            Bulgu Merkezine Git
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
            <p className="text-sm text-slate-500 mt-3">Bulgular yükleniyor...</p>
          </div>
        ) : findings.length === 0 ? (
          <div className="text-center py-8">
            <FileWarning className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Bulgu bulunamadı</p>
          </div>
        ) : (
          findings.map((finding) => {
            const severityClass =
              severityColors[finding.severity as keyof typeof severityColors] ||
              severityColors.Medium;
            return (
              <div
                key={finding.id}
                className="bg-white border border-slate-200 rounded-lg p-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-slate-900 mb-1 line-clamp-2">
                      {finding.title}
                    </div>
                    <div
                      className={clsx(
                        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border',
                        severityClass
                      )}
                    >
                      {finding.severity}
                    </div>
                  </div>
                </div>
                {finding.description && (
                  <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                    {finding.description}
                  </p>
                )}
                <button
                  onClick={() => onInsertFinding?.(finding)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <Plus size={14} />
                  Rapora Ekle
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

interface ChartsTabProps {
  onInsertChart?: () => void;
}

function ChartsTab({ onInsertChart }: ChartsTabProps) {
  const charts = [
    {
      id: 'risk-matrix',
      title: 'Risk Dağılım Matrisi',
      description: 'Bulguların risk seviyesine göre dağılımı',
      preview: 'bg-gradient-to-br from-red-100 to-blue-100',
    },
    {
      id: 'severity-bar',
      title: 'Önem Seviyesi Grafiği',
      description: 'Kritik, Yüksek, Orta, Düşük dağılım',
      preview: 'bg-gradient-to-r from-orange-100 to-yellow-100',
    },
    {
      id: 'timeline',
      title: 'Zaman Çizelgesi',
      description: 'Bulguların tarihsel dağılımı',
      preview: 'bg-gradient-to-r from-blue-100 to-purple-100',
    },
  ];

  return (
    <div className="p-4 space-y-3">
      <div className="text-sm text-slate-500 mb-3 font-medium">GÖRSEL BLOKLAR</div>
      {charts.map((chart) => (
        <div
          key={chart.id}
          className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
        >
          <div className={clsx('h-24 flex items-center justify-center', chart.preview)}>
            <BarChart3 className="text-slate-400" size={32} />
          </div>
          <div className="p-3">
            <div className="font-semibold text-sm text-slate-900 mb-1">{chart.title}</div>
            <p className="text-xs text-slate-600 mb-3">{chart.description}</p>
            <button
              onClick={onInsertChart}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Plus size={14} />
              Ekle
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
