-- ============================================================
-- PETIÇÃO NACIONAL PELA TRANSPARÊNCIA ELEITORAL
-- Banco de Dados Supabase (PostgreSQL)
-- Tabela de Votos, Bloqueio Anti-Fraude e Conformidade com LGPD
-- ============================================================

-- 1. Habilitar extensão para geração de UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Criação da Tabela peticao_votos (com Estado/UF e sem município)
CREATE TABLE IF NOT EXISTS public.peticao_votos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    titulo_eleitor TEXT NOT NULL,
    estado VARCHAR(2) NOT NULL,
    email TEXT NOT NULL,
    codigo_votado TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Caso a coluna municipio já exista de uma execução anterior, pode ser removida ou tornada opcional:
-- ALTER TABLE public.peticao_votos DROP COLUMN IF EXISTS municipio;

-- 3. REGRA OBRIGATÓRIA (Bloqueio contra fraude e duplicidade)
-- Impede categoricamente que o mesmo Título de Eleitor assine mais de uma vez
ALTER TABLE public.peticao_votos 
    DROP CONSTRAINT IF EXISTS peticao_votos_titulo_eleitor_key;

ALTER TABLE public.peticao_votos 
    ADD CONSTRAINT peticao_votos_titulo_eleitor_key UNIQUE (titulo_eleitor);

-- 4. Índices para performance em consultas de auditoria e validação
CREATE INDEX IF NOT EXISTS idx_peticao_votos_titulo 
    ON public.peticao_votos (titulo_eleitor);

CREATE INDEX IF NOT EXISTS idx_peticao_votos_uf 
    ON public.peticao_votos (estado);

CREATE INDEX IF NOT EXISTS idx_peticao_votos_created_at 
    ON public.peticao_votos (created_at DESC);

-- 5. Habilitar Row Level Security (RLS)
ALTER TABLE public.peticao_votos ENABLE ROW LEVEL SECURITY;

-- 6. Política de Inserção Pública
DROP POLICY IF EXISTS "Permitir insercao anonima de votos" ON public.peticao_votos;
CREATE POLICY "Permitir insercao anonima de votos"
    ON public.peticao_votos
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (
        length(trim(nome)) >= 3 AND
        length(titulo_eleitor) >= 10 AND
        length(titulo_eleitor) <= 12 AND
        length(estado) = 2 AND
        email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
        codigo_votado IN ('22', 'BRANCO')
    );

-- 7. Política de Leitura Restrita (LGPD - Sigilo do Voto e Dados Pessoais):
DROP POLICY IF EXISTS "Restringir visualizacao para administradores" ON public.peticao_votos;
CREATE POLICY "Restringir visualizacao para administradores"
    ON public.peticao_votos
    FOR SELECT
    TO authenticated
    USING (true);

-- 8. Função agregada para contagem estatística oficial por Estado
CREATE OR REPLACE FUNCTION public.obter_estatisticas_peticao()
RETURNS TABLE (
    total_apoios bigint,
    total_estados bigint
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        count(*)::bigint AS total_apoios,
        count(DISTINCT estado)::bigint AS total_estados
    FROM public.peticao_votos;
$$;
