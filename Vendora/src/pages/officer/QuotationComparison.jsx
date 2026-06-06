import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingDown, Clock, Star, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/shared/Sidebar';
import toast from 'react-hot-toast';

const mockRFQ = {
  number: 'RFQ-2847',
  title: 'Industrial Bearings',
  quantity: 250,
  unit: 'units',
};

const mockQuotes = [
  {
    id: 1,
    vendor: 'Mehta Industries',
    rating: 4.2,
    unitPrice: 450,
    delivery: 12,
    gst: 18,
    paymentTerms: '30 days NET',
    pastOrders: 12,
    disputes: 0,
    responseTime: 2,
    notes: 'We can expedite delivery if needed. Premium quality bearings with 2-year warranty.'
  },
  {
    id: 2,
    vendor: 'Sharma Traders',
    rating: 3.1,
    unitPrice: 380,
    delivery: 15,
    gst: 18,
    paymentTerms: '15 days NET',
    pastOrders: 4,
    disputes: 1,
    responseTime: 8,
    notes: 'Standard quality. No rush orders possible.'
  },
  {
    id: 3,
    vendor: 'Global Supplies',
    rating: 4.8,
    unitPrice: 420,
    delivery: 9,
    gst: 18,
    paymentTerms: '45 days NET',
    pastOrders: 28,
    disputes: 0,
    responseTime: 1,
    notes: 'Premium supplier with excellent track record. Can provide samples before order.'
  },
];

