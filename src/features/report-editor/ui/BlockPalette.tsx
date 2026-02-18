import { useState } from 'react';
import {
  Heading1,
  AlignLeft,
  Link2,
  BarChart2,
  Sparkles,
  Plus,
  Search,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  FileText,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useActiveReportStore } from '@/entities/report';
import { useFindingStore } from '@/entities/finding/model/store';
import type { M6BlockType, M6ReportBlock, FindingRefBlock, TextBlock, LiveChartBlock } from '@/entities/report';
import type { ComprehensiveFinding } from '@/entities/finding/model/types';

interface PaletteItem {
  type: M6BlockType;
  label: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
}

const PALETTE_ITEMS: PaletteItem[] = [
  {
    type: 'heading',
    label: 'Başlık',
    description: 'H1, H2 veya H3 başlık bloğu',
    icon: Heading1,
    iconColor: 'text-slate-700',
    bgColor: 'bg-slate-100',
  },
  {
    type: 'paragraph',
    label: 'Paragraf',
    description: 'Zengin metin ve açıklama',
    icon: AlignLeft,
    iconColor: 'text-slate-600',
    bgColor: 'bg-slate-50',
  },
  {
    type: 'live_chart',
    label: 'Risk Isı Haritası',
    description: 'Canlı risk dağılım grafiği',
    icon: BarChart2,
    iconColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
  },
  {
    type: 'ai_summary',
    label: 'AI Özeti',
    description: 'Sentinel Prime otomatik özet',
    icon: Sparkles,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
];

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: 'bg-red-100 text-red-700 border border-red-200',
  HIGH: 'bg-orange-100 text-orange-700 border border-orange-200',
  MEDIUM: 'bg-amber-100 text-amber-700 border border-amber-200',
  LOW: 'bg-slate-100 text-slate-600 border border-slate-200',
};

function buildBlock(type: M6BlockType): M6ReportBlock {
  const id = `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  if (type === 'heading') {
    return {
      id,
      type: 'heading',
      orderIndex: 999,
      content: { html: '<h2>Yeni Başlık</h2>', level: 2 },
    } as TextBlock;
  }
  if (type === 'ai_summary') {
    return {
      id,
      type: 'ai_summary',
      orderIndex: 999,
      content: { html: '<p>Sentinel Prime AI özeti buraya gelecek...</p>' },
    } as TextBlock;
  }
  if (type === 'live_chart') {
    return {
      id,
      type: 'live_chart',
      orderIndex: 999,
      content: { chartType: 'severity_distribution', dataSourceFilter: {} },
    } as LiveChartBlock;
  }
  return {
    id,
    type: 'paragraph',
    orderIndex: 999,
    content: { html: '<p>Yeni paragraf içeriğini buraya yazın...</p>' },
  } as TextBlock;
}

function buildFindingRefBlock(findingId: string): FindingRefBlock {
  return {
    id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: 'finding_ref',
    orderIndex: 999,
    content: {
      findingId,
      displayStyle: 'full_5c',
      blindMode: false,
    },
  };
}

interface FindingRowProps {
  finding: ComprehensiveFinding;
  alreadyAdded: boolean;
  onAdd: () => void;
}

function FindingRow({ finding, alreadyAdded, onAdd }: FindingRowProps) {
  const severityKey = (finding.severity || 'LOW').toUpperCase();
  const severityClass = SEVERITY_COLORS[severityKey] ?? SEVERITY_COLORS.LOW;
  const code = finding.finding_code ?? finding.code ?? '';

  return (
    <div className="flex items-start gap-2 p-2.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 transition-all group">
      <div className="flex-1 min-w-0">
        {code && (
          <span className="text-[10px] font-sans font-semibold text-slate-400 tracking-wide">{code}</span>
        )}
        <p className="text-xs font-sans font-medium text-slate-800 leading-snug line-clamp-2 mt-0.5">
          {finding.title}
        </p>
        <span
          className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-sans font-semibold ${severityClass}`}
        >
          {severityKey}
        </span>
      </div>
      <button
        onClick={onAdd}
        disabled={alreadyAdded}
        title={alreadyAdded ? 'Zaten eklendi' : 'Rapora ekle'}
        className={`flex-shrink-0 mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
          alreadyAdded
            ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
            : 'bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-700 hover:bg-blue-100 hover:text-blue-700'
        }`}
      >
        {alreadyAdded ? (
          <Link2 size={12} />
        ) : (
          <Plus size={12} />
        )}
      </button>
    </div>
  );
}

