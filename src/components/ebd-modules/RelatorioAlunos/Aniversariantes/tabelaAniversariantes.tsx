// Interface unificada para evitar erros de importação de módulos
import type { Aniversariante } from './utilsAniversariantes';

interface TabelaAniversariantesProps {
  dados: Aniversariante[];
  tipoRelatorio: 'nascimento' | 'casamento';
}

export function TabelaAniversariantes({ dados, tipoRelatorio }: TabelaAniversariantesProps) {
  const rotuloData = tipoRelatorio === 'nascimento' ? 'Data de Nascimento' : 'Data de Casamento';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 font-semibold text-slate-700 flex justify-between items-center">
        <span>Resultados da Listagem</span>
        <span className="text-xs font-normal text-slate-500">Total: {dados.length} registros</span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
              <th className="p-3">Nome</th>
              <th className="p-3">Classe</th>
              <th className="p-3">{rotuloData}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {dados.length > 0 ? (
              dados.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-medium">{item.nome}</td>
                  <td className="p-3 text-slate-500">{item.classe}</td>
                  <td className="p-3">
                    {tipoRelatorio === 'nascimento' ? item.dataNascimento || '-' : item.dataCasamento || '-'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="p-8 text-center text-slate-400">
                  Nenhum registro encontrado para os filtros selecionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}