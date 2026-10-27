import { NextResponse } from 'next/server';
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

export async function POST(request) {
  try {
    const rawBody = await request.json();
    
    // =======================================================================
    // LOG DE RASTREIO 1: Dados brutos recebidos do formulário
    // =======================================================================
    console.log('[Audit:1:RawInput] Dados brutos recebidos no servidor:', {
      nome: rawBody?.nome,
      tituloEleitor: rawBody?.tituloEleitor,
      estado: rawBody?.estado,
      municipio: rawBody?.municipio,
      email: rawBody?.email,
      codigoVotado: rawBody?.codigoVotado,
      timestamp: new Date().toISOString(),
    });

    const { nome, tituloEleitor, estado, municipio, email, codigoVotado } = rawBody || {};

    const nomeLimpo = String(nome || '').trim();
    const tituloLimpo = String(tituloEleitor || '').replace(/\D/g, '');
    const ufLimpa = String(estado || '').trim().toUpperCase();
    const municipioLimpo = String(municipio || '').trim();
    const emailLimpo = String(email || '').trim().toLowerCase();
    const codigo = String(codigoVotado || '').trim().toUpperCase();

    // 1. Validação do Nome
    if (!nomeLimpo || nomeLimpo.length < 3) {
      console.warn('[Audit:ValidationFail:Nome]', { nomeLimpo });
      return NextResponse.json(
        { success: false, error: 'Por favor, informe seu nome completo (mínimo 3 caracteres).' },
        { status: 400 }
      );
    }

    // 2. Validação Oficial do TSE e Cruzamento de UF no Backend
    const validacaoTitulo = validarTituloEleitorDetalhado(tituloLimpo, ufLimpa);
    if (!validacaoTitulo.valido) {
      console.warn('[Audit:ValidationFail:Titulo]', { tituloLimpo, ufLimpa, motivo: validacaoTitulo.motivo });
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
      console.warn('[Audit:ValidationFail:Email]', { emailLimpo });
      return NextResponse.json(
        { success: false, error: 'Por favor, informe um endereço de e-mail válido.' },
        { status: 400 }
      );
    }

    // =======================================================================
    // 4. Mapeamento estrito do Payload para a tabela public.peticao_votos:
    //    - nome (text)
    //    - titulo_eleitor (text, UNIQUE)
    //    - estado (varchar)
    //    - municipio (text)
    //    - email (text)
    //    - codigo_votado (text)
    // =======================================================================
    const payloadSupabase = {
      nome: nomeLimpo,
      titulo_eleitor: tituloLimpo,
      estado: ufLimpa,
      municipio: municipioLimpo || null,
      email: emailLimpo,
      codigo_votado: codigo || '22',
      created_at: new Date().toISOString(),
    };

    console.log('[Audit:2:SupabaseInsert:Payload]', payloadSupabase);

    // Inserção no Supabase com mapeamento estrito das 6 colunas.
    // NOTA DE AUDITORIA: Não encadear .select() pois a política de RLS pública
    // permite apenas INSERT para papéis anônimos (SELECT é restrito aos administradores).
    const { data: dbData, error: dbError } = await supabase
      .from('peticao_votos')
      .insert([payloadSupabase]);

    // =======================================================================
    // LOG DE RASTREIO 2: Resposta completa (data/error) retornada pelo Supabase
    // =======================================================================
    console.log('[Audit:2:SupabaseResponse] Resposta completa do Supabase após insert:', {
      data: dbData,
      error: dbError,
    });

    if (dbError) {
      // Código PostgreSQL 23505 = unique_violation (violação da restrição UNIQUE no Título)
      const isDuplicateKey =
        dbError.code === '23505' ||
        dbError.message?.includes('peticao_votos_titulo_eleitor_key') ||
        dbError.message?.toLowerCase().includes('duplicate key') ||
        dbError.message?.toLowerCase().includes('unique');

      if (isDuplicateKey) {
        console.warn('[Audit:DuplicateBlocked] Título de eleitor já existente no banco de dados:', tituloLimpo);
        return NextResponse.json(
          {
            success: false,
            isDuplicate: true,
            error: 'Este título de eleitor já registrou apoio nesta petição.',
          },
          { status: 409 }
        );
      }

      console.error('[Audit:SupabaseError] Erro ao inserir na tabela peticao_votos:', dbError);
      return NextResponse.json(
        { success: false, error: 'Erro ao registrar assinatura no banco de dados: ' + dbError.message },
        { status: 500 }
      );
    }

    // =======================================================================
    // 5. DISPARO DO E-MAIL: INVOCADO EXCLUSIVAMENTE APÓS SUCESSO NO SUPABASE
    //    Garante que nenhum e-mail seja disparado em caso de erro no banco.
    //    Injeta explicitamente a variável validada `emailLimpo` no campo `to`.
    // =======================================================================
    let emailResult = null;
    try {
      console.log('[Audit:3:EmailDispatch:Pre] Registro confirmado no banco. Invocando envio de e-mail para:', emailLimpo);
      
      emailResult = await enviarEmailConfirmacaoAssinatura({
        nome: nomeLimpo,
        email: emailLimpo,
        tituloEleitor: tituloLimpo,
        estado: ufLimpa,
        municipio: municipioLimpo,
        codigoVotado: codigo || '22',
      });

      // =====================================================================
      // LOG DE RASTREIO 3: Resposta do serviço de e-mail após a tentativa
      // =====================================================================
      console.log('[Audit:3:EmailDispatch:Post] Resposta completa do serviço de e-mail:', emailResult);
    } catch (emailException) {
      // Exceção de rede no provedor de e-mail não cancela o voto auditado
      console.error('[Audit:3:EmailDispatch:Exception] Falha não impeditiva no disparo do e-mail:', emailException);
      emailResult = { success: false, error: emailException.message };
    }

    return NextResponse.json({
      success: true,
      message: 'Assinatura registrada e auditada com sucesso!',
      id: dbData?.[0]?.id,
      titulo: tituloLimpo,
      estado: ufLimpa,
      municipio: municipioLimpo,
      emailEnviado: Boolean(emailResult?.success),
      emailDetalhes: emailResult,
    });

  } catch (err) {
    console.error('[Audit:FatalException] Erro interno crítico na API /api/voto:', err);
    return NextResponse.json(
      { success: false, error: 'Erro interno ao processar validação do voto.' },
      { status: 500 }
    );
  }
}
