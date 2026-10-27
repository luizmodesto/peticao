import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const ESTADOS_NOMES = {
  SP: 'São Paulo', MG: 'Minas Gerais', RJ: 'Rio de Janeiro', BA: 'Bahia',
  PR: 'Paraná', RS: 'Rio Grande do Sul', PE: 'Pernambuco', CE: 'Ceará',
  PA: 'Pará', SC: 'Santa Catarina', GO: 'Goiás', MA: 'Maranhão',
  PB: 'Paraíba', ES: 'Espírito Santo', AM: 'Amazonas', RN: 'Rio Grande do Norte',
  AL: 'Alagoas', PI: 'Piauí', MT: 'Mato Grosso', DF: 'Distrito Federal',
  MS: 'Mato Grosso do Sul', SE: 'Sergipe', RO: 'Rondônia', TO: 'Tocantins',
  AC: 'Acre', AP: 'Amapá', RR: 'Roraima', ZZ: 'Exterior'
};

const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
];

function formatTitulo(t) {
  if (!t) return '-';
  const raw = String(t).replace(/\D/g, '');
  if (!raw) return '-';
  // Exibição em conformidade com LGPD: 2 primeiros e 3 últimos dígitos visíveis, com xxx mascarando o restante
  if (raw.length === 12) {
    const p1 = raw.slice(0, 2); // 2 primeiros números
    const p2 = raw.slice(-3);   // 3 últimos números
    return `${p1}xx xxxx x${p2}`;
  }
  if (raw.length >= 5) {
    const p1 = raw.slice(0, 2);
    const p2 = raw.slice(-3);
    const meioOculto = 'x'.repeat(raw.length - 5);
    return `${p1}${meioOculto}${p2}`;
  }
  return raw;
}

function formatDataHora(d) {
  if (!d) return '-';
  try {
    const data = new Date(d);
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'America/Sao_Paulo'
    });
  } catch (e) {
    return String(d);
  }
}

function formatCodigoVotado(codigo) {
  const cod = String(codigo || '').trim().toUpperCase();
  if (cod === '22') return 'Opção 22 (Flávio)';
  if (cod === 'BRANCO') return 'Voto em Branco';
  return cod || 'Registrado';
}

function gerarProtocolo() {
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  const time = Date.now().toString(36).substring(3, 8).toUpperCase();
  return `BR-AUD-${time}-${rand}`;
}

/**
 * Gera o Relatório Oficial em PDF da Petição Nacional
 * - Página 1: Capa Declaratória de Autenticidade para Fins de Registro Notarial / Cartório
 * - Página 2: Resumo Institucional e Fundamentação da Petição
 * - Páginas 3+: Relação Detalhada de Apoiadores com Dados Cadastrados
 * 
 * @param {Object} options
 * @param {Array} options.assinaturas Lista de assinaturas cadastradas
 * @param {string} [options.filtroEstado] Sigla da UF filtrada ou 'TODOS'
 * @param {number} [options.totalGeral] Total geral de apoios
 * @param {Object} [options.dadosDeclarante] Informações do declarante para autenticação em cartório
 * @param {string} options.dadosDeclarante.nomeCompleto
 * @param {string} [options.dadosDeclarante.nacionalidade]
 * @param {string} [options.dadosDeclarante.estadoCivil]
 * @param {string} [options.dadosDeclarante.profissao]
 * @param {string} options.dadosDeclarante.cpfCnpj
 * @param {string} [options.dadosDeclarante.rg]
 * @param {string} options.dadosDeclarante.enderecoCompleto
 * @param {string} [options.dadosDeclarante.cidadeUf]
 * @returns {{ doc: jsPDF, filename: string, protocolo: string, totalAssinaturas: number, download: () => void }}
 */
