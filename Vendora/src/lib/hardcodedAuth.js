export const HARDCODED_USERS = [
  {
    id: 'user_officer_01',
    email: 'officer@vendora.com',
    password: 'demo123',
    role: 'officer',
    name: 'Ramesh Shah',
    company: 'ABC Manufacturing Co.',
  },
  {
    id: 'user_vendor_01',
    email: 'vendor@vendora.com',
    password: 'demo123',
    role: 'vendor',
    name: 'Mehta Industries',
    company: 'Mehta Industries Pvt. Ltd.',
  },
  {
    id: 'user_manager_01',
    email: 'manager@vendora.com',
    password: 'demo123',
    role: 'manager',
    name: 'Priya Mehta',
    company: 'ABC Manufacturing Co.',
  },
  {
    id: 'user_admin_01',
    email: 'admin@vendora.com',
    password: 'demo123',
    role: 'admin',
    name: 'Suresh Admin',
    company: 'ABC Manufacturing Co.',
  },
];

export const authenticateUser = (email, password) => {
  const user = HARDCODED_USERS.find(
    (u) => u.email === email && u.password === password
  );
  return user || null;
};

export const getRoleDashboard = (role) => {
  const routes = {
    officer: '/officer/dashboard',
    vendor: '/vendor/dashboard',
    manager: '/manager/dashboard',
    admin: '/admin/dashboard',
  };
  return routes[role] || '/login';
};
