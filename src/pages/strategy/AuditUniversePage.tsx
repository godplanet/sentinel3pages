import { useState, useEffect } from 'react';
import { PageHeader } from '@/shared/ui';
import { Map, Plus, Database, Loader2 } from 'lucide-react';
import { useAuditEntities, useCreateEntity } from '@/entities/universe';
import { UniverseListView } from '@/features/universe/ui/UniverseListView';
import { EntityFormModal } from '@/features/universe/ui/EntityFormModal';
import { ACTIVE_TENANT_ID } from '@/shared/lib/constants';

export default function AuditUniversePage() {
  const { data: entities = [], isLoading, refetch } = useAuditEntities();
  const createEntity = useCreateEntity();
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    if (!isLoading && entities.length === 0) {
      autoSeedBasicEntities();
    }
  }, [isLoading, entities.length]);

  const autoSeedBasicEntities = async () => {
    setIsSeeding(true);
    try {
      const basicEntities = [
        {
          name: 'Genel Müdürlük',
          type: 'HEADQUARTERS' as const,
          path: 'genel_mudurluk',
          risk_score: 45,
          velocity_multiplier: 1.0,
          parent_id: null,
          status: 'Active',
          metadata: {},
        },
        {
          name: 'Hazine Yönetimi',
          type: 'PROCESS' as const,
          path: 'genel_mudurluk.hazine_yonetimi',
          risk_score: 72,
          velocity_multiplier: 1.2,
          parent_id: null,
          status: 'Active',
          metadata: {},
        },
        {
          name: 'Kadıköy Şubesi',
          type: 'BRANCH' as const,
          path: 'genel_mudurluk.kadikoy_subesi',
          risk_score: 38,
          velocity_multiplier: 0.9,
          parent_id: null,
          status: 'Active',
          metadata: {},
        },
      ];

      for (const entity of basicEntities) {
        await createEntity.mutateAsync(entity);
      }

      await refetch();
    } catch (error) {
      console.error('Auto-seed failed:', error);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleManualSeed = async () => {
    setIsSeeding(true);
    try {
      await refetch();
      if (entities.length === 0) {
        await autoSeedBasicEntities();
      }
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="w-full px-6 py-4">
        <div className="max-w-full mx-auto space-y-4">
          <PageHeader
            title="Denetim Evreni"
            subtitle="Tüm denetlenebilir varlıkları yönetin"
            icon={Map}
          />

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-slate-700">
                  <Database className="w-4 h-4" />
                  <span className="text-sm font-semibold">
                    Toplam Varlık: <span className="text-blue-600">{entities.length}</span>
                  </span>
                </div>
                <div className="h-4 w-px bg-slate-300" />
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="text-sm">
                    Tenant: <span className="text-xs font-mono text-slate-500">...{ACTIVE_TENANT_ID.slice(-4)}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {entities.length === 0 && !isSeeding && (
                  <button
                    onClick={handleManualSeed}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg text-sm font-semibold hover:bg-slate-700 transition-colors shadow-sm"
                  >
                    <Database className="w-4 h-4" />
                    Örnek Varlık Yükle
                  </button>
                )}

                {isSeeding && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Yükleniyor...
                  </div>
                )}

                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Varlık Ekle
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : entities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Map className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Henüz Varlık Bulunmuyor
                </h3>
                <p className="text-sm text-slate-500 max-w-md mb-4">
                  Denetim evrenine ilk varlığınızı ekleyin veya örnek varlıkları yükleyin
                </p>
              </div>
            ) : (
              <UniverseListView />
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex gap-3">
              <div className="text-blue-600 mt-0.5">ℹ️</div>
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">Varlık Hiyerarşisi Bilgisi</p>
                <ul className="space-y-1 text-blue-800">
                  <li>• <strong>Path</strong> otomatik oluşturulur (varlık adından türetilir)</li>
                  <li>• <strong>Risk Skoru</strong> 0-100 arası olmalıdır</li>
                  <li>• <strong>Velocity</strong> risk değişim hızını gösterir (varsayılan 1.0)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <EntityFormModal
          entity={null}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
