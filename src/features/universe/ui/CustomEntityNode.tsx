import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Building2, Building, Network, Box, Workflow, TrendingUp, MapPin, Briefcase, Landmark, Server, Truck, Factory } from 'lucide-react';
import type { EntityType } from '@/entities/universe';
import { useRiskConstitution } from '@/features/risk-constitution';
import { getRiskColor, getRiskLabel } from '@/shared/lib/constitution-utils';

export interface EntityNodeData {
  name: string;
  type: EntityType;
  risk_score: number;
  velocity_multiplier: number;
  effective_risk: number;
}

const getTypeIcon = (type: EntityType) => {
  switch (type) {
    case 'HOLDING':
      return Building2;
    case 'BANK':
      return Building;
    case 'GROUP':
      return Network;
    case 'UNIT':
      return Box;
    case 'PROCESS':
      return Workflow;
    case 'BRANCH':
      return MapPin;
    case 'DEPARTMENT':
      return Briefcase;
    case 'HEADQUARTERS':
      return Landmark;
    case 'IT_ASSET':
      return Server;
    case 'VENDOR':
      return Truck;
    case 'SUBSIDIARY':
      return Factory;
    default:
      return Box;
  }
};

const getTypeColor = (type: EntityType) => {
  switch (type) {
    case 'HOLDING':
      return 'from-slate-600/20 to-slate-700/20 border-slate-400/30';
    case 'BANK':
      return 'from-blue-500/20 to-blue-600/20 border-blue-300/30';
    case 'GROUP':
      return 'from-teal-500/20 to-teal-600/20 border-teal-300/30';
    case 'UNIT':
      return 'from-amber-500/20 to-amber-600/20 border-amber-300/30';
    case 'PROCESS':
      return 'from-slate-500/20 to-slate-600/20 border-slate-300/30';
    case 'BRANCH':
      return 'from-cyan-500/20 to-cyan-600/20 border-cyan-300/30';
    case 'DEPARTMENT':
      return 'from-rose-500/20 to-rose-600/20 border-rose-300/30';
    case 'HEADQUARTERS':
      return 'from-slate-700/20 to-slate-800/20 border-slate-500/30';
    case 'IT_ASSET':
      return 'from-purple-500/20 to-purple-600/20 border-purple-300/30';
    case 'VENDOR':
      return 'from-orange-500/20 to-orange-600/20 border-orange-300/30';
    case 'SUBSIDIARY':
      return 'from-indigo-500/20 to-indigo-600/20 border-indigo-300/30';
    default:
      return 'from-gray-500/20 to-gray-600/20 border-gray-300/30';
  }
};

export const CustomEntityNode = memo(({ data }: NodeProps) => {
  const nodeData = data as unknown as EntityNodeData;
  const { constitution } = useRiskConstitution();
  const Icon = getTypeIcon(nodeData.type);
  const typeColor = getTypeColor(nodeData.type);

  const riskColor = constitution ? getRiskColor(nodeData.effective_risk, constitution.risk_ranges) : '#64748b';
  const riskLabel = constitution ? getRiskLabel(nodeData.effective_risk, constitution.risk_ranges) : 'N/A';
  const isHighVelocity = nodeData.velocity_multiplier > 1.2;

  return (
    <div className="relative group">
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-blue-500 border-2 border-white"
      />

      <div
        className={`
          bg-gradient-to-br ${typeColor}
          backdrop-blur-md
          border-2
          rounded-xl
          shadow-lg
          hover:shadow-xl
          transition-all
          duration-300
          min-w-[240px]
          max-w-[280px]
          group-hover:scale-105
          cursor-pointer
        `}
      >
        <div className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white/80 rounded-lg shadow-sm">
              <Icon size={20} className="text-slate-700" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-900 leading-tight line-clamp-2">
                {nodeData.name}
              </h4>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                {nodeData.type}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                className="px-2 py-1 text-xs font-bold rounded-md shadow-sm text-white"
                style={{ backgroundColor: riskColor }}
              >
                {riskLabel}
              </span>
              <span className="text-xs font-bold text-slate-700">
                {nodeData.effective_risk.toFixed(1)}
              </span>
            </div>

            {isHighVelocity && (
              <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 rounded-md">
                <TrendingUp size={12} className="text-orange-600" />
                <span className="text-xs font-bold text-orange-600">
                  {nodeData.velocity_multiplier.toFixed(2)}x
                </span>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-white/30">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">Base Risk:</span>
              <span className="font-bold text-slate-700">
                {nodeData.risk_score.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-blue-500 border-2 border-white"
      />
    </div>
  );
});

CustomEntityNode.displayName = 'CustomEntityNode';
