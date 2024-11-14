export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.errors
    });
  }

  if (err.type === 'auth') {
    return res.status(401).json({
      error: 'Authentication Error',
      message: err.message
    });
  }

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  });
};