export function gerarRelatorioPDF({
  assinaturas = [],
  filtroEstado = '',
  totalGeral = 0,
  dadosDeclarante = null,
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const totalPagesExp = '{total_pages_count_string}';
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - (margin * 2);

  const agora = new Date();
  const dia = String(agora.getDate()).padStart(2, '0');
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const ano = agora.getFullYear();
  const mesNome = MESES[agora.getMonth()];

  const dataFormatada = `${dia}/${mes}/${ano}`;
  const horaFormatada = agora.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'America/Sao_Paulo'
  });

  const dataHoraCompleta = `${dataFormatada} às ${horaFormatada}`;
  const protocolo = gerarProtocolo();
  const ufFiltro = String(filtroEstado || '').toUpperCase();
  const isFiltrado = ufFiltro && ufFiltro !== 'TODOS' && ufFiltro !== 'TODAS';

  const nomeAmbito = isFiltrado
    ? `Estadual: ${ESTADOS_NOMES[ufFiltro] || ufFiltro} (${ufFiltro})`
    : 'Nacional (Todas as 27 Unidades da Federação)';

  // Dados do Declarante higienizados
  const declarante = {
    nome: String(dadosDeclarante?.nomeCompleto || 'DECLARANTE NÃO INFORMADO').trim().toUpperCase(),
    nacionalidade: String(dadosDeclarante?.nacionalidade || 'brasileiro(a)').trim(),
    estadoCivil: String(dadosDeclarante?.estadoCivil || 'estado civil não informado').trim(),
    profissao: String(dadosDeclarante?.profissao || 'profissão não informada').trim(),
    cpfCnpj: String(dadosDeclarante?.cpfCnpj || '-').trim(),
    rg: String(dadosDeclarante?.rg || 'não informado').trim(),
    endereco: String(dadosDeclarante?.enderecoCompleto || 'endereço não informado').trim(),
    cidadeUf: String(dadosDeclarante?.cidadeUf || (isFiltrado ? `${ESTADOS_NOMES[ufFiltro] || ufFiltro} - ${ufFiltro}` : 'Brasília - DF')).trim(),
  };

  const totalAssinaturasNum = assinaturas.length;
  const totalAssinaturasTexto = totalAssinaturasNum.toLocaleString('pt-BR');

  // =========================================================================
  // PÁGINA 1: CAPA DECLARATÓRIA DE AUTENTICIDADE PARA FINS DE REGISTRO PÚBLICO
  // =========================================================================

  // Faixa Superior Institucional
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 18, 'F');
  
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(0, 18, pageWidth, 2, 'F');
  
  doc.setFillColor(234, 179, 8); // yellow-500
  doc.rect(0, 20, pageWidth, 1, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('REPÚBLICA FEDERATIVA DO BRASIL • SERVIÇO NOTARIAL E REGISTRAL', pageWidth / 2, 8.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('INSTRUMENTO DECLARATÓRIO DE AUTENTICIDADE • FÉ PÚBLICA & AUDITORIA CIDADÃ', pageWidth / 2, 13.5, { align: 'center' });

  let y = 29;

  // Título Oficial da Declaração
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  const tituloDecl = 'DECLARAÇÃO DE AUTENTICIDADE E INTEGRIDADE DE DADOS ELETRÔNICOS PARA FINS DE REGISTRO PÚBLICO';
  const titLines = doc.splitTextToSize(tituloDecl, contentWidth);
  doc.text(titLines, pageWidth / 2, y, { align: 'center' });
  y += (titLines.length * 4.8) + 2;

  // Subtítulo: Ao Serviço Notarial e Registral
  doc.setFontSize(9.5);
  doc.setTextColor(5, 150, 105);
  doc.text('AO SERVIÇO NOTARIAL E REGISTRAL', pageWidth / 2, y, { align: 'center' });
  y += 6;

  // Linha divisória fina
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5.5;

  // Parágrafo de Qualificação
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(8.2);
  doc.setFont('helvetica', 'normal');

  const textoQualificacao = `Eu, ${declarante.nome}, ${declarante.nacionalidade}, ${declarante.estadoCivil}, ${declarante.profissao}, portador(a) da Cédula de Identidade RG nº ${declarante.rg}, inscrito(a) no CPF/CNPJ sob o nº ${declarante.cpfCnpj}, residente e domiciliado(a) à ${declarante.endereco}, DECLARO, sob as penas da lei e para fins de registro público, conservação de direitos e perpetuidade, que:`;
  const qualifLines = doc.splitTextToSize(textoQualificacao, contentWidth);
  doc.text(qualifLines, margin, y, { align: 'justify', maxWidth: contentWidth });
  y += (qualifLines.length * 4.1) + 3.8;

  // Parágrafo 1: Descrição do Documento, Domínio e Data/Hora
  const p1 = `O documento em anexo, constituído de ${totalPagesExp} páginas, é a reprodução impressa fiel, integral e inalterada do "Relatório Oficial de Assinaturas" extraído na data de ${dataFormatada}, às ${horaFormatada}, a partir do banco de dados do sistema eletrônico da Petição Nacional pela Transparência Eleitoral, hospedado e acessível através do domínio eletrônico oficial https://peticaonacional.online.`;
  const p1Lines = doc.splitTextToSize(p1, contentWidth);
  doc.text(p1Lines, margin, y, { align: 'justify', maxWidth: contentWidth });
  y += (p1Lines.length * 4.1) + 3.2;

  // Parágrafo 2: Finalidade e Amparo Constitucional
  const p2 = 'A referida plataforma foi desenvolvida para o exercício democrático da auditoria cidadã dos votos destinados ao candidato Flávio (PL - 22), estando este ato devidamente amparado no Artigo 1º, parágrafo único, e no Artigo 5º, inciso XXXIV, alínea "a", da Constituição da República Federativa do Brasil.';
  const p2Lines = doc.splitTextToSize(p2, contentWidth);
  doc.text(p2Lines, margin, y, { align: 'justify', maxWidth: contentWidth });
  y += (p2Lines.length * 4.1) + 3.2;

  // Parágrafo 3: Critérios Técnicos de Segurança e Antifraude
  const p3 = 'O sistema eletrônico de onde os dados foram extraídos possui rigorosos critérios de segurança antifraude, incluindo o bloqueio de duplicidade e a validação algorítmica do Dígito Verificador do Título de Eleitor oficial.';
  const p3Lines = doc.splitTextToSize(p3, contentWidth);
  doc.text(p3Lines, margin, y, { align: 'justify', maxWidth: contentWidth });
  y += (p3Lines.length * 4.1) + 3.2;

  // Parágrafo 4: Total de Assinaturas e LGPD
  const p4 = `Os dados apresentados no relatório anexo totalizam ${totalAssinaturasTexto} assinaturas eletrônicas válidas e foram coletados e armazenados em estrita observância às diretrizes da Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018), exclusivamente para os fins de auditoria e transparência aqui declarados.`;
  const p4Lines = doc.splitTextToSize(p4, contentWidth);
  doc.text(p4Lines, margin, y, { align: 'justify', maxWidth: contentWidth });
  y += (p4Lines.length * 4.1) + 3.2;

  // Parágrafo 5: Encerramento e Requerimento
  const p5 = 'Por ser a expressão da verdade, firmo a presente declaração para que produza seus efeitos legais e jurídicos, requerendo o seu registro e arquivamento juntamente com o relatório anexo.';
  const p5Lines = doc.splitTextToSize(p5, contentWidth);
  doc.text(p5Lines, margin, y, { align: 'justify', maxWidth: contentWidth });
  y += (p5Lines.length * 4.1) + 4.5;

  // Local e Data
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.2);
  doc.setTextColor(30, 41, 59);
  doc.text(`${declarante.cidadeUf}, ${dia} de ${mesNome} de ${ano}.`, margin, y);
  doc.setFontSize(7.2);
  doc.setTextColor(100, 116, 139);
  doc.text('(Local e Data)', margin, y + 3.8);
  y += 11;

  // Bloco de Assinatura do Declarante
  doc.setDrawColor(100, 116, 139);
  doc.line(margin, y, margin + 85, y);
  y += 3.8;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('ASSINATURA DO DECLARANTE', margin, y);
  y += 3.6;
  doc.setFont('helvetica', 'normal');
  doc.text(`Nome: ${declarante.nome}`, margin, y);
  y += 3.6;
  doc.text(`CPF/CNPJ: ${declarante.cpfCnpj}`, margin, y);
  y += 7.5;

  // Espaço Reservado para o Cartório (Reconhecimento de Firma)
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(148, 163, 184);
  doc.setLineDashPattern([2, 2], 0);
  doc.roundedRect(margin, y, contentWidth, 31, 2, 2, 'FD');
  doc.setLineDashPattern([], 0);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(71, 85, 105);
  doc.text('=======================================================================', pageWidth / 2, y + 4.5, { align: 'center' });
  doc.text('ESPAÇO RESERVADO PARA O CARTÓRIO (RECONHECIMENTO DE FIRMA)', pageWidth / 2, y + 9.5, { align: 'center' });
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.8);
  doc.setTextColor(148, 163, 184);
  doc.text('(Carimbo, Selo de Autenticidade e Assinatura do Tabelião)', pageWidth / 2, y + 15, { align: 'center' });

  // Rodapé da Página 1
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Página 1 de ${totalPagesExp} • Instrumento Declaratório de Autenticidade • https://peticaonacional.online`,
    pageWidth / 2,
    pageHeight - 5,
    { align: 'center' }
  );

  // =========================================================================
  // PÁGINA 2: RESUMO INSTITUCIONAL E FUNDAMENTAÇÃO DA PETIÇÃO
  // =========================================================================

  doc.addPage();

  // Cabeçalho Página 2
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 24, 'F');
  doc.setFillColor(16, 185, 129);
  doc.rect(0, 24, pageWidth, 2, 'F');
  doc.setFillColor(234, 179, 8);
  doc.rect(0, 26, pageWidth, 1, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('PETIÇÃO NACIONAL PELA TRANSPARÊNCIA ELEITORAL', pageWidth / 2, 10, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('INICIATIVA POPULAR • LEI FEDERAL Nº 9.709/1998 • CF/1988 • https://peticaonacional.online', pageWidth / 2, 15.5, { align: 'center' });
  doc.text(`Protocolo Oficial: ${protocolo} | Âmbito: ${nomeAmbito}`, pageWidth / 2, 20.5, { align: 'center' });

  let y2 = 34;

  // Caixa de Resumo do Relatório
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y2, contentWidth, 30, 2.5, 2.5, 'FD');

  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('METADADOS DO RELATÓRIO OFICIAL DE ASSINATURAS', margin + 4, y2 + 5.5);

  doc.setFontSize(7.6);
  doc.setFont('helvetica', 'normal');
  doc.text('• Âmbito Territorial:', margin + 4, y2 + 12);
  doc.setFont('helvetica', 'bold');
  doc.text(nomeAmbito, margin + 40, y2 + 12);

  doc.setFont('helvetica', 'normal');
  doc.text('• Total de Assinaturas Válidas:', margin + 4, y2 + 17.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`${totalAssinaturasTexto} eleitores auditados`, margin + 40, y2 + 17.5);

  doc.setFont('helvetica', 'normal');
  doc.text('• Data e Hora de Extração:', margin + 4, y2 + 23);
  doc.setFont('helvetica', 'bold');
  doc.text(`${dataHoraCompleta} (Horário Oficial de Brasília)`, margin + 40, y2 + 23);

  y2 += 35;

  // Bloco 1: Preâmbulo
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y2, contentWidth, 31, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(5, 150, 105);
  doc.text('1. PREÂMBULO E OBJETO DA PETIÇÃO', margin + 4, y2 + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(51, 65, 85);
  const preambulo = 'Nós, cidadãos brasileiros abaixo assinados, no pleno exercício dos direitos e garantias assegurados pela Constituição da República Federativa do Brasil de 1988 — especialmente os princípios da soberania popular, da cidadania, da publicidade dos atos públicos e da transparência administrativa —, apresentamos a presente petição visando propor a discussão de mecanismos complementares de auditoria cidadã digital para fortalecimento da transparência nos processos eleitorais brasileiros.';
  const preambLines = doc.splitTextToSize(preambulo, contentWidth - 8);
  doc.text(preambLines, margin + 4, y2 + 11);

  y2 += 35;

  // Bloco 2: Pedidos
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y2, contentWidth, 48, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(5, 150, 105);
  doc.text('2. DOS PEDIDOS E PROPOSTAS DA INICIATIVA POPULAR', margin + 4, y2 + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.1);
  doc.setTextColor(51, 65, 85);
  const pedidos = [
    '1. Criação de plataforma nacional de participação cidadã para fins exclusivos de auditoria popular dos processos eleitorais;',
    '2. Autenticação eletrônica e validação do Título de Eleitor oficial por algoritmo matemático (Módulo 11 oficial do TSE);',
    '3. Disponibilização de urna virtual de manifestação cívica com registro público, transparente e imutável;',
    '4. Resguardo incondicional e inviolável ao sigilo do voto (Art. 14 da CF/88) e à LGPD (Lei Federal nº 13.709/2018);',
    '5. Publicidade ampla, irrestrita e transparente de todos os dados, relatórios e análises técnicas para a sociedade civil.'
  ];
  let py = y2 + 11;
  pedidos.forEach(p => {
    const pLines = doc.splitTextToSize(`• ${p}`, contentWidth - 8);
    doc.text(pLines, margin + 4, py);
    py += (pLines.length * 3.8) + 2.4;
  });

  y2 += 52;

  // Bloco 3: Fundamentação Jurídica
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y2, contentWidth, 38, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(5, 150, 105);
  doc.text('3. FUNDAMENTAÇÃO LEGAL E CONSTITUCIONAL', margin + 4, y2 + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(51, 65, 85);
  const fundamentos = [
    '• Artigo 1º, Parágrafo Único da Constituição Federal: "Todo o poder emana do povo, que o exerce por meio de representantes eleitos ou diretamente, nos termos desta Constituição."',
    '• Artigo 5º, Inciso XXXIV, Alínea "a" da Constituição Federal: Assegura o direito de petição aos Poderes Públicos em defesa de direitos ou contra abuso de poder.',
    '• Artigo 14 da Constituição Federal e Lei nº 9.709/1998: Regulamentam a soberania popular e os instrumentos de iniciativa popular no Brasil.',
    '• Lei Geral de Proteção de Dados (Lei nº 13.709/2018): Dados pessoais utilizados exclusivamente para instrução de petição pública cívica.'
  ];
  let fy = y2 + 10.5;
  fundamentos.forEach(f => {
    const fLines = doc.splitTextToSize(f, contentWidth - 8);
    doc.text(fLines, margin + 4, fy);
    fy += (fLines.length * 3.6) + 1.8;
  });

  // Rodapé da Página 2
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Página 2 de ${totalPagesExp} • Resumo da Petição • A relação detalhada de assinaturas inicia-se na página seguinte.`,
    pageWidth / 2,
    pageHeight - 5,
    { align: 'center' }
  );

  // =========================================================================
  // PÁGINA 3 EM DIANTE: TABELA COM AS INFORMAÇÕES PREENCHIDAS PELOS APOIADORES
  // =========================================================================

  doc.addPage();

  const tableRows = assinaturas.map((item, index) => [
    String(index + 1),
    String(item.nome || 'Não informado'),
    formatTitulo(item.titulo_eleitor),
    String(item.estado || '').toUpperCase(),
    String(item.email || '-'),
    formatCodigoVotado(item.codigo_votado),
    formatDataHora(item.created_at)
  ]);

  if (tableRows.length === 0) {
    tableRows.push([
      '-',
      'Nenhuma assinatura registrada para os parâmetros selecionados',
      '-',
      ufFiltro || '-',
      '-',
      '-',
      '-'
    ]);
  }

  autoTable(doc, {
    head: [['#', 'Nome do Apoiador', 'Título de Eleitor', 'UF', 'E-mail do Eleitor', 'Opção Votada', 'Data e Hora']],
    body: tableRows,
    startY: 20,
    margin: { top: 20, bottom: 15, left: margin, right: margin },
    theme: 'striped',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'left',
      cellPadding: 2.5
    },
    bodyStyles: {
      fontSize: 7.2,
      textColor: [30, 41, 59],
      cellPadding: 2.2
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 42 },
      2: { cellWidth: 28, halign: 'center', font: 'courier' },
      3: { cellWidth: 10, halign: 'center', fontStyle: 'bold' },
      4: { cellWidth: 42 },
      5: { cellWidth: 22, halign: 'center' },
      6: { cellWidth: 26, halign: 'center' }
    },
    didDrawPage: function(data) {
      const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
      
      // Cabeçalho no topo das páginas de dados (a partir da página 3)
      if (currentPage >= 3) {
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, pageWidth, 13, 'F');
        doc.setFillColor(16, 185, 129);
        doc.rect(0, 13, pageWidth, 1, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.8);
        doc.text('Petição Nacional pela Transparência Eleitoral — Relação Oficial de Assinaturas', margin, 8.5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.8);
        doc.text(`Protocolo: ${protocolo} | https://peticaonacional.online`, pageWidth - margin, 8.5, { align: 'right' });
      }

      // Rodapé de numeração
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Página ${currentPage} de ${totalPagesExp} • Sistema de Auditoria Cidadã Digital • Lei nº 9.709/1998 & CF/88`,
        pageWidth / 2,
        pageHeight - 5,
        { align: 'center' }
      );
    }
  });

  // Substitui placeholder de total de páginas em todo o PDF
  if (typeof doc.putTotalPages === 'function') {
    doc.putTotalPages(totalPagesExp);
  }

  const sufixoArquivo = isFiltrado ? `_${ufFiltro}` : '_NACIONAL';
  const dataArquivo = agora.toISOString().slice(0, 10);
  const filename = `declaracao_peticao${sufixoArquivo}_${dataArquivo}.pdf`;

  return {
    doc,
    filename,
    protocolo,
    totalAssinaturas: assinaturas.length,
    download: () => {
      doc.save(filename);
    }
  };
}
