// Central local-storage based database simulator with pub/sub real-time support

const INITIAL_RFQS = [
  {
    id: 2847,
    title: 'Industrial Bearings',
    category: 'RAW MATERIALS',
    priority: 'STANDARD',
    status: 'COMPARING', // 'RFQ SENT' | 'QUOTES IN' | 'COMPARING' | 'APPROVAL' | 'PO ISSUED' | 'INVOICED'
    quantity: 250,
    unit: 'units',
    deadline: '3d 4h left',
    urgency: 'normal', // 'normal', 'overdue', 'complete'
    vendorsSelected: [1, 2, 3],
    items: [
      { id: 1, name: 'Industrial Bearings', specification: 'SKF 6205-2RS or equivalent', qty: 250, unit: 'Nos', targetPrice: 400 }
    ],
    createdDate: 'Oct 11, 2025'
  },
  {
    id: 2851,
    title: 'Safety Equipment',
    category: 'CONSUMABLES',
    priority: 'STANDARD',
    status: 'RFQ SENT',
    quantity: 50,
    unit: 'units',
    deadline: '6d 2h left',
    urgency: 'normal',
    vendorsSelected: [3, 4],
    items: [
      { id: 1, name: 'Safety Goggles', specification: 'Anti-fog industrial standard', qty: 50, unit: 'Nos', targetPrice: 1500 }
    ],
    createdDate: 'Oct 12, 2025'
  },
  {
    id: 2843,
    title: 'Office Supplies',
    category: 'CONSUMABLES',
    priority: 'STANDARD',
    status: 'PO ISSUED',
    quantity: 1,
    unit: 'bulk',
    deadline: 'Complete',
    urgency: 'complete',
    vendorsSelected: [3],
    items: [
      { id: 1, name: 'Office Stationery Pack', specification: 'Paper, notebooks, pens, folders', qty: 1, unit: 'Pack', targetPrice: 30000 }
    ],
    createdDate: 'Oct 8, 2025'
  },
  {
    id: 2856,
    title: 'Raw Materials Bulk',
    category: 'RAW MATERIALS',
    priority: 'URGENT',
    status: 'APPROVAL',
    quantity: 1000,
    unit: 'kg',
    deadline: '18h left',
    urgency: 'overdue',
    vendorsSelected: [1, 2],
    items: [
      { id: 1, name: 'Steel Sheets (Grade A)', specification: '2mm thickness, rust proof', qty: 1000, unit: 'Kg', targetPrice: 800 }
    ],
    createdDate: 'Oct 12, 2025'
  }
];

const INITIAL_QUOTES = [
  {
    id: 1,
    rfqId: 2847,
    vendorId: 'user_vendor_01',
    vendorName: 'Mehta Industries',
    rating: 4.2,
    unitPrice: 450,
    delivery: 12,
    gst: 18,
    paymentTerms: '30 days NET',
    pastOrders: 12,
    disputes: 0,
    responseTime: 2,
    notes: 'We can expedite delivery if needed. Premium quality bearings with 2-year warranty.',
    confidence: 'competitive',
    status: 'submitted' // 'submitted' | 'won' | 'lost' | 'draft'
  },
  {
    id: 2,
    rfqId: 2847,
    vendorId: 'vendor_sharma',
    vendorName: 'Sharma Traders',
    rating: 3.1,
    unitPrice: 380,
    delivery: 15,
    gst: 18,
    paymentTerms: '15 days NET',
    pastOrders: 4,
    disputes: 1,
    responseTime: 8,
    notes: 'Standard quality. No rush orders possible.',
    confidence: 'fair',
    status: 'submitted'
  },
  {
    id: 3,
    rfqId: 2847,
    vendorId: 'vendor_global',
    vendorName: 'Global Supplies',
    rating: 4.8,
    unitPrice: 420,
    delivery: 9,
    gst: 18,
    paymentTerms: '45 days NET',
    pastOrders: 28,
    disputes: 0,
    responseTime: 1,
    notes: 'Premium supplier with excellent track record. Can provide samples before order.',
    confidence: 'comfortable',
    status: 'submitted'
  }
];

const INITIAL_POS = [
  {
    id: 'PO-2025-1203',
    rfqId: 2843,
    vendorName: 'Global Supplies',
    date: 'Oct 10, 2025',
    status: 'SENT', // 'DRAFT' | 'SENT' | 'ACKNOWLEDGED' | 'FULFILLED'
    total: 35400,
    gstBreakdown: { cgst: 2700, sgst: 2700, subtotal: 30000 },
    deliveryAddress: 'Main Factory',
    specialInstructions: 'Deliver during office hours.'
  }
];

