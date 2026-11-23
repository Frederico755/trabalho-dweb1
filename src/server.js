require("dotenv").config();
const express = require("express");
const cors = require("cors");

const auth = require("./middlewares/auth");
const authRoutes = require("./routes/auth.routes");
const jogosRoutes = require("./routes/jogos.routes");
const plataformasRoutes = require("./routes/plataformas.routes");
const categoriasRoutes = require("./routes/categorias.routes");

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET não encontrada no .env");
  process.exit(1);
}

const app = express();

app.use(cors());
app.use(express.json());

// Rotas públicas (a rota /auth/me aplica o middleware dentro do próprio arquivo)
app.use("/auth", authRoutes);

// Rotas protegidas (exigem Authorization: Bearer <token>)
app.use("/jogos", auth, jogosRoutes);
app.use("/plataformas", auth, plataformasRoutes);
app.use("/categorias", auth, categoriasRoutes);

// Rota não encontrada
app.use((req, res) => {
  res.status(404).json({ message: "Rota não encontrada" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
