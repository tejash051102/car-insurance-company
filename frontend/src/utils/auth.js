<<<<<<< HEAD
export const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem("userInfo") || "null");
  } catch {
    return null;
  }
};

export const isAdminUser = () => getCurrentUser()?.role === "admin";
=======
import { getAuthUser } from "./authStorage.js";

export const getCurrentUser = () => {
  return getAuthUser();
};

export const canManageRecords = () => {
  const role = getCurrentUser()?.role;
  return ["admin", "manager"].includes(role);
};
>>>>>>> 547d24a0daaff7d35c558dbe9c8c3e520c14045b
