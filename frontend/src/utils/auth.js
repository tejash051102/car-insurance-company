import { getAuthUser } from "./authStorage.js";

export const getCurrentUser = () => {
  return getAuthUser();
};

export const canManageRecords = () => {
  const role = getCurrentUser()?.role;
  return ["admin", "manager"].includes(role);
};
