const USER_KEY = "userInfo";
const CUSTOMER_KEY = "customerInfo";
const TOKEN_KEY = "token";
const TAB_PREFIX = "ims-tab:";

const createId = () =>
  crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const getTabId = () => {
  if (!window.name?.startsWith(TAB_PREFIX)) {
    window.name = `${TAB_PREFIX}${createId()}`;
  }

  return window.name.slice(TAB_PREFIX.length);
};

export const saveAuthUser = (userInfo) => {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.setItem(USER_KEY, JSON.stringify({ ...userInfo, authTabId: getTabId() }));
};

export const getAuthUser = () => {
  const rawUser = sessionStorage.getItem(USER_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    const user = JSON.parse(rawUser);

    if (user.authTabId !== getTabId()) {
      sessionStorage.removeItem(USER_KEY);
      return null;
    }

    return user;
  } catch {
    sessionStorage.removeItem(USER_KEY);
    return null;
  }
};

export const clearAuthUser = () => {
  sessionStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
};

export const saveCustomerUser = (customerInfo) => {
  sessionStorage.setItem(CUSTOMER_KEY, JSON.stringify({ ...customerInfo, authTabId: getTabId() }));
};

export const getCustomerUser = () => {
  const rawCustomer = sessionStorage.getItem(CUSTOMER_KEY);

  if (!rawCustomer) {
    return null;
  }

  try {
    const customer = JSON.parse(rawCustomer);

    if (customer.authTabId !== getTabId()) {
      sessionStorage.removeItem(CUSTOMER_KEY);
      return null;
    }

    return customer;
  } catch {
    sessionStorage.removeItem(CUSTOMER_KEY);
    return null;
  }
};

export const clearCustomerUser = () => {
  sessionStorage.removeItem(CUSTOMER_KEY);
};
