-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jogos" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "anoLancamento" INTEGER,
    "userId" TEXT NOT NULL,
    "categoriaId" TEXT,

    CONSTRAINT "jogos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plataformas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "plataformas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jogos_plataformas" (
    "jogoId" TEXT NOT NULL,
    "plataformaId" TEXT NOT NULL,
    "horasJogadas" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "jogos_plataformas_pkey" PRIMARY KEY ("jogoId","plataformaId")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- AddForeignKey
ALTER TABLE "categorias" ADD CONSTRAINT "categorias_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jogos" ADD CONSTRAINT "jogos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jogos" ADD CONSTRAINT "jogos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plataformas" ADD CONSTRAINT "plataformas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jogos_plataformas" ADD CONSTRAINT "jogos_plataformas_jogoId_fkey" FOREIGN KEY ("jogoId") REFERENCES "jogos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jogos_plataformas" ADD CONSTRAINT "jogos_plataformas_plataformaId_fkey" FOREIGN KEY ("plataformaId") REFERENCES "plataformas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
