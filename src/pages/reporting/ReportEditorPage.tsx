import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Eye,
  Clock,
  CheckCircle,
  Glasses,
  FileText,
  MoreVertical,
} from 'lucide-react';
import clsx from 'clsx';
import { MOCK_REPORT_ARCHIVE, MOCK_REPORT_TEMPLATES } from '@/shared/data/mock-reports';

const STATUS_CONFIG = {
  draft: { label: 'Taslak', color: 'bg-slate-100 text-slate-700', icon: Clock },
  review: { label: 'İncelemede', color: 'bg-amber-100 text-amber-700', icon: Eye },
  published: { label: 'Yayımlandı', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
};

export default function ReportEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('template');

  const isNew = id === 'new';
  const report = isNew ? null : MOCK_REPORT_ARCHIVE.find((r) => r.id === id);
  const template = templateId ? MOCK_REPORT_TEMPLATES.find((t) => t.id === templateId) : null;

  const [title, setTitle] = useState(report?.title || template?.title || 'Yeni Rapor');
  const [status, setStatus] = useState<'draft' | 'review' | 'published'>(
    (report?.status as any) || 'draft'
  );
  const [zenMode, setZenMode] = useState(false);

  const statusCfg = STATUS_CONFIG[status];
  const StatusIcon = statusCfg.icon;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
      {/* Top Bar */}
      {!zenMode && (
        <div className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/reporting/library')}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-slate-600" />
              </button>

              <div className="flex items-center gap-2">
                <FileText className="text-slate-400" size={20} />
                <span className="text-sm text-slate-500">Rapor Düzenleyici</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setZenMode(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Glasses size={16} />
                Zen Modu
              </button>

              <div className="relative">
                <button
                  className={clsx(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    statusCfg.color
                  )}
                >
                  <StatusIcon size={14} />
                  {statusCfg.label}
                </button>
              </div>

              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
                <Save size={16} />
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Editor Area */}
      <div className="flex-1 overflow-y-auto py-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Paper Canvas */}
          <div className="bg-white shadow-2xl rounded-xl min-h-[calc(100vh-12rem)] p-12">
            {/* Editable Title */}
            <div className="mb-8 border-b border-slate-200 pb-6">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-4xl font-bold text-slate-900 border-none focus:outline-none focus:ring-0 placeholder-slate-300"
                placeholder="Rapor Başlığı..."
              />
              <div className="flex items-center gap-4 mt-4">
                <span className="text-sm text-slate-500">
                  {isNew ? 'Yeni Rapor' : `Oluşturulma: ${new Date(report?.created_at || '').toLocaleDateString('tr-TR')}`}
                </span>
                {report?.auditor_name && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="text-sm text-slate-500">{report.auditor_name}</span>
                  </>
                )}
              </div>
            </div>

            {/* Empty State / Content Placeholder */}
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="text-slate-400" size={32} />
              </div>
              <p className="text-lg font-semibold text-slate-700 mb-2">
                Rapor içeriği yükleniyor...
              </p>
              <p className="text-sm text-slate-500 mb-6">
                (Faz 3 Bekleniyor - TipTap Entegrasyonu)
              </p>

              {template && (
                <div className="max-w-md mx-auto bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                  <p className="text-sm font-semibold text-blue-900 mb-2">
                    Seçilen Şablon: {template.title}
                  </p>
                  <p className="text-xs text-blue-700 mb-3">{template.description}</p>
                  <div className="space-y-2">
                    {template.structure_json.slice(0, 3).map((block, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-blue-600">
                        <div className="w-2 h-2 bg-blue-400 rounded-full" />
                        <span>{block.block_type}: {(block.content as any).text?.substring(0, 50) || 'Content block'}</span>
                      </div>
                    ))}
                    {template.structure_json.length > 3 && (
                      <p className="text-xs text-blue-500 pl-4">
                        +{template.structure_json.length - 3} daha fazla blok
                      </p>
                    )}
                  </div>
                </div>
              )}

              {isNew && !template && (
                <div className="max-w-md mx-auto text-left space-y-2 mt-6">
                  <p className="text-sm text-slate-600">Bu sayfada şunlar hazır olacak:</p>
                  <ul className="text-sm text-slate-500 space-y-1 pl-4">
                    <li>• TipTap zengin metin düzenleyici</li>
                    <li>• Blok tabanlı içerik (başlık, paragraf, bulgu referansı)</li>
                    <li>• Canlı grafik ve metrik blokları</li>
                    <li>• Otomatik kayıt ve versiyon geçmişi</li>
                    <li>• PDF/Word dışa aktarma</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Zen Mode Overlay */}
      {zenMode && (
        <div className="fixed inset-0 bg-slate-900 z-50 flex items-center justify-center">
          <button
            onClick={() => setZenMode(false)}
            className="absolute top-6 right-6 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm"
          >
            Zen Modundan Çık
          </button>

          <div className="max-w-4xl w-full mx-auto px-6">
            <div className="bg-white shadow-2xl rounded-xl p-12">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-3xl font-bold text-slate-900 border-none focus:outline-none focus:ring-0 placeholder-slate-300 mb-8"
                placeholder="Rapor Başlığı..."
              />

              <div className="py-20 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="text-slate-400" size={32} />
                </div>
                <p className="text-lg font-semibold text-slate-700 mb-2">
                  Zen Modu Hazırlanıyor...
                </p>
                <p className="text-sm text-slate-500">
                  (Faz 3 - Tam Ekran Odaklanma Deneyimi)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
