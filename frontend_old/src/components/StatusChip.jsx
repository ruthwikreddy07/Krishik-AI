/**
 * StatusChip — Color-coded status indicator chip.
 * Usage: <StatusChip label="Active" variant="success" />
 */

const variants = {
  success: {
    bg: 'bg-krushi-success-light',
    text: 'text-krushi-success',
    dot: 'bg-krushi-success',
  },
  warning: {
    bg: 'bg-krushi-amber-light',
    text: 'text-krushi-amber',
    dot: 'bg-krushi-amber',
  },
  danger: {
    bg: 'bg-krushi-danger-light',
    text: 'text-krushi-danger',
    dot: 'bg-krushi-danger',
  },
  info: {
    bg: 'bg-krushi-sky-light',
    text: 'text-krushi-sky',
    dot: 'bg-krushi-sky',
  },
  neutral: {
    bg: 'bg-gray-100',
    text: 'text-krushi-muted',
    dot: 'bg-krushi-muted',
  },
  primary: {
    bg: 'bg-krushi-green-pale',
    text: 'text-krushi-green',
    dot: 'bg-krushi-green',
  },
  earth: {
    bg: 'bg-krushi-earth-pale',
    text: 'text-krushi-earth',
    dot: 'bg-krushi-earth',
  },
};

export default function StatusChip({ label, variant = 'primary', icon, size = 'sm', pulseDot = false }) {
  const style = variants[variant] || variants.primary;
  const sizeClasses = size === 'lg' ? 'px-3 py-1.5 text-sm' : 'px-2 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${style.bg} ${style.text} ${sizeClasses}`}>
      {pulseDot && (
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${style.dot} opacity-75`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${style.dot}`} />
        </span>
      )}
      {!pulseDot && icon && <span>{icon}</span>}
      {label}
    </span>
  );
}
