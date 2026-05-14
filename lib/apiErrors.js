/**
 * Shared error handler for API routes
 * Standardizes error responses across the application
 */

export function handleApiError(req, res, error, statusCode = 500, message = 'Internal server error') {
  const isDevelopment = process.env.NODE_ENV === 'development';

  const response = {
    error: message,
    ...(isDevelopment && { details: error.message }),
  };

  return res.status(statusCode).json(response);
}

export function handleUnauthorized(res, message = 'Unauthorized') {
  return res.status(401).json({ error: message });
}

export function handleForbidden(res, message = 'Forbidden') {
  return res.status(403).json({ error: message });
}

export function handleNotFound(res, message = 'Not found') {
  return res.status(404).json({ error: message });
}

export function handleMethodNotAllowed(res, allowedMethods = []) {
  res.setHeader('Allow', allowedMethods);
  return res.status(405).json({ error: `Method not allowed. Allowed: ${allowedMethods.join(', ')}` });
}

export function handleValidationError(res, errors) {
  return res.status(400).json({
    error: 'Validation failed',
    details: errors,
  });
}
