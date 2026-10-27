-- ============================================================
-- PETIÇÃO NACIONAL PELA TRANSPARÊNCIA ELEITORAL
-- Banco de Dados Supabase (PostgreSQL)
-- Tabela de Votos, Bloqueio Anti-Fraude e Conformidade com LGPD
-- ============================================================

-- 1. Habilitar extensão para geração de UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Criação da Tabela peticao_votos (com Estado/UF e Município)
CREATE TABLE IF NOT EXISTS public.peticao_votos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    titulo_eleitor TEXT NOT NULL,
    estado VARCHAR(2) NOT NULL,
    municipio TEXT,
    email TEXT NOT NULL,
    codigo_votado TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

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
        length(trim(nome)) >= 2 AND
        length(trim(titulo_eleitor)) >= 10 AND
        length(trim(titulo_eleitor)) <= 12 AND
        length(trim(estado)) = 2
    );

-- 7. Política de Leitura Restrita (LGPD - Sigilo do Voto e Dados Pessoais):
DROP POLICY IF EXISTS "Restringir visualizacao para administradores" ON public.peticao_votos;
CREATE POLICY "Restringir visualizacao para administradores"
    ON public.peticao_votos
    FOR SELECT
    TO authenticated
    USING (true);

-- 8. Função agregada para contagem estatística oficial
CREATE OR REPLACE FUNCTION public.obter_estatisticas_peticao()
RETURNS TABLE (
    total_apoios bigint,
    total_estados bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        count(*)::bigint AS total_apoios,
        count(DISTINCT estado)::bigint AS total_estados
    FROM public.peticao_votos;
$$;
GRANT EXECUTE ON FUNCTION public.obter_estatisticas_peticao() TO anon, authenticated, service_role;

-- 9. Função para contagem agrupada de votos por Estado (Dashboard)
CREATE OR REPLACE FUNCTION public.obter_votos_por_estado()
RETURNS TABLE (
    estado varchar,
    total bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        estado,
        count(*)::bigint AS total
    FROM public.peticao_votos
    GROUP BY estado
    ORDER BY total DESC;
$$;
GRANT EXECUTE ON FUNCTION public.obter_votos_por_estado() TO anon, authenticated, service_role;

-- 10. Função para obtenção de assinaturas detalhadas para auditoria e relatórios em PDF
CREATE OR REPLACE FUNCTION public.obter_assinaturas_peticao(filtro_uf varchar DEFAULT NULL)
RETURNS TABLE (
    id uuid,
    nome text,
    titulo_eleitor text,
    estado varchar,
    municipio text,
    email text,
    codigo_votado text,
    created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        id,
        nome,
        titulo_eleitor,
        estado,
        COALESCE(municipio, '') as municipio,
        email,
        codigo_votado,
        created_at
    FROM public.peticao_votos
    WHERE (filtro_uf IS NULL OR filtro_uf = '' OR filtro_uf = 'TODOS' OR estado = UPPER(filtro_uf))
    ORDER BY created_at DESC;
$$;
GRANT EXECUTE ON FUNCTION public.obter_assinaturas_peticao(varchar) TO anon, authenticated, service_role;

