import { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import { collection, getDocs } from 'firebase/firestore';

interface Aluno {
  id: string;
  nome: string;
  telefone?: string;
  celular?: string;
  status?: 'Ativo' | 'Inativo';
  classe?: string;
  [key: string]: any;
}

export function RelatorioAlunos() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function buscarAlunos() {
      try {
        const querySnapshot = await getDocs(collection(db, 'alunos'));
        const lista: Aluno[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Aluno[];

        // Ordenação alfabética estrita dos nomes
        lista.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));
        
        setAlunos(lista);
      } catch (error) {
        console.error("Erro ao carregar relatório de alunos:", error);
      } finally {
        setCarregando(false);
      }
    }
    buscarAlunos();
  }, []);

  const handleImprimir = () => {
    window.print();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded-xl shadow-sm space-y-6">
      {/* Cabeçalho com ações de impressão (oculto na hora de imprimir) */}
      <div className="flex justify-between items-center border-b pb-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Relatório Geral de Alunos</h1>
          <p className="text-sm text-slate-500">Escola Bíblica Dominical - Segunda Igreja Batista de Osasco</p>
        </div>
        <button
          onClick={handleImprimir}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors shadow-sm flex items-center gap-2"
        >
          🖨️ Imprimir / Salvar PDF
        </button>
      </div>

      {/* Conteúdo da listagem */}
      {carregando ? (
        <div className="text-center py-10 text-slate-500">Carregando dados dos alunos...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider bg-slate-50">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Nome do Aluno</th>
                <th className="py-3 px-4">Classe</th>
                <th className="py-3 px-4">Telefone</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {alunos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-slate-400">Nenhum aluno encontrado.</td>
                </tr>
              ) : (
                alunos.map((aluno, index) => (
                  <tr key={aluno.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 text-slate-400 w-12">{index + 1}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">{aluno.nome}</td>
                    <td className="py-3 px-4">{aluno.classe || 'Não informada'}</td>
                    <td className="py-3 px-4">{aluno.telefone || aluno.celular || 'Não informado'}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${
                        (aluno.status || 'Ativo') === 'Ativo' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {aluno.status || 'Ativo'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}