const INITIAL_INVOICES = [
  {
    id: 'INV-2025-089',
    poNumber: 'PO-2025-1203',
    rfqId: 2843,
    date: 'Oct 12, 2025',
    dueDate: 'Nov 26, 2025',
    vendorName: 'Global Supplies',
    total: 35400,
    status: 'sent', // 'draft' | 'sent' | 'paid'
    freight: 0,
    handling: 0,
    taxType: 'CGST+SGST'
  }
];

const INITIAL_MESSAGES = [
  {
    id: 'msg_01',
    rfqId: 2847,
    senderId: 'user_officer_01',
    senderName: 'Ramesh Shah',
    senderRole: 'officer',
    content: 'Can you revise the delivery timeline? We need this in 7 days, not 12.',
    timestamp: 'Oct 12, 2025 · 10:42 AM',
    isRead: true
  },
  {
    id: 'msg_02',
    rfqId: 2847,
    senderId: 'user_vendor_01',
    senderName: 'Mehta Industries',
    senderRole: 'vendor',
    content: 'We can do 8 days if the PO is issued by EOD. Rush handling charges of ₹2,000 apply.',
    timestamp: 'Oct 12, 2025 · 11:15 AM',
    isRead: true
  },
  {
    id: 'msg_03',
    rfqId: 2847,
    senderId: 'system',
    senderName: 'System',
    senderRole: 'system',
    content: 'Quote submitted · ₹1,12,100 · Oct 12 · 10:30 AM',
    timestamp: 'Oct 12, 2025 · 10:30 AM',
    isRead: true
  }
];

const INITIAL_ACTIVITIES = [
  { id: 1, text: 'Mehta Industries submitted quote for RFQ #2847', time: '2m ago', type: 'quote' },
  { id: 2, text: 'Manager approved PO #1203 — ₹38,000', time: '15m ago', type: 'approval' },
  { id: 3, text: 'New vendor: Sharma Traders registered', time: '1h ago', type: 'vendor' },
  { id: 4, text: 'Invoice #INV-089 emailed to Global Supplies', time: '2h ago', type: 'invoice' },
  { id: 5, text: 'RFQ #2851 deadline extended 2 days', time: '3h ago', type: 'system' },
];

class MockDatabase {
  constructor() {
    this.listeners = new Set();
    this.init();
    
    // Periodically generate simulated live activity logs
    setInterval(() => {
      this.generateSimulatedActivity();
    }, 25000);
  }

  init() {
    if (!localStorage.getItem('v_rfqs')) {
      localStorage.setItem('v_rfqs', JSON.stringify(INITIAL_RFQS));
    }
    if (!localStorage.getItem('v_quotes')) {
      localStorage.setItem('v_quotes', JSON.stringify(INITIAL_QUOTES));
    }
    if (!localStorage.getItem('v_pos')) {
      localStorage.setItem('v_pos', JSON.stringify(INITIAL_POS));
    }
    if (!localStorage.getItem('v_invoices')) {
      localStorage.setItem('v_invoices', JSON.stringify(INITIAL_INVOICES));
    }
    if (!localStorage.getItem('v_messages')) {
      localStorage.setItem('v_messages', JSON.stringify(INITIAL_MESSAGES));
    }
    if (!localStorage.getItem('v_activities')) {
      localStorage.setItem('v_activities', JSON.stringify(INITIAL_ACTIVITIES));
    }
  }

  // Pub/Sub real-time hooks
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify(event, data) {
    this.listeners.forEach((callback) => callback(event, data));
  }

  // Generic Getters
  getData(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
  }

