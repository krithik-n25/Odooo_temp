import { motion } from 'framer-motion';

const variants = {
  pending: {
    bg: 'bg-vendora-warning/10',
    text: 'text-vendora-warning',
    border: 'border-vendora-warning/30',
    dot: true
  },
  active: {
    bg: 'bg-vendora-success/10',
    text: 'text-vendora-success',
    border: 'border-vendora-success/30',
    dot: true
  },
  approved: {
    bg: 'bg-vendora-success/10',
    text: 'text-vendora-success',
    border: 'border-vendora-success/30',
    dot: false
  },
  rejected: {
    bg: 'bg-vendora-danger/10',
    text: 'text-vendora-danger',
    border: 'border-vendora-danger/30',
    dot: false
  },
  completed: {
    bg: 'bg-vendora-success/10',
    text: 'text-vendora-success',
    border: 'border-vendora-success/30',
    dot: false
  },
  draft: {
    bg: 'bg-vendora-muted/10',
    text: 'text-vendora-muted',
    border: 'border-vendora-muted/30',
    dot: false
  }
};

export default function StatusBadge({ status = 'draft', label }) {
  const variant = variants[status] || variants.draft;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded border ${variant.bg} ${variant.border}`}>
      {variant.dot && (
        <span className={`w-2 h-2 rounded-full ${variant.text.replace('text-', 'bg-')} animate-pulse-dot`}></span>
      )}
      <span className={`text-xs font-body uppercase tracking-wide ${variant.text}`}>
        {label || status}
      </span>
    </div>
  );
}
