import type { Urgency } from '../../data/articles';

const labels: Record<Urgency, string> = {
  breaking: 'Breaking',
  high: 'Trending',
  normal: '',
  low: 'Analysis',
};

const classes: Record<Urgency, string> = {
  breaking: 'urgency-breaking',
  high: 'urgency-high',
  normal: '',
  low: 'urgency-low',
};

export default function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  if (urgency === 'normal') return null;

  return (
    <span className={`inline-block ${classes[urgency]} text-xs font-semibold uppercase tracking-wider`}>
      {labels[urgency]}
    </span>
  );
}
