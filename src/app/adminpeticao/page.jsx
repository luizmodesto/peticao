'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import BrazilMap from '@/components/BrazilMap';
import {
  ShieldCheck,
  Lock,
  LogOut,
  User,
  Users,
  Trophy,
  BarChart3,
  MapPin,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Download,
  CheckCircle2,
  ArrowUpRight
} from 'lucide-react';

const ESTADOS_NOMES_COMPLETOS = {
  SP: 'São Paulo', MG: 'Minas Gerais', RJ: 'Rio de Janeiro', BA: 'Bahia',
  PR: 'Paraná', RS: 'Rio Grande do Sul', PE: 'Pernambuco', CE: 'Ceará',
  PA: 'Pará', SC: 'Santa Catarina', GO: 'Goiás', MA: 'Maranhão',
  PB: 'Paraíba', ES: 'Espírito Santo', AM: 'Amazonas', RN: 'Rio Grande do Norte',
  AL: 'Alagoas', PI: 'Piauí', MT: 'Mato Grosso', DF: 'Distrito Federal',
  MS: 'Mato Grosso do Sul', SE: 'Sergipe', RO: 'Rondônia', TO: 'Tocantins',
  AC: 'Acre', AP: 'Amapá', RR: 'Roraima', ZZ: 'Exterior'
};

const TODAS_UFS = Object.keys(ESTADOS_NOMES_COMPLETOS);

