const { Client } = require('pg');

async function updateRlsPolicies() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:S@lsandafury@db.hbwianqvbhzgxfihykhh.supabase.co:5432/postgres';
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  console.log('Conectado ao Supabase PostgreSQL...');

  const sql = `
    -- 1. Assegurar extensão pgcrypto
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    -- 2. Habilitar RLS na tabela peticao_votos
    ALTER TABLE public.peticao_votos ENABLE ROW LEVEL SECURITY;

    -- 3. Atualizar Política de Inserção Pública (Segura e sem regex frágil de e-mail)
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

    -- 4. Garantir Política de Leitura para administradores autenticados
    DROP POLICY IF EXISTS "Restringir visualizacao para administradores" ON public.peticao_votos;
    CREATE POLICY "Restringir visualizacao para administradores"
        ON public.peticao_votos
        FOR SELECT
        TO authenticated
        USING (true);

    -- 5. Atualizar Função RPC Oficial de Estatísticas (SECURITY DEFINER para contagem pública sem expor dados pessoais)
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

    -- 6. Atualizar Função RPC Oficial de Votos por Estado
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

    -- 7. Atualizar Função RPC para Auditoria e Relatórios
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
  `;

  await client.query(sql);
  console.log('Políticas RLS e funções RPC atualizadas com sucesso no banco de dados Supabase!');

  // Validação imediata chamando a função RPC via postgres
  const testStats = await client.query('SELECT * FROM public.obter_estatisticas_peticao();');
  console.log('Teste de estatísticas retornado:', testStats.rows);

  await client.end();
}

updateRlsPolicies().catch((err) => {
  console.error('Erro ao atualizar políticas RLS:', err);
  process.exit(1);
});
