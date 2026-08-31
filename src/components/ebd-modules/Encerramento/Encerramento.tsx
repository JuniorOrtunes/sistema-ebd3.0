import { useEncerramento } from '../../../hooks/useEncerramento';
import { EncerramentoHeader } from './EncerramentoHeader';
import { BoletimTable } from './BoletimTable';
import { IndicadoresSecao } from './IndicadoresSecao';

export function Encerramento() {
  const {
    dataSelecionada,
    setDataSelecionada,
    ebdEncerrada,
    classesEBD,
    visitantesDia,
    loading,
    totalGeralPresenca,
    percentualFrequencia,
    nascimentosSemana,
    casamentosSemana,
    handleEncerrarEBD,
    handleExcluirAulaData,
  } = useEncerramento();

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* 1. CABEÇALHO DE CONTROLES */}
      <EncerramentoHeader
        dataSelecionada={dataSelecionada}
        setDataSelecionada={setDataSelecionada}
        ebdEncerrada={ebdEncerrada}
        handleEncerrarEBD={handleEncerrarEBD}
        handleExcluirAulaData={handleExcluirAulaData}
      />

      {/* 2. BOLETIM E INDICADORES */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
        <BoletimTable
          classesEBD={classesEBD}
          totalGeralPresenca={totalGeralPresenca}
          loading={loading}
          percentualFrequencia={percentualFrequencia}
        />

        {!loading && (
          <IndicadoresSecao
            visitantesDia={visitantesDia}
            nascimentosSemana={nascimentosSemana}
            casamentosSemana={casamentosSemana}
          />
        )}
      </div>
    </div>
  );
}