import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, FileText, MessageSquare, Clock, TrendingUp, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import Sidebar from '../../components/shared/Sidebar';

const mockRFQs = [
  { id: 2847, title: 'Industrial Bearings — 250 units', company: 'ABC Manufacturing Co.', deadline: '3 DAYS LEFT', status: 'open' },
  { id: 2851, title: 'Safety Equipment — 50 units', company: 'XYZ Industries', deadline: '5 DAYS LEFT', status: 'open' },
  { id: 2843, title: 'Office Supplies — Bulk Order', company: 'ABC Manufacturing Co.', deadline: 'SUBMITTED', status: 'submitted' },
];

const mockHistory = [
  { rfq: '#2840', outcome: 'WON', value: '₹95,000', date: 'Oct 10, 2025' },
  { rfq: '#2835', outcome: 'LOST', value: '₹1,12,000', date: 'Oct 8, 2025' },
  { rfq: '#2831', outcome: 'PENDING', value: '₹45,000', date: 'Oct 7, 2025' },
];

export default function VendorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex bg-vendora-bg">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="bg-vendora-surface border-b border-white/5">
          <div className="px-8 py-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display mb-1">VENDORA</h1>
              <p className="text-vendora-muted">Welcome back, {user?.name}</p>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-vendora-amber" />
              <div>
                <p className="text-xs text-vendora-muted">TRUST SCORE</p>
                <p className="text-xl font-mono text-vendora-amber">87/100</p>
              </div>
            </div>
          </div>
        </div>
        <div className="px-8 py-8">
          <div className="grid grid-cols-3 gap-8">
          {/* Left Column - Open Invitations */}
          <div className="col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display">OPEN INVITATIONS</h2>
              <span className="badge-vendora bg-vendora-amber text-black">
                {mockRFQs.filter(r => r.status === 'open').length} ACTIVE
              </span>
            </div>

            <div className="space-y-4">
              {mockRFQs.map((rfq, index) => (
                <motion.div
                  key={rfq.id}
                  className={`
                    card-vendora border-l-4 
                    ${rfq.status === 'open' ? 'border-vendora-amber' : 
                      rfq.status === 'submitted' ? 'border-blue-500' : 'border-vendora-muted'}
                  `}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-mono text-vendora-amber">RFQ #{rfq.id}</span>
                        <span className={`
                          badge-vendora text-xs
                          ${rfq.deadline.includes('DAYS') ? 'bg-vendora-warning/20 text-vendora-warning' : 'bg-blue-500/20 text-blue-400'}
                        `}>
                          <Clock className="w-3 h-3" />
                          {rfq.deadline}
                        </span>
                      </div>
                      <h3 className="text-lg font-body text-vendora-text mb-1">{rfq.title}</h3>
                      <p className="text-sm text-vendora-muted">From: {rfq.company}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    {rfq.status === 'open' ? (
                      <>
                        <button className="btn-ghost flex-1">VIEW DETAILS</button>
                        <button 
                          onClick={() => navigate(`/vendor/quote/${rfq.id}`)}
                          className="btn-primary flex-1"
                        >
                          SUBMIT QUOTE →
                        </button>
                      </>
                    ) : (
                      <button className="btn-ghost w-full">VIEW SUBMITTED QUOTE</button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Column - Activity & History */}
          <div className="space-y-6">
            {/* Quote History */}
            <div>
              <h2 className="text-xl font-display mb-6">MY QUOTE HISTORY</h2>
              <div className="space-y-3">
                {mockHistory.map((item, index) => (
                  <motion.div
                    key={index}
                    className="bg-vendora-surface border border-white/5 rounded-vendora p-4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-mono text-vendora-text">{item.rfq}</span>
                      <span className={`
                        badge-vendora text-xs
                        ${item.outcome === 'WON' ? 'bg-vendora-success/20 text-vendora-success' : 
                          item.outcome === 'LOST' ? 'bg-vendora-danger/20 text-vendora-danger' : 
                          'bg-vendora-warning/20 text-vendora-warning'}
                      `}>
                        {item.outcome}
                      </span>
                    </div>
                    <p className="text-lg font-mono text-vendora-amber mb-1">{item.value}</p>
                    <p className="text-xs text-vendora-muted">{item.date}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Negotiation Threads */}
            <div>
              <h2 className="text-xl font-display mb-6">NEGOTIATION THREADS</h2>
              <div className="space-y-3">
                <motion.div
                  className="bg-vendora-surface border border-white/5 rounded-vendora p-4 cursor-pointer hover:border-vendora-amber/50 transition-colors"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-5 h-5 text-vendora-amber flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h4 className="text-sm font-body text-vendora-text mb-1">
                        RFQ #2847 — Industrial Bearings
                      </h4>
                      <p className="text-xs text-vendora-muted mb-2">
                        3 unread messages · Last: "Can you revise delivery?"
                      </p>
                      <button className="text-xs text-vendora-amber hover:underline">
                        OPEN THREAD →
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Performance Stats */}
            <motion.div
              className="bg-vendora-amber/5 border border-vendora-amber/20 rounded-vendora p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <h3 className="text-sm font-body text-vendora-muted uppercase tracking-wider mb-4">
                YOUR PERFORMANCE
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-vendora-text">Response Time</span>
                    <span className="font-mono text-vendora-amber">2h avg</span>
                  </div>
                  <div className="h-2 bg-vendora-nested rounded-full overflow-hidden">
                    <div className="h-full w-[90%] bg-vendora-amber"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-vendora-text">Win Rate</span>
                    <span className="font-mono text-vendora-success">45%</span>
                  </div>
                  <div className="h-2 bg-vendora-nested rounded-full overflow-hidden">
                    <div className="h-full w-[45%] bg-vendora-success"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-vendora-text">Orders This Month</span>
                    <span className="font-mono text-vendora-amber">12</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          </div>{/* end grid */}
        </div>
      </div>
    </div>
  );
}
