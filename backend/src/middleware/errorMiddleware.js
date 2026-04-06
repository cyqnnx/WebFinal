export function errorMiddleware(err, req, res, next) {
 
  console.error(err);

  const status = err?.statusCode || err?.status || 500;
  const message = err?.message || 'Internal Server Error';

  return res.status(status).json({
    error: {
      message,
      ...(err?.details ? { details: err.details } : null),
    },
  });
}

