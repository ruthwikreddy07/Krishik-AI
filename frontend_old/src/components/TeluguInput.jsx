/**
 * TeluguInput — Form input that supports Telugu font rendering.
 * Usage: <TeluguInput label="పేరు" placeholder="మీ పేరు" telugu />
 */
import { useState } from 'react';

export default function TeluguInput({
  label,
  labelTelugu,
  placeholder,
  value,
  onChange,
  type = 'text',
  telugu = false,
  icon,
  error,
  disabled = false,
  id,
  name,
  readOnly = false,
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      {/* Label */}
      {(label || labelTelugu) && (
        <label
          htmlFor={id}
          className="flex items-center gap-2 text-sm font-medium text-krushi-text"
        >
          {label}
          {labelTelugu && (
            <span className="text-telugu text-xs text-krushi-muted">({labelTelugu})</span>
          )}
        </label>
      )}

      {/* Input wrapper */}
      <div
        className={`
          relative flex items-center gap-2 px-3 py-2.5 rounded-lg border
          transition-all duration-200
          ${focused
            ? 'border-krushi-green ring-2 ring-krushi-green/20'
            : error
              ? 'border-krushi-danger ring-2 ring-krushi-danger/20'
              : 'border-gray-200 hover:border-krushi-green-light'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'bg-krushi-card'}
        `}
      >
        {icon && (
          <span className="text-krushi-muted shrink-0">{icon}</span>
        )}

        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`
            flex-1 bg-transparent outline-none text-sm text-krushi-text
            placeholder:text-krushi-muted/50
            ${telugu ? 'font-telugu leading-[1.8]' : ''}
            ${readOnly ? 'cursor-default' : ''}
          `}
        />
      </div>

      {/* Error message */}
      {error && (
        <p className="text-xs text-krushi-danger flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}
