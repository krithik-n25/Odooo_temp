import { createClient } from '@supabase/supabase-js';
import { db } from './db';

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

let supabaseClient = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    console.log('Supabase initialized successfully.');
  } catch (err) {
    console.error('Failed to initialize Supabase, falling back to mock database:', err);
  }
} else {
  console.warn('Supabase credentials missing, utilizing local database simulator.');
}

// Export supabase client if available, along with local DB interface
export const supabase = supabaseClient;

// Wrapper hook to handle data fetching (Supabase real vs Local mock)
export const useDataService = () => {
  return {
    isMock: !supabaseClient,
    getRFQs: async () => {
      if (supabase) {
        const { data, error } = await supabase.from('rfqs').select('*').order('created_at', { ascending: false });
        if (!error) return data;
      }
      return db.getRFQs();
    },
    addRFQ: async (rfq) => {
      if (supabase) {
        const { data, error } = await supabase.from('rfqs').insert([rfq]).select();
        if (!error) return data[0];
      }
      db.addRFQ(rfq);
      return rfq;
    },
    getQuotes: async (rfqId) => {
      if (supabase) {
        const { data, error } = await supabase.from('quotations').select('*').eq('rfq_id', rfqId);
        if (!error) return data;
      }
      const quotes = db.getQuotes();
      return rfqId ? quotes.filter(q => q.rfqId === Number(rfqId)) : quotes;
    },
    addQuote: async (quote) => {
      if (supabase) {
        const { data, error } = await supabase.from('quotations').insert([quote]).select();
        if (!error) return data[0];
      }
      db.addQuote(quote);
      return quote;
    },
    getPOs: async () => {
      if (supabase) {
        const { data, error } = await supabase.from('purchase_orders').select('*');
        if (!error) return data;
      }
      return db.getPOs();
    },
    addPO: async (po) => {
      if (supabase) {
        const { data, error } = await supabase.from('purchase_orders').insert([po]).select();
        if (!error) return data[0];
      }
      db.addPO(po);
      return po;
    },
    getInvoices: async () => {
      if (supabase) {
        const { data, error } = await supabase.from('invoices').select('*');
        if (!error) return data;
      }
      return db.getInvoices();
    },
    addInvoice: async (invoice) => {
      if (supabase) {
        const { data, error } = await supabase.from('invoices').insert([invoice]).select();
        if (!error) return data[0];
      }
      db.addInvoice(invoice);
      return invoice;
    },
    getMessages: async (rfqId) => {
      if (supabase) {
        const { data, error } = await supabase.from('negotiation_messages').select('*').eq('rfq_id', rfqId);
        if (!error) return data;
      }
      const messages = db.getMessages();
      return rfqId ? messages.filter(m => m.rfqId === Number(rfqId)) : messages;
    },
    addMessage: async (msg) => {
      if (supabase) {
        const { data, error } = await supabase.from('negotiation_messages').insert([msg]).select();
        if (!error) return data[0];
      }
      db.addMessage(msg);
      return msg;
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
          if (lastMsg && lastMsg.rfqId === Number(rfqId)) {
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
