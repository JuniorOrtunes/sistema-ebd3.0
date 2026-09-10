import { TrendingUp } from 'lucide-react';

interface ComparativosTabelaProps {
  tipoVisualizacao: 'semana' | 'mes';
  dadosTabela: any[];
}

export function ComparativosTabela({
  tipoVisualizacao,
  dadosTabela,
}: ComparativosTabelaProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/85 shadow-sm p-6 md:p-8 space-y-4">
      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-indigo-600" />
        {tipoVisualizacao === 'semana' ? 'Detalhamento e Variação Semanal' : 'Detalhamento e Variação Mensal'}
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              <th className="py-3 px-4">{tipoVisualizacao === 'semana' ? 'Domingo' : 'Mês'}</th>
              <th className="py-3 px-4">Presentes</th>
              <th className="py-3 px-4">Matriculados</th>
              <th className="py-3 px-4">Frequência</th>
              <th className="py-3 px-4">{tipoVisualizacao === 'semana' ? 'Vs. Domingo Anterior' : 'Vs. Mês Anterior'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {dadosTabela.length > 0 ? (
              dadosTabela.map((item: any, index: number) => (
                <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-800">{item.referencia}</td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">{item.presentes}</td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">{item.matriculados}</td>
                  <td className="py-3.5 px-4">
                    <span className="bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-lg text-xs border border-indigo-100">
                      {item.frequencia}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-semibold">{item.vsAnterior}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                  Nenhum dado encontrado para os filtros selecionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}