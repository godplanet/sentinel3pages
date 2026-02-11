import { useState } from 'react';
import { useUIStore } from '@/shared/stores/ui-store';
import {
  Bell, Menu, Brain, Calculator, Bot, Package,
} from 'lucide-react';
import clsx from 'clsx';
import { AIAssistantModal } from '@/widgets/AIAssistant';
import { BDDKPackageModal } from '@/features/bddk-export/BDDKPackageModal';
import { LanguageSwitcher } from '@/shared/ui';

const ENV_STYLES = {
  DEV: 'bg-blue-600 text-white shadow-blue-500/30',
  TEST: 'bg-amber-500 text-white shadow-amber-500/30',
  PROD: 'bg-rose-600 text-white shadow-rose-500/30',
} as const;

export const Header = () => {
  const { toggleSidebar, toggleCmdBar } = useUIStore();

  const [aiMode, setAiMode] = useState<'reasoning' | 'math'>('reasoning');
  const [env, setEnv] = useState<'PROD' | 'TEST' | 'DEV'>('DEV');
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isBDDKModalOpen, setIsBDDKModalOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-xl h-13 print:hidden">
      <div className="flex h-full items-center px-3 gap-2">

        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors shrink-0"
        >
          <Menu size={18} />
        </button>

        <div className="flex-1 max-w-2xl mx-auto">
          <button
            onClick={toggleCmdBar}
            className="w-full flex items-center bg-slate-50 border border-slate-200 rounded-xl hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all"
          >
            <div className="pl-3 pr-2 text-slate-400">
              {aiMode === 'reasoning' ? <Brain size={16} /> : <Calculator size={16} />}
            </div>

            <span className="flex-1 h-9 flex items-center text-[13px] text-slate-400 text-left truncate">
              {aiMode === 'reasoning'
                ? "Sentinel'e stratejik bir risk sorusu sor..."
                : "Finansal etki analizi veya formül gir..."}
            </span>

            <kbd className="hidden lg:flex items-center text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 bg-white mr-2">
              ⌘K
            </kbd>

            <div className="flex items-center gap-0.5 bg-white border border-slate-200 rounded-lg p-0.5 mr-1.5 shrink-0">
              <div
                onClick={(e) => { e.stopPropagation(); setAiMode('reasoning'); }}
                className={clsx(
                  'flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer',
                  aiMode === 'reasoning'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-blue-600'
                )}
              >
                <Brain size={12} />
                <span className="hidden xl:inline">Analiz</span>
              </div>
              <div
                onClick={(e) => { e.stopPropagation(); setAiMode('math'); }}
                className={clsx(
                  'flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer',
                  aiMode === 'math'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-emerald-600'
                )}
              >
                <Calculator size={12} />
                <span className="hidden xl:inline">Hesapla</span>
              </div>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <div className="hidden lg:flex items-center bg-slate-100 p-0.5 rounded-lg">
            {(['DEV', 'TEST', 'PROD'] as const).map((e) => (
              <button
                key={e}
                onClick={() => setEnv(e)}
                className={clsx(
                  'px-2.5 py-1 rounded-md text-[10px] font-black transition-all',
                  env === e
                    ? `${ENV_STYLES[e]} shadow-sm`
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                {e}
              </button>
            ))}
          </div>

          <div className="h-5 w-px bg-slate-200 mx-1 hidden lg:block" />

          <LanguageSwitcher />

          <button
            onClick={() => setIsAIAssistantOpen(true)}
            className="p-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-md transition-all relative"
            title="Sentinel AI Asistan"
          >
            <Bot size={16} />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 border border-white rounded-full" />
          </button>

          <button
            onClick={() => setIsBDDKModalOpen(true)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors hidden md:flex"
            title="BDDK Paket"
          >
            <Package size={16} />
          </button>

          <button
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors relative"
            title="Bildirimler"
          >
            <Bell size={16} />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-rose-500 rounded-full" />
          </button>

          <div className="h-5 w-px bg-slate-200 mx-1" />

          <div className="flex items-center gap-2">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[11px] font-bold text-slate-800 leading-tight">Hilmi Duru</span>
              <span className="text-[9px] text-slate-500 leading-tight">Baş Denetçi</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-sm cursor-pointer hover:shadow-md transition-shadow">
              <span className="text-[10px] font-bold text-white">HD</span>
            </div>
          </div>
        </div>
      </div>

      <AIAssistantModal
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
      />
      <BDDKPackageModal
        isOpen={isBDDKModalOpen}
        onClose={() => setIsBDDKModalOpen(false)}
      />
    </header>
  );
};
