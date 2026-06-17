/**
 * PriceTag — Displays a market price with trend arrow indicator.
 * Usage: <PriceTag price={2450} unit="per quintal" trend="up" change="+120" />
 */
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const trendConfig = {
  up: {
    icon: TrendingUp,
    color: 'text-krushi-success',
    bg: 'bg-krushi-success-light',
    label: '▲',
  },
  down: {
    icon: TrendingDown,
    color: 'text-krushi-danger',
    bg: 'bg-krushi-danger-light',
    label: '▼',
  },
  stable: {
    icon: Minus,
    color: 'text-krushi-muted',
    bg: 'bg-gray-100',
    label: '—',
  },
};

export default function PriceTag({
  price,
  unit = 'per quintal',
  trend = 'stable',
  change,
  currency = '₹',
  size = 'md',
}) {
  const t = trendConfig[trend] || trendConfig.stable;
  const TrendIcon = t.icon;

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div className="flex items-end gap-2">
      {/* Price */}
      <div className={`price-display ${sizeClasses[size] || sizeClasses.md}`}>
        <span className="text-krushi-muted text-sm font-normal mr-0.5">{currency}</span>
        {typeof price === 'number' ? price.toLocaleString('en-IN') : price}
      </div>

      {/* Unit */}
      <span className="text-xs text-krushi-muted mb-1">/{unit}</span>

      {/* Trend indicator */}
      {change && (
        <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-xs font-medium ${t.bg} ${t.color} ml-1 mb-1`}>
          <TrendIcon size={12} />
          {change}
        </span>
      )}
    </div>
  );
}
