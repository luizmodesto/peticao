'use client';

import React from 'react';
import { Scale, ShieldCheck, CheckCircle2, BookOpen, AlertCircle } from 'lucide-react';

/**
 * Modal Pop-up Inicial de Aviso Constitucional
 * Esclarece o resguardo democrático da petição segundo a Constituição Federal de 1988
 */
export default function ConstitutionalNoticeModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Faixa decorativa superior com as cores do Brasil */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-yellow-400 to-emerald-600 rounded-t-3xl" />

        {/* Cabeçalho */}
        <div className="text-center pt-2 pb-4 border-b border-slate-800">
          <div className="inline-flex items-center justify-center p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl mb-3 text-emerald-400 shadow-inner">
            <Scale className="w-8 h-8" />
          </div>
          <span className="block text-[11px] uppercase tracking-widest font-bold text-emerald-400 mb-1">
            REPÚBLICA FEDERATIVA DO BRASIL • CF/1988
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Exercício da Cidadania e Transparência
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Garantias Fundamentais da Soberania Popular e Legitimidade Democrática
          </p>
        </div>

        {/* Conteúdo com rolagem se necessário */}
        <div className="py-4 space-y-4 overflow-y-auto text-xs sm:text-sm text-slate-300 leading-relaxed pr-1 custom-scrollbar">
          
          <p>
            Esta plataforma é um instrumento cívico e pacífico de manifestação popular cidadã. 
            Informamos a todos os cidadãos brasileiros que a presente petição pública é um ato democrático 
            plenamente resguardado e protegido pela <strong>Constituição da República Federativa do Brasil de 1988</strong>:
          </p>

          {/* Destaque Artigo 1º, Parágrafo Único */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-500/30 relative overflow-hidden">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Artigo 1º, Parágrafo Único — Princípio Soberano</span>
            </div>
            <p className="italic text-slate-200 border-l-2 border-emerald-500 pl-3 my-1">
              &ldquo;Todo o poder emana do povo, que o exerce por meio de representantes eleitos ou diretamente, nos termos desta Constituição.&rdquo;
            </p>
          </div>

          {/* Destaque Artigo 5º, inciso XXXIV, alínea 'a' */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-teal-500/30 relative overflow-hidden">
            <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase tracking-wider mb-1.5">
              <BookOpen className="w-4 h-4" />
              <span>Artigo 5º, Inciso XXXIV, Alínea &ldquo;a&rdquo; — Direito de Petição</span>
            </div>
            <p className="italic text-slate-200 border-l-2 border-teal-500 pl-3 my-1">
              &ldquo;São a todos assegurados, independentemente do pagamento de taxas, o direito de petição aos Poderes Públicos em defesa de direitos ou contra ilegalidade ou abuso de poder;&rdquo;
            </p>
          </div>

          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800 text-xs text-slate-400">
            <p>
              Ao assinar, o eleitor declara seu legítimo interesse na integridade, confiabilidade e auditabilidade 
              do sufrágio universal, exercendo um direito fundamental inviolável de todo cidadão livre.
            </p>
          </div>

        </div>

        {/* Rodapé com botão Compreendi */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Participação democrática livre e transparente.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-emerald-950/50 active:scale-95 transition-all text-center"
          >
            Compreendi
          </button>
        </div>

      </div>
    </div>
  );
}
