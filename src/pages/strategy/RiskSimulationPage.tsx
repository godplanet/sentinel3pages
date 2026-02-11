/**
 * Risk Simulation Page - Time-Travel Risk Simulator
 *
 * Split View:
 * - Left Panel: Draft Constitution Editor
 * - Right Panel: Impact Analysis
 *
 * Features:
 * - Shadow Ledger Pattern: Simulate without modifying live data
 * - Real-time impact preview
 * - Zone change visualization
 * - Historical simulation runs
 */

import { useState, useEffect } from 'react';
import { Play, Zap, AlertTriangle, TrendingUp, TrendingDown, History, Trash2 } from 'lucide-react';
import { PageHeader } from '@/shared/ui';
import {
  useRiskSimulation,
  useSimulationResults,
  useSimulationImpact,
  useSimulationHistory,
  useFilteredResults,
} from '@/features/risk-simulation';
import type { RiskConfiguration } from '@/entities/risk/engine';
import type { SimulationResult } from '@/features/risk-simulation';

const DEFAULT_CONSTITUTION: RiskConfiguration = {
  weight_inherent: 30,
  weight_strategic: 20,
  weight_control: 40,
  weight_dynamic: 10,
  threshold_critical: 85,
  threshold_high: 70,
  threshold_medium: 50,
};

