/**
 * Utilitário de Validação Oficial de Título de Eleitor (TSE - Módulo 11)
 * 
 * Regras Oficiais do TSE:
 * - O Título de Eleitor brasileiro possui 12 dígitos (ou 10-11 com zeros à esquerda).
 * - Dígitos 1 a 8: Número sequencial.
 * - Dígitos 9 e 10: Código da Unidade da Federação (UF) de emissão (01 a 28).
 * - Dígitos 11 e 12: Dígitos Verificadores (DV1 e DV2), calculados via Módulo 11.
 * 
 * Exceções Oficiais do TSE:
 * - Para DV1 e DV2: Se o resto for 10, o DV vira 0.
 * - Se o resto for 0: Para São Paulo (01) e Minas Gerais (02), o DV vira 1.
 *   Para os demais estados, o DV vira 0.
 */

// Tabela oficial de Códigos de UF do Tribunal Superior Eleitoral (TSE)
export const UF_CODIGOS_TSE = {
  SP: '01', // São Paulo
  MG: '02', // Minas Gerais
  RJ: '03', // Rio de Janeiro
  RS: '04', // Rio Grande do Sul
  BA: '05', // Bahia
  PR: '06', // Paraná
  CE: '07', // Ceará
  PE: '08', // Pernambuco
  SC: '09', // Santa Catarina
  GO: '10', // Goiás
  MA: '11', // Maranhão
  PB: '12', // Paraíba
  PA: '13', // Pará
  ES: '14', // Espírito Santo
  PI: '15', // Piauí
  RN: '16', // Rio Grande do Norte
  AL: '17', // Alagoas
  MT: '18', // Mato Grosso
  MS: '19', // Mato Grosso do Sul
  DF: '20', // Distrito Federal
  SE: '21', // Sergipe
  AM: '22', // Amazonas
  RO: '23', // Rondônia
  AC: '24', // Acre
  AP: '25', // Amapá
  RR: '26', // Roraima
  TO: '27', // Tocantins
  ZZ: '28', // Exterior
};

export const CODIGOS_UF_TSE = Object.entries(UF_CODIGOS_TSE).reduce((acc, [uf, cod]) => {
  acc[cod] = uf;
  return acc;
}, {});

export const MENSAGEM_ERRO_TITULO = 'Título de eleitor inválido ou não correspondente ao estado selecionado.';

/**
 * Validação detalhada do Título de Eleitor com resultado rico
 * 
 * @param {string|number} titulo - Número do título (com ou sem formatação)
 * @param {string} [ufSelecionada] - Sigla da UF selecionada no formulário (ex: 'SP', 'RJ')
 * @returns {{ valido: boolean, erro: string|null, motivo?: string, ufTitulo?: string, codigoUf?: string }}
 */
export function validarTituloEleitorDetalhado(titulo, ufSelecionada = null) {
  if (!titulo) {
    return { valido: false, erro: MENSAGEM_ERRO_TITULO, motivo: 'Título não informado' };
  }

  // Remove caracteres não numéricos
  let valor = String(titulo).replace(/\D/g, '');

  // Suporte a títulos com 10 a 12 dígitos (preenche com zeros à esquerda se necessário)
  if (valor.length >= 10 && valor.length < 12) {
    valor = valor.padStart(12, '0');
  }

  if (valor.length !== 12) {
    return { valido: false, erro: MENSAGEM_ERRO_TITULO, motivo: 'Comprimento inválido (deve conter 12 dígitos)' };
  }

  // Bloqueia sequências de dígitos idênticos (ex: 000000000000, 111111111111)
  if (/^(\d)\1{11}$/.test(valor)) {
    return { valido: false, erro: MENSAGEM_ERRO_TITULO, motivo: 'Dígitos todos iguais' };
  }

  // Dígitos 9 e 10: Código da UF
  const codUf = valor.substring(8, 10);
  const numUf = parseInt(codUf, 10);

  // Código de UF do TSE deve estar entre 01 e 28
  if (numUf < 1 || numUf > 28) {
    return { valido: false, erro: MENSAGEM_ERRO_TITULO, motivo: 'Código de UF fora da faixa 01-28' };
  }

  // Validação cruzada com o Estado (UF) selecionado no formulário
  if (ufSelecionada) {
    const ufLimpa = String(ufSelecionada).trim().toUpperCase();
    const codUfEsperado = UF_CODIGOS_TSE[ufLimpa];
    if (!codUfEsperado || codUf !== codUfEsperado) {
      return {
        valido: false,
        erro: MENSAGEM_ERRO_TITULO,
        motivo: `UF do título (${codUf} - ${CODIGOS_UF_TSE[codUf] || 'Desconhecida'}) diverge da UF selecionada (${ufLimpa} - ${codUfEsperado || 'Inválida'})`,
        ufTitulo: CODIGOS_UF_TSE[codUf],
        codigoUf: codUf,
      };
    }
  }

  const dvInformado = valor.substring(10, 12);

  // --- CÁLCULO DO 1º DÍGITO VERIFICADOR (DV1) ---
  // 8 primeiros dígitos com pesos de 2 a 9
  let soma1 = 0;
  for (let i = 0; i < 8; i++) {
    soma1 += parseInt(valor.charAt(i), 10) * (i + 2);
  }

  const resto1 = soma1 % 11;
  let dv1 = 0;
  if (resto1 === 10) {
    dv1 = 0;
  } else if (resto1 === 0) {
    // Exceção oficial TSE: SP (01) e MG (02) recebem 1; demais estados recebem 0
    dv1 = (numUf === 1 || numUf === 2) ? 1 : 0;
  } else {
    dv1 = resto1;
  }

  // --- CÁLCULO DO 2º DÍGITO VERIFICADOR (DV2) ---
  // Dígito 9 com peso 7, Dígito 10 com peso 8, e DV1 calculado com peso 9
  const d9 = parseInt(valor.charAt(8), 10);
  const d10 = parseInt(valor.charAt(9), 10);

  const soma2 = (d9 * 7) + (d10 * 8) + (dv1 * 9);
  const resto2 = soma2 % 11;
  let dv2 = 0;
  if (resto2 === 10) {
    dv2 = 0;
  } else if (resto2 === 0) {
    // Exceção oficial TSE: SP (01) e MG (02) recebem 1; demais estados recebem 0
    dv2 = (numUf === 1 || numUf === 2) ? 1 : 0;
  } else {
    dv2 = resto2;
  }

  const dvCalculado = `${dv1}${dv2}`;

  if (dvCalculado !== dvInformado) {
    return {
      valido: false,
      erro: MENSAGEM_ERRO_TITULO,
      motivo: `Dígitos verificadores calculados (${dvCalculado}) não conferem com os informados (${dvInformado})`,
      ufTitulo: CODIGOS_UF_TSE[codUf],
      codigoUf: codUf,
    };
  }

  return {
    valido: true,
    erro: null,
    ufTitulo: CODIGOS_UF_TSE[codUf],
    codigoUf: codUf,
  };
}

/**
 * Valida o Título de Eleitor segundo o algoritmo oficial do TSE e validação cruzada com UF.
 * Retorna boolean (true se válido e correspondente, false caso contrário).
 * 
 * @param {string|number} titulo - Título de eleitor
 * @param {string} [ufSelecionada] - Sigla da UF selecionada (ex: 'SP', 'RJ')
 * @returns {boolean}
 */
export function validarTituloEleitor(titulo, ufSelecionada = null) {
  return validarTituloEleitorDetalhado(titulo, ufSelecionada).valido;
}

export default validarTituloEleitor;
