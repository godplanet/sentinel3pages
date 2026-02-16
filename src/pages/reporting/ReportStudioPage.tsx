/**
 * SENTINEL v3.0 - REPORT STUDIO (The Orchestrator)
 *
 * Notion-benzeri, sürükle-bırak destekli, canlı veri çeken raporlama deneyimi.
 * Finding Studio kalitesinde tasarım ve UX.
 *
 * MODLAR:
 * - EDIT MODE (Apple Glass): backdrop-blur-xl, slate-50, üç panel layout
 * - VIEW MODE (Remarkable Paper): bg-[#FDFBF7], ortalanmış okuma deneyimi
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Eye,
  FileText,
  Sparkles,
  Download,
  Loader2,
  Check,
  Layout,
  PanelLeftClose,
  PanelRightClose,
  Glasses,
  BookOpen,
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

// API & Data
import { reportApi } from '@/entities/report/api';
import { MOCK_REPORT_ARCHIVE } from '@/shared/data/mock-reports';

// Components
import { WarmthSlider } from '@/widgets/ReportStudio';
import { exportReportToPDF } from '@/features/report-editor/utils/pdf-export';

type ViewMode = 'edit' | 'view';
type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export default function ReportStudioPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  // Mode Management
  const mode: ViewMode = (searchParams.get('mode') as ViewMode) || 'edit';

  // Report State
  const isNew = id === 'new';
  const [reportId, setReportId] = useState(isNew ? null : id);
  const [loading, setLoading] = useState(!isNew);
  const [report, setReport] = useState<any>(null);

  // UI State
  const [title, setTitle] = useState('Yeni Rapor');
  const [content, setContent] = useState('');
  const [blocks, setBlocks] = useState<any[]>([]);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [warmth, setWarmth] = useState(0);

  // Layout State (Edit Mode)
  const [showOutline, setShowOutline] = useState(true);
  const [showAssets, setShowAssets] = useState(true);

  // =====================================================
  // LOAD REPORT
  // =====================================================
  useEffect(() => {
    if (!isNew && id) {
      setLoading(true);
      reportApi
        .getReport(id)
        .then((dbReport) => {
          if (dbReport) {
            setReport(dbReport);
            setTitle(dbReport.title || 'Rapor');
            if (typeof dbReport.tiptap_content === 'string') {
              setContent(dbReport.tiptap_content);
            } else if (dbReport.tiptap_content) {
              setContent(JSON.stringify(dbReport.tiptap_content));
            }
            // Blocks (if stored separately)
            if (dbReport.blocks) {
              setBlocks(dbReport.blocks);
            }
          } else {
            // Fallback: Mock data
            const mockReport = MOCK_REPORT_ARCHIVE.find((r) => r.id === id);
            if (mockReport) {
              setReport(mockReport);
              setTitle(mockReport.title);
              setContent(mockReport.content || '');
            }
          }
        })
        .catch((err) => {
          console.error('Failed to load report:', err);
          // Fallback
          const mockReport = MOCK_REPORT_ARCHIVE.find((r) => r.id === id);
          if (mockReport) {
            setReport(mockReport);
            setTitle(mockReport.title);
            setContent(mockReport.content || '');
          }
        })
        .finally(() => setLoading(false));
    }
  }, [id, isNew]);

  // =====================================================
  // HANDLERS
  // =====================================================
  const handleSave = useCallback(async () => {
    setSaveState('saving');

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // TODO: Save to Supabase
      // await reportApi.updateReport(id, { title, content, blocks });

      setSaveState('saved');
      toast.success('Rapor kaydedildi');

      setTimeout(() => setSaveState('idle'), 2000);
    } catch (err) {
      console.error('Save error:', err);
      setSaveState('error');
      toast.error('Kaydetme başarısız');
    }
  }, [id, title, content, blocks]);

  const handleModeSwitch = (newMode: ViewMode) => {
    setSearchParams({ mode: newMode });
  };

  const handleExportPDF = async () => {
    toast.loading('PDF hazırlanıyor...');
    try {
      await exportReportToPDF(report || { id, title, content });
      toast.dismiss();
      toast.success('PDF indirildi');
    } catch (err) {
      toast.dismiss();
      toast.error('PDF oluşturulamadı');
    }
  };

  // =====================================================
  // RENDER HELPERS
  // =====================================================
  const renderSaveButton = () => {
    if (mode === 'view') return null;

    return (
      <button
        onClick={handleSave}
        disabled={saveState === 'saving'}
        className={clsx(
          'px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2',
          saveState === 'saved'
            ? 'bg-emerald-500 text-white'
            : 'bg-indigo-600 text-white hover:bg-indigo-700'
        )}
      >
        {saveState === 'saving' && <Loader2 className="w-4 h-4 animate-spin" />}
        {saveState === 'saved' && <Check className="w-4 h-4" />}
        {saveState === 'idle' && <Save className="w-4 h-4" />}
        <span>
          {saveState === 'saving'
            ? 'Kaydediliyor...'
            : saveState === 'saved'
            ? 'Kaydedildi'
            : 'Kaydet'}
        </span>
      </button>
    );
  };

  // =====================================================
  // LOADING STATE
  // =====================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Rapor yükleniyor...</p>
        </div>
      </div>
    );
  }

  // =====================================================
  // EDIT MODE LAYOUT
  // =====================================================
  if (mode === 'edit') {
    return (
      <div className="min-h-screen bg-slate-50">
        {/* LIQUID GLASS HEADER */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-slate-200 shadow-sm">
          <div className="h-16 px-6 flex items-center justify-between">
            {/* Left: Back + Title */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/reports')}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-indigo-600" />
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg font-semibold text-slate-900 bg-transparent border-none outline-none focus:ring-0"
                  placeholder="Rapor Başlığı"
                />
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleModeSwitch('view')}
                className="px-4 py-2 rounded-lg font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <Glasses className="w-4 h-4" />
                <span>Önizle</span>
              </button>

              <button
                onClick={handleExportPDF}
                className="px-4 py-2 rounded-lg font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>PDF</span>
              </button>

              {renderSaveButton()}
            </div>
          </div>
        </header>

        {/* THREE PANEL LAYOUT */}
        <div className="flex h-[calc(100vh-4rem)]">
          {/* LEFT PANEL: OUTLINE */}
          {showOutline && (
            <aside className="w-64 bg-white border-r border-slate-200 overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
                    Outline
                  </h3>
                  <button
                    onClick={() => setShowOutline(false)}
                    className="p-1 hover:bg-slate-100 rounded"
                  >
                    <PanelLeftClose className="w-4 h-4 text-slate-500" />
                  </button>
                </div>

                <nav className="space-y-1">
                  {[
                    { label: 'Yönetici Özeti', icon: Sparkles },
                    { label: 'Kapsam ve Amaç', icon: Layout },
                    { label: 'Bulgular', icon: FileText },
                    { label: 'Risk Matrisi', icon: Layout },
                    { label: 'Sonuç ve Öneriler', icon: Check },
                  ].map((section, idx) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={idx}
                        className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Icon className="w-4 h-4 text-slate-400" />
                        <span>{section.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>
          )}

          {/* CENTER PANEL: CANVAS */}
          <main className="flex-1 overflow-y-auto bg-slate-50 p-8">
            <div className="max-w-5xl mx-auto">
              {/* Toggle Outline (if hidden) */}
              {!showOutline && (
                <button
                  onClick={() => setShowOutline(true)}
                  className="mb-4 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Show Outline
                </button>
              )}

              {/* EDITOR CANVAS */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12">
                <h1 className="text-3xl font-bold text-slate-900 mb-8">{title}</h1>

                {/* Placeholder Content */}
                <div className="prose max-w-none">
                  <p className="text-slate-600 italic">
                    Rapor içeriğinizi buraya yazabilirsiniz. Sağ panelden bloklar ekleyebilirsiniz.
                  </p>
                </div>

                {/* Blocks will be rendered here */}
                {blocks.length > 0 && (
                  <div className="mt-8 space-y-6">
                    {blocks.map((block, idx) => (
                      <div key={idx} className="border-l-4 border-indigo-500 pl-4">
                        <div className="text-sm text-slate-500 mb-2">
                          Block: {block.type}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </main>

          {/* RIGHT PANEL: ASSET LIBRARY */}
          {showAssets && (
            <aside className="w-80 bg-white border-l border-slate-200 overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
                    Bileşenler
                  </h3>
                  <button
                    onClick={() => setShowAssets(false)}
                    className="p-1 hover:bg-slate-100 rounded"
                  >
                    <PanelRightClose className="w-4 h-4 text-slate-500" />
                  </button>
                </div>

                <div className="space-y-3">
                  {[
                    { name: 'Metin Bloğu', icon: FileText, color: 'slate' },
                    { name: 'Bulgular Tablosu', icon: Layout, color: 'indigo' },
                    { name: 'Risk Matrisi', icon: Layout, color: 'rose' },
                    { name: 'İstatistikler', icon: Sparkles, color: 'emerald' },
                  ].map((component, idx) => {
                    const Icon = component.icon;
                    return (
                      <button
                        key={idx}
                        className={clsx(
                          'w-full p-4 rounded-lg border-2 border-dashed text-left transition-all hover:shadow-md',
                          `border-${component.color}-300 bg-${component.color}-50 hover:bg-${component.color}-100`
                        )}
                        onClick={() => toast('Sürükle-bırak özelliği yakında!')}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-5 h-5 text-${component.color}-600`} />
                          <span className={`text-sm font-medium text-${component.color}-900`}>
                            {component.name}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* AI Copilot */}
                <div className="mt-6 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    <h4 className="font-semibold text-indigo-900">AI Copilot</h4>
                  </div>
                  <p className="text-xs text-indigo-700 mb-3">
                    Yapay zeka ile rapor içeriği oluşturun.
                  </p>
                  <button className="w-full px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                    Özet Oluştur
                  </button>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    );
  }

  // =====================================================
  // VIEW MODE LAYOUT (Remarkable Paper)
  // =====================================================
  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{
        backgroundColor: `hsl(40, 30%, ${Math.max(97 - warmth * 0.5, 92)}%)`,
      }}
    >
      {/* SIMPLE HEADER */}
      <header className="sticky top-0 z-50 backdrop-blur-sm bg-white/60 border-b border-slate-200/50">
        <div className="h-14 px-6 flex items-center justify-between max-w-4xl mx-auto">
          <button
            onClick={() => handleModeSwitch('edit')}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-white/80 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Düzenleme Moduna Dön</span>
          </button>

          <div className="flex items-center gap-3">
            <WarmthSlider value={warmth} onChange={setWarmth} />

            <button
              onClick={handleExportPDF}
              className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white/80 border border-slate-200 rounded-lg hover:bg-white transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* READER CANVAS */}
      <main className="max-w-4xl mx-auto px-8 py-12">
        <article
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 p-12"
          style={{
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
          }}
        >
          {/* Title */}
          <header className="mb-12 pb-8 border-b border-slate-200">
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
              <BookOpen className="w-4 h-4" />
              <span>Denetim Raporu</span>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 leading-tight">{title}</h1>
            <div className="mt-4 text-sm text-slate-600">
              Oluşturulma: {new Date().toLocaleDateString('tr-TR')}
            </div>
          </header>

          {/* Content */}
          <div className="prose prose-slate max-w-none">
            <p className="text-lg text-slate-700 leading-relaxed">
              {content || 'İçerik yükleniyor...'}
            </p>

            {/* Blocks Render */}
            {blocks.length > 0 && (
              <div className="mt-12 space-y-8">
                {blocks.map((block, idx) => (
                  <div key={idx}>
                    {/* Block rendering logic here */}
                  </div>
                ))}
              </div>
            )}
          </div>
        </article>
      </main>
    </div>
  );
}
