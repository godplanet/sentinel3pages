import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Printer, Share2, Eye, Download } from 'lucide-react';
import clsx from 'clsx';
import { reportApi } from '@/entities/report/api';
import type { Report } from '@/entities/report/model/types';
import { ViewerCanvas } from '@/widgets/ReportStudio/ViewerCanvas';
import { WarmthSlider } from '@/widgets/ReportStudio';
import { FindingDetailDrawer } from '@/widgets/ReportStudio/FindingDetailDrawer';
import { SignaturePanel } from '@/features/reporting';

export default function ReportViewerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [warmth, setWarmth] = useState(0);
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadReport();
    }
  }, [id]);

  const loadReport = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await reportApi.getReport(id);
      setReport(data);
    } catch (error) {
      console.error('Error loading report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEdit = () => {
    navigate(`/reporting/editor/${id}`);
  };

  const handleFindingClick = (findingId: string) => {
    setSelectedFindingId(findingId);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-600">Rapor yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <Eye className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Rapor bulunamadı</h2>
          <p className="text-slate-600 mb-4">Bu rapor silinmiş olabilir veya erişim izniniz yok.</p>
          <button
            onClick={() => navigate('/reporting/library')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Rapor Kütüphanesine Dön
          </button>
        </div>
      </div>
    );
  }

  const content = report.tiptap_content || report.content || '';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
      {/* Top Bar - Hidden in Print */}
      <div className="print:hidden flex-shrink-0 bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/reporting/library')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-slate-600" />
            </button>

            <div className="flex items-center gap-2">
              <Eye className="text-blue-500" size={20} />
              <span className="text-sm font-medium text-slate-700">Rapor Görüntüleme</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Edit size={16} />
              Düzenle
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Printer size={16} />
              Yazdır
            </button>

            <button
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Download size={16} />
              PDF
            </button>

            <button
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              <Share2 size={16} />
              Paylaş
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Centered Reader Canvas */}
        <div className="flex-1 overflow-y-auto py-12 px-6">
          <div className="max-w-4xl mx-auto">
            {/* Report Header */}
            <div className="mb-8 print:mb-6">
              <h1 className="text-4xl font-bold text-slate-900 mb-4 print:text-3xl">
                {report.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-slate-600 print:text-xs">
                <span>Rapor No: {report.report_number || 'N/A'}</span>
                <span className="text-slate-300">•</span>
                <span>
                  Oluşturulma: {new Date(report.created_at).toLocaleDateString('tr-TR')}
                </span>
                {report.auditor_name && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span>{report.auditor_name}</span>
                  </>
                )}
              </div>
            </div>

            {/* Viewer Canvas */}
            <ViewerCanvas
              content={content}
              warmth={warmth}
              onFindingClick={handleFindingClick}
            />

            {/* Signature Chain Panel */}
            <SignaturePanel
              reportId={id!}
              reportStatus={report.status}
              onStatusChange={loadReport}
              currentUserRole="CREATOR"
              currentUserName="Ahmet Yılmaz"
            />
          </div>
        </div>

        {/* Right Sidebar - Hidden in Print */}
        <div className="print:hidden w-72 flex-shrink-0 bg-white border-l border-slate-200 p-4 space-y-4 overflow-y-auto">
          <WarmthSlider value={warmth} onChange={setWarmth} />

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Okuma İpuçları</h3>
            <ul className="text-xs text-blue-700 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Bulgu kartlarına tıklayarak detaylı bilgi alabilirsiniz</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Kağıt sıcaklığını gözünüze göre ayarlayın</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Yazdır butonu ile PDF formatında kaydedebilirsiniz</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Rapor İstatistikleri</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Durum:</span>
                <span className="font-medium text-slate-900">
                  {report.status === 'PUBLISHED' ? 'Yayınlandı' : report.status === 'REVIEW' ? 'İncelemede' : 'Taslak'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Versiyon:</span>
                <span className="font-medium text-slate-900">v{report.version_number || 1}</span>
              </div>
              {report.engagement_id && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Denetim ID:</span>
                  <span className="font-mono text-slate-900 text-[10px]">
                    {report.engagement_id.slice(0, 8)}...
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Finding Detail Drawer */}
      {selectedFindingId && (
        <FindingDetailDrawer
          findingId={selectedFindingId}
          onClose={() => setSelectedFindingId(null)}
        />
      )}
    </div>
  );
}
