import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Loader2,
  Check,
  AlertTriangle,
  FileText,
  Eye,
  EyeOff,
} from 'lucide-react';
import clsx from 'clsx';
import { ZenEditor, type FindingEditorData } from '@/features/finding-studio/components/ZenEditor';
import { zenFindingApi } from '@/features/finding-studio/api/zen-finding-api';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

const SEVERITY_OPTIONS = [
  { value: 'CRITICAL', label: 'Kritik', color: 'bg-red-600' },
  { value: 'HIGH', label: 'Yüksek', color: 'bg-orange-500' },
  { value: 'MEDIUM', label: 'Orta', color: 'bg-amber-500' },
  { value: 'LOW', label: 'Düşük', color: 'bg-blue-500' },
  { value: 'OBSERVATION', label: 'Gözlem', color: 'bg-slate-500' },
];

export default function FindingStudioZenPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [loading, setLoading] = useState(false);
  const [findingId, setFindingId] = useState(isNew ? null : id);
  const [title, setTitle] = useState('Yeni Bulgu');
  const [severity, setSeverity] = useState<string>('MEDIUM');
  const [editorData, setEditorData] = useState<FindingEditorData | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [readOnly, setReadOnly] = useState(false);
  const [showMetadata, setShowMetadata] = useState(true);

  useEffect(() => {
    if (!isNew && id) {
      loadFinding(id);
    } else if (isNew) {
      setLoading(false);
    }
  }, [id, isNew]);

  const loadFinding = async (findingId: string) => {
    setLoading(true);
    try {
      const [metadata, content] = await Promise.all([
        zenFindingApi.getFindingMetadata(findingId),
        zenFindingApi.loadFinding(findingId),
      ]);

      if (metadata) {
        setTitle(metadata.title);
        setSeverity(metadata.severity);
      }

      if (content) {
        setEditorData(content);
      }
    } catch (error) {
      console.error('Failed to load finding:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editorData) return;

    setSaveState('saving');

    try {
      const result = await zenFindingApi.saveFinding({
        id: findingId || undefined,
        title,
        severity: severity as any,
        editor_data: editorData,
      });

      if (result.success) {
        if (!findingId) {
          setFindingId(result.id);
          window.history.replaceState(null, '', `/execution/findings/zen/${result.id}`);
        }
        setSaveState('saved');
        setTimeout(() => setSaveState('idle'), 2000);
      } else {
        setSaveState('error');
        setTimeout(() => setSaveState('idle'), 3000);
      }
    } catch (error) {
      console.error('Save failed:', error);
      setSaveState('error');
      setTimeout(() => setSaveState('idle'), 3000);
    }
  };

  const handlePreview = () => {
    setReadOnly(!readOnly);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Bulgu yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <div className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/execution/findings')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-slate-600" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="text-blue-600" size={20} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">ZenEditor - Bulgu Stüdyosu</h1>
                <p className="text-sm text-slate-600">Yapılandırılmış Bulgu Analizi</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMetadata(!showMetadata)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <FileText size={16} />
              {showMetadata ? 'Gizle' : 'Bilgiler'}
            </button>

            <button
              onClick={handlePreview}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {readOnly ? <EyeOff size={16} /> : <Eye size={16} />}
              {readOnly ? 'Düzenleme' : 'Önizleme'}
            </button>

            <button
              onClick={handleSave}
              disabled={saveState === 'saving'}
              className={clsx(
                'flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all',
                saveState === 'saved'
                  ? 'bg-emerald-600 text-white'
                  : saveState === 'error'
                  ? 'bg-red-600 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              )}
            >
              {saveState === 'saving' && <Loader2 size={16} className="animate-spin" />}
              {saveState === 'saved' && <Check size={16} />}
              {saveState === 'idle' && <Save size={16} />}
              {saveState === 'error' && <AlertTriangle size={16} />}
              {saveState === 'saved' && 'Kaydedildi!'}
              {saveState === 'saving' && 'Kaydediliyor...'}
              {saveState === 'idle' && 'KAYDET'}
              {saveState === 'error' && 'Hata!'}
            </button>
          </div>
        </div>

        {showMetadata && (
          <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-2">
                Bulgu Başlığı
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Bulgu başlığını girin..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-2">Önem Derecesi</label>
              <div className="flex gap-2">
                {SEVERITY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSeverity(option.value)}
                    className={clsx(
                      'flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all',
                      severity === option.value
                        ? `${option.color} text-white shadow-lg`
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        {readOnly ? (
          <div className="h-full overflow-y-auto px-8 py-6 bg-white">
            <div className="max-w-4xl mx-auto prose prose-slate">
              <h1>{title}</h1>
              <div
                className="mb-4 inline-block px-3 py-1 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: SEVERITY_OPTIONS.find((s) => s.value === severity)?.color,
                  color: 'white',
                }}
              >
                {SEVERITY_OPTIONS.find((s) => s.value === severity)?.label}
              </div>

              {editorData && (
                <>
                  <section>
                    <h2>1. Kriter (Criteria)</h2>
                    <div dangerouslySetInnerHTML={{ __html: editorData.criteria }} />
                  </section>

                  <section>
                    <h2>2. Bulgu (Condition)</h2>
                    <div dangerouslySetInnerHTML={{ __html: editorData.condition }} />
                  </section>

                  <section>
                    <h2>3. Kök Neden Analizi</h2>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <strong>Kullanılan Metod:</strong>{' '}
                      {editorData.root_cause_analysis.method === 'five_whys'
                        ? '5 Neden (5 Whys)'
                        : editorData.root_cause_analysis.method === 'fishbone'
                        ? 'Balık Kılçığı (Ishikawa)'
                        : 'Papyon (Bowtie)'}
                    </div>
                  </section>

                  <section>
                    <h2>4. Etki (Effect)</h2>
                    <div dangerouslySetInnerHTML={{ __html: editorData.effect }} />
                  </section>

                  <section>
                    <h2>5. Öneri (Recommendation)</h2>
                    <div dangerouslySetInnerHTML={{ __html: editorData.recommendation }} />
                  </section>
                </>
              )}
            </div>
          </div>
        ) : (
          <ZenEditor
            findingId={findingId || undefined}
            initialData={editorData || undefined}
            onChange={setEditorData}
          />
        )}
      </div>
    </div>
  );
}
