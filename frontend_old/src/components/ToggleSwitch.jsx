/**
 * ToggleSwitch — iOS-style toggle with label.
 */

export default function ToggleSwitch({ label, sublabel, checked, onChange, icon, id }) {
  return (
    <label
      htmlFor={id}
      className="flex items-center justify-between gap-3 py-3 cursor-pointer group"
    >
      <div className="flex items-center gap-3">
        {icon && (
          <span className="text-lg w-6 text-center">{icon}</span>
        )}
        <div>
          <span className="text-sm font-medium text-krushi-text group-hover:text-krushi-green transition-colors">
            {label}
          </span>
          {sublabel && (
            <p className="text-xs text-krushi-muted mt-0.5">{sublabel}</p>
          )}
        </div>
      </div>

      {/* Toggle */}
      <div className="relative shrink-0">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-krushi-green 
                        transition-colors duration-200" />
        <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm
                        transition-transform duration-200 peer-checked:translate-x-5" />
      </div>
    </label>
  );
}
