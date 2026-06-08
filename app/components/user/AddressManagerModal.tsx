import { User, Address } from "@/app/types/user";
import { cn } from "@/app/utils/cn";
import React, { useState, useEffect, useMemo } from "react";
import {
  MdClose,
  MdLocationOn,
  MdEdit,
  MdDelete,
  MdAdd,
  MdCheck,
  MdSearch,
  MdHome,
  MdWork,
  MdPushPin,
  MdWarning,
} from "react-icons/md";
import AddressForm from "./AddAddrssForm"

interface AddressManagerModalProps {
  showModal: boolean;
  user: User;
  onClose: () => void;
  onAddAddress?: (userId: string, address: Omit<Address, "_id">) => Promise<void>;
  onUpdateAddress?: (userId: string, addressId: string, data: Partial<Address>) => Promise<void>;
  onDeleteAddress?: (userId: string, addressId: string) => Promise<void>;
  isLoading?: boolean;
  isAdmin?: boolean;
}

const EMPTY_FORM: Omit<Address, "_id"> = {
  type: "Home",
  street: "",
  city: "",
  state: "",
  postal_code: "",
  country: "",
  is_default: false,
};

// --- Delete Confirmation Modal ---
function DeleteConfirmModal({
  onConfirm,
  onCancel,
  isDeleting
}: {
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white dark:bg-[#1a2332] rounded-2xl p-6 shadow-2xl border border-gray-100 dark:border-gray-800">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600">
            <MdWarning size={28} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Address</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Are you sure you want to remove this address? This action cannot be undone.
            </p>
          </div>
          <div className="flex w-full gap-3 mt-2">
            <button
              onClick={onCancel}
              disabled={isDeleting}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {isDeleting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <MdDelete size={18} />}
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


// --- Main Modal Component ---
export default function AddressManagerModal({
  showModal,
  user,
  onClose,
  onAddAddress,
  onUpdateAddress,
  onDeleteAddress,
  isLoading = false,
  isAdmin = false,
}: AddressManagerModalProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  useEffect(() => {
    if (user.addresses) setAddresses(user.addresses);
  }, [user.addresses, showModal]);

  // Filtered addresses based on search
  const filteredAddresses = useMemo(() => {
    return addresses.filter(addr =>
      addr.street?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      addr.city?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [addresses, searchQuery]);

  const handleCloseAttempt = () => {
    if (hasUnsavedChanges) {
      setShowExitConfirm(true);
    } else {
      onClose();
    }
  };

  const handleAddSubmit = async (data: Partial<Address>) => {
    if (!onAddAddress) return;
    setIsSaving(true);
    try {
      await onAddAddress(user._id, data as Omit<Address, "_id">);
      setIsAdding(false);
      setHasUnsavedChanges(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditSubmit = async (data: Partial<Address>) => {
    if (!editingAddress?._id || !onUpdateAddress) return;
    setIsSaving(true);
    try {
      console.log("is_serviceable", data)
      await onUpdateAddress(user._id, editingAddress._id, data);
      setEditingAddress(null);
      setHasUnsavedChanges(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId || !onDeleteAddress) return;
    setIsSaving(true);
    try {
      await onDeleteAddress(user._id, confirmDeleteId);
      setConfirmDeleteId(null);
    } finally {
      setIsSaving(false);
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={cn(
        "w-full max-w-5xl h-full sm:h-[85vh] bg-white dark:bg-[#232f48] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col sm:flex-row relative",
        isLoading && "opacity-60 pointer-events-none"
      )}>
        {isLoading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/20 dark:bg-black/20 backdrop-blur-[1px]">
            <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
          </div>
        )}

        {/* Left Column: List */}
        <div className={cn(
          "w-full sm:w-[400px] border-r border-gray-100 dark:border-gray-800 flex flex-col h-full",
          (editingAddress || isAdding) && "hidden sm:flex"
        )}>
          {/* List Header */}
          <div className="p-6 pb-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">Addresses</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{addresses.length} saved locations</p>
              </div>
              <button
                onClick={handleCloseAttempt}
                className="p-2 -mr-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors sm:hidden"
              >
                <MdClose size={24} />
              </button>
            </div>

            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search addresses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 border-none text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 placeholder:text-gray-500 dark:placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto px-4 pb-6 custom-scrollbar">
            <div className="space-y-3">
              {filteredAddresses.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center text-gray-300 dark:text-gray-700 mb-4">
                    <MdLocationOn size={32} />
                  </div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No addresses found</p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="mt-2 text-xs font-bold text-blue-600 hover:underline"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              ) : (
                filteredAddresses.map((addr, idx) => (
                  <div
                    key={addr._id || idx}
                    className={cn(
                      "group p-4 rounded-2xl border-2 transition-all cursor-pointer relative",
                      addr.is_default
                        ? "border-blue-600 bg-blue-50/30 dark:bg-blue-900/10 shadow-sm"
                        : "border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-900/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "mt-1 w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                        addr.is_default ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-400 group-hover:text-blue-500"
                      )}>
                        {addr.type === "Office" ? <MdWork size={16} /> : <MdHome size={16} />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bold text-sm text-gray-900 dark:text-white truncate">
                            {addr.type || "Home"}
                          </span>
                          {addr.is_default && (
                            <span className="bg-blue-600 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded tracking-tighter">
                              DEFAULT
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug line-clamp-2">
                          {addr.street}, {addr.city}, {addr.state} {addr.postal_code}
                        </p>
                      </div>
                    </div>

                    {/* Admin Actions Overlay */}
                    {isAdmin && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingAddress(addr);
                            setIsAdding(false);
                            setHasUnsavedChanges(false);
                          }}
                          className="p-1.5 rounded-lg bg-white dark:bg-gray-700 shadow-md border border-gray-100 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:text-blue-600"
                        >
                          <MdEdit size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteId(addr._id || null);
                          }}
                          className="p-1.5 rounded-lg bg-white dark:bg-gray-700 shadow-md border border-gray-100 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:text-red-600"
                        >
                          <MdDelete size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* List Footer: Add Button */}
          {isAdmin && (
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/20">
              <button
                onClick={() => {
                  setIsAdding(true);
                  setEditingAddress(null);
                  setHasUnsavedChanges(false);
                }}
                className="w-full h-11 flex items-center justify-center gap-2 bg-gray-900 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-gray-200 dark:shadow-none"
              >
                <MdAdd size={20} />
                Add New Address
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Form / Placeholder */}
        <div className={cn(
          "flex-1 flex flex-col h-full bg-white dark:bg-[#1a2332] z-10",
          (!editingAddress && !isAdding) && "hidden sm:flex"
        )}>
          {/* Right Header (Close for desktop) */}
          <div className="hidden sm:flex items-center justify-end p-4 absolute top-0 right-0 z-20">
            <button
              onClick={handleCloseAttempt}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all"
            >
              <MdClose size={24} />
            </button>
          </div>

          {editingAddress ? (
            <AddressForm
              title="Edit Address"
              initial={editingAddress}
              onSubmit={handleEditSubmit}
              onCancel={() => { setEditingAddress(null); setHasUnsavedChanges(false); }}
              isSaving={isSaving}
              hasChanges={hasUnsavedChanges}
              setHasChanges={setHasUnsavedChanges}
            />
          ) : isAdding ? (
            <AddressForm
              title="Add New Address"
              initial={EMPTY_FORM}
              onSubmit={handleAddSubmit}
              onCancel={() => { setIsAdding(false); setHasUnsavedChanges(false); }}
              isSaving={isSaving}
              hasChanges={hasUnsavedChanges}
              setHasChanges={setHasUnsavedChanges}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-gray-50/50 dark:bg-[#1a2332]">
              <div className="w-24 h-24 rounded-full bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center text-blue-500 mb-6">
                <MdPushPin size={48} className="animate-bounce-slow" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Manage Your Deliveries</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xs mx-auto">
                {isAdmin
                  ? "Select an address from the list to edit its details or add a completely new one."
                  : "Choose which address you'd like to use as your default for all upcoming deliveries."}
              </p>
              {isAdmin && !isAdding && (
                <button
                  onClick={() => setIsAdding(true)}
                  className="mt-8 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-200 dark:shadow-none"
                >
                  Get Started
                </button>
              )}
            </div>
          )}
        </div>

        {/* Delete Confirmation */}
        {confirmDeleteId && (
          <DeleteConfirmModal
            isDeleting={isSaving}
            onCancel={() => setConfirmDeleteId(null)}
            onConfirm={handleDelete}
          />
        )}

        {/* Unsaved Changes Warning */}
        {showExitConfirm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-sm bg-white dark:bg-[#1a2332] rounded-2xl p-6 shadow-2xl">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 mx-auto mb-4">
                  <MdWarning size={28} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Unsaved Changes</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  You have unsaved changes in your form. Are you sure you want to exit?
                </p>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  Stay
                </button>
                <button
                  onClick={() => { setShowExitConfirm(false); setHasUnsavedChanges(false); onClose(); }}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gray-900 dark:bg-white dark:text-gray-900 text-white text-sm font-semibold"
                >
                  Discard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}