import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function KPICard({ label, value, subInfo, urgent, trend, delay = 0 }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (typeof value === 'number') {
      let start = 0;
      const duration = 2000;
      const increment = value / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= value) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(start));
        }
      }, 16);
      
      return () => clearInterval(timer);
    }
  }, [value]);

  return (
    <motion.div 
      className="card-vendora relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, delay }}
    >
      <div className="relative z-10">
        <p className="text-xs text-vendora-muted font-body uppercase tracking-widest mb-3">
          {label}
        </p>
        <div className="flex items-baseline gap-2 mb-2">
          <h3 className="text-3xl font-mono text-vendora-amber">
            {typeof value === 'number' ? displayValue : value}
          </h3>
          {trend === 'up' && <TrendingUp className="w-5 h-5 text-vendora-success" />}
          {trend === 'down' && <TrendingDown className="w-5 h-5 text-vendora-danger" />}
        </div>
        <p className={`text-sm font-body ${urgent ? 'text-vendora-warning' : 'text-vendora-muted'}`}>
          {subInfo}
        </p>
      </div>
      
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-vendora-nested">
        <motion.div 
          className="h-full bg-vendora-amber"
          initial={{ width: 0 }}
          animate={{ width: '65%' }}
          transition={{ duration: 1.5, delay: delay + 0.3 }}
        />
      </div>
    </motion.div>
  );
}
