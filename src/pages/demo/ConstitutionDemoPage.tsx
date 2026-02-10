/**
 * CONSTITUTION DEMONSTRATION PAGE
 * Shows all Blueprint Rules in action with live examples
 */

import { PageHeader } from '@/shared/ui/PageHeader';
import {
  GlassCard,
  RiskBadge,
  EvidenceIndicator,
  AIBadge,
  FourEyesIndicator,
  GradeWaterfall,
  EnvironmentBanner,
} from '@/shared/ui/GlassCard';
import { SENTINEL_CONSTITUTION, ConstitutionUtils } from '@/shared/config';
import { Sparkles, Shield, Calculator, Eye, Award, Globe } from 'lucide-react';

export default function ConstitutionDemoPage() {
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-blue-50">
      <PageHeader
        title="Constitution Blueprint Demo"
        subtitle="Live demonstration of Sentinel's Constitutional Rules from Ek-1, Ek-3, and Module 4"
        icon={Shield}
      />

      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Environment Banner */}
          <EnvironmentBanner environment="DEVELOPMENT" />

          {/* Ek-1: Liquid Glass UI */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-slate-800">
                Ek-1: Liquid Glass Design System
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <GlassCard neonGlow="blue">
                <div className="space-y-3">
                  <AIBadge type="gen" />
                  <h3 className="font-bold text-slate-800">GenAI Brain</h3>
                  <p className="text-sm text-slate-600">
                    Text generation and summarization with blue neon glow.
                  </p>
                  <div className="text-xs font-mono text-slate-500">
                    GLOW: {SENTINEL_CONSTITUTION.AI.DUAL_BRAIN.GEN_AI.GLOW}
                  </div>
                </div>
              </GlassCard>

              <GlassCard neonGlow="orange">
                <div className="space-y-3">
                  <AIBadge type="compute" />
                  <h3 className="font-bold text-slate-800">ComputeAI Brain</h3>
                  <p className="text-sm text-slate-600">
                    Mathematical computation with orange neon glow.
                  </p>
                  <div className="text-xs font-mono text-slate-500">
                    GLOW: {SENTINEL_CONSTITUTION.AI.DUAL_BRAIN.COMPUTE_AI.GLOW}
                  </div>
                </div>
              </GlassCard>

              <GlassCard solidMode>
                <div className="space-y-3">
                  <div className="px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-xs font-bold inline-block">
                    VDI MODE
                  </div>
                  <h3 className="font-bold text-slate-800">Solid State</h3>
                  <p className="text-sm text-slate-600">
                    No glass blur for VDI/Citrix environments.
                  </p>
                  <div className="text-xs font-mono text-slate-500">
                    MODE: solid-state
                  </div>
                </div>
              </GlassCard>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600">Theme Mode:</span>
                  <span className="font-mono text-slate-800">
                    {SENTINEL_CONSTITUTION.UI.THEME_MODE}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Glass Blur:</span>
                  <span className="font-mono text-slate-800">
                    {SENTINEL_CONSTITUTION.UI.GLASS_BLUR}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Animation Duration:</span>
                  <span className="font-mono text-slate-800">
                    {SENTINEL_CONSTITUTION.UI.ANIMATION_DURATION}ms
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Ek-3: Risk Scoring Logic */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Calculator className="w-6 h-6 text-orange-600" />
              <h2 className="text-2xl font-bold text-slate-800">
                Ek-3: Risk Mathematics Engine
              </h2>
            </div>

            <GlassCard>
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-slate-800 mb-3">
                    Constitutional Formula:
                  </h3>
                  <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border-2 border-orange-200">
                    <code className="text-sm font-mono text-orange-900">
                      {SENTINEL_CONSTITUTION.RISK.FORMULA}
                    </code>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-slate-800 mb-3">
                    Live Risk Scores:
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <RiskBadge score={3} />
                      <p className="text-xs text-slate-500">Low Risk Entity</p>
                    </div>
                    <div className="space-y-2">
                      <RiskBadge score={7} />
                      <p className="text-xs text-slate-500">Medium Risk</p>
                    </div>
                    <div className="space-y-2">
                      <RiskBadge score={12} />
                      <p className="text-xs text-slate-500">High Risk</p>
                    </div>
                    <div className="space-y-2">
                      <RiskBadge score={20} />
                      <p className="text-xs text-slate-500">Critical Risk</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-slate-800 mb-3">Risk Zones:</h3>
                  <div className="space-y-2">
                    {Object.entries(SENTINEL_CONSTITUTION.RISK.ZONES).map(
                      ([key, zone]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between p-3 rounded-lg"
                          style={{
                            backgroundColor: `${zone.color}20`,
                            borderLeft: `4px solid ${zone.color}`,
                          }}
                        >
                          <span className="font-semibold text-slate-700">
                            {zone.label}
                          </span>
                          <span className="text-sm text-slate-600">
                            Score: {zone.min} - {zone.max}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {SENTINEL_CONSTITUTION.RISK.VELOCITY.ENABLED && (
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-purple-700 font-bold">⚡</span>
                      <span className="font-semibold text-purple-900">
                        Velocity Multiplier: ENABLED
                      </span>
                    </div>
                    <p className="text-sm text-purple-700">
                      Formula: {SENTINEL_CONSTITUTION.RISK.VELOCITY.FORMULA}
                    </p>
                    <p className="text-xs text-purple-600 mt-1">
                      Max Multiplier:{' '}
                      {SENTINEL_CONSTITUTION.RISK.VELOCITY.MAX_MULTIPLIER}x
                    </p>
                  </div>
                )}
              </div>
            </GlassCard>
          </section>

          {/* Module 4: Execution Rules */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-slate-800">
                Module 4: Execution & Evidence Rules
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassCard>
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-800">
                    Evidence Requirements
                  </h3>

                  <div className="space-y-3">
                    <EvidenceIndicator evidenceCount={0} />
                    <EvidenceIndicator evidenceCount={1} />
                    <EvidenceIndicator evidenceCount={3} showRequirement={false} />
                  </div>

                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="text-sm font-semibold text-red-800">
                      Constitutional Rule:
                    </div>
                    <div className="text-xs text-red-700 mt-1">
                      EVIDENCE_REQUIRED:{' '}
                      {SENTINEL_CONSTITUTION.EXECUTION.EVIDENCE_REQUIRED
                        ? 'TRUE'
                        : 'FALSE'}
                    </div>
                    <div className="text-xs text-red-700">
                      MIN_EVIDENCE_FILES:{' '}
                      {SENTINEL_CONSTITUTION.EXECUTION.MIN_EVIDENCE_FILES}
                    </div>
                  </div>

                  {SENTINEL_CONSTITUTION.EXECUTION.FIVE_WHYS_REQUIRED && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-sm font-semibold text-blue-800">
                        5-Whys Mandatory
                      </div>
                      <div className="text-xs text-blue-700 mt-1">
                        Min Root Cause Length:{' '}
                        {SENTINEL_CONSTITUTION.EXECUTION.MIN_ROOT_CAUSE_LENGTH}{' '}
                        chars
                      </div>
                    </div>
                  )}
                </div>
              </GlassCard>

              <GlassCard>
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-800">
                    Four-Eyes Principle
                  </h3>

                  <FourEyesIndicator
                    preparerId="user-123"
                    reviewerId="user-456"
                    currentUserId="user-789"
                  />

                  <FourEyesIndicator
                    preparerId="user-123"
                    currentUserId="user-123"
                  />

                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="text-sm font-semibold text-amber-800">
                      Constitutional Rule:
                    </div>
                    <div className="text-xs text-amber-700 mt-1">
                      FOUR_EYES_PRINCIPLE:{' '}
                      {SENTINEL_CONSTITUTION.EXECUTION.FOUR_EYES_PRINCIPLE
                        ? 'ENABLED'
                        : 'DISABLED'}
                    </div>
                    <p className="text-xs text-amber-600 mt-2">
                      Preparer cannot approve their own work. Second reviewer
                      required for critical actions.
                    </p>
                  </div>
                </div>
              </GlassCard>
            </div>
          </section>

          {/* Grading Engine */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-slate-800">
                KERD 2026: Grading Engine with Limiting Rules
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassCard>
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-800">
                    Normal Grading (No Limits)
                  </h3>
                  <GradeWaterfall
                    rawScore={85}
                    finalScore={85}
                    criticalCount={0}
                    highCount={0}
                  />
                </div>
              </GlassCard>

              <GlassCard>
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-800">
                    Limited by 1 Critical Finding
                  </h3>
                  <GradeWaterfall
                    rawScore={85}
                    finalScore={60}
                    criticalCount={1}
                    highCount={0}
                  />
                </div>
              </GlassCard>
            </div>

            <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-bold text-purple-900 mb-2">
                Constitutional Limiting Rules:
              </h4>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>
                  • If 1+ Critical finding exists → Maximum grade is D (60)
                </li>
                <li>• If 2+ High findings exist → Maximum grade is C (70)</li>
                <li>
                  • Method: {SENTINEL_CONSTITUTION.GRADING.METHOD} (Base{' '}
                  {SENTINEL_CONSTITUTION.GRADING.BASE_SCORE} - Deductions)
                </li>
              </ul>
            </div>
          </section>

          {/* System Metadata */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-6 h-6 text-slate-600" />
              <h2 className="text-2xl font-bold text-slate-800">
                System Metadata
              </h2>
            </div>

            <GlassCard>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                    Version
                  </div>
                  <div className="text-2xl font-bold text-slate-800">
                    {SENTINEL_CONSTITUTION.META.VERSION}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                    Codename
                  </div>
                  <div className="text-lg font-bold text-slate-800">
                    {SENTINEL_CONSTITUTION.META.CODENAME}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                    Build Date
                  </div>
                  <div className="text-lg font-bold text-slate-800">
                    {SENTINEL_CONSTITUTION.META.BUILD_DATE}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                    Status
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-bold text-green-700">
                      LOCKED
                    </span>
                  </div>
                </div>
              </div>

              {SENTINEL_CONSTITUTION.META.CONSTITUTIONAL_LOCK && (
                <div className="mt-4 p-3 bg-slate-100 rounded-lg border border-slate-300">
                  <div className="text-xs text-slate-700">
                    🔒 Constitution is locked and immutable. Changes require
                    Chief Architect approval.
                  </div>
                </div>
              )}
            </GlassCard>
          </section>
        </div>
      </div>
    </div>
  );
}
