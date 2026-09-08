import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../../firebase';
import { FiltrosAniversariantes } from './filtrosAniversariantes';
import { TabelaAniversariantes } from './tabelaAniversariantes';
import type { Aniversariante } from './utilsAniversariantes';
import { filtrarESortAniversariantes } from './utilsAniversariantes';

export function RelatorioAniversariantes() {
  const [tipoRelatorio, setTipoRelatorio] = useState<'nascimento' | 'casamento'>('nascimento');
  const [classeSelecionada, setClasseSelecionada] = useState<string>('todas');
  const [mesSelecionado, setMesSelecionado] = useState<string>('03');
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

  // Extrair classes únicas disponíveis para o select baseadas nos dados do banco
  const classesDisponiveis = Array.from(new Set(alunos.map((item) => item.classe)));

  // Aplicar filtros e ordenação usando nossa função utilitária
  const dadosFiltrados = filtrarESortAniversariantes(
    alunos,
    tipoRelatorio,
    classeSelecionada,
    mesSelecionado,
    verAnoInteiro
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Relatório de Aniversariantes</h1>
        <p className="text-sm text-slate-500">Acompanhe os aniversários de nascimento e casamento por classe e período.</p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500">Carregando aniversariantes do banco de dados...</div>
      ) : (
        <>
          {/* Componente de Filtros */}
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

          {/* Componente de Tabela */}
          <TabelaAniversariantes
            dados={dadosFiltrados}
            tipoRelatorio={tipoRelatorio}
          />
        </>
      )}
    </div>
  );
}