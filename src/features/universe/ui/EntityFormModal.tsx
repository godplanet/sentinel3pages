import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, X, Loader2 } from 'lucide-react';
import { useCreateEntity, useUpdateEntity, useAuditEntities } from '@/entities/universe';
import type { AuditEntity, EntityType } from '@/entities/universe/model/types';

const ENTITY_TYPES: { value: EntityType; label: string }[] = [
  { value: 'HEADQUARTERS', label: 'Genel Müdürlük' },
  { value: 'GROUP', label: 'Bölge / Grup' },
  { value: 'DEPARTMENT', label: 'Departman' },
  { value: 'BRANCH', label: 'Şube' },
  { value: 'UNIT', label: 'Birim' },
  { value: 'PROCESS', label: 'Süreç' },
];

interface EntityFormModalProps {
  entity?: AuditEntity | null;
  onClose: () => void;
}

export function EntityFormModal({ entity, onClose }: EntityFormModalProps) {
  const { data: allEntities = [] } = useAuditEntities();
  const createEntity = useCreateEntity();
  const updateEntity = useUpdateEntity();

  const [name, setName] = useState(entity?.name ?? '');
  const [type, setType] = useState<EntityType>(entity?.type ?? 'BRANCH');
  const [parentId, setParentId] = useState<string>(entity?.parent_id ?? '');
  const [riskScore, setRiskScore] = useState(entity?.risk_score ?? 50);
  const [status, setStatus] = useState(entity?.status ?? 'Active');

  const isEdit = !!entity;
  const isPending = createEntity.isPending || updateEntity.isPending;

  const parentOptions = allEntities.filter(e => e.id !== entity?.id);

  const generatePath = () => {
    const slug = name.toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 30);
    if (parentId) {
      const parent = allEntities.find(e => e.id === parentId);
      return parent ? `${parent.path}.${slug}` : slug;
    }
    return slug;
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;

    if (isEdit) {
      await updateEntity.mutateAsync({
        id: entity.id,
        name: name.trim(),
        type,
        parent_id: parentId || null,
        risk_score: riskScore,
        status,
      });
    } else {
      await createEntity.mutateAsync({
        name: name.trim(),
        type,
        parent_id: parentId || null,
        path: generatePath(),
        risk_score: riskScore,
        velocity_multiplier: 1.0,
        status,
        metadata: {},
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Building2 size={18} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {isEdit ? 'Varlık Düzenle' : 'Yeni Varlık Ekle'}
              </h2>
              <p className="text-xs text-slate-500">Denetim evrenine varlık ekleyin</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Varlık Adı</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="örn: Beşiktaş Şubesi"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Tip</label>
            <select
              value={type}
              onChange={e => setType(e.target.value as EntityType)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {ENTITY_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Üst Varlık (Hiyerarşi)</label>
            <select
              value={parentId}
              onChange={e => setParentId(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Kök Varlık (Üst Yok)</option>
              {parentOptions.map(e => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.type})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Risk Skoru (0-100)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={riskScore}
                onChange={e => setRiskScore(Math.min(100, Math.max(0, +e.target.value)))}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm text-center font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Durum</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Active">Aktif</option>
                <option value="Inactive">Pasif</option>
                <option value="Archived">Arşivlendi</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-lg font-semibold text-sm hover:bg-slate-200 transition-colors">
            İptal
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || isPending}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            {isEdit ? 'Güncelle' : 'Ekle'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
