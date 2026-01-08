  export const getStatusBadge = (status: string) => {
    const base =
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border";

    switch (status.toLowerCase()) {
      case "active":
        return (
          <span
            className={`${base} bg-emerald-500/10 text-emerald-400 border-emerald-500/30`}
          >
            <span className="size-1.5 rounded-full bg-emerald-400" /> Active
          </span>
        );
      case "inactive":
        return (
          <span
            className={`${base} bg-slate-500/10 text-slate-400 border-slate-500/30`}
          >
            <span className="size-1.5 rounded-full bg-slate-400" /> Inactive
          </span>
        );
      case "pending":
        return (
          <span
            className={`${base} bg-amber-500/10 text-amber-400 border-amber-500/30`}
          >
            <span className="size-1.5 rounded-full bg-amber-400" /> Pending
          </span>
        );
      case "blocked":
        return (
          <span
            className={`${base} bg-red-500/10 text-red-400 border-red-500/30`}
          >
            <span className="size-1.5 rounded-full bg-red-400" /> Blocked
          </span>
        );
      default:
        return (
          <span
            className={`${base} bg-slate-500/10 text-slate-400 border-slate-500/30`}
          >
            {status}
          </span>
        );
    }
  };