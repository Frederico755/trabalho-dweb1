const express = require("express");
const prisma = require("../prisma");

const router = express.Router();

// GET /categorias - lista as categorias do usuário logado
router.get("/", async (req, res) => {
  try {
    const categorias = await prisma.categoria.findMany({
      where: { userId: req.userId },
    });
    return res.status(200).json(categorias);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao listar categorias" });
  }
});

// GET /categorias/:id - busca uma categoria
router.get("/:id", async (req, res) => {
  try {
    const categoria = await prisma.categoria.findUnique({
      where: { id: req.params.id },
    });

    if (!categoria) {
      return res.status(404).json({ message: "Categoria não encontrada" });
    }
    if (categoria.userId !== req.userId) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    return res.status(200).json(categoria);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao buscar categoria" });
  }
});

// POST /categorias - cria categoria vinculada ao usuário logado
router.post("/", async (req, res) => {
  try {
    const { nome } = req.body;

    if (!nome) {
      return res.status(400).json({ message: "nome é obrigatório" });
    }

    const categoria = await prisma.categoria.create({
      data: { nome, userId: req.userId },
    });
    return res.status(201).json(categoria);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao criar categoria" });
  }
});

// PUT /categorias/:id - atualiza categoria
router.put("/:id", async (req, res) => {
  try {
    const { nome } = req.body;

    if (!nome) {
      return res.status(400).json({ message: "nome é obrigatório" });
    }

    const categoria = await prisma.categoria.findUnique({
      where: { id: req.params.id },
    });
    if (!categoria) {
      return res.status(404).json({ message: "Categoria não encontrada" });
    }
    if (categoria.userId !== req.userId) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    const atualizada = await prisma.categoria.update({
      where: { id: req.params.id },
      data: { nome },
    });
    return res.status(200).json(atualizada);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao atualizar categoria" });
  }
});

// DELETE /categorias/:id - remove categoria (os jogos ficam sem categoria)
router.delete("/:id", async (req, res) => {
  try {
    const categoria = await prisma.categoria.findUnique({
      where: { id: req.params.id },
    });
    if (!categoria) {
      return res.status(404).json({ message: "Categoria não encontrada" });
    }
    if (categoria.userId !== req.userId) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    await prisma.categoria.delete({ where: { id: req.params.id } });
    return res.status(200).json({ message: "Categoria removida com sucesso" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao remover categoria" });
  }
});

module.exports = router;