export default function RiskSimulationPage() {
  const [draftConstitution, setDraftConstitution] = useState<RiskConfiguration>(DEFAULT_CONSTITUTION);
  const [scenarioName, setScenarioName] = useState('');
  const [currentSimulationId, setCurrentSimulationId] = useState<string | null>(null);

  const { runSimulation, isRunning, progress, error: simError } = useRiskSimulation();
  const { results, isLoading: loadingResults } = useSimulationResults(currentSimulationId);
  const { impact, isLoading: loadingImpact } = useSimulationImpact(currentSimulationId);
  const { runs, deleteRun, refetch: refetchHistory } = useSimulationHistory();
  const { filteredResults, filter, setFilter, filteredCount } = useFilteredResults(results);

  const handleRunSimulation = async () => {
    if (!scenarioName.trim()) {
      alert('Please enter a scenario name');
      return;
    }

    const run = await runSimulation({
      name: scenarioName.trim(),
      draftConstitution,
      metadata: {
        weights: {
          inherent: draftConstitution.weight_inherent,
          strategic: draftConstitution.weight_strategic,
          control: draftConstitution.weight_control,
          dynamic: draftConstitution.weight_dynamic,
        },
        thresholds: {
          critical: draftConstitution.threshold_critical,
          high: draftConstitution.threshold_high,
          medium: draftConstitution.threshold_medium,
        },
      },
    });

    if (run) {
      setCurrentSimulationId(run.id);
      refetchHistory();
    }
  };

  const loadHistoricalRun = (runId: string) => {
    const run = runs.find((r) => r.id === runId);
    if (run) {
      setCurrentSimulationId(runId);
      setDraftConstitution(run.constitution_snapshot);
      setScenarioName(run.name);
    }
  };

  const totalWeights =
    draftConstitution.weight_inherent +
    draftConstitution.weight_strategic +
    draftConstitution.weight_control +
    draftConstitution.weight_dynamic;

  const weightsValid = totalWeights === 100;

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <PageHeader
        title="Time-Travel Risk Simulator"
        subtitle="Test constitution changes before going live - Shadow Ledger Pattern"
        icon={<Zap className="w-6 h-6 text-amber-500" />}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL: Draft Constitution Editor */}
        <div className="w-1/2 border-r border-slate-200 bg-white overflow-y-auto">
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">Draft Constitution</h2>
              <p className="text-sm text-slate-600">
                Adjust weights and thresholds to see impact on risk scores
              </p>
            </div>

            {/* Scenario Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Scenario Name
              </label>
              <input
                type="text"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                placeholder="e.g., High Cyber Weight Scenario"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Weight Sliders */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                Risk Component Weights
              </h3>

              <WeightSlider
                label="Inherent Risk"
                value={draftConstitution.weight_inherent}
                onChange={(val) =>
                  setDraftConstitution({ ...draftConstitution, weight_inherent: val })
                }
                color="bg-blue-500"
              />

              <WeightSlider
                label="Strategic Alignment"
                value={draftConstitution.weight_strategic}
                onChange={(val) =>
                  setDraftConstitution({ ...draftConstitution, weight_strategic: val })
                }
                color="bg-green-500"
              />

              <WeightSlider
                label="Control Effectiveness"
                value={draftConstitution.weight_control}
                onChange={(val) =>
                  setDraftConstitution({ ...draftConstitution, weight_control: val })
                }
                color="bg-purple-500"
              />

              <WeightSlider
                label="Dynamic Signals"
                value={draftConstitution.weight_dynamic}
                onChange={(val) =>
                  setDraftConstitution({ ...draftConstitution, weight_dynamic: val })
                }
                color="bg-amber-500"
              />

              {/* Weight Total Indicator */}
              <div
                className={`p-3 rounded-lg border-2 ${
                  weightsValid
                    ? 'bg-green-50 border-green-300'
                    : 'bg-red-50 border-red-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Total Weight:</span>
                  <span
                    className={`text-lg font-bold ${
                      weightsValid ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {totalWeights}%
                  </span>
                </div>
                {!weightsValid && (
                  <p className="text-xs text-red-600 mt-1">
                    Total must equal 100% (adjust {totalWeights > 100 ? 'down' : 'up'} by{' '}
                    {Math.abs(100 - totalWeights)}%)
                  </p>
                )}
              </div>
            </div>

            {/* Threshold Sliders */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                Risk Zone Thresholds
              </h3>

              <ThresholdSlider
                label="Critical (Red Zone)"
                value={draftConstitution.threshold_critical}
                onChange={(val) =>
                  setDraftConstitution({ ...draftConstitution, threshold_critical: val })
                }
                color="bg-red-500"
              />

              <ThresholdSlider
                label="High (Orange Zone)"
                value={draftConstitution.threshold_high}
                onChange={(val) =>
                  setDraftConstitution({ ...draftConstitution, threshold_high: val })
                }
                color="bg-orange-500"
              />

              <ThresholdSlider
                label="Medium (Yellow Zone)"
                value={draftConstitution.threshold_medium}
                onChange={(val) =>
                  setDraftConstitution({ ...draftConstitution, threshold_medium: val })
                }
                color="bg-yellow-500"
              />
            </div>

            {/* Run Button */}
            <button
              onClick={handleRunSimulation}
              disabled={isRunning || !weightsValid || !scenarioName.trim()}
              className="w-full px-4 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
            >
              {isRunning ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Running Simulation...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Run Simulation
                </>
              )}
            </button>

            {simError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {simError}
              </div>
            )}

            {progress && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm font-medium text-blue-900 mb-2">{progress.status}</div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
                <div className="text-xs text-blue-700 mt-1">
                  {progress.currentEntity} / {progress.totalEntities} entities
                </div>
              </div>
            )}

            {/* Historical Runs */}
            {Array.isArray(runs) && runs.length > 0 && (
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <History className="w-4 h-4 text-slate-500" />
                  <h3 className="text-sm font-semibold text-slate-700">Recent Simulations</h3>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {runs.slice(0, 10).map((run) => run && (
                    <div
                      key={run.id}
                      className={`p-3 rounded-lg border cursor-pointer hover:border-blue-400 transition-colors ${
                        currentSimulationId === run.id
                          ? 'bg-blue-50 border-blue-300'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                      onClick={() => loadHistoricalRun(run.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-slate-900">{run.name}</div>
                          <div className="text-xs text-slate-500">
                            {new Date(run.created_at).toLocaleString()}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteRun(run.id);
                          }}
                          className="p-1 hover:bg-red-100 rounded text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Impact Analysis */}
        <div className="w-1/2 bg-slate-50 overflow-y-auto">
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">Impact Analysis</h2>
              <p className="text-sm text-slate-600">
                See how changes affect your risk universe
              </p>
            </div>

            {!currentSimulationId ? (
              <div className="flex items-center justify-center h-96 text-center">
                <div>
                  <AlertTriangle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">Run a simulation to see impact analysis</p>
                </div>
              </div>
            ) : loadingImpact ? (
              <div className="flex items-center justify-center h-96">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
              </div>
            ) : impact ? (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <ImpactCard
                    label="Avg Score Change"
                    value={`${impact.avg_score_change > 0 ? '+' : ''}${impact.avg_score_change.toFixed(1)}`}
                    subtext={`${impact.avg_percentage_change.toFixed(1)}%`}
                    icon={impact.avg_score_change > 0 ? TrendingUp : TrendingDown}
                    color={impact.avg_score_change > 0 ? 'text-red-500' : 'text-green-500'}
                  />
                  <ImpactCard
                    label="Zone Changes"
                    value={impact.entities_changed.toString()}
                    subtext={`${((impact.entities_changed / impact.total_entities) * 100).toFixed(0)}% of entities`}
                    icon={AlertTriangle}
                    color="text-amber-500"
                  />
                </div>

                {/* Zone Distribution */}
                <div className="bg-white rounded-lg border border-slate-200 p-4">
                  <h3 className="text-sm font-semibold text-slate-700 mb-4">
                    New Risk Distribution
                  </h3>
                  <div className="grid grid-cols-4 gap-3">
                    <ZoneCard label="Critical" count={impact.critical_count} color="bg-red-500" />
                    <ZoneCard label="High" count={impact.high_count} color="bg-orange-500" />
                    <ZoneCard label="Medium" count={impact.medium_count} color="bg-yellow-500" />
                    <ZoneCard label="Low" count={impact.low_count} color="bg-green-500" />
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2">
                  {[
                    { key: 'all', label: 'All' },
                    { key: 'zone_changes', label: 'Zone Changes' },
                    { key: 'increased', label: 'Increased' },
                    { key: 'decreased', label: 'Decreased' },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setFilter(tab.key as any)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        filter === tab.key
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-slate-700 border border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Results Table */}
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                  <div className="p-4 bg-slate-50 border-b border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-700">
                      Entities ({filteredCount} of {impact.total_entities})
                    </h3>
                  </div>
                  <div className="max-h-[600px] overflow-y-auto">
                    {loadingResults ? (
                      <div className="p-8 text-center">
                        <div className="animate-spin w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
                      </div>
                    ) : !Array.isArray(filteredResults) || filteredResults.length === 0 ? (
                      <div className="p-8 text-center text-slate-500">No results match filter</div>
                    ) : (
                      <table className="w-full">
                        <thead className="bg-slate-50 sticky top-0">
                          <tr className="text-xs text-slate-600 border-b border-slate-200">
                            <th className="text-left p-3 font-medium">Entity</th>
                            <th className="text-center p-3 font-medium">Old Zone</th>
                            <th className="text-center p-3 font-medium">New Zone</th>
                            <th className="text-right p-3 font-medium">Delta</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredResults.filter(Boolean).map((result) => (
                            <ResultRow key={result.id} result={result} />
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components

function WeightSlider({
  label,
  value,
  onChange,
  color,
}: {
  label: string;
  value: number;
  onChange: (val: number) => void;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <span className="text-sm font-bold text-slate-900">{value}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        step="5"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
        style={{
          accentColor: color.replace('bg-', '').replace('-500', ''),
        }}
      />
    </div>
  );
}

function ThresholdSlider({
  label,
  value,
  onChange,
  color,
}: {
  label: string;
  value: number;
  onChange: (val: number) => void;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <span className="text-sm font-bold text-slate-900">≥{value}</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        step="5"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
        style={{
          accentColor: color.replace('bg-', '').replace('-500', ''),
        }}
      />
    </div>
  );
}

function ImpactCard({
  label,
  value,
  subtext,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  subtext: string;
  icon: any;
  color: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <div className="flex items-center gap-3 mb-2">
        <Icon className={`w-5 h-5 ${color}`} />
        <div className="text-sm text-slate-600">{label}</div>
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-slate-500 mt-1">{subtext}</div>
    </div>
  );
}

function ZoneCard({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="text-center">
      <div className={`${color} text-white rounded-lg p-3`}>
        <div className="text-2xl font-bold">{count}</div>
      </div>
      <div className="text-xs text-slate-600 mt-1">{label}</div>
    </div>
  );
}

function ResultRow({ result }: { result: SimulationResult }) {
  const zoneColors: Record<string, string> = {
    CRITICAL: 'bg-red-100 text-red-700',
    HIGH: 'bg-orange-100 text-orange-700',
    MEDIUM: 'bg-yellow-100 text-yellow-700',
    LOW: 'bg-green-100 text-green-700',
  };

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50">
      <td className="p-3 text-sm text-slate-900">{result.entity_name}</td>
      <td className="p-3 text-center">
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${zoneColors[result.risk_zone_old]}`}
        >
          {result.risk_zone_old}
        </span>
      </td>
      <td className="p-3 text-center">
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${zoneColors[result.risk_zone_new]}`}
        >
          {result.risk_zone_new}
        </span>
      </td>
      <td className="p-3 text-right">
        <span
          className={`text-sm font-bold ${result.delta > 0 ? 'text-red-600' : result.delta < 0 ? 'text-green-600' : 'text-slate-600'}`}
        >
          {result.delta > 0 ? '+' : ''}
          {result.delta.toFixed(1)}
        </span>
      </td>
    </tr>
  );
}
