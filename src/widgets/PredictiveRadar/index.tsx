import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radar, Brain, Sparkles, Loader2, TrendingUp, TrendingDown,
  AlertTriangle, Target, CloudRain, Sun, CloudLightning, Cloud
} from 'lucide-react';
import { useSentinelAI } from '@/shared/hooks/useSentinelAI';
import clsx from 'clsx';

interface RiskForecast {
  category: string;
  currentScore: number;
  projectedScore: number;
  trend: 'rising' | 'falling' | 'stable';
  changePercent: number;
  weather: 'storm' | 'rain' | 'cloudy' | 'sunny';
  color: string;
}

const MOCK_FORECASTS: RiskForecast[] = [
  { category: 'Operasyonel Risk', currentScore: 72, projectedScore: 83, trend: 'rising', changePercent: 15.3, weather: 'storm', color: 'rgb(239, 68, 68)' },
  { category: 'Kredi Riski', currentScore: 65, projectedScore: 71, trend: 'rising', changePercent: 9.2, weather: 'rain', color: 'rgb(249, 115, 22)' },
  { category: 'BT / Siber Risk', currentScore: 58, projectedScore: 64, trend: 'rising', changePercent: 10.3, weather: 'rain', color: 'rgb(245, 158, 11)' },
  { category: 'Uyumluluk Riski', currentScore: 45, projectedScore: 42, trend: 'falling', changePercent: -6.7, weather: 'cloudy', color: 'rgb(59, 130, 246)' },
  { category: 'Piyasa Riski', currentScore: 51, projectedScore: 55, trend: 'rising', changePercent: 7.8, weather: 'cloudy', color: 'rgb(168, 85, 247)' },
  { category: 'Itibar Riski', currentScore: 30, projectedScore: 28, trend: 'falling', changePercent: -6.7, weather: 'sunny', color: 'rgb(16, 185, 129)' },
];

const WEATHER_ICONS = {
  storm: CloudLightning,
  rain: CloudRain,
  cloudy: Cloud,
  sunny: Sun,
};

const WEATHER_LABELS = {
  storm: { label: 'Firtina', color: 'text-red-600', bg: 'bg-red-100' },
  rain: { label: 'Yagmurlu', color: 'text-orange-600', bg: 'bg-orange-100' },
  cloudy: { label: 'Bulutlu', color: 'text-slate-600', bg: 'bg-slate-100' },
  sunny: { label: 'Gunesli', color: 'text-emerald-600', bg: 'bg-emerald-100' },
};

function RadarVisualization({ forecasts }: { forecasts: RiskForecast[] }) {
  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = 110;
  const levels = 4;
  const count = forecasts.length;

  const angleSlice = (Math.PI * 2) / count;

  const gridLines = Array.from({ length: levels }, (_, i) => {
    const r = maxRadius * ((i + 1) / levels);
    const points = Array.from({ length: count }, (_, j) => {
      const angle = angleSlice * j - Math.PI / 2;
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    });
    return points.join(' ');
  });

  const currentPoints = forecasts.map((f, i) => {
    const angle = angleSlice * i - Math.PI / 2;
    const r = (f.currentScore / 100) * maxRadius;
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  });

  const projectedPoints = forecasts.map((f, i) => {
    const angle = angleSlice * i - Math.PI / 2;
    const r = (f.projectedScore / 100) * maxRadius;
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  });

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[280px] mx-auto">
      {gridLines.map((points, i) => (
        <polygon key={i} points={points} fill="none" stroke="rgb(226,232,240)" strokeWidth="1" opacity={0.6} />
      ))}

      {forecasts.map((_, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const x2 = cx + maxRadius * Math.cos(angle);
        const y2 = cy + maxRadius * Math.sin(angle);
        return <line key={i} x1={cx} y1={cy} x2={x2} y2={y2} stroke="rgb(226,232,240)" strokeWidth="1" opacity={0.4} />;
      })}

      <polygon points={projectedPoints.join(' ')} fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.5)" strokeWidth="1.5" strokeDasharray="4 3" />
      <polygon points={currentPoints.join(' ')} fill="rgba(59,130,246,0.12)" stroke="rgba(59,130,246,0.7)" strokeWidth="2" />

      {forecasts.map((f, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const cr = (f.currentScore / 100) * maxRadius;
        const pr = (f.projectedScore / 100) * maxRadius;
        return (
          <g key={i}>
            <circle cx={cx + cr * Math.cos(angle)} cy={cy + cr * Math.sin(angle)} r="3.5" fill="rgb(59,130,246)" />
            <circle cx={cx + pr * Math.cos(angle)} cy={cy + pr * Math.sin(angle)} r="3" fill="rgb(239,68,68)" strokeDasharray="2 2" stroke="rgb(239,68,68)" strokeWidth="1" />
          </g>
        );
      })}

      {forecasts.map((f, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const labelR = maxRadius + 22;
        const x = cx + labelR * Math.cos(angle);
        const y = cy + labelR * Math.sin(angle);
        return (
          <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="text-[8px] font-bold fill-slate-600">
            {f.category.split(' ')[0]}
          </text>
        );
      })}
    </svg>
  );
}

