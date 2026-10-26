import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validarTituloEleitorDetalhado, MENSAGEM_ERRO_TITULO } from '@/lib/validarTituloEleitor';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://hbwianqvbhzgxfihykhh.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_3W-JL4X6nyJS4kqn2IBgYg_ngSRit_f';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

export async function POST(request) {
  try {
    const body = await request.json();
    const { nome, tituloEleitor, estado, email, codigoVotado } = body || {};

    const nomeLimpo = String(nome || '').trim();
    const tituloLimpo = String(tituloEleitor || '').replace(/\D/g, '');
    const ufLimpa = String(estado || '').trim().toUpperCase();
    const emailLimpo = String(email || '').trim().toLowerCase();
    const codigo = String(codigoVotado || '').trim().toUpperCase();

    // 1. Validação do Nome
    if (!nomeLimpo || nomeLimpo.length < 3) {
      return NextResponse.json(
        { success: false, error: 'Por favor, informe seu nome completo (mínimo 3 caracteres).' },
        { status: 400 }
      );
    }

    // 2. Validação Oficial do TSE e Cruzamento de UF no Backend
    const validacaoTitulo = validarTituloEleitorDetalhado(tituloLimpo, ufLimpa);
    if (!validacaoTitulo.valido) {
      return NextResponse.json(
        {
          success: false,
          error: MENSAGEM_ERRO_TITULO,
          motivo: validacaoTitulo.motivo,
        },
        { status: 400 }
      );
    }

    // 3. Validação do E-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailLimpo)) {
      return NextResponse.json(
        { success: false, error: 'Por favor, informe um endereço de e-mail válido.' },
        { status: 400 }
      );
    }

    // 4. Inserção no Supabase (com proteção de chave única contra duplicidade)
    const { error } = await supabase.from('peticao_votos').insert([
      {
        nome: nomeLimpo,
        titulo_eleitor: tituloLimpo,
        estado: ufLimpa,
        email: emailLimpo,
        codigo_votado: codigo || '22',
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      // Código PostgreSQL 23505 = unique_violation (título já votou)
      if (error.code === '23505' || error.message?.includes('duplicate key') || error.message?.includes('unique')) {
        return NextResponse.json(
          {
            success: false,
            isDuplicate: true,
            error: 'Este título de eleitor já registrou apoio nesta petição.',
          },
          { status: 409 }
        );
      }

      console.error('[API /api/voto] Erro Supabase:', error);
      return NextResponse.json(
        { success: false, error: 'Erro ao registrar assinatura no banco de dados: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Assinatura registrada e auditada com sucesso!',
      titulo: tituloLimpo,
      estado: ufLimpa,
    });
  } catch (err) {
    console.error('[API /api/voto] Erro interno:', err);
    return NextResponse.json(
      { success: false, error: 'Erro interno ao processar validação do voto.' },
      { status: 500 }
    );
  }
}
