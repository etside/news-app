import { useState, useEffect } from 'react';
import DhLogo from '../shared/DhLogo';

interface AnalyticsData {
  pageViews: number;
  uniqueVisitors: number;
  avgReadTime: string;
  topArticles: { title: string; views: number; category: string }[];
  trafficByDay: { day: string; views: number }[];
  trafficBySource: { source: string; percentage: number }[];
}

function generateMockData(): AnalyticsData {
  return {
    pageViews: 24680,
    uniqueVisitors: 12340,
    avgReadTime: '3m 42s',
    topArticles: [
      { title: 'Bangladesh Parliament Approves Digital Governance Bill', views: 4520, category: 'Politics' },
      { title: 'Dhaka Stock Exchange Hits Record High', views: 3210, category: 'Economy' },
      { title: 'AI Startup Raises $50M Series B', views: 2890, category: 'Technology' },
      { title: 'Bangladesh Cricket World Cup Prep', views: 2340, category: 'Sports' },
      { title: 'UNESCO Jamdani Weaving Recognition', views: 1870, category: 'Culture' },
    ],
    trafficByDay: [
      { day: 'Mon', views: 3200 },
      { day: 'Tue', views: 4100 },
      { day: 'Wed', views: 3800 },
      { day: 'Thu', views: 4500 },
      { day: 'Fri', views: 3900 },
      { day: 'Sat', views: 2800 },
      { day: 'Sun', views: 2380 },
    ],
    trafficBySource: [
      { source: 'Direct', percentage: 35 },
      { source: 'Google', percentage: 28 },
      { source: 'Social Media', percentage: 22 },
      { source: 'Referral', percentage: 15 },
    ],
  };
}

interface AnalyticsPanelProps {
  onBack: () => void;
}

export default function AnalyticsPanel({ onBack }: AnalyticsPanelProps) {
  const [data] = useState<AnalyticsData>(generateMockData);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('7d');

  const maxViews = Math.max(...data.trafficByDay.map(d => d.views));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center hover:bg-surface-3 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </button>
            <h1 className="font-headline text-lg font-bold">Analytics</h1>
          </div>
          <div className="flex gap-1">
            {(['7d', '30d', '90d'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  period === p ? 'bg-gold text-black' : 'bg-surface-2 text-text-muted hover:text-text-secondary'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-5 space-y-5">
        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 rounded-xl bg-surface border border-border text-center">
            <div className="text-2xl font-bold text-gold">{data.pageViews.toLocaleString()}</div>
            <div className="text-xs text-text-muted">Page Views</div>
          </div>
          <div className="p-3 rounded-xl bg-surface border border-border text-center">
            <div className="text-2xl font-bold text-green-500">{data.uniqueVisitors.toLocaleString()}</div>
            <div className="text-xs text-text-muted">Unique Visitors</div>
          </div>
          <div className="p-3 rounded-xl bg-surface border border-border text-center">
            <div className="text-2xl font-bold text-blue-500">{data.avgReadTime}</div>
            <div className="text-xs text-text-muted">Avg. Read Time</div>
          </div>
        </div>

        {/* Traffic Chart (Simple Bar) */}
        <div className="p-4 rounded-xl bg-surface border border-border">
          <h3 className="text-sm font-semibold mb-3">Traffic This Week</h3>
          <div className="flex items-end gap-2 h-32">
            {data.trafficByDay.map(d => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-text-muted">{(d.views / 1000).toFixed(1)}k</span>
                <div
                  className="w-full rounded-t-md bg-gold/30 hover:bg-gold/50 transition-colors"
                  style={{ height: `${(d.views / maxViews) * 100}%` }}
                />
                <span className="text-xs text-text-muted">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Articles */}
        <div className="p-4 rounded-xl bg-surface border border-border">
          <h3 className="text-sm font-semibold mb-3">Top Articles</h3>
          <div className="space-y-2">
            {data.topArticles.map((a, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-lg font-bold text-text-muted w-6 text-center">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{a.title}</p>
                  <p className="text-xs text-text-muted">{a.category}</p>
                </div>
                <span className="text-sm font-bold text-gold">{a.views.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="p-4 rounded-xl bg-surface border border-border">
          <h3 className="text-sm font-semibold mb-3">Traffic Sources</h3>
          <div className="space-y-2">
            {data.trafficBySource.map(s => (
              <div key={s.source}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-text-secondary">{s.source}</span>
                  <span className="text-text-muted">{s.percentage}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-3 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gold transition-all"
                    style={{ width: `${s.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Export */}
        <button
          onClick={() => {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `dhaka-heralds-analytics-${period}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="w-full py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-surface-2 transition-colors"
        >
          Export Analytics Data
        </button>
      </div>
    </div>
  );
}
