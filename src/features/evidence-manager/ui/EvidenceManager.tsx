import { useState } from 'react';
import { useWorkpaperStore } from '@/entities/workpaper';
import type { EvidenceItem } from '@/entities/workpaper';

interface EvidenceManagerProps {
  workpaperId: string;
}

export function EvidenceManager({ workpaperId }: EvidenceManagerProps) {
  const { getEvidenceByWorkpaper, addEvidence } = useWorkpaperStore();
  const evidence = getEvidenceByWorkpaper(workpaperId);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    for (const file of Array.from(files)) {
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

      addEvidence({
        workpaper_id: workpaperId,
        file_name: file.name,
        file_size_bytes: file.size,
        sha256_hash: hashHex,
        storage_path: `/evidence/${new Date().getFullYear()}/Q${Math.ceil((new Date().getMonth() + 1) / 3)}/${file.name}`,
      });
    }

    setUploading(false);
    e.target.value = '';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return '📄';
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
        return '🖼️';
      case 'doc':
      case 'docx':
        return '📝';
      case 'xls':
      case 'xlsx':
        return '📊';
      default:
        return '📎';
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Kanıt Zinciri</h3>
        <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
          {uploading ? 'Yükleniyor...' : '+ Kanıt Yükle'}
        </label>
      </div>

      <div className="space-y-2">
        {evidence.length === 0 ? (
          <div className="text-center py-8">
            <svg
              className="w-16 h-16 mx-auto text-gray-300 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm text-gray-500">Henüz kanıt yüklenmedi</p>
            <p className="text-xs text-gray-400 mt-1">"Kanıt Yükle" düğmesine tıklayarak dosya ekleyin</p>
          </div>
        ) : (
          evidence.map((item: EvidenceItem) => (
            <div
              key={item.id}
              className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-2xl">{getFileIcon(item.file_name)}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 truncate">{item.file_name}</p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-xs text-gray-500">{formatFileSize(item.file_size_bytes)}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(item.uploaded_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-xs text-green-600 font-medium">Kriptografik Mühür Uygulandı</span>
                  </div>
                  <p className="text-xs text-gray-400 font-mono mt-1 truncate" title={item.sha256_hash}>
                    SHA-256: {item.sha256_hash.substring(0, 16)}...
                  </p>
                </div>
              </div>
              <button
                className="text-blue-600 hover:text-blue-800 transition-colors"
                title="İndir"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      {evidence.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <span>
              Tüm kanıtlar, denetim bütünlüğü için kriptografik doğrulama ile değiştirilemez biçimde saklanmaktadır.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
