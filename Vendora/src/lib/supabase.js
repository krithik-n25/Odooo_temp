import { createClient } from '@supabase/supabase-js';
import { db } from './db';
import { api } from './api';

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

let supabaseClient = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    console.log('Supabase initialized successfully for realtime subscriptions.');
  } catch (err) {
    console.error('Failed to initialize Supabase realtime client:', err);
  }
}

export const supabase = supabaseClient;

// Adapters for mapping FastAPI backend snake_case models to frontend camelCase expectations

const mapRFQ = (rfq) => {
  const d = new Date(rfq.deadline);
  const now = new Date();
  const diffHours = Math.round((d - now) / (1000 * 60 * 60));
  const deadlineStr = diffHours > 24 ? `${Math.floor(diffHours/24)}d ${diffHours%24}h left` : `${diffHours > 0 ? diffHours : 0}h left`;
  const urgency = diffHours < 24 ? 'overdue' : 'normal';

  const statusMap = {
    'draft': 'RFQ SENT', // Or map draft to RFQ SENT if frontend doesn't have a draft column
    'sent': 'RFQ SENT',
    'quotes_in': 'QUOTES IN',
    'comparing': 'COMPARING',
    'approval': 'APPROVAL',
    'po_issued': 'PO ISSUED',
    'invoiced': 'INVOICED',
    'completed': 'PO ISSUED', // Map completed to PO ISSUED or similar
    'cancelled': 'CANCELLED'
  };

  return {
    id: rfq.id, // Using the backend UUID or string ID. Note: some UI might expect numbers, but strings usually work in React keys.
    displayId: rfq.rfq_number,
    title: rfq.title,
    category: rfq.category || 'GENERAL',
    priority: (rfq.priority || 'standard').toUpperCase(),
    status: statusMap[rfq.status] || rfq.status.toUpperCase().replace('_', ' '),
    quantity: rfq.items?.[0]?.quantity || 1,
    unit: rfq.items?.[0]?.unit || 'units',
    deadline: rfq.status === 'po_issued' || rfq.status === 'invoiced' ? 'Complete' : deadlineStr,
    urgency: rfq.status === 'po_issued' || rfq.status === 'invoiced' ? 'complete' : urgency,
    vendorsSelected: [], 
    items: (rfq.items || []).map((item, index) => ({
      id: item.id || index + 1, 
      name: item.item_name, 
      specification: item.specification, 
      qty: item.quantity, 
      unit: item.unit, 
      targetPrice: item.target_price
    })),
    createdDate: new Date(rfq.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  };
};

const mapQuote = (quote) => {
  return {
    id: quote.id,
    rfqId: quote.rfq_id,
    vendorId: quote.vendor_id,
    vendorName: quote.vendor_id, // Would need user profile join, fallback to ID
    rating: 4.0, // Default if not provided
    unitPrice: quote.unit_price,
    delivery: quote.delivery_days,
    gst: quote.gst_percentage,
    paymentTerms: quote.payment_terms,
    pastOrders: 0,
    disputes: 0,
    responseTime: 24,
    notes: quote.notes,
    confidence: quote.confidence_level || 'fair',
    status: quote.status
  };
};

const mapPO = (po) => {
  return {
    id: po.po_number,
    rfqId: po.rfq_id,
    vendorName: po.vendor_id, // Fallback
    date: new Date(po.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    status: po.status.toUpperCase(),
    total: po.total_amount,
    gstBreakdown: po.tax_breakdown || { cgst: 0, sgst: 0, subtotal: po.total_amount },
    deliveryAddress: po.delivery_address,
    specialInstructions: po.special_instructions
  };
};

export const useDataService = () => {
  return {
    isMock: false,
    
    getRFQs: async () => {
      try {
        const data = await api.get('/api/rfqs/');
        if (data && Array.isArray(data)) {
          return data.map(mapRFQ);
        }
      } catch (err) {
        console.warn('Backend getRFQs failed, falling back to mock DB', err);
      }
      return db.getRFQs();
    },
    
    addRFQ: async (rfq) => {
      try {
        const catMap = {
          'RAW MATERIALS': 'raw_materials',
          'CONSUMABLES': 'consumables',
          'EQUIPMENT': 'equipment',
          'SERVICES': 'services',
          'GENERAL': 'other'
        };
        // Adapt frontend rfq format to backend RFQCreate
        const backendPayload = {
          title: rfq.title,
          category: catMap[rfq.category] || 'other',
          priority: (rfq.priority || 'standard').toLowerCase(),
          deadline: new Date(Date.now() + 7*24*60*60*1000).toISOString(), // Dummy parsing for now
          items: rfq.items.map(item => ({
            item_name: item.name,
            specification: item.specification,
            quantity: item.qty,
            unit: item.unit,
            target_price: item.targetPrice
          })),
          vendor_ids: []
        };
        const res = await api.post('/api/rfqs/', backendPayload);
        return mapRFQ(res);
      } catch (err) {
        console.warn('Backend addRFQ failed, falling back to mock DB', err);
        db.addRFQ(rfq);
        return rfq;
      }
    },
    
    getQuotes: async (rfqId) => {
      try {
        const endpoint = rfqId ? `/api/quotations/?rfq_id=${rfqId}` : '/api/quotations/';
        const data = await api.get(endpoint);
        if (data && Array.isArray(data)) {
          return data.map(mapQuote);
        }
      } catch (err) {
        console.warn('Backend getQuotes failed, falling back to mock DB', err);
      }
      const quotes = db.getQuotes();
      return rfqId ? quotes.filter(q => String(q.rfqId) === String(rfqId)) : quotes;
    },
    
    addQuote: async (quote) => {
      try {
        const backendPayload = {
          rfq_id: quote.rfqId,
          unit_price: quote.unitPrice,
          delivery_days: quote.delivery,
          gst_percentage: quote.gst,
          payment_terms: quote.paymentTerms,
          notes: quote.notes,
          confidence_level: quote.confidence
        };
        const res = await api.post('/api/quotations/', backendPayload);
        return mapQuote(res);
      } catch (err) {
        console.warn('Backend addQuote failed, falling back to mock DB', err);
        db.addQuote(quote);
        return quote;
      }
    },
    
    getPOs: async () => {
      try {
        const data = await api.get('/api/purchase-orders/');
        if (data && Array.isArray(data)) {
          return data.map(mapPO);
        }
      } catch (err) {
        console.warn('Backend getPOs failed, falling back to mock DB', err);
      }
      return db.getPOs();
    },
    
    addPO: async (po) => {
      try {
        const backendPayload = {
          rfq_id: po.rfqId,
          vendor_id: "vendor_id", // would come from quote
          delivery_address: po.deliveryAddress,
          special_instructions: po.specialInstructions,
          expected_delivery_date: new Date().toISOString()
        };
        const res = await api.post('/api/purchase-orders/', backendPayload);
        return mapPO(res);
      } catch (err) {
        console.warn('Backend addPO failed, falling back to mock DB', err);
        db.addPO(po);
        return po;
      }
    },
    
    getInvoices: async () => {
      try {
        const data = await api.get('/api/invoices/');
        return data; // map accordingly if needed
      } catch (err) {
        console.warn('Backend getInvoices failed, falling back to mock DB', err);
      }
      return db.getInvoices();
    },
    
    addInvoice: async (invoice) => {
      db.addInvoice(invoice);
      return invoice;
    },
    
    getMessages: async (rfqId) => {
      const messages = db.getMessages();
      return rfqId ? messages.filter(m => String(m.rfqId) === String(rfqId)) : messages;
    },
    
    addMessage: async (msg) => {
      db.addMessage(msg);
      return msg;
    },
    
    getActivities: async () => {
      return db.getActivities();
    },
    
    subscribeToMessages: (rfqId, callback) => {
      if (supabase) {
        const subscription = supabase
          .channel(`negotiation:${rfqId}`)
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'negotiation_messages', filter: `rfq_id=eq.${rfqId}` }, (payload) => {
            callback(payload.new);
          })
          .subscribe();
        return () => supabase.removeChannel(subscription);
      }
      return db.subscribe((event, data) => {
        if (event === 'v_messages') {
          const lastMsg = data[data.length - 1];
          if (lastMsg && String(lastMsg.rfqId) === String(rfqId)) {
            callback(lastMsg);
          }
        }
      });
    },
    
    subscribeToActivities: (callback) => {
      if (supabase) {
        const subscription = supabase
          .channel('activities')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activities' }, (payload) => {
            callback(payload.new);
          })
          .subscribe();
        return () => supabase.removeChannel(subscription);
      }
      return db.subscribe((event, data) => {
        if (event === 'activity_feed') {
          callback(data);
        }
      });
    }
  };
};