  setData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
    this.notify(key, data);
  }

  // Entity Specific Operations
  getRFQs() { return this.getData('v_rfqs'); }
  getQuotes() { return this.getData('v_quotes'); }
  getPOs() { return this.getData('v_pos'); }
  getInvoices() { return this.getData('v_invoices'); }
  getMessages() { return this.getData('v_messages'); }
  getActivities() { return this.getData('v_activities'); }

  addRFQ(rfq) {
    const rfqs = this.getRFQs();
    rfqs.unshift(rfq);
    this.setData('v_rfqs', rfqs);

    this.addActivity({
      text: `RFQ #${rfq.id}: ${rfq.title} created by Ramesh Shah`,
      type: 'rfq'
    });

    // Mock vendor submitting a quote after 5 seconds
    setTimeout(() => {
      const isUrgent = rfq.priority === 'URGENT';
      const quote = {
        id: Date.now(),
        rfqId: rfq.id,
        vendorId: 'user_vendor_01',
        vendorName: 'Mehta Industries',
        rating: 4.2,
        unitPrice: Math.round((rfq.items[0]?.targetPrice || 500) * (0.9 + Math.random() * 0.2)),
        delivery: isUrgent ? 3 : 7,
        gst: 18,
        paymentTerms: '30 days NET',
        pastOrders: 14,
        disputes: 0,
        responseTime: 1,
        notes: 'We would love to fulfill this order promptly.',
        confidence: 'competitive',
        status: 'submitted'
      };
      this.addQuote(quote);
    }, 5000);
  }

  addQuote(quote) {
    const quotes = this.getQuotes();
    quotes.push(quote);
    this.setData('v_quotes', quotes);

    this.addActivity({
      text: `${quote.vendorName} submitted quote for RFQ #${quote.rfqId}`,
      type: 'quote'
    });

    this.addMessage({
      rfqId: quote.rfqId,
      senderId: 'system',
      senderName: 'System',
      senderRole: 'system',
      content: `Quote submitted · ₹${Math.round(quote.unitPrice * 250).toLocaleString()} · Just now`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    });
  }

  addPO(po) {
    const pos = this.getPOs();
    pos.unshift(po);
    this.setData('v_pos', pos);

    this.addActivity({
      text: `PO #${po.id} generated for ${po.vendorName} — ₹${po.total.toLocaleString()}`,
      type: 'po'
    });

    // Lock negotiation thread
    const messages = this.getMessages();
    this.setData('v_messages', messages);

    // Update RFQ status
    const rfqs = this.getRFQs();
    const rfqIndex = rfqs.findIndex((r) => r.id === po.rfqId);
    if (rfqIndex !== -1) {
      rfqs[rfqIndex].status = 'PO ISSUED';
      rfqs[rfqIndex].urgency = 'complete';
      rfqs[rfqIndex].deadline = 'Complete';
      this.setData('v_rfqs', rfqs);
    }
  }

  addInvoice(invoice) {
    const invoices = this.getInvoices();
    invoices.unshift(invoice);
    this.setData('v_invoices', invoices);

    this.addActivity({
      text: `Invoice #${invoice.id} sent to ${invoice.vendorName}`,
      type: 'invoice'
    });

    // Update RFQ status to INVOICED
    const rfqs = this.getRFQs();
    const rfqIndex = rfqs.findIndex((r) => r.id === invoice.rfqId);
    if (rfqIndex !== -1) {
      rfqs[rfqIndex].status = 'INVOICED';
      this.setData('v_rfqs', rfqs);
    }
  }

  addMessage(msg) {
    const messages = this.getMessages();
    const newMsg = {
      id: `msg_${Date.now()}`,
      isRead: false,
      timestamp: new Date().toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      ...msg
    };
    messages.push(newMsg);
    this.setData('v_messages', messages);

    this.notify('message_received', newMsg);

    // Auto-reply bot (simulated conversation)
    if (msg.senderRole !== 'system' && msg.senderRole !== 'bot') {
      setTimeout(() => {
        let replyContent = '';
        const botName = msg.senderRole === 'officer' ? 'Mehta Industries' : 'Ramesh Shah';
        const botRole = msg.senderRole === 'officer' ? 'vendor' : 'officer';

        if (msg.content.toLowerCase().includes('delivery') || msg.content.toLowerCase().includes('timeline') || msg.content.toLowerCase().includes('days')) {
          replyContent = botRole === 'vendor' 
            ? 'We can expedite delivery by 3 days if we receive the PO today.'
            : 'Thanks. 8 days works for us. Please revise the quote details accordingly.';
        } else if (msg.content.toLowerCase().includes('price') || msg.content.toLowerCase().includes('discount') || msg.content.toLowerCase().includes('rate')) {
          replyContent = botRole === 'vendor'
            ? 'Our pricing is very competitive, but we can offer an additional 2% volume discount on bulk orders.'
            : 'Can we settle on ₹400 per unit? That is within our target price.';
        } else {
          replyContent = botRole === 'vendor'
            ? 'Thank you for the clarification. We will update our proposal shortly.'
            : 'Received. Let me run this by our management team for quick clearance.';
        }

        this.addMessage({
          rfqId: msg.rfqId,
          senderId: botRole === 'vendor' ? 'user_vendor_01' : 'user_officer_01',
          senderName: botName,
          senderRole: botRole,
          content: replyContent
        });
      }, 1500);
    }
  }

  addActivity(activity) {
    const activities = this.getActivities();
    const newAct = {
      id: Date.now(),
      time: 'Just now',
      ...activity
    };
    activities.unshift(newAct);
    if (activities.length > 20) activities.pop();
    this.setData('v_activities', activities);
    this.notify('activity_feed', newAct);
  }

  generateSimulatedActivity() {
    const logs = [
      { text: 'Sharma Traders checked RFQ #2847 details', type: 'system' },
      { text: 'Quote comparison revised by Procurement Officer', type: 'quote' },
      { text: 'New vendor registry request: Kirloskar Pumps Ltd.', type: 'vendor' },
      { text: 'Monthly savings metrics recalculated: ₹8.43L total', type: 'system' },
      { text: 'Audit logs backed up successfully to secure node', type: 'system' }
    ];
    const log = logs[Math.floor(Math.random() * logs.length)];
    this.addActivity(log);
  }
}

export const db = new MockDatabase();