export function PredictiveRadar() {
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const { loading: aiLoading, generate, configured } = useSentinelAI();

  const risingRisks = MOCK_FORECASTS.filter(f => f.trend === 'rising').sort((a, b) => b.changePercent - a.changePercent);
  const topRisk = risingRisks[0];

  const handlePredict = useCallback(async () => {
    setAiInsight(null);
    const riskData = MOCK_FORECASTS.map(f =>
      `${f.category}: Mevcut=${f.currentScore}, Projeksiyon=${f.projectedScore}, Trend=${f.trend}, Degisim=${f.changePercent > 0 ? '+' : ''}${f.changePercent.toFixed(1)}%`
    ).join('\n');

    const prompt = `Bir Ic Denetim Baskaninin ongorusel risk radarini analiz ediyorsun.

Q1 ve Q2 TREND VERILERI:
${riskData}

Lutfen su formatta analiz yap:
1. EN KRITIK ONGORULER: Q3 icin en yuksek risk artisi beklenen 2-3 alan.
2. ONERILEN AKSIYONLAR: Her yukselen risk icin somut denetim aksiyonu oner (ornegin: surpriz denetim, ek ornekleme, vb).
3. OLUMLU TRENDLER: Dusus gosteren alanlardaki basariyi not et.
Kisa, kararlı ve aksiyon odakli yaz. Turkce yanit ver.`;

    const result = await generate(prompt);
    if (result) setAiInsight(result);
  }, [generate]);

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-500/20 rounded-xl flex items-center justify-center">
            <Radar size={18} className="text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Ongorusel Risk Radari</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Q3 2025 Projeksiyon - Tarihi Trend Analizi</p>
          </div>
        </div>
        <button
          onClick={handlePredict}
          disabled={aiLoading || !configured}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-bold hover:bg-blue-600 disabled:bg-slate-600 disabled:text-slate-400 transition-colors"
        >
          {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Brain size={12} />}
          {aiLoading ? 'Analiz...' : 'AI Tahmin'}
        </button>
      </div>

      <div className="p-5 space-y-5">
        <div className="flex items-start gap-5">
          <div className="flex-shrink-0">
            <RadarVisualization forecasts={MOCK_FORECASTS} />
            <div className="flex items-center justify-center gap-4 mt-2">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-1.5 rounded-full bg-blue-500" />
                <span className="text-[10px] text-slate-500 font-medium">Mevcut</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-1.5 rounded-full bg-red-400 border border-dashed border-red-400" />
                <span className="text-[10px] text-slate-500 font-medium">Q3 Projeksiyon</span>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-2">
            {topRisk && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle size={14} className="text-red-600" />
                  <span className="text-xs font-bold text-red-800">En Yuksek Risk Artisi</span>
                </div>
                <p className="text-xs text-red-700">
                  <span className="font-bold">{topRisk.category}</span> alaninda Q3'te{' '}
                  <span className="font-bold">+%{topRisk.changePercent.toFixed(1)}</span> artis bekleniyor.
                </p>
              </div>
            )}

            {MOCK_FORECASTS.map(f => {
              const WeatherIcon = WEATHER_ICONS[f.weather];
              const weatherCfg = WEATHER_LABELS[f.weather];

              return (
                <div key={f.category} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className={clsx('w-7 h-7 rounded-lg flex items-center justify-center', weatherCfg.bg)}>
                    <WeatherIcon size={14} className={weatherCfg.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{f.category}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-blue-500" style={{ width: `${f.currentScore}%` }} />
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">{f.currentScore}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {f.trend === 'rising' ? (
                      <TrendingUp size={12} className="text-red-500" />
                    ) : (
                      <TrendingDown size={12} className="text-emerald-500" />
                    )}
                    <span className={clsx(
                      'text-[10px] font-bold',
                      f.trend === 'rising' ? 'text-red-600' : 'text-emerald-600'
                    )}>
                      {f.changePercent > 0 ? '+' : ''}{f.changePercent.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <AnimatePresence>
          {aiInsight && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-slate-50 border border-slate-200 rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <Brain size={14} className="text-slate-600" />
                <h4 className="text-xs font-bold text-slate-800">Sentinel Tahmin Analizi</h4>
                <span className="ml-auto flex items-center gap-1 text-[10px] text-slate-400">
                  <Sparkles size={10} />
                  AI
                </span>
              </div>
              <div className="space-y-1.5">
                {aiInsight.split('\n').filter(Boolean).map((line, i) => {
                  const trimmed = line.trim();
                  if (!trimmed) return null;
                  if (trimmed.match(/^\d+\./) || trimmed.match(/^[A-Z\u00C0-\u017F\s]{4,}:/)) {
                    return <h5 key={i} className="text-xs font-bold text-slate-800 mt-2">{trimmed}</h5>;
                  }
                  if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
                    return (
                      <div key={i} className="flex items-start gap-2 ml-1">
                        <Target size={10} className="text-blue-500 mt-1 flex-shrink-0" />
                        <p className="text-[11px] text-slate-600 leading-relaxed">{trimmed.replace(/^[-*]\s*/, '')}</p>
                      </div>
                    );
                  }
                  return <p key={i} className="text-[11px] text-slate-600 leading-relaxed">{trimmed}</p>;
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!configured && (
          <p className="text-[10px] text-amber-600 text-center">
            AI tahmin icin Ayarlar &gt; Cognitive Engine sayfasindan API anahtarinizi girin.
          </p>
        )}
      </div>
    </div>
  );
}
