export const getPagination = (query) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export const sendPaginated = async (res, modelQuery, countQuery, options = {}) => {
  const { page, limit, skip } = options;
  const [items, total] = await Promise.all([
    modelQuery.skip(skip).limit(limit),
    countQuery
  ]);

  res.json({
    items,
    page,
    limit,
    total,
    pages: Math.max(Math.ceil(total / limit), 1)
  });
};
