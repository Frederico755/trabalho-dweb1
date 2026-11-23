const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../prisma");
const auth = require("../middlewares/auth");

const router = express.Router();

// POST /auth/register - cadastra usuário
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "username, email e password são obrigatórios" });
    }

    // e-mail e username são únicos
    const jaExiste = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (jaExiste) {
      return res
        .status(409)
        .json({ message: "E-mail ou username já cadastrado" });
    }

    // senha sempre com hash (nunca em texto puro)
    const hash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { username, email, password: hash },
      select: { id: true, username: true, email: true }, // sem a senha
    });

    return res.status(201).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao cadastrar usuário" });
  }
});

// POST /auth/login - valida e-mail/senha e retorna o token JWT
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email e password são obrigatórios" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // mensagem genérica: não revela se errou o e-mail ou a senha
    const senhaOk = user && (await bcrypt.compare(password, user.password));
    if (!senhaOk) {
      return res.status(401).json({ message: "E-mail ou senha inválidos" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao fazer login" });
  }
});

// GET /auth/me - dados do usuário logado (protegida)
router.get("/me", auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, username: true, email: true }, // sem a senha
    });

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao buscar usuário" });
  }
});

module.exports = router;
