// Toggle.tsx — Reusable toggle component

import { useState } from "react";

export interface ToggleProps {
  /** Initial checked state */
  defaultChecked?: boolean;
  /** Controlled checked state */
  checked?: boolean;
  /** Called when toggle changes; receives new boolean value */
  onChange?: (checked: boolean) => void;
  /** Label shown when ON */
  labelOn?: string;
  /** Label shown when OFF */
  labelOff?: string;
  /** Disables interaction */
  disabled?: boolean;
  /** Extra classes for the wrapper div */
  className?: string;
}

export default function Toggle({
  defaultChecked = false,
  checked,
  onChange,
  labelOn = "Online",
  labelOff = "Offline",
  disabled = false,
  className = "",
}: ToggleProps) {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);

  // Support both controlled and uncontrolled usage
  const isOn = checked !== undefined ? checked : internalChecked;

  const handleToggle = () => {
    if (disabled) return;
    const next = !isOn;
    if (checked === undefined) setInternalChecked(next); // uncontrolled
    onChange?.(next);
  };

  return (
    <div
      className={`inline-flex items-center gap-3 select-none ${className}`}
      aria-label="Toggle switch"
    >
      {/* Track */}
      <button
        type="button"
        role="switch"
        aria-checked={isOn}
        disabled={disabled}
        onClick={handleToggle}
        className={`
          relative inline-flex h-7 w-14 shrink-0 cursor-pointer items-center
          rounded-full border-2 border-transparent transition-colors duration-300
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
          ${isOn
            ? "bg-emerald-500 focus-visible:ring-emerald-500"
            : "bg-slate-300 focus-visible:ring-slate-400"
          }
          ${disabled ? "cursor-not-allowed opacity-50" : ""}
        `}
      >
        {/* Thumb */}
        <span
          className={`
            pointer-events-none inline-block h-5 w-5 transform rounded-full
            bg-white shadow-md ring-0 transition-transform duration-300
            ${isOn ? "translate-x-7" : "translate-x-0"}
          `}
        />
      </button>

      {/* Label */}
      <span
        className={`
          text-sm font-semibold tracking-wide transition-colors duration-300
          ${isOn ? "text-emerald-600" : "text-slate-400"}
          ${disabled ? "opacity-50" : ""}
        `}
      >
        {isOn ? labelOn : labelOff}
      </span>
    </div>
  );
}