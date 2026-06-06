import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Search, Eye, CheckCircle2 } from 'lucide-react';
import Sidebar from '../../components/shared/Sidebar';
import StatusBadge from '../../components/shared/StatusBadge';
import { useDataService } from '../../lib/supabase';

export default function Quotes() {
  const navigate = useNavigate();
  const dataService = useDataService();
  const [quotes, setQuotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchQuotes = async () => {
      const data = await dataService.getQuotes();
      setQuotes(data);
    };
    fetchQuotes();
  }, []);

  const filteredQuotes = quotes.filter(q => 
    q.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.notes.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex bg-vendora-bg text-vendora-text">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-display tracking-wide">MY SUBMITTED QUOTES</h1>
            <p className="text-vendora-muted font-body">Track status, evaluation, and pricing proposals</p>
          </div>

          {/* Search bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-vendora-muted w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search quotes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-vendora w-full pl-12"
            />
          </div>

          {/* Table */}
          <div className="card-vendora p-0 overflow-hidden">
            <table className="table-vendora">
              <thead>
                <tr>
                  <th>RFQ ID</th>
                  <th>UnitPrice</th>
                  <th>Total Price</th>
                  <th>Delivery</th>
                  <th>Confidence</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuotes.map((quote) => (
                  <tr key={quote.id}>
                    <td className="font-mono text-vendora-amber">#{quote.rfqId}</td>
                    <td className="font-mono">₹{quote.unitPrice.toLocaleString('en-IN')}</td>
                    <td className="font-mono text-vendora-amber font-bold">₹{(quote.unitPrice * 250).toLocaleString('en-IN')}</td>
                    <td className="font-body text-sm">{quote.delivery} days</td>
                    <td>
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-white/5 rounded text-vendora-text">
                        {quote.confidence === 'competitive' ? '🔥' : quote.confidence === 'comfortable' ? '😊' : '😐'} {quote.confidence}
                      </span>
                    </td>
                    <td>
                      <StatusBadge 
                        status={quote.status === 'won' ? 'completed' : quote.status === 'lost' ? 'rejected' : 'pending'} 
                        label={quote.status} 
                      />
                    </td>
                  </tr>
                ))}
                {filteredQuotes.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-vendora-muted italic">
                      No quotes found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
