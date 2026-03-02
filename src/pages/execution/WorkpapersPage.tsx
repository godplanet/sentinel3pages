import { useState, useCallback, useMemo, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PageHeader } from '@/shared/ui';
import { WorkpaperGrid, type ControlRow, type ApprovalStatus } from '@/widgets/WorkpaperGrid';
import { WorkpaperSuperDrawer } from '@/widgets/WorkpaperSuperDrawer';
import { FileText, Search, Filter, Database, Loader2 } from 'lucide-react';
import { supabase } from '@/shared/api/supabase';
import { IT_CONTROLS } from './it-controls-data';

const CATEGORY_FILTERS = [
  'All',
  'Access Control',
  'Network Security',
  'Business Continuity',
  'Physical Security',
  'Change Management',
  'Data Protection',
  'Endpoint Security',
  'Governance',
  'Monitoring',
];

interface WorkpaperMapping {
  id: string;
  approval_status: ApprovalStatus;
  tod?: string;
  toe?: string;
  sample_size?: number;
}

export default function WorkpapersPage() {
  const [controls, setControls] = useState<ControlRow[]>(IT_CONTROLS);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [drawerRow, setDrawerRow] = useState<ControlRow | null>(null);
  const [activeWorkpaperId, setActiveWorkpaperId] = useState<string | null>(null);
  const [workpaperMap, setWorkpaperMap] = useState<Record<string, WorkpaperMapping>>({});
  const [dbLoading, setDbLoading] = useState(true);
  const [mappedCount, setMappedCount] = useState(0);

  useEffect(() => {
    loadWorkpaperMappings();
  }, []);

  const loadWorkpaperMappings = async () => {
    try {
      setDbLoading(true);
      const { data, error } = await supabase
        .from('workpapers')
        .select('id, approval_status, data');

      if (error) throw error;
      if (!data) return;

      const map: Record<string, WorkpaperMapping> = {};
      for (const wp of data) {
        const d = wp.data as Record<string, unknown> | null;
        const controlRef = d?.control_ref as string | undefined;
        if (controlRef) {
          map[controlRef] = {
            id: wp.id,
            approval_status: (wp.approval_status as ApprovalStatus) || 'in_progress',
            tod: d?.tod as string | undefined,
            toe: d?.toe as string | undefined,
            sample_size: d?.sample_size as number | undefined,
          };
        }
      }

      setWorkpaperMap(map);
      setMappedCount(Object.keys(map).length);

      setControls(prev => prev.map(c => {
        const wpInfo = map[c.control_id];
        if (!wpInfo) return c;
        return {
          ...c,
          approval_status: wpInfo.approval_status,
          ...(wpInfo.tod ? { tod: wpInfo.tod as ControlRow['tod'] } : {}),
          ...(wpInfo.toe ? { toe: wpInfo.toe as ControlRow['toe'] } : {}),
          ...(wpInfo.sample_size != null ? { sample_size: wpInfo.sample_size } : {}),
        };
      }));
    } catch {
      setWorkpaperMap({});
    } finally {
      setDbLoading(false);
    }
  };

  const filteredControls = useMemo(() => {
    let result = controls;

    if (categoryFilter !== 'All') {
      result = result.filter(r => r.category === categoryFilter);
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(r =>
        r.control_id.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
      );
    }

    return result;
  }, [controls, searchTerm, categoryFilter]);

  const handleUpdate = useCallback((id: string, field: keyof ControlRow, value: unknown) => {
    setControls(prev => prev.map(row =>
      row.id === id ? { ...row, [field]: value } : row
    ));
  }, []);

  const handleOpenDrawer = useCallback((row: ControlRow) => {
    const wpInfo = workpaperMap[row.control_id];
    setDrawerRow(row);
    setActiveWorkpaperId(wpInfo?.id || null);
  }, [workpaperMap]);

  const handleStatusChange = useCallback((workpaperId: string, status: string) => {
    setControls(prev => prev.map(c => {
      const wpInfo = workpaperMap[c.control_id];
      if (wpInfo?.id === workpaperId) {
        return { ...c, approval_status: status as ApprovalStatus };
      }
      return c;
    }));

    const entry = Object.entries(workpaperMap).find(([, v]) => v.id === workpaperId);
    if (entry) {
      setWorkpaperMap(prev => ({
        ...prev,
        [entry[0]]: { ...prev[entry[0]], approval_status: status as ApprovalStatus },
      }));
    }
  }, [workpaperMap]);

  const isDrawerOpen = drawerRow !== null;

  return (
    <>
      <div className="p-6 space-y-6">
        <PageHeader
          title="Workpaper Grid"
          description="Inline editable control testing matrix -- IT General Controls Audit"
          icon={FileText}
        />

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search controls by ID, title, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter size={16} className="text-slate-500" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm font-medium"
                >
                  {CATEGORY_FILTERS.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-sm font-semibold text-slate-600">
                  {filteredControls.length} controls
                </div>
                {dbLoading ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 rounded-lg">
                    <Loader2 size={12} className="animate-spin text-blue-500" />
                    <span className="text-[10px] font-medium text-blue-600">DB Sync</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 rounded-lg" title={`${mappedCount} controls mapped to workpapers in DB`}>
                    <Database size={12} className="text-emerald-500" />
                    <span className="text-[10px] font-medium text-emerald-600">{mappedCount} mapped</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-4">
            <WorkpaperGrid
              data={filteredControls}
              onUpdate={handleUpdate}
              onOpenDrawer={handleOpenDrawer}
            />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              key="drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-slate-900/20 z-40"
              onClick={() => setDrawerRow(null)}
            />
            <motion.div
              key="workpaper-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 35 }}
              className="fixed inset-y-0 right-0 w-[580px] bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col overflow-hidden"
            >
              <WorkpaperSuperDrawer
                row={drawerRow}
                workpaperId={activeWorkpaperId}
                onClose={() => setDrawerRow(null)}
                onStatusChange={handleStatusChange}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
