import { PageHeader } from '@/shared/ui';
import { QAIPReviewWidget } from '@/widgets/QAIPReview';
import { Shield, CheckCircle2, FileCheck, Award } from 'lucide-react';

export default function QAIPPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="QAIP - Kalite Güvence ve İyileştirme Programı"
        subtitle="Denetim kalitesini değerlendirin ve sürekli iyileştirme sağlayın"
      />

      <div className="space-y-8">
        <div className="mb-8 bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">QAIP Master - GIAS Std 12.1</h2>
              <p className="text-green-100 mb-4">
                Kalite Güvence ve İyileştirme Programı (QAIP) kapsamında denetim dosyalarının
                ve süreçlerinin kalite standartlarına uygunluğunu sistematik olarak değerlendirin.
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5">
                  <FileCheck className="w-4 h-4" />
                  <span>Dosya Kapanış Kontrolü</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Ağırlıklı Puanlama</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5">
                  <Award className="w-4 h-4" />
                  <span>IIA Uyumlu</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <QAIPReviewWidget />
      </div>
    </div>
  );
}
