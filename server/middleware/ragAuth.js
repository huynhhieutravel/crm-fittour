const authRag = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ message: 'Missing Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  // Chống lộ secret mặc định (S03): Trên Production, bắt buộc phải có RAG_API_KEY riêng trong .env
  const isProd = process.env.NODE_ENV === 'production';
  const validKey = process.env.RAG_API_KEY || (!isProd ? 'fittour-rag-secret-token-2026' : null);

  if (!validKey) {
    return res.status(500).json({ message: 'RAG_API_KEY chưa được cấu hình an toàn trên môi trường Production' });
  }

  if (token !== validKey) {
    return res.status(401).json({ message: 'Invalid API Key' });
  }

  next();
};

module.exports = authRag;
