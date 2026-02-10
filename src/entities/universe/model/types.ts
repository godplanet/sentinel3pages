export type EntityType = 'HOLDING' | 'BANK' | 'GROUP' | 'UNIT' | 'PROCESS' | 'BRANCH' | 'DEPARTMENT' | 'HEADQUARTERS';

export interface AuditEntity {
  id: string;
  tenant_id: string;
  path: string;
  name: string;
  type: EntityType;
  risk_score: number;
  velocity_multiplier: number;
  owner_id?: string;
  parent_id?: string | null;
  status?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  children?: AuditEntity[];
}

export interface UniverseTreeNode extends AuditEntity {
  level: number;
  parent_path: string | null;
  effective_risk: number;
}

export interface UniverseFilters {
  type?: EntityType[];
  min_risk?: number;
  max_risk?: number;
  search?: string;
}

export interface UniverseStats {
  total_entities: number;
  by_type: Record<EntityType, number>;
  avg_risk: number;
  high_risk_count: number;
}
