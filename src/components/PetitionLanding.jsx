'use client';

import { useState } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Lock, 
  AlertCircle, 
  ExternalLink, 
  X, 
  Check, 
  ChevronRight,
  Scale,
  BookOpen
} from 'lucide-react';
import { validarTituloEleitor } from '@/lib/validarTituloEleitor';
import SignatureCounter from '@/components/SignatureCounter';
import ConstitutionalNoticeModal from '@/components/ConstitutionalNoticeModal';

const ESTADOS_BRASIL = [
  { sigla: 'AC', nome: 'Acre' }, { sigla: 'AL', nome: 'Alagoas' }, { sigla: 'AP', nome: 'Amapá' },
  { sigla: 'AM', nome: 'Amazonas' }, { sigla: 'BA', nome: 'Bahia' }, { sigla: 'CE', nome: 'Ceará' },
  { sigla: 'DF', nome: 'Distrito Federal' }, { sigla: 'ES', nome: 'Espírito Santo' }, { sigla: 'GO', nome: 'Goiás' },
  { sigla: 'MA', nome: 'Maranhão' }, { sigla: 'MT', nome: 'Mato Grosso' }, { sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { sigla: 'MG', nome: 'Minas Gerais' }, { sigla: 'PA', nome: 'Pará' }, { sigla: 'PB', nome: 'Paraíba' },
  { sigla: 'PR', nome: 'Paraná' }, { sigla: 'PE', nome: 'Pernambuco' }, { sigla: 'PI', nome: 'Piauí' },
  { sigla: 'RJ', nome: 'Rio de Janeiro' }, { sigla: 'RN', nome: 'Rio Grande do Norte' }, { sigla: 'RS', nome: 'Rio Grande do Sul' },
  { sigla: 'RO', nome: 'Rondônia' }, { sigla: 'RR', nome: 'Roraima' }, { sigla: 'SC', nome: 'Santa Catarina' },
  { sigla: 'SP', nome: 'São Paulo' }, { sigla: 'SE', nome: 'Sergipe' }, { sigla: 'TO', nome: 'Tocantins' },
];

export default function PetitionLanding({ onSubmit }) {
  const [nome, setNome] = useState('');
  const [tituloEleitor, setTituloEleitor] = useState('');
  const [estado, setEstado] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [email, setEmail] = useState('');

  // Caixas de seleção obrigatórias da DECLARAÇÃO DE APOIO
  const [concordaTermos, setConcordaTermos] = useState(false);
  const [declaraVerdadeiro, setDeclaraVerdadeiro] = useState(false);

  const [erro, setErro] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Controle do Modal dos Termos da Proposta
  const [modalTermosAberto, setModalTermosAberto] = useState(false);

  // Pop-up Inicial de Aviso Constitucional (abre automaticamente na carga)
  const [modalConstitucionalAberto, setModalConstitucionalAberto] = useState(true);

  const handleTituloChange = (e) => {
    const rawVal = e.target.value.replace(/\D/g, '').slice(0, 12);
    setTituloEleitor(rawVal);
    if (erro) setErro('');
  };

  const formatTituloDisplay = (val) => {
    if (!val) return '';
    return val.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  // Ação ao clicar no botão "Li e Aceito" do Modal
  const handleAceitarTermosNoModal = () => {
    setConcordaTermos(true);
    setModalTermosAberto(false);
    if (erro) setErro('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErro('');

    const nomeFormatado = nome.trim();
    const tituloLimpo = tituloEleitor.replace(/\D/g, '');
    const emailFormatado = email.trim().toLowerCase();
    const municipioFormatado = municipio.trim();

    if (!nomeFormatado || nomeFormatado.length < 3) {
      setErro('Por favor, informe seu Nome Completo (mínimo 3 caracteres).');
      return;
    }

    if (!estado) {
      setErro('Selecione o Estado (UF) do seu domicílio eleitoral.');
      return;
    }

    // Validação Algorítmica Oficial do TSE (Módulo 11) e Validação Cruzada com o Estado (UF)
    if (!validarTituloEleitor(tituloLimpo, estado)) {
      setErro('Título de eleitor inválido ou não correspondente ao estado selecionado.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailFormatado)) {
      setErro('Por favor, informe um endereço de E-mail válido.');
      return;
    }

    if (!concordaTermos) {
      setErro('É obrigatório concordar com os termos da proposta.');
      return;
    }

    if (!declaraVerdadeiro) {
      setErro('É obrigatório declarar que suas informações são verdadeiras.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSubmit({
        nome: nomeFormatado,
        tituloEleitor: tituloLimpo,
        estado,
        municipio: municipioFormatado,
        email: emailFormatado,
      });
    }, 300);
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-2 sm:py-6 px-3 sm:px-6 animate-fade-in select-none">
      
      {/* Pop-up Inicial de Aviso Constitucional (Abre Automaticamente) */}
      <ConstitutionalNoticeModal
        isOpen={modalConstitucionalAberto}
        onClose={() => setModalConstitucionalAberto(false)}
      />
      {/* CABEÇALHO DO DOCUMENTO OFICIAL                           */}
      {/* ======================================================== */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md relative overflow-hidden mb-8">
        <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-emerald-500 via-yellow-400 to-emerald-600" />

        <div className="text-center pt-2">
          <div className="inline-flex items-center px-3.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-xs font-bold text-emerald-400 mb-4">
            <span>INICIATIVA POPULAR • LEI Nº 9.709/1998</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase leading-tight">
            PETIÇÃO NACIONAL PELA TRANSPARÊNCIA ELEITORAL
          </h1>

          <p className="text-base sm:text-lg font-semibold text-emerald-400 mt-2">
            Sua participação fortalece a democracia
          </p>

          <p className="text-xs sm:text-sm text-slate-300 mt-4 max-w-2xl mx-auto leading-relaxed">
            Esta iniciativa propõe a discussão de mecanismos complementares de auditoria cidadã digital, 
            com o objetivo de ampliar a transparência e a confiança da população nos processos eleitorais brasileiros.
          </p>
        </div>

        {/* BLOCO: O QUE ESTÁ SENDO PROPOSTO? */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-yellow-400" />
            O que está sendo proposto?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-300">
            <div className="flex items-start gap-2.5 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="text-emerald-400 font-bold mt-0.5">✅</span>
              <span>Plataforma nacional de participação cidadã.</span>
            </div>
            <div className="flex items-start gap-2.5 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="text-emerald-400 font-bold mt-0.5">✅</span>
              <span>Assinatura eletrônica para apoio à proposta.</span>
            </div>
            <div className="flex items-start gap-2.5 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="text-emerald-400 font-bold mt-0.5">✅</span>
              <span>Auditoria cidadã digital complementar.</span>
            </div>
            <div className="flex items-start gap-2.5 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="text-emerald-400 font-bold mt-0.5">✅</span>
              <span>Divulgação pública dos resultados e estudos técnicos.</span>
            </div>
            <div className="sm:col-span-2 flex items-start gap-2.5 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="text-emerald-400 font-bold mt-0.5">✅</span>
              <span>Respeito integral à Constituição Federal e ao sigilo do voto.</span>
            </div>
          </div>
        </div>

        {/* BLOCO: POR QUE APOIAR? */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Por que apoiar?
          </h2>
          <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl text-xs sm:text-sm text-slate-300 leading-relaxed">
            <p className="font-semibold text-emerald-300 mb-1">
              A democracia se fortalece quando o cidadão participa.
            </p>
            <p>
              A presente petição busca incentivar o debate nacional sobre novas ferramentas de transparência, 
              fiscalização social e participação popular, sempre dentro da legalidade e do respeito às instituições brasileiras.
            </p>
          </div>
        </div>

        {/* BLOCO: COMO PARTICIPAR? */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            Como participar?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
            {/* Card que também abre o Modal */}
            <div 
              onClick={() => setModalTermosAberto(true)}
              className="p-3.5 bg-slate-950/70 border border-slate-800 hover:border-emerald-500/50 rounded-2xl cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-emerald-400 font-bold text-sm">1️⃣ Passo</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
              </div>
              <h3 className="font-bold text-white mb-1">Leia a proposta</h3>
              <p className="text-[11px] text-slate-400 leading-snug">
                Conheça os detalhes do documento. <span className="text-emerald-400 underline font-medium">Clique para ler</span>.
              </p>
            </div>

            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl">
              <span className="font-mono text-emerald-400 font-bold text-sm block mb-1.5">2️⃣ Passo</span>
              <h3 className="font-bold text-white mb-1">Assine eletronicamente</h3>
              <p className="text-[11px] text-slate-400 leading-snug">
                Confirme seu apoio à discussão da proposta pelo formulário abaixo.
              </p>
            </div>

            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl">
              <span className="font-mono text-emerald-400 font-bold text-sm block mb-1.5">3️⃣ Passo</span>
              <h3 className="font-bold text-white mb-1">Compartilhe</h3>
              <p className="text-[11px] text-slate-400 leading-snug">
                Divulgue para amigos e familiares interessados na democracia.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* CONTADOR PÚBLICO DE ASSINATURAS (SUPABASE AGGREGATION)   */}
      {/* ======================================================== */}
      <SignatureCounter />

      {/* ======================================================== */}
      {/* FORMULÁRIO DE ASSINATURA ELETRÔNICA                      */}
      {/* ======================================================== */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md">
        
        {/* DECLARAÇÃO DE APOIO */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-400/10 border border-yellow-400/30 rounded-full text-xs font-bold text-yellow-400 mb-2">
            <span>DECLARAÇÃO DE APOIO</span>
          </div>

          <p className="text-sm font-semibold text-slate-200 mb-4 italic">
            &ldquo;Eu apoio a abertura de debate nacional sobre mecanismos de auditoria cidadã digital e 
            iniciativas destinadas ao fortalecimento da transparência dos processos eleitorais brasileiros.&rdquo;
          </p>

          <div className="space-y-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
            
            {/* CHECKBOX 1 COM HIPERLINK EM "termos da proposta" */}
            <div className="flex items-start gap-3">
              <input
                id="checkbox-termos"
                type="checkbox"
                checked={concordaTermos}
                onChange={(e) => {
                  setConcordaTermos(e.target.checked);
                  if (erro) setErro('');
                }}
                className="w-5 h-5 mt-0.5 rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 bg-slate-900 cursor-pointer flex-shrink-0"
              />
              <label htmlFor="checkbox-termos" className="text-xs sm:text-sm text-slate-300 select-none cursor-pointer">
                <span className="text-emerald-400 font-bold">*</span> Li e concordo com os{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setModalTermosAberto(true);
                  }}
                  className="text-emerald-400 underline hover:text-emerald-300 font-bold cursor-pointer inline-flex items-center gap-0.5 hover:opacity-90 transition-all focus:outline-none focus:ring-1 focus:ring-emerald-400 rounded"
                >
                  termos da proposta
                </button>.
              </label>
            </div>

            {/* CHECKBOX 2 */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={declaraVerdadeiro}
                onChange={(e) => {
                  setDeclaraVerdadeiro(e.target.checked);
                  if (erro) setErro('');
                }}
                className="w-5 h-5 mt-0.5 rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 bg-slate-900 cursor-pointer flex-shrink-0"
              />
              <span className="text-xs sm:text-sm text-slate-300 group-hover:text-white transition-colors">
                <span className="text-emerald-400 font-bold">*</span> Declaro que minhas informações são verdadeiras.
              </span>
            </label>

          </div>
        </div>

        {erro && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-400 text-sm animate-shake">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Atenção:</p>
              <p>{erro}</p>
            </div>
          </div>
        )}

        {/* DADOS DO APOIADOR */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="border-b border-slate-800 pb-2 mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              DADOS DO APOIADOR
            </h3>
          </div>

          {/* Nome Completo */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Nome Completo <span className="text-emerald-400">*</span>
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => {
                setNome(e.target.value);
                if (erro) setErro('');
              }}
              placeholder="Digite seu nome completo"
              required
              className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>

          {/* Título de Eleitor */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Título de Eleitor <span className="text-emerald-400">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {tituloEleitor.length}/12 dígitos
              </span>
            </div>
            <input
              type="text"
              inputMode="numeric"
              value={formatTituloDisplay(tituloEleitor)}
              onChange={handleTituloChange}
              placeholder="0000 0000 0000"
              required
              maxLength={14}
              className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-400" />
              Apenas números. O sistema impede registros repetidos deste mesmo documento.
            </p>
          </div>

          {/* Estado (UF) e Município */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Estado (UF) <span className="text-emerald-400">*</span>
              </label>
              <select
                value={estado}
                onChange={(e) => {
                  setEstado(e.target.value);
                  if (erro) setErro('');
                }}
                required
                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm cursor-pointer"
              >
                <option value="">Selecione o seu Estado</option>
                {ESTADOS_BRASIL.map((uf) => (
                  <option key={uf.sigla} value={uf.sigla}>
                    {uf.sigla} - {uf.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Município
              </label>
              <input
                type="text"
                value={municipio}
                onChange={(e) => {
                  setMunicipio(e.target.value);
                  if (erro) setErro('');
                }}
                placeholder="Ex: São Paulo"
                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
          </div>

          {/* E-mail */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              E-mail <span className="text-emerald-400">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (erro) setErro('');
              }}
              placeholder="seuemail@exemplo.com"
              required
              className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs text-slate-400 flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>
              Dados protegidos nos termos da <strong>LGPD (Lei nº 13.709/2018)</strong> exclusivamente para fins de auditoria cidadã.
            </span>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-base sm:text-lg rounded-xl shadow-lg shadow-emerald-950/40 active:scale-[0.99] transition-all flex items-center justify-center gap-2 group disabled:opacity-60"
            >
              {isLoading ? (
                <span>Validando Informações...</span>
              ) : (
                <>
                  <span className="tracking-wider">[ ASSINAR ELETRONICAMENTE ]</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">
            Transparência • Participação • Democracia
          </p>
          <p className="text-[11px] text-slate-500 mt-1 italic">
            &ldquo;Mais participação cidadã, mais confiança nas instituições, mais democracia para o Brasil.&rdquo;
          </p>
        </div>
      </div>

      {/* ================================================================= */}
      {/* MODAL (POP-UP) COM TEXTO INTEGRAL DA PETIÇÃO E INTERAÇÃO DE ACEITE */}
      {/* ================================================================= */}
      {modalTermosAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in select-none">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            
            {/* Faixa Superior com Cores do Brasil */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-yellow-400 to-emerald-600" />

            {/* Cabeçalho Fixo do Modal */}
            <div className="flex items-start justify-between p-5 sm:p-6 border-b border-slate-800 pt-6 bg-slate-900/95">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 flex-shrink-0 mt-0.5">
                  <Scale className="w-6 h-6" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                    <span>Documento Oficial</span>
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-white leading-tight uppercase">
                    PETIÇÃO POPULAR PELA TRANSPARÊNCIA E AUDITORIA CIDADÃ DO PROCESSO ELEITORAL BRASILEIRO
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
                    Ao Congresso Nacional, ao Tribunal Superior Eleitoral (TSE), ao Ministério Público e às demais autoridades.
                  </p>
                </div>
              </div>

              {/* Botão de Fechar no Canto Superior Direito (X) */}
              <button 
                type="button" 
                onClick={() => setModalTermosAberto(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex-shrink-0 ml-2"
                title="Fechar sem aceitar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Corpo com Barra de Rolagem Vertical (overflow-y-auto) */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed text-justify">
              
              {/* PREÂMBULO */}
              <section className="bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-800/80">
                <h3 className="text-xs sm:text-sm font-black text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-3.5 bg-emerald-500 rounded-sm" />
                  PREÂMBULO
                </h3>
                <p className="mb-3 text-slate-300">
                  Nós, cidadãos brasileiros abaixo assinados, no exercício dos direitos assegurados pela Constituição da República Federativa do Brasil de 1988, especialmente os princípios da soberania popular, da cidadania, da publicidade dos atos públicos e da transparência administrativa, vimos apresentar a presente petição visando fortalecer a confiança da população no processo eleitoral brasileiro.
                </p>
                <p className="text-slate-300">
                  A presente iniciativa tem como objetivo propor a discussão e eventual implementação de mecanismos complementares de auditoria cidadã, por meios eletrônicos seguros, que permitam maior participação popular na fiscalização dos resultados eleitorais, sempre em conformidade com a legislação vigente e com as garantias constitucionais do voto secreto.
                </p>
              </section>

              {/* FUNDAMENTAÇÃO LEGAL */}
              <section className="bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-800/80">
                <h3 className="text-xs sm:text-sm font-black text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-3.5 bg-emerald-500 rounded-sm" />
                  FUNDAMENTAÇÃO LEGAL
                </h3>
                <p className="mb-2 text-slate-400">
                  A presente petição fundamenta-se nos seguintes dispositivos:
                </p>
                <div className="space-y-2.5 pl-2">
                  <div className="border-l-2 border-emerald-500/50 pl-3">
                    <strong className="text-white block text-xs">Artigo 1º, parágrafo único, da Constituição Federal:</strong>
                    <span className="text-slate-300 italic">
                      &ldquo;Todo o poder emana do povo, que o exerce por meio de representantes eleitos ou diretamente, nos termos desta Constituição.&rdquo;
                    </span>
                  </div>
                  <div className="border-l-2 border-emerald-500/50 pl-3">
                    <strong className="text-white block text-xs">Artigo 5º, inciso XXXIV, alínea &ldquo;a&rdquo;, da Constituição Federal:</strong>
                    <span className="text-slate-300 italic">
                      &ldquo;São a todos assegurados, independentemente do pagamento de taxas, o direito de petição aos Poderes Públicos em defesa de direitos ou contra ilegalidade ou abuso de poder.&rdquo;
                    </span>
                  </div>
                  <div className="border-l-2 border-emerald-500/50 pl-3">
                    <strong className="text-white block text-xs">Artigo 14 da Constituição Federal:</strong>
                    <span className="text-slate-300 italic">
                      &ldquo;A soberania popular será exercida pelo sufrágio universal e pelo voto direto e secreto, com valor igual para todos.&rdquo;
                    </span>
                  </div>
                  <div className="border-l-2 border-emerald-500/50 pl-3">
                    <strong className="text-white block text-xs">Lei nº 9.709/1998:</strong>
                    <span className="text-slate-300 italic">
                      Regulamenta a participação popular por meio de instrumentos democráticos no Brasil.
                    </span>
                  </div>
                </div>
              </section>

              {/* DOS PEDIDOS */}
              <section className="bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-800/80">
                <h3 className="text-xs sm:text-sm font-black text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-3.5 bg-emerald-500 rounded-sm" />
                  DOS PEDIDOS
                </h3>
                <p className="mb-3 text-slate-400">
                  Solicitamos que sejam estudadas, debatidas e avaliadas pelas autoridades competentes as seguintes propostas:
                </p>
                <ol className="list-decimal pl-5 space-y-2 text-slate-200">
                  <li>
                    A criação de uma plataforma eletrônica nacional de participação cidadã para fins exclusivos de auditoria popular dos processos eleitorais.
                  </li>
                  <li>
                    O desenvolvimento de um sistema seguro de autenticação eletrônica dos eleitores, utilizando meios legalmente reconhecidos de identificação digital.
                  </li>
                  <li>
                    A disponibilização de uma &ldquo;urna virtual de auditoria cidadã&rdquo;, acessível por meio de link eletrônico oficial, onde cada eleitor pudesse registrar sua manifestação de forma independente e voluntária.
                  </li>
                  <li>
                    Que eventual participação nessa ferramenta utilize mecanismos seguros de validação da identidade do eleitor, resguardando integralmente o sigilo do voto, conforme determina a Constituição Federal.
                  </li>
                  <li>
                    Que os dados obtidos sejam utilizados exclusivamente para fins estatísticos, auditoria independente e comparação metodológica, observadas as normas de proteção de dados pessoais e da legislação eleitoral.
                  </li>
                  <li>
                    Que quaisquer estudos, resultados ou relatórios produzidos sejam públicos e acessíveis a toda a sociedade brasileira.
                  </li>
                </ol>
              </section>

              {/* DA JUSTIFICATIVA */}
              <section className="bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-800/80">
                <h3 className="text-xs sm:text-sm font-black text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-3.5 bg-emerald-500 rounded-sm" />
                  DA JUSTIFICATIVA
                </h3>
                <p className="mb-2 text-slate-300">
                  A confiança da população nas instituições democráticas constitui elemento fundamental para a estabilidade do Estado de Direito.
                </p>
                <p className="mb-3 text-slate-300">
                  A criação de mecanismos complementares de auditoria e participação popular pode contribuir para ampliar a transparência, fortalecer a fiscalização social e incentivar maior engajamento cívico da população brasileira.
                </p>
                <p className="font-semibold text-white mb-1.5">
                  Toda iniciativa dessa natureza deverá respeitar integralmente:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-300">
                  <li>O sigilo constitucional do voto;</li>
                  <li>A Lei Geral de Proteção de Dados (Lei nº 13.709/2018);</li>
                  <li>A legislação eleitoral vigente;</li>
                  <li>As competências constitucionais do Tribunal Superior Eleitoral;</li>
                  <li>As garantias de segurança da informação e de integridade dos dados.</li>
                </ul>
              </section>

              {/* CONCLUSÃO */}
              <section className="bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-800/80">
                <h3 className="text-xs sm:text-sm font-black text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-3.5 bg-emerald-500 rounded-sm" />
                  CONCLUSÃO
                </h3>
                <p className="mb-2 text-slate-300">
                  Diante do exposto, requeremos que as autoridades competentes promovam estudos técnicos, jurídicos e institucionais acerca da viabilidade de mecanismos de auditoria cidadã eletrônica que possam contribuir para o fortalecimento da transparência e da confiança pública no processo eleitoral brasileiro.
                </p>
                <p className="font-bold text-emerald-400">
                  Por uma democracia cada vez mais transparente, participativa e fortalecida.
                </p>
              </section>

            </div>

            {/* Rodapé Fixo do Modal com Ação de Aceite */}
            <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400 text-center sm:text-left flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                Ao aceitar, a declaração de apoio será confirmada automaticamente.
              </span>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setModalTermosAberto(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Fechar
                </button>

                {/* BOTÃO DE DESTAQUE: LI E ACEITO */}
                <button
                  type="button"
                  onClick={handleAceitarTermosNoModal}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <Check className="w-4 h-4" />
                  <span>Li e Aceito</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
