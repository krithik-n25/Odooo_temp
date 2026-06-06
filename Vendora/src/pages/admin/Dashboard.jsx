import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, Building2, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import Sidebar from '../../components/shared/Sidebar';
import { useDataService } from '../../lib/supabase';

const mockSystemHealth = [
  { label: 'TOTAL USERS', value: 12 },
  { label: 'ACTIVE VENDORS', value: 34 },
  { label: 'RFQs THIS MONTH', value: 23 },
  { label: 'TOTAL SPEND', value: '₹1.2CR' },
  { label: 'SAVINGS TOTAL', value: '₹8.2L' },
];

const mockSubScores = [
  { label: 'RFQ COMPETITION RATE', value: 82, color: 'bg-vendora-amber' },
  { label: 'APPROVAL SPEED', value: 74, color: 'bg-vendora-warning' },
  { label: 'DELIVERY COMPLIANCE', value: 91, color: 'bg-vendora-success' },
  { label: 'VENDOR RESPONSIVENESS', value: 85, color: 'bg-vendora-amber' },
];

function CountUpNumber({ target, duration = 2000 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (typeof target === 'number') {
      let start = 0;
      const increment = target / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      
      return () => clearInterval(timer);
    }
  }, [target, duration]);

  return <span>{typeof target === 'number' ? count : target}</span>;
}

function HealthGauge({ score }) {
  const circumference = 2 * Math.PI * 120;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setTimeout(() => setProgress(score), 100);
  }, [score]);

  return (
    <div className="relative w-80 h-80 mx-auto">
      <svg className="w-full h-full transform -rotate-90">
        {/* Background circle */}
        <circle
          cx="160"
          cy="160"
          r="120"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="20"
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx="160"
          cy="160"
          r="120"
          stroke="#F0A500"
          strokeWidth="20"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (progress / 100) * circumference}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 2s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-sm text-vendora-muted uppercase tracking-wider mb-2">
          PROCUREMENT
        </p>
        <p className="text-sm text-vendora-muted uppercase tracking-wider mb-4">
          HEALTH SCORE
        </p>
        <p className="text-7xl font-display text-vendora-amber mb-2">
          <CountUpNumber target={score} />
        </p>
        <p className="text-xl font-body text-vendora-success uppercase tracking-wider">
          HEALTHY
        </p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const dataService = useDataService();
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchActivities = async () => {
      const data = await dataService.getActivities();
      setActivities(data.slice(0, 5)); // Show latest 5
    };
    fetchActivities();
  }, []);

  return (
    <div className="min-h-screen flex bg-vendora-bg">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="bg-vendora-surface border-b border-white/5">
          <div className="px-8 py-6">
            <h1 className="text-3xl font-display mb-1">SYSTEM ADMINISTRATION</h1>
            <p className="text-vendora-muted">Admin Dashboard — {user?.name}</p>
          </div>
        </div>

        <div className="px-8 py-8">
        {/* System Health Strip */}
        <div className="grid grid-cols-5 gap-4 mb-12">
          {mockSystemHealth.map((stat, index) => (
            <motion.div
              key={index}
              className="card-vendora text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <p className="text-xs text-vendora-muted uppercase tracking-wider mb-3">
                {stat.label}
              </p>
              <p className="text-3xl font-mono text-vendora-amber">
                <CountUpNumber target={stat.value} />
              </p>
            </motion.div>
          ))}
        </div>

        {/* Health Score Gauge */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <HealthGauge score={87} />
          
          {/* Sub-scores */}
          <div className="max-w-3xl mx-auto mt-12 space-y-4">
            {mockSubScores.map((subscore, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-vendora-text uppercase tracking-wider">
                    {subscore.label}
                  </span>
                  <span className="text-lg font-mono text-vendora-amber">
                    {subscore.value}%
                  </span>
                </div>
                <div className="h-3 bg-vendora-nested rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${subscore.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${subscore.value}%` }}
                    transition={{ duration: 1, delay: 0.8 + index * 0.1 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          <motion.p
            className="text-center text-vendora-text mt-8 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            "Your procurement is healthy. Approval speed needs attention."
          </motion.p>
        </motion.div>

        {/* Management Panels */}
        <div className="grid grid-cols-3 gap-6">
          {/* User Management */}
          <motion.div
            className="card-vendora"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-vendora-amber" />
              <h2 className="text-xl font-display">USER MANAGEMENT</h2>
            </div>
            <div className="space-y-3">
              {['Ramesh Shah', 'Priya Mehta', 'Suresh Admin'].map((name, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-white/5">
                  <div>
                    <p className="text-sm text-vendora-text">{name}</p>
                    <span className="text-xs text-vendora-muted uppercase">
                      {i === 0 ? 'Officer' : i === 1 ? 'Manager' : 'Admin'}
                    </span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-vendora-success"></span>
                </div>
              ))}
            </div>
            <button className="btn-ghost w-full mt-6">VIEW ALL USERS</button>
          </motion.div>

          {/* Vendor Registry */}
          <motion.div
            className="card-vendora"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="w-6 h-6 text-vendora-amber" />
              <h2 className="text-xl font-display">VENDOR REGISTRY</h2>
            </div>
            <div className="space-y-3">
              {['Mehta Industries', 'Sharma Traders', 'Global Supplies'].map((name, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-white/5">
                  <div>
                    <p className="text-sm text-vendora-text">{name}</p>
                    <span className="text-xs text-vendora-muted">
                      {[12, 8, 28][i]} orders
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1,2,3,4,5].map((star) => (
                        <span key={star} className="text-vendora-amber text-xs">★</span>
                      ))}
                    </div>
                    <span className="text-xs text-vendora-muted">
                      {[4.2, 3.1, 4.8][i]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn-ghost w-full mt-6">VIEW ALL VENDORS</button>
          </motion.div>

          {/* System Activity */}
          <motion.div
            className="card-vendora"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Activity className="w-6 h-6 text-vendora-amber" />
              <h2 className="text-xl font-display">SYSTEM AUDIT</h2>
            </div>
            <div className="space-y-3">
              {activities.length > 0 ? activities.map((activity, i) => (
                <div key={i} className="py-3 border-b border-white/5">
                  <p className="text-xs text-vendora-text mb-1">{activity.text || activity.description || 'System event logged'}</p>
                  <span className="text-xs text-vendora-muted">
                    {activity.timestamp || activity.createdDate || 'Just now'}
                  </span>
                </div>
              )) : (
                <div className="py-8 text-center text-vendora-muted italic">
                  No system audit logs available.
                </div>
              )}
            </div>
            <button className="btn-ghost w-full mt-6">VIEW FULL LOG</button>
          </motion.div>
        </div>

          {/* Reports Button */}
          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <button className="btn-primary w-full py-6 text-lg">
              VIEW REPORTS & ANALYTICS →
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
