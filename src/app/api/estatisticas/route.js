import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Desativa qualquer cache estático do Next.js
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://hbwianqvbhzgxfihykhh.supabase.co';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_3W-JL4X6nyJS4kqn2IBgYg_ngSRit_f';

const supabaseServer = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

export async function GET() {
  try {
    // 1. Tenta obter estatísticas oficiais via RPC (SECURITY DEFINER)
    const { data: statsData, error: statsError } = await supabaseServer.rpc('obter_estatisticas_peticao');

    if (!statsError && Array.isArray(statsData) && statsData.length > 0) {
      const total = Number(statsData[0].total_apoios || 0);
      const estados = Number(statsData[0].total_estados || 0);

      return NextResponse.json(
        {
          success: true,
          total,
          estados,
          fonte: 'rpc',
          timestamp: new Date().toISOString(),
        },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
            'Surrogate-Control': 'no-store',
          },
        }
      );
    }

    if (statsError) {
      console.warn('[API /api/estatisticas] RPC obter_estatisticas_peticao falhou:', statsError.message);
    }

    // 2. Fallback direto: count(*) na tabela peticao_votos via service_role ou anon
    const { count, error: countError } = await supabaseServer
      .from('peticao_votos')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('[API /api/estatisticas] Erro no select count fallback:', countError);
      return NextResponse.json(
        {
          success: false,
          total: 0,
          estados: 0,
          error: countError.message,
        },
        {
          status: 500,
          headers: {
            'Cache-Control': 'no-store, max-age=0',
          },
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        total: count || 0,
        estados: 0,
        fonte: 'select_count',
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Surrogate-Control': 'no-store',
        },
      }
    );
  } catch (err) {
    console.error('[API /api/estatisticas] Exceção crítica:', err);
    return NextResponse.json(
      {
        success: false,
        total: 0,
        error: err.message,
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  }
}
