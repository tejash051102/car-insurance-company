export const getItems = (data) => (Array.isArray(data) ? data : data?.items || []);

export const getMeta = (data) => ({
  page: data?.page || 1,
  pages: data?.pages || 1,
  total: data?.total ?? getItems(data).length
});
