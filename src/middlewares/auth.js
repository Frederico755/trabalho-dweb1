const jwt = require("jsonwebtoken");

// Middleware que protege as rotas: exige "Authorization: Bearer <token>"
const auth = (req, res, next) => {
  // 1. Lê o cabeçalho Authorization
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  // 2. Sem token -> 401
  if (!token) {
    return res.status(401).json({ message: "Token não informado" });
  }

  try {
    // 3. Verifica o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5. Token válido: guarda o id do usuário e segue
    req.userId = decoded.id;
    next();
  } catch (error) {
    // 4. Token inválido ou expirado -> 401
    return res.status(401).json({ message: "Token inválido ou expirado" });
  }
};

module.exports = auth;
