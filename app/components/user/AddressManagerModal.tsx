"use client";

import { User, Address } from "@/app/types/user";
import React, { useState, useEffect } from "react";
import { MdClose, MdLocationOn } from "react-icons/md";

interface AddressManagerModalProps {
  showModal: boolean;
  user: User;
  onClose: () => void;
  handleUpdate: (addresses: Address[]) => void;
  isLoading?: boolean;
}

export default function AddressManagerModal({
  showModal,
  user,
  onClose,
  handleUpdate,
  isLoading
}: AddressManagerModalProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);

  useEffect(() => {
    if (user.addresses) {
      setAddresses(user.addresses);
    }
  }, [user.addresses, showModal]);

  const setAsDefault = (selectedId: string | undefined, index: number) => {
    const newAddresses = addresses.map((addr, idx) => ({
      ...addr,
      is_default: (addr._id && selectedId) ? addr._id === selectedId : idx === index
    }));
    handleUpdate(newAddresses);
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white dark:bg-[#232f48] rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e7eb] dark:border-[#324467]">
          <div>
            <h2 className="text-xl font-bold text-[#111418] dark:text-white">Manage Addresses</h2>
            <p className="text-sm text-[#637588] dark:text-[#92a4c9]">Select your default delivery address</p>
          </div>
          <button onClick={onClose} className="p-2 text-[#637588] hover:text-[#111418] dark:text-[#92a4c9] dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-[#324467]">
            <MdClose size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 flex flex-col gap-4">
          {addresses.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center text-center">
               <MdLocationOn size={48} className="text-slate-300 dark:text-slate-600 mb-2" />
               <p className="text-[#637588] dark:text-[#92a4c9] font-medium">No addresses available</p>
            </div>
          ) : (
            addresses.map((addr, idx) => (
              <div 
                key={addr._id || idx} 
                className={`group relative p-4 rounded-xl border-2 transition-all ${
                  addr.is_default 
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 cursor-default' 
                    : 'border-[#e5e7eb] dark:border-[#324467] hover:border-blue-300 dark:hover:border-blue-700/50 cursor-pointer pointer-events-auto'
                } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
                onClick={() => !addr.is_default && !isLoading && setAsDefault(addr._id, idx)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-[#111418] dark:text-white text-sm">
                        Address {idx + 1}
                      </span>
                      {addr.is_default && (
                        <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-wider">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#637588] dark:text-[#92a4c9] leading-relaxed">
                      {addr.street}, {addr.city}, {addr.state} - {addr.postal_code}
                    </p>
                    <p className="text-sm text-[#637588] dark:text-[#92a4c9] leading-relaxed">
                      {addr.country}
                    </p>
                  </div>
                  
                  <div className="flex-shrink-0 pt-1">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      addr.is_default ? 'border-blue-500 bg-blue-500' : 'border-gray-300 dark:border-gray-600 group-hover:border-blue-400'
                    }`}>
                      {addr.is_default && <span className="w-2 h-2 bg-white rounded-full"></span>}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#e5e7eb] dark:border-[#324467] bg-gray-50 dark:bg-[#1a2332]">
           <button disabled={isLoading} onClick={onClose} className="w-full h-11 bg-white border border-[#e5e7eb] dark:bg-[#232f48] dark:border-[#324467] rounded-lg font-bold hover:bg-gray-50 dark:hover:bg-[#324467] transition-colors disabled:opacity-50">
             Close
           </button>
        </div>
      </div>
    </div>
  );
}
