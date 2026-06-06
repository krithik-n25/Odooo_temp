import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { MessageSquare, Lock, Download, Send, ArrowLeft, Eye, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/shared/Sidebar';
import { useDataService } from '../lib/supabase';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';

export default function Negotiations() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { threadId } = useParams();
  const dataService = useDataService();

  const [threads, setThreads] = useState([]);
  const [activeRfqId, setActiveRfqId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [rfqDetails, setRfqDetails] = useState(null);
  
  const messagesEndRef = useRef(null);

  // Load threads based on user role
  useEffect(() => {
    const loadThreads = async () => {
      const allRfqs = await dataService.getRFQs();
      // Group by RFQ
      const list = allRfqs.map(r => ({
        id: r.id,
        title: r.title,
        status: r.status,
        isLocked: r.status === 'PO ISSUED' || r.status === 'INVOICED',
        unreadCount: r.status === 'COMPARING' ? 3 : 0
      }));
      setThreads(list);

      // Auto-select first thread or url threadId
      if (threadId) {
        setActiveRfqId(Number(threadId));
      } else if (list.length > 0) {
        setActiveRfqId(list[0].id);
      }
    };
    loadThreads();
  }, [threadId]);

  // Load messages and details for active thread
  useEffect(() => {
    if (!activeRfqId) return;

    const loadThreadData = async () => {
      const fetchedMessages = await dataService.getMessages(activeRfqId);
      setMessages(fetchedMessages);

      const allRfqs = await dataService.getRFQs();
      const rfq = allRfqs.find(r => r.id === activeRfqId);
      setRfqDetails(rfq);
    };

    loadThreadData();

    // Subscribe to realtime messages
    const unsubscribe = dataService.subscribeToMessages(activeRfqId, (newMsg) => {
      setMessages(prev => {
        if (prev.some(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    });

    return () => {
      unsubscribe();
    };
  }, [activeRfqId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeRfqId) return;

    const msg = {
      rfqId: activeRfqId,
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      content: inputText
    };

    setInputText('');
    await dataService.addMessage(msg);
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFont('Helvetica');
      doc.setFontSize(20);
      doc.setTextColor(240, 165, 0); // Amber
      doc.text(`VENDORA AUDIT TRAIL LOG`, 20, 20);

      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`RFQ ID: #${activeRfqId} - ${rfqDetails?.title || 'Negotiations'}`, 20, 30);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 36);
      doc.text(`Participants: Ramesh Shah (Officer), Mehta Industries (Vendor)`, 20, 42);
      doc.line(20, 48, 190, 48);

      let yPos = 58;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);

      messages.forEach((m) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }

        const dateStr = `[${m.timestamp}]`;
        if (m.senderRole === 'system') {
          doc.setFont('Helvetica', 'oblique');
          doc.setTextColor(120, 120, 120);
          doc.text(`EVENT: ${m.content} ${dateStr}`, 25, yPos);
          yPos += 8;
        } else {
          doc.setFont('Helvetica', 'bold');
          doc.setTextColor(m.senderRole === 'officer' ? 0 : 200, m.senderRole === 'officer' ? 100 : 100, 0);
          doc.text(`${m.senderName} (${m.senderRole.toUpperCase()}):`, 20, yPos);
          
          doc.setFont('Helvetica', 'normal');
          doc.setTextColor(30, 30, 30);
          // Split text to fit page width
          const splitText = doc.splitTextToSize(m.content, 150);
          doc.text(splitText, 20, yPos + 6);
          doc.setFont('Helvetica', 'italic');
          doc.setTextColor(150, 150, 150);
          doc.text(dateStr, 160, yPos);
          
          yPos += 8 + (splitText.length * 5);
        }
      });

      doc.save(`vendora_audit_rfq_${activeRfqId}.pdf`);
      toast.success('Audit trail PDF exported successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF');
    }
  };

  const isThreadLocked = rfqDetails?.status === 'PO ISSUED' || rfqDetails?.status === 'INVOICED';

  return (
    <div className="min-h-screen flex bg-vendora-bg text-vendora-text">
      <Sidebar />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Thread List */}
        <div className="w-80 bg-vendora-surface border-r border-white/5 flex flex-col">
          <div className="p-6 border-b border-white/5">
            <h2 className="text-xl font-display uppercase tracking-wider text-vendora-amber flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Negotiations
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
            {threads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => setActiveRfqId(thread.id)}
                className={`w-full text-left p-4 rounded transition-all border flex flex-col justify-between ${
                  activeRfqId === thread.id
                    ? 'bg-vendora-amber/10 border-vendora-amber'
                    : 'bg-vendora-nested/50 border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex justify-between items-start w-full mb-1">
                  <span className="text-xs font-mono text-vendora-muted">RFQ #{thread.id}</span>
                  {thread.isLocked && <Lock className="w-3.5 h-3.5 text-vendora-muted" />}
                  {thread.unreadCount > 0 && activeRfqId !== thread.id && (
                    <span className="w-4 h-4 bg-vendora-danger rounded-full flex items-center justify-center text-[10px] text-white">
                      {thread.unreadCount}
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-body font-bold text-vendora-text truncate w-full mb-1">
                  {thread.title}
                </h4>
                <span className="text-xs font-body text-vendora-muted uppercase tracking-wider">
                  {thread.status}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Panel - Active Chat */}
        <div className="flex-1 flex flex-col justify-between bg-vendora-bg relative">
          {rfqDetails ? (
            <>
              {/* Chat Header */}
              <div className="bg-vendora-surface border-b border-white/5 p-6 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-vendora-amber">RFQ #{rfqDetails.id}</span>
                    <span className="text-xs font-body uppercase text-vendora-muted">· {rfqDetails.status}</span>
                  </div>
                  <h3 className="text-2xl font-display uppercase tracking-wide">{rfqDetails.title}</h3>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => navigate(user.role === 'officer' ? `/officer/compare/${activeRfqId}` : `/vendor/quote/${activeRfqId}`)}
                    className="btn-ghost py-2 px-4 text-xs font-body uppercase flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    {user.role === 'officer' ? 'Compare Quotes' : 'View Quote'}
                  </button>
                  <button 
                    onClick={handleExportPDF}
                    className="btn-ghost py-2 px-4 text-xs font-body uppercase flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export Audit
                  </button>
                </div>
              </div>

              {/* Message History (Linear/Notion style comments) */}
              <div className="flex-1 p-8 overflow-y-auto custom-scrollbar space-y-6">
                {messages.map((m) => {
                  if (m.senderRole === 'system') {
                    return (
                      <div key={m.id} className="flex justify-center my-6">
                        <span className="text-xs font-body bg-white/5 border border-white/5 px-4 py-1.5 rounded-full text-vendora-muted">
                          {m.content}
                        </span>
                      </div>
                    );
                  }

                  const isMe = m.senderId === user.id;

                  return (
                    <div 
                      key={m.id} 
                      className={`flex flex-col max-w-2xl ${isMe ? 'ml-auto items-end text-right' : 'mr-auto items-start text-left'}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-body font-bold text-vendora-text">
                          {m.senderName} · <span className="text-vendora-muted uppercase text-[10px]">{m.senderRole}</span>
                        </span>
                        <span className="text-xs text-vendora-muted font-mono">{m.timestamp || m.createdDate}</span>
                      </div>
                      <div className="bg-vendora-surface border border-white/5 p-4 rounded text-sm font-body text-vendora-text leading-relaxed whitespace-pre-wrap">
                        {m.content}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input / Thread Locked */}
              <div className="p-6 border-t border-white/5 bg-vendora-surface">
                {isThreadLocked ? (
                  <div className="border border-white/10 rounded p-6 text-center max-w-xl mx-auto bg-vendora-nested">
                    <Lock className="w-8 h-8 text-vendora-muted mx-auto mb-3" />
                    <h4 className="text-base font-body font-bold text-vendora-text mb-1 uppercase">Thread Locked</h4>
                    <p className="text-xs text-vendora-muted mb-4 font-body">PO #1203 has been issued on Oct 13, 2025. This conversation is now archived and read-only.</p>
                    <button 
                      onClick={handleExportPDF}
                      className="btn-primary py-2 px-6 text-xs font-body uppercase"
                    >
                      Export Conversation Log
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage} className="flex gap-4 items-center">
                    <input
                      type="text"
                      placeholder="Type a message... (Shift+Enter for new line)"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="input-vendora flex-1"
                    />
                    <button 
                      type="submit"
                      disabled={!inputText.trim()}
                      className="btn-primary p-3 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5 text-black" />
                    </button>
                  </form>
                )}
                <p className="text-[10px] text-vendora-muted mt-3 text-center">
                  🔒 All messages are timestamped, encrypted, and audit-logged for audit trail compliance.
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <MessageSquare className="w-16 h-16 text-vendora-muted mb-4 animate-pulse" />
              <h3 className="text-2xl font-display text-vendora-text mb-2 uppercase">No Active Thread</h3>
              <p className="text-sm text-vendora-muted font-body">Select a negotiation thread on the left to start collaborating.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
