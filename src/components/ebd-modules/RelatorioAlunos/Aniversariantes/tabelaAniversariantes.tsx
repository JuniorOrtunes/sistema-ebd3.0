import type { Aniversariante } from './utilsAniversariantes';

interface TabelaAniversariantesProps {
  dados: Aniversariante[];
  tipoRelatorio: 'nascimento' | 'casamento';
}

export function TabelaAniversariantes({ dados, tipoRelatorio }: TabelaAniversariantesProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
        <h3 className="font-semibold text-slate-800 text-sm">Resultados da Listagem</h3>
        <span className="text-xs font-medium text-slate-500 bg-slate-200/60 px-2.5 py-1 rounded-full">
          Total: {dados.length} {dados.length === 1 ? 'registro' : 'registros'}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider">
              <th className="py-3 px-6">Nome</th>
              <th className="py-3 px-6">Classe</th>
              <th className="py-3 px-6">
                {tipoRelatorio === 'nascimento' ? 'Data de Nascimento' : 'Data de Casamento'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {dados.length > 0 ? (
              dados.map((item) => {
                const dataRaw = tipoRelatorio === 'nascimento' ? item.dataNascimento : item.dataCasamento;
                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors even:bg-slate-50/40">
                    <td className="py-3.5 px-6 font-medium text-slate-900">{item.nome || 'Nome não informado'}</td>
                    <td className="py-3.5 px-6 text-slate-600">{item.classe || 'Sem Classe'}</td>
                    <td className="py-3.5 px-6 text-slate-600">{dataRaw || '-'}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={3} className="py-12 text-center text-slate-400">
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