import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../../firebase';
import { FiltrosAniversariantes } from './filtrosAniversariantes';
import { TabelaAniversariantes } from './tabelaAniversariantes';
import type { Aniversariante } from './utilsAniversariantes';
import { filtrarESortAniversariantes, obterClassesOrdenadas, NOMES_MESES } from './utilsAniversariantes';

export function RelatorioAniversariantes() {
  const [tipoRelatorio, setTipoRelatorio] = useState<'nascimento' | 'casamento'>('nascimento');
  const [classeSelecionada, setClasseSelecionada] = useState<string>('todas');
  const [mesSelecionado, setMesSelecionado] = useState<string>('09');
  const [verAnoInteiro, setVerAnoInteiro] = useState<boolean>(false);
  
  const [alunos, setAlunos] = useState<Aniversariante[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function carregarAlunosDoFirebase() {
      try {
        const querySnapshot = await getDocs(collection(db, 'alunos'));
        const listaAlunos: Aniversariante[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          listaAlunos.push({
            id: doc.id,
            nome: data.nome || data.name || '',
            classe: data.classe || data.className || 'Sem Classe',
            dataNascimento: data.dataNascimento || data.nascimento || '',
            dataCasamento: data.dataCasamento || data.casamento || ''
          });
        });

        setAlunos(listaAlunos);
      } catch (error) {
        console.error('Erro ao buscar aniversariantes do Firebase:', error);
      } finally {
        setLoading(false);
      }
    }

    carregarAlunosDoFirebase();
  }, []);

  const classesDisponiveis = obterClassesOrdenadas(alunos);

  const dadosFiltrados = filtrarESortAniversariantes(
    alunos,
    tipoRelatorio,
    classeSelecionada,
    mesSelecionado,
    verAnoInteiro
  );

  const handleImprimir = () => {
    window.print();
  };

  const nomeMesAtual = NOMES_MESES[parseInt(mesSelecionado, 10)] || mesSelecionado;

  return (
    <div className="space-y-6">
      {/* Cabeçalho e Botão de Impressão Geral */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Relatório de Aniversariantes</h1>
          <p className="text-sm text-slate-500">Acompanhe os aniversários de nascimento e casamento por classe e período.</p>
        </div>
        <button
          onClick={handleImprimir}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors self-start sm:self-auto print:hidden"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          🖨️ Imprimir / Salvar PDF
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500">Carregando aniversariantes do banco de dados...</div>
      ) : (
        <>
          {/* Filtros Ocultos na Impressão */}
          <div className="print:hidden">
            <FiltrosAniversariantes
              tipoRelatorio={tipoRelatorio}
              setTipoRelatorio={setTipoRelatorio}
              classeSelecionada={classeSelecionada}
              setClasseSelecionada={setClasseSelecionada}
              mesSelecionado={mesSelecionado}
              setMesSelecionado={setMesSelecionado}
              verAnoInteiro={verAnoInteiro}
              setVerAnoInteiro={setVerAnoInteiro}
              classesDisponiveis={classesDisponiveis}
            />
          </div>

          {/* Cabeçalho exclusivo para Impressão */}
          <div className="hidden print:block bg-white p-6 max-w-[210mm] mx-auto text-slate-800">
            <div className="text-center mb-6 border-b pb-4">
              <h2 className="text-xl font-bold uppercase tracking-wide">Segunda Igreja Batista de Osasco</h2>
              <p className="text-sm font-medium text-slate-600 mt-1">
                Relatório de Aniversariantes de {tipoRelatorio === 'nascimento' ? 'Nascimento' : 'Casamento'} — {verAnoInteiro ? 'Ano Inteiro' : `Mês: ${nomeMesAtual}`}
              </p>
              <div className="text-xs text-slate-400 mt-1">Emitido em: {new Date().toLocaleDateString('pt-BR')}</div>
            </div>
          </div>

          {/* Tabela de Resultados */}
          <TabelaAniversariantes
            dados={dadosFiltrados}
            tipoRelatorio={tipoRelatorio}
            verAnoInteiro={verAnoInteiro}
          />
        </>
      )}
    </div>
  );
}