import { Activity } from 'lucide-react';
import { formatarMesBR } from '../../../utils/dateUtils';

interface ComparativosGraficoProps {
  tipoVisualizacao: 'semana' | 'mes';
  mesFiltro: string;
  loading: boolean;
  dadosGraficoAtivo: any[];
}

export function ComparativosGrafico({
  tipoVisualizacao,
  mesFiltro,
  loading,
  dadosGraficoAtivo,
}: ComparativosGraficoProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/85 shadow-sm p-6 md:p-8 space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-600" />
          {tipoVisualizacao === 'semana' 
            ? `Evolução Semanal — ${formatarMesBR(mesFiltro)}` 
            : 'Comparativo Histórico Mês a Mês'}
        </h3>
        <p className="text-xs text-slate-500">Passe o mouse sobre as colunas para identificar o período e o percentual exato.</p>
      </div>

      <div className="h-72 border-b border-l border-slate-200 relative flex items-end justify-around px-4 md:px-8 pb-4 pt-10 bg-slate-50/50 rounded-xl overflow-x-visible">
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-25 p-4 pt-10">
          <div className="border-b border-dashed border-slate-400 w-full text-[10px] text-right pr-2 text-slate-500 font-bold">100%</div>
          <div className="border-b border-dashed border-slate-400 w-full text-[10px] text-right pr-2 text-slate-500 font-bold">75%</div>
          <div className="border-b border-dashed border-slate-400 w-full text-[10px] text-right pr-2 text-slate-500 font-bold">50%</div>
          <div className="border-b border-dashed border-slate-400 w-full text-[10px] text-right pr-2 text-slate-500 font-bold">25%</div>
          <div className="border-b border-slate-300 w-full text-[10px] text-right pr-2 text-slate-500 font-bold">0%</div>
        </div>

        {loading ? (
          <span className="text-xs text-slate-400 pb-28 z-10 font-medium">Sincronizando dados em tempo real...</span>
        ) : dadosGraficoAtivo.length > 0 ? (
          dadosGraficoAtivo.map((item: any, idx: number) => (
            <div key={idx} className="flex flex-col items-center gap-2 z-10 h-full justify-end group px-2 relative">
              <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-xl pointer-events-none whitespace-nowrap z-50">
                <span>{item.referencia}</span>
                <span>Frequência: {item.frequencia}</span>
                <span className="text-slate-300 font-normal">({item.presentes} presentes / {item.matriculados} matriculados)</span>
              </div>

              <span className="text-[10px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                {item.frequencia}
              </span>

              <div 
                className={`w-10 md:w-14 rounded-t-xl transition-all duration-500 shadow-md group-hover:brightness-110 ${item.cor?.bg || 'bg-indigo-600'}`} 
                style={{ height: `${item.frequenciaNum}%` }}
              ></div>

              <span className="text-[10px] font-bold text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-xs truncate max-w-[90px]" title={item.referencia}>
                {item.referencia}
              </span>
            </div>
          ))
        ) : (
          <span className="text-xs text-slate-400 pb-28 z-10">Nenhum registro encontrado para os filtros selecionados.</span>
        )}
      </div>
    </div>
  );
}