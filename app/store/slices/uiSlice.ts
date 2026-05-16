import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

interface UIState {
  sidebarOpen: boolean;
  activeModal: string | null;
  toasts: ToastMessage[];
}

const initialState: UIState = {
  sidebarOpen: true,
  activeModal: null,
  toasts: [],
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    openModal(state, action: PayloadAction<string>) {
      state.activeModal = action.payload;
    },
    closeModal(state) {
      state.activeModal = null;
    },
    addToast(state, action: PayloadAction<Omit<ToastMessage, "id">>) {
      state.toasts.push({ ...action.payload, id: Math.random().toString(36).substring(2, 9) });
    },
    removeToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const { toggleSidebar, openModal, closeModal, addToast, removeToast } = uiSlice.actions;
export default uiSlice.reducer;
