/**
 * Neural Map Page - Risk Contagion Network Visualization
 * Turkish UI with English code
 */

import { useState, useCallback, useEffect } from 'react';
import { ReactFlow, Node, Edge, Background, Controls, MiniMap, useNodesState, useEdgesState, Panel } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Activity, TrendingUp, AlertTriangle, Network, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/shared/ui';
import {
  calculateContagion,
  getRiskColor,
  getRiskLevelTR,
  calculateNetworkStats,
  MOCK_NEURAL_NODES,
  MOCK_NEURAL_EDGES,
  type ContagionResult,
  type NetworkStats,
} from '@/features/neural-map';

export default function NeuralMapPage() {
  const [contagionResults, setContagionResults] = useState<Map<string, ContagionResult>>(new Map());
  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);
  const [selectedNode, setSelectedNode] = useState<ContagionResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Convert neural nodes to ReactFlow nodes
  const initialNodes: Node[] = MOCK_NEURAL_NODES.map((node, idx) => ({
    id: node.id,
    type: 'default',
    position: {
      x: (idx % 3) * 300 + 100,
      y: Math.floor(idx / 3) * 200 + 100
    },
    data: {
      label: node.label,
      risk: node.baseRisk,
      type: node.type,
    },
    style: {
      background: getRiskColor(node.baseRisk),
      color: '#fff',
      border: '2px solid rgba(255,255,255,0.3)',
      borderRadius: '12px',
      padding: '16px',
      fontSize: '14px',
      fontWeight: '600',
      boxShadow: `0 0 20px ${getRiskColor(node.baseRisk)}40`,
      width: 180,
    },
  }));

  const initialEdges: Edge[] = MOCK_NEURAL_EDGES.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    animated: true,
    style: {
      stroke: '#64748b',
      strokeWidth: 2,
      opacity: 0.6,
    },
    label: `${Math.round(edge.dependencyWeight * 100)}%`,
    labelStyle: {
      fontSize: '10px',
      fill: '#94a3b8',
    },
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Run contagion simulation
  const runSimulation = useCallback(() => {
    setIsSimulating(true);

    setTimeout(() => {
      const results = calculateContagion(MOCK_NEURAL_NODES, MOCK_NEURAL_EDGES, 3);
      setContagionResults(results);

      const stats = calculateNetworkStats(results);
      setNetworkStats(stats);

      // Update node colors based on effective risk
      setNodes(prevNodes =>
        prevNodes.map(node => {
          const result = results.get(node.id);
          if (result) {
            return {
              ...node,
              data: { ...node.data, risk: result.effectiveRisk },
              style: {
                ...node.style,
                background: getRiskColor(result.effectiveRisk),
                boxShadow: `0 0 20px ${getRiskColor(result.effectiveRisk)}40`,
              },
            };
          }
          return node;
        })
      );

      // Update edge colors based on source risk
      setEdges(prevEdges =>
        prevEdges.map(edge => {
          const sourceResult = results.get(edge.source);
          if (sourceResult && sourceResult.effectiveRisk >= 70) {
            return {
              ...edge,
              style: {
                ...edge.style,
                stroke: getRiskColor(sourceResult.effectiveRisk),
                strokeWidth: 3,
                opacity: 0.8,
              },
              animated: true,
            };
          }
          return edge;
        })
      );

      setIsSimulating(false);
    }, 800);
  }, [setNodes, setEdges]);

  // Run simulation on mount
  useEffect(() => {
    runSimulation();
  }, [runSimulation]);

  // Handle node click
  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    const result = contagionResults.get(node.id);
    if (result) {
      setSelectedNode(result);
    }
  }, [contagionResults]);

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <PageHeader
        title="Sinir Haritası"
        description="Risk Bulaşma Ağı - Kurumsal Bağımlılıklar ve Domino Etkisi"
        icon={Network}
      />

      <div className="flex-1 flex gap-4 p-4">
        {/* Main Network Canvas */}
        <div className="flex-1 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-xl overflow-hidden relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            fitView
            className="bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950"
          >
            <Background color="#94a3b8" gap={16} />
            <Controls className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg" />
            <MiniMap
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
              nodeColor={node => {
                const result = contagionResults.get(node.id);
                return result ? getRiskColor(result.effectiveRisk) : '#94a3b8';
              }}
            />

            {/* Live Badge */}
            <Panel position="top-left" className="m-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/30 rounded-full">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">CANLI SİMÜLASYON</span>
              </div>
            </Panel>

            {/* Stats Panel */}
            {networkStats && (
              <Panel position="top-right" className="m-4">
                <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-xl space-y-3 min-w-[280px]">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Ağ İstatistikleri</h3>
                    <button
                      onClick={runSimulation}
                      disabled={isSimulating}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <RefreshCw className={`w-4 h-4 text-gray-600 dark:text-gray-400 ${isSimulating ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3">
                      <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">Ortalama Risk</div>
                      <div className="text-2xl font-bold text-blue-900 dark:text-blue-300 mt-1">
                        {networkStats.averageRisk.toFixed(1)}
                      </div>
                    </div>

                    <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-3">
                      <div className="text-xs text-red-600 dark:text-red-400 font-medium">Kritik Birim</div>
                      <div className="text-2xl font-bold text-red-900 dark:text-red-300 mt-1">
                        {networkStats.criticalNodes}
                      </div>
                    </div>

                    <div className="bg-orange-50 dark:bg-orange-950/30 rounded-lg p-3">
                      <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">Toplam Bulaşma</div>
                      <div className="text-2xl font-bold text-orange-900 dark:text-orange-300 mt-1">
                        {networkStats.totalContagion.toFixed(1)}
                      </div>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-3">
                      <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">Max Risk</div>
                      <div className="text-2xl font-bold text-purple-900 dark:text-purple-300 mt-1">
                        {networkStats.maxRisk.toFixed(1)}
                      </div>
                    </div>
                  </div>
                </div>
              </Panel>
            )}
          </ReactFlow>
        </div>

        {/* Right Sidebar - Node Details */}
        {selectedNode && (
          <div className="w-96 bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xl p-6 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Birim Detayı</h3>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {MOCK_NEURAL_NODES.find(n => n.id === selectedNode.nodeId)?.label}
              </p>
            </div>

            {/* Risk Scores */}
            <div className="space-y-3">
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-300">Öz Risk (Temel)</span>
                  <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-3xl font-bold text-blue-900 dark:text-blue-200">
                  {selectedNode.baseRisk.toFixed(1)}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  {getRiskLevelTR(selectedNode.baseRisk)}
                </div>
              </div>

              <div className="bg-orange-50 dark:bg-orange-950/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-orange-900 dark:text-orange-300">Bulaşan Risk</span>
                  <TrendingUp className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="text-3xl font-bold text-orange-900 dark:text-orange-200">
                  +{selectedNode.contagionImpact.toFixed(1)}
                </div>
                <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                  Komşu birimlerden gelen
                </div>
              </div>

              <div
                className="rounded-lg p-4"
                style={{
                  backgroundColor: `${getRiskColor(selectedNode.effectiveRisk)}15`,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: getRiskColor(selectedNode.effectiveRisk) }}>
                    Etkin Risk (Toplam)
                  </span>
                  <AlertTriangle className="w-4 h-4" style={{ color: getRiskColor(selectedNode.effectiveRisk) }} />
                </div>
                <div className="text-3xl font-bold" style={{ color: getRiskColor(selectedNode.effectiveRisk) }}>
                  {selectedNode.effectiveRisk.toFixed(1)}
                </div>
                <div className="text-xs mt-1" style={{ color: getRiskColor(selectedNode.effectiveRisk) }}>
                  {getRiskLevelTR(selectedNode.effectiveRisk)}
                </div>
              </div>
            </div>

            {/* Incoming Risks */}
            {selectedNode.incomingRisks.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Risk Kaynakları ({selectedNode.incomingRisks.length})
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedNode.incomingRisks
                    .sort((a, b) => b.contributedRisk - a.contributedRisk)
                    .map((incoming, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-800"
                      >
                        <div className="flex items-start justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {incoming.sourceLabel}
                          </span>
                          <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                            +{incoming.contributedRisk.toFixed(1)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-800 rounded-full h-1.5">
                            <div
                              className="bg-orange-500 h-1.5 rounded-full"
                              style={{ width: `${incoming.dependencyWeight * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {Math.round(incoming.dependencyWeight * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {selectedNode.incomingRisks.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Network className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Bu birime gelen risk bulaşması yok</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
