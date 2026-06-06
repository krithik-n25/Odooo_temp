import { useState } from 'react';
import { Settings, Save, ShieldAlert, BellRing } from 'lucide-react';
import Sidebar from '../../components/shared/Sidebar';
import toast from 'react-hot-toast';

export default function SystemSettings() {
  const [threshold, setThreshold] = useState('100000');
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [autoLock, setAutoLock] = useState(true);

  const handleSave = (e) => {
    e.preventDefault();
    toast.success('System parameters updated successfully!');
  };

  return (
    <div className="min-h-screen flex bg-vendora-bg text-vendora-text">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-display tracking-wide uppercase">SYSTEM SETTINGS</h1>
            <p className="text-vendora-muted font-body">Configure procurement compliance thresholds and alerts</p>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Procurement Policies */}
            <div className="card-vendora">
              <h2 className="text-xl font-display uppercase tracking-widest text-vendora-amber mb-6 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" />
                Procurement Compliance Policies
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-vendora-muted uppercase tracking-wider mb-2">
                    High-Value Spend Threshold (₹)
                  </label>
                  <input
                    type="number"
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                    className="input-vendora w-full font-mono text-xl"
                  />
                  <p className="text-xs text-vendora-muted mt-2">
                    Any RFQ totaling above this limit will trigger multi-level manager approvals and alert badges.
                  </p>
                </div>

                <div className="flex items-center justify-between py-4 border-t border-white/5">
                  <div>
                    <h4 className="text-sm font-body font-bold">Automatic Negotiation Lock</h4>
                    <p className="text-xs text-vendora-muted">Freeze thread automatically after a PO is generated</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoLock}
                    onChange={(e) => setAutoLock(e.target.checked)}
                    className="w-5 h-5 rounded accent-vendora-amber bg-vendora-nested"
                  />
                </div>
              </div>
            </div>

            {/* Notification triggers */}
            <div className="card-vendora">
              <h2 className="text-xl font-display uppercase tracking-widest text-vendora-amber mb-6 flex items-center gap-2">
                <BellRing className="w-5 h-5" />
                Notification Triggers
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h4 className="text-sm font-body font-bold">Email Audit Summaries</h4>
                    <p className="text-xs text-vendora-muted">Send PDF reports of negotiations upon closure</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.checked)}
                    className="w-5 h-5 rounded accent-vendora-amber bg-vendora-nested"
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full py-4 text-base font-body tracking-wider flex items-center justify-center gap-2">
              <Save className="w-5 h-5 text-black" />
              SAVE SYSTEM CONFIGURATION
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
