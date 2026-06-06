import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth
import Login from './pages/Login';

// Officer pages
import OfficerDashboard from './pages/officer/Dashboard';
import RFQCreate from './pages/officer/RFQCreate';
import RFQs from './pages/officer/RFQs';
import OfficerVendors from './pages/officer/Vendors';
import QuotationComparison from './pages/officer/QuotationComparison';
import CompareRedirect from './pages/officer/CompareRedirect';
import PurchaseOrder from './pages/officer/PurchaseOrder';
import Invoice from './pages/officer/Invoice';

// Vendor pages
import VendorDashboard from './pages/vendor/Dashboard';
import QuoteSubmit from './pages/vendor/QuoteSubmit';
import Invitations from './pages/vendor/Invitations';
import VendorQuotes from './pages/vendor/Quotes';
import VendorOrders from './pages/vendor/Orders';

// Manager pages
import ManagerDashboard from './pages/manager/Dashboard';
import ManagerApprovals from './pages/manager/Approvals';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminReports from './pages/admin/Reports';
import AdminUsers from './pages/admin/Users';
import AdminVendors from './pages/admin/Vendors';
import AdminSettings from './pages/admin/Settings';

// Shared
import Negotiations from './pages/Negotiations';

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-vendora-bg">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-vendora-amber border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-vendora-muted font-body">Loading VENDORA...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Navigate to={user ? `/${user.role}/dashboard` : '/login'} replace />} />
      <Route path="/login" element={user ? <Navigate to={`/${user.role}/dashboard`} replace /> : <Login />} />

      {/* ─── Procurement Officer Routes ─── */}
      <Route
        path="/officer/dashboard"
        element={<ProtectedRoute allowedRoles={['officer']}><OfficerDashboard /></ProtectedRoute>}
      />
      <Route
        path="/officer/rfqs"
        element={<ProtectedRoute allowedRoles={['officer']}><RFQs /></ProtectedRoute>}
      />
      <Route
        path="/officer/rfq/create"
        element={<ProtectedRoute allowedRoles={['officer']}><RFQCreate /></ProtectedRoute>}
      />
      <Route
        path="/officer/vendors"
        element={<ProtectedRoute allowedRoles={['officer']}><OfficerVendors /></ProtectedRoute>}
      />
      {/* Compare — auto-redirect to first comparing RFQ */}
      <Route
        path="/officer/compare"
        element={<ProtectedRoute allowedRoles={['officer']}><CompareRedirect /></ProtectedRoute>}
      />
      <Route
        path="/officer/compare/:rfqId"
        element={<ProtectedRoute allowedRoles={['officer']}><QuotationComparison /></ProtectedRoute>}
      />
      <Route
        path="/officer/purchase-orders"
        element={<ProtectedRoute allowedRoles={['officer']}><PurchaseOrder /></ProtectedRoute>}
      />
      <Route
        path="/officer/invoices"
        element={<ProtectedRoute allowedRoles={['officer']}><Invoice /></ProtectedRoute>}
      />
      <Route
        path="/officer/invoices/create"
        element={<ProtectedRoute allowedRoles={['officer']}><Invoice /></ProtectedRoute>}
      />
      <Route
        path="/officer/negotiations"
        element={<ProtectedRoute allowedRoles={['officer']}><Negotiations /></ProtectedRoute>}
      />
      <Route
        path="/officer/negotiations/:threadId"
        element={<ProtectedRoute allowedRoles={['officer']}><Negotiations /></ProtectedRoute>}
      />

      {/* ─── Vendor Routes ─── */}
      <Route
        path="/vendor/dashboard"
        element={<ProtectedRoute allowedRoles={['vendor']}><VendorDashboard /></ProtectedRoute>}
      />
      <Route
        path="/vendor/invitations"
        element={<ProtectedRoute allowedRoles={['vendor']}><Invitations /></ProtectedRoute>}
      />
      <Route
        path="/vendor/quotes"
        element={<ProtectedRoute allowedRoles={['vendor']}><VendorQuotes /></ProtectedRoute>}
      />
      <Route
        path="/vendor/quote/:rfqId"
        element={<ProtectedRoute allowedRoles={['vendor']}><QuoteSubmit /></ProtectedRoute>}
      />
      <Route
        path="/vendor/negotiations"
        element={<ProtectedRoute allowedRoles={['vendor']}><Negotiations /></ProtectedRoute>}
      />
      <Route
        path="/vendor/negotiations/:threadId"
        element={<ProtectedRoute allowedRoles={['vendor']}><Negotiations /></ProtectedRoute>}
      />
      <Route
        path="/vendor/orders"
        element={<ProtectedRoute allowedRoles={['vendor']}><VendorOrders /></ProtectedRoute>}
      />

      {/* ─── Manager Routes ─── */}
      <Route
        path="/manager/dashboard"
        element={<ProtectedRoute allowedRoles={['manager']}><ManagerDashboard /></ProtectedRoute>}
      />
      <Route
        path="/manager/approvals"
        element={<ProtectedRoute allowedRoles={['manager']}><ManagerApprovals /></ProtectedRoute>}
      />

      {/* ─── Admin Routes ─── */}
      <Route
        path="/admin/dashboard"
        element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>}
      />
      <Route
        path="/admin/reports"
        element={<ProtectedRoute allowedRoles={['admin']}><AdminReports /></ProtectedRoute>}
      />
      <Route
        path="/admin/vendors"
        element={<ProtectedRoute allowedRoles={['admin']}><AdminVendors /></ProtectedRoute>}
      />
      <Route
        path="/admin/users"
        element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>}
      />
      <Route
        path="/admin/settings"
        element={<ProtectedRoute allowedRoles={['admin']}><AdminSettings /></ProtectedRoute>}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#111318',
              color: '#E8EAF0',
              border: '1px solid rgba(255,255,255,0.1)',
              fontFamily: 'Syne',
              borderRadius: '4px',
            },
            success: {
              iconTheme: { primary: '#10B981', secondary: '#111318' },
            },
            error: {
              iconTheme: { primary: '#EF4444', secondary: '#111318' },
            },
          }}
        />
      </AuthProvider>
    </Router>
  );
}

export default App;
