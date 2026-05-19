import api from "../api/axios.js";

export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const downloadReport = async (url, filename) => {
  const response = await api.get(url, { responseType: "blob" });
  downloadBlob(response.data, filename);
};
