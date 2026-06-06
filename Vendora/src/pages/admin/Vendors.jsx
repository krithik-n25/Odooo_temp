import { useState } from 'react';
import { Building2, Search, Trash2, Ban, ShieldCheck, Star } from 'lucide-react';
import Sidebar from '../../components/shared/Sidebar';
import toast from 'react-hot-toast';

const INITIAL_VENDORS = [
  { id: 1, name: 'Mehta Industries Pvt. Ltd.', category: 'RAW MATERIALS', rating: 4.2, avgResponse: '2h', trustScore: 87, orders: 12, status: 'ACTIVE' },
  { id: 2, name: 'Sharma Traders', category: 'RAW MATERIALS', rating: 3.1, avgResponse: '8h', trustScore: 68, status: 'PENDING' },
  { id: 3, name: 'Global Supplies Inc.', category: 'CONSUMABLES', rating: 4.8, avgResponse: '1h', trustScore: 95, orders: 28, status: 'ACTIVE' },
  { id: 4, name: 'Tech Services Ltd', category: 'SERVICES', rating: 4.5, avgResponse: '3h', trustScore: 89, orders: 5, status: 'ACTIVE' },
  { id: 5, name: 'Equipment Co', category: 'EQUIPMENT', rating: 4.0, avgResponse: '5h', trustScore: 82, orders: 9, status: 'ACTIVE' },
  { id: 6, name: 'Standard Logistics', category: 'LOGISTICS', rating: 2.8, avgResponse: '12h', trustScore: 54, status: 'BLACKLISTED' },
];

export default function VendorManagement() {
  const [vendors, setVendors] = useState(INITIAL_VENDORS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const handleVerify = (id) => {
    setVendors(vendors.map(v => v.id === id ? { ...v, status: 'ACTIVE' } : v));
    toast.success('Vendor verified and activated!');
  };

  const handleBlacklist = (id) => {
    setVendors(vendors.map(v => v.id === id ? { ...v, status: 'BLACKLISTED', trustScore: 30 } : v));
    toast.error('Vendor blacklisted!');
  };

  const filteredVendors = vendors.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) || v.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || v.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen flex bg-vendora-bg text-vendora-text">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-display tracking-wide uppercase">VENDOR REGISTRY</h1>
            <p className="text-vendora-muted font-body">Verify registry applications and review compliance logs</p>
          </div>

          {/* Filter Chips & Search */}
          <div className="flex justify-between items-center mb-6 gap-4">
            <div className="flex gap-2">
              {['ALL', 'ACTIVE', 'PENDING', 'BLACKLISTED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded text-xs font-body uppercase font-bold border transition-all ${
                    filterStatus === status
                      ? 'bg-vendora-amber text-black border-vendora-amber'
                      : 'bg-vendora-nested text-vendora-text border-white/10 hover:border-white/20'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-vendora-muted w-4 h-4" />
              <input
                type="text"
                placeholder="Search registry..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-vendora w-full pl-10 text-sm py-2"
              />
            </div>
          </div>

          {/* Grid list */}
          <div className="grid grid-cols-2 gap-6">
            {filteredVendors.map((vendor) => (
              <div key={vendor.id} className="card-vendora flex flex-col justify-between hover:border-white/10 transition-colors">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-vendora-nested flex items-center justify-center border border-white/5">
                        <Building2 className="w-5 h-5 text-vendora-amber" />
                      </div>
                      <div>
                        <h3 className="font-body font-bold text-base text-vendora-text leading-tight">{vendor.name}</h3>
                        <span className="text-xs text-vendora-muted font-mono">{vendor.category}</span>
                      </div>
                    </div>
                    
                    <span className={`badge-vendora text-[10px] font-bold border ${
                      vendor.status === 'ACTIVE' ? 'bg-vendora-success/10 text-vendora-success border-vendora-success/20' :
                      vendor.status === 'PENDING' ? 'bg-vendora-warning/10 text-vendora-warning border-vendora-warning/20 animate-pulse' :
                      'bg-vendora-danger/10 text-vendora-danger border-vendora-danger/20'
                    }`}>
                      {vendor.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-y border-white/5 mb-4 text-xs font-mono">
                    <div>
                      <span className="text-vendora-muted block text-[10px] uppercase font-bold mb-0.5">Trust Score</span>
                      <span className="text-vendora-amber font-bold">{vendor.trustScore || '-'}/100</span>
                    </div>
                    <div>
                      <span className="text-vendora-muted block text-[10px] uppercase font-bold mb-0.5">Response Time</span>
                      <span className="text-vendora-text">{vendor.avgResponse || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-vendora-amber">★</span>
                      <span className="text-vendora-text font-bold">{vendor.rating || '0.0'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {vendor.status === 'PENDING' && (
                    <button 
                      onClick={() => handleVerify(vendor.id)}
                      className="btn-primary py-2 px-4 text-xs font-body uppercase flex-1 flex items-center justify-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      VERIFY AND APPROVE
                    </button>
                  )}
                  {vendor.status !== 'BLACKLISTED' && (
                    <button 
                      onClick={() => handleBlacklist(vendor.id)}
                      className="btn-ghost border-vendora-danger text-vendora-danger hover:bg-vendora-danger hover:text-white py-2 px-4 text-xs font-body uppercase flex-1 flex items-center justify-center gap-2"
                    >
                      <Ban className="w-4 h-4" />
                      BLACKLIST
                    </button>
                  )}
                  {vendor.status === 'BLACKLISTED' && (
                    <p className="text-xs font-body text-vendora-danger italic font-bold">
                      ⚠ Access Denied. Vendor has been banned.
                    </p>
                  )}
                </div>
              </div>
            ))}
            {filteredVendors.length === 0 && (
              <div className="col-span-2 text-center py-12 text-vendora-muted italic">
                No vendors found in registry.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
