import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, Search, ChevronRight } from 'lucide-react';
import Sidebar from '../../components/shared/Sidebar';
import { useDataService } from '../../lib/supabase';

export default function Invitations() {
  const navigate = useNavigate();
  const dataService = useDataService();
  const [rfqs, setRfqs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchRFQs = async () => {
      const data = await dataService.getRFQs();
      // Only show open or response pending RFQs for this vendor
      setRfqs(data.filter(r => ['RFQ SENT', 'QUOTES IN'].includes(r.status)));
    };
    fetchRFQs();
  }, []);

  const filteredRfqs = rfqs.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex bg-vendora-bg text-vendora-text">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-display tracking-wide">OPEN BID INVITATIONS</h1>
            <p className="text-vendora-muted font-body">Submit pricing proposals for requested procurements</p>
          </div>

          {/* Search bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-vendora-muted w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search invitations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-vendora w-full pl-12"
            />
          </div>

          {/* List */}
          <div className="space-y-4">
            {filteredRfqs.map((rfq) => (
              <div key={rfq.id} className="card-vendora border-l-4 border-vendora-amber flex items-center justify-between hover:bg-vendora-hover/50 transition-colors">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-mono text-vendora-amber font-bold">RFQ #{rfq.id}</span>
                    <span className="text-xs font-mono uppercase bg-white/5 px-2 py-0.5 rounded text-vendora-muted">
                      {rfq.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-body font-bold text-vendora-text mb-1">{rfq.title}</h3>
                  <p className="text-sm text-vendora-muted">From: ABC Manufacturing Co.</p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="text-xs text-vendora-muted block uppercase tracking-wider mb-1">Deadline</span>
                    <span className="flex items-center gap-1.5 text-sm font-mono text-vendora-warning">
                      <Clock className="w-4 h-4" />
                      {rfq.deadline}
                    </span>
                  </div>

                  <button 
                    onClick={() => navigate(`/vendor/quote/${rfq.id}`)}
                    className="px-5 py-2.5 bg-vendora-amber text-black text-xs font-body font-bold uppercase rounded hover:brightness-110 tracking-wider transition-all"
                  >
                    SUBMIT QUOTE →
                  </button>
                </div>
              </div>
            ))}
            {filteredRfqs.length === 0 && (
              <div className="text-center py-12 text-vendora-muted italic card-vendora border-dashed border-white/10">
                No active invitations found matching your search.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
