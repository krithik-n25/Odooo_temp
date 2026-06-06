import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Clock, CheckCircle, XCircle, ChevronRight, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../../components/shared/Sidebar';
import StatusBadge from '../../components/shared/StatusBadge';
import { useDataService } from '../../lib/supabase';
import toast from 'react-hot-toast';

const mockApprovalHistory = [
  { id: 'APR-001', title: 'Office Supplies Q4', value: '₹35,400', requestedBy: 'Ramesh Shah', vendor: 'Global Supplies', date: 'Oct 10, 2025', decision: 'APPROVED', decisionTime: '2h 12m' },
  { id: 'APR-002', title: 'Safety Equipment Batch', value: '₹91,200', requestedBy: 'Priya Verma', vendor: 'Tech Services Ltd', date: 'Oct 5, 2025', decision: 'REJECTED', decisionTime: '45m' },
];

export default function Approvals() {
  const dataService = useDataService();
  const [approvals, setApprovals] = useState([]);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [showRejectField, setShowRejectField] = useState(false);
  const [filterStatus, setFilterStatus] = useState('PENDING');

  // Hold-to-Approve
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const holdIntervalRef = useRef(null);

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
        category: r.category,
        items: r.items,
        rawRfq: r
      }));
    setApprovals(pendingList);
    if (pendingList.length > 0 && !selectedApproval) {
      setSelectedApproval(pendingList[0]);
      setIsApproved(false);
      setHoldProgress(0);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, []);

  const handleSelectApproval = (item) => {
    setSelectedApproval(item);
    setIsApproved(false);
    setHoldProgress(0);
    setRemarks('');
    setShowRejectField(false);
  };

  const startHold = () => {
    if (isApproved) return;
    setIsHolding(true);
    holdIntervalRef.current = setInterval(() => {
      setHoldProgress(prev => {
        if (prev >= 100) {
          clearInterval(holdIntervalRef.current);
          setIsHolding(false);
          setIsApproved(true);
          handleApprove();
          return 100;
        }
        return prev + 3.3;
      });
    }, 50);
  };

  const stopHold = () => {
    clearInterval(holdIntervalRef.current);
    setIsHolding(false);
    if (holdProgress < 100) {
      setHoldProgress(0);
    }
  };

  const handleApprove = () => {
    if (!selectedApproval) return;
    toast.success(`RFQ #${selectedApproval.id} — APPROVED. PO generation initiated.`);
    setApprovals(prev => prev.filter(a => a.id !== selectedApproval.id));
    setSelectedApproval(null);
    setIsApproved(false);
    setHoldProgress(0);
  };

  const handleReject = () => {
    if (!remarks.trim()) {
      toast.error('Rejection reason is required.');
      return;
    }
    toast.error(`RFQ #${selectedApproval.id} — REJECTED. ${remarks}`);
    setApprovals(prev => prev.filter(a => a.id !== selectedApproval.id));
    setSelectedApproval(null);
    setRemarks('');
    setShowRejectField(false);
  };

  return (
    <div className="min-h-screen flex bg-vendora-bg text-vendora-text">
      <Sidebar />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel — Queue */}
        <div className="w-96 bg-vendora-surface border-r border-white/5 flex flex-col">
          <div className="p-6 border-b border-white/5">
            <h1 className="text-3xl font-display tracking-wide uppercase mb-1">Approval Queue</h1>
            <p className="text-xs text-vendora-muted font-body uppercase tracking-wider">
              {approvals.length} pending · {mockApprovalHistory.length} historical
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-white/5">
            {['PENDING', 'HISTORY'].map(tab => (
              <button
                key={tab}
                onClick={() => setFilterStatus(tab)}
                className={`flex-1 py-3 text-xs font-body font-bold uppercase tracking-wider transition-colors ${
                  filterStatus === tab
                    ? 'text-vendora-amber border-b-2 border-vendora-amber'
                    : 'text-vendora-muted hover:text-vendora-text'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
            {filterStatus === 'PENDING' ? (
              approvals.length > 0 ? approvals.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleSelectApproval(item)}
                  className={`w-full text-left p-4 rounded-vendora border transition-all ${
                    selectedApproval?.id === item.id
                      ? 'bg-vendora-amber/10 border-vendora-amber'
                      : 'bg-vendora-nested border-white/5 hover:border-vendora-amber/30'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono text-vendora-amber font-bold">RFQ #{item.id}</span>
                    {item.highValue && (
                      <span className="flex items-center gap-1 text-[10px] font-body font-bold text-vendora-danger uppercase px-2 py-0.5 bg-vendora-danger/10 border border-vendora-danger/25 rounded">
                        <AlertTriangle className="w-3 h-3" /> HIGH VALUE
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-body font-bold text-vendora-text mb-1 truncate">{item.title}</h4>
                  <p className="text-sm font-mono text-vendora-amber font-bold mb-2">{item.value}</p>
                  <div className="flex items-center gap-1 text-xs text-vendora-muted">
                    <Clock className="w-3 h-3" />
                    <span>Pending {item.pendingTime}</span>
                  </div>
                </button>
              )) : (
                <div className="text-center py-12">
                  <CheckCircle className="w-10 h-10 text-vendora-success mx-auto mb-3" />
                  <p className="text-sm font-body text-vendora-muted">All caught up!</p>
                  <p className="text-xs text-vendora-muted mt-1">No pending approvals</p>
                </div>
              )
            ) : (
              mockApprovalHistory.map(item => (
                <div key={item.id} className="p-4 rounded-vendora border border-white/5 bg-vendora-nested">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono text-vendora-muted">{item.id}</span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      item.decision === 'APPROVED' ? 'bg-vendora-success/10 text-vendora-success border border-vendora-success/20' : 'bg-vendora-danger/10 text-vendora-danger border border-vendora-danger/20'
                    }`}>{item.decision}</span>
                  </div>
                  <h4 className="text-sm font-body font-bold text-vendora-text mb-1">{item.title}</h4>
                  <p className="text-sm font-mono text-vendora-amber font-bold mb-1">{item.value}</p>
                  <p className="text-xs text-vendora-muted font-body">{item.date} · {item.decisionTime}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel — Approval Detail */}
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          {selectedApproval ? (
            <motion.div
              key={selectedApproval.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-3xl mx-auto"
            >
              {/* Alert Banner */}
              {selectedApproval.highValue && (
                <div className="mb-6 p-4 border border-vendora-danger/40 bg-vendora-danger/8 rounded-vendora flex items-center gap-4">
                  <AlertTriangle className="w-6 h-6 text-vendora-danger flex-shrink-0 animate-pulse" />
                  <div>
                    <p className="text-sm font-body font-bold text-vendora-danger uppercase tracking-wider">HIGH-VALUE PURCHASE — REVIEW REQUIRED</p>
                    <p className="text-xs text-vendora-text/70 font-body mt-0.5">This exceeds the ₹5,00,000 approval threshold.</p>
                  </div>
                </div>
              )}

              {/* RFQ Summary */}
              <div className="card-vendora mb-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-xs font-mono text-vendora-amber">RFQ #{selectedApproval.id}</span>
                    <h2 className="text-3xl font-display uppercase tracking-wide mt-1">{selectedApproval.title}</h2>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-vendora-muted uppercase tracking-wider mb-1">Total Value</p>
                    <p className="text-3xl font-mono font-bold text-vendora-amber">{selectedApproval.value}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 py-4 border-y border-white/5">
                  <div>
                    <p className="text-xs text-vendora-muted uppercase tracking-wider mb-1">Requested By</p>
                    <p className="font-body font-bold text-vendora-text">{selectedApproval.requestedBy}</p>
                  </div>
                  <div>
                    <p className="text-xs text-vendora-muted uppercase tracking-wider mb-1">Winning Vendor</p>
                    <p className="font-body font-bold text-vendora-text">{selectedApproval.vendor}</p>
                  </div>
                  <div>
                    <p className="text-xs text-vendora-muted uppercase tracking-wider mb-1">Category</p>
                    <p className="font-body font-bold text-vendora-text uppercase">{selectedApproval.category}</p>
                  </div>
                </div>

                {/* Item Breakdown */}
                {selectedApproval.items && (
                  <div className="mt-4">
                    <p className="text-xs text-vendora-muted uppercase tracking-wider mb-3">Line Items</p>
                    <div className="space-y-2">
                      {selectedApproval.items.map(item => (
                        <div key={item.id} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                          <div>
                            <p className="text-sm font-body font-bold text-vendora-text">{item.name}</p>
                            <p className="text-xs text-vendora-muted">{item.specification}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-mono text-vendora-text">{item.qty} {item.unit}</p>
                            <p className="text-xs font-mono text-vendora-amber">Target: ₹{item.targetPrice}/unit</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Decision Engine */}
              <div className="card-vendora">
                <h3 className="text-lg font-display uppercase tracking-widest text-vendora-amber mb-6">Decision Controls</h3>

                {!isApproved ? (
                  <>
                    {/* Hold to Approve Button */}
                    <div className="mb-6">
                      <p className="text-xs text-vendora-muted uppercase tracking-wider mb-3">Hold button to approve</p>
                      <button
                        onMouseDown={startHold}
                        onMouseUp={stopHold}
                        onMouseLeave={stopHold}
                        onTouchStart={startHold}
                        onTouchEnd={stopHold}
                        className="relative w-full h-16 bg-vendora-nested border border-vendora-success/30 rounded-vendora overflow-hidden cursor-pointer select-none transition-all hover:border-vendora-success/60"
                      >
                        <motion.div
                          className="absolute inset-0 bg-vendora-success/20 origin-left"
                          style={{ scaleX: holdProgress / 100 }}
                          animate={{ scaleX: holdProgress / 100 }}
                          transition={{ duration: 0 }}
                        />
                        <span className="relative z-10 flex items-center justify-center gap-2 h-full font-body font-bold text-vendora-success uppercase tracking-wider text-sm">
                          <CheckCircle className="w-5 h-5" />
                          {isHolding ? `Hold to confirm... ${Math.round(holdProgress)}%` : 'Hold to Approve'}
                        </span>
                      </button>
                    </div>

                    {/* Reject Section */}
                    <div>
                      {!showRejectField ? (
                        <button
                          onClick={() => setShowRejectField(true)}
                          className="w-full h-12 border border-vendora-danger/30 rounded-vendora text-vendora-danger font-body font-bold uppercase tracking-wider text-sm hover:bg-vendora-danger/5 transition-colors flex items-center justify-center gap-2"
                        >
                          <XCircle className="w-5 h-5" />
                          Reject with Reason
                        </button>
                      ) : (
                        <AnimatePresence>
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <textarea
                              value={remarks}
                              onChange={e => setRemarks(e.target.value)}
                              placeholder="Enter rejection reason (required)..."
                              rows={3}
                              className="w-full bg-vendora-nested border border-white/10 rounded-vendora p-4 text-sm font-body text-vendora-text outline-none focus:border-vendora-danger/50 resize-none mb-3"
                            />
                            <div className="flex gap-3">
                              <button
                                onClick={handleReject}
                                className="flex-1 py-3 bg-vendora-danger text-white font-body font-bold uppercase text-xs tracking-wider rounded-vendora hover:brightness-110 transition-all flex items-center justify-center gap-2"
                              >
                                <XCircle className="w-4 h-4" />
                                Confirm Rejection
                              </button>
                              <button
                                onClick={() => { setShowRejectField(false); setRemarks(''); }}
                                className="px-6 py-3 border border-white/10 text-vendora-muted font-body text-xs uppercase tracking-wider rounded-vendora hover:border-white/20 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </motion.div>
                        </AnimatePresence>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-vendora-success mx-auto mb-4" />
                    <h3 className="text-2xl font-display text-vendora-success uppercase mb-2">Approved!</h3>
                    <p className="text-sm text-vendora-muted font-body">PO generation has been initiated.</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex items-center justify-center text-center">
              <div>
                <CheckCircle className="w-16 h-16 text-vendora-success mx-auto mb-4 opacity-40" />
                <h3 className="text-2xl font-display text-vendora-text uppercase mb-2">Select an item</h3>
                <p className="text-sm text-vendora-muted font-body">Pick a pending approval from the queue</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
