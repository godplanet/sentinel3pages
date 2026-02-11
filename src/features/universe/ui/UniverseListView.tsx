import { useState, useMemo } from 'react';
import { useAuditEntities, useDeleteEntity } from '@/entities/universe';
import { ArrowUpDown, ChevronRight, Edit2, Trash2, AlertCircle, Sparkles } from 'lucide-react';
import type { AuditEntity, EntityType } from '@/entities/universe/model/types';
import { EntityFormModal } from './EntityFormModal';
import { calculateDynamicRisk, getRiskColor as getRiskColorByLevel, getTypeColor } from '../lib/risk-scoring';

const TYPE_LABELS: Record<EntityType, string> = {
  HOLDING: 'Holding',
  BANK: 'Banka',
  GROUP: 'Bölge/Grup',
  UNIT: 'Birim',
  PROCESS: 'Süreç',
  BRANCH: 'Şube',
  DEPARTMENT: 'Departman',
  HEADQUARTERS: 'Genel Müd.',
  IT_ASSET: 'BT Varlığı',
  VENDOR: 'Tedarikçi',
  SUBSIDIARY: 'İştirak',
};

type SortField = 'name' | 'type' | 'risk_score' | 'path';
type SortDirection = 'asc' | 'desc';

export function UniverseListView() {
  const { data: entities = [] } = useAuditEntities();
  const deleteEntity = useDeleteEntity();
  const [sortField, setSortField] = useState<SortField>('path');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [editingEntity, setEditingEntity] = useState<AuditEntity | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedEntities = useMemo(() => {
    const sorted = [...entities].sort((a, b) => {
      let aVal: string | number = a[sortField];
      let bVal: string | number = b[sortField];

      if (sortField === 'risk_score') {
        aVal = a.risk_score || 0;
        bVal = b.risk_score || 0;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });

    return sorted;
  }, [entities, sortField, sortDirection]);

  const getLevel = (path: string) => {
    return path.split('.').length - 1;
  };

  const getRiskColor = (score?: number) => {
    if (!score) return 'text-slate-500';
    if (score >= 90) return 'text-red-600 font-bold';
    if (score >= 75) return 'text-amber-600 font-semibold';
    if (score >= 60) return 'text-yellow-600';
    return 'text-emerald-600';
  };

  const getRiskBadge = (score?: number) => {
    if (!score) return 'bg-slate-100 text-slate-600';
    if (score >= 90) return 'bg-red-100 text-red-700 border-red-200';
    if (score >= 75) return 'bg-amber-100 text-amber-700 border-amber-200';
    if (score >= 60) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-slate-900 transition-colors group"
    >
      {children}
      <ArrowUpDown
        size={14}
        className={`opacity-0 group-hover:opacity-100 transition-opacity ${
          sortField === field ? 'opacity-100 text-blue-600' : ''
        }`}
      />
    </button>
  );

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left">
                <SortButton field="name">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    VARLIK ADI
                  </span>
                </SortButton>
              </th>
              <th className="px-6 py-3 text-left">
                <SortButton field="path">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    HİYERARŞİ YOLU
                  </span>
                </SortButton>
              </th>
              <th className="px-6 py-3 text-left">
                <SortButton field="type">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    VARLIK TİPİ
                  </span>
                </SortButton>
              </th>
              <th className="px-6 py-3 text-left">
                <SortButton field="risk_score">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    RİSK PUANI
                  </span>
                </SortButton>
              </th>
              <th className="px-6 py-3 text-center">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  RİSK HIZI
                </span>
              </th>
              <th className="px-6 py-3 text-right">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  İŞLEMLER
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedEntities.map((entity) => {
              const level = getLevel(entity.path);
              const indentation = level * 24;
              const riskResult = calculateDynamicRisk(entity);
              const typeColor = getTypeColor(entity.type);
              const isSynced = entity.metadata?.is_synced === true;

              return (
                <tr
                  key={entity.id}
                  className="hover:bg-slate-50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2" style={{ paddingLeft: `${indentation}px` }}>
                      {level > 0 && (
                        <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                      )}
                      <span className="text-sm font-medium text-slate-900">
                        {entity.name}
                      </span>
                      {isSynced && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-[10px] font-bold rounded uppercase">
                          <Sparkles size={10} />
                          NEW
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded font-mono">
                      {entity.path}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold ${typeColor.bg} ${typeColor.text}`}
                    >
                      <span>{typeColor.icon}</span>
                      {TYPE_LABELS[entity.type]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-md text-sm font-bold tabular-nums ${getRiskColorByLevel(riskResult.level)}`}>
                        {riskResult.calculated_score.toFixed(0)}
                      </span>
                      {riskResult.signals.length > 0 && (
                        <div className="group/tooltip relative">
                          <AlertCircle size={14} className="text-orange-500 cursor-help" />
                          <div className="invisible group-hover/tooltip:visible absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-xl">
                            <div className="font-bold mb-1.5">Risk Sinyalleri:</div>
                            {riskResult.signals.map((signal, idx) => (
                              <div key={idx} className="mb-1.5 pb-1.5 border-b border-slate-700 last:border-0">
                                <div className="text-yellow-300 font-semibold">{signal.source}</div>
                                <div className="text-slate-300">{signal.reason}</div>
                                <div className="text-red-400 font-bold">+{signal.impact} puan</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold border ${getRiskBadge(
                        (entity.velocity_multiplier || 1) * 50
                      )}`}
                    >
                      {entity.velocity_multiplier?.toFixed(2)}x
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingEntity(entity)}
                        className="p-1.5 hover:bg-blue-50 rounded text-blue-600 transition-colors"
                        title="Düzenle"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`"${entity.name}" varlığı ve altındaki tüm hiyerarşi silinecek.\n\nBu işlem geri alınamaz. Emin misiniz?`)) {
                            deleteEntity.mutate(entity.id);
                          }
                        }}
                        className="p-1.5 hover:bg-red-50 rounded text-red-600 transition-colors"
                        title="Sil"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {sortedEntities.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-slate-400 text-sm">Henüz varlık bulunmuyor</div>
          <div className="text-slate-400 text-xs mt-1">Sağ üstteki "Varlık Ekle" butonunu kullanarak yeni varlık ekleyebilirsiniz</div>
        </div>
      )}

      {editingEntity && (
        <EntityFormModal
          entity={editingEntity}
          onClose={() => setEditingEntity(null)}
        />
      )}
    </div>
  );
}
