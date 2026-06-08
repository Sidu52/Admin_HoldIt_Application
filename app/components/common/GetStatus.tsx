export const getStatusBadge = (account_status: string) => {
  const base = "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border transition-all duration-300";

  switch (account_status?.toLowerCase()) {
    case "active":
      return (
        <span className={`${base} bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.1)]`}>
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
        </span>
      );
    case "inactive":
      return (
        <span className={`${base} bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20`}>
          <span className="size-1.5 rounded-full bg-slate-500" /> Inactive
        </span>
      );
    case "pending":
      return (
        <span className={`${base} bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 shadow-[0_0_8px_rgba(59,130,246,0.1)]`}>
          <span className="size-1.5 rounded-full bg-blue-500" /> Pending
        </span>
      );
    case "blocked":
      return (
        <span className={`${base} bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 shadow-[0_0_8px_rgba(244,63,94,0.1)]`}>
          <span className="size-1.5 rounded-full bg-rose-500" /> Blocked
        </span>
      );
    default:
      return (
        <span className={`${base} bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20`}>
          {account_status}
        </span>
      );
  }
};