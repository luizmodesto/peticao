'use client';

/**
 * Display (tela branca) da Urna Eletrônica
 * Renderiza fielmente a interface da urna eleitoral brasileira:
 * - Informações de domicílio eleitoral (UF)
 * - Dígitos piscando com cursor oficial
 * - Renderização da foto e dados do candidato ao atingir "22"
 * - Estado de Voto em Branco
 * - Telas de GRAVANDO e FIM
 */
export default function UrnaDisplay({
  digitos = '',
  isBranco = false,
  isGravando = false,
  isFim = false,
  eleitor = null,
}) {
  const is22 = digitos === '22';
  const isCompleto = digitos.length === 2;
  const isNulo = isCompleto && !is22;

  // Estado FIM
  if (isFim) {
    return (
      <div className="w-full h-full bg-[#f8fafc] text-black flex flex-col items-center justify-center p-6 border-4 border-slate-300 rounded-sm select-none">
        <div className="text-center">
          <h1 className="text-6xl sm:text-8xl font-black tracking-widest text-slate-900 mb-2 font-mono">
            F I M
          </h1>
          <span className="inline-block px-4 py-1 bg-emerald-700 text-white font-bold text-xs uppercase tracking-widest rounded">
            VOTOU
          </span>
          <p className="text-xs text-slate-600 mt-4">
            Seu apoio à Transparência Eleitoral foi gravado com sucesso.
          </p>
        </div>
      </div>
    );
  }

  // Estado GRAVANDO
  if (isGravando) {
    return (
      <div className="w-full h-full bg-[#f8fafc] text-black flex flex-col items-center justify-center p-6 border-4 border-slate-300 rounded-sm select-none">
        <div className="text-center animate-pulse">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-widest text-slate-800 font-mono">
            GRAVANDO...
          </h2>
          <p className="text-xs text-slate-500 mt-2">
            Auditando e registrando apoio na base de dados
          </p>
        </div>
      </div>
    );
  }

  // Estado VOTO EM BRANCO
  if (isBranco) {
    return (
      <div className="w-full h-full bg-[#f8fafc] text-black flex flex-col justify-between p-4 sm:p-5 border-4 border-slate-300 rounded-sm select-none font-sans">
        <div>
          <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
            SEU VOTO PARA
          </p>
          <h2 className="text-xs sm:text-sm font-bold text-slate-800 uppercase">
            PETIÇÃO NACIONAL • TRANSPARÊNCIA ELEITORAL
          </h2>
        </div>

        <div className="my-auto text-center py-6">
          <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-wider animate-pulse">
            VOTO EM BRANCO
          </h3>
        </div>

        <div className="border-t-2 border-slate-400 pt-2 text-[10px] sm:text-xs text-slate-700 leading-tight">
          <p className="font-bold">Aperte a tecla:</p>
          <p className="text-emerald-700 font-bold">VERDE para CONFIRMAR este voto</p>
          <p className="text-orange-600 font-bold">LARANJA para REINICIAR este voto</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#f8fafc] text-black flex flex-col justify-between p-3 sm:p-4 border-4 border-slate-300 rounded-sm select-none font-sans overflow-hidden">
      
      {/* Topo do Display com Cargo e Estado (UF) */}
      <div className="border-b border-slate-300/80 pb-1.5 mb-1">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[9px] sm:text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              SEU VOTO PARA
            </p>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-tight">
              PETIÇÃO NACIONAL • TRANSPARÊNCIA ELEITORAL
            </h2>
          </div>
          {eleitor?.estado && (
            <span className="text-[11px] font-mono font-bold bg-slate-200 border border-slate-300 px-2 py-0.5 rounded text-slate-800">
              UF: {eleitor.estado}
            </span>
          )}
        </div>
      </div>

      {/* Meio: Dígitos e Exibição do Candidato */}
      <div className="my-auto grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center py-1">
        
        {/* Coluna Esquerda: Número digitado e Dados do Candidato */}
        <div className={`${is22 ? 'sm:col-span-7' : 'sm:col-span-12'} space-y-2`}>
          
          {/* Linha dos Dígitos */}
          <div className="flex items-center gap-3">
            <span className="text-xs sm:text-sm font-semibold uppercase text-slate-700">
              Número:
            </span>
            <div className="flex gap-1.5">
              {/* Dígito 1 */}
              <div className="w-9 h-11 sm:w-11 sm:h-13 border-2 border-slate-800 bg-white flex items-center justify-center text-2xl sm:text-3xl font-black font-mono shadow-inner">
                {digitos[0] || ''}
                {digitos.length === 0 && (
                  <span className="w-0.5 h-6 sm:h-7 bg-black animate-urn-cursor" />
                )}
              </div>

              {/* Dígito 2 */}
              <div className="w-9 h-11 sm:w-11 sm:h-13 border-2 border-slate-800 bg-white flex items-center justify-center text-2xl sm:text-3xl font-black font-mono shadow-inner">
                {digitos[1] || ''}
                {digitos.length === 1 && (
                  <span className="w-0.5 h-6 sm:h-7 bg-black animate-urn-cursor" />
                )}
              </div>
            </div>
          </div>

          {/* Dados do Candidato ao digitar "22" */}
          {is22 && (
            <div className="space-y-1 text-left animate-fade-in pt-0.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[10px] sm:text-xs text-slate-500 font-semibold uppercase">Nome:</span>
                <span className="text-xs sm:text-sm font-black text-slate-900 uppercase">
                  Flávio Bolsonaro
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[10px] sm:text-xs text-slate-500 font-semibold uppercase">Vice:</span>
                <span className="text-[10px] sm:text-xs font-bold text-slate-800 uppercase">
                  Alfredo Gaspar
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[10px] sm:text-xs text-slate-500 font-semibold uppercase">Petição:</span>
                <span className="text-[10px] sm:text-xs font-bold text-emerald-700">
                  Transparência e Auditoria Cidadã
                </span>
              </div>
            </div>
          )}

          {/* Estado de Voto Nulo / Número Errado */}
          {isNulo && (
            <div className="p-2 bg-red-50 border border-red-300 rounded text-left">
              <p className="text-xs font-bold text-red-600 uppercase">
                NÚMERO ERRADO
              </p>
              <p className="text-sm font-black text-slate-900 uppercase">
                VOTO NULO
              </p>
            </div>
          )}
        </div>

        {/* Coluna Direita: Foto do Candidato (renderiza com 22) */}
        {is22 && (
          <div className="sm:col-span-5 flex justify-center sm:justify-end">
            <div className="w-28 sm:w-34 h-34 sm:h-40 border-2 border-slate-700 bg-slate-200 relative shadow-md overflow-hidden rounded-sm flex flex-col items-center">
              <img
                src="/foto.png"
                onError={(e) => {
                  e.currentTarget.src = 'https://i.imgur.com/oKrfPZh.png';
                }}
                alt="Foto do Candidato"
                className="w-full h-full object-cover object-top"
              />
              <span className="absolute bottom-0 inset-x-0 bg-slate-900/90 text-white text-[9px] text-center py-0.5 font-bold uppercase tracking-wider">
                PRESIDENTE
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Rodapé da tela da urna com instruções oficiais */}
      <div className="border-t-2 border-slate-400 pt-1.5 text-[10px] sm:text-xs text-slate-700 leading-tight">
        <p className="font-bold">Aperte a tecla:</p>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mt-0.5">
          <p className="text-emerald-700 font-bold">VERDE para CONFIRMAR</p>
          <p className="text-orange-600 font-bold">LARANJA para CORRIGIR</p>
        </div>
      </div>

    </div>
  );
}
