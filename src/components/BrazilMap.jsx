'use client';

import React, { useState, useMemo } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import brStatesTopoJson from '../../public/br-states.json';

// Mapeamento oficial de siglas para nomes completos
const ESTADOS_NOMES = {
  AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas', BA: 'Bahia',
  CE: 'Ceará', DF: 'Distrito Federal', ES: 'Espírito Santo', GO: 'Goiás',
  MA: 'Maranhão', MT: 'Mato Grosso', MS: 'Mato Grosso do Sul', MG: 'Minas Gerais',
  PA: 'Pará', PB: 'Paraíba', PR: 'Paraná', PE: 'Pernambuco', PI: 'Piauí',
  RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte', RS: 'Rio Grande do Sul',
  RO: 'Rondônia', RR: 'Roraima', SC: 'Santa Catarina', SP: 'São Paulo',
  SE: 'Sergipe', TO: 'Tocantins', ZZ: 'Exterior'
};

// Mapeamento reverso normalizado (sem acentos) para garantir resolução infalível
const NOME_PARA_UF = Object.entries(ESTADOS_NOMES).reduce((acc, [sigla, nome]) => {
  const normalizado = nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  acc[normalizado] = sigla;
  return acc;
}, {});

/**
 * Extrai a sigla da UF da geometria de forma resiliente
 */
function extrairSiglaUf(geo) {
  if (!geo) return '';
  
  // 1. Tenta geo.id (ex: 'SP', 'RJ')
  const id = String(geo.id || '').toUpperCase().trim();
  if (id && ESTADOS_NOMES[id]) {
    return id;
  }

  // 2. Tenta propriedades da geometria
  const props = geo.properties || {};
  const siglaProp = String(props.sigla || props.uf || props.UF || props.id || '').toUpperCase().trim();
  if (siglaProp && ESTADOS_NOMES[siglaProp]) {
    return siglaProp;
  }

  // 3. Tenta pelo nome por extenso
  const nomeProp = String(props.nome || props.name || props.NOME || '').trim();
  if (nomeProp) {
    const norm = nomeProp.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    if (NOME_PARA_UF[norm]) {
      return NOME_PARA_UF[norm];
    }
  }

  return id;
}

/**
 * Obtém a contagem de votos cruzando os dados do Supabase com a geometria
 */
function extrairVotos(sigla, votosPorEstado = {}) {
  if (!sigla || !votosPorEstado) return 0;
  
  // Busca por sigla direta (maiúscula)
  if (votosPorEstado[sigla] !== undefined) {
    return Number(votosPorEstado[sigla]) || 0;
  }
  // Busca por sigla minúscula
  if (votosPorEstado[sigla.toLowerCase()] !== undefined) {
    return Number(votosPorEstado[sigla.toLowerCase()]) || 0;
  }
  // Busca pelo nome completo
  const nomeCompleto = ESTADOS_NOMES[sigla];
  if (nomeCompleto && votosPorEstado[nomeCompleto] !== undefined) {
    return Number(votosPorEstado[nomeCompleto]) || 0;
  }
  
  return 0;
}

/**
 * Mapa Interativo do Brasil Oficial
 * Renderiza o mapa com escala exclusiva de VERDES (Proibido Vermelho) e Tooltip com dados exatos
 */
