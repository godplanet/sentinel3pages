import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; // Yönlendirme için eklendi
import { useFindingStore, findingApi, type FindingWithAssignment } from '@/entities/finding';
import { 
  AlertCircle, DollarSign, Filter, Plus, Search, 
  Layout, ArrowRight, MessageSquare, History, Sparkles 
} from 'lucide-react';
import { useRiskConstitution } from '@/features/risk-constitution';

// YENİ: Evrensel Çekmeceyi İçe Aktarıyoruz
import { UniversalFindingDrawer } from '@/widgets/UniversalFindingDrawer';

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
  const navigate = useNavigate(); // Hook
  const { findings, setFindings, setLoading, isLoading } = useFindingStore();
  const { constitution } = useRiskConstitution();
  
  // Filtre State'leri
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // YENİ: Çekmece (Drawer) Yönetimi
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDrawerFindingId, setSelectedDrawerFindingId] = useState<string | null>(null);
  const [drawerDefaultTab, setDrawerDefaultTab] = useState<'chat' | 'ai' | 'rca' | 'review' | 'history'>('ai');

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

  // YENİ: Bulguya Tıklama (Zen Moduna Git)
  const handleCardClick = (finding: FindingWithAssignment) => {
    // Eğer dışarıdan bir handler verilmişse onu kullan (Esneklik için)
    if (onSelectFinding) {
      onSelectFinding(finding);
    } else {
      // Yoksa direkt Zen Moduna uçur! 🚀
      navigate(`/execution/findings/zen/${finding.id}`);
    }
  };

  // YENİ: Çekmeceyi Açma (Hızlı İşlem)
  const openDrawer = (e: React.MouseEvent, findingId: string, tab: 'chat' | 'ai' | 'history') => {
    e.stopPropagation(); // Kartın tıklamasını engelle
    setSelectedDrawerFindingId(findingId);
    setDrawerDefaultTab(tab);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* --- ARAÇ ÇUBUĞU --- */}
      <div className="flex items-center justify-between gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Bulgu başlığı, kodu veya etiket ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-transparent border-none focus:outline-none text-sm font-medium"
          />
        </div>

        <div className="h-6 w-px bg-slate-200 mx-2" />

        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 focus:outline-none hover:bg-slate-100 transition-colors"
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
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 focus:outline-none hover:bg-slate-100 transition-colors"
        >
          <option value="ALL">Tüm Durumlar</option>
          <option value="ACIK">Açık</option>
          <option value="KAPALI">Kapalı</option>
        </select>

        {onCreateNew && (
          <button
            onClick={onCreateNew}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-xs font-bold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Yeni Bulgu
          </button>
        )}
      </div>

      {/* --- LİSTE İÇERİĞİ --- */}
      {isLoading ? (
        <div className="text-center py-20 text-slate-400 animate-pulse">Veriler Yükleniyor...</div>
      ) : filteredFindings.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
          <Filter className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium text-sm">Kriterlere uygun bulgu bulunamadı.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFindings.map((finding) => (
            <div
              key={finding.id}
              onClick={() => handleCardClick(finding)}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
            >
              {/* Sol Kenar Renk Çizgisi */}
              <div 
                className="absolute left-0 top-0 bottom-0 w-1" 
                style={{ backgroundColor: getSeverityDisplay(finding.severity).color }} 
              />

              <div className="flex items-start justify-between gap-4 pl-3">
                <div className="flex-1 space-y-3">
                  
                  {/* Başlık ve Kod */}
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded tracking-tight">
                      {finding.code}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded shadow-sm ${getSeverityDisplay(finding.severity).bgClass}`}
                      style={{ backgroundColor: getSeverityDisplay(finding.severity).color }}
                    >
                      {getSeverityDisplay(finding.severity).label}
                    </span>
                    {finding.assignment?.portal_status && (
                      <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                        finding.assignment.portal_status === 'AGREED' ? 'bg-green-100 text-green-700' : 
                        finding.assignment.portal_status === 'DISAGREED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {finding.assignment.portal_status === 'PENDING' ? 'Yanıt Bekliyor' : 
                         finding.assignment.portal_status === 'AGREED' ? 'Mutabık' : 'İtiraz'}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-800 text-lg group-hover:text-blue-700 transition-colors">
                    {finding.title}
                  </h3>

                  {/* Alt Bilgiler */}
                  <div className="flex items-center gap-6 text-xs text-slate-500 font-medium">
                    {finding.financial_impact > 0 && (
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>{finding.financial_impact.toLocaleString('tr-TR')} TL</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Layout className="w-3.5 h-3.5" />
                      <span>Süreç: {finding.gias_category || 'Genel'}</span>
                    </div>
                  </div>
                </div>

                {/* YENİ: Hızlı Aksiyon Butonları (Hover'da daha belirgin) */}
                <div className="flex flex-col gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  
                  {/* AI & Notlar */}
                  <button 
                    onClick={(e) => openDrawer(e, finding.id, 'ai')}
                    className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-600 hover:text-white transition-colors"
                    title="AI Analizi ve Notlar"
                  >
                    <Sparkles size={16} />
                  </button>

                  {/* Chat */}
                  <button 
                    onClick={(e) => openDrawer(e, finding.id, 'chat')}
                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                    title="Müzakere Geçmişi"
                  >
                    <MessageSquare size={16} />
                  </button>

                  {/* Tarihçe */}
                  <button 
                    onClick={(e) => openDrawer(e, finding.id, 'history')}
                    className="p-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-600 hover:text-white transition-colors"
                    title="Denetim İzi"
                  >
                    <History size={16} />
                  </button>

                  {/* Git */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleCardClick(finding); }}
                    className="p-2 bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition-colors shadow-md"
                    title="Zen Modunda Aç"
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- EVRENSEL ÇEKMECE BAĞLANTISI --- */}
      <UniversalFindingDrawer 
        isOpen={drawerOpen}
        findingId={selectedDrawerFindingId}
        defaultTab={drawerDefaultTab}
        onClose={() => setDrawerOpen(false)}
        // Çekmeceden de Zen moduna geçiş yapabilmek için:
        currentViewMode="studio" 
        onViewModeChange={(mode) => {
           if (mode === 'zen' && selectedDrawerFindingId) {
             navigate(`/execution/findings/zen/${selectedDrawerFindingId}`);
           }
        }}
      />
    </div>
  );
}