import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  FileText, 
  Building2, 
  GitCompare, 
  ShoppingCart, 
  Receipt, 
  MessageSquare,
  Bell,
  User,
  LogOut,
  Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const officerNavItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: '/officer/dashboard' },
  { id: 'rfqs', icon: FileText, label: 'RFQs', path: '/officer/rfqs' },
  { id: 'vendors', icon: Building2, label: 'Vendors', path: '/officer/vendors' },
  { id: 'compare', icon: GitCompare, label: 'Compare', path: '/officer/compare' },
  { id: 'pos', icon: ShoppingCart, label: 'Purchase Orders', path: '/officer/purchase-orders' },
  { id: 'invoices', icon: Receipt, label: 'Invoices', path: '/officer/invoices' },
  { id: 'negotiations', icon: MessageSquare, label: 'Negotiations', path: '/officer/negotiations', badge: 3 },
];

const vendorNavItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: '/vendor/dashboard' },
  { id: 'invitations', icon: FileText, label: 'Invitations', path: '/vendor/invitations' },
  { id: 'quotes', icon: Receipt, label: 'My Quotes', path: '/vendor/quotes' },
  { id: 'negotiations', icon: MessageSquare, label: 'Negotiations', path: '/vendor/negotiations', badge: 2 },
  { id: 'orders', icon: ShoppingCart, label: 'Orders', path: '/vendor/orders' },
];

const managerNavItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: '/manager/dashboard' },
  { id: 'approvals', icon: FileText, label: 'Approvals', path: '/manager/approvals' },
];

const adminNavItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
  { id: 'reports', icon: FileText, label: 'Reports', path: '/admin/reports' },
  { id: 'vendors', icon: Building2, label: 'Vendors', path: '/admin/vendors' },
  { id: 'users', icon: User, label: 'Users', path: '/admin/users' },
  { id: 'settings', icon: Settings, label: 'Settings', path: '/admin/settings' },
];

function getNavItemsForRole(role) {
  switch(role) {
    case 'officer': return officerNavItems;
    case 'vendor': return vendorNavItems;
    case 'manager': return managerNavItems;
    case 'admin': return adminNavItems;
    default: return [];
  }
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = getNavItemsForRole(user?.role);

  return (
    <div className="w-20 bg-vendora-surface border-r border-white/5 flex flex-col items-center py-8">
      {/* Logo */}
      <button 
        onClick={() => navigate(`/${user?.role}/dashboard`)}
        className="w-12 h-12 rounded-full border-2 border-vendora-amber/30 flex items-center justify-center mb-12 hover:border-vendora-amber transition-colors"
      >
        <div className="w-6 h-6">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path
              d="M50 10 L70 40 L50 35 L30 40 Z M50 35 L50 90"
              fill="none"
              stroke="#F0A500"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="50" cy="90" r="5" fill="#F0A500" />
          </svg>
        </div>
      </button>

      {/* Nav Items */}
      <nav className="flex-1 w-full space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`
                w-full h-16 flex items-center justify-center relative
                transition-all duration-200 group
                ${isActive ? 'bg-vendora-hover' : 'hover:bg-vendora-hover'}
              `}
              title={item.label}
            >
              {isActive && (
                <motion.div 
                  className="absolute left-0 w-1 h-full bg-vendora-amber"
                  layoutId="activeNav"
                />
              )}
              <Icon className={`w-6 h-6 ${isActive ? 'text-vendora-amber' : 'text-vendora-muted group-hover:text-vendora-amber'}`} />
              {item.badge && (
                <span className="absolute top-2 right-2 w-5 h-5 bg-vendora-danger rounded-full flex items-center justify-center text-xs font-mono text-white">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="space-y-2">
        <button className="w-16 h-16 flex items-center justify-center text-vendora-muted hover:text-vendora-amber transition-colors relative group">
          <Bell className="w-6 h-6" />
          <span className="absolute top-2 right-2 w-3 h-3 bg-vendora-danger rounded-full animate-pulse-dot"></span>
          <div className="absolute right-full mr-2 px-3 py-2 bg-vendora-nested rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Notifications
          </div>
        </button>
        <button className="w-16 h-16 flex items-center justify-center text-vendora-muted hover:text-vendora-amber transition-colors group">
          <User className="w-6 h-6" />
          <div className="absolute right-full mr-2 px-3 py-2 bg-vendora-nested rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Profile
          </div>
        </button>
        <button 
          onClick={logout}
          className="w-16 h-16 flex items-center justify-center text-vendora-muted hover:text-vendora-danger transition-colors group"
        >
          <LogOut className="w-6 h-6" />
          <div className="absolute right-full mr-2 px-3 py-2 bg-vendora-nested rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Logout
          </div>
        </button>
      </div>
    </div>
  );
}