export default function AdminPeticaoPage() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Estados do formulário de login
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginErro, setLoginErro] = useState('');

  // Estados do Dashboard
  const [totalGeral, setTotalGeral] = useState(0);
  const [votosPorEstado, setVotosPorEstado] = useState({});
  const [dadosLoading, setDadosLoading] = useState(false);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);

  // 1. Verificação de Sessão do Supabase Auth
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      } catch (err) {
        console.error('[Admin Auth] Erro ao checar sessão:', err);
      } finally {
        setAuthLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Busca de dados estatísticos no Supabase
  const carregarDados = async () => {
    setDadosLoading(true);
    try {
      // 1. Total Geral e total de Estados
      const { data: statsData } = await supabase.rpc('obter_estatisticas_peticao');
      let total = 0;
      if (statsData && statsData.length > 0) {
        total = Number(statsData[0].total_apoios || 0);
        setTotalGeral(total);
      } else {
        const { count } = await supabase.from('peticao_votos').select('*', { count: 'exact', head: true });
        total = count || 0;
        setTotalGeral(total);
      }

      // 2. Agrupamento por Estado
      const { data: estadosData, error: errEstados } = await supabase.rpc('obter_votos_por_estado');
      
      const mapaContagem = {};
      TODAS_UFS.forEach(uf => { mapaContagem[uf] = 0; });

      if (!errEstados && Array.isArray(estadosData)) {
        estadosData.forEach((row) => {
          const uf = String(row.estado || '').toUpperCase();
          if (uf) {
            mapaContagem[uf] = Number(row.total || 0);
          }
        });
      }

      setVotosPorEstado(mapaContagem);
      setUltimaAtualizacao(new Date());
    } catch (err) {
      console.error('[Admin Dashboard] Erro ao carregar dados:', err);
    } finally {
      setDadosLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      carregarDados();
    }
  }, [user]);

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginErro('');
    setLoginLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailInput.trim(),
        password: passwordInput,
      });

      if (error) {
        setLoginErro(error.message === 'Invalid login credentials' 
          ? 'E-mail ou senha incorretos. Verifique suas credenciais de administrador.'
          : error.message);
      } else if (data?.user) {
        setUser(data.user);
      }
    } catch (err) {
      setLoginErro('Falha na autenticação. Verifique sua conexão.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // Ranking ordenado de estados (Leaderboard)
  const rankingEstados = useMemo(() => {
    return TODAS_UFS
      .map((uf) => ({
        uf,
        nome: ESTADOS_NOMES_COMPLETOS[uf] || uf,
        total: votosPorEstado[uf] || 0,
        porcentagem: totalGeral > 0 ? (((votosPorEstado[uf] || 0) / totalGeral) * 100).toFixed(1) : '0.0',
      }))
      .sort((a, b) => b.total - a.total);
  }, [votosPorEstado, totalGeral]);

  // Estado com mais votos
  const topEstado = useMemo(() => {
    if (!rankingEstados.length || rankingEstados[0].total === 0) {
      return { uf: '--', nome: 'Sem votos registrados', total: 0 };
    }
    return rankingEstados[0];
  }, [rankingEstados]);

  // Exportar dados em CSV
  const handleExportCSV = () => {
    const csvContent = [
      ['Posicao', 'UF', 'Estado', 'Assinaturas', 'Percentual'],
      ...rankingEstados.map((item, index) => [
        index + 1,
        item.uf,
        `"${item.nome}"`,
        item.total,
        `${item.porcentagem}%`
      ])
    ].map(e => e.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `peticao_ranking_estados_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Tela de Carregamento Inicial
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
          <p className="text-sm font-semibold tracking-wider">Verificando Credenciais Administrativas...</p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // BARREIRA DE AUTENTICAÇÃO: Tela de Login para Usuário não autenticado
  // =========================================================================
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden select-none">
        {/* Luz ambiente de fundo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md">
          {/* Faixa decorativa superior */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 rounded-t-3xl" />

          <div className="text-center mb-8 pt-2">
            <div className="inline-flex items-center justify-center p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl mb-4 text-emerald-400 shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            <span className="block text-xs uppercase tracking-widest font-bold text-emerald-400 mb-1">
              Área Restrita • Supabase Auth
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Painel Administrativo
            </h1>
            <p className="text-xs text-slate-400 mt-2">
              Acesso exclusivo para auditores e gestores da Petição Nacional
            </p>
          </div>

          {loginErro && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-400 text-xs sm:text-sm animate-shake">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Erro de Acesso:</p>
                <p>{loginErro}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                E-mail de Administrador
              </label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="admin@peticao.com.br"
                required
                className="w-full px-4 py-3 bg-slate-950/90 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Senha de Acesso
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full px-4 py-3 bg-slate-950/90 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-black text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-950/50 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loginLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Entrar no Painel</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-4 border-t border-slate-800/80 text-center text-[11px] text-slate-500">
            Acesso auditado e protegido por criptografia de ponta a ponta.
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // DASHBOARD PRINCIPAL (Usuário Autenticado)
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* =================================================================== */}
      {/* NAVBAR SUPERIOR FIXA                                                */}
      {/* =================================================================== */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        
        {/* Título & Logo à esquerda */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-950/40">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-sm sm:text-base text-white tracking-tight leading-none">
                Petição Nacional
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 uppercase tracking-wider">
                Admin Panel
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Painel de Auditoria e Gestão de Assinaturas
            </p>
          </div>
        </div>

        {/* Informações do Administrador & Botão Sair */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-950/60 border border-slate-800 rounded-xl text-xs">
            <User className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-300 font-mono text-[11px] truncate max-w-[180px]">
              {user.email}
            </span>
          </div>

          <button
            onClick={carregarDados}
            disabled={dadosLoading}
            title="Atualizar dados agora"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-4 h-4 ${dadosLoading ? 'animate-spin text-emerald-400' : ''}`} />
            <span className="hidden sm:inline">Atualizar</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-semibold text-xs transition-all flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair</span>
          </button>
        </div>
      </header>

      {/* =================================================================== */}
      {/* CONTEÚDO PRINCIPAL DO DASHBOARD                                     */}
      {/* =================================================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* ----------------------------------------------------------------- */}
        {/* CARDS DE RESUMO (TOPO) - Grid 2 Colunas                           */}
        {/* ----------------------------------------------------------------- */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          
          {/* CARD 1: TOTAL DE ASSINATURAS */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 blur-[50px] rounded-full pointer-events-none" />
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                TOTAL DE ASSINATURAS
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
                Auditado em Tempo Real
              </span>
            </div>

            <div>
              <div className="text-4xl sm:text-5xl font-black text-emerald-400 font-mono tracking-tight">
                {dadosLoading ? (
                  <span className="animate-pulse">---</span>
                ) : (
                  totalGeral.toLocaleString('pt-BR')
                )}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Assinaturas eletrônicas com Título de Eleitor oficial verificado
              </p>
            </div>
          </div>

          {/* CARD 2: ESTADO COM MAIS VOTOS */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-400/10 blur-[50px] rounded-full pointer-events-none" />
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-400" />
                ESTADO COM MAIS VOTOS
              </span>
              <span className="px-2.5 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-[11px] font-bold">
                Líder Nacional
              </span>
            </div>

            <div>
              <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight flex items-baseline gap-3">
                <span className="text-emerald-400">{topEstado.uf}</span>
                <span className="text-lg sm:text-xl font-normal text-slate-400">
                  ({topEstado.total.toLocaleString('pt-BR')})
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {topEstado.nome} lidera o volume de manifestações cidadãs ({topEstado.porcentagem}% do total)
              </p>
            </div>
          </div>

        </section>

        {/* ----------------------------------------------------------------- */}
        {/* ÁREA PRINCIPAL: MAPA INTERATIVO (2/3) E RANKING POR ESTADO (1/3)  */}
        {/* ----------------------------------------------------------------- */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* MAPA INTERATIVO DO BRASIL (7 ou 8 colunas) */}
          <div className="lg:col-span-7 xl:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-2 border-b border-slate-800/80 gap-2">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-400" />
                  MAPA INTERATIVO DO BRASIL
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Densidade de assinaturas por Unidade da Federação. Passe o cursor sobre o estado para ver o número exato.
                </p>
              </div>

              {ultimaAtualizacao && (
                <span className="text-[11px] text-slate-400 font-mono">
                  Sincronizado: {ultimaAtualizacao.toLocaleTimeString('pt-BR')}
                </span>
              )}
            </div>

            {/* Renderização do Mapa TopoJSON */}
            <div className="flex items-center justify-center min-h-[420px]">
              <BrazilMap votosPorEstado={votosPorEstado} totalVotos={totalGeral} />
            </div>
          </div>

          {/* RANKING POR ESTADO (Leaderboard rolável - 5 ou 4 colunas) */}
          <div className="lg:col-span-5 xl:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col">
            
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-400" />
                  RANKING POR ESTADO
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Classificação por volume de apoios
                </p>
              </div>

              <button
                onClick={handleExportCSV}
                title="Exportar dados em CSV"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="text-[11px]">CSV</span>
              </button>
            </div>

            {/* Lista rolável de estados com Leaderboard */}
            <div className="overflow-y-auto max-h-[460px] pr-1.5 space-y-2 custom-scrollbar">
              {rankingEstados.map((item, index) => {
                const isLeader = index === 0 && item.total > 0;
                const isTop3 = index < 3 && item.total > 0;

                return (
                  <div
                    key={item.uf}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      isLeader
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-white'
                        : isTop3
                        ? 'bg-slate-950/70 border-slate-800 text-slate-200'
                        : 'bg-slate-950/40 border-slate-800/60 text-slate-300'
                    }`}
                  >
                    {/* Posição e Identificação */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center flex-shrink-0 ${
                        index === 0
                          ? 'bg-yellow-400 text-slate-950 font-black'
                          : index === 1
                          ? 'bg-slate-300 text-slate-950 font-black'
                          : index === 2
                          ? 'bg-amber-600 text-white font-black'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {index + 1}
                      </span>

                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                          <span>{item.nome}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 font-mono">
                            {item.uf}
                          </span>
                        </div>

                        {/* Barra de progresso visual do percentual */}
                        <div className="w-24 sm:w-28 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                            style={{ width: `${Math.min(100, Math.max(item.total > 0 ? 3 : 0, Number(item.porcentagem)))}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Contagem Numérica Alinhada à Direita */}
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs sm:text-sm font-black font-mono text-emerald-400">
                        {item.total.toLocaleString('pt-BR')}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {item.porcentagem}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 mt-3 border-t border-slate-800/80 text-center">
              <span className="text-[11px] text-slate-400">
                Mostrando todos os 27 estados e Distrito Federal
              </span>
            </div>

          </div>

        </section>

      </main>

      {/* Rodapé Administrativo */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500">
        Petição Nacional pela Transparência Eleitoral • Sistema de Auditoria Cidadã • LGPD & CF/88
      </footer>
    </div>
  );
}
