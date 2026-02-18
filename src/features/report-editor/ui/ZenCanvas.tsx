import { BarChart2, Link2, Zap } from 'lucide-react';
import { useActiveReportStore } from '@/entities/report';
import type { M6ReportBlock, TextBlock, FindingRefBlock, LiveChartBlock } from '@/entities/report';

function HeadingBlockView({ block }: { block: TextBlock }) {
  const level = block.content.level ?? 2;
  const text = block.content.html.replace(/<[^>]+>/g, '');
  if (level === 1)
    return <h1 className="font-serif text-3xl font-bold mb-6 text-slate-900">{text}</h1>;
  if (level === 2)
    return <h2 className="font-serif text-2xl font-bold mb-4 text-slate-800">{text}</h2>;
  return <h3 className="font-serif text-xl font-semibold mb-3 text-slate-700">{text}</h3>;
}

function ParagraphBlockView({ block }: { block: TextBlock }) {
  return (
    <p
      className="font-serif text-slate-700 mb-4 leading-relaxed text-base"
      dangerouslySetInnerHTML={{ __html: block.content.html }}
    />
  );
}

function AISummaryBlockView({ block }: { block: TextBlock }) {
  return (
    <div className="border-l-4 border-blue-400 bg-blue-50/60 px-5 py-4 mb-4 rounded-r-xl">
      <div className="flex items-center gap-1.5 mb-2">
        <Zap size={13} className="text-blue-500" />
        <span className="text-xs font-sans font-semibold uppercase tracking-wider text-blue-600">
          Sentinel Prime AI Özeti
        </span>
      </div>
      <div
        className="font-sans text-sm text-blue-900 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: block.content.html }}
      />
    </div>
  );
}

function FindingRefBlockView({ block }: { block: FindingRefBlock }) {
  const styleLabels = {
    full_5c: 'Tam 5C Görünümü',
    summary_card: 'Özet Kart',
    table_row: 'Tablo Satırı',
  };
  return (
    <div className="border-l-4 border-amber-500 bg-amber-50 p-4 mb-4 font-sans text-sm text-amber-900 rounded-r-lg">
      <div className="flex items-center gap-2 mb-1">
        <Link2 size={13} className="text-amber-600" />
        <span className="font-semibold text-xs uppercase tracking-wider text-amber-700">
          Canlı Bulgu Referansı
        </span>
        <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
          {styleLabels[block.content.displayStyle]}
        </span>
      </div>
      <span className="font-mono text-amber-800 font-medium">{block.content.findingId}</span>
      {block.content.blindMode && (
        <span className="ml-2 text-xs text-amber-500">(Blind Mode)</span>
      )}
    </div>
  );
}

function LiveChartBlockView({ block }: { block: LiveChartBlock }) {
  const chartLabels = {
    risk_heatmap: 'Risk Isı Haritası',
    severity_distribution: 'Önem Dağılımı Grafiği',
    wif_trend: 'WIF Trend Grafiği',
  };
  return (
    <div className="border border-slate-300 bg-slate-50/80 p-8 mb-4 flex flex-col items-center justify-center font-sans text-slate-600 rounded-xl border-dashed gap-2">
      <BarChart2 size={28} className="text-slate-400" />
      <span className="text-sm font-medium text-slate-700">
        {chartLabels[block.content.chartType]}
      </span>
      <span className="text-xs text-slate-400">Canlı veri bağlantısı aktif</span>
    </div>
  );
}

function BlockRenderer({ block }: { block: M6ReportBlock }) {
  switch (block.type) {
    case 'heading':
      return <HeadingBlockView block={block} />;
    case 'paragraph':
      return <ParagraphBlockView block={block} />;
    case 'ai_summary':
      return <AISummaryBlockView block={block} />;
    case 'finding_ref':
      return <FindingRefBlockView block={block} />;
    case 'live_chart':
      return <LiveChartBlockView block={block} />;
    default:
      return null;
  }
}

export function ZenCanvas() {
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
                  <BlockRenderer key={block.id} block={block} />
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
