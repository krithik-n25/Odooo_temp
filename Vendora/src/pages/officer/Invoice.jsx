import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Printer, Mail, Check, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/shared/Sidebar';
import toast from 'react-hot-toast';
import html2pdf from 'html2pdf.js';

const mockInvoice = {
  number: 'INV-2025-089',
  poNumber: 'PO-2025-1203',
  date: new Date().toLocaleDateString('en-IN'),
  vendor: {
    name: 'Global Supplies Pvt. Ltd.',
    address: '123 Industrial Area, Mumbai, Maharashtra - 400001',
    gstin: '27YYYYY1234Z1Z5',
    email: 'accounts@globalsupplies.com'
  },
  items: [
    { name: 'Industrial Bearings', specification: 'SKF 6205-2RS', qty: 250, unit: 'Nos', rate: 420, amount: 105000 }
  ],
  subtotal: 105000,
  freight: 0,
  handling: 0,
  taxType: 'CGST+SGST', // or 'IGST'
};

export default function Invoice() {
  const navigate = useNavigate();
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [taxType, setTaxType] = useState('CGST+SGST');
  const [freight, setFreight] = useState(0);
  const [handling, setHandling] = useState(0);
  const [notes, setNotes] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailTo, setEmailTo] = useState(mockInvoice.vendor.email);
  const [emailCc, setEmailCc] = useState('accounts@yourcompany.com');
  const [emailSubject, setEmailSubject] = useState('');

  const calculateTotals = () => {
    const subtotal = mockInvoice.subtotal + freight + handling;
    let tax1 = 0, tax2 = 0, tax1Label = '', tax2Label = '';

    if (taxType === 'CGST+SGST') {
      tax1 = subtotal * 0.09;
      tax2 = subtotal * 0.09;
      tax1Label = 'CGST (9%)';
      tax2Label = 'SGST (9%)';
    } else {
      tax1 = subtotal * 0.18;
      tax1Label = 'IGST (18%)';
    }

    const total = subtotal + tax1 + tax2;

    return { subtotal, tax1, tax2, tax1Label, tax2Label, total };
  };

  const totals = calculateTotals();

  useState(() => {
    setEmailSubject(`Invoice ${mockInvoice.number} — ₹${Math.round(totals.total).toLocaleString()}`);
    
    // Calculate due date (45 days from invoice date)
    const date = new Date(invoiceDate);
    date.setDate(date.getDate() + 45);
    setDueDate(date.toISOString().split('T')[0]);
  }, [invoiceDate]);

  const handleDownloadPDF = () => {
    const element = document.getElementById('invoice-document');
    if (!element) {
      toast.error('Invoice document not found');
      return;
    }
    
    toast.success('Generating PDF...');
    
    const opt = {
      margin: 10,
      filename: `${mockInvoice.number}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save().then(() => {
      toast.success('PDF Downloaded Successfully!');
    });
  };

  const handlePrint = () => {
    window.print();
    toast.success('Print dialog opened');
  };

  const handleSendEmail = () => {
    toast.success(`Invoice sent to ${emailTo}!`);
    setShowEmailModal(false);
    setTimeout(() => {
      navigate('/officer/dashboard');
    }, 1500);
  };

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

          <h2 className="text-2xl font-display mb-6 text-vendora-amber">INVOICE GENERATION</h2>

          {/* Invoice Number */}
          <div className="mb-6">
            <label className="block text-sm text-vendora-muted uppercase tracking-wider mb-2">
              Invoice Number
            </label>
            <div className="font-mono text-2xl text-vendora-amber">{mockInvoice.number}</div>
            <p className="text-xs text-vendora-muted mt-1">Auto-generated</p>
          </div>

          {/* Invoice Date */}
          <div className="mb-6">
            <label className="block text-sm text-vendora-muted uppercase tracking-wider mb-3">
              Invoice Date
            </label>
            <input
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              className="input-vendora w-full"
            />
          </div>

          {/* Due Date */}
          <div className="mb-6">
            <label className="block text-sm text-vendora-muted uppercase tracking-wider mb-3">
              Payment Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="input-vendora w-full"
            />
            <p className="text-xs text-vendora-muted mt-1">Based on 45 days NET payment terms</p>
          </div>

          {/* Tax Toggle */}
          <div className="mb-6">
            <label className="block text-sm text-vendora-muted uppercase tracking-wider mb-3">
              Tax Type
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setTaxType('CGST+SGST')}
                className={`flex-1 py-2 px-4 rounded border transition-all ${
                  taxType === 'CGST+SGST'
                    ? 'bg-vendora-amber text-black border-vendora-amber'
                    : 'bg-vendora-nested text-vendora-text border-white/10'
                }`}
              >
                CGST + SGST
              </button>
              <button
                onClick={() => setTaxType('IGST')}
                className={`flex-1 py-2 px-4 rounded border transition-all ${
                  taxType === 'IGST'
                    ? 'bg-vendora-amber text-black border-vendora-amber'
                    : 'bg-vendora-nested text-vendora-text border-white/10'
                }`}
              >
                IGST
              </button>
            </div>
            <p className="text-xs text-vendora-muted mt-2">
              {taxType === 'CGST+SGST' ? 'For intra-state supply' : 'For inter-state supply'}
            </p>
          </div>

          {/* Additional Charges */}
          <div className="mb-6">
            <label className="block text-sm text-vendora-muted uppercase tracking-wider mb-3">
              Additional Charges
            </label>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-vendora-muted mb-1">Freight Charges</label>
                <input
                  type="number"
                  value={freight}
                  onChange={(e) => setFreight(parseFloat(e.target.value) || 0)}
                  className="input-vendora w-full"
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-xs text-vendora-muted mb-1">Handling Charges</label>
                <input
                  type="number"
                  value={handling}
                  onChange={(e) => setHandling(parseFloat(e.target.value) || 0)}
                  className="input-vendora w-full"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-8">
            <label className="block text-sm text-vendora-muted uppercase tracking-wider mb-3">
              Notes to Vendor
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-vendora w-full h-20 resize-none"
              placeholder="Additional notes or payment instructions..."
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
              onClick={() => setShowEmailModal(true)}
              className="btn-ghost w-full flex items-center justify-center gap-2"
            >
              <Mail className="w-5 h-5" />
              EMAIL TO VENDOR
            </button>
          </div>
        </div>

        {/* Right Panel - Live Invoice Document */}
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-vendora-bg">
          <motion.div 
            id="invoice-document"
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
                  <div className="text-3xl font-bold text-gray-800">TAX INVOICE</div>
                  <div className="text-xl font-mono mt-2">{mockInvoice.number}</div>
                  <div className="text-sm text-gray-600 mt-1">Date: {new Date(invoiceDate).toLocaleDateString('en-IN')}</div>
                </div>
              </div>
            </div>

            {/* Bill To */}
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-3 text-gray-700">BILL TO</h2>
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-bold text-lg mb-1">{mockInvoice.vendor.name}</h3>
                <p className="text-sm">{mockInvoice.vendor.address}</p>
                <p className="text-sm">GSTIN: {mockInvoice.vendor.gstin}</p>
              </div>
            </div>

            {/* Reference */}
            <div className="mb-6 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-700">PO Reference:</p>
                <p className="text-sm font-mono">{mockInvoice.poNumber}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">Payment Due:</p>
                <p className="text-sm font-mono">{new Date(dueDate).toLocaleDateString('en-IN')}</p>
              </div>
            </div>

            {/* Line Items */}
            <div className="mb-6">
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
                  {mockInvoice.items.map((item, index) => (
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
                    <span className="font-mono">₹{mockInvoice.subtotal.toLocaleString()}</span>
                  </div>
                  {freight > 0 && (
                    <div className="flex justify-between py-2 border-b">
                      <span>Freight:</span>
                      <span className="font-mono">₹{freight.toLocaleString()}</span>
                    </div>
                  )}
                  {handling > 0 && (
                    <div className="flex justify-between py-2 border-b">
                      <span>Handling:</span>
                      <span className="font-mono">₹{handling.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-b">
                    <span>{totals.tax1Label}:</span>
                    <span className="font-mono">₹{Math.round(totals.tax1).toLocaleString()}</span>
                  </div>
                  {totals.tax2Label && (
                    <div className="flex justify-between py-2 border-b">
                      <span>{totals.tax2Label}:</span>
                      <span className="font-mono">₹{Math.round(totals.tax2).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-3 border-t-2 border-black font-bold text-lg">
                    <span>TOTAL:</span>
                    <span className="font-mono">₹{Math.round(totals.total).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {notes && (
              <div className="mb-6 bg-yellow-50 p-4 rounded border-l-4 border-yellow-400">
                <p className="text-sm font-semibold mb-1">Notes:</p>
                <p className="text-sm">{notes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Payment Terms:</strong> 45 days NET</p>
              <p><strong>Bank Details:</strong> HDFC Bank, Account: 1234567890, IFSC: HDFC0001234</p>
              <p className="pt-4 border-t mt-4">
                This is a computer-generated invoice and does not require a signature.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div 
            className="bg-vendora-surface border border-white/10 rounded-vendora p-8 max-w-2xl w-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h2 className="text-2xl font-display mb-6 text-vendora-amber">EMAIL INVOICE</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm text-vendora-muted uppercase tracking-wider mb-2">To:</label>
                <input
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  className="input-vendora w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm text-vendora-muted uppercase tracking-wider mb-2">CC:</label>
                <input
                  type="email"
                  value={emailCc}
                  onChange={(e) => setEmailCc(e.target.value)}
                  className="input-vendora w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm text-vendora-muted uppercase tracking-wider mb-2">Subject:</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="input-vendora w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm text-vendora-muted uppercase tracking-wider mb-2">Message:</label>
                <textarea
                  className="input-vendora w-full h-32 resize-none"
                  defaultValue={`Dear ${mockInvoice.vendor.name},\n\nPlease find Invoice ${mockInvoice.number} attached.\nPayment due: ${new Date(dueDate).toLocaleDateString('en-IN')}.\n\nBest regards,\nABC Manufacturing Co.`}
                />
              </div>
              
              <div className="bg-vendora-nested p-4 rounded">
                <p className="text-xs text-vendora-muted">
                  📎 <strong>Attachment:</strong> {mockInvoice.number}.pdf
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button onClick={() => setShowEmailModal(false)} className="btn-ghost flex-1">
                CANCEL
              </button>
              <button onClick={handleSendEmail} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <Mail className="w-5 h-5" />
                SEND EMAIL
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
