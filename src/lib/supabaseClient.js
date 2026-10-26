import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    !supabaseUrl.includes('exemplo-peticao') &&
    !supabaseUrl.includes('seu-projeto')
  );
};

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  { auth: { persistSession: false } }
);

/**
 * Registra o apoio eletrônico na petição pública via Supabase
 * 
 * @param {Object} params
 * @param {string} params.nome
 * @param {string} params.tituloEleitor
 * @param {string} params.estado
 * @param {string} params.email
 * @param {string} params.codigoVotado
 * @returns {Promise<{ success: boolean, data?: any, error?: string, isDuplicate?: boolean }>}
 */
export async function registrarApoioPeticao({
  nome,
  tituloEleitor,
  estado,
  email,
  codigoVotado,
}) {
  const tituloLimpo = String(tituloEleitor || '').replace(/\D/g, '');
  const nomeLimpo = String(nome || '').trim();
  const ufLimpa = String(estado || '').trim().toUpperCase();
  const emailLimpo = String(email || '').trim().toLowerCase();
  const codigo = String(codigoVotado || '').trim().toUpperCase();

  // Validação no Frontend
  if (!nomeLimpo || nomeLimpo.length < 3) {
    return { success: false, error: 'Por favor, informe seu nome completo (mínimo 3 caracteres).' };
  }

  if (!/^[0-9]{10,12}$/.test(tituloLimpo)) {
    return { success: false, error: 'Título de Eleitor inválido (deve conter de 10 a 12 números).' };
  }

  if (!ufLimpa || ufLimpa.length !== 2) {
    return { success: false, error: 'Selecione o Estado (UF) correspondente.' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailLimpo)) {
    return { success: false, error: 'Por favor, informe um endereço de e-mail válido.' };
  }

  // Fallback para modo demonstração local se chaves reais não estiverem presentes
  if (!isSupabaseConfigured()) {
    console.warn('[Supabase] Rodando em modo de demonstração. Configure o .env.local.');
    const localStoreKey = `peticao_votado_${tituloLimpo}`;
    if (typeof window !== 'undefined' && localStorage.getItem(localStoreKey)) {
      return {
        success: false,
        isDuplicate: true,
        error: 'Este título de eleitor já registrou apoio nesta petição.',
      };
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        localStoreKey,
        JSON.stringify({
          nome: nomeLimpo,
          titulo: tituloLimpo,
          estado: ufLimpa,
          email: emailLimpo,
          codigo,
          data: new Date().toISOString(),
        })
      );
    }
    return {
      success: true,
      data: [{
        nome: nomeLimpo,
        titulo_eleitor: tituloLimpo,
        estado: ufLimpa,
        email: emailLimpo,
        codigo_votado: codigo,
      }],
    };
  }

  try {
    // Inserção direta no Supabase (sem .select() para respeitar RLS de escrita pública)
    const { error } = await supabase
      .from('peticao_votos')
      .insert([
        {
          nome: nomeLimpo,
          titulo_eleitor: tituloLimpo,
          estado: ufLimpa,
          email: emailLimpo,
          codigo_votado: codigo,
        },
      ]);

    if (error) {
      // Código PostgreSQL 23505 = violação da restrição UNIQUE no Título de Eleitor
      if (
        error.code === '23505' ||
        error.message?.includes('peticao_votos_titulo_eleitor_key') ||
        error.message?.toLowerCase().includes('duplicate key') ||
        error.message?.toLowerCase().includes('unique')
      ) {
        return {
          success: false,
          isDuplicate: true,
          error: 'Este título de eleitor já registrou apoio nesta petição.',
        };
      }

      console.error('[Supabase Error]:', error);
      return {
        success: false,
        error: error.message || 'Erro ao conectar ao banco de dados.',
      };
    }

    return {
      success: true,
      data: [{
        nome: nomeLimpo,
        titulo_eleitor: tituloLimpo,
        estado: ufLimpa,
        email: emailLimpo,
        codigo_votado: codigo,
      }],
    };
  } catch (err) {
    console.error('[Supabase Exception]:', err);
    return {
      success: false,
      error: 'Falha de conexão com o servidor. Verifique sua internet.',
    };
  }
}
