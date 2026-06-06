import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Printer, FileText, Check, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/shared/Sidebar';
import toast from 'react-hot-toast';

const mockPO = {
  number: 'PO-2025-1203',
  date: new Date().toLocaleDateString('en-IN'),
  vendor: {
    name: 'Global Supplies Pvt. Ltd.',
    address: '123 Industrial Area, Mumbai',
    gstin: '27YYYYY1234Z1Z5',
    contact: '+91 98765 43210'
  },
  rfq: 'RFQ-2847',
  items: [
    { name: 'Industrial Bearings', specification: 'SKF 6205-2RS', qty: 250, unit: 'Nos', rate: 420, amount: 105000 }
  ],
  subtotal: 105000,
  cgst: 9450,
  sgst: 9450,
  total: 123900,
  paymentTerms: '45 days NET',
  expectedDelivery: '9 days from PO date'
};

const addresses = [
  { id: 1, label: 'Main Factory', address: 'ABC Manufacturing Co., Plot 45, MIDC, Pune - 411019' },
  { id: 2, label: 'Warehouse 1', address: 'ABC Warehouse, Sector 18, Navi Mumbai - 400705' },
  { id: 3, label: 'Branch Office', address: 'ABC Branch, IT Park, Bangalore - 560100' },
];

const statusSteps = ['DRAFT', 'SENT', 'ACKNOWLEDGED', 'FULFILLED'];

