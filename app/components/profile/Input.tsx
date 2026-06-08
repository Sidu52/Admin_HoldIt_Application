
 const Input = ({
  label,
  disabled,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; disabled: boolean }) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-medium text-white/90">{label}</label>
    <input
      {...props}
      disabled={disabled}
      className={`w-full bg-surface-card rounded-lg text-white px-4 py-3 focus:ring-2 focus:ring-primary ${
        disabled ? "opacity-50" : ""
      }`}
    />
  </div>
);

export default Input;