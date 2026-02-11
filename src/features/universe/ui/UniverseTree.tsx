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

import { useAuditEntities } from '@/entities/universe';
import { CustomEntityNode } from './CustomEntityNode';
import { getLayoutedElements } from '../lib/tree-layout';

const nodeTypes: NodeTypes = {
  entityNode: CustomEntityNode,
};

export const UniverseTree = () => {
  const { data: entities = [] } = useAuditEntities();

  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (entities.length === 0) {
      return { nodes: [], edges: [] };
    }
    return getLayoutedElements(entities, 'TB');
  }, [entities]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const onNodeClick = useCallback((_event: React.MouseEvent, node: any) => {
    console.log('Entity clicked:', node.data);
  }, []);

  if (entities.length === 0) {
    return (
      <div className="w-full h-[600px] bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center">
        <div className="text-center">
          <div className="text-slate-400 text-lg font-bold mb-2">Varlık Bulunamadı</div>
          <div className="text-slate-500 text-sm">
            Denetim evreni verileri yükleniyor veya henüz varlık eklenmemiş...
          </div>
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
        fitViewOptions={{
          padding: 0.2,
          minZoom: 0.5,
          maxZoom: 1.5,
        }}
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
            const type = node.data?.type;
            switch (type) {
              case 'HOLDING':
                return '#334155';
              case 'BANK':
                return '#3b82f6';
              case 'GROUP':
                return '#14b8a6';
              case 'UNIT':
                return '#f59e0b';
              case 'PROCESS':
                return '#64748b';
              case 'BRANCH':
                return '#06b6d4';
              case 'DEPARTMENT':
                return '#f43f5e';
              case 'HEADQUARTERS':
                return '#1e293b';
              case 'IT_ASSET':
                return '#a855f7';
              case 'VENDOR':
                return '#f97316';
              case 'SUBSIDIARY':
                return '#6366f1';
              default:
                return '#9ca3af';
            }
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />
      </ReactFlow>
    </div>
  );
};
