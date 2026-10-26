'use client';

import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';

const geoUrl = '/br-states.json';

const ESTADOS_NOMES = {
  AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas', BA: 'Bahia',
  CE: 'Ceará', DF: 'Distrito Federal', ES: 'Espírito Santo', GO: 'Goiás',
  MA: 'Maranhão', MT: 'Mato Grosso', MS: 'Mato Grosso do Sul', MG: 'Minas Gerais',
  PA: 'Pará', PB: 'Paraíba', PR: 'Paraná', PE: 'Pernambuco', PI: 'Piauí',
  RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte', RS: 'Rio Grande do Sul',
  RO: 'Rondônia', RR: 'Roraima', SC: 'Santa Catarina', SP: 'São Paulo',
  SE: 'Sergipe', TO: 'Tocantins', ZZ: 'Exterior'
};

/**
 * Mapa Interativo do Brasil renderizado via TopoJSON com escala de cor proporcional aos votos
 */
export default function BrazilMap({ votosPorEstado = {}, totalVotos = 0 }) {
  const [tooltip, setTooltip] = useState(null);

  // Determina o valor máximo de votos em um único estado para calibrar a escala
  const maxVotos = Math.max(1, ...Object.values(votosPorEstado));

  // Escala de cores do verde mais sutil ao verde mais escuro/intenso
  const colorScale = scaleLinear()
    .domain([0, Math.max(1, maxVotos * 0.1), maxVotos])
    .range(['#1e293b', '#059669', '#10b981']);

  return (
    <div className="relative w-full flex flex-col items-center justify-center p-2">
      {/* Tooltip Dinâmico */}
      {tooltip && (
        <div
          className="absolute z-30 pointer-events-none px-3 py-2 rounded-xl bg-slate-950/95 border border-emerald-500/40 text-xs shadow-2xl backdrop-blur-md transition-all duration-75 text-center"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y - 65}px`,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="font-bold text-white flex items-center gap-1.5 justify-center">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{tooltip.nome} ({tooltip.uf})</span>
          </div>
          <div className="text-emerald-400 font-extrabold text-sm mt-0.5">
            {tooltip.votos.toLocaleString('pt-BR')} {tooltip.votos === 1 ? 'assinatura' : 'assinaturas'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {totalVotos > 0 ? ((tooltip.votos / totalVotos) * 100).toFixed(1) : 0}% do total nacional
          </div>
        </div>
      )}

      {/* Container SVG do Mapa */}
      <div className="w-full max-w-[580px] aspect-square relative flex items-center justify-center">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 750,
            center: [-54, -15],
          }}
          className="w-full h-full filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.6)]"
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const uf = geo.id;
                const votos = votosPorEstado[uf] || 0;
                const nome = ESTADOS_NOMES[uf] || geo.properties?.nome || uf;
                const corPreenchimento = votos > 0 ? colorScale(votos) : '#1e293b';

                return (
                  <Geography
                    key={geo.rsmKey || uf}
                    geography={geo}
                    onMouseEnter={(evt) => {
                      const rect = evt.target.getBoundingClientRect();
                      const parentRect = evt.target.closest('.aspect-square')?.getBoundingClientRect();
                      if (parentRect) {
                        setTooltip({
                          uf,
                          nome,
                          votos,
                          x: rect.left - parentRect.left + rect.width / 2,
                          y: rect.top - parentRect.top,
                        });
                      }
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    style={{
                      default: {
                        fill: corPreenchimento,
                        stroke: '#0f172a',
                        strokeWidth: 0.8,
                        outline: 'none',
                        transition: 'all 250ms',
                      },
                      hover: {
                        fill: '#34d399',
                        stroke: '#ffffff',
                        strokeWidth: 1.5,
                        outline: 'none',
                        cursor: 'pointer',
                        filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.8))',
                      },
                      pressed: {
                        fill: '#059669',
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

      {/* Legenda de Intensidade */}
      <div className="w-full max-w-sm mt-3 flex items-center justify-between text-[11px] text-slate-400 px-2 pt-2 border-t border-slate-800/80">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-[#1e293b] border border-slate-700" />
          <span>Sem votos</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-16 h-2.5 rounded-full bg-gradient-to-r from-[#059669] to-[#10b981]" />
          <span>Mais votos</span>
        </div>
      </div>
    </div>
  );
}
