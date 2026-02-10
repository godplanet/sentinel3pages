import { useState } from 'react';
import {
  FileText,
  TrendingUp,
  BarChart3,
  PenTool,
  Trash2,
  GripVertical,
  AlertCircle,
} from 'lucide-react';
import clsx from 'clsx';
import type { ReportBlock, BlockType } from '@/entities/report';

interface BlockRendererProps {
  block: ReportBlock;
  isEditing: boolean;
  isLocked?: boolean;
  onUpdate: (content: any) => void;
  onDelete: () => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export const BlockRenderer = ({
  block,
  isEditing,
  isLocked,
  onUpdate,
  onDelete,
  onDragStart,
  onDragEnd,
}: BlockRendererProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const renderContent = () => {
    switch (block.block_type) {
      case 'heading':
        return renderHeading();
      case 'paragraph':
        return renderParagraph();
      case 'finding_ref':
        return renderFindingRef();
      case 'live_chart':
        return renderLiveChart();
      case 'dynamic_metric':
        return renderDynamicMetric();
      case 'signature':
        return renderSignature();
      case 'divider':
        return renderDivider();
      default:
        return <div className="text-gray-500 italic">Unknown block type</div>;
    }
  };

  const renderHeading = () => {
    const content = block.content as any;
    const level = content.level || 1;
    const text = content.text || 'Untitled';
    const Tag = `h${level}` as keyof JSX.IntrinsicElements;

    const sizeClasses = {
      1: 'text-3xl font-bold',
      2: 'text-2xl font-bold',
      3: 'text-xl font-semibold',
      4: 'text-lg font-semibold',
      5: 'text-base font-semibold',
      6: 'text-sm font-semibold',
    };

    if (isEditing && !isLocked) {
      return (
        <input
          type="text"
          value={text}
          onChange={(e) => onUpdate({ ...content, text: e.target.value })}
          className={clsx(
            'w-full bg-transparent border-none outline-none focus:ring-0',
            sizeClasses[level as keyof typeof sizeClasses],
            'text-gray-900 dark:text-white'
          )}
          placeholder="Enter heading..."
        />
      );
    }

    return (
      <Tag className={clsx(sizeClasses[level as keyof typeof sizeClasses], 'text-gray-900 dark:text-white')}>
        {text}
      </Tag>
    );
  };

  const renderParagraph = () => {
    const content = block.content as any;
    const text = content.text || '';

    if (isEditing && !isLocked) {
      return (
        <textarea
          value={text}
          onChange={(e) => onUpdate({ ...content, text: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 bg-white/50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm text-gray-900"
          placeholder="Enter paragraph text..."
        />
      );
    }

    return <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{text}</p>;
  };

  const renderFindingRef = () => {
    const content = block.content as any;
    const findingId = content.finding_id;

    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-semibold text-red-900 mb-1">Finding Reference</div>
            <div className="text-xs text-red-700">Finding ID: {findingId || 'Not set'}</div>
            {isEditing && !isLocked && (
              <input
                type="text"
                value={findingId || ''}
                onChange={(e) => onUpdate({ ...content, finding_id: e.target.value })}
                className="mt-2 px-2 py-1 text-xs bg-white border border-red-300 rounded focus:ring-2 focus:ring-red-500 w-full"
                placeholder="Enter finding ID..."
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderLiveChart = () => {
    const content = block.content as any;
    const chartType = content.chart_type || 'risk_distribution';

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          <div>
            <div className="text-sm font-semibold text-blue-900">Live Chart</div>
            <div className="text-xs text-blue-700">Type: {chartType}</div>
          </div>
        </div>
        <div className="h-48 bg-white/50 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <div className="text-sm">Chart will render here</div>
          </div>
        </div>
      </div>
    );
  };

  const renderDynamicMetric = () => {
    const content = block.content as any;
    const label = content.label || 'Metric';
    const value = content.fallback || 0;
    const format = content.format || 'number';

    const formattedValue =
      format === 'percentage' ? `${value}%` : format === 'currency' ? `$${value}` : value;

    return (
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-2">{label}</div>
          <div className="text-4xl font-bold text-gray-900">{formattedValue}</div>
          {isEditing && !isLocked && (
            <input
              type="text"
              value={content.metric_key || ''}
              onChange={(e) => onUpdate({ ...content, metric_key: e.target.value })}
              className="mt-3 px-3 py-1 text-xs bg-white border border-gray-300 rounded w-full text-center"
              placeholder="Metric key..."
            />
          )}
        </div>
      </div>
    );
  };

  const renderSignature = () => {
    const content = block.content as any;
    const signerName = content.signer_name || 'John Doe';
    const signerTitle = content.signer_title || 'Chief Audit Executive';

    return (
      <div className="border-t-2 border-gray-300 pt-6 mt-8">
        <div className="flex items-start gap-4">
          <PenTool className="w-5 h-5 text-gray-600" />
          <div className="flex-1">
            {isEditing && !isLocked ? (
              <>
                <input
                  type="text"
                  value={signerName}
                  onChange={(e) => onUpdate({ ...content, signer_name: e.target.value })}
                  className="w-full px-3 py-2 mb-2 bg-white border border-gray-300 rounded text-sm"
                  placeholder="Signer name..."
                />
                <input
                  type="text"
                  value={signerTitle}
                  onChange={(e) => onUpdate({ ...content, signer_title: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm"
                  placeholder="Signer title..."
                />
              </>
            ) : (
              <>
                <div className="text-lg font-semibold text-gray-900">{signerName}</div>
                <div className="text-sm text-gray-600">{signerTitle}</div>
              </>
            )}
            <div className="text-xs text-gray-500 mt-2">
              {content.signed_at
                ? new Date(content.signed_at).toLocaleDateString()
                : 'Not signed yet'}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDivider = () => {
    return <hr className="my-6 border-gray-300" />;
  };

  return (
    <div
      className={clsx(
        'group relative px-4 py-3 rounded-lg transition-all',
        isHovered && isEditing && 'bg-blue-50/30',
        isLocked && 'opacity-60 cursor-not-allowed'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isEditing && !isLocked && isHovered && (
        <div className="absolute left-0 top-3 flex items-center gap-1 -ml-12">
          <button
            onMouseDown={onDragStart}
            onMouseUp={onDragEnd}
            className="p-1 hover:bg-gray-200 rounded cursor-move"
          >
            <GripVertical className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 hover:bg-red-100 rounded transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      )}

      {isLocked && (
        <div className="absolute top-2 right-2 text-xs text-gray-500 bg-yellow-100 px-2 py-1 rounded">
          Locked
        </div>
      )}

      {renderContent()}
    </div>
  );
};
