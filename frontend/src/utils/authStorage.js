const USER_KEY = "userInfo";
const TOKEN_KEY = "token";
const TAB_PREFIX = "ims-tab:";

const createId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const getTabId = () => {
  try {
    if (!window.name?.startsWith(TAB_PREFIX)) {
      window.name = `${TAB_PREFIX}${createId()}`;
    }
    return window.name.slice(TAB_PREFIX.length);
  } catch {
    return "default-tab";
  }
};

export const saveAuthUser = (userInfo) => {
  try {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.setItem(USER_KEY, JSON.stringify({ ...userInfo, authTabId: getTabId() }));
  } catch (err) {
    console.warn("Failed to save auth user:", err);
  }
};

export const getAuthUser = () => {
  try {
    const rawUser = sessionStorage.getItem(USER_KEY);

    if (!rawUser) {
      return null;
    }

    const user = JSON.parse(rawUser);

    if (user.authTabId !== getTabId()) {
      sessionStorage.removeItem(USER_KEY);
      return null;
    }

    return user;
  } catch (err) {
    console.warn("Failed to get auth user:", err);
    sessionStorage.removeItem(USER_KEY);
    return null;
  }
};

export const clearAuthUser = () => {
  try {
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  } catch (err) {
    console.warn("Failed to clear auth user:", err);
  }
};
