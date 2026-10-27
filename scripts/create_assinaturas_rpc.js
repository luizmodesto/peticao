const { Client } = require('pg');

async function main() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:S@lsandafury@db.hbwianqvbhzgxfihykhh.supabase.co:5432/postgres';
  const client = new Client(connectionString);
  await client.connect();

  const sql = `
    DROP FUNCTION IF EXISTS public.obter_assinaturas_peticao(varchar);

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

    GRANT EXECUTE ON FUNCTION public.obter_assinaturas_peticao(varchar) TO anon, authenticated;
  `;

  await client.query(sql);
  console.log('RPC public.obter_assinaturas_peticao updated with municipio!');

  const testAll = await client.query('SELECT * FROM public.obter_assinaturas_peticao() LIMIT 1;');
  console.log('Test call returned sample row:', testAll.rows[0]);

  await client.end();
}

main().catch(console.error);
