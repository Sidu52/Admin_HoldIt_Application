
export const PasswordInput = ({ label, disabled }: { label: string; disabled: boolean }) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-medium text-white/90">{label}</label>
    <input
      type="password"
      placeholder="••••••••"
      disabled={disabled}
      className={`w-full bg-surface-card rounded-lg text-white px-4 py-3 focus:ring-2 focus:ring-primary ${
        disabled ? "opacity-50" : ""
      }`}
    />
  </div>
);
export default PasswordInput;