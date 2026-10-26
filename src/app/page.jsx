'use client';

import { useState } from 'react';
import PetitionLanding from '@/components/PetitionLanding';
import Urna from '@/components/Urna';
import { ShieldCheck } from 'lucide-react';

export default function Home() {
  const [step, setStep] = useState(1); // 1 = Petição e Assinatura, 2 = Urna Eletrônica
  const [eleitor, setEleitor] = useState(null);

  const handlePetitionSubmit = (dadosEleitor) => {
    setEleitor(dadosEleitor);
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToPetition = () => {
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between py-6 px-2 sm:px-4 relative overflow-x-hidden">
      
      {/* Luz ambiente de fundo verde e dourada */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[650px] h-[320px] bg-emerald-600/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Navegação Superior de Passos */}
      <header className="w-full max-w-4xl mx-auto mb-4 text-center z-10">
        <div className="flex items-center justify-center gap-3 sm:gap-6 mt-1">
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${
                step === 1
                  ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20'
                  : 'bg-emerald-700 text-white'
              }`}
            >
              1
            </span>
            <span className={`text-xs font-semibold ${step === 1 ? 'text-white' : 'text-slate-400'}`}>
              Petição e Assinatura
            </span>
          </div>

          <div className="w-8 sm:w-16 h-0.5 bg-slate-800" />

          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${
                step === 2
                  ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              2
            </span>
            <span className={`text-xs font-semibold ${step === 2 ? 'text-white' : 'text-slate-400'}`}>
              Urna Virtual Oficial
            </span>
          </div>
        </div>
      </header>

      {/* Conteúdo Central: Passo 1 (Página Inicial da Petição) ou Passo 2 (Urna) */}
      <div className="flex-1 flex items-center justify-center w-full z-10">
        {step === 1 && (
          <PetitionLanding onSubmit={handlePetitionSubmit} />
        )}

        {step === 2 && eleitor && (
          <Urna eleitor={eleitor} onBack={handleBackToPetition} />
        )}
      </div>

      {/* Rodapé de Conformidade Legal e LGPD */}
      <footer className="w-full max-w-4xl mx-auto mt-8 pt-4 border-t border-slate-900 text-center text-xs text-slate-400 z-10 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Proteção de dados em estrita observância à LGPD (Lei nº 13.709/2018).</span>
        </div>
        <div className="text-slate-500 font-mono text-[11px]">
          Auditoria Cidadã Digital • Base Segura Supabase
        </div>
      </footer>

    </main>
  );
}
