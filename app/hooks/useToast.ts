import { useDispatch } from "react-redux";
import { addToast, removeToast, ToastMessage } from "../store/slices/uiSlice";

export const useToast = () => {
  const dispatch = useDispatch();

  const toast = {
    success: (message: string) => {
      dispatch(addToast({ type: "success", message }));
    },
    error: (message: string) => {
      dispatch(addToast({ type: "error", message }));
    },
    info: (message: string) => {
      dispatch(addToast({ type: "info", message }));
    },
    remove: (id: string) => {
      dispatch(removeToast(id));
    },
  };

  return toast;
};
