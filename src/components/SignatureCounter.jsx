'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Users, TrendingUp, ShieldCheck, RefreshCw } from 'lucide-react';

/**
 * Contador Público Oficial de Assinaturas da Petição Nacional
 * Realiza consulta de agregação (count) no Supabase em tempo real
 */
export default function SignatureCounter() {
  const [total, setTotal] = useState(null);
  const [estadosAtivos, setEstadosAtivos] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchContagem = async () => {
    try {
      // 1. Prioridade: Rota de API dinâmica sem cache estático (Next.js force-dynamic + cache: 'no-store')
      const resp = await fetch('/api/estatisticas', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      });

      if (resp.ok) {
        const dadosApi = await resp.json();
        if (dadosApi.success && typeof dadosApi.total === 'number') {
          setTotal(dadosApi.total);
          if (typeof dadosApi.estados === 'number' && dadosApi.estados > 0) {
            setEstadosAtivos(dadosApi.estados);
          }
          setLoading(false);
          return;
        }
      }
    } catch (apiErr) {
      console.warn('[SignatureCounter] Falha ao consultar /api/estatisticas, acionando fallback Supabase:', apiErr);
    }

    try {
      // 2. Fallback direto via RPC oficial de estatísticas (SECURITY DEFINER)
      const { data, error } = await supabase.rpc('obter_estatisticas_peticao');
      if (!error && data && data.length > 0) {
        setTotal(Number(data[0].total_apoios));
        setEstadosAtivos(Number(data[0].total_estados));
        setLoading(false);
        return;
      }

      // 3. Fallback secundário: select count
      const { count, error: errSelect } = await supabase
        .from('peticao_votos')
        .select('*', { count: 'exact', head: true });

      if (!errSelect && count !== null) {
        setTotal(count);
      }
    } catch (e) {
      console.warn('[SignatureCounter] Erro ao carregar contagem no fallback:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContagem();
    // Atualização periódica a cada 10 segundos em tempo real
    const interval = setInterval(fetchContagem, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full my-6 p-4 sm:p-6 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950 border border-emerald-500/30 rounded-3xl shadow-2xl relative overflow-hidden backdrop-blur-md">
      {/* Luz ambiente de destaque */}
      <div className="absolute top-0 right-0 w-64 h-32 bg-emerald-500/10 blur-[60px] rounded-full pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Lado Esquerdo: Ícone e Título */}
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner flex-shrink-0">
            <Users className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[11px] font-black tracking-widest uppercase text-emerald-400">
                AUDITORIA PÚBLICA EM TEMPO REAL
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white">
              Total de Assinaturas Registradas
            </h3>
            <p className="text-xs text-slate-400">
              Votos computados de eleitores brasileiros identificados
            </p>
          </div>
        </div>

        {/* Lado Direito: Número em Destaque */}
        <div className="flex flex-col items-center sm:items-end">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 font-mono tracking-tight drop-shadow-sm">
              {loading && total === null ? (
                <span className="animate-pulse">---</span>
              ) : (
                Number(total || 0).toLocaleString('pt-BR')
              )}
            </span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {total === 1 ? 'apoio' : 'apoios'}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
            {estadosAtivos !== null && (
              <span className="flex items-center gap-1 text-slate-300">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                Presente em <strong>{estadosAtivos}</strong> UFs
              </span>
            )}
            <button
              onClick={fetchContagem}
              title="Atualizar contagem"
              className="text-slate-400 hover:text-emerald-400 transition-colors p-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
