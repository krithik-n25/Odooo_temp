import { useState } from 'react';
import { Users, Search, Edit2, ShieldAlert } from 'lucide-react';
import Sidebar from '../../components/shared/Sidebar';
import { HARDCODED_USERS } from '../../lib/hardcodedAuth';
import toast from 'react-hot-toast';

export default function UserManagement() {
  const [users, setUsers] = useState(HARDCODED_USERS.map(u => ({ ...u, status: 'Active' })));
  const [searchTerm, setSearchTerm] = useState('');

  const toggleStatus = (id) => {
    setUsers(users.map(u => {
      if (u.id === id) {
        const nextStatus = u.status === 'Active' ? 'Deactivated' : 'Active';
        toast.success(`User ${u.name} set to ${nextStatus}`);
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex bg-vendora-bg text-vendora-text">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-display tracking-wide uppercase">USER ACCESS CONTROL</h1>
            <p className="text-vendora-muted font-body">Manage staff access roles and track logins</p>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-vendora-muted w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search users by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-vendora w-full pl-12"
            />
          </div>

          {/* User List Table */}
          <div className="card-vendora p-0 overflow-hidden">
            <table className="table-vendora">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email Address</th>
                  <th>Organization</th>
                  <th>System Role</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td className="font-body font-bold text-vendora-text">{u.name}</td>
                    <td className="font-mono text-sm text-vendora-muted">{u.email}</td>
                    <td className="text-sm font-body text-vendora-text">{u.company}</td>
                    <td>
                      <span className={`text-[10px] font-mono font-bold tracking-wider px-2.5 py-1 rounded ${
                        u.role === 'admin' ? 'bg-vendora-danger/10 text-vendora-danger border border-vendora-danger/25' :
                        u.role === 'manager' ? 'bg-vendora-warning/10 text-vendora-warning border border-vendora-warning/25' :
                        u.role === 'officer' ? 'bg-vendora-amber/10 text-vendora-amber border border-vendora-amber/25' :
                        'bg-white/5 text-vendora-text border border-white/10'
                      }`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${u.status === 'Active' ? 'bg-vendora-success' : 'bg-vendora-danger'}`} />
                        <span className="text-xs font-body text-vendora-text">{u.status}</span>
                      </div>
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => toggleStatus(u.id)}
                          className={`px-3 py-1.5 rounded text-xs font-body uppercase font-bold border transition-colors ${
                            u.status === 'Active' 
                              ? 'border-vendora-danger text-vendora-danger hover:bg-vendora-danger hover:text-white'
                              : 'border-vendora-success text-vendora-success hover:bg-vendora-success hover:text-black'
                          }`}
                        >
                          {u.status === 'Active' ? 'DEACTIVATE' : 'ACTIVATE'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