export function BlockPalette() {
  const { activeReport, addBlock } = useActiveReportStore();
  const findings = useFindingStore((s) => s.findings);
  const [findingsOpen, setFindingsOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const firstSectionId = activeReport?.sections?.[0]?.id ?? '';

  const alreadyAddedIds = new Set<string>();
  if (activeReport) {
    for (const section of activeReport.sections) {
      for (const block of section.blocks) {
        if (block.type === 'finding_ref') {
          alreadyAddedIds.add((block as FindingRefBlock).content.findingId);
        }
      }
    }
  }

  const filteredFindings = findings.filter((f) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      f.title?.toLowerCase().includes(q) ||
      (f.finding_code ?? f.code ?? '').toLowerCase().includes(q)
    );
  });

  const handleAddBlock = (type: M6BlockType) => {
    if (!firstSectionId) return;
    addBlock(firstSectionId, buildBlock(type));
  };

  const handleAddFinding = (finding: ComprehensiveFinding) => {
    if (!firstSectionId) return;
    addBlock(firstSectionId, buildFindingRefBlock(finding.id));
  };

  return (
    <aside className="w-72 flex-shrink-0 bg-white border-l border-slate-200 overflow-y-auto flex flex-col">
      <div className="p-4 pb-3 border-b border-slate-100">
        <h3 className="text-xs font-sans font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
          Blok Paleti
        </h3>
        <p className="text-xs font-sans text-slate-400">
          Tıklayarak rapora blok ekleyin.
        </p>
      </div>

      <div className="p-3 space-y-1.5">
        {PALETTE_ITEMS.map((item) => (
          <button
            key={item.type}
            onClick={() => handleAddBlock(item.type)}
            disabled={!firstSectionId}
            className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all group text-left"
          >
            <span
              className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${item.bgColor}`}
            >
              <item.icon size={16} className={item.iconColor} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-sans font-medium text-slate-800 group-hover:text-slate-900">
                {item.label}
              </span>
              <span className="block text-xs font-sans text-slate-400 truncate">
                {item.description}
              </span>
            </span>
            <Plus
              size={14}
              className="flex-shrink-0 text-slate-300 group-hover:text-blue-500 transition-colors"
            />
          </button>
        ))}
      </div>

      <div className="border-t border-slate-100 mt-1">
        <button
          onClick={() => setFindingsOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <FileText size={13} className="text-amber-600" />
            <span className="text-xs font-sans font-semibold text-slate-700">
              Bulgu Havuzu
            </span>
            <span className="text-[10px] font-sans font-semibold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
              {findings.length}
            </span>
          </div>
          {findingsOpen ? (
            <ChevronDown size={13} className="text-slate-400" />
          ) : (
            <ChevronRight size={13} className="text-slate-400" />
          )}
        </button>

        {findingsOpen && (
          <div className="px-3 pb-3">
            <div className="relative mb-2">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Bulgu ara..."
                className="w-full pl-7 pr-3 py-1.5 text-xs font-sans border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white"
              />
            </div>

            {filteredFindings.length === 0 ? (
              <div className="text-center py-6">
                <AlertTriangle size={20} className="text-slate-200 mx-auto mb-2" />
                <p className="text-xs font-sans text-slate-400">
                  {findings.length === 0 ? 'Henüz bulgu yüklenmedi' : 'Sonuç bulunamadı'}
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {filteredFindings.map((finding) => (
                  <FindingRow
                    key={finding.id}
                    finding={finding}
                    alreadyAdded={alreadyAddedIds.has(finding.id)}
                    onAdd={() => handleAddFinding(finding)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-auto p-3 border-t border-slate-100">
        <p className="text-[10px] font-sans text-slate-400 leading-relaxed">
          Bloklar sürükle-bırak ile sıralanabilir. Her blok kilitlenebilir ve dondurulabilir.
        </p>
      </div>
    </aside>
  );
}
