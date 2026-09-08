import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { db } from '../../../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { ArrowLeft } from 'lucide-react';

interface Aluno {
  id: string;
  nome: string;
  telefone?: string;
  celular?: string;
  status?: string;
  classe?: string;
  [key: string]: any;
}

interface RelatorioAlunosProps {
  onVoltarParaDashboard?: () => void;
}

export default function RelatorioAlunos({ onVoltarParaDashboard }: RelatorioAlunosProps) {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [imprimindo, setImprimindo] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'alunos'),
      (querySnapshot) => {
        const lista: Aluno[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Aluno[];

        lista.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));
        setAlunos(lista);
        setCarregando(false);
      },
      (error) => {
        console.error("Erro ao carregar relatório de alunos em tempo real:", error);
        setCarregando(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleImprimir = () => {
    setImprimindo(true);
    setTimeout(() => {
      window.print();
      setImprimindo(false);
    }, 150);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded-xl shadow-sm space-y-6">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body > *:not(.print-portal-container) {
            display: none !important;
          }
          .print-portal-container {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
            z-index: 99999 !important;
          }
          tr {
            page-break-inside: avoid !important;
          }
          thead {
            display: table-header-group !important;
          }
        }
      `}} />

      <div className="flex justify-between items-center border-b pb-4">
        <div className="flex items-center gap-3">
          {onVoltarParaDashboard && (
            <button
              onClick={onVoltarParaDashboard}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
              title="Voltar ao Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Relatório Geral de Alunos</h1>
            <p className="text-sm text-slate-500">Escola Bíblica Dominical - Segunda Igreja Batista de Osasco</p>
          </div>
        </div>
        <button
          onClick={handleImprimir}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors shadow-sm flex items-center gap-2"
        >
          🖨️ Imprimir / Salvar PDF
        </button>
      </div>

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
                alunos.map((aluno, index) => {
                  const statusAtual = aluno.status || aluno.situacao || (aluno.ativo === false ? 'Inativo' : 'Ativo');
                  const isAtivo = statusAtual === 'Ativo' || statusAtual === true;
                  const textoStatus = isAtivo ? 'Ativo' : 'Inativo';

                  return (
                    <tr key={aluno.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 text-slate-400 w-12">{index + 1}</td>
                      <td className="py-3 px-4 font-medium text-slate-900">{aluno.nome}</td>
                      <td className="py-3 px-4">{aluno.classe || 'Não informada'}</td>
                      <td className="py-3 px-4">{aluno.telefone || aluno.celular || 'Não informado'}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${
                          isAtivo 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {textoStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {imprimindo && createPortal(
        <div className="print-portal-container p-8 bg-white">
          <div className="mb-6 border-b pb-4">
            <h1 className="text-2xl font-bold text-slate-900">Relatório Geral de Alunos</h1>
            <p className="text-sm text-slate-600">Escola Bíblica Dominical - Segunda Igreja Batista de Osasco ({alunos.length} alunos)</p>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-300 text-slate-700 text-xs uppercase tracking-wider bg-slate-100">
                <th className="py-2 px-3 border border-slate-300">#</th>
                <th className="py-2 px-3 border border-slate-300">Nome do Aluno</th>
                <th className="py-2 px-3 border border-slate-300">Classe</th>
                <th className="py-2 px-3 border border-slate-300">Telefone</th>
                <th className="py-2 px-3 border border-slate-300 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {alunos.map((aluno, index) => {
                const statusAtual = aluno.status || aluno.situacao || (aluno.ativo === false ? 'Inativo' : 'Ativo');
                const isAtivo = statusAtual === 'Ativo' || statusAtual === true;
                const textoStatus = isAtivo ? 'Ativo' : 'Inativo';

                return (
                  <tr key={aluno.id} className="border-b border-slate-200">
                    <td className="py-2 px-3 border border-slate-200 text-slate-500 w-12">{index + 1}</td>
                    <td className="py-2 px-3 border border-slate-200 font-medium text-slate-900">{aluno.nome}</td>
                    <td className="py-2 px-3 border border-slate-200">{aluno.classe || 'Não informada'}</td>
                    <td className="py-2 px-3 border border-slate-200">{aluno.telefone || aluno.celular || 'Não informado'}</td>
                    <td className="py-2 px-3 border border-slate-200 text-center font-semibold text-xs">
                      {textoStatus}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>,
        document.body
      )}
    </div>
  );
}