import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle, Building2, CheckSquare, Settings, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authenticateUser, getRoleDashboard, HARDCODED_USERS } from '../lib/hardcodedAuth';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const roles = [
  {
    id: 'officer',
    icon: UserCircle,
    title: 'PROCUREMENT OFFICER',
    description: 'Create & track all purchases',
    email: 'officer@vendora.com',
  },
  {
    id: 'vendor',
    icon: Building2,
    title: 'VENDOR',
    description: 'Submit quotes & track orders',
    email: 'vendor@vendora.com',
  },
  {
    id: 'manager',
    icon: CheckSquare,
    title: 'MANAGER / APPROVER',
    description: 'Approve or reject orders',
    email: 'manager@vendora.com',
  },
  {
    id: 'admin',
    icon: Settings,
    title: 'ADMIN',
    description: 'Manage system & analytics',
    email: 'admin@vendora.com',
  },
];

export default function Login() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    setSelectedRole(role.id);
    setEmail(role.email);
    setPassword('demo123');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    
    const user = authenticateUser(email, password);
    
    if (user) {
      login(user);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(getRoleDashboard(user.role));
    } else {
      toast.error('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Half - Brand Statement */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-12 bg-vendora-bg relative overflow-hidden border-r border-white/5">
        {/* Looping luxury abstract background video */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover opacity-20 filter brightness-[0.4] contrast-125 pointer-events-none"
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-abstract-gold-and-black-particles-40890-large.mp4" type="video/mp4" />
        </video>
        {/* Subtle gradient overlays */}
        <div className="absolute inset-0 bg-[#0A0B0F]/50 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-vendora-amber/10 via-transparent to-transparent"></div>
        
        <motion.div 
          className="relative z-10 max-w-2xl"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Logo/Icon */}
          <motion.div 
            className="mb-12"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="w-24 h-24 rounded-full border-2 border-vendora-amber/30 flex items-center justify-center bg-vendora-bg/30 backdrop-blur-sm shadow-xl">
              <div className="w-12 h-12">
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
            </div>
          </motion.div>

          {/* Main heading */}
          <h1 className="font-display text-8xl leading-none mb-8 tracking-tight">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              VENDORA.
            </motion.div>
            <motion.div
              className="text-vendora-text"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              PROCUREMENT,
            </motion.div>
            <motion.div
              className="text-vendora-amber"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              COMMANDED.
            </motion.div>
          </h1>

          {/* Divider */}
          <motion.div 
            className="flex items-center gap-4 my-8"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 1.1, duration: 0.6 }}
          >
            <div className="h-px flex-1 bg-vendora-amber/20"></div>
            <div className="w-2 h-2 rotate-45 bg-vendora-amber"></div>
            <div className="h-px flex-1 bg-vendora-amber/20"></div>
          </motion.div>

          {/* Tagline */}
          <motion.p 
            className="text-xl text-vendora-muted font-body italic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
          >
            "Where every purchase decision lives."
          </motion.p>
        </motion.div>
      </div>

      {/* Right Half - Login Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-12 bg-vendora-surface">
        <motion.div 
          className="w-full max-w-2xl"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Role Selector */}
          <div className="mb-12">
            <h2 className="text-sm font-body text-vendora-muted uppercase tracking-widest mb-6">
              SELECT YOUR ROLE
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              {roles.map((role, index) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.id;
                
                return (
                  <motion.button
                    key={role.id}
                    onClick={() => handleRoleSelect(role)}
                    className={`
                      relative p-6 rounded-vendora text-left transition-all duration-300
                      border-2 group
                      ${isSelected 
                        ? 'border-vendora-amber bg-vendora-amber/5' 
                        : 'border-white/10 bg-vendora-nested hover:border-vendora-amber/50'
                      }
                    `}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon 
                      className={`w-10 h-10 mb-4 transition-colors ${
                        isSelected ? 'text-vendora-amber' : 'text-vendora-muted group-hover:text-vendora-amber'
                      }`} 
                    />
                    <h3 className="font-display text-lg mb-2 text-vendora-text">
                      {role.title}
                    </h3>
                    <p className="text-sm text-vendora-muted">
                      {role.description}
                    </p>
                    
                    {isSelected && (
                      <motion.div 
                        className="absolute top-3 right-3"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        <div className="w-6 h-6 rounded-full bg-vendora-amber flex items-center justify-center">
                          <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Login Form */}
          <motion.form 
            onSubmit={handleLogin}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-sm font-body text-vendora-muted uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-vendora w-full"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-body text-vendora-muted uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-vendora w-full pr-12"
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-vendora-muted hover:text-vendora-amber transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-3 group">
              ENTER VENDORA
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.form>

          {/* Demo Credentials */}
          <motion.div 
            className="mt-8 p-6 rounded-vendora bg-vendora-nested border border-white/5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p className="text-xs text-vendora-muted uppercase tracking-wider mb-3 font-body">
              Demo Credentials
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm font-mono">
              {HARDCODED_USERS.map((user) => (
                <div key={user.id} className="text-vendora-text/70">
                  ▸ {user.email}
                </div>
              ))}
            </div>
            <p className="text-sm font-mono text-vendora-amber mt-3">
              password: demo123
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
