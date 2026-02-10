import { useState, useMemo } from 'react';
import { useAuditEntities, useDeleteEntity } from '@/entities/universe';
import { ArrowUpDown, ChevronRight, Edit2, Trash2, AlertCircle } from 'lucide-react';
import type { AuditEntity, EntityType } from '@/entities/universe/model/types';
import { EntityFormModal } from './EntityFormModal';

const TYPE_LABELS: Record<EntityType, string> = {
  HOLDING: 'Holding',
  BANK: 'Banka',
  GROUP: 'Grup',
  UNIT: 'Birim',
  PROCESS: 'Surec',
  BRANCH: 'Sube',
  DEPARTMENT: 'Departman',
  HEADQUARTERS: 'Genel Md.',
};

const TYPE_COLORS: Record<EntityType, string> = {
  HOLDING: 'bg-slate-100 text-slate-700 border-slate-200',
  BANK: 'bg-blue-100 text-blue-700 border-blue-200',
  GROUP: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  UNIT: 'bg-amber-100 text-amber-700 border-amber-200',
  PROCESS: 'bg-slate-100 text-slate-700 border-slate-200',
  BRANCH: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  DEPARTMENT: 'bg-rose-100 text-rose-700 border-rose-200',
  HEADQUARTERS: 'bg-slate-200 text-slate-800 border-slate-300',
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
                    Varlık Adı
                  </span>
                </SortButton>
              </th>
              <th className="px-6 py-3 text-left">
                <SortButton field="path">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Hiyerarşi Yolu
                  </span>
                </SortButton>
              </th>
              <th className="px-6 py-3 text-left">
                <SortButton field="type">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Tip
                  </span>
                </SortButton>
              </th>
              <th className="px-6 py-3 text-left">
                <SortButton field="risk_score">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Risk Skoru
                  </span>
                </SortButton>
              </th>
              <th className="px-6 py-3 text-center">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Velocity
                </span>
              </th>
              <th className="px-6 py-3 text-right">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  İşlemler
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedEntities.map((entity) => {
              const level = getLevel(entity.path);
              const indentation = level * 24;

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
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded font-mono">
                      {entity.path}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${
                        TYPE_COLORS[entity.type]
                      }`}
                    >
                      {TYPE_LABELS[entity.type]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold tabular-nums ${getRiskColor(entity.risk_score)}`}>
                        {entity.risk_score?.toFixed(1) || 'N/A'}
                      </span>
                      {entity.risk_score && entity.risk_score >= 85 && (
                        <AlertCircle size={14} className="text-red-500" />
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
                        title="Duzenle"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`"${entity.name}" silinecek. Emin misiniz?`)) {
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
          <div className="text-slate-400 text-sm">Henuz varlik bulunmuyor</div>
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
