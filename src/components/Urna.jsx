'use client';

import { useState } from 'react';
import confetti from 'canvas-confetti';
import UrnaDisplay from './UrnaDisplay';
import UrnaKeypad from './UrnaKeypad';
import FeedbackModal from './FeedbackModal';
import { urnaAudio } from '@/lib/urnaSound';
import { registrarApoioPeticao } from '@/lib/supabaseClient';
import { UserCheck, ArrowLeft, AlertCircle, MapPin } from 'lucide-react';

/**
 * Componente Principal da Urna Eletrônica
 * Integra o gabinete físico, display, teclado numérico, sintetizador sonoro
 * e envio com bloqueio contra fraude ao Supabase.
 */
export default function Urna({ eleitor, onBack }) {
  const [digitos, setDigitos] = useState('');
  const [isBranco, setIsBranco] = useState(false);
  const [isGravando, setIsGravando] = useState(false);
  const [isFim, setIsFim] = useState(false);
  const [mensagemAviso, setMensagemAviso] = useState('');

  // Estados do Modal de Feedback
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  });

  const handleNumero = (num) => {
    if (isGravando || isFim) return;
    if (isBranco) {
      urnaAudio.playErrorBeep();
      setMensagemAviso('Você pressionou BRANCO. Aperte CORRIGE para digitar o número 22.');
      return;
    }
    if (digitos.length >= 2) {
      urnaAudio.playErrorBeep();
      return;
    }

    setMensagemAviso('');
    setDigitos((prev) => prev + num);
  };

  const handleBranco = () => {
    if (isGravando || isFim) return;
    if (digitos.length > 0) {
      urnaAudio.playErrorBeep();
      setMensagemAviso('Para votar em BRANCO, a tela não pode conter números. Aperte CORRIGE primeiro.');
      return;
    }
    setMensagemAviso('');
    setIsBranco(true);
  };

  const handleCorrige = () => {
    if (isGravando || isFim) return;
    setDigitos('');
    setIsBranco(false);
    setMensagemAviso('');
  };

  const handleConfirma = async () => {
    if (isGravando || isFim) return;

    if (!isBranco && digitos.length < 2) {
      urnaAudio.playErrorBeep();
      setMensagemAviso('Digite os 2 números do candidato (22) antes de confirmar.');
      return;
    }

    const codigoFinal = isBranco ? 'BRANCO' : digitos;

    setIsGravando(true);
    setMensagemAviso('');

    const audioPromise = urnaAudio.playConfirmaSound();

    // Chamada ao Supabase com Estado (UF)
    const resultado = await registrarApoioPeticao({
      nome: eleitor.nome,
      tituloEleitor: eleitor.tituloEleitor,
      estado: eleitor.estado,
      email: eleitor.email,
      codigoVotado: codigoFinal,
    });

    await audioPromise;
    setIsGravando(false);

    if (resultado.success) {
      setIsFim(true);
      try {
        confetti({
          particleCount: 110,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#008744', '#fcd116', '#002776', '#ffffff'],
        });
      } catch (e) {}

      setTimeout(() => {
        setModalState({
          isOpen: true,
          type: 'success',
          title: 'Assinatura Registrada com Sucesso!',
          message: 'Seu apoio à Petição Nacional pela Transparência Eleitoral foi auditado e salvo.',
        });
      }, 1200);

    } else if (resultado.isDuplicate) {
      urnaAudio.playErrorBeep();
      setModalState({
        isOpen: true,
        type: 'duplicate',
        title: 'Bloqueio de Voto Duplicado',
        message: 'Este título de eleitor já registrou apoio nesta petição.',
      });
    } else {
      urnaAudio.playErrorBeep();
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Não foi possível registrar o apoio',
        message: resultado.error || 'Ocorreu um erro no processamento. Tente novamente.',
      });
    }
  };

  const handleReset = () => {
    setModalState({ isOpen: false, type: 'success', title: '', message: '' });
    setDigitos('');
    setIsBranco(false);
    setIsGravando(false);
    setIsFim(false);
    onBack();
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-2 sm:p-4 animate-fade-in select-none">
      
      {/* Barra de Status do Eleitor Identificado */}
      <div className="mb-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 uppercase font-semibold">Eleitor(a) Autenticado(a):</div>
            <div className="text-sm sm:text-base font-bold text-white capitalize">
              {eleitor.nome}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 mt-0.5">
              <span className="font-mono text-emerald-400 font-semibold">
                Título: {eleitor.tituloEleitor.replace(/(\d{4})(?=\d)/g, '$1 ')}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-300">
                <MapPin className="w-3 h-3 text-emerald-400" />
                Estado: <strong className="text-white">{eleitor.estado}</strong>
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onBack}
          disabled={isGravando || isFim}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 transition-colors w-fit disabled:opacity-50"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar para a Petição</span>
        </button>
      </div>

      {mensagemAviso && (
        <div className="mb-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-2 text-amber-300 text-xs sm:text-sm animate-shake">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{mensagemAviso}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* ESTRUTURA FÍSICA DA URNA ELETRÔNICA                      */}
      {/* ======================================================== */}
      <div className="urna-case rounded-t-3xl rounded-b-md border-4 border-slate-400 p-3 sm:p-6 relative shadow-2xl overflow-hidden">
        
        {/* Topo Angular Verde Oficial */}
        <div className="absolute top-0 left-0 right-0 h-7 sm:h-9 bg-gradient-to-r from-[#008744] via-[#009b4e] to-[#007038] shadow-md border-b-2 border-emerald-950 flex items-center justify-center">
          <span className="text-[10px] sm:text-xs font-black tracking-widest text-emerald-100 uppercase opacity-90">
            PETIÇÃO NACIONAL • TRANSPARÊNCIA E AUDITORIA CIDADÃ
          </span>
        </div>

        <div className="relative pt-6 sm:pt-8 grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-stretch">
          
          {/* Display da Urna (Tela Branca Recuada) */}
          <div className="md:col-span-7 bg-slate-300 p-2 sm:p-3 rounded-lg screen-recess flex flex-col min-h-[340px] sm:min-h-[420px]">
            <UrnaDisplay
              digitos={digitos}
              isBranco={isBranco}
              isGravando={isGravando}
              isFim={isFim}
              eleitor={eleitor}
            />
          </div>

          {/* Teclado Físico Virtual da Urna */}
          <div className="md:col-span-5 flex flex-col justify-between">
            <UrnaKeypad
              onPressNumero={handleNumero}
              onPressBranco={handleBranco}
              onPressCorrige={handleCorrige}
              onPressConfirma={handleConfirma}
              disabled={isGravando || isFim}
            />
          </div>

        </div>

        {/* Grade de Ventilação Inferior */}
        <div className="mt-6 pt-3 border-t border-slate-400/60 flex justify-center items-center gap-2 sm:gap-3 opacity-70">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="w-1.5 h-4 sm:h-5 bg-slate-800 rounded-sm" />
          ))}
        </div>

      </div>

      {/* Modal de Conclusão / Duplicidade */}
      <FeedbackModal
        isOpen={modalState.isOpen}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        eleitorInfo={eleitor}
        onReset={handleReset}
      />

    </div>
  );
}
