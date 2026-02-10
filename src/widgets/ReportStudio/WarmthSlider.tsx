import { Sun, Sunrise } from 'lucide-react';
import clsx from 'clsx';

interface WarmthSliderProps {
  value: number;
  onChange: (value: number) => void;
  zenMode?: boolean;
}

export function WarmthSlider({ value, onChange, zenMode = false }: WarmthSliderProps) {
  return (
    <div
      className={clsx(
        'bg-white rounded-lg p-4 transition-all',
        zenMode ? 'shadow-sm' : 'shadow-md border border-slate-200'
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sunrise className="text-slate-600" size={18} />
          <span className="text-sm font-medium text-slate-700">Kağıt Sıcaklığı</span>
        </div>
        <Sun
          className={clsx(
            'transition-colors',
            value > 5 ? 'text-amber-500' : 'text-slate-400'
          )}
          size={18}
        />
      </div>

      <div className="space-y-3">
        <input
          type="range"
          min="0"
          max="10"
          step="1"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-gradient-to-r from-slate-200 via-amber-200 to-amber-400 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-slate-300 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-slate-300"
        />

        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Beyaz (Dijital)</span>
          <span
            className={clsx(
              'font-semibold transition-colors',
              value > 5 ? 'text-amber-600' : 'text-slate-600'
            )}
          >
            {value}/10
          </span>
          <span className="text-amber-600">Bej (Kindle)</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-200">
        <p className="text-xs text-slate-500 leading-relaxed">
          {value === 0
            ? 'Klasik beyaz sayfa - dijital okuma'
            : value <= 3
            ? 'Hafif krem ton - gündüz okuma'
            : value <= 6
            ? 'Orta sıcaklık - göz dostu ton'
            : value <= 8
            ? 'Sıcak bej - akşam okuma'
            : 'Kindle benzeri - gece okuma moduna hazır'}
        </p>
      </div>
    </div>
  );
}
