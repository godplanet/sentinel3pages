/**
 * ENHANCED REPORT EDITOR WITH LIVE DATA INTEGRATION
 *
 * Features:
 * - Data Sources sidebar with engagement selector
 * - Drag-and-drop dynamic blocks
 * - Live data from database (no copy-pasting)
 * - Auto-refresh capability
 */

import { useState } from 'react';
import { Save, Download, Eye, Sidebar } from 'lucide-react';
import { DataSourcesPanel } from './DataSourcesPanel';
import { DynamicFindingsBlock, DynamicStatisticsBlock } from '../blocks/DynamicFindingsBlock';

interface Block {
  id: string;
  type: 'findings-table' | 'statistics-summary' | 'executive-summary' | 'text';
  content?: string;
}

interface EnhancedReportEditorProps {
  reportId?: string;
  onSave?: (blocks: Block[]) => void;
}

export function EnhancedReportEditor({ reportId, onSave }: EnhancedReportEditorProps) {
  const [selectedEngagementId, setSelectedEngagementId] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([
    {
      id: 'intro',
      type: 'text',
      content: '<h1>Audit Report</h1><p>This report contains live data from the selected engagement.</p>',
    },
  ]);
  const [showDataSources, setShowDataSources] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const handleEngagementSelect = (engagementId: string) => {
    setSelectedEngagementId(engagementId);
  };

  const handleDrop = (e: React.DragEvent, insertIndex?: number) => {
    e.preventDefault();
    setIsDragging(false);

    const blockType = e.dataTransfer.getData('blockType') as
      | 'findings-table'
      | 'statistics-summary'
      | 'executive-summary';
    const engagementId = e.dataTransfer.getData('engagementId');

    if (!blockType || !engagementId) return;

    const newBlock: Block = {
      id: `block-${Date.now()}`,
      type: blockType,
    };

    if (insertIndex !== undefined) {
      const newBlocks = [...blocks];
      newBlocks.splice(insertIndex + 1, 0, newBlock);
      setBlocks(newBlocks);
    } else {
      setBlocks([...blocks, newBlock]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDragEnter = () => {
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  const removeBlock = (blockId: string) => {
    setBlocks(blocks.filter((b) => b.id !== blockId));
  };

  const renderBlock = (block: Block) => {
    switch (block.type) {
      case 'findings-table':
        return (
          <DynamicFindingsBlock
            engagementId={selectedEngagementId || undefined}
            onRemove={() => removeBlock(block.id)}
          />
        );
      case 'statistics-summary':
        return <DynamicStatisticsBlock engagementId={selectedEngagementId || undefined} />;
      case 'executive-summary':
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-3">Executive Summary</h2>
            <p className="text-slate-700 leading-relaxed">
              This audit was conducted to evaluate [engagement scope]. Our review identified
              several areas requiring management attention, including process improvements and
              control enhancements. Detailed findings and recommendations are presented in the
              sections below.
            </p>
          </div>
        );
      case 'text':
        return (
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: block.content || '' }}
          />
        );
      default:
        return null;
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(blocks);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {showDataSources && (
        <div className="w-80 bg-white border-r border-slate-200 flex-shrink-0 overflow-hidden">
          <DataSourcesPanel
            selectedEngagementId={selectedEngagementId}
            onEngagementSelect={handleEngagementSelect}
            onBlockDrag={(blockType) => console.log('Drag started:', blockType)}
          />
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowDataSources(!showDataSources)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              title="Toggle sidebar"
            >
              <Sidebar className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Report Editor</h1>
              <p className="text-xs text-slate-500">
                {selectedEngagementId ? 'Live data connected' : 'No engagement selected'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Report
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors">
              <Download className="w-4 h-4" />
              Export PDF
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 bg-white text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
              <Eye className="w-4 h-4" />
              Preview
            </button>
          </div>
        </div>

        <div
          className="flex-1 overflow-y-auto p-8"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
        >
          <div
            className={`max-w-5xl mx-auto bg-white rounded-lg shadow-sm border-2 transition-all ${
              isDragging
                ? 'border-blue-500 border-dashed bg-blue-50'
                : 'border-slate-200 bg-white'
            }`}
          >
            {isDragging && (
              <div className="absolute inset-0 flex items-center justify-center bg-blue-50 bg-opacity-90 rounded-lg z-10 pointer-events-none">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-700 mb-2">
                    Drop block here
                  </div>
                  <div className="text-sm text-blue-600">
                    Release to add to report
                  </div>
                </div>
              </div>
            )}

            <div className="p-12 space-y-8">
              {blocks.map((block, index) => (
                <div
                  key={block.id}
                  className="relative group"
                  onDrop={(e) => handleDrop(e, index)}
                  onDragOver={handleDragOver}
                >
                  {renderBlock(block)}

                  {index < blocks.length - 1 && (
                    <div className="h-px bg-slate-200 my-8 relative group-hover:bg-blue-300 transition-colors">
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                          Drop here
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {blocks.length === 1 && (
                <div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-lg">
                  <p className="text-slate-500">
                    Drag blocks from the sidebar to build your report
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
