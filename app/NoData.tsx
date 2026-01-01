import React from "react";

interface NoDataProps {
  title?: string;
  image?: string;
}

const NoData: React.FC<NoDataProps> = ({ title = "No Data Available", image }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
      {/* Optional Image */}
      {image && (
        <img src={image} alt="No data" className="w-32 h-32 object-contain mb-4" />
      )}

      {/* Title */}
      <p className="text-xl font-semibold text-slate-500 dark:text-slate-400">
        {title}
      </p>
    </div>
  );
};

export default NoData;
