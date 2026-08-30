export function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Resource not found' });
}

export function errorHandler(err, req, res, next) {
  if (err.message === 'Unsupported file type') {
    return res.status(400).json({ error: 'Unsupported file type' });
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large' });
  }

  console.error(err);
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
  res.status(status).json({ error: message });
}
