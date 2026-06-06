import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Search, Calendar, ChevronRight } from 'lucide-react';
import Sidebar from '../../components/shared/Sidebar';
import StatusBadge from '../../components/shared/StatusBadge';
import { useDataService } from '../../lib/supabase';

export default function RFQs() {
  const navigate = useNavigate();
  const dataService = useDataService();
  const [rfqs, setRfqs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchRFQs = async () => {
      const data = await dataService.getRFQs();
      setRfqs(data);
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
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-display tracking-wide">REQUESTS FOR QUOTATIONS (RFQS)</h1>
              <p className="text-vendora-muted font-body">Track, compare, and manage RFQs</p>
            </div>
            <button 
              onClick={() => navigate('/officer/rfq/create')}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              CREATE NEW RFQ
            </button>
          </div>

          {/* Search bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-vendora-muted w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by title or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-vendora w-full pl-12"
            />
          </div>

          {/* RFQ List Table */}
          <div className="card-vendora p-0 overflow-hidden">
            <table className="table-vendora">
              <thead>
                <tr>
                  <th>RFQ ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Created</th>
                  <th>Deadline</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRfqs.map((rfq) => (
                  <tr key={rfq.id}>
                    <td className="font-mono text-vendora-amber">#{rfq.id}</td>
                    <td className="font-body font-bold">{rfq.title}</td>
                    <td className="text-xs text-vendora-muted uppercase tracking-wider">{rfq.category}</td>
                    <td className="font-mono text-sm text-vendora-muted">{rfq.createdDate}</td>
                    <td className="font-mono text-sm text-vendora-warning">{rfq.deadline}</td>
                    <td>
                      <StatusBadge 
                        status={
                          rfq.status === 'RFQ SENT' || rfq.status === 'QUOTES IN' ? 'active' :
                          rfq.status === 'COMPARING' || rfq.status === 'APPROVAL' ? 'pending' :
                          rfq.status === 'PO ISSUED' ? 'approved' : 'completed'
                        } 
                        label={rfq.status} 
                      />
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        {rfq.status === 'COMPARING' && (
                          <button 
                            onClick={() => navigate(`/officer/compare/${rfq.id}`)}
                            className="px-3 py-1.5 bg-vendora-amber text-black text-xs font-body uppercase font-bold rounded hover:brightness-110"
                          >
                            Compare
                          </button>
                        )}
                        <button 
                          onClick={() => navigate('/officer/dashboard')}
                          className="p-1.5 bg-vendora-nested hover:bg-vendora-hover border border-white/5 rounded text-vendora-muted hover:text-vendora-text transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredRfqs.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-vendora-muted italic">
                      No RFQs found matching the search criteria.
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
