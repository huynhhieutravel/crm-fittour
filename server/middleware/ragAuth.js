const authRag = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ message: 'Missing Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  // We use process.env.RAG_API_KEY. For local testing or if not set, fallback to a default secure string.
  // IMPORTANT: The user should define RAG_API_KEY in their .env file.
  const validKey = process.env.RAG_API_KEY || 'fittour-rag-secret-token-2026';

  if (token !== validKey) {
    return res.status(401).json({ message: 'Invalid API Key' });
  }

  next();
};

module.exports = authRag;