export default function PurchaseOrder() {
  const navigate = useNavigate();
  const [currentStatus, setCurrentStatus] = useState('SENT');
  const [deliveryAddress, setDeliveryAddress] = useState(addresses[0].id);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');

  const handleDownloadPDF = () => {
    toast.success('Downloading PO as PDF...');
    // PDF generation logic would go here
  };

  const handlePrint = () => {
    window.print();
    toast.success('Print dialog opened');
  };

  const handleGenerateInvoice = () => {
    toast.success('Navigating to Invoice Generation...');
    navigate('/officer/invoices/create');
  };

  const getStatusIndex = () => statusSteps.indexOf(currentStatus);

  return (
    <div className="min-h-screen flex bg-vendora-bg">
      <Sidebar />
      
      <div className="flex-1 flex">
        {/* Left Controls Panel */}
        <div className="w-96 bg-vendora-surface border-r border-white/5 p-6 overflow-y-auto custom-scrollbar">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-vendora-muted hover:text-vendora-amber transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <h2 className="text-2xl font-display mb-6 text-vendora-amber">PURCHASE ORDER</h2>

          {/* PO Number */}
          <div className="mb-6">
            <label className="block text-sm text-vendora-muted uppercase tracking-wider mb-2">
              PO Number
            </label>
            <div className="font-mono text-2xl text-vendora-amber">{mockPO.number}</div>
          </div>

          {/* Status Tracker */}
          <div className="mb-8">
            <label className="block text-sm text-vendora-muted uppercase tracking-wider mb-4">
              Status
            </label>
            <div className="space-y-2">
              {statusSteps.map((step, index) => {
                const currentIndex = getStatusIndex();
                const isCompleted = index < currentIndex;
                const isActive = index === currentIndex;
                const isFuture = index > currentIndex;

                return (
                  <div key={step} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      isCompleted ? 'bg-vendora-success border-vendora-success' :
                      isActive ? 'bg-vendora-amber border-vendora-amber animate-pulse' :
                      'bg-vendora-nested border-vendora-muted/30'
                    }`}>
                      {isCompleted ? (
                        <Check className="w-5 h-5 text-white" />
                      ) : (
                        <span className={`font-mono text-sm ${
                          isActive ? 'text-black' : 'text-vendora-muted'
                        }`}>{index + 1}</span>
                      )}
                    </div>
                    <span className={`font-body ${
                      isActive ? 'text-vendora-amber' :
                      isCompleted ? 'text-vendora-success' :
                      'text-vendora-muted'
                    }`}>{step}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="mb-6">
            <label className="block text-sm text-vendora-muted uppercase tracking-wider mb-3">
              Delivery Address
            </label>
            <select
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(parseInt(e.target.value))}
              className="input-vendora w-full"
            >
              {addresses.map((addr) => (
                <option key={addr.id} value={addr.id}>
                  {addr.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-vendora-muted mt-2">
              {addresses.find(a => a.id === deliveryAddress)?.address}
            </p>
          </div>

          {/* Expected Delivery Date */}
          <div className="mb-6">
            <label className="block text-sm text-vendora-muted uppercase tracking-wider mb-3">
              Expected Delivery Date
            </label>
            <input
              type="date"
              value={expectedDeliveryDate}
              onChange={(e) => setExpectedDeliveryDate(e.target.value)}
              className="input-vendora w-full"
              placeholder={mockPO.expectedDelivery}
            />
            <p className="text-xs text-vendora-muted mt-2">
              From vendor quote: {mockPO.expectedDelivery}
            </p>
          </div>

          {/* Special Instructions */}
          <div className="mb-8">
            <label className="block text-sm text-vendora-muted uppercase tracking-wider mb-3">
              Special Instructions
            </label>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              className="input-vendora w-full h-24 resize-none"
              placeholder="Any special delivery or handling instructions..."
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button 
              onClick={handleDownloadPDF}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              DOWNLOAD PDF
            </button>
            <button 
              onClick={handlePrint}
              className="btn-ghost w-full flex items-center justify-center gap-2"
            >
              <Printer className="w-5 h-5" />
              PRINT
            </button>
            <button 
              onClick={handleGenerateInvoice}
              className="btn-ghost w-full flex items-center justify-center gap-2"
            >
              <FileText className="w-5 h-5" />
              GENERATE INVOICE →
            </button>
          </div>
        </div>

        {/* Right Panel - Live PO Document */}
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-vendora-bg">
          <motion.div 
            className="max-w-4xl mx-auto bg-white text-black p-12 rounded shadow-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Header */}
            <div className="border-b-4 border-black pb-6 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-4xl font-bold mb-2">ABC MANUFACTURING CO.</h1>
                  <p className="text-sm">Plot 45, MIDC Industrial Area</p>
                  <p className="text-sm">Pune, Maharashtra - 411019</p>
                  <p className="text-sm">GSTIN: 27XXXXX1234Z1Z5</p>
                  <p className="text-sm">Phone: +91 98765 43210</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-800">PURCHASE ORDER</div>
                  <div className="text-xl font-mono mt-2">{mockPO.number}</div>
                  <div className="text-sm text-gray-600 mt-1">Date: {mockPO.date}</div>
                </div>
              </div>
            </div>

            {/* Vendor Details */}
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-3 text-gray-700">VENDOR DETAILS</h2>
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-bold text-lg mb-1">{mockPO.vendor.name}</h3>
                <p className="text-sm">{mockPO.vendor.address}</p>
                <p className="text-sm">GSTIN: {mockPO.vendor.gstin}</p>
                <p className="text-sm">Contact: {mockPO.vendor.contact}</p>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-3 text-gray-700">DELIVERY ADDRESS</h2>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm font-semibold">
                  {addresses.find(a => a.id === deliveryAddress)?.label}
                </p>
                <p className="text-sm">
                  {addresses.find(a => a.id === deliveryAddress)?.address}
                </p>
              </div>
            </div>

            {/* Line Items */}
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-3 text-gray-700">ORDER DETAILS</h2>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-800 text-white">
                    <th className="text-left p-3 border">Item Description</th>
                    <th className="text-left p-3 border">Specification</th>
                    <th className="text-right p-3 border">Qty</th>
                    <th className="text-right p-3 border">Rate</th>
                    <th className="text-right p-3 border">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {mockPO.items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-3 border">{item.name}</td>
                      <td className="p-3 border">{item.specification}</td>
                      <td className="text-right p-3 border">{item.qty} {item.unit}</td>
                      <td className="text-right p-3 border">₹{item.rate.toLocaleString()}</td>
                      <td className="text-right p-3 border">₹{item.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="mb-6">
              <div className="flex justify-end">
                <div className="w-80">
                  <div className="flex justify-between py-2 border-b">
                    <span>Subtotal:</span>
                    <span className="font-mono">₹{mockPO.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>CGST (9%):</span>
                    <span className="font-mono">₹{mockPO.cgst.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>SGST (9%):</span>
                    <span className="font-mono">₹{mockPO.sgst.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-3 border-t-2 border-black font-bold text-lg">
                    <span>TOTAL:</span>
                    <span className="font-mono">₹{mockPO.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-3 text-gray-700">TERMS & CONDITIONS</h2>
              <div className="bg-gray-50 p-4 rounded text-sm space-y-2">
                <p><strong>Payment Terms:</strong> {mockPO.paymentTerms}</p>
                <p><strong>Expected Delivery:</strong> {expectedDeliveryDate || mockPO.expectedDelivery}</p>
                <p><strong>Reference RFQ:</strong> {mockPO.rfq}</p>
                {specialInstructions && (
                  <p><strong>Special Instructions:</strong> {specialInstructions}</p>
                )}
                <p className="pt-2 border-t mt-4">
                  1. Goods must be delivered in good condition<br/>
                  2. Invoice must be submitted within 3 days of delivery<br/>
                  3. Any damages must be reported within 24 hours<br/>
                  4. Vendor must comply with all quality standards
                </p>
              </div>
            </div>

            {/* Signature */}
            <div className="mt-12 pt-6 border-t-2 border-gray-300">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-8">For ABC Manufacturing Co.</p>
                  <div className="border-t border-black w-48 pt-2">
                    <p className="text-sm font-semibold">Authorized Signatory</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    This is a computer-generated document<br/>
                    and does not require a physical signature.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
