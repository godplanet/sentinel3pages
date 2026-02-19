import { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useAuditUniverse } from '@/entities/universe/api/universe-api';
import { flattenTree } from '@/entities/universe/lib/ltree-parser';
import type { UniverseNode } from '@/entities/universe/model/types';
import { CustomEntityNode } from './CustomEntityNode';
import { getLayoutedElements, type LayoutableEntity } from '../lib/tree-layout';
import { calculateCascadeRisk } from '../lib/risk-scoring';

const nodeTypes: NodeTypes = {
  entityNode: CustomEntityNode,
};

function annotateWithCascadeRisk(node: UniverseNode): UniverseNode {
  const annotatedChildren = node.children?.map(annotateWithCascadeRisk) ?? [];
  const annotated: UniverseNode = { ...node, children: annotatedChildren };
  annotated.cascade_risk = calculateCascadeRisk(annotated);
  return annotated;
}

export const UniverseTree = () => {
  const { data: hierarchy = [], isLoading, error } = useAuditUniverse();

  const flatEntities = useMemo((): LayoutableEntity[] => {
    if (!hierarchy.length) return [];

    const annotated = hierarchy.map(annotateWithCascadeRisk);
    const flat = flattenTree(annotated);

    return flat.map((node) => ({
      id: node.id,
      name: node.name,
      path: node.path,
      type: node.type,
      risk_score: node.cascade_risk ?? node.inherent_risk,
      velocity_multiplier: 1.0,
    }));
  }, [hierarchy]);

  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (!flatEntities.length) return { nodes: [], edges: [] };
    return getLayoutedElements(flatEntities, 'TB');
  }, [flatEntities]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const onNodeClick = useCallback((_event: React.MouseEvent, node: unknown) => {
    console.log('Universe node clicked:', node);
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-[700px] bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Denetim evreni yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[700px] bg-red-50 rounded-xl border border-red-200 flex items-center justify-center">
        <div className="text-center px-8">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-red-600 text-xl font-bold">!</span>
          </div>
          <p className="text-red-700 font-semibold mb-1">Veri yüklenemedi</p>
          <p className="text-sm text-red-500">
            {error instanceof Error ? error.message : 'Beklenmeyen bir hata oluştu'}
          </p>
        </div>
      </div>
    );
  }

  if (!flatEntities.length) {
    return (
      <div className="w-full h-[700px] bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-slate-400 text-2xl">🏛</span>
          </div>
          <p className="text-slate-600 font-semibold text-lg mb-1">Varlık Bulunamadı</p>
          <p className="text-slate-500 text-sm">Denetim evreni henüz yapılandırılmamış</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[700px] bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200 shadow-lg overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2, minZoom: 0.5, maxZoom: 1.5 }}
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        attributionPosition="bottom-right"
      >
        <Background
          color="#cbd5e1"
          gap={20}
          size={1}
          variant={BackgroundVariant.Dots}
        />
        <Controls
          className="bg-white/80 backdrop-blur-md border border-slate-200 shadow-lg rounded-lg"
          showInteractive={false}
        />
        <MiniMap
          className="bg-white/80 backdrop-blur-md border border-slate-200 shadow-lg rounded-lg"
          nodeColor={(node) => {
            const type = node.data?.type as string;
            const typeColorMap: Record<string, string> = {
              HOLDING: '#334155',
              BANK: '#3b82f6',
              GROUP: '#14b8a6',
              UNIT: '#f59e0b',
              PROCESS: '#64748b',
              BRANCH: '#06b6d4',
              DEPARTMENT: '#f43f5e',
              HEADQUARTERS: '#1e293b',
              IT_ASSET: '#8b5cf6',
              VENDOR: '#f97316',
              SUBSIDIARY: '#6366f1',
            };
            return typeColorMap[type] ?? '#9ca3af';
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />
      </ReactFlow>
    </div>
  );
};
