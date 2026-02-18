import { useEffect } from 'react';
import { useActiveReportStore } from '@/entities/report';
import { mockReport } from '@/entities/report/api/mock-data';
import { LiquidGlassToolbar } from '@/features/report-editor/ui/LiquidGlassToolbar';
import { SectionNavigator } from '@/features/report-editor/ui/SectionNavigator';
import { ZenCanvas } from '@/features/report-editor/ui/ZenCanvas';
import { BlockPalette } from '@/features/report-editor/ui/BlockPalette';

export default function ReportEditorPage() {
  const { setActiveReport } = useActiveReportStore();

  useEffect(() => {
    setActiveReport(mockReport);
    return () => {
      setActiveReport(null);
    };
  }, [setActiveReport]);

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-slate-50">
      <LiquidGlassToolbar />

      <div className="flex-1 flex overflow-hidden">
        <SectionNavigator />
        <ZenCanvas />
        <BlockPalette />
      </div>
    </div>
  );
}
