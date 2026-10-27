'use client';

import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  Filter, 
  Eye, 
  Search, 
  CheckCircle2, 
  Calendar, 
  User, 
  CreditCard, 
  Mail, 
  MapPin, 
  X,
  FileCheck2,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { gerarRelatorioPDF } from '@/lib/pdfReportGenerator';
import ModalDadosDeclarante from './ModalDadosDeclarante';

const ESTADOS_NOMES = {
  SP: 'São Paulo', MG: 'Minas Gerais', RJ: 'Rio de Janeiro', BA: 'Bahia',
  PR: 'Paraná', RS: 'Rio Grande do Sul', PE: 'Pernambuco', CE: 'Ceará',
  PA: 'Pará', SC: 'Santa Catarina', GO: 'Goiás', MA: 'Maranhão',
  PB: 'Paraíba', ES: 'Espírito Santo', AM: 'Amazonas', RN: 'Rio Grande do Norte',
  AL: 'Alagoas', PI: 'Piauí', MT: 'Mato Grosso', DF: 'Distrito Federal',
  MS: 'Mato Grosso do Sul', SE: 'Sergipe', RO: 'Rondônia', TO: 'Tocantins',
  AC: 'Acre', AP: 'Amapá', RR: 'Roraima', ZZ: 'Exterior'
};

const TODAS_UFS = Object.keys(ESTADOS_NOMES);

function formatTituloDisplay(val) {
  if (!val) return '-';
  const clean = String(val).replace(/\D/g, '');
  if (!clean) return '-';
  // Exibição em conformidade com LGPD: 2 primeiros e 3 últimos dígitos visíveis, com xxx mascarando o restante
  if (clean.length === 12) {
    const p1 = clean.slice(0, 2); // 2 primeiros números
    const p2 = clean.slice(-3);   // 3 últimos números
    return `${p1}xx xxxx x${p2}`;
  }
  if (clean.length >= 5) {
    const p1 = clean.slice(0, 2);
    const p2 = clean.slice(-3);
    const meioOculto = 'x'.repeat(clean.length - 5);
    return `${p1}${meioOculto}${p2}`;
  }
  return clean;
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
      minute: '2-digit'
    });
  } catch (e) {
    return String(d);
  }
}

