const { Client } = require('pg');

async function main() {
  const client = new Client('postgresql://postgres:S@lsandafury@db.hbwianqvbhzgxfihykhh.supabase.co:5432/postgres');
  await client.connect();

  const sql = `
    CREATE OR REPLACE FUNCTION public.obter_votos_por_estado()
    RETURNS TABLE (
        estado varchar,
        total bigint
    )
    LANGUAGE sql
    SECURITY DEFINER
    AS $$
        SELECT 
            estado,
            count(*)::bigint AS total
        FROM public.peticao_votos
        GROUP BY estado
        ORDER BY total DESC;
    $$;

    GRANT EXECUTE ON FUNCTION public.obter_votos_por_estado() TO anon, authenticated;
  `;

  await client.query(sql);
  console.log('Function public.obter_votos_por_estado() created successfully!');
  await client.end();
}

main().catch(console.error);
