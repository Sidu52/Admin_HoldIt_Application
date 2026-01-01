export default function UserHeader() {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          User Management
        </h1>
        <p className="text-slate-500 dark:text-[#92a4c9] text-base">
          Manage and view all registered users across the platform.
        </p>
      </div>
    </div>
  );
}