export default function BrazilMap({ votosPorEstado = {}, totalVotos = 0 }) {
  const [hoveredState, setHoveredState] = useState(null);

  // Calcula valores estatísticos para a escala
  const { maxVotos, minVotosComApoio } = useMemo(() => {
    const valores = Object.values(votosPorEstado)
      .map(v => Number(v) || 0)
      .filter(v => v > 0);

    return {
      maxVotos: valores.length > 0 ? Math.max(...valores) : 1,
      minVotosComApoio: valores.length > 0 ? Math.min(...valores) : 1,
    };
  }, [votosPorEstado]);

  // Escala de cores: Tons de VERDE exclusivamente (Zero Vermelho)
  // Verde base (#16a34a) -> Verde mais vibrante (#4ade80)
  const colorScale = useMemo(() => {
    return scaleLinear()
      .domain([minVotosComApoio, maxVotos])
      .range(['#16a34a', '#4ade80']);
  }, [minVotosComApoio, maxVotos]);

  /**
   * Determina a cor de preenchimento de cada estado:
   * - 0 assinaturas: Fundo escuro (#022c22 ou #1e293b) que harmoniza com o layout escuro
   * - >0 assinaturas: Escala de verde proporcional (base #16a34a até #4ade80)
   */
  const getCorEstado = (votos) => {
    if (!votos || votos <= 0) {
      return '#022c22'; // Verde extremamente escuro / ardósia escuro para 0 assinaturas
    }
    if (minVotosComApoio === maxVotos) {
      return '#22c55e'; // Verde vibrante de destaque quando todas as UFs têm votos iguais (ex: 1 voto)
    }
    return colorScale(votos);
  };

  return (
    <div className="relative w-full flex flex-col items-center justify-center p-2 select-none">
      
      {/* Container SVG do Mapa */}
      <div className="w-full max-w-[580px] aspect-square relative flex items-center justify-center">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 750,
            center: [-54, -15],
          }}
          className="w-full h-full filter drop-shadow-[0_12px_30px_rgba(0,0,0,0.7)]"
        >
          <Geographies geography={brStatesTopoJson || '/br-states.json'}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const sigla = extrairSiglaUf(geo);
                const nome = ESTADOS_NOMES[sigla] || geo.properties?.nome || sigla;
                const votos = extrairVotos(sigla, votosPorEstado);
                const corPreenchimento = getCorEstado(votos);

                const tooltipTexto = `${nome} (${sigla}): ${votos.toLocaleString('pt-BR')} ${votos === 1 ? 'assinatura' : 'assinaturas'}`;

                return (
                  <Geography
                    key={geo.rsmKey || sigla}
                    geography={geo}
                    fill={corPreenchimento}
                    data-tooltip-id="brazil-map-tooltip"
                    data-tooltip-content={tooltipTexto}
                    onMouseEnter={() => {
                      setHoveredState({
                        sigla,
                        nome,
                        votos,
                        porcentagem: totalVotos > 0 ? ((votos / totalVotos) * 100).toFixed(1) : '0.0',
                      });
                    }}
                    onMouseLeave={() => {
                      setHoveredState(null);
                    }}
                    style={{
                      default: {
                        fill: corPreenchimento,
                        stroke: '#0f172a',
                        strokeWidth: 1,
                        outline: 'none',
                        transition: 'fill 300ms ease, stroke 200ms ease',
                      },
                      hover: {
                        fill: '#22c55e', // Verde de destaque no hover
                        stroke: '#ffffff',
                        strokeWidth: 1.8,
                        outline: 'none',
                        cursor: 'pointer',
                        filter: 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.9))',
                      },
                      pressed: {
                        fill: '#15803d', // Verde profundo no click
                        stroke: '#ffffff',
                        strokeWidth: 1.5,
                        outline: 'none',
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
      </div>

      {/* Tooltip Oficial com react-tooltip */}
      <Tooltip
        id="brazil-map-tooltip"
        float={true}
        style={{
          backgroundColor: '#090d16',
          color: '#ffffff',
          border: '1px solid rgba(16, 185, 129, 0.5)',
          borderRadius: '12px',
          padding: '8px 14px',
          fontSize: '12px',
          fontWeight: '700',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.8), 0 0 15px rgba(16, 185, 129, 0.3)',
          zIndex: 9999,
          pointerEvents: 'none',
        }}
      />

      {/* Card Informativo do Estado em Foco (Abaixo do Mapa) */}
      <div className="w-full max-w-md mt-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300">
            {hoveredState ? (
              <>
                <strong>{hoveredState.nome} ({hoveredState.sigla})</strong>:
              </>
            ) : (
              'Passe o mouse sobre um estado no mapa:'
            )}
          </span>
        </div>

        <div className="font-mono font-bold text-emerald-400">
          {hoveredState ? (
            `${hoveredState.votos.toLocaleString('pt-BR')} ${hoveredState.votos === 1 ? 'assinatura' : 'assinaturas'} (${hoveredState.porcentagem}%)`
          ) : (
            '--'
          )}
        </div>
      </div>

      {/* Legenda de Intensidade de Cores (Exclusivamente Verde - Sem Vermelho) */}
      <div className="w-full max-w-md mt-3 flex items-center justify-between text-[11px] text-slate-400 px-2 pt-2 border-t border-slate-800/80">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-[#022c22] border border-slate-700 shadow-sm" />
          <span>0 assinaturas</span>
        </div>

        <div className="flex items-center gap-2">
          <span>Menos votos</span>
          <div className="w-20 h-2.5 rounded-full bg-gradient-to-r from-[#16a34a] via-[#22c55e] to-[#4ade80] shadow-sm" />
          <span className="text-emerald-400 font-semibold">Mais votos</span>
        </div>
      </div>

    </div>
  );
}
