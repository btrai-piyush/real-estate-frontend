import { toast } from "react-toastify";

const ADMIN_TOAST_OPTIONS = {
  position: "top-right",
  autoClose: 30000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

export const showAdminSuccessToast = (message) =>
  toast.success(message, ADMIN_TOAST_OPTIONS);

export const showAdminErrorToast = (message) =>
  toast.error(message, ADMIN_TOAST_OPTIONS);

export const showAdminInfoToast = (message) =>
  toast.info(message, ADMIN_TOAST_OPTIONS);

export const showAdminWarningToast = (message) =>
  toast.warn(message, ADMIN_TOAST_OPTIONS);
