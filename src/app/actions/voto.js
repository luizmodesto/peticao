'use server';

import { createClient } from '@supabase/supabase-js';
import { validarTituloEleitorDetalhado, MENSAGEM_ERRO_TITULO } from '@/lib/validarTituloEleitor';
import { enviarEmailConfirmacaoAssinatura } from '@/lib/emailService';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://hbwianqvbhzgxfihykhh.supabase.co';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_3W-JL4X6nyJS4kqn2IBgYg_ngSRit_f';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

/**
 * Server Action para validação dupla no Backend, inserção auditada e disparo de e-mail
 */
export async function submeterApoioAction(dados) {
  // =========================================================================
  // LOG DE RASTREIO 1: Dados brutos recebidos na Server Action
  // =========================================================================
  console.log('[ServerAction:1:RawInput] Dados brutos recebidos:', {
    nome: dados?.nome,
    tituloEleitor: dados?.tituloEleitor,
    estado: dados?.estado,
    municipio: dados?.municipio,
    email: dados?.email,
    codigoVotado: dados?.codigoVotado,
    timestamp: new Date().toISOString(),
  });

  const { nome, tituloEleitor, estado, municipio, email, codigoVotado } = dados || {};

  const nomeLimpo = String(nome || '').trim();
  const tituloLimpo = String(tituloEleitor || '').replace(/\D/g, '');
  const ufLimpa = String(estado || '').trim().toUpperCase();
  const municipioLimpo = String(municipio || '').trim();
  const emailLimpo = String(email || '').trim().toLowerCase();
  const codigo = String(codigoVotado || '').trim().toUpperCase();

  // 1. Validação do Nome
  if (!nomeLimpo || nomeLimpo.length < 3) {
    console.warn('[ServerAction:ValidationFail:Nome]', { nomeLimpo });
    return { success: false, error: 'Por favor, informe seu nome completo (mínimo 3 caracteres).' };
  }

  // 2. Validação Estrita do TSE no Backend
  const validacaoTitulo = validarTituloEleitorDetalhado(tituloLimpo, ufLimpa);
  if (!validacaoTitulo.valido) {
    console.warn('[ServerAction:ValidationFail:Titulo]', { tituloLimpo, ufLimpa, motivo: validacaoTitulo.motivo });
    return {
      success: false,
      error: MENSAGEM_ERRO_TITULO,
      motivo: validacaoTitulo.motivo,
    };
  }

  // 3. Validação do E-mail
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailLimpo)) {
    console.warn('[ServerAction:ValidationFail:Email]', { emailLimpo });
    return { success: false, error: 'Por favor, informe um endereço de e-mail válido.' };
  }

  // =========================================================================
  // 4. Mapeamento estrito do Payload para a tabela public.peticao_votos:
  //    nome, titulo_eleitor, estado, municipio, email, codigo_votado
  // =========================================================================
  const payloadSupabase = {
    nome: nomeLimpo,
    titulo_eleitor: tituloLimpo,
    estado: ufLimpa,
    municipio: municipioLimpo || null,
    email: emailLimpo,
    codigo_votado: codigo || '22',
    created_at: new Date().toISOString(),
  };

  console.log('[ServerAction:2:SupabaseInsert:Payload]', payloadSupabase);

  // Inserção com mapeamento estrito das 6 colunas (sem .select para compatibilidade RLS)
  const { data: dbData, error: dbError } = await supabase
    .from('peticao_votos')
    .insert([payloadSupabase]);

  // =========================================================================
  // LOG DE RASTREIO 2: Resposta completa retornada pelo Supabase
  // =========================================================================
  console.log('[ServerAction:2:SupabaseResponse] Resposta do Supabase após insert:', {
    data: dbData,
    error: dbError,
  });

  if (dbError) {
    const isDuplicate =
      dbError.code === '23505' ||
      dbError.message?.includes('peticao_votos_titulo_eleitor_key') ||
      dbError.message?.toLowerCase().includes('duplicate key') ||
      dbError.message?.toLowerCase().includes('unique');

    if (isDuplicate) {
      console.warn('[ServerAction:DuplicateBlocked] Título já registrado:', tituloLimpo);
      return {
        success: false,
        isDuplicate: true,
        error: 'Este título de eleitor já registrou apoio nesta petição.',
      };
    }

    console.error('[ServerAction:SupabaseError] Falha no insert:', dbError);
    return { success: false, error: 'Erro ao registrar assinatura: ' + dbError.message };
  }

  // =========================================================================
  // 5. DISPARO DO E-MAIL: INVOCADO EXCLUSIVAMENTE APÓS SUCESSO NO SUPABASE
  // =========================================================================
  let emailResult = null;
  try {
    console.log('[ServerAction:3:EmailDispatch:Pre] Registro confirmado no banco. Invocando envio de e-mail para:', emailLimpo);
    
    emailResult = await enviarEmailConfirmacaoAssinatura({
      nome: nomeLimpo,
      email: emailLimpo,
      tituloEleitor: tituloLimpo,
      estado: ufLimpa,
      municipio: municipioLimpo,
      codigoVotado: codigo || '22',
    });

    // =======================================================================
    // LOG DE RASTREIO 3: Resposta do serviço de e-mail
    // =======================================================================
    console.log('[ServerAction:3:EmailDispatch:Post] Resposta do serviço de e-mail:', emailResult);
  } catch (emailErr) {
    console.error('[ServerAction:3:EmailDispatch:Exception] Falha não impeditiva no disparo do e-mail:', emailErr);
    emailResult = { success: false, error: emailErr.message };
  }

  return {
    success: true,
    message: 'Assinatura registrada e auditada com sucesso!',
    id: dbData?.[0]?.id,
    titulo: tituloLimpo,
    estado: ufLimpa,
    municipio: municipioLimpo,
    emailEnviado: Boolean(emailResult?.success),
    emailDetalhes: emailResult,
  };
}
