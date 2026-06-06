import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Plus,
  AlertTriangle,
  Clock,
  TrendingUp,
  Activity,
  Building2,
  FileText,
  ShoppingCart,
  Receipt,
  X,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../../components/shared/Sidebar';
import KPICard from '../../components/shared/KPICard';
import { useDataService } from '../../lib/supabase';

function PipelineCard({ item, onClick }) {
  // Urgency color border logic: normal (amber), overdue/urgent (red), complete (green)
  let borderClass = 'border-vendora-amber';
  const isUrgent = item.priority === 'URGENT' || (item.deadline && item.deadline.includes('h') && !item.deadline.includes('d'));
  const isComplete = item.status === 'PO ISSUED' || item.status === 'INVOICED' || item.urgency === 'complete';

  if (isUrgent) {
    borderClass = 'border-vendora-danger';
  } else if (isComplete) {
    borderClass = 'border-vendora-success';
  }

  const formattedValue = item.items && item.items[0]
    ? `₹${((item.items[0].targetPrice || 0) * (item.items[0].qty || 0)).toLocaleString('en-IN')}`
    : '₹0';
  
  return (
    <motion.div 
      onClick={() => onClick(item)}
      className={`bg-vendora-nested border-l-4 ${borderClass} p-4 rounded-vendora cursor-pointer hover:bg-vendora-hover transition-colors shadow-md`}
      whileHover={{ x: 4 }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <h4 className="text-sm font-body text-vendora-text mb-2 truncate">{item.title}</h4>
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg font-mono text-vendora-amber">
          {formattedValue}
        </span>
        <div className="flex items-center gap-1">
          <Building2 className="w-4 h-4 text-vendora-muted" />
          <span className="text-xs text-vendora-muted font-mono">{item.vendorsSelected?.length || 0}</span>
        </div>
      </div>
      <div className={`flex items-center gap-2 text-xs ${isUrgent ? 'text-vendora-warning font-semibold' : 'text-vendora-muted'}`}>
        <Clock className="w-3 h-3" />
        {item.deadline}
        {isUrgent && <span className="animate-pulse-dot w-2 h-2 rounded-full bg-vendora-warning inline-block"></span>}
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const dataService = useDataService();

  const [rfqs, setRfqs] = useState([]);
  const [pos, setPos] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [activities, setActivities] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);

  // Load database state
  const loadData = async () => {
    const fetchedRfqs = await dataService.getRFQs();
    const fetchedPos = await dataService.getPOs();
    const fetchedInvoices = await dataService.getInvoices();
    const fetchedActivities = await dataService.getActivities();
    
    console.log("DASHBOARD fetchedRfqs:", fetchedRfqs);
    
    setRfqs(fetchedRfqs);
    setPos(fetchedPos);
    setInvoices(fetchedInvoices);
    setActivities(fetchedActivities);
  };

  useEffect(() => {
    loadData();

    // Subscribe to realtime database updates
    const unsubscribeActivities = dataService.subscribeToActivities((newActivity) => {
      setActivities(prev => [newActivity, ...prev].slice(0, 20));
      loadData(); // reload full state
    });

    return () => {
      unsubscribeActivities();
    };
  }, []);

  // Compute KPI values dynamically
  const pendingApprovalsCount = rfqs.filter(r => r.status === 'APPROVAL').length;
  const activeRFQsCount = rfqs.filter(r => ['RFQ SENT', 'QUOTES IN', 'COMPARING'].includes(r.status)).length;
  const poTotalThisMonth = pos.reduce((sum, p) => sum + p.total, 0);
  const pendingInvoicesCount = invoices.filter(i => i.status === 'sent').length;

  const mockKPIs = [
    { label: 'PENDING APPROVALS', value: pendingApprovalsCount, subInfo: pendingApprovalsCount > 0 ? `⚠ ${rfqs.filter(r => r.status === 'APPROVAL' && r.priority === 'URGENT').length} urgent` : '0 urgent', urgent: pendingApprovalsCount > 0 },
    { label: 'ACTIVE RFQs', value: activeRFQsCount, subInfo: `${rfqs.filter(r => ['RFQ SENT', 'QUOTES IN'].includes(r.status)).length} in response`, urgent: false },
    { label: 'POs THIS MONTH', value: `₹${(poTotalThisMonth / 100000).toFixed(1)}L`, subInfo: '+12% MoM', trend: 'up' },
    { label: 'INVOICES PENDING', value: pendingInvoicesCount, subInfo: `₹${((invoices.reduce((s, i) => s + i.total, 0)) / 100000).toFixed(1)}L value`, urgent: false },
    { label: 'SAVINGS THIS MONTH', value: '₹2.3L', subInfo: 'vs last mo', trend: 'up' },
  ];

  // Pipeline Columns Mapping
  const pipelineStages = {
    'RFQ SENT': rfqs.filter(r => r.status === 'RFQ SENT'),
    'QUOTES IN': rfqs.filter(r => r.status === 'QUOTES IN'),
    'COMPARING': rfqs.filter(r => r.status === 'COMPARING'),
    'APPROVAL': rfqs.filter(r => r.status === 'APPROVAL'),
    'PO ISSUED': rfqs.filter(r => r.status === 'PO ISSUED'),
    'INVOICED': rfqs.filter(r => r.status === 'INVOICED'),
  };

  const handleCardClick = (card) => {
    setSelectedCard(card);
  };

  const closeSlideOver = () => {
    setSelectedCard(null);
  };

  return (
    <div className="min-h-screen flex bg-vendora-bg text-vendora-text">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Center Canvas */}
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-display mb-2 uppercase tracking-wide">PROCUREMENT COMMAND CENTER</h1>
            <p className="text-vendora-muted font-body">Welcome back, {user?.name}</p>
          </div>

          {/* KPI Strip */}
          <div className="grid grid-cols-5 gap-4 mb-8">
            {mockKPIs.map((kpi, index) => (
              <KPICard key={index} {...kpi} delay={index * 0.05} />
            ))}
          </div>

          {/* Procurement Pipeline */}
          <div className="mb-8">
            <h2 className="text-xl font-display mb-6 uppercase tracking-wider text-vendora-amber border-b border-white/5 pb-2">
              PROCUREMENT PIPELINE
            </h2>
            <div className="grid grid-cols-6 gap-4">
              {Object.entries(pipelineStages).map(([stage, items]) => (
                <div key={stage} className="bg-vendora-surface/20 p-2 rounded border border-white/5">
                  <h3 className="text-xs font-body text-vendora-muted uppercase tracking-widest mb-4 pb-2 border-b border-white/5 font-bold">
                    {stage}
                  </h3>
                  <div className="space-y-3">
                    {items.length > 0 ? (
                      items.map((item) => (
                        <PipelineCard key={item.id} item={item} onClick={handleCardClick} />
                      ))
                    ) : (
                      <div className="h-24 rounded-vendora border border-dashed border-white/10 flex items-center justify-center text-vendora-muted/40 text-xs font-body italic">
                        Empty
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-4">
            <button 
              onClick={() => navigate('/officer/rfq/create')}
              className="btn-primary flex items-center justify-center gap-2 py-6 text-base font-body tracking-wider"
            >
              <Plus className="w-5 h-5" />
              CREATE NEW RFQ
            </button>
            <button 
              onClick={() => navigate('/officer/purchase-orders')}
              className="btn-ghost py-6 text-base font-body tracking-wider"
            >
              VIEW ALL POs
            </button>
            <button 
              onClick={() => navigate('/officer/invoices/create')}
              className="btn-ghost py-6 text-base font-body tracking-wider"
            >
              GENERATE INVOICE
            </button>
          </div>
        </div>

        {/* Right Panel - Live Activity */}
        <div className="w-96 bg-vendora-surface border-l border-white/5 p-6 flex flex-col justify-between overflow-y-auto custom-scrollbar">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <h3 className="text-sm font-body text-vendora-text uppercase tracking-widest font-bold">LIVE OPERATIONS</h3>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-vendora-success animate-pulse-dot"></span>
              </div>
            </div>
            
            <div className="space-y-4 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
              <AnimatePresence>
                {activities.map((activity, index) => {
                  let Icon = FileText;
                  if (activity.type === 'quote') Icon = FileText;
                  if (activity.type === 'approval') Icon = ShoppingCart;
                  if (activity.type === 'invoice') Icon = Receipt;
                  if (activity.type === 'vendor') Icon = Building2;
                  
                  return (
                    <motion.div
                      key={activity.id}
                      className="flex gap-3 pb-4 border-b border-white/5"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="w-8 h-8 rounded-full bg-vendora-nested flex items-center justify-center flex-shrink-0 border border-white/5">
                        <Icon className="w-4 h-4 text-vendora-amber" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-vendora-text mb-1 leading-snug break-words">{activity.text}</p>
                        <span className="text-xs text-vendora-muted font-mono">{activity.time}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Savings Widget */}
          <div className="mt-8 p-6 rounded-vendora bg-vendora-amber/5 border border-vendora-amber/20 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-vendora-amber/5 rounded-full filter blur-xl pointer-events-none"></div>
            <p className="text-xs text-vendora-muted uppercase tracking-widest mb-2 font-body font-semibold">SAVINGS THIS YEAR</p>
            <h3 className="text-4xl font-mono text-vendora-amber mb-1 tracking-tight">₹8,23,450</h3>
            <p className="text-sm text-vendora-success flex items-center gap-1 font-body">
              <TrendingUp className="w-4 h-4" />
              +₹45,000 from last PO
            </p>
            <button 
              onClick={() => navigate('/admin/dashboard')}
              className="mt-6 w-full py-2 bg-vendora-nested hover:bg-vendora-hover border border-white/5 text-xs text-vendora-amber font-body uppercase tracking-wider rounded-vendora transition-all duration-200"
            >
              VIEW BREAKDOWN →
            </button>
          </div>
        </div>
      </div>

      {/* Card Detail Slide-Over */}
      <AnimatePresence>
        {selectedCard && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            {/* Backdrop */}
            <motion.div 
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSlideOver}
            />

            {/* Slide-over Content */}
            <motion.div 
              className="relative w-full max-w-lg bg-vendora-surface border-l border-white/10 h-full shadow-2xl p-8 flex flex-col justify-between overflow-y-auto custom-scrollbar"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div>
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono bg-vendora-amber/15 text-vendora-amber px-2.5 py-1 rounded">
                      RFQ #{selectedCard.id}
                    </span>
                    <span className="text-xs font-mono uppercase bg-white/5 px-2.5 py-1 rounded text-vendora-muted">
                      {selectedCard.status}
                    </span>
                  </div>
                  <button 
                    onClick={closeSlideOver}
                    className="p-1 rounded bg-vendora-nested hover:bg-vendora-hover text-vendora-muted hover:text-vendora-text transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <h2 className="text-3xl font-display mb-2 uppercase tracking-wide">{selectedCard.title}</h2>
                <p className="text-sm text-vendora-muted font-body mb-6">Category: {selectedCard.category} · Created: {selectedCard.createdDate}</p>

                <div className="space-y-6">
                  {/* Priority & Deadline */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-vendora-nested p-4 rounded border border-white/5">
                      <span className="text-xs text-vendora-muted uppercase tracking-wider block mb-1">Priority</span>
                      <span className={`text-sm font-body font-bold ${selectedCard.priority === 'URGENT' ? 'text-vendora-danger' : 'text-vendora-text'}`}>
                        {selectedCard.priority}
                      </span>
                    </div>
                    <div className="bg-vendora-nested p-4 rounded border border-white/5">
                      <span className="text-xs text-vendora-muted uppercase tracking-wider block mb-1">Time Remaining</span>
                      <span className="text-sm font-body text-vendora-amber font-mono font-bold">
                        {selectedCard.deadline}
                      </span>
                    </div>
                  </div>

                  {/* Line Items */}
                  <div>
                    <h3 className="text-xs text-vendora-muted uppercase tracking-widest font-bold mb-3">Line Items</h3>
                    <div className="space-y-3">
                      {selectedCard.items?.map((item, idx) => (
                        <div key={idx} className="bg-vendora-nested p-4 rounded border border-white/5">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-sm font-body font-bold text-vendora-text">{item.name}</h4>
                            <span className="font-mono text-sm text-vendora-amber">
                              Qty: {item.qty} {item.unit}
                            </span>
                          </div>
                          <p className="text-xs text-vendora-muted mb-2 font-body">Specs: {item.specification}</p>
                          <p className="text-xs font-mono text-vendora-muted">
                            Target Rate: <span className="text-vendora-text">₹{item.targetPrice?.toLocaleString('en-IN')}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Vendors Count */}
                  <div className="bg-vendora-nested p-4 rounded border border-white/5 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-body font-bold">Participating Vendors</h4>
                      <p className="text-xs text-vendora-muted mt-0.5">Invited from registry</p>
                    </div>
                    <span className="text-2xl font-mono text-vendora-amber font-bold">
                      {selectedCard.vendorsSelected?.length || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-8 border-t border-white/5 space-y-3">
                {selectedCard.status === 'COMPARING' && (
                  <button 
                    onClick={() => {
                      closeSlideOver();
                      navigate(`/officer/compare/${selectedCard.id}`);
                    }}
                    className="btn-primary w-full py-4 text-sm font-body uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    Compare Quotations
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
                {selectedCard.status === 'PO ISSUED' && (
                  <button 
                    onClick={() => {
                      closeSlideOver();
                      navigate(`/officer/purchase-orders`);
                    }}
                    className="btn-ghost w-full py-4 text-sm font-body uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    View Purchase Order
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
                {selectedCard.status === 'INVOICED' && (
                  <button 
                    onClick={() => {
                      closeSlideOver();
                      navigate(`/officer/invoices/create`);
                    }}
                    className="btn-ghost w-full py-4 text-sm font-body uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    View GST Invoice
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
                <button 
                  onClick={() => {
                    closeSlideOver();
                    navigate(`/officer/negotiations`);
                  }}
                  className="btn-ghost w-full py-4 text-sm font-body uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Negotiation Chat Thread
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
