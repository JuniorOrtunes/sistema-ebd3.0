import { Calendar, Layers, BarChart2 } from 'lucide-react';
import type { Classe } from './type';
import { formatarMesBR } from '../../../utils/dateUtils';

interface ComparativosFiltrosProps {
  tipoVisualizacao: 'semana' | 'mes';
  setTipoVisualizacao: (tipo: 'semana' | 'mes') => void;
  classeFiltro: string;
  setClasseFiltro: (classe: string) => void;
  mesFiltro: string;
  setMesFiltro: (mes: string) => void;
  listaClasses: Classe[];
  mesesDisponiveis: string[];
}

export function ComparativosFiltros({
  tipoVisualizacao,
  setTipoVisualizacao,
  classeFiltro,
  setClasseFiltro,
  mesFiltro,
  setMesFiltro,
  listaClasses,
  mesesDisponiveis,
}: ComparativosFiltrosProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/85 shadow-sm p-6 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-600" /> Relatórios Comparativos
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Análise de frequência e desempenho em tempo real</p>
        </div>
        
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-200/60 text-xs font-bold w-fit">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Tempo Real Ativo
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2 border-t border-slate-100">
        <div className="flex items-center bg-slate-100 p-1 rounded-xl w-fit">
          <button
            type="button"
            onClick={() => setTipoVisualizacao('semana')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              tipoVisualizacao === 'semana' ? 'bg-[#0A192F] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semana a semana
          </button>
          <button
            type="button"
            onClick={() => setTipoVisualizacao('mes')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              tipoVisualizacao === 'mes' ? 'bg-[#0A192F] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mês a mês
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Layers className="w-3 h-3" /> Sala / Classe
            </label>
            <select
              value={classeFiltro}
              onChange={(e) => setClasseFiltro(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-indigo-600 transition-colors"
            >
              <option value="todas">Todas as salas</option>
              {listaClasses.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>

          {tipoVisualizacao === 'semana' && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Mês de Referência
              </label>
              <select
                value={mesFiltro}
                onChange={(e) => setMesFiltro(e.target.value)}
                className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-indigo-600 transition-colors"
              >
                {mesesDisponiveis.map((mes) => (
                  <option key={mes} value={mes}>
                    {formatarMesBR(mes)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}