export default function QuotationComparison() {
  const navigate = useNavigate();
  const [priceWeight, setPriceWeight] = useState(80);
  const [deliveryWeight, setDeliveryWeight] = useState(40);
  const [ratingWeight, setRatingWeight] = useState(60);
  const [expandedNotes, setExpandedNotes] = useState({});

  const calculateTotal = (quote) => {
    const subtotal = quote.unitPrice * mockRFQ.quantity;
    const gstAmount = subtotal * (quote.gst / 100);
    return subtotal + gstAmount;
  };

  const calculateCompositeScore = (quote) => {
    // Normalize values to 0-100 scale
    const prices = mockQuotes.map(q => q.unitPrice);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceScore = ((maxPrice - quote.unitPrice) / (maxPrice - minPrice)) * 100;

    const deliveries = mockQuotes.map(q => q.delivery);
    const minDelivery = Math.min(...deliveries);
    const maxDelivery = Math.max(...deliveries);
    const deliveryScore = ((maxDelivery - quote.delivery) / (maxDelivery - minDelivery)) * 100;

    const ratingScore = (quote.rating / 5) * 100;

    // Weighted average
    const totalWeight = priceWeight + deliveryWeight + ratingWeight;
    const score = (
      (priceScore * priceWeight) +
      (deliveryScore * deliveryWeight) +
      (ratingScore * ratingWeight)
    ) / totalWeight;

    return Math.round(score);
  };

  const getBestValue = (field) => {
    switch(field) {
      case 'price':
        return Math.min(...mockQuotes.map(q => q.unitPrice));
      case 'delivery':
        return Math.min(...mockQuotes.map(q => q.delivery));
      case 'rating':
        return Math.max(...mockQuotes.map(q => q.rating));
      case 'responseTime':
        return Math.min(...mockQuotes.map(q => q.responseTime));
      case 'disputes':
        return Math.min(...mockQuotes.map(q => q.disputes));
      case 'pastOrders':
        return Math.max(...mockQuotes.map(q => q.pastOrders));
      default:
        return null;
    }
  };

  const getBestTotal = () => {
    return Math.min(...mockQuotes.map(q => calculateTotal(q)));
  };

  const getRecommended = () => {
    const scores = mockQuotes.map(q => calculateCompositeScore(q));
    const maxScore = Math.max(...scores);
    return mockQuotes.find(q => calculateCompositeScore(q) === maxScore);
  };

  const recommendedVendor = getRecommended();

  const handleSelectVendor = (quote) => {
    toast.success(`Selected ${quote.vendor}!`);
    setTimeout(() => {
      navigate('/officer/purchase-orders');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex bg-vendora-bg">
      <Sidebar />
      
      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-vendora-muted hover:text-vendora-amber transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="mb-8">
            <h1 className="text-4xl font-display mb-2">COMPARING QUOTATIONS</h1>
            <p className="text-xl text-vendora-text">
              {mockRFQ.number}: {mockRFQ.title} ({mockRFQ.quantity} {mockRFQ.unit})
            </p>
            <p className="text-vendora-muted mt-2">
              {mockQuotes.length} QUOTES RECEIVED | DEADLINE PASSED | SELECT A VENDOR TO PROCEED
            </p>
          </div>

          {/* Comparison Table */}
          <div className="card-vendora mb-8 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-4 text-vendora-muted font-body uppercase text-sm"></th>
                  {mockQuotes.map((quote) => (
                    <th key={quote.id} className="py-4 px-6 text-center">
                      <div className="text-xl font-display text-vendora-text mb-2">{quote.vendor}</div>
                      {quote.id === recommendedVendor.id && (
                        <span className="inline-block px-3 py-1 bg-vendora-amber text-black text-xs font-body uppercase rounded">
                          RECOMMENDED
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-body">
                {/* Rating */}
                <tr className="border-b border-white/10 hover:bg-vendora-hover/30">
                  <td className="py-4 px-4 text-vendora-muted">Rating</td>
                  {mockQuotes.map((quote) => (
                    <td key={quote.id} className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-vendora-amber">{'★'.repeat(Math.floor(quote.rating))}</span>
                        <span className="font-mono text-vendora-text">{quote.rating}★</span>
                        {quote.rating === getBestValue('rating') && <span className="text-vendora-amber">✦</span>}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Unit Price */}
                <tr className="border-b border-white/10 hover:bg-vendora-hover/30">
                  <td className="py-4 px-4 text-vendora-muted">Unit Price</td>
                  {mockQuotes.map((quote) => (
                    <td key={quote.id} className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-mono text-vendora-text">₹{quote.unitPrice}</span>
                        {quote.unitPrice === getBestValue('price') && (
                          <span className="text-vendora-success flex items-center gap-1">
                            ✦ LOWEST
                          </span>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Delivery */}
                <tr className="border-b border-white/10 hover:bg-vendora-hover/30">
                  <td className="py-4 px-4 text-vendora-muted">Delivery</td>
                  {mockQuotes.map((quote) => (
                    <td key={quote.id} className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-vendora-text">{quote.delivery} days</span>
                        {quote.delivery === getBestValue('delivery') && (
                          <span className="text-vendora-success">✦ FASTEST</span>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* GST Rate */}
                <tr className="border-b border-white/10 hover:bg-vendora-hover/30">
                  <td className="py-4 px-4 text-vendora-muted">GST Rate</td>
                  {mockQuotes.map((quote) => (
                    <td key={quote.id} className="py-4 px-6 text-center text-vendora-text">
                      {quote.gst}%
                    </td>
                  ))}
                </tr>

                {/* Total Value */}
                <tr className="border-b border-white/10 hover:bg-vendora-hover/30 bg-vendora-nested">
                  <td className="py-4 px-4 text-vendora-muted font-semibold">Total Value</td>
                  {mockQuotes.map((quote) => {
                    const total = calculateTotal(quote);
                    return (
                      <td key={quote.id} className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="font-mono text-lg text-vendora-amber">
                            ₹{total.toLocaleString()}
                          </span>
                          {total === getBestTotal() && <span className="text-vendora-success">✦</span>}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Payment Terms */}
                <tr className="border-b border-white/10 hover:bg-vendora-hover/30">
                  <td className="py-4 px-4 text-vendora-muted">Payment Terms</td>
                  {mockQuotes.map((quote) => (
                    <td key={quote.id} className="py-4 px-6 text-center text-vendora-text">
                      {quote.paymentTerms}
                    </td>
                  ))}
                </tr>

                {/* Past Orders */}
                <tr className="border-b border-white/10 hover:bg-vendora-hover/30">
                  <td className="py-4 px-4 text-vendora-muted">Past Orders</td>
                  {mockQuotes.map((quote) => (
                    <td key={quote.id} className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-vendora-text">{quote.pastOrders}</span>
                        {quote.pastOrders === getBestValue('pastOrders') && <span className="text-vendora-amber">✦</span>}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Disputes */}
                <tr className="border-b border-white/10 hover:bg-vendora-hover/30">
                  <td className="py-4 px-4 text-vendora-muted">Disputes</td>
                  {mockQuotes.map((quote) => (
                    <td key={quote.id} className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className={quote.disputes === 0 ? 'text-vendora-success' : 'text-vendora-warning'}>
                          {quote.disputes}
                        </span>
                        {quote.disputes === getBestValue('disputes') && <span className="text-vendora-success">✦</span>}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Response Time */}
                <tr className="border-b-2 border-white/10 hover:bg-vendora-hover/30">
                  <td className="py-4 px-4 text-vendora-muted">Response Time</td>
                  {mockQuotes.map((quote) => (
                    <td key={quote.id} className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-vendora-text">{quote.responseTime} hours</span>
                        {quote.responseTime === getBestValue('responseTime') && <span className="text-vendora-amber">✦</span>}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Composite Score */}
                <tr className="bg-vendora-amber/5">
                  <td className="py-4 px-4 text-vendora-amber font-semibold uppercase">Composite Score</td>
                  {mockQuotes.map((quote) => {
                    const score = calculateCompositeScore(quote);
                    return (
                      <td key={quote.id} className="py-4 px-6 text-center">
                        <span className="font-mono text-2xl text-vendora-amber">{score} / 100</span>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Decision Engine */}
          <div className="card-vendora mb-8">
            <h2 className="text-xl font-display mb-6 text-vendora-amber">DECISION ENGINE</h2>
            <p className="text-sm text-vendora-muted mb-6">Adjust weights to recalculate composite scores</p>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-vendora-text">PRICE WEIGHT</span>
                  <span className="font-mono text-vendora-amber">{priceWeight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={priceWeight}
                  onChange={(e) => setPriceWeight(parseInt(e.target.value))}
                  className="w-full slider"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-vendora-text">DELIVERY WEIGHT</span>
                  <span className="font-mono text-vendora-amber">{deliveryWeight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={deliveryWeight}
                  onChange={(e) => setDeliveryWeight(parseInt(e.target.value))}
                  className="w-full slider"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-vendora-text">RATING WEIGHT</span>
                  <span className="font-mono text-vendora-amber">{ratingWeight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={ratingWeight}
                  onChange={(e) => setRatingWeight(parseInt(e.target.value))}
                  className="w-full slider"
                />
              </div>
            </div>
          </div>

          {/* Vendor Notes */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {mockQuotes.map((quote) => (
              <div key={quote.id} className="card-vendora">
                <h3 className="font-display text-lg mb-3 text-vendora-text">{quote.vendor}</h3>
                <p className="text-sm text-vendora-muted mb-4">{quote.notes}</p>
                <button 
                  onClick={() => handleSelectVendor(quote)}
                  className={
                    quote.id === recommendedVendor.id
                      ? 'btn-primary w-full'
                      : 'btn-ghost w-full'
                  }
                >
                  {quote.id === recommendedVendor.id ? '✓ SELECT THIS VENDOR' : 'SELECT VENDOR'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider {
          appearance: none;
          height: 8px;
          background: #21242F;
          border-radius: 4px;
          outline: none;
        }
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #F0A500;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #F0A500;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}
