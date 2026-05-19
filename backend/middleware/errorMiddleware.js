export const notFound = (req, res, next) => {
  const error = new Error(`Not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 404;
    message = "Resource not found";
  }

  if (err.code === 11000) {
    statusCode = 400;
    const duplicatedField = Object.keys(err.keyValue || {})[0] || "field";
    message = `${duplicatedField} already exists`;
  }

  if (process.env.NODE_ENV !== "test") {
    console.error(err.stack || err.message);
  }

  res.status(statusCode).json({ message });
};
