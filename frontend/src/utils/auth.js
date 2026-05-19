export const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem("userInfo") || "null");
  } catch {
    return null;
  }
};

export const isAdminUser = () => getCurrentUser()?.role === "admin";
