import { Users, Cake, Heart } from 'lucide-react';
import type { VisitanteItem, AniversarianteItem } from '../../../hooks/useEncerramento';

interface IndicadoresSecaoProps {
  visitantesDia: VisitanteItem[];
  nascimentosSemana: AniversarianteItem[];
  casamentosSemana: AniversarianteItem[];
}

export function IndicadoresSecao({
  visitantesDia,
  nascimentosSemana,
  casamentosSemana,
}: IndicadoresSecaoProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 border-t border-slate-100 pt-6">
      
      {/* VISITANTES DO DIA */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
          <Users className="w-4 h-4 text-amber-600" /> Visitantes ({visitantesDia.length})
        </h3>
        {visitantesDia.length > 0 ? (
          <div className="space-y-2">
            {visitantesDia.map((vis, idx) => (
              <div key={idx} className="bg-amber-50/50 p-3 rounded-xl border border-amber-100/60 flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-800">{vis.nome}</span>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">{vis.classe}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">Nenhum visitante registrado.</p>
        )}
      </div>

      {/* ANIVERSARIANTES DE NASCIMENTO */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
          <Cake className="w-4 h-4 text-indigo-600" /> Aniversários ({nascimentosSemana.length})
        </h3>
        {nascimentosSemana.length > 0 ? (
          <div className="space-y-2">
            {nascimentosSemana.map((aniv) => (
              <div key={aniv.id} className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/60 flex justify-between items-center">
                <div>
                  <p className="text-xs font-semibold text-slate-800">{aniv.nome}</p>
                  <p className="text-[10px] text-slate-500">{aniv.classe}</p>
                </div>
                <span className="text-xs font-bold bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-lg">{aniv.dataStr}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">Nenhum aniversariante na semana.</p>
        )}
      </div>

      {/* ANIVERSÁRIOS DE CASAMENTO COM BODAS */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-600" /> Casamentos ({casamentosSemana.length})
        </h3>
        {casamentosSemana.length > 0 ? (
          <div className="space-y-2">
            {casamentosSemana.map((aniv) => (
              <div key={aniv.id} className="bg-rose-50/50 p-3 rounded-xl border border-rose-100/60 flex justify-between items-center">
                <div>
                  <p className="text-xs font-semibold text-slate-800">{aniv.nome}</p>
                  <p className="text-[10px] text-slate-500">
                    {aniv.classe} {aniv.detalheAnos && <span className="font-bold text-rose-600">• {aniv.detalheAnos}</span>}
                  </p>
                </div>
                <span className="text-xs font-bold bg-rose-100 text-rose-800 px-2.5 py-1 rounded-lg">{aniv.dataStr}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">Nenhum aniversário de casamento.</p>
        )}
      </div>

    </div>
  );
}