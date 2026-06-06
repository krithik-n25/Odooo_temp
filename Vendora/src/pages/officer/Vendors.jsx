import { useState } from 'react';
import { Building2, Search, Star, ShieldAlert } from 'lucide-react';
import Sidebar from '../../components/shared/Sidebar';

const mockVendors = [
  { id: 1, name: 'Mehta Industries Pvt. Ltd.', category: 'RAW MATERIALS', rating: 4.2, avgResponse: '2h', trustScore: 87, orders: 12, disputes: 0, status: 'Active' },
  { id: 2, name: 'Sharma Traders', category: 'RAW MATERIALS', rating: 3.1, avgResponse: '8h', trustScore: 68, orders: 8, disputes: 1, status: 'Active' },
  { id: 3, name: 'Global Supplies Inc.', category: 'CONSUMABLES', rating: 4.8, avgResponse: '1h', trustScore: 95, orders: 28, disputes: 0, status: 'Active' },
  { id: 4, name: 'Tech Services Ltd', category: 'SERVICES', rating: 4.5, avgResponse: '3h', trustScore: 89, orders: 5, disputes: 0, status: 'Active' },
  { id: 5, name: 'Equipment Co', category: 'EQUIPMENT', rating: 4.0, avgResponse: '5h', trustScore: 82, orders: 9, disputes: 0, status: 'Active' },
];

export default function Vendors() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVendors = mockVendors.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex bg-vendora-bg text-vendora-text">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-display tracking-wide">VENDOR DIRECTORY</h1>
            <p className="text-vendora-muted font-body">Manage verified vendor profiles and compliance metrics</p>
          </div>

          {/* Search bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-vendora-muted w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search vendors by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-vendora w-full pl-12"
            />
          </div>

          {/* Vendors grid */}
          <div className="grid grid-cols-2 gap-6">
            {filteredVendors.map((vendor) => (
              <div key={vendor.id} className="card-vendora flex flex-col justify-between hover:border-vendora-amber/40 transition-colors">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-vendora-nested flex items-center justify-center border border-white/5">
                        <Building2 className="w-5 h-5 text-vendora-amber" />
                      </div>
                      <div>
                        <h3 className="font-body font-bold text-lg text-vendora-text">{vendor.name}</h3>
                        <span className="text-xs text-vendora-muted font-bold tracking-wider">{vendor.category}</span>
                      </div>
                    </div>
                    <span className="badge-vendora bg-vendora-success/15 text-vendora-success border border-vendora-success/20">
                      {vendor.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 py-4 border-y border-white/5 mb-4">
                    <div>
                      <span className="text-xs text-vendora-muted block mb-1">TRUST SCORE</span>
                      <span className="font-mono text-lg font-bold text-vendora-amber">{vendor.trustScore}/100</span>
                    </div>
                    <div>
                      <span className="text-xs text-vendora-muted block mb-1">AVG RESPONSE</span>
                      <span className="font-mono text-lg font-bold text-vendora-text">{vendor.avgResponse}</span>
                    </div>
                    <div>
                      <span className="text-xs text-vendora-muted block mb-1">ORDERS</span>
                      <span className="font-mono text-lg font-bold text-vendora-text">{vendor.orders}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="flex text-vendora-amber">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < Math.floor(vendor.rating) ? 'fill-current' : 'opacity-30'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-sm font-mono text-vendora-muted">{vendor.rating}</span>
                  </div>

                  {vendor.disputes > 0 && (
                    <span className="flex items-center gap-1 text-xs text-vendora-danger font-body uppercase font-bold">
                      <ShieldAlert className="w-4 h-4" />
                      {vendor.disputes} dispute unresolved
                    </span>
                  )}
                </div>
              </div>
            ))}
            {filteredVendors.length === 0 && (
              <div className="col-span-2 text-center py-12 text-vendora-muted italic">
                No vendors found matching the search criteria.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
