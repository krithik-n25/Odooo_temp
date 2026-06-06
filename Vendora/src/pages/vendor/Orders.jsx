import { useState, useEffect } from 'react';
import { ShoppingBag, Search, Calendar, ClipboardCheck } from 'lucide-react';
import Sidebar from '../../components/shared/Sidebar';
import StatusBadge from '../../components/shared/StatusBadge';
import { useDataService } from '../../lib/supabase';

export default function Orders() {
  const dataService = useDataService();
  const [pos, setPos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      const data = await dataService.getPOs();
      setPos(data);
    };
    fetchOrders();
  }, []);

  const filteredOrders = pos.filter(p => 
    p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.vendorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex bg-vendora-bg text-vendora-text">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-display tracking-wide">ACTIVE ORDERS & POS</h1>
            <p className="text-vendora-muted font-body">Manage order fulfillment, delivery statuses, and contract terms</p>
          </div>

          {/* Search bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-vendora-muted w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search orders by PO ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-vendora w-full pl-12"
            />
          </div>

          {/* Orders list */}
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="card-vendora border-l-4 border-vendora-success flex items-center justify-between hover:bg-vendora-hover/30 transition-colors">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-mono text-vendora-amber font-bold">{order.id}</span>
                    <span className="text-xs text-vendora-muted font-mono">RFQ #{order.rfqId}</span>
                  </div>
                  <h3 className="text-xl font-body font-bold text-vendora-text mb-1">Industrial Bearings Fulfillments</h3>
                  <p className="text-sm text-vendora-muted">Delivery: {order.deliveryAddress}</p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="text-xs text-vendora-muted block uppercase tracking-wider mb-1">Order Total</span>
                    <span className="font-mono text-lg font-bold text-vendora-amber">₹{order.total.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-xs text-vendora-muted block uppercase tracking-wider mb-1">Fulfillment</span>
                    <StatusBadge 
                      status={order.status === 'FULFILLED' ? 'approved' : 'pending'} 
                      label={order.status} 
                    />
                  </div>
                </div>
              </div>
            ))}
            {filteredOrders.length === 0 && (
              <div className="text-center py-12 text-vendora-muted italic card-vendora border-dashed border-white/10">
                No orders found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
