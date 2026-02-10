import { useState } from 'react';
import { Sparkles, FileText, AlertCircle, Target, Lightbulb, CheckCircle2, X, BookOpen } from 'lucide-react';
import clsx from 'clsx';
import { RegulationSelectorModal } from '@/features/finding-studio/components/RegulationSelectorModal';

interface FindingPaperProps {
  finding: any;
}

export function FindingPaper({ finding }: FindingPaperProps) {
  const [showRegulationModal, setShowRegulationModal] = useState(false);
  const [selectedRegulations, setSelectedRegulations] = useState<string[]>([]);

  const handleRegulationSelect = (regulation: any) => {
    const regulationText = `${regulation.code} - ${regulation.title}${
      regulation.article ? ` (${regulation.article})` : ''
    }: ${regulation.description}`;

    setSelectedRegulations((prev) => [...prev, regulationText]);
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-12 border border-slate-200">
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-sm font-mono text-slate-500">{finding.id}</span>
              <span
                className={clsx(
                  'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide',
                  finding.status === 'draft' && 'bg-slate-100 text-slate-700',
                  finding.status === 'review' && 'bg-blue-100 text-blue-700'
                )}
              >
                {finding.status === 'draft' ? 'Açık' : 'Gözden Geçirmede'}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-red-600 text-white shadow-md">
                {finding.risk_level === 'critical' ? 'KRİTİK' : 'YÜKSEK'}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-slate-900 leading-tight mb-2">
              {finding.title}
            </h1>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="font-medium">{finding.engagement.scope}</span>
              <span className="text-slate-400">•</span>
              <span>{finding.engagement.name}</span>
            </div>
          </div>

          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <span className="text-2xl">⋯</span>
          </button>
        </div>

        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-start gap-3">
            <Sparkles className="flex-shrink-0 mt-1" size={20} />
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wide mb-2 opacity-90">
                AI Yönetici Özeti / Executive Summary
              </h3>
              <p className="text-white/95 leading-relaxed text-sm">
                {finding.sections.ai_summary}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <Section
          icon={FileText}
          title={finding.sections.criteria.title}
          iconColor="text-blue-600"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-500 italic">{finding.sections.criteria.content}</div>
              <button
                onClick={() => setShowRegulationModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"
              >
                <BookOpen size={16} />
                Mevzuat Kütüphanesinden Seç
              </button>
            </div>

            {selectedRegulations.length > 0 && (
              <div className="space-y-2 mt-4">
                <div className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">
                  Seçilen Mevzuatlar:
                </div>
                {selectedRegulations.map((reg, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
                  >
                    <BookOpen className="text-blue-600 shrink-0 mt-0.5" size={16} />
                    <div className="flex-1 text-sm text-slate-700">{reg}</div>
                    <button
                      onClick={() =>
                        setSelectedRegulations((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Section>

        <RegulationSelectorModal
          isOpen={showRegulationModal}
          onClose={() => setShowRegulationModal(false)}
          onSelect={handleRegulationSelect}
        />

        <Section
          icon={AlertCircle}
          title={finding.sections.finding.title}
          iconColor="text-orange-600"
        >
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-700 leading-relaxed">
              {finding.sections.finding.content}
            </p>
          </div>
        </Section>

        <Section
          icon={Target}
          title={finding.sections.risk.title}
          iconColor="text-red-600"
        >
          <div className="space-y-4">
            <div className="flex gap-2 mb-4">
              <span className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm font-semibold border border-red-200">
                • Risk Türü Dahi
              </span>
              <span className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-sm font-semibold border border-orange-200">
                • Yüksek Uyum ×
              </span>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">{finding.sections.risk.impact_holder}</span>
                <button className="text-xs text-slate-500 hover:text-slate-700">📅</button>
              </div>
              <div className="text-slate-900 font-medium">
                {finding.sections.risk.description}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="text-purple-600" size={20} />
                <h4 className="font-semibold text-slate-900">{finding.sections.risk.root_cause_title}</h4>
              </div>

              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-purple-900">{finding.sections.risk.root_cause_type}</span>
                </div>
                <p className="text-slate-700 text-sm">
                  {finding.sections.risk.root_cause_description}
                </p>
              </div>
            </div>
          </div>
        </Section>

        <Section
          icon={CheckCircle2}
          title={finding.sections.recommendation.title}
          iconColor="text-green-600"
        >
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-700 leading-relaxed">
              {finding.sections.recommendation.content}
            </p>
          </div>
          <button className="mt-4 text-green-600 hover:text-green-700 font-medium text-sm flex items-center gap-1">
            <Sparkles size={16} /> AI İle Darızgye
          </button>
        </Section>

        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Target size={18} className="text-blue-600" />
              Aksiyon Planı & Sorümlular
            </h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              + Yeni Sorumlü Ekle
            </button>
          </div>

          <div className="bg-white rounded-lg p-4 border border-slate-200 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                {finding.action_plan.assignee.name.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-slate-900">{finding.action_plan.assignee.name}</div>
                <div className="text-sm text-slate-600">{finding.action_plan.assignee.role}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                  ✓ {finding.action_plan.assignee.status}
                </span>
                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs">
                  ⬇ Ingiliziz
                </span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-3 mb-3">
              <div className="text-xs text-slate-600 font-medium mb-1">DENETLENİN GÖRECEĞİ KÖK NEDEN</div>
              <div className="text-sm text-slate-800">{finding.action_plan.root_cause}</div>
            </div>

            <div className="mb-3">
              <div className="text-xs text-slate-600 font-medium mb-2">AKSİYON ÖNCELİĞİ</div>
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-semibold inline-flex items-center gap-1">
                🔴 {finding.action_plan.priority}
              </span>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold text-slate-700">AKSİYON ADIMLARI (TERMİN PLANI)</div>
                <div className="text-xs text-slate-500">TERMİN TARİHİ</div>
              </div>

              <div className="space-y-2">
                {finding.action_plan.steps.map((step: any) => (
                  <div key={step.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">{step.id}</span>
                      <span className="text-sm text-slate-700">{step.description}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-slate-600">{step.due_date}</span>
                      <button className="text-slate-400 hover:text-red-600">
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium">
                + Yeni Adım Ekle
              </button>
            </div>
          </div>

          <button className="text-sm text-slate-500 hover:text-slate-700">▼ Dosya Yükle</button>
        </div>
      </div>
    </div>
  );
}

interface SectionProps {
  icon: React.ElementType;
  title: string;
  iconColor: string;
  children: React.ReactNode;
}

function Section({ icon: Icon, title, iconColor, children }: SectionProps) {
  return (
    <div className="pb-8 border-b border-slate-200 last:border-0">
      <div className="flex items-center gap-2 mb-4">
        <Icon className={clsx(iconColor)} size={20} />
        <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wide text-sm">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}
