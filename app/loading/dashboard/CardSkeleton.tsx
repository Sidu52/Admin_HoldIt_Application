
const CardSkeleton = () => {
    return (
        <div className="grid grid-cols-4 gap-3 rounded-xl  border border-slate-200 dark:border-slate-800 shadow-sm animate-pulse">
            {/* Stats Grid */}

            {/* Each stat block */}
            <div className="bg-white dark:bg-[#1e293b] p-5">
                <div className="flex items-center justify-between mb-1">
                    <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                </div>
                <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded mb-1"></div>
                <div className="h-6 w-14 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>

            <div className="bg-white dark:bg-[#1e293b] p-5">
                <div className="flex items-center justify-between mb-1">
                    <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                </div>
                <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded mb-1"></div>
                <div className="h-6 w-14 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>

            <div className="bg-white dark:bg-[#1e293b] p-5">
                <div className="flex items-center justify-between mb-1">
                    <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                </div>
                <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded mb-1"></div>
                <div className="h-6 w-14 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>

            <div className="bg-white dark:bg-[#1e293b] p-5">
                <div className="flex items-center justify-between mb-1">
                    <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                </div>
                <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded mb-1"></div>
                <div className="h-6 w-14 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
        </div>

    );
};

export default CardSkeleton;
