import { useState, useEffect } from 'react';
import { Download, TrendingUp, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import Sidebar from '../../components/shared/Sidebar';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';

const monthlySavingsData = [
  { month: 'Jan', savings: 34000 },
  { month: 'Feb', savings: 92000 },
  { month: 'Mar', savings: 110000 },
  { month: 'Apr', savings: 45000 },
  { month: 'May', savings: 78000 },
  { month: 'Jun', savings: 120000 },
  { month: 'Jul', savings: 65000 },
  { month: 'Aug', savings: 88000 },
  { month: 'Sep', savings: 93450 },
  { month: 'Oct', savings: 2.3 * 100000 }, // Matches dashboard ₹2.3L
];

const categories = ['Raw Materials', 'Services', 'Equipment', 'Consumables', 'Other'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Generate dummy heatmap spending matrix (values in thousands)
const heatmapData = {
  'Raw Materials': [120, 150, 180, 90, 210, 310, 140, 190, 280, 340, 0, 0],
  'Services': [40, 50, 45, 60, 55, 70, 80, 75, 90, 95, 0, 0],
  'Equipment': [0, 320, 0, 150, 0, 450, 0, 0, 200, 0, 0, 0],
  'Consumables': [25, 30, 28, 35, 30, 45, 40, 38, 42, 45, 0, 0],
  'Other': [10, 15, 12, 8, 20, 25, 18, 22, 15, 30, 0, 0],
};

const topVendors = [
  { rank: 1, name: 'Global Supplies', score: 95, orders: 28, stat: '99% On-time' },
  { rank: 2, name: 'Mehta Industries', score: 87, orders: 12, stat: '45% Win rate' },
  { rank: 3, name: 'Kirloskar Pumps', score: 85, orders: 14, stat: 'Avg response: 1.5h' },
];

const bottomVendors = [
  { rank: 4, name: 'Sharma Traders', score: 68, orders: 8, stat: '1 Dispute' },
  { rank: 5, name: 'Standard Logistics', score: 54, orders: 3, stat: '2 Late deliveries' },
];

const funnelData = [
  { stage: 'RFQs CREATED', count: 23, pct: 100 },
  { stage: 'QUOTES RECEIVED', count: 19, pct: 83 },
  { stage: 'COMPARISONS DONE', count: 17, pct: 74 },
  { stage: 'APPROVALS GRANTED', count: 15, pct: 65 },
  { stage: 'POs ISSUED', count: 14, pct: 61 },
  { stage: 'INVOICES DONE', count: 11, pct: 48 },
];

export default function Reports() {
  const [savingsTotal, setSavingsTotal] = useState(0);

  useEffect(() => {
    // Count up from 0 to 823450
    let start = 0;
    const end = 823450;
    const duration = 2000;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setSavingsTotal(end);
        clearInterval(timer);
      } else {
        setSavingsTotal(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, []);

  const handleExport = () => {
    toast.success('All reports exported to CSV and Excel!');
  };

  const getHeatmapColor = (val) => {
    if (val === 0) return 'bg-[#111318] border border-white/5';
    if (val < 50) return 'bg-vendora-amber/10 text-vendora-amber/60 border border-white/5';
    if (val < 150) return 'bg-vendora-amber/30 text-vendora-amber/80 border border-white/5';
    if (val < 300) return 'bg-vendora-amber/60 text-black border border-white/5';
    return 'bg-vendora-amber text-black border border-white/5';
  };

  return (
    <div className="min-h-screen flex bg-vendora-bg text-vendora-text">
      <Sidebar />

      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-10 pb-4 border-b border-white/5">
            <div>
              <h1 className="text-4xl font-display tracking-wide uppercase">REPORTS & ANALYTICS</h1>
              <p className="text-vendora-muted font-body">Deep financial transparency and vendor scorecards</p>
            </div>
            <button 
              onClick={handleExport}
              className="btn-primary flex items-center gap-2"
            >
              <Download className="w-5 h-5 text-black" />
              EXPORT ALL REPORTS →
            </button>
          </div>

          {/* Section 1 - Savings Spotlight */}
          <div className="card-vendora mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-vendora-amber/5 rounded-full filter blur-3xl pointer-events-none"></div>
            
            <div className="grid grid-cols-3 gap-8 items-center">
              <div className="col-span-1 border-r border-white/5 pr-8">
                <p className="text-xs text-vendora-muted uppercase tracking-widest font-bold mb-3 font-body">
                  SAVINGS SPOTLIGHT
                </p>
                <h2 className="text-base font-body text-vendora-muted mb-2 uppercase leading-snug">
                  VENDORA HAS SAVED YOUR ORGANIZATION
                </h2>
                <div className="text-5xl font-mono text-vendora-amber font-bold mb-2 tracking-tight">
                  ₹{savingsTotal.toLocaleString('en-IN')}
                </div>
                <p className="text-sm text-vendora-success flex items-center gap-1.5 font-body">
                  <TrendingUp className="w-4 h-4" />
                  through competitive procurement
                </p>
              </div>

              {/* Monthly line chart */}
              <div className="col-span-2 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlySavingsData}>
                    <CartesianGrid stroke="rgba(255,255,255,0.02)" />
                    <XAxis dataKey="month" stroke="#4A5066" fontSize={11} />
                    <YAxis stroke="#4A5066" fontSize={11} tickFormatter={(val) => `₹${val/1000}k`} />
                    <Tooltip 
                      contentStyle={{ background: '#111318', border: '1px solid rgba(255,255,255,0.06)' }}
                      labelStyle={{ color: '#4A5066' }}
                    />
                    <Line type="monotone" dataKey="savings" stroke="#F0A500" strokeWidth={3} dot={{ fill: '#F0A500' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Section 2 - Monthly Spending Heatmap */}
          <div className="card-vendora mb-8">
            <h3 className="text-lg font-display uppercase tracking-widest text-vendora-amber mb-2">
              MONTHLY SPENDING HEATMAP
            </h3>
            <p className="text-xs text-vendora-muted mb-6 font-body uppercase">
              Seasonality in your procurement spending (values in ₹ Thousands)
            </p>

            <div className="overflow-x-auto">
              <div className="min-w-[800px] space-y-2">
                {/* Column Headers */}
                <div className="grid grid-cols-13 gap-2 text-center text-xs text-vendora-muted font-mono uppercase pb-2">
                  <div className="text-left font-body">Category</div>
                  {months.map(m => <div key={m}>{m}</div>)}
                </div>

                {/* Grid Rows */}
                {categories.map((cat) => (
                  <div key={cat} className="grid grid-cols-13 gap-2 items-center">
                    <div className="text-xs text-vendora-text font-body font-semibold pr-2 truncate">
                      {cat}
                    </div>
                    {heatmapData[cat].map((val, idx) => (
                      <div
                        key={idx}
                        className={`h-10 flex items-center justify-center font-mono text-xs font-bold rounded-vendora transition-all duration-200 hover:scale-105 ${getHeatmapColor(val)}`}
                        title={`${cat} Spend in ${months[idx]}: ₹${(val*1000).toLocaleString('en-IN')}`}
                      >
                        {val > 0 ? `${val}k` : '-'}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3 - Funnel & Leaderboards */}
          <div className="grid grid-cols-2 gap-8">
            {/* Procurement Funnel */}
            <div className="card-vendora flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-display uppercase tracking-widest text-vendora-amber mb-2">
                  PROCUREMENT FUNNEL
                </h3>
                <p className="text-xs text-vendora-muted mb-6 font-body uppercase">
                  RFQ transition efficiency & drop-off rates
                </p>

                <div className="space-y-4">
                  {funnelData.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-vendora-text">{item.stage}</span>
                        <span className="text-vendora-amber">{item.count} ({item.pct}%)</span>
                      </div>
                      <div className="h-4 bg-vendora-nested overflow-hidden rounded-vendora">
                        <motion.div 
                          className="h-full bg-vendora-amber"
                          initial={{ width: 0 }}
                          animate={{ width: `${item.pct}%` }}
                          transition={{ duration: 1.2, delay: idx * 0.1 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 bg-vendora-danger/10 border border-vendora-danger/25 p-4 rounded flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-vendora-danger animate-pulse flex-shrink-0 mt-0.5" />
                <p className="text-xs text-vendora-text font-body leading-relaxed">
                  <span className="font-bold uppercase text-vendora-danger">Funnel Insight:</span> Invoicing stage has the highest transaction drop-off (13%). Internal review delays at PO matching stage are likely bottlenecks.
                </p>
              </div>
            </div>

            {/* Leaderboards */}
            <div className="card-vendora">
              <h3 className="text-lg font-display uppercase tracking-widest text-vendora-amber mb-2">
                VENDOR LEADERBOARD
              </h3>
              <p className="text-xs text-vendora-muted mb-6 font-body uppercase">
                Ranked compliance scorecard comparison
              </p>

              <div className="space-y-6">
                <div>
                  <h4 className="text-xs text-vendora-success font-bold tracking-wider uppercase mb-3">
                    Top Performers (TOP 3)
                  </h4>
                  <div className="space-y-2">
                    {topVendors.map((v) => (
                      <div key={v.rank} className="bg-vendora-nested border border-white/5 p-3 rounded flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs text-vendora-muted bg-white/5 w-6 h-6 rounded-full flex items-center justify-center font-bold">
                            {v.rank}
                          </span>
                          <span className="text-sm font-body font-bold text-vendora-text">{v.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-sm text-vendora-success font-bold">{v.score}★</span>
                          <span className="text-[10px] text-vendora-muted block uppercase tracking-wider">{v.stat}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4">
                  <h4 className="text-xs text-vendora-danger font-bold tracking-wider uppercase mb-3">
                    Underperformers
                  </h4>
                  <div className="space-y-2">
                    {bottomVendors.map((v) => (
                      <div key={v.rank} className="bg-vendora-nested border border-white/5 p-3 rounded flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs text-vendora-muted bg-white/5 w-6 h-6 rounded-full flex items-center justify-center">
                            {v.rank}
                          </span>
                          <span className="text-sm font-body text-vendora-text">{v.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-sm text-vendora-danger font-bold">{v.score}★</span>
                          <span className="text-[10px] text-vendora-danger block uppercase font-bold tracking-wider">{v.stat}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
