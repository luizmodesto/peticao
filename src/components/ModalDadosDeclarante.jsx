'use client';

import React, { useState } from 'react';
import { 
  FileCheck2, 
  X, 
  AlertCircle, 
  Download, 
  User, 
  CreditCard, 
  MapPin, 
  Briefcase, 
  Building2,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export default function ModalDadosDeclarante({
  isOpen,
  onClose,
  onConfirm,
  isGenerating = false,
  totalAssinaturas = 0,
  filtroEstado = '',
}) {
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [nacionalidade, setNacionalidade] = useState('brasileiro(a)');
  const [estadoCivil, setEstadoCivil] = useState('');
  const [profissao, setProfissao] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [rg, setRg] = useState('');
  const [enderecoCompleto, setEnderecoCompleto] = useState('');
  const [cidadeUf, setCidadeUf] = useState(filtroEstado && filtroEstado !== 'TODOS' ? `${filtroEstado}` : '');
  const [erro, setErro] = useState('');

  if (!isOpen) return null;

  const handleLimparCampos = () => {
    setNomeCompleto('');
    setNacionalidade('brasileiro(a)');
    setEstadoCivil('');
    setProfissao('');
    setCpfCnpj('');
    setRg('');
    setEnderecoCompleto('');
    setCidadeUf('');
    setErro('');
  };

  const handleCancelar = () => {
    setErro('');
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErro('');

    const nome = nomeCompleto.trim();
    const docIdentificacao = cpfCnpj.trim();
    const endereco = enderecoCompleto.trim();

    if (!nome || nome.length < 3) {
      setErro('Por favor, preencha o Nome Completo ou Razão Social do declarante.');
      return;
    }

    if (!docIdentificacao || docIdentificacao.length < 5) {
      setErro('Por favor, informe o CPF ou CNPJ válido do declarante.');
      return;
    }

    if (!endereco || endereco.length < 5) {
      setErro('Por favor, informe o Endereço Completo de residência/sede.');
      return;
    }

    const dados = {
      nomeCompleto: nome,
      nacionalidade: nacionalidade.trim() || 'brasileiro(a)',
      estadoCivil: estadoCivil.trim() || 'não informado',
      profissao: profissao.trim() || 'não informada',
      cpfCnpj: docIdentificacao,
      rg: rg.trim() || 'não informado',
      enderecoCompleto: endereco,
      cidadeUf: cidadeUf.trim(),
    };

    onConfirm(dados, () => {
      handleLimparCampos();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Faixa decorativa superior */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-yellow-400 to-emerald-600 rounded-t-3xl" />

        {/* Cabeçalho do Modal */}
        <div className="p-5 sm:p-6 border-b border-slate-800 pt-6 flex items-start justify-between bg-slate-900/95">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 flex-shrink-0 mt-0.5">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                <span>Serviço Notarial e Registral</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white leading-tight">
                Dados para Autenticação em Cartório
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Preencha os dados do declarante para compor a Capa Declaratória de Autenticidade do relatório em PDF.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCancelar}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex-shrink-0 ml-2 cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumo informativo */}
        <div className="px-5 sm:px-6 py-2.5 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Domínio Oficial: <strong className="text-white font-mono">https://peticaonacional.online</strong></span>
          </span>
          <span>
            Total a autenticar: <strong className="text-emerald-400 font-mono">{totalAssinaturas}</strong> assinaturas
          </span>
        </div>

        {/* Mensagem de Erro de Validação */}
        {erro && (
          <div className="mx-5 sm:mx-6 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        {/* Formulário do Declarante com Rolagem se necessário */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 custom-scrollbar text-xs">
          
          {/* Nome Completo / Razão Social */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Nome Completo / Razão Social <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={nomeCompleto}
                onChange={(e) => {
                  setNomeCompleto(e.target.value);
                  if (erro) setErro('');
                }}
                placeholder="Ex: Fulano de Tal da Silva ou Associação XYZ"
                required
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
              />
            </div>
          </div>

          {/* Linha 2 Colunas: Nacionalidade e Estado Civil */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Nacionalidade
              </label>
              <input
                type="text"
                value={nacionalidade}
                onChange={(e) => setNacionalidade(e.target.value)}
                placeholder="brasileiro(a)"
                className="w-full px-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Estado Civil
              </label>
              <input
                type="text"
                value={estadoCivil}
                onChange={(e) => setEstadoCivil(e.target.value)}
                placeholder="Ex: casado(a), solteiro(a)..."
                className="w-full px-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
              />
            </div>
          </div>

          {/* Linha 2 Colunas: Profissão e RG */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Profissão
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={profissao}
                  onChange={(e) => setProfissao(e.target.value)}
                  placeholder="Ex: empresário(a), advogado(a)..."
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                RG (Carteira de Identidade)
              </label>
              <input
                type="text"
                value={rg}
                onChange={(e) => setRg(e.target.value)}
                placeholder="Ex: 12.345.678-9 SSP/SP"
                className="w-full px-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
              />
            </div>
          </div>

          {/* Linha 2 Colunas: CPF / CNPJ e Cidade/UF da Declaração */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                CPF / CNPJ <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={cpfCnpj}
                  onChange={(e) => {
                    setCpfCnpj(e.target.value);
                    if (erro) setErro('');
                  }}
                  placeholder="000.000.000-00 ou CNPJ"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Cidade / UF do Local da Declaração
              </label>
              <input
                type="text"
                value={cidadeUf}
                onChange={(e) => setCidadeUf(e.target.value)}
                placeholder="Ex: São Paulo - SP ou Brasília - DF"
                className="w-full px-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
              />
            </div>
          </div>

          {/* Endereço Completo */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Endereço Completo <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
              <textarea
                rows={2}
                value={enderecoCompleto}
                onChange={(e) => {
                  setEnderecoCompleto(e.target.value);
                  if (erro) setErro('');
                }}
                placeholder="Rua/Avenida, Número, Complemento, Bairro, Cidade - UF, CEP"
                required
                className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs resize-none"
              />
            </div>
          </div>

          {/* Nota Jurídica */}
          <div className="p-3 bg-slate-950/50 border border-slate-800/80 rounded-xl text-[11px] text-slate-400 leading-relaxed">
            As informações acima serão inseridas na <strong>Página 1 (Capa Declaratória)</strong> com formulário para reconhecimento de firma em Cartório (Tabelionato de Notas / Registro de Títulos e Documentos).
          </div>

          {/* Botões do Rodapé */}
          <div className="pt-3 border-t border-slate-800 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleCancelar}
              disabled={isGenerating}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-950/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Gerando PDF Declaratório...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Confirmar e Gerar PDF</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
