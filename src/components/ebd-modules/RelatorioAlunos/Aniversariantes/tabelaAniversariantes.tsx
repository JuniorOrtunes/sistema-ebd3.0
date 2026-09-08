import type { Aniversariante } from './utilsAniversariantes';
import { extrairDiaMes, formatarDataAniversario, calcularIdade, NOMES_MESES } from './utilsAniversariantes';

interface TabelaAniversariantesProps {
  dados: Aniversariante[];
  tipoRelatorio: 'nascimento' | 'casamento';
  verAnoInteiro: boolean;
}

export function TabelaAniversariantes({ dados, tipoRelatorio, verAnoInteiro }: TabelaAniversariantesProps) {
  let ultimoMesProcessado: number | null = null;

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
              <th className="py-3 px-6">Data de Aniv.</th>
              <th className="py-3 px-6">Idade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {dados.length > 0 ? (
              dados.map((item) => {
                const dataRaw = tipoRelatorio === 'nascimento' ? item.dataNascimento : item.dataCasamento;
                const { mes } = extrairDiaMes(dataRaw);
                
                // Verifica se deve exibir a linha divisoria do mês no modo Ano Inteiro
                let mostrarDivisorMes = false;
                if (verAnoInteiro && mes && mes !== ultimoMesProcessado) {
                  ultimoMesProcessado = mes;
                  mostrarDivisorMes = true;
                }

                const dataFormatada = formatarDataAniversario(dataRaw);
                const idade = tipoRelatorio === 'nascimento' ? calcularIdade(item.dataNascimento) : '-';

                return (
                  <>
                    {mostrarDivisorMes && (
                      <tr key={`divisor-${mes}`} className="bg-slate-100 font-bold text-slate-700">
                        <td colSpan={4} className="py-2 px-6 text-xs uppercase tracking-wider text-slate-600 border-t border-b border-slate-200">
                          — {NOMES_MESES[mes] || `MÊS ${mes}`} —
                        </td>
                      </tr>
                    )}
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors even:bg-slate-50/40">
                      <td className="py-3.5 px-6 font-medium text-slate-900">{item.nome || 'Nome não informado'}</td>
                      <td className="py-3.5 px-6 text-slate-600">{item.classe || 'Sem Classe'}</td>
                      <td className="py-3.5 px-6 text-slate-600">{dataFormatada}</td>
                      <td className="py-3.5 px-6 text-slate-600">{idade}</td>
                    </tr>
                  </>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="py-12 text-center text-slate-400">
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