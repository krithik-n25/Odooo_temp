import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Upload, X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/shared/Sidebar';
import toast from 'react-hot-toast';

const categories = [
  'RAW MATERIALS',
  'SERVICES',
  'EQUIPMENT',
  'CONSUMABLES',
  'OTHER'
];

const units = ['Nos', 'Kg', 'L', 'M', 'Sq.M', 'Cu.M', 'Box', 'Pack'];

const mockVendors = [
  { id: 1, name: 'Mehta Industries', category: 'RAW MATERIALS', rating: 4.2, avgResponse: '2h' },
  { id: 2, name: 'Sharma Traders', category: 'RAW MATERIALS', rating: 3.1, avgResponse: '8h' },
  { id: 3, name: 'Global Supplies', category: 'CONSUMABLES', rating: 4.8, avgResponse: '1h' },
  { id: 4, name: 'Tech Services Ltd', category: 'SERVICES', rating: 4.5, avgResponse: '3h' },
  { id: 5, name: 'Equipment Co', category: 'EQUIPMENT', rating: 4.0, avgResponse: '5h' },
];

export default function RFQCreate() {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [rfqNumber, setRfqNumber] = useState('');
  
  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('STANDARD');
  const [lineItems, setLineItems] = useState([
    { id: 1, name: '', specification: '', qty: 0, unit: 'Nos', targetPrice: '' }
  ]);
  const [deadline, setDeadline] = useState(7);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [attachments, setAttachments] = useState([]);

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { id: Date.now(), name: '', specification: '', qty: 0, unit: 'Nos', targetPrice: '' }
    ]);
  };

  const removeLineItem = (id) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const updateLineItem = (id, field, value) => {
    setLineItems(lineItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const toggleVendor = (vendorId) => {
    if (selectedVendors.includes(vendorId)) {
      setSelectedVendors(selectedVendors.filter(id => id !== vendorId));
    } else {
      setSelectedVendors([...selectedVendors, vendorId]);
    }
  };

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => {
      const price = parseFloat(item.targetPrice) || 0;
      return sum + (price * item.qty);
    }, 0);
  };

  const getDeadlineDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + deadline);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!title || !category || lineItems.length === 0 || selectedVendors.length === 0) {
      toast.error('Please fill all required fields');
      return;
    }

    const generatedRfqNumber = `RFQ-2025-${Math.floor(Math.random() * 9000) + 1000}`;
    setRfqNumber(generatedRfqNumber);
    setShowSuccess(true);
    
    toast.success('RFQ Created Successfully!');
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen flex bg-vendora-bg">
        <Sidebar />
        <motion.div 
          className="flex-1 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="w-24 h-24 rounded-full bg-vendora-success/10 border-2 border-vendora-success flex items-center justify-center mx-auto mb-8"
            >
              <Check className="w-12 h-12 text-vendora-success" />
            </motion.div>
            
            <h1 className="text-6xl font-display text-vendora-amber mb-4">{rfqNumber} SENT</h1>
            <p className="text-2xl text-vendora-text mb-2">TO {selectedVendors.length} VENDORS</p>
            <p className="text-xl text-vendora-muted mb-8">DEADLINE: {getDeadlineDate().toUpperCase()}</p>
            
            <button 
              onClick={() => navigate('/officer/dashboard')}
              className="btn-primary text-lg px-8 py-4"
            >
              BACK TO DASHBOARD →
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-vendora-bg">
      <Sidebar />
      
      <div className="flex-1 flex">
        {/* Left Panel - Form */}
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          <div className="max-w-4xl">
            <h1 className="text-4xl font-display mb-2">CREATE NEW RFQ</h1>
            <p className="text-vendora-muted mb-8">Request for Quotation</p>

            <form onSubmit={handleSubmit}>
              {/* Section 1 - RFQ Identity */}
              <div className="mb-8">
                <h2 className="text-xl font-display mb-4 text-vendora-amber">RFQ IDENTITY</h2>
                
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="WHAT ARE YOU PROCURING?"
                  className="input-vendora w-full mb-6 text-2xl"
                  required
                />

                <div className="mb-6">
                  <p className="text-sm text-vendora-muted uppercase tracking-wider mb-3">CATEGORY</p>
                  <div className="flex gap-3">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`px-4 py-2 rounded border transition-all ${
                          category === cat
                            ? 'bg-vendora-amber text-black border-vendora-amber'
                            : 'bg-vendora-nested text-vendora-text border-white/10 hover:border-vendora-amber/50'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-vendora-muted uppercase tracking-wider mb-3">PRIORITY</p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setPriority('STANDARD')}
                      className={`px-6 py-2 rounded border transition-all ${
                        priority === 'STANDARD'
                          ? 'bg-vendora-amber text-black border-vendora-amber'
                          : 'bg-vendora-nested text-vendora-text border-white/10'
                      }`}
                    >
                      STANDARD
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriority('URGENT')}
                      className={`px-6 py-2 rounded border transition-all ${
                        priority === 'URGENT'
                          ? 'bg-vendora-danger text-white border-vendora-danger'
                          : 'bg-vendora-nested text-vendora-text border-white/10'
                      }`}
                    >
                      URGENT
                    </button>
                  </div>
                </div>
              </div>

              {/* Section 2 - Line Items */}
              <div className="mb-8">
                <h2 className="text-xl font-display mb-4 text-vendora-amber">LINE ITEMS</h2>
                
                <div className="space-y-3">
                  {lineItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="grid grid-cols-12 gap-3 items-start bg-vendora-surface p-4 rounded"
                    >
                      <input
                        type="text"
                        placeholder="Item name"
                        value={item.name}
                        onChange={(e) => updateLineItem(item.id, 'name', e.target.value)}
                        className="col-span-3 input-vendora"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Specification"
                        value={item.specification}
                        onChange={(e) => updateLineItem(item.id, 'specification', e.target.value)}
                        className="col-span-3 input-vendora"
                      />
                      <input
                        type="number"
                        placeholder="0"
                        value={item.qty}
                        onChange={(e) => updateLineItem(item.id, 'qty', parseInt(e.target.value) || 0)}
                        className="col-span-2 input-vendora"
                        min="0"
                        required
                      />
                      <select
                        value={item.unit}
                        onChange={(e) => updateLineItem(item.id, 'unit', e.target.value)}
                        className="col-span-2 input-vendora"
                      >
                        {units.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                      <input
                        type="number"
                        placeholder="Target ₹"
                        value={item.targetPrice}
                        onChange={(e) => updateLineItem(item.id, 'targetPrice', e.target.value)}
                        className="col-span-2 input-vendora"
                        min="0"
                      />
                      {lineItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLineItem(item.id)}
                          className="text-vendora-danger hover:text-vendora-danger/70"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addLineItem}
                  className="mt-4 btn-ghost flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  ADD ITEM
                </button>

                {calculateTotal() > 0 && (
                  <div className="mt-4 text-right">
                    <span className="text-vendora-muted">Subtotal: </span>
                    <span className="text-2xl font-mono text-vendora-amber">₹{calculateTotal().toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Section 3 - Deadline */}
              <div className="mb-8">
                <h2 className="text-xl font-display mb-4 text-vendora-amber">DEADLINE</h2>
                
                <div className="mb-6">
                  <p className="text-3xl font-display text-vendora-text mb-4">
                    DEADLINE: {deadline} DAYS FROM TODAY — {getDeadlineDate()}
                  </p>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={deadline}
                    onChange={(e) => setDeadline(parseInt(e.target.value))}
                    className="w-full h-2 bg-vendora-nested rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-vendora-muted mt-2">
                    <span>Today</span>
                    <span>30 days</span>
                  </div>
                </div>

                {deadline < 3 && (
                  <p className="text-vendora-warning text-sm">⚠ Short deadline — vendors may not respond.</p>
                )}
              </div>

              {/* Section 4 - Vendor Selection */}
              <div className="mb-8">
                <h2 className="text-xl font-display mb-4 text-vendora-amber">SELECT VENDORS</h2>
                <p className="text-vendora-muted mb-4">{selectedVendors.length} VENDORS SELECTED</p>
                
                <div className="grid grid-cols-3 gap-4">
                  {mockVendors
                    .filter(v => !category || v.category === category || category === 'OTHER')
                    .map((vendor) => (
                      <motion.button
                        key={vendor.id}
                        type="button"
                        onClick={() => toggleVendor(vendor.id)}
                        className={`relative p-4 rounded border-2 text-left transition-all ${
                          selectedVendors.includes(vendor.id)
                            ? 'border-vendora-amber bg-vendora-amber/5'
                            : 'border-white/10 bg-vendora-surface hover:border-vendora-amber/50'
                        }`}
                        whileHover={{ scale: 1.02 }}
                      >
                        <h3 className="font-body text-vendora-text mb-1">{vendor.name}</h3>
                        <p className="text-xs text-vendora-muted mb-2">{vendor.category}</p>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-vendora-amber">{'★'.repeat(Math.floor(vendor.rating))}{'☆'.repeat(5-Math.floor(vendor.rating))}</span>
                          <span className="text-vendora-muted">{vendor.rating}</span>
                        </div>
                        <p className="text-xs text-vendora-muted mt-1">Avg response: {vendor.avgResponse}</p>
                        
                        {selectedVendors.includes(vendor.id) && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-vendora-amber flex items-center justify-center">
                            <Check className="w-4 h-4 text-black" />
                          </div>
                        )}
                      </motion.button>
                    ))}
                </div>
              </div>

              {/* Section 5 - Attachments */}
              <div className="mb-8">
                <h2 className="text-xl font-display mb-4 text-vendora-amber">ATTACHMENTS</h2>
                
                <div className="border-2 border-dashed border-vendora-muted/30 rounded p-8 text-center hover:border-vendora-amber/50 transition-colors cursor-pointer">
                  <Upload className="w-12 h-12 text-vendora-muted mx-auto mb-4" />
                  <p className="text-vendora-muted">Drag & drop files here or click to browse</p>
                  <p className="text-xs text-vendora-muted mt-2">PDF, DOC, XLS, Images supported</p>
                </div>
              </div>

              {/* Submit Button */}
              <button type="submit" className="btn-primary w-full py-4 text-lg">
                SEND RFQ TO VENDORS →
              </button>
            </form>
          </div>
        </div>

        {/* Right Panel - Live Preview */}
        <div className="w-1/2 bg-vendora-surface border-l border-white/5 p-8 overflow-y-auto custom-scrollbar">
          <h2 className="text-sm font-body text-vendora-muted uppercase tracking-wider mb-6">LIVE PREVIEW</h2>
          
          <div className="bg-white text-black p-8 rounded font-body">
            <div className="border-b-2 border-black pb-4 mb-6">
              <h1 className="text-3xl font-bold mb-2">YOUR COMPANY NAME</h1>
              <p className="text-sm">Address Line 1, City, State - PIN</p>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4">REQUEST FOR QUOTATION</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold">Title:</p>
                  <p>{title || '[Title]'}</p>
                </div>
                <div>
                  <p className="font-semibold">Category:</p>
                  <p>{category || '[Category]'}</p>
                </div>
                <div>
                  <p className="font-semibold">Priority:</p>
                  <p>{priority}</p>
                </div>
                <div>
                  <p className="font-semibold">Deadline:</p>
                  <p>{getDeadlineDate()}</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-3">Line Items:</h3>
              <table className="w-full text-sm">
                <thead className="border-b-2 border-black">
                  <tr>
                    <th className="text-left py-2">Item</th>
                    <th className="text-left py-2">Specification</th>
                    <th className="text-right py-2">Qty</th>
                    <th className="text-right py-2">Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item) => (
                    <tr key={item.id} className="border-b border-gray-300">
                      <td className="py-2">{item.name || '-'}</td>
                      <td className="py-2">{item.specification || '-'}</td>
                      <td className="text-right py-2">{item.qty}</td>
                      <td className="text-right py-2">{item.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Selected Vendors:</h3>
              <ul className="list-disc list-inside text-sm">
                {selectedVendors.length > 0 ? (
                  mockVendors
                    .filter(v => selectedVendors.includes(v.id))
                    .map(v => <li key={v.id}>{v.name}</li>)
                ) : (
                  <li className="text-gray-400">[No vendors selected]</li>
                )}
              </ul>
            </div>

            <div className="text-sm text-gray-600">
              <p>Please submit your quotation by {getDeadlineDate()}.</p>
              <p className="mt-2">For any queries, please contact: procurement@yourcompany.com</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
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
