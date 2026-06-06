import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AlertTriangle, Clock, CheckCircle, XCircle, TrendingUp, MessageSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../../components/shared/Sidebar';
import { useDataService } from '../../lib/supabase';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import toast from 'react-hot-toast';

const velocityData = [
  { day: 'Day 5', hours: 12 },
  { day: 'Day 10', hours: 18 },
  { day: 'Day 15', hours: 32 },
  { day: 'Day 20', hours: 22 },
  { day: 'Day 25', hours: 28 },
  { day: 'Day 30', hours: 31 },
];

const categoryData = [
  { name: 'Raw Materials', spend: 823000 },
  { name: 'Consumables', spend: 157100 },
  { name: 'Services', spend: 95000 },
];

const concentrationData = [
  { name: 'Mehta Ind.', pct: 65 },
  { name: 'Global Supplies', pct: 25 },
  { name: 'Sharma Traders', pct: 10 },
];

export default function ManagerDashboard() {
  const { user } = useAuth();
  const dataService = useDataService();

  const [approvals, setApprovals] = useState([]);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [remarksError, setRemarksError] = useState(false);
  const [showRejectField, setShowRejectField] = useState(false);

  // Hold-to-Approve States
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isWobbling, setIsWobbling] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  
  const holdIntervalRef = useRef(null);

  // Negotiation Modal States
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);

  // Load approvals from database
  const loadApprovals = async () => {
    const rfqs = await dataService.getRFQs();
    const pendingList = rfqs
      .filter((r) => r.status === 'APPROVAL')
      .map((r) => ({
        id: r.id,
        title: r.title,
        value: r.id === 2856 ? '₹8,23,000' : '₹1,12,100',
        numericValue: r.id === 2856 ? 823000 : 112100,
        requestedBy: r.id === 2856 ? 'Priya Verma' : 'Ramesh Shah',
        vendor: r.id === 2856 ? 'Mehta Industries' : 'Global Supplies',
        pendingTime: r.id === 2856 ? '1h' : '18h',
        highValue: r.id === 2856,
        rawRfq: r
      }));
    setApprovals(pendingList);
    if (pendingList.length > 0 && !selectedApproval) {
      setSelectedApproval(pendingList[0]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await loadApprovals();
  };

  // Hold-to-Approve mouse handlers
  const handleHoldStart = () => {
    if (isApproved) return;
    setIsHolding(true);
    setIsWobbling(false);
    
    const startTime = Date.now();
    holdIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / 1500) * 100, 100);
      setHoldProgress(progress);

      if (progress >= 100) {
        clearInterval(holdIntervalRef.current);
        triggerApprove();
      }
    }, 30);
  };

  const handleHoldEnd = () => {
    if (holdProgress < 100 && isHolding) {
      clearInterval(holdIntervalRef.current);
      setIsHolding(false);
      setHoldProgress(0);
      setIsWobbling(true); // wobble wobble
      toast.error('Release too early! Hold down to confirm.');
      setTimeout(() => setIsWobbling(false), 500);
    }
  };

  const triggerApprove = async () => {
    setIsApproved(true);
    setIsHolding(false);
    setHoldProgress(0);
    toast.success('✓ APPROVED — PO is being generated now');

    // Create PO in mock DB
    const selectedQuote = selectedApproval.id === 2856 
      ? { unitPrice: 823, vendorName: 'Mehta Industries' }
      : { unitPrice: 420, vendorName: 'Global Supplies' };

    await dataService.addPO({
      id: `PO-2025-${Math.floor(Math.random() * 9000) + 1000}`,
      rfqId: selectedApproval.id,
      vendorName: selectedQuote.vendorName,
      date: new Date().toLocaleDateString('en-IN'),
      status: 'SENT',
      total: selectedApproval.numericValue,
      gstBreakdown: { cgst: selectedApproval.numericValue * 0.09, sgst: selectedApproval.numericValue * 0.09, subtotal: selectedApproval.numericValue },
      deliveryAddress: 'Main Factory',
      specialInstructions: remarks
    });

    setTimeout(() => {
      setIsApproved(false);
      setSelectedApproval(null);
      loadApprovals();
    }, 1500);
  };

  const handleRejectClick = () => {
    if (!showRejectField) {
      setShowRejectField(true);
      return;
    }

    if (!remarks.trim()) {
      setRemarksError(true);
      toast.error('Remarks are required for rejections.');
      return;
    }

    triggerReject();
  };

  const triggerReject = async () => {
    toast.error('✗ RFQ REJECTED — Notification sent to Procurement Officer');
    // Reject RFQ state
    const allRfqs = await dataService.getRFQs();
    const idx = allRfqs.findIndex(r => r.id === selectedApproval.id);
    if (idx !== -1) {
      allRfqs[idx].status = 'COMPARING'; // rollback status
      localStorage.setItem('v_rfqs', JSON.stringify(allRfqs));
    }
    
    // Add rejection activity
    db.addActivity({
      text: `RFQ #${selectedApproval.id} rejected by Priya Mehta: "${remarks}"`,
      type: 'system'
    });

    setSelectedApproval(null);
    setShowRejectField(false);
    setRemarks('');
    setRemarksError(false);
    loadApprovals();
  };

  const handleViewThread = async () => {
    if (!selectedApproval) return;
    const chat = await dataService.getMessages(selectedApproval.id);
    setChatMessages(chat);
    setShowChatModal(true);
  };

  return (
    <div className="min-h-screen flex bg-vendora-bg text-vendora-text">
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="bg-vendora-surface border-b border-white/5">
          <div className="px-8 py-6">
            <h1 className="text-3xl font-display mb-1 uppercase tracking-wider">APPROVAL CENTER</h1>
            <p className="text-vendora-muted">Manager Dashboard — {user?.name}</p>
          </div>
        </div>

        {/* Urgency Banner */}
        {approvals.length > 0 && (
          <motion.div 
            className="bg-vendora-warning/10 border-b-2 border-vendora-warning cursor-pointer"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="px-8 py-4">
              <div className="flex items-center gap-4">
                <AlertTriangle className="w-6 h-6 text-vendora-warning animate-pulse" />
                <p className="text-vendora-text font-body">
                  <span className="font-bold">{approvals.length} APPROVALS WAITING</span> — 
                  Oldest is 18 hours. Review now →
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="px-8 py-8">
          <div className="grid grid-cols-3 gap-8">
            {/* Left Queue */}
            <div className="space-y-4">
              <h2 className="text-xl font-display mb-2 uppercase tracking-wider text-vendora-amber">APPROVAL QUEUE</h2>
              <div className="space-y-3">
                {approvals.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => {
                      setSelectedApproval(app);
                      setShowRejectField(false);
                      setRemarks('');
                      setRemarksError(false);
                    }}
                    className={`w-full text-left bg-vendora-surface hover:bg-vendora-hover border-l-4 rounded-vendora p-4 transition-colors border ${
                      selectedApproval?.id === app.id ? 'border-vendora-amber bg-vendora-amber/5' : 'border-white/5'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-mono text-vendora-amber">RFQ #{app.id}</span>
                      {app.highValue && (
                        <span className="badge-vendora bg-vendora-danger/25 text-vendora-danger text-[10px] font-bold border border-vendora-danger/20 animate-pulse">
                          HIGH VALUE
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-body font-bold text-vendora-text mb-1 truncate">{app.title}</h3>
                    <p className="text-lg font-mono text-vendora-amber mb-2">{app.value}</p>
                    <div className="flex items-center gap-2 text-xs text-vendora-muted">
                      <Clock className="w-3.5 h-3.5" />
                      {app.pendingTime} pending
                    </div>
                  </button>
                ))}
                {approvals.length === 0 && (
                  <div className="text-center py-12 text-vendora-muted italic card-vendora border-dashed border-white/10">
                    No pending approvals.
                  </div>
                )}
              </div>
            </div>

            {/* Middle & Right Detail Card */}
            <div className="col-span-2">
              {selectedApproval ? (
                <motion.div
                  className="card-vendora"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={selectedApproval.id}
                >
                  <div className="flex items-start justify-between mb-6 border-b border-white/5 pb-4">
                    <div>
                      <h2 className="text-2xl font-display uppercase tracking-wide">
                        RFQ #{selectedApproval.id} — {selectedApproval.title}
                      </h2>
                      <p className="text-vendora-muted font-body">250 units | Requested by: {selectedApproval.requestedBy}</p>
                    </div>
                    <button 
                      onClick={handleViewThread}
                      className="px-3 py-1.5 bg-vendora-nested hover:bg-vendora-hover border border-white/5 rounded text-xs text-vendora-amber font-body uppercase font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      View Chat Log
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Selected Vendor */}
                    <div>
                      <p className="text-xs text-vendora-muted uppercase tracking-widest font-bold mb-3">SELECTED VENDOR</p>
                      <div className="bg-vendora-nested rounded-vendora p-4 border border-white/5">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-body font-bold text-vendora-text mb-1">{selectedApproval.vendor}</h3>
                            <div className="flex items-center gap-2 text-vendora-amber">
                              <span className="text-sm">★</span>
                              <span className="text-sm font-mono text-vendora-muted">
                                {selectedApproval.id === 2856 ? '4.2' : '4.8'} / 5.0
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-mono text-vendora-amber font-bold">{selectedApproval.value}</p>
                            <p className="text-sm text-vendora-muted">9 days delivery</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Low Quote comparison */}
                    <div>
                      <p className="text-xs text-vendora-muted uppercase tracking-widest font-bold mb-3">VS LOWEST QUOTE</p>
                      <div className="bg-vendora-nested rounded-vendora p-4 border border-white/5">
                        {selectedApproval.id === 2856 ? (
                          <p className="text-sm text-vendora-success font-body">✦ Lowest quote selected</p>
                        ) : (
                          <>
                            <p className="text-sm text-vendora-muted mb-1 font-body">Sharma Traders: ₹95,000</p>
                            <p className="text-lg text-vendora-warning font-body font-bold">PRICE PREMIUM: +₹17,100 (+18%)</p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Officer notes */}
                    <div>
                      <p className="text-xs text-vendora-muted uppercase tracking-widest font-bold mb-3">OFFICER DECISION RATIONALE</p>
                      <div className="bg-vendora-nested rounded-vendora p-4 border border-white/5">
                        <p className="text-sm text-vendora-text italic font-body leading-relaxed">
                          {selectedApproval.id === 2856 
                            ? '"Mehta Industries is our tier 1 raw materials vendor. Excellent track record and ready to dispatch."'
                            : '"Global Supplies has never missed a deadline. Sharma caused a 2-week factory delay last quarter."'}
                        </p>
                      </div>
                    </div>

                    {/* Rejection remarks field */}
                    {showRejectField && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-2"
                      >
                        <label className="block text-xs text-vendora-muted uppercase tracking-widest font-bold">
                          REJECTION REMARKS (REQUIRED)
                        </label>
                        <textarea
                          placeholder="Detail reasons for rejection..."
                          value={remarks}
                          onChange={(e) => {
                            setRemarks(e.target.value);
                            setRemarksError(false);
                          }}
                          className={`input-vendora w-full h-24 resize-none ${remarksError ? 'border-vendora-danger bg-vendora-danger/5' : ''}`}
                        />
                      </motion.div>
                    )}

                    {/* Action Panel */}
                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
                      <button 
                        onClick={handleRejectClick}
                        className="btn-ghost flex items-center justify-center gap-2 py-4 text-vendora-danger border-vendora-danger hover:bg-vendora-danger hover:text-white"
                      >
                        <XCircle className="w-5 h-5" />
                        {showRejectField ? 'CONFIRM REJECT' : 'REJECT'}
                      </button>

                      {/* Hold to Approve Button */}
                      <button
                        onMouseDown={handleHoldStart}
                        onMouseUp={handleHoldEnd}
                        onMouseLeave={handleHoldEnd}
                        onTouchStart={handleHoldStart}
                        onTouchEnd={handleHoldEnd}
                        className={`relative btn-primary py-4 select-none overflow-hidden flex items-center justify-center gap-2 ${
                          isWobbling ? 'animate-shake' : ''
                        } ${isApproved ? 'bg-vendora-success text-white' : ''}`}
                      >
                        {/* Progress backdrop fill */}
                        <div 
                          className="absolute left-0 top-0 h-full bg-vendora-amber/40 transition-all pointer-events-none"
                          style={{ width: `${holdProgress}%` }}
                        />
                        {isApproved ? (
                          <>
                            <CheckCircle className="w-5 h-5 text-white" />
                            APPROVED
                          </>
                        ) : isHolding ? (
                          <>
                            <span className="font-mono">{Math.round(holdProgress)}%</span>
                            HOLD TO CONFIRM...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-5 h-5 text-black" />
                            {selectedApproval.numericValue > 100000 ? 'HOLD TO APPROVE' : 'APPROVE'}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="card-vendora flex flex-col items-center justify-center py-20 text-center">
                  <CheckCircle className="w-16 h-16 text-vendora-muted mb-4" />
                  <h3 className="text-2xl font-display text-vendora-text mb-2 uppercase">Queue Cleared</h3>
                  <p className="text-sm text-vendora-muted font-body">No pending approval tickets remaining.</p>
                </div>
              )}

              {/* Manager Recharts analytics */}
              <div className="grid grid-cols-3 gap-6 mt-8">
                <div className="card-vendora">
                  <h4 className="text-xs text-vendora-muted uppercase tracking-widest font-bold mb-4">
                    APPROVAL VELOCITY (LAST 30D)
                  </h4>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={velocityData}>
                        <XAxis dataKey="day" hide />
                        <YAxis hide domain={[0, 40]} />
                        <Tooltip 
                          contentStyle={{ background: '#111318', border: '1px solid rgba(255,255,255,0.06)' }}
                          labelStyle={{ color: '#4A5066' }}
                        />
                        <Line type="monotone" dataKey="hours" stroke="#F0A500" strokeWidth={3} dot={{ fill: '#F0A500' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2 text-center text-xs text-vendora-muted">
                    Avg approval rate: <span className="text-vendora-amber font-mono">31h</span>
                  </div>
                </div>

                <div className="card-vendora">
                  <h4 className="text-xs text-vendora-muted uppercase tracking-widest font-bold mb-4">
                    SPEND BY CATEGORY
                  </h4>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryData} layout="vertical">
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={80} stroke="#4A5066" fontSize={10} />
                        <Tooltip
                          contentStyle={{ background: '#111318', border: '1px solid rgba(255,255,255,0.06)' }}
                        />
                        <Bar dataKey="spend" fill="#F0A500" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="card-vendora">
                  <h4 className="text-xs text-vendora-muted uppercase tracking-widest font-bold mb-4">
                    VENDOR SPEND CONCENTRATION
                  </h4>
                  <div className="space-y-3 pt-2">
                    {concentrationData.map((item, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-vendora-text">{item.name}</span>
                          <span className="font-mono text-vendora-amber">{item.pct}%</span>
                        </div>
                        <div className="h-2 bg-vendora-nested rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${item.pct > 50 ? 'bg-vendora-danger' : 'bg-vendora-amber'}`}
                            style={{ width: `${item.pct}%` }}
                          />
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

      {/* Read Only Chat Modal */}
      {showChatModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <motion.div 
            className="bg-vendora-surface border border-white/10 rounded-vendora w-full max-w-2xl max-h-[80vh] flex flex-col justify-between"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-vendora-nested">
              <div>
                <h3 className="text-xl font-display uppercase tracking-wider text-vendora-amber">
                  NEGOTIATION LOG
                </h3>
                <p className="text-xs text-vendora-muted">RFQ #{selectedApproval?.id} · Read-only access</p>
              </div>
              <button 
                onClick={() => setShowChatModal(false)}
                className="p-1 rounded bg-vendora-surface hover:bg-white/5 text-vendora-muted hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-4 max-h-[50vh]">
              {chatMessages.map((m) => {
                if (m.senderRole === 'system') {
                  return (
                    <div key={m.id} className="flex justify-center">
                      <span className="text-[10px] bg-white/5 px-3 py-1 rounded text-vendora-muted">
                        {m.content}
                      </span>
                    </div>
                  );
                }

                return (
                  <div key={m.id} className="border-b border-white/5 pb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-vendora-text">{m.senderName}</span>
                      <span className="text-[9px] uppercase text-vendora-muted">({m.senderRole})</span>
                      <span className="text-[10px] text-vendora-muted ml-auto font-mono">{m.timestamp || m.createdDate}</span>
                    </div>
                    <p className="text-sm font-body text-vendora-text leading-snug">{m.content}</p>
                  </div>
                );
              })}
              {chatMessages.length === 0 && (
                <div className="text-center text-vendora-muted italic py-6">
                  No negotiation messages logged.
                </div>
              )}
            </div>

            <div className="p-4 bg-vendora-nested text-center text-xs text-vendora-muted border-t border-white/5">
              🔒 Audit log locked. Click close to return to the queue.
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
