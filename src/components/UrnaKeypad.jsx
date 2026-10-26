'use client';

import { useEffect } from 'react';
import { urnaAudio } from '@/lib/urnaSound';

/**
 * Teclado Virtual Numérico e de Ações da Urna Eletrônica
 * Inclui:
 * - Botões numéricos 0-9 com relevo 3D
 * - Tecla 5 com relevo tátil (ponto cego/braille)
 * - Botões de comando: BRANCO, CORRIGE (Laranja) e CONFIRMA (Verde)
 * - Integração sonora e suporte ao teclado físico
 */
export default function UrnaKeypad({
  onPressNumero,
  onPressBranco,
  onPressCorrige,
  onPressConfirma,
  disabled = false,
}) {

  // Disparo com áudio para os botões numéricos
  const handleNumClick = (num) => {
    if (disabled) return;
    urnaAudio.playKeyBeep();
    onPressNumero(num);
  };

  const handleBrancoClick = () => {
    if (disabled) return;
    urnaAudio.playKeyBeep();
    onPressBranco();
  };

  const handleCorrigeClick = () => {
    if (disabled) return;
    urnaAudio.playKeyBeep();
    onPressCorrige();
  };

  const handleConfirmaClick = () => {
    if (disabled) return;
    onPressConfirma();
  };

  // Suporte a digitação via teclado físico do computador
  useEffect(() => {
    const handlePhysicalKeyDown = (e) => {
      if (disabled) return;

      // Se o usuário estiver interagindo com um input de formulário, não interceptar
      if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleNumClick(e.key);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirmaClick();
      } else if (e.key === 'Backspace' || e.key === 'Escape') {
        e.preventDefault();
        handleCorrigeClick();
      }
    };

    window.addEventListener('keydown', handlePhysicalKeyDown);
    return () => window.removeEventListener('keydown', handlePhysicalKeyDown);
  }, [disabled, handleNumClick, handleConfirmaClick, handleCorrigeClick]);

  return (
    <div className="w-full bg-[#1e232a] border-4 border-slate-900 rounded-sm p-3.5 sm:p-5 flex flex-col justify-between shadow-2xl keypad-plate select-none">
      
      {/* Topo do Teclado: Brasão / Bandeira e Identificação "Petição Nacional" */}
      <div className="mb-4 bg-gradient-to-r from-emerald-700 via-emerald-800 to-emerald-900 border-2 border-emerald-950 p-2 sm:p-2.5 rounded flex items-center justify-between shadow-inner">
        <div className="flex items-center gap-2">
          {/* Bandeira do Brasil estilizada */}
          <div className="w-7 h-5 sm:w-8 sm:h-6 bg-emerald-600 rounded-sm relative flex items-center justify-center overflow-hidden border border-emerald-900">
            <div className="w-5 h-3.5 bg-yellow-400 rotate-45 flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-blue-700 rounded-full" />
            </div>
          </div>
          <span className="text-white font-extrabold text-xs sm:text-sm tracking-wide drop-shadow">
            Petição Nacional
          </span>
        </div>
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
      </div>

      {/* Grade Numérica (1 a 9 e 0) */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5 max-w-[280px] mx-auto w-full my-auto">
        {[
          ['1', '2', '3'],
          ['4', '5', '6'],
          ['7', '8', '9'],
        ].map((row, rIdx) => (
          row.map((num) => (
            <button
              key={num}
              type="button"
              disabled={disabled}
              onClick={() => handleNumClick(num)}
              className="key-3d h-12 sm:h-14 bg-gradient-to-b from-[#3a414b] to-[#21262d] text-white border-t border-slate-600 border-b border-black text-xl sm:text-2xl font-black rounded font-mono flex items-center justify-center hover:brightness-110 active:brightness-95 disabled:opacity-50"
            >
              <span>{num}</span>
              {/* Marcação tátil de acessibilidade no número 5 */}
              {num === '5' && (
                <span className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 opacity-60" />
              )}
            </button>
          ))
        ))}

        {/* Linha do número 0 (centralizado na coluna do meio) */}
        <div />
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleNumClick('0')}
          className="key-3d h-12 sm:h-14 bg-gradient-to-b from-[#3a414b] to-[#21262d] text-white border-t border-slate-600 border-b border-black text-xl sm:text-2xl font-black rounded font-mono flex items-center justify-center hover:brightness-110 active:brightness-95 disabled:opacity-50"
        >
          0
        </button>
        <div />
      </div>

      {/* Linha dos Botões de Ação da Urna: BRANCO, CORRIGE e CONFIRMA */}
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5 mt-5 pt-3 border-t border-slate-800 items-end">
        {/* Tecla BRANCO */}
        <button
          type="button"
          disabled={disabled}
          onClick={handleBrancoClick}
          className="key-3d h-11 sm:h-12 bg-gradient-to-b from-white to-slate-200 text-slate-900 border-t border-white border-b-2 border-slate-400 font-extrabold text-[10px] sm:text-xs uppercase tracking-wider rounded flex items-center justify-center hover:bg-slate-100 disabled:opacity-50"
        >
          BRANCO
        </button>

        {/* Tecla CORRIGE / JUSTIFICAR (Laranja) */}
        <button
          type="button"
          disabled={disabled}
          onClick={handleCorrigeClick}
          className="key-3d h-11 sm:h-12 bg-gradient-to-b from-orange-500 to-orange-600 text-white border-t border-orange-300 border-b-2 border-orange-900 font-extrabold text-[10px] sm:text-xs uppercase tracking-wider rounded flex items-center justify-center hover:brightness-110 disabled:opacity-50"
        >
          CORRIGE
        </button>

        {/* Tecla CONFIRMA (Verde - ligeiramente mais alta) */}
        <button
          type="button"
          disabled={disabled}
          onClick={handleConfirmaClick}
          className="key-3d h-14 sm:h-16 bg-gradient-to-b from-emerald-500 to-emerald-700 text-white border-t border-emerald-300 border-b-2 border-emerald-950 font-black text-xs sm:text-sm uppercase tracking-wider rounded flex items-center justify-center hover:brightness-110 active:scale-[0.98] shadow-lg shadow-emerald-950/40 disabled:opacity-50"
        >
          CONFIRMA
        </button>
      </div>

    </div>
  );
}
