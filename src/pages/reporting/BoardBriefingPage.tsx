import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { useActiveReportStore } from '@/entities/report';
import { mockReport } from '@/entities/report/api/mock-data';
import { BoardBriefingCard } from '@/features/report-editor/ui/BoardBriefingCard';

export default function BoardBriefingPage() {
  const navigate = useNavigate();
  const { activeReport, setActiveReport } = useActiveReportStore();

  useEffect(() => {
    setActiveReport(mockReport);
    return () => {
      setActiveReport(null);
    };
  }, [setActiveReport]);

  if (!activeReport) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FDFBF7]">
        <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-[#FDFBF7] min-h-screen">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm font-sans font-medium text-slate-500 hover:text-slate-900 transition-colors px-2 py-1.5 rounded-lg hover:bg-slate-100"
          >
            <ArrowLeft size={16} />
            Geri
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-sans font-semibold text-slate-700">YK Sunumu</span>
            <span className="text-slate-300">|</span>
            <span className="text-sm font-sans text-slate-500">Salt Okunur Görünüm</span>
          </div>
          <button
            onClick={() => navigate(`/reporting/zen-editor/${activeReport.id}`)}
            className="flex items-center gap-1.5 text-sm font-sans font-medium text-blue-600 hover:text-blue-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-50"
          >
            <ExternalLink size={14} />
            Editörde Aç
          </button>
        </div>
      </header>

      <BoardBriefingCard report={activeReport} />
    </div>
  );
}
