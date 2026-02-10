import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/ui';
import {
  Brain, Send, Loader2, Terminal, Clock, Settings, WifiOff,
  ToggleLeft, ToggleRight, Sparkles, StopCircle, Trash2,
} from 'lucide-react';
import clsx from 'clsx';
import { useAISettingsStore } from '@/shared/stores/ai-settings-store';
import { createEngine } from '@/shared/api/ai/engine';
import { optimizeContext } from '@/shared/api/ai/context-optimizer';
import { useCurrentPageContext } from '@/shared/hooks/useCurrentPageContext';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

const EXAMPLE_QUERIES = [
  'Bu denetim biriminin kok neden analizini yap',
  'BDDK mevzuatina gore kredi limitlerinde uyumsuzluk riski var mi?',
  'Son bulguların risk dağilimini ozetle',
  'Ic kontrol zayifliklarini COSO cercevesinde degerlendir',
];

export default function OraclePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const aiStore = useAISettingsStore();
  const pageContext = useCurrentPageContext();
  const configured = aiStore.isConfigured();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || isStreaming || !configured) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');

    const assistantId = (Date.now() + 1).toString();
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };
    setMessages(prev => [...prev, assistantMsg]);

    const controller = new AbortController();
    setAbortController(controller);
    setIsStreaming(true);

    try {
      const engine = createEngine(aiStore.getConfig());

      const contextStr = aiStore.includeContext
        ? optimizeContext({
            page: pageContext.pageName,
            route: pageContext.route,
            description: pageContext.description,
          })
        : undefined;

      const stream = engine.streamText(
        userMsg.content,
        aiStore.persona || undefined,
        contextStr,
      );

      let full = '';
      for await (const chunk of stream) {
        if (controller.signal.aborted) break;
        full += chunk;
        const captured = full;
        setMessages(prev =>
          prev.map(m => m.id === assistantId ? { ...m, content: captured } : m)
        );
      }

      setMessages(prev =>
        prev.map(m => m.id === assistantId ? { ...m, isStreaming: false } : m)
      );
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? { ...m, content: `[Hata] ${errMsg}`, isStreaming: false }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
      setAbortController(null);
    }
  }, [inputValue, isStreaming, configured, aiStore, pageContext]);

  const handleStop = () => {
    abortController?.abort();
  };

  const handleClear = () => {
    if (!isStreaming) setMessages([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <PageHeader
        title="Sentinel AI - The Oracle"
        subtitle="Canli Yapay Zeka Motoru"
        icon={Brain}
      />

      <div className="flex-1 flex overflow-hidden p-6 gap-6">
        <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center',
                  configured ? 'bg-blue-600' : 'bg-slate-300'
                )}>
                  <Brain size={16} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800">Sentinel Prime</span>
                    <span className={clsx(
                      'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                      configured
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                    )}>
                      {configured ? 'CANLI' : 'YAPILANDIRILMADI'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {aiStore.provider === 'gemini' ? 'Google Gemini' :
                     aiStore.provider === 'openai' ? 'OpenAI' : 'Local LLM'}
                    {' '} - {aiStore.model}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => aiStore.setIncludeContext(!aiStore.includeContext)}
                  className={clsx(
                    'flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg border transition-colors',
                    aiStore.includeContext
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  )}
                  title="Sayfa baglamini dahil et"
                >
                  {aiStore.includeContext
                    ? <ToggleRight size={14} className="text-blue-600" />
                    : <ToggleLeft size={14} />}
                  Baglam
                </button>
                <button
                  onClick={handleClear}
                  disabled={isStreaming || messages.length === 0}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-30"
                  title="Sohbeti temizle"
                >
                  <Trash2 size={14} />
                </button>
                <button
                  onClick={() => navigate('/settings/cognitive-engine')}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  title="AI Ayarlari"
                >
                  <Settings size={14} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-lg">
                  {!configured ? (
                    <>
                      <div className="w-16 h-16 rounded-2xl bg-slate-200 flex items-center justify-center mx-auto mb-4">
                        <WifiOff size={28} className="text-slate-400" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-700 mb-2">
                        AI Motoru Yapilandirilmadi
                      </h3>
                      <p className="text-sm text-slate-500 mb-4">
                        API anahtarinizi girerek yapay zeka motorunu aktive edin.
                      </p>
                      <button
                        onClick={() => navigate('/settings/cognitive-engine')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                      >
                        <Settings size={14} />
                        Ayarlara Git
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mx-auto mb-4">
                        <Brain size={28} className="text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 mb-2">
                        Sentinel Prime Hazir
                      </h3>
                      <p className="text-sm text-slate-500 mb-5">
                        Supheci kidemli denetci. BDDK mevzuatina hakim. Bir soru sorun.
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {EXAMPLE_QUERIES.map((q, i) => (
                          <button
                            key={i}
                            onClick={() => { setInputValue(q); inputRef.current?.focus(); }}
                            className="text-left px-3 py-2.5 text-xs text-slate-600 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 hover:border-blue-200 rounded-xl transition-colors"
                          >
                            <Sparkles size={10} className="inline mr-1.5 text-blue-400" />
                            {q}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={clsx(
                      'flex gap-3',
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {msg.role === 'assistant' && (
                      <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                        <Brain size={14} className="text-white" />
                      </div>
                    )}
                    <div
                      className={clsx(
                        'max-w-[75%] rounded-2xl px-4 py-3',
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-800'
                      )}
                    >
                      <div className="text-sm whitespace-pre-wrap leading-relaxed">
                        {msg.content}
                        {msg.isStreaming && (
                          <span className="inline-block w-1.5 h-4 bg-blue-500 ml-0.5 animate-pulse rounded-sm" />
                        )}
                      </div>
                      <div className={clsx(
                        'text-[10px] mt-2 flex items-center gap-1',
                        msg.role === 'user' ? 'text-blue-200' : 'text-slate-400'
                      )}>
                        <Clock size={9} />
                        {msg.timestamp.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    {msg.role === 'user' && (
                      <div className="shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">D</span>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 px-5 py-4 bg-white">
            {aiStore.includeContext && (
              <div className="flex items-center gap-1.5 mb-2 px-1">
                <Terminal size={10} className="text-blue-500" />
                <span className="text-[10px] text-blue-600 font-medium">
                  Sayfa baglami dahil: {pageContext.description}
                </span>
              </div>
            )}
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={!configured || isStreaming}
                placeholder={configured ? 'Sentinel Prime\'a bir soru sorun...' : 'Once AI ayarlarini yapilandirin'}
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              />
              {isStreaming ? (
                <button
                  onClick={handleStop}
                  className="px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2 text-sm font-semibold"
                >
                  <StopCircle size={16} />
                  Dur
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!configured || !inputValue.trim()}
                  className="px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm font-semibold"
                >
                  <Send size={16} />
                  Gonder
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="w-72 flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Motor Durumu</h3>
            <div className="space-y-3">
              <StatusRow
                label="Saglayici"
                value={aiStore.provider === 'gemini' ? 'Gemini' : aiStore.provider === 'openai' ? 'OpenAI' : 'Local'}
                ok={configured}
              />
              <StatusRow
                label="Model"
                value={aiStore.model}
                ok={configured}
              />
              <StatusRow
                label="Baglanti"
                value={aiStore.connectionStatus === 'connected' ? 'Aktif' : aiStore.connectionStatus === 'failed' ? 'Hata' : 'Bilinmiyor'}
                ok={aiStore.connectionStatus === 'connected'}
              />
              <StatusRow
                label="Baglam"
                value={aiStore.includeContext ? 'Dahil' : 'Devre Disi'}
                ok={aiStore.includeContext}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Hizli Sorgular</h3>
            <div className="space-y-1.5">
              {EXAMPLE_QUERIES.map((q, i) => (
                <button
                  key={i}
                  onClick={() => { setInputValue(q); inputRef.current?.focus(); }}
                  disabled={!configured}
                  className="w-full text-left px-3 py-2 text-xs text-slate-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors disabled:opacity-40"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => navigate('/settings/cognitive-engine')}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
          >
            <Settings size={14} />
            AI Ayarlari
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusRow({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-500">{label}</span>
      <div className="flex items-center gap-1.5">
        <div className={clsx('w-1.5 h-1.5 rounded-full', ok ? 'bg-emerald-500' : 'bg-slate-300')} />
        <span className="text-xs font-semibold text-slate-700 truncate max-w-[120px]">{value}</span>
      </div>
    </div>
  );
}
