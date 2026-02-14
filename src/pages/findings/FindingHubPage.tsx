import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileSearch, Plus, Filter, Shield, AlertTriangle, Eye, TrendingUp, LayoutGrid, List, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import { PageHeader } from '@/shared/ui/PageHeader';
import { FindingDataGrid } from '@/widgets/tables/FindingDataGrid';
import { FindingKanbanBoard } from '@/features/finding-hub';
import { NewFindingModal } from '@/features/finding-form';
import { createFinding } from '@/entities/finding/api/mutations';
import type { ComprehensiveFinding, FindingState } from '@/entities/finding/model/types';
import { comprehensiveFindingApi } from '@/entities/finding/api/module5-api';

type RiskLevel = 'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
type StatusFilter = 'ALL' | FindingState;

const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'ALL', label: 'Tum Durumlar' },
  { value: 'DRAFT', label: 'Taslak' },
  { value: 'NEGOTIATION', label: 'Muzakere' },
  { value: 'PENDING_APPROVAL', label: 'Onay Bekliyor' },
  { value: 'CLOSED', label: 'Kapandi' },
  { value: 'FINAL', label: 'Sonuclandi' },
];

type ViewMode = 'list' | 'kanban';

export default function FindingHubPage() {
  const navigate = useNavigate();
  const [findings, setFindings] = useState<ComprehensiveFinding[]>([]);
  const [loading, setLoading] = useState(true);

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filterRisk, setFilterRisk] = useState<RiskLevel>('ALL');
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewFindingModal, setShowNewFindingModal] = useState(false);

  useEffect(() => {
    loadFindings();
  }, []);

  const loadFindings = async () => {
    try {
      setLoading(true);
      const data = await comprehensiveFindingApi.getAll();
      setFindings(data || []);
    } catch (error) {
      console.error('Failed to load findings:', error);
      setFindings([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredFindings = useMemo(() => {
    let filtered = [...findings];
    if (filterRisk !== 'ALL') filtered = filtered.filter(f => f.severity === filterRisk);
    if (filterStatus !== 'ALL') filtered = filtered.filter(f => f.state === filterStatus);
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(f => 
        f.title?.toLowerCase().includes(query) || 
        (f.details as any)?.code?.toLowerCase().includes(query)
      );
    }
    return filtered;
  }, [findings, filterRisk, filterStatus, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: findings.length,
      critical: findings.filter(f => f.severity === 'CRITICAL').length,
      inNegotiation: findings.filter(f => f.state === 'NEGOTIATION').length,
      closed: findings.filter(f => f.state === 'CLOSED' || f.state === 'FINAL').length,
      avgRiskScore: findings.length > 0 ? Math.round(findings.reduce((sum, f) => sum + (f.impact_score || 0), 0) / findings.length) : 0,
    };
  }, [findings]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bulgu Merkezi & Muzakere"
        description="Dinamik risk boyutlari ile bulgu yonetimi - Anayasa tabanli"
        icon={FileSearch}
        action={
          <div className="flex items-center gap-3">
            {/* --- İŞTE İSTEDİĞİNİZ BUTON BURADA --- */}
            <button
              onClick={() => navigate('/execution/findings/zen/new')}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold text-sm"
            >
              <Sparkles size={16} />
              ZenEditor (Demo)
            </button>
            {/* -------------------------------------- */}
            
            <button onClick={() => setShowNewFindingModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-800 shadow-sm transition-all font-medium text-sm">
              <Plus size={16} /> Hızlı Ekle
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-5 gap-4">
        <StatCard label="Toplam Bulgu" value={stats.total} icon={FileSearch} color="blue" />
        <StatCard label="Kritik Risk" value={stats.critical} icon={AlertTriangle} color="red" />
        <StatCard label="Muzakerede" value={stats.inNegotiation} icon={Eye} color="amber" />
        <StatCard label="Kapatildi" value={stats.closed} icon={Shield} color="emerald" />
        <StatCard label="Ort. Risk Skoru" value={stats.avgRiskScore} icon={TrendingUp} color="slate" />
      </div>

      {loading ? (
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-slate-200 p-12 text-center">
          <div className="animate-spin w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
          <span className="text-sm text-slate-600">Bulgular yukleniyor...</span>
        </div>
      ) : filteredFindings.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-slate-200 p-12 text-center">
          <FileSearch size={48} className="mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Henüz bulgu yok</h3>
          <p className="text-sm text-slate-600 mb-4">Yeni bulgu ekleyerek başlayın veya ZenEditor butonunu deneyin.</p>
        </div>
      ) : viewMode === 'list' ? (
        <FindingDataGrid findings={filteredFindings} onRowClick={(f) => navigate(`/execution/findings/${f.id}`)} />
      ) : (
        <FindingKanbanBoard findings={filteredFindings} onFindingUpdate={() => {}} />
      )}

      <NewFindingModal isOpen={showNewFindingModal} onClose={() => setShowNewFindingModal(false)} onSave={() => {}} />
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) {
  const colors: any = { blue: 'text-blue-700', red: 'text-red-700', amber: 'text-amber-700', emerald: 'text-emerald-700', slate: 'text-slate-700' };
  return (
    <div className={`bg-white/80 backdrop-blur-xl rounded-xl border p-4 ${color}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${color}-100`}>
          <Icon size={20} className={colors[color]} />
        </div>
        <div>
          <div className="text-2xl font-black">{value}</div>
          <div className="text-[10px] font-medium opacity-80">{label}</div>
        </div>
      </div>
    </div>
  );
}