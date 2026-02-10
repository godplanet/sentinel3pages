/**
 * AUDIT UNIVERSE PAGE - Denetim Evreni
 * Interactive Glassmorphism tree with Constitutional risk scoring
 */

import { useState } from 'react';
import { PageHeader } from '@/shared/ui';
import { Map, Database, Sparkles, Search, Plus, Target, CheckSquare } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useRootDomains, buildTree, type TaxonomyEntity } from '@/entities/universe/api';
import { useAuditEntities } from '@/entities/universe/api';
import { GlassUniverseTree } from '@/widgets/UniverseTree/GlassUniverseTree';
import { RiskNodeCard } from '@/widgets/UniverseTree/RiskNodeCard';
import { supabase } from '@/shared/api/supabase';
import { SENTINEL_CONSTITUTION } from '@/shared/config';
import { BulkPlanningModal } from '@/features/planning';
import type { AuditEntity } from '@/entities/universe/model/types';

export default function AuditUniversePage() {
  const [selectedEntity, setSelectedEntity] = useState<TaxonomyEntity | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);
  const [selectedEntityIds, setSelectedEntityIds] = useState<Set<string>>(new Set());
  const [showBulkPlanningModal, setShowBulkPlanningModal] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);

  const { data: rootDomains, isLoading, refetch } = useRootDomains();
  const { data: allEntities, refetch: refetchEntities } = useAuditEntities();

  // Build hierarchical tree
  const treeData = rootDomains ? buildTree(rootDomains) : [];

  /**
   * Initialize Turkish Banking Hierarchy
   */
  const initializeBankingUniverse = async () => {
    setIsInitializing(true);

    try {
      // Clear existing data
      await supabase.from('risk_taxonomy').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      // Root: Genel Müdürlük
      const rootEntities = [
        {
          path: 'GenelMudurluk',
          name: 'Genel Müdürlük',
          type: 'DOMAIN',
          description: 'Kurumsal Yönetim ve Stratejik Planlama',
          risk_weight: 5,
        },
      ];

      await supabase.from('risk_taxonomy').insert(rootEntities);

      // Level 1: Main Divisions
      const divisions = [
        {
          path: 'GenelMudurluk.Krediler',
          name: 'Krediler',
          type: 'PROCESS',
          description: 'Kredi Süreçleri ve Portföy Yönetimi',
          risk_weight: 15,
        },
        {
          path: 'GenelMudurluk.Hazine',
          name: 'Hazine',
          type: 'PROCESS',
          description: 'Hazine İşlemleri ve Likidite Yönetimi',
          risk_weight: 18,
        },
        {
          path: 'GenelMudurluk.BilgiTeknolojileri',
          name: 'Bilgi Teknolojileri',
          type: 'PROCESS',
          description: 'IT Altyapısı ve Dijital Bankacılık',
          risk_weight: 20,
        },
      ];

      await supabase.from('risk_taxonomy').insert(divisions);

      // Level 2: Sub-Processes
      const subProcesses = [
        {
          path: 'GenelMudurluk.Krediler.TicariKrediler',
          name: 'Ticari Krediler',
          type: 'SUB_PROCESS',
          description: 'KOBİ ve Kurumsal Kredi Tahsisi',
          risk_weight: 12,
        },
        {
          path: 'GenelMudurluk.Krediler.BireyselKrediler',
          name: 'Bireysel Krediler',
          type: 'SUB_PROCESS',
          description: 'Tüketici ve Konut Kredileri',
          risk_weight: 10,
        },
        {
          path: 'GenelMudurluk.Hazine.FXIslemleri',
          name: 'Döviz İşlemleri',
          type: 'SUB_PROCESS',
          description: 'Döviz alım-satım ve hedge işlemleri',
          risk_weight: 18,
        },
        {
          path: 'GenelMudurluk.BilgiTeknolojileri.SiberGuvenlik',
          name: 'Siber Güvenlik',
          type: 'SUB_PROCESS',
          description: 'Bilgi güvenliği ve siber tehdit yönetimi',
          risk_weight: 20,
        },
      ];

      await supabase.from('risk_taxonomy').insert(subProcesses);

      // Level 3: Risks
      const risks = [
        {
          path: 'GenelMudurluk.Krediler.TicariKrediler.KrediRiski',
          name: 'Kredi Riski',
          type: 'RISK',
          description: 'Borçlu temerrüt riski',
          risk_weight: 12,
        },
        {
          path: 'GenelMudurluk.Hazine.FXIslemleri.KurRiski',
          name: 'Kur Riski',
          type: 'RISK',
          description: 'Döviz kuru dalgalanma riski',
          risk_weight: 20,
        },
        {
          path: 'GenelMudurluk.BilgiTeknolojileri.SiberGuvenlik.VeriIhlaliRiski',
          name: 'Veri İhlali Riski',
          type: 'RISK',
          description: 'Yetkisiz erişim ve veri sızıntısı',
          risk_weight: 25,
        },
        {
          path: 'GenelMudurluk.BilgiTeknolojileri.SiberGuvenlik.RansomwareRiski',
          name: 'Ransomware Riski',
          type: 'RISK',
          description: 'Fidye yazılımı saldırısı',
          risk_weight: 22,
        },
      ];

      await supabase.from('risk_taxonomy').insert(risks);

      // Level 4: Controls
      const controls = [
        {
          path: 'GenelMudurluk.Krediler.TicariKrediler.KrediRiski.KrediKomitesi',
          name: 'Kredi Komitesi Onayı',
          type: 'CONTROL',
          description: 'Belirli limit üzeri kredilerde komite onayı',
          risk_weight: 3,
        },
        {
          path: 'GenelMudurluk.BilgiTeknolojileri.SiberGuvenlik.VeriIhlaliRiski.SifreleKontrol',
          name: 'Veri Şifreleme',
          type: 'CONTROL',
          description: 'End-to-end şifreleme ve erişim kontrolleri',
          risk_weight: 5,
        },
      ];

      await supabase.from('risk_taxonomy').insert(controls);

      // Refetch data
      await refetch();

      alert('✅ Turkish Banking Universe initialized successfully!');
    } catch (error) {
      console.error('Initialization failed:', error);
      alert('❌ Initialization failed. Check console for details.');
    } finally {
      setIsInitializing(false);
    }
  };

  const handleSelectEntity = (entity: TaxonomyEntity) => {
    if (selectionMode) {
      const newSelected = new Set(selectedEntityIds);
      if (newSelected.has(entity.id)) {
        newSelected.delete(entity.id);
      } else {
        newSelected.add(entity.id);
      }
      setSelectedEntityIds(newSelected);
    } else {
      setSelectedEntity(entity);
    }
  };

  const handleSelectHighRisk = () => {
    if (!allEntities) return;
    const highRiskIds = allEntities
      .filter((e) => (e.risk_score || 0) >= 60)
      .map((e) => e.id);
    setSelectedEntityIds(new Set(highRiskIds));
    setSelectionMode(true);
  };

  const handleOpenBulkPlanning = () => {
    setShowBulkPlanningModal(true);
  };

  const selectedEntitiesForPlanning = allEntities?.filter((e) =>
    selectedEntityIds.has(e.id)
  ) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-screen flex flex-col">
        <PageHeader
          title="Denetim Evreni"
          subtitle="Hiyerarşik Risk Taksonomisi - Constitutional Scoring"
          icon={Map}
        />

        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Control Bar */}
            <div className="backdrop-blur-2xl bg-white/20 rounded-2xl border border-white/30 p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
                    <input
                      type="text"
                      placeholder="Ara..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 pr-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent w-80"
                    />
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 text-white/80 text-sm">
                    <div>
                      <span className="font-semibold">{rootDomains?.length || 0}</span> Domains
                    </div>
                    <div className="w-px h-6 bg-white/20" />
                    <div>
                      <span className="font-semibold">Max Depth:</span> {SENTINEL_CONSTITUTION.HIERARCHY?.MAX_DEPTH || 5}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {!selectionMode ? (
                    <>
                      <button
                        onClick={initializeBankingUniverse}
                        disabled={isInitializing}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Database className="w-5 h-5" />
                        {isInitializing ? 'Initializing...' : 'Initialize'}
                      </button>

                      <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl">
                        <Plus className="w-5 h-5" />
                        Add Entity
                      </button>

                      <button
                        onClick={() => setSelectionMode(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl"
                      >
                        <Target className="w-5 h-5" />
                        Add to Plan
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 px-4 py-3 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 text-white">
                        <CheckSquare className="w-5 h-5 text-green-400" />
                        <span className="font-semibold">{selectedEntityIds.size} Selected</span>
                      </div>

                      <button
                        onClick={handleSelectHighRisk}
                        className="px-6 py-3 bg-orange-500/80 text-white rounded-xl font-semibold hover:bg-orange-500 transition-all"
                      >
                        Select High Risk
                      </button>

                      <button
                        onClick={() => {
                          setSelectionMode(false);
                          setSelectedEntityIds(new Set());
                        }}
                        className="px-6 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all"
                      >
                        Cancel
                      </button>

                      <button
                        onClick={handleOpenBulkPlanning}
                        disabled={selectedEntityIds.size === 0}
                        className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Target className="w-5 h-5" />
                        Generate Plan
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Constitutional Info Banner */}
            <div className="backdrop-blur-2xl bg-blue-500/20 rounded-2xl border-2 border-blue-400/30 p-6 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-400/30 rounded-xl backdrop-blur-xl">
                  <Sparkles className="w-6 h-6 text-blue-200" />
                </div>
                <div className="flex-1 text-white">
                  <h3 className="font-bold text-lg mb-3">📜 SENTINEL CONSTITUTION</h3>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div className="backdrop-blur-xl bg-white/10 rounded-lg p-3">
                      <div className="text-blue-200 text-xs mb-1">Risk Formula</div>
                      <code className="text-white font-mono text-xs">
                        {SENTINEL_CONSTITUTION.RISK.FORMULA}
                      </code>
                    </div>
                    <div className="backdrop-blur-xl bg-white/10 rounded-lg p-3">
                      <div className="text-blue-200 text-xs mb-1">Max Score</div>
                      <div className="text-2xl font-bold text-white">
                        {SENTINEL_CONSTITUTION.RISK.MAX_SCORE}
                      </div>
                    </div>
                    <div className="backdrop-blur-xl bg-white/10 rounded-lg p-3">
                      <div className="text-blue-200 text-xs mb-1">Risk Zones</div>
                      <div className="flex gap-1 mt-1">
                        {Object.entries(SENTINEL_CONSTITUTION.RISK.ZONES).map(([key, zone]) => (
                          <div
                            key={key}
                            className="w-8 h-8 rounded-full border-2 border-white"
                            style={{ backgroundColor: zone.color }}
                            title={zone.label}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="backdrop-blur-xl bg-white/10 rounded-lg p-3">
                      <div className="text-blue-200 text-xs mb-1">Interactive Mode</div>
                      <div className="text-white font-semibold">✨ Real-time Calc</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tree View */}
            <div className="backdrop-blur-2xl bg-white/10 rounded-2xl border border-white/20 p-8 shadow-2xl">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent" />
                </div>
              ) : (
                <GlassUniverseTree
                  entities={treeData}
                  onSelectEntity={handleSelectEntity}
                  selectedId={selectedEntity?.id}
                  selectionMode={selectionMode}
                  selectedIds={selectedEntityIds}
                />
              )}
            </div>

            {/* Instructions */}
            <div className="backdrop-blur-2xl bg-white/10 rounded-2xl border border-white/20 p-6 text-white">
              <h4 className="font-bold mb-3">🎯 Quick Guide</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li>1️⃣ Click "Initialize Banking Universe" to load Turkish banking hierarchy</li>
                <li>2️⃣ Click on any node to open the interactive Risk Editor (right panel)</li>
                <li>3️⃣ Adjust Impact/Likelihood sliders - watch the Neon Glow change in real-time!</li>
                <li>4️⃣ Example: Set "Siber Güvenlik" Impact to 5, Likelihood to 5 → Score turns RED</li>
                <li>5️⃣ Click "Save Changes" to persist your risk assessments</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Editor Panel - Glass Slide-in */}
      <AnimatePresence>
        {selectedEntity && !selectionMode && (
          <RiskNodeCard
            entity={selectedEntity}
            onClose={() => setSelectedEntity(null)}
          />
        )}
      </AnimatePresence>

      {/* Bulk Planning Modal */}
      {showBulkPlanningModal && (
        <BulkPlanningModal
          selectedEntities={selectedEntitiesForPlanning as AuditEntity[]}
          onClose={() => {
            setShowBulkPlanningModal(false);
            setSelectionMode(false);
            setSelectedEntityIds(new Set());
          }}
          onSuccess={() => {
            refetchEntities();
          }}
        />
      )}
    </div>
  );
}