export default function AdminRelatoriosCard({
  assinaturas = [],
  totalGeral = 0,
  votosPorEstado = {},
  isLoading = false,
  onRecarregar,
}) {
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [busca, setBusca] = useState('');
  const [gerandoPdf, setGerandoPdf] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalDeclaranteAberto, setModalDeclaranteAberto] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  // Filtragem combinada por UF e Busca textual
  const assinaturasFiltradas = useMemo(() => {
    return assinaturas.filter((item) => {
      // Filtro por Estado
      if (filtroEstado !== 'TODOS') {
        const ufItem = String(item.estado || '').toUpperCase();
        if (ufItem !== filtroEstado.toUpperCase()) return false;
      }

      // Filtro por texto (Nome, Título puro, Título mascarado ou E-mail)
      if (busca.trim()) {
        const termo = busca.trim().toLowerCase();
        const nome = String(item.nome || '').toLowerCase();
        const tituloRaw = String(item.titulo_eleitor || '').replace(/\D/g, '');
        const tituloMascarado = formatTituloDisplay(item.titulo_eleitor).toLowerCase();
        const email = String(item.email || '').toLowerCase();
        const matches =
          nome.includes(termo) ||
          tituloRaw.includes(termo) ||
          tituloMascarado.includes(termo) ||
          email.includes(termo);
        if (!matches) return false;
      }

      return true;
    });
  }, [assinaturas, filtroEstado, busca]);

  // Abre o modal de dados do declarante para autenticação em cartório
  const handleAbrirModalDeclarante = () => {
    setModalDeclaranteAberto(true);
  };

  // Handler que recebe os dados do declarante e gera o PDF oficial
  const handleConfirmarGeracaoPDF = async (dadosDeclarante, callbackSucesso) => {
    try {
      setGerandoPdf(true);
      setMensagemSucesso('');

      // Pequeno timeout para renderização fluida
      await new Promise((r) => setTimeout(r, 200));

      const { filename, download, totalAssinaturas } = gerarRelatorioPDF({
        assinaturas: assinaturasFiltradas,
        filtroEstado: filtroEstado === 'TODOS' ? '' : filtroEstado,
        totalGeral: totalGeral || assinaturas.length,
        dadosDeclarante,
      });

      // Baixa o arquivo PDF
      download();

      // Limpa os campos e fecha o modal automaticamente
      if (typeof callbackSucesso === 'function') {
        callbackSucesso();
      }
      setModalDeclaranteAberto(false);

      setMensagemSucesso(`Relatório PDF com Declaração de Autenticidade emitido com sucesso (${totalAssinaturas} registros)!`);
      setTimeout(() => setMensagemSucesso(''), 6000);
    } catch (err) {
      console.error('[AdminRelatoriosCard] Erro ao gerar PDF:', err);
      alert('Erro ao compilar o PDF: ' + (err.message || 'Falha desconhecida.'));
    } finally {
      setGerandoPdf(false);
    }
  };

  return (
    <>
      {/* =================================================================== */}
      {/* CARD PRINCIPAL DO DASHBOARD                                         */}
      {/* =================================================================== */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
        {/* Glow decorativo de fundo */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 blur-[50px] rounded-full pointer-events-none" />

        {/* Cabeçalho do Card */}
        <div className="flex items-start justify-between pb-3 mb-3 border-b border-slate-800/80 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
                <FileText className="w-4 h-4" />
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                RELATÓRIO DE ASSINATURAS
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Exportação em PDF oficial com capa da petição e dados cadastrados
            </p>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider flex-shrink-0">
            PDF Oficial
          </span>
        </div>

        {/* Mensagem de Sucesso Temporária */}
        {mensagemSucesso && (
          <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{mensagemSucesso}</span>
          </div>
        )}

        {/* Seletor de Estado e Busca */}
        <div className="space-y-2.5 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Seletor de UF */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-400" />
                Estado (UF)
              </label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="TODOS">Todos os Estados (Nacional - {assinaturas.length})</option>
                {TODAS_UFS.map((uf) => {
                  const qtd = votosPorEstado[uf] || 0;
                  return (
                    <option key={uf} value={uf}>
                      {uf} - {ESTADOS_NOMES[uf]} ({qtd})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Busca rápida */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                <Search className="w-3 h-3 text-emerald-400" />
                Filtrar Apoiador
              </label>
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Nome, título ou e-mail..."
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Badge de Resumo da Seleção */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-0.5">
            <span>
              Mostrando: <strong className="text-white font-mono">{assinaturasFiltradas.length}</strong> de <strong className="text-slate-300 font-mono">{assinaturas.length}</strong> assinaturas
            </span>
            {filtroEstado !== 'TODOS' && (
              <button
                onClick={() => setFiltroEstado('TODOS')}
                className="text-emerald-400 hover:underline cursor-pointer"
              >
                Limpar filtro de UF
              </button>
            )}
          </div>
        </div>

        {/* Pré-visualização das Últimas Assinaturas */}
        <div className="mb-4 space-y-1.5">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Últimos Registros:</span>
            <button
              onClick={() => setModalAberto(true)}
              className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 text-[11px] font-semibold"
            >
              <Eye className="w-3 h-3" />
              <span>Ver Tabela Completa</span>
            </button>
          </div>

          {isLoading ? (
            <div className="py-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              <span>Carregando dados dos eleitores...</span>
            </div>
          ) : assinaturasFiltradas.length === 0 ? (
            <div className="p-3 bg-slate-950/40 border border-slate-800/60 rounded-xl text-center text-xs text-slate-500">
              Nenhuma assinatura encontrada para o filtro atual.
            </div>
          ) : (
            <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
              {assinaturasFiltradas.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-400 font-mono font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                      {item.estado || 'BR'}
                    </span>
                    <div className="min-w-0">
                      <div className="font-semibold text-white truncate text-[11px]">
                        {item.nome}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">
                        {formatTituloDisplay(item.titulo_eleitor)} • {item.email}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-emerald-400 block">
                      {item.codigo_votado === '22' ? 'Opção 22' : 'Branco'}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono block mt-0.5">
                      {formatDataHora(item.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botão de Ação: Gerar Relatório em PDF */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={handleAbrirModalDeclarante}
            disabled={gerandoPdf || assinaturasFiltradas.length === 0}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-950/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {gerandoPdf ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>Processando Relatório...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Gerar Relatório em PDF ({assinaturasFiltradas.length})</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setModalAberto(true)}
            title="Visualizar todas as assinaturas detalhadas"
            className="px-3.5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 flex-shrink-0 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ver Tudo</span>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* MODAL EXPANDIDO COM LISTA COMPLETA DAS ASSINATURAS E RELATÓRIO     */}
      {/* =================================================================== */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in select-none">
          <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
            
            {/* Faixa decorativa superior com as cores do Brasil */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-yellow-400 to-emerald-600 rounded-t-3xl" />

            {/* Cabeçalho do Modal */}
            <div className="p-5 sm:p-6 border-b border-slate-800 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/95">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 flex-shrink-0 mt-0.5">
                  <FileCheck2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                    <span>Auditoria Cidadã Digital</span>
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-white leading-tight">
                    Relação Detalhada de Assinaturas da Petição
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {filtroEstado === 'TODOS'
                      ? 'Exibindo assinaturas de todo o território nacional'
                      : `Filtro ativo: ${ESTADOS_NOMES[filtroEstado] || filtroEstado} (${filtroEstado})`}
                  </p>
                </div>
              </div>

              {/* Ações no Topo do Modal */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={handleAbrirModalDeclarante}
                  disabled={gerandoPdf || assinaturasFiltradas.length === 0}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar PDF com Autenticação ({assinaturasFiltradas.length})</span>
                </button>

                <button
                  onClick={() => setModalAberto(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Fechar visualização"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Barra de Filtros e Busca no Modal */}
            <div className="px-5 sm:px-6 py-3 bg-slate-950/60 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-slate-400 whitespace-nowrap">UF:</span>
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="TODOS">Todos os Estados ({assinaturas.length})</option>
                  {TODAS_UFS.map((uf) => (
                    <option key={uf} value={uf}>
                      {uf} - {ESTADOS_NOMES[uf]} ({votosPorEstado[uf] || 0})
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Pesquisar por nome, título ou e-mail..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="text-xs text-slate-400 font-mono whitespace-nowrap">
                Total: <strong className="text-emerald-400">{assinaturasFiltradas.length}</strong> assinaturas
              </div>
            </div>

            {/* Tabela de Dados Completa com Rolagem */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
              {assinaturasFiltradas.length === 0 ? (
                <div className="py-16 text-center text-slate-500 text-sm">
                  Nenhum registro encontrado para os filtros selecionados.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                        <th className="py-3 px-3 w-10 text-center">#</th>
                        <th className="py-3 px-3">Nome do Eleitor</th>
                        <th className="py-3 px-3 font-mono">Título de Eleitor</th>
                        <th className="py-3 px-3 text-center">UF</th>
                        <th className="py-3 px-3">E-mail</th>
                        <th className="py-3 px-3 text-center">Opção Votada</th>
                        <th className="py-3 px-3 text-right">Data e Hora</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {assinaturasFiltradas.map((item, index) => (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-800/40 transition-colors text-slate-300"
                        >
                          <td className="py-2.5 px-3 text-center font-mono text-[11px] text-slate-500">
                            {index + 1}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-white">
                            {item.nome}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-emerald-400">
                            {formatTituloDisplay(item.titulo_eleitor)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 font-mono text-[11px] font-bold">
                              {item.estado || '-'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                            {item.email}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] font-bold">
                              {item.codigo_votado === '22' ? 'Opção 22' : 'Branco'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-400 text-[11px]">
                            {formatDataHora(item.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Rodapé Fixo do Modal */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400 text-center sm:text-left">
                Dados armazenados sob proteção da LGPD exclusivamente para instrução de petição pública.
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  onClick={handleAbrirModalDeclarante}
                  disabled={gerandoPdf || assinaturasFiltradas.length === 0}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar Relatório Oficial em PDF</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Modal de Dados do Declarante para Autenticação em Cartório */}
      <ModalDadosDeclarante
        isOpen={modalDeclaranteAberto}
        onClose={() => setModalDeclaranteAberto(false)}
        onConfirm={handleConfirmarGeracaoPDF}
        isGenerating={gerandoPdf}
        totalAssinaturas={assinaturasFiltradas.length}
        filtroEstado={filtroEstado}
      />
    </>
  );
}
