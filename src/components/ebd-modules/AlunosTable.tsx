import type { Aluno } from '../../lib/ebd';
import { Loader2, Shield, Power, Edit2, Trash2 } from 'lucide-react';

interface AlunosTableProps {
  loading: boolean;
  alunosFiltrados: Aluno[];
  selectedAlunoId: string | null;
  handleSelecionarParaConferencia: (aluno: Aluno) => void;
  handleAlternarStatus: (id: string, situacaoAtual: string) => void;
  handleEditar: (aluno: Aluno) => void;
  handleRemover: (id: string) => void;
}

export function AlunosTable({
  loading,
  alunosFiltrados,
  selectedAlunoId,
  handleSelecionarParaConferencia,
  handleAlternarStatus,
  handleEditar,
  handleRemover
}: AlunosTableProps) {
  return (
    <div className="flex-1 overflow-y-auto pt-4 pb-8 min-h-0">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-500 text-sm gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
            Carregando cadastros do sistema...
          </div>
        ) : alunosFiltrados.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-gray-50 border-b border-gray-100 z-10">
                <tr className="text-xs font-semibold text-gray-600 tracking-wider">
                  <th className="p-4">Nome</th>
                  <th className="p-4">Classe</th>
                  <th className="p-4">Telefone</th>
                  <th className="p-4">Situação</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {alunosFiltrados.map((a: Aluno) => {
                  const situacaoTexto = a.situacao || (a.ativo ? 'Ativo' : 'Inativo');
                  const isSup = (a as any).eSuperintendente;
                  const isSelected = selectedAlunoId === a.id;
                  return (
                    <tr 
                      key={a.id} 
                      onClick={() => handleSelecionarParaConferencia(a)}
                      className={`cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-blue-50/80 border-l-4 border-blue-500 shadow-sm' 
                          : 'hover:bg-gray-50/70'
                      }`}
                      title="Clique para conferir os dados rapidamente"
                    >
                      <td className="p-4 font-medium text-gray-900 flex items-center gap-2 flex-wrap">
                        {a.nome}
                        {isSup && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                            <Shield className="w-3 h-3" /> Superintendente
                          </span>
                        )}
                        {a.eProfessor && !isSup && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                            Professor
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-gray-600">{a.classe || a.turma || '-'}</td>
                      <td className="p-4 text-gray-600">{a.telefone || '-'}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          situacaoTexto === 'Ativo' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                            : 'bg-rose-50 text-rose-700 border-rose-100'
                        }`}>
                          {situacaoTexto}
                        </span>
                      </td>
                      <td className="p-4 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleAlternarStatus(a.id, situacaoTexto)}
                            className={`p-2 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-medium ${
                              situacaoTexto === 'Ativo' 
                                ? 'text-amber-600 hover:bg-amber-50' 
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={situacaoTexto === 'Ativo' ? 'Desativar Registro' : 'Ativar Registro'}
                          >
                            <Power className="w-4 h-4" />
                            {situacaoTexto === 'Ativo' ? 'Desativar' : 'Ativar'}
                          </button>
                          <button 
                            onClick={() => handleEditar(a)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-medium"
                            title="Editar Registro"
                          >
                            <Edit2 className="w-4 h-4" />
                            Editar
                          </button>
                          <button 
                            onClick={() => handleRemover(a.id)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-medium"
                            title="Excluir Registro"
                          >
                            <Trash2 className="w-4 h-4" />
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 text-sm">
            Nenhum registro encontrado.
          </div>
        )}
      </div>
    </div>
  );
}