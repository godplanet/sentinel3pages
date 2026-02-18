import { Heading1, AlignLeft, Link2, BarChart2, Sparkles, Plus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { M6BlockType } from '@/entities/report';

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
    type: 'finding_ref',
    label: 'Canlı Bulgu',
    description: 'Modül 5\'ten canlı bulgu referansı',
    icon: Link2,
    iconColor: 'text-amber-700',
    bgColor: 'bg-amber-50',
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

export function BlockPalette() {
  return (
    <aside className="w-72 flex-shrink-0 bg-white border-l border-slate-200 overflow-y-auto p-4">
      <div className="mb-4">
        <h3 className="text-xs font-sans font-semibold uppercase tracking-wider text-slate-400 mb-1">
          Blok Paleti
        </h3>
        <p className="text-xs font-sans text-slate-400">
          Rapora eklemek için bir blok seçin.
        </p>
      </div>

      <div className="space-y-2">
        {PALETTE_ITEMS.map((item) => (
          <button
            key={item.type}
            className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 transition-all group text-left"
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
              className="flex-shrink-0 text-slate-300 group-hover:text-slate-500 transition-colors"
            />
          </button>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100">
        <p className="text-[11px] font-sans text-slate-400 leading-relaxed">
          Bloklar sürükle-bırak ile sıralanabilir. Her blok bağımsız olarak kilitlenebilir ve dondurulabilir.
        </p>
      </div>
    </aside>
  );
}
