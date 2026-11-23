const express = require("express");
const prisma = require("../prisma");

const router = express.Router();

// GET /plataformas - lista as plataformas do usuário logado
router.get("/", async (req, res) => {
  try {
    const plataformas = await prisma.plataforma.findMany({
      where: { userId: req.userId },
    });
    return res.status(200).json(plataformas);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao listar plataformas" });
  }
});

// GET /plataformas/:id - busca uma plataforma
router.get("/:id", async (req, res) => {
  try {
    const plataforma = await prisma.plataforma.findUnique({
      where: { id: req.params.id },
    });

    if (!plataforma) {
      return res.status(404).json({ message: "Plataforma não encontrada" });
    }
    if (plataforma.userId !== req.userId) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    return res.status(200).json(plataforma);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao buscar plataforma" });
  }
});

// POST /plataformas - cria plataforma vinculada ao usuário logado
router.post("/", async (req, res) => {
  try {
    const { nome } = req.body;

    if (!nome) {
      return res.status(400).json({ message: "nome é obrigatório" });
    }

    const plataforma = await prisma.plataforma.create({
      data: { nome, userId: req.userId },
    });
    return res.status(201).json(plataforma);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao criar plataforma" });
  }
});

// PUT /plataformas/:id - atualiza plataforma
router.put("/:id", async (req, res) => {
  try {
    const { nome } = req.body;

    if (!nome) {
      return res.status(400).json({ message: "nome é obrigatório" });
    }

    const plataforma = await prisma.plataforma.findUnique({
      where: { id: req.params.id },
    });
    if (!plataforma) {
      return res.status(404).json({ message: "Plataforma não encontrada" });
    }
    if (plataforma.userId !== req.userId) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    const atualizada = await prisma.plataforma.update({
      where: { id: req.params.id },
      data: { nome },
    });
    return res.status(200).json(atualizada);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao atualizar plataforma" });
  }
});

// DELETE /plataformas/:id - remove plataforma (e as associações dela)
router.delete("/:id", async (req, res) => {
  try {
    const plataforma = await prisma.plataforma.findUnique({
      where: { id: req.params.id },
    });
    if (!plataforma) {
      return res.status(404).json({ message: "Plataforma não encontrada" });
    }
    if (plataforma.userId !== req.userId) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    await prisma.plataforma.delete({ where: { id: req.params.id } });
    return res.status(200).json({ message: "Plataforma removida com sucesso" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao remover plataforma" });
  }
});

// ---------- N:N ----------

// GET /plataformas/:id/jogos - lista todos os jogos de uma plataforma
router.get("/:id/jogos", async (req, res) => {
  try {
    const plataforma = await prisma.plataforma.findUnique({
      where: { id: req.params.id },
    });
    if (!plataforma) {
      return res.status(404).json({ message: "Plataforma não encontrada" });
    }
    if (plataforma.userId !== req.userId) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    const associacoes = await prisma.jogoPlataforma.findMany({
      where: { plataformaId: req.params.id },
      include: { jogo: true },
    });

    // devolve os jogos junto com o campo extra da tabela pivô
    const jogos = associacoes.map((a) => ({
      ...a.jogo,
      horasJogadas: a.horasJogadas,
    }));
    return res.status(200).json(jogos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao listar jogos da plataforma" });
  }
});

module.exports = router;
