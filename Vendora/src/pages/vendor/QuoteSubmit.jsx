import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/shared/Sidebar';
import toast from 'react-hot-toast';

const mockRFQ = {
  number: 'RFQ-2847',
  title: 'Industrial Bearings',
  from: 'ABC Manufacturing Co.',
  deadline: '3 days',
  items: [
    { id: 1, name: 'Industrial Bearings', specification: 'SKF 6205-2RS or equivalent', qty: 250, unit: 'Nos' }
  ]
};

const confidenceLevels = [
  { id: 'stretched', emoji: '😰', label: 'Stretched', description: 'Difficult to fulfill' },
  { id: 'fair', emoji: '😐', label: 'Fair', description: 'Can manage' },
  { id: 'comfortable', emoji: '😊', label: 'Comfortable', description: 'Good capacity' },
  { id: 'competitive', emoji: '🔥', label: 'Very Competitive', description: 'Excellent terms' },
];

export default function QuoteSubmit() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  
  // Form state
  const [quotes, setQuotes] = useState(
    mockRFQ.items.map(item => ({
      itemId: item.id,
      unitPrice: '',
      deliveryDays: '',
      availability: 'IN STOCK'
    }))
  );
  const [validUntil, setValidUntil] = useState('');
  const [gstRate, setGstRate] = useState('18');
  const [paymentTerms, setPaymentTerms] = useState('30');
  const [remarks, setRemarks] = useState('');
  const [confidence, setConfidence] = useState('');

  const updateQuote = (itemId, field, value) => {
    setQuotes(quotes.map(q => 
      q.itemId === itemId ? { ...q, [field]: value } : q
    ));
  };

  const calculateTotal = () => {
    const subtotal = quotes.reduce((sum, quote, index) => {
      const price = parseFloat(quote.unitPrice) || 0;
      return sum + (price * mockRFQ.items[index].qty);
    }, 0);
    
    const gst = subtotal * (parseFloat(gstRate) / 100);
    return { subtotal, gst, total: subtotal + gst };
  };

  const totals = calculateTotal();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!confidence) {
      toast.error('Please select your confidence level');
      return;
    }

    toast.success('Quote submitted successfully!');
    setSubmitted(true);
  };

  const handleSaveDraft = () => {
    toast.success('Quote saved as draft');
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex bg-vendora-bg">
        <Sidebar />
        
        <motion.div 
          className="flex-1 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-center max-w-2xl">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="w-24 h-24 rounded-full bg-vendora-success/10 border-2 border-vendora-success flex items-center justify-center mx-auto mb-8"
            >
              <Check className="w-12 h-12 text-vendora-success" />
            </motion.div>
            
            <h1 className="text-5xl font-display text-vendora-amber mb-6">QUOTE SUBMITTED</h1>
            <p className="text-2xl text-vendora-text mb-2">{mockRFQ.number} — ₹{Math.round(totals.total).toLocaleString()}</p>
            
            {/* Status Steps */}
            <div className="mt-12 mb-8">
              <div className="flex items-center justify-center gap-8">
                {['SUBMITTED', 'UNDER REVIEW', 'DECISION PENDING', 'RESULT'].map((step, index) => (
                  <div key={step} className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 mb-2 ${
                      index === 0 
                        ? 'bg-vendora-amber border-vendora-amber' 
                        : 'bg-vendora-nested border-vendora-muted/30'
                    }`}>
                      {index === 0 ? (
                        <Check className="w-6 h-6 text-black" />
                      ) : (
                        <span className="text-vendora-muted">{index + 1}</span>
                      )}
                    </div>
                    <span className={`text-sm font-body ${
                      index === 0 ? 'text-vendora-amber' : 'text-vendora-muted'
                    }`}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <p className="text-vendora-muted mb-8">
              You will be notified when the buyer reviews your quote.
            </p>
            
            <button 
              onClick={() => navigate('/vendor/dashboard')}
              className="btn-primary text-lg px-8 py-4"
            >
              BACK TO DASHBOARD
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-vendora-bg">
      <Sidebar />
      
      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-vendora-muted hover:text-vendora-amber transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Invitations
          </button>

          <h1 className="text-4xl font-display mb-2">SUBMIT QUOTE</h1>
          <p className="text-vendora-muted mb-8">RFQ {mockRFQ.number}</p>

          <form onSubmit={handleSubmit}>
            {/* RFQ Brief */}
            <div className="card-vendora mb-8">
              <h2 className="text-xl font-display mb-4 text-vendora-amber">RFQ DETAILS</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-vendora-muted">Title:</span>
                  <p className="text-vendora-text">{mockRFQ.title}</p>
                </div>
                <div>
                  <span className="text-vendora-muted">From:</span>
                  <p className="text-vendora-text">{mockRFQ.from}</p>
                </div>
                <div>
                  <span className="text-vendora-muted">Deadline:</span>
                  <p className="text-vendora-warning">{mockRFQ.deadline} remaining</p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-display mb-4 text-vendora-text">YOUR RESPONSE ↓</h2>
            </div>

            {/* Quote Form - Per Item */}
            {mockRFQ.items.map((item, index) => (
              <div key={item.id} className="card-vendora mb-6">
                <h3 className="text-lg font-body mb-4 text-vendora-text">
                  ITEM: {item.name} ({item.qty} {item.unit} requested)
                </h3>
                
                <div className="grid grid-cols-2 gap-6 mb-4">
                  <div>
                    <label className="block text-sm text-vendora-muted uppercase tracking-wider mb-2">
                      Your Unit Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-vendora-amber font-mono text-xl">₹</span>
                      <input
                        type="number"
                        value={quotes[index].unitPrice}
                        onChange={(e) => updateQuote(item.id, 'unitPrice', e.target.value)}
                        className="input-vendora w-full pl-10 text-xl font-mono"
                        placeholder="0"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-vendora-muted uppercase tracking-wider mb-2">
                      Your Total
                    </label>
                    <div className="text-3xl font-mono text-vendora-amber">
                      ₹{((parseFloat(quotes[index].unitPrice) || 0) * item.qty).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-vendora-muted uppercase tracking-wider mb-2">
                      Delivery Days
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={quotes[index].deliveryDays}
                        onChange={(e) => updateQuote(item.id, 'deliveryDays', e.target.value)}
                        className="input-vendora w-full"
                        placeholder="0"
                        min="1"
                        required
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-vendora-muted">
                        days from PO date
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-vendora-muted uppercase tracking-wider mb-2">
                      Availability
                    </label>
                    <select
                      value={quotes[index].availability}
                      onChange={(e) => updateQuote(item.id, 'availability', e.target.value)}
                      className="input-vendora w-full"
                    >
                      <option value="IN STOCK">IN STOCK</option>
                      <option value="MAKE TO ORDER">MAKE TO ORDER</option>
                      <option value="LIMITED STOCK">LIMITED STOCK</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-vendora-nested rounded">
                  <p className="text-xs text-vendora-muted">
                    Specification required: {item.specification}
                  </p>
                </div>
              </div>
            ))}

            {/* Global Fields */}
            <div className="card-vendora mb-6">
              <h3 className="text-lg font-display mb-4 text-vendora-amber">TERMS & CONDITIONS</h3>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm text-vendora-muted uppercase tracking-wider mb-2">
                    Valid Until
                  </label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="input-vendora w-full"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-vendora-muted uppercase tracking-wider mb-2">
                    GST Rate
                  </label>
                  <select
                    value={gstRate}
                    onChange={(e) => setGstRate(e.target.value)}
                    className="input-vendora w-full"
                  >
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                    <option value="28">28%</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm text-vendora-muted uppercase tracking-wider mb-2">
                  Payment Terms
                </label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="input-vendora w-full"
                >
                  <option value="15">15 days NET</option>
                  <option value="30">30 days NET</option>
                  <option value="45">45 days NET</option>
                  <option value="60">60 days NET</option>
                  <option value="advance">Advance Payment</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-vendora-muted uppercase tracking-wider mb-2">
                  Notes / Remarks
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="input-vendora w-full h-24 resize-none"
                  placeholder="Any additional information, warranties, or special terms..."
                />
              </div>
            </div>

            {/* Confidence Level */}
            <div className="card-vendora mb-6">
              <h3 className="text-lg font-display mb-4 text-vendora-amber">HOW CONFIDENT ARE YOU ABOUT THIS QUOTE?</h3>
              <div className="grid grid-cols-4 gap-4">
                {confidenceLevels.map((level) => (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() => setConfidence(level.id)}
                    className={`p-6 rounded border-2 text-center transition-all ${
                      confidence === level.id
                        ? 'border-vendora-amber bg-vendora-amber/10'
                        : 'border-white/10 bg-vendora-nested hover:border-vendora-amber/50'
                    }`}
                  >
                    <div className="text-4xl mb-2">{level.emoji}</div>
                    <div className="font-body text-vendora-text mb-1">{level.label}</div>
                    <div className="text-xs text-vendora-muted">{level.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Summary Card */}
            <motion.div 
              className="card-vendora bg-vendora-amber/5 border-2 border-vendora-amber/30 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-xl font-display mb-4 text-vendora-amber">YOUR QUOTE SUMMARY</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-vendora-text">
                  <span>Subtotal:</span>
                  <span className="font-mono text-xl">₹{Math.round(totals.subtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-vendora-text">
                  <span>GST ({gstRate}%):</span>
                  <span className="font-mono text-xl">₹{Math.round(totals.gst).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-vendora-amber border-t-2 border-vendora-amber/30 pt-3">
                  <span className="text-2xl font-display">TOTAL:</span>
                  <span className="font-mono text-3xl">₹{Math.round(totals.total).toLocaleString()}</span>
                </div>
                {quotes[0]?.deliveryDays && (
                  <div className="flex justify-between text-vendora-text text-sm pt-2 border-t border-white/10">
                    <span>Delivery:</span>
                    <span>{quotes[0].deliveryDays} days</span>
                  </div>
                )}
                {confidence && (
                  <div className="flex justify-between text-vendora-text text-sm">
                    <span>Confidence:</span>
                    <span className="flex items-center gap-2">
                      {confidenceLevels.find(l => l.id === confidence)?.emoji}
                      {confidenceLevels.find(l => l.id === confidence)?.label}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <button 
                type="button"
                onClick={handleSaveDraft}
                className="btn-ghost flex-1 py-4"
              >
                SAVE AS DRAFT
              </button>
              <button 
                type="submit"
                className="btn-primary flex-1 py-4 text-lg"
              >
                SUBMIT QUOTE →
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
