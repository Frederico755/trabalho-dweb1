const express = require("express");
const prisma = require("../prisma");

const router = express.Router();

// GET /jogos - lista os jogos do usuário logado
router.get("/", async (req, res) => {
  try {
    const jogos = await prisma.jogo.findMany({
      where: { userId: req.userId },
      include: { categoria: true },
    });
    return res.status(200).json(jogos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao listar jogos" });
  }
});

// GET /jogos/:id - busca um jogo
router.get("/:id", async (req, res) => {
  try {
    const jogo = await prisma.jogo.findUnique({
      where: { id: req.params.id },
      include: { categoria: true },
    });

    if (!jogo) {
      return res.status(404).json({ message: "Jogo não encontrado" });
    }
    if (jogo.userId !== req.userId) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    return res.status(200).json(jogo);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao buscar jogo" });
  }
});

// POST /jogos - cria jogo vinculado ao usuário logado
router.post("/", async (req, res) => {
  try {
    const { titulo, descricao, anoLancamento, categoriaId } = req.body;

    if (!titulo) {
      return res.status(400).json({ message: "titulo é obrigatório" });
    }

    // se informou categoria, ela precisa existir e ser do usuário
    if (categoriaId) {
      const categoria = await prisma.categoria.findUnique({
        where: { id: categoriaId },
      });
      if (!categoria || categoria.userId !== req.userId) {
        return res.status(400).json({ message: "Categoria inválida" });
      }
    }

    const jogo = await prisma.jogo.create({
      data: {
        titulo,
        descricao,
        anoLancamento,
        categoriaId,
        userId: req.userId,
      },
    });
    return res.status(201).json(jogo);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao criar jogo" });
  }
});

// PUT /jogos/:id - atualiza jogo
router.put("/:id", async (req, res) => {
  try {
    const { titulo, descricao, anoLancamento, categoriaId } = req.body;

    if (!titulo) {
      return res.status(400).json({ message: "titulo é obrigatório" });
    }

    const jogo = await prisma.jogo.findUnique({ where: { id: req.params.id } });
    if (!jogo) {
      return res.status(404).json({ message: "Jogo não encontrado" });
    }
    if (jogo.userId !== req.userId) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    if (categoriaId) {
      const categoria = await prisma.categoria.findUnique({
        where: { id: categoriaId },
      });
      if (!categoria || categoria.userId !== req.userId) {
        return res.status(400).json({ message: "Categoria inválida" });
      }
    }

    const atualizado = await prisma.jogo.update({
      where: { id: req.params.id },
      data: { titulo, descricao, anoLancamento, categoriaId },
    });
    return res.status(200).json(atualizado);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao atualizar jogo" });
  }
});

// DELETE /jogos/:id - remove jogo (e as associações dele)
router.delete("/:id", async (req, res) => {
  try {
    const jogo = await prisma.jogo.findUnique({ where: { id: req.params.id } });
    if (!jogo) {
      return res.status(404).json({ message: "Jogo não encontrado" });
    }
    if (jogo.userId !== req.userId) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    await prisma.jogo.delete({ where: { id: req.params.id } });
    return res.status(200).json({ message: "Jogo removido com sucesso" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao remover jogo" });
  }
});

// ---------- N:N (Jogo <-> Plataforma) ----------

// POST /jogos/:id/plataformas/:plataformaId - associa o jogo a uma plataforma
router.post("/:id/plataformas/:plataformaId", async (req, res) => {
  try {
    const { id, plataformaId } = req.params;
    const horasJogadas = req.body.horasJogadas; // campo extra (opcional)

    const jogo = await prisma.jogo.findUnique({ where: { id } });
    if (!jogo) {
      return res.status(404).json({ message: "Jogo não encontrado" });
    }
    if (jogo.userId !== req.userId) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    const plataforma = await prisma.plataforma.findUnique({
      where: { id: plataformaId },
    });
    if (!plataforma) {
      return res.status(404).json({ message: "Plataforma não encontrada" });
    }
    if (plataforma.userId !== req.userId) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    // já associados? -> 409
    const jaExiste = await prisma.jogoPlataforma.findUnique({
      where: { jogoId_plataformaId: { jogoId: id, plataformaId } },
    });
    if (jaExiste) {
      return res.status(409).json({ message: "Jogo já associado a esta plataforma" });
    }

    const associacao = await prisma.jogoPlataforma.create({
      data: { jogoId: id, plataformaId, horasJogadas },
    });
    return res.status(201).json(associacao);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao associar jogo e plataforma" });
  }
});

// GET /jogos/:id/plataformas - lista todas as plataformas de um jogo
router.get("/:id/plataformas", async (req, res) => {
  try {
    const jogo = await prisma.jogo.findUnique({ where: { id: req.params.id } });
    if (!jogo) {
      return res.status(404).json({ message: "Jogo não encontrado" });
    }
    if (jogo.userId !== req.userId) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    const associacoes = await prisma.jogoPlataforma.findMany({
      where: { jogoId: req.params.id },
      include: { plataforma: true },
    });

    // devolve as plataformas junto com o campo extra da tabela pivô
    const plataformas = associacoes.map((a) => ({
      ...a.plataforma,
      horasJogadas: a.horasJogadas,
    }));
    return res.status(200).json(plataformas);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao listar plataformas do jogo" });
  }
});

// DELETE /jogos/:id/plataformas/:plataformaId - remove a associação
router.delete("/:id/plataformas/:plataformaId", async (req, res) => {
  try {
    const { id, plataformaId } = req.params;

    const jogo = await prisma.jogo.findUnique({ where: { id } });
    if (!jogo) {
      return res.status(404).json({ message: "Jogo não encontrado" });
    }
    if (jogo.userId !== req.userId) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    const associacao = await prisma.jogoPlataforma.findUnique({
      where: { jogoId_plataformaId: { jogoId: id, plataformaId } },
    });
    if (!associacao) {
      return res.status(404).json({ message: "Associação não encontrada" });
    }

    await prisma.jogoPlataforma.delete({
      where: { jogoId_plataformaId: { jogoId: id, plataformaId } },
    });
    return res.status(200).json({ message: "Associação removida com sucesso" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao remover associação" });
  }
});

module.exports = router;
