'use server';

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

/**
 * Server Action para validação dupla no Backend e registro de apoio
 */
export async function submeterApoioAction(dados) {
  const { nome, tituloEleitor, estado, email, codigoVotado } = dados || {};

  const nomeLimpo = String(nome || '').trim();
  const tituloLimpo = String(tituloEleitor || '').replace(/\D/g, '');
  const ufLimpa = String(estado || '').trim().toUpperCase();
  const emailLimpo = String(email || '').trim().toLowerCase();
  const codigo = String(codigoVotado || '').trim().toUpperCase();

  if (!nomeLimpo || nomeLimpo.length < 3) {
    return { success: false, error: 'Por favor, informe seu nome completo (mínimo 3 caracteres).' };
  }

  // Validação Estrita do TSE no Backend
  const validacaoTitulo = validarTituloEleitorDetalhado(tituloLimpo, ufLimpa);
  if (!validacaoTitulo.valido) {
    return {
      success: false,
      error: MENSAGEM_ERRO_TITULO,
      motivo: validacaoTitulo.motivo,
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailLimpo)) {
    return { success: false, error: 'Por favor, informe um endereço de e-mail válido.' };
  }

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
    if (error.code === '23505' || error.message?.includes('duplicate key') || error.message?.includes('unique')) {
      return {
        success: false,
        isDuplicate: true,
        error: 'Este título de eleitor já registrou apoio nesta petição.',
      };
    }
    return { success: false, error: 'Erro ao registrar assinatura: ' + error.message };
  }

  return { success: true, message: 'Assinatura registrada com sucesso!' };
}
