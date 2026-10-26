'use client';

import { CheckCircle2, AlertTriangle, XCircle, RotateCcw } from 'lucide-react';

/**
 * Modal de Feedback de Confirmação ou Erro da Petição
 * Notifica sucesso ou bloqueio por duplicidade de Título de Eleitor
 */
export default function FeedbackModal({
  isOpen,
  type = 'success',
  title,
  message,
  eleitorInfo,
  onReset,
}) {
  if (!isOpen) return null;

  const isSuccess = type === 'success';
  const isDuplicate = type === 'duplicate';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center overflow-hidden">
        
        {/* Faixa Superior com status */}
        <div
          className={`absolute top-0 left-0 right-0 h-2.5 ${
            isSuccess
              ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600'
              : isDuplicate
              ? 'bg-gradient-to-r from-amber-500 to-orange-500'
              : 'bg-gradient-to-r from-red-500 to-rose-600'
          }`}
        />

        {/* Ícone Central */}
        <div className="mx-auto my-3 flex items-center justify-center">
          {isSuccess && (
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500/10 border-2 border-emerald-500/40 rounded-full flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-950/50">
              <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
          )}

          {isDuplicate && (
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-500/10 border-2 border-amber-500/40 rounded-full flex items-center justify-center text-amber-400 shadow-lg shadow-amber-950/50">
              <AlertTriangle className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
          )}

          {!isSuccess && !isDuplicate && (
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-500/10 border-2 border-red-500/40 rounded-full flex items-center justify-center text-red-400 shadow-lg shadow-red-950/50">
              <XCircle className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
          )}
        </div>

        {/* Título Principal */}
        <h2 className="text-xl sm:text-2xl font-black text-white mt-2">
          {title}
        </h2>

        {/* Mensagem Explicativa */}
        <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
          {message}
        </p>

        {/* Comprovante Digital de Apoio */}
        {eleitorInfo && (
          <div className="my-5 p-4 bg-slate-950/90 border border-slate-800 rounded-2xl text-left text-xs sm:text-sm space-y-2 font-sans">
            <div className="flex justify-between items-center border-b border-slate-800/80 pb-1.5">
              <span className="text-slate-400">Eleitor:</span>
              <span className="font-bold text-white uppercase">{eleitorInfo.nome}</span>
            </div>

            <div className="flex justify-between items-center border-b border-slate-800/80 pb-1.5">
              <span className="text-slate-400">Título de Eleitor:</span>
              <span className="font-mono text-emerald-400 font-semibold">
                {eleitorInfo.tituloEleitor ? eleitorInfo.tituloEleitor.replace(/(\d{4})(?=\d)/g, '$1 ') : ''}
              </span>
            </div>

            <div className="flex justify-between items-center border-b border-slate-800/80 pb-1.5">
              <span className="text-slate-400">Estado (UF):</span>
              <span className="text-white font-bold">
                {eleitorInfo.estado}
              </span>
            </div>

            <div className="flex justify-between items-center border-b border-slate-800/80 pb-1.5">
              <span className="text-slate-400">E-mail:</span>
              <span className="text-slate-300 font-mono text-[11px]">{eleitorInfo.email}</span>
            </div>

            <div className="flex justify-between items-center pt-0.5">
              <span className="text-slate-400">Status Supabase:</span>
              <span className={`font-bold ${isSuccess ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isSuccess ? 'AUTENTICADO & REGISTRADO' : 'BLOQUEADO (DUPLICADO)'}
              </span>
            </div>
          </div>
        )}

        {/* Botão de Ação */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={onReset}
            className={`w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              isSuccess
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/50'
                : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isSuccess ? 'Concluir e Voltar ao Início' : 'Tentar com Outro Documento'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
