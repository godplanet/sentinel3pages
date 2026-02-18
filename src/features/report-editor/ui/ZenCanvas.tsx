import { useActiveReportStore } from '@/entities/report';
import type { M6ReportBlock, TextBlock, FindingRefBlock, LiveChartBlock } from '@/entities/report';
import { LiveFindingRefBlock } from '@/features/report-editor/blocks/DynamicFindingsBlock';
import { LiveChartBlockView } from '@/features/report-editor/blocks/RiskHeatmapBlock';
import { TextBlockRenderer } from '@/features/report-editor/blocks/TextBlockRenderer';

interface BlockRendererProps {
  block: M6ReportBlock;
  readOnly: boolean;
}

function BlockRenderer({ block, readOnly }: BlockRendererProps) {
  switch (block.type) {
    case 'heading':
    case 'paragraph':
    case 'ai_summary':
      return <TextBlockRenderer block={block as TextBlock} readOnly={readOnly} />;
    case 'finding_ref':
      return <LiveFindingRefBlock block={block as FindingRefBlock} />;
    case 'live_chart':
      return <LiveChartBlockView block={block as LiveChartBlock} />;
    default:
      return null;
  }
}

interface ZenCanvasProps {
  readOnly?: boolean;
}

export function ZenCanvas({ readOnly = false }: ZenCanvasProps) {
  const { activeReport } = useActiveReportStore();

  if (!activeReport) {
    return (
      <main className="flex-1 bg-slate-50 overflow-y-auto p-8 lg:p-12 flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse mx-auto" />
          <p className="text-sm font-sans text-slate-400">Rapor yükleniyor...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-slate-50 overflow-y-auto p-8 lg:p-12">
      <div className="max-w-4xl mx-auto min-h-[1056px] bg-[#FDFBF7] shadow-sm ring-1 ring-slate-200/50 p-12 lg:p-20">
        {activeReport.sections.map((section) => (
          <section
            key={section.id}
            id={`section-${section.id}`}
            className="mb-16 scroll-mt-8"
          >
            <h2 className="font-serif text-3xl font-bold mb-6 text-slate-900 pb-3 border-b border-slate-200">
              {section.title}
            </h2>

            <div>
              {section.blocks
                .slice()
                .sort((a, b) => a.orderIndex - b.orderIndex)
                .map((block) => (
                  <BlockRenderer key={block.id} block={block} readOnly={readOnly} />
                ))}
            </div>
          </section>
        ))}

        <div className="mt-16 pt-8 border-t border-slate-200 text-center">
          <p className="text-xs font-sans text-slate-400">
            Son güncelleme:{' '}
            {new Date(activeReport.updatedAt).toLocaleDateString('tr-TR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>
    </main>
  );
}
