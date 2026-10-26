'use client';

import { useState } from 'react';
import { ShieldCheck, User, CreditCard, ArrowRight, AlertCircle, Lock } from 'lucide-react';

/**
 * Formulário Inicial de Identificação do Eleitor
 * Solicita Nome Completo e Título de Eleitor com validação rigorosa
 */
export default function IdentificationForm({ onSubmit }) {
  const [nome, setNome] = useState('');
  const [tituloEleitor, setTituloEleitor] = useState('');
  const [erro, setErro] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Máscara e higienização do Título de Eleitor (apenas números, máximo 12 dígitos)
  const handleTituloChange = (e) => {
    const rawVal = e.target.value.replace(/\D/g, '').slice(0, 12);
    setTituloEleitor(rawVal);
    if (erro) setErro('');
  };

  // Formatação visual amigável: 0000 0000 0000
  const formatTituloDisplay = (val) => {
    if (!val) return '';
    return val.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErro('');

    const nomeFormatado = nome.trim();
    const tituloLimpo = tituloEleitor.replace(/\D/g, '');

    if (!nomeFormatado || nomeFormatado.length < 3) {
      setErro('Por favor, informe seu nome completo (ao menos 3 letras).');
      return;
    }

    // Validação estrita por Regex (10 a 12 dígitos numéricos)
    const regexTitulo = /^[0-9]{10,12}$/;
    if (!regexTitulo.test(tituloLimpo)) {
      setErro('Título de Eleitor inválido. Digite entre 10 e 12 números.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSubmit({ nome: nomeFormatado, tituloEleitor: tituloLimpo });
    }, 400);
  };

  return (
    <div className="w-full max-w-xl mx-auto p-4 sm:p-6 animate-fade-in">
      <div className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md">
        
        {/* Faixa decorativa com as cores do Brasil */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-yellow-400 to-emerald-600 rounded-t-3xl" />

        {/* Cabeçalho */}
        <div className="text-center mb-8 pt-2">
          <div className="inline-flex items-center justify-center p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl mb-4 text-emerald-400 shadow-inner">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <span className="block text-xs uppercase tracking-widest font-bold text-emerald-400 mb-1">
            Petição Pública Oficial
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Identificação do Eleitor
          </h1>
          <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
            Para registrar seu apoio na Urna Eletrônica, informe seus dados oficiais. O sistema possui verificação contra fraude.
          </p>
        </div>

        {/* Mensagem de Erro */}
        {erro && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-400 text-sm animate-shake">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Atenção:</p>
              <p>{erro}</p>
            </div>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campo Nome */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Nome Completo <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={nome}
                onChange={(e) => {
                  setNome(e.target.value);
                  if (erro) setErro('');
                }}
                placeholder="Ex: João da Silva Santos"
                required
                autoComplete="name"
                className="w-full pl-12 pr-4 py-3.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Campo Título de Eleitor */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Título de Eleitor <span className="text-emerald-400">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {tituloEleitor.length}/12 dígitos
              </span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <CreditCard className="w-5 h-5" />
              </div>
              <input
                type="text"
                inputMode="numeric"
                value={formatTituloDisplay(tituloEleitor)}
                onChange={handleTituloChange}
                placeholder="0000 0000 0000"
                required
                maxLength={14}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              Apenas números. O sistema impede registros repetidos deste mesmo documento.
            </p>
          </div>

          {/* Selo Anti-Fraude */}
          <div className="bg-slate-950/60 border border-emerald-900/30 rounded-xl p-3.5 text-xs text-slate-400 flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-slate-200 block">Voto Único e Auditável</span>
              Registro criptografado via Supabase com validação direta de documento.
            </div>
          </div>

          {/* Botão de Envio */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-base rounded-xl shadow-lg shadow-emerald-900/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span>Carregando Urna...</span>
            ) : (
              <>
                <span>Avançar para a Urna Eletrônica</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
