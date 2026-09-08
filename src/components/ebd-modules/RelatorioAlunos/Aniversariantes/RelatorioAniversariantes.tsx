import { useState } from 'react';
import { FiltrosAniversariantes } from './filtrosAniversariantes';
import { TabelaAniversariantes } from './tabelaAniversariantes';
import type { Aniversariante } from './utilsAniversariantes';
import { filtrarESortAniversariantes } from './utilsAniversariantes';

// Dados mockados de exemplo (depois você pode substituir pela integração real do sistema)
const dadosIniciaisMock: Aniversariante[] = [
  { id: '1', nome: 'Carlos Silva', classe: 'Adultos', dataNascimento: '15/03/1985', dataCasamento: '10/05/2010' },
  { id: '2', nome: 'Ana Souza', classe: 'Jovens', dataNascimento: '02/03/1998', dataCasamento: '20/11/2018' },
  { id: '3', nome: 'Marcos Oliveira', classe: 'Adultos', dataNascimento: '22/07/1975', dataCasamento: '15/03/2005' },
  { id: '4', nome: 'Beatriz Lima', classe: 'Novos Convertidos', dataNascimento: '05/03/2000', dataCasamento: '12/06/2021' },
];

export function RelatorioAniversariantes() {
  const [tipoRelatorio, setTipoRelatorio] = useState<'nascimento' | 'casamento'>('nascimento');
  const [classeSelecionada, setClasseSelecionada] = useState<string>('todas');
  const [mesSelecionado, setMesSelecionado] = useState<string>('03'); // Março como padrão
  const [verAnoInteiro, setVerAnoInteiro] = useState<boolean>(false);

  // Extrair classes únicas disponíveis para o select
  const classesDisponiveis = Array.from(new Set(dadosIniciaisMock.map((item) => item.classe)));

  // Aplicar filtros e ordenação usando nossa função utilitária
  const dadosFiltrados = filtrarESortAniversariantes(
    dadosIniciaisMock,
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
    </div>
  );
}