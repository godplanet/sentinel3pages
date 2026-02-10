import { useState } from 'react';
import { PageHeader } from '@/shared/ui';
import { DynamicReportEditor, exportReportToPDF, prepareContentForPDF } from '@/features/report-editor';
import { Wand2, Sparkles } from 'lucide-react';
import { supabase } from '@/shared/api/supabase';

export default function ReportBuilderPage() {
  const [reportTitle, setReportTitle] = useState('Executive Audit Report');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (content: string, html: string) => {
    setIsSaving(true);
    try {
      const { error } = await supabase.from('audit_reports').insert({
        report_title: reportTitle,
        content: content,
        html_content: html,
        created_at: new Date().toISOString(),
        status: 'draft',
      });

      if (error) throw error;

      alert('Report saved successfully!');
    } catch (err) {
      console.error('Failed to save report:', err);
      alert('Failed to save report. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPDF = async () => {
    const editorContent = document.querySelector('.ProseMirror')?.innerHTML || '';
    const preparedContent = prepareContentForPDF(editorContent);

    try {
      await exportReportToPDF(preparedContent, {
        title: reportTitle,
        author: 'Sentinel GRC v3.0',
        orientation: 'portrait',
        includeHeader: true,
        includeFooter: true,
      });
    } catch (err) {
      console.error('Failed to export PDF:', err);
      alert('Failed to export PDF. Please ensure popups are enabled.');
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dynamic Report Builder</h1>
            <p className="text-sm text-slate-600 mt-1">
              Drag-and-drop editor with live data blocks powered by Sentinel Prime AI
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-medium text-purple-700">Live Blocks Active</span>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Report Title</label>
              <input
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="w-64 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <Wand2 className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-slate-800">AI-Powered Live Document System</h3>
            <p className="text-xs text-slate-600 mt-1">
              Insert <span className="font-mono bg-white px-1 py-0.5 rounded">{'{{RiskHeatmap}}'}</span>,{' '}
              <span className="font-mono bg-white px-1 py-0.5 rounded">{'{{FindingTable}}'}</span>, or{' '}
              <span className="font-mono bg-white px-1 py-0.5 rounded">{'{{ExecutiveSummary}}'}</span>{' '}
              to embed live data. These blocks update automatically with current system state.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <DynamicReportEditor
          reportTitle={reportTitle}
          onSave={handleSave}
          onExportPDF={handleExportPDF}
        />
      </div>
    </div>
  );
}
