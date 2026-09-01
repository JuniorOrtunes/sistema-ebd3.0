import { useDashboard } from '../../../hooks/useDashboard';
import { StatsGrid } from './StatsGrid';
import { DashboardCharts } from './DashboardCharts';

export function Dashboard() {
  const {
    totalAlunos,
    totalClasses,
    totalProfessores,
    totalPresentes,
    totalVisitantes,
    percentualPresenca,
    presencaAulaData,
    frequenciaClasseData,
    distribuicaoData,
    evolucaoSemanasData,
  } = useDashboard();
console.log('[DEBUG_DASHBOARD] totalAlunos recebido:', totalAlunos);
  return (
    <div className="space-y-6 pb-10">
      <svg className="absolute w-0 h-0">
        <defs>
          <linearGradient id="colorFrequencia" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
            <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
          </linearGradient>
          <linearGradient id="colorPresenca" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.9}/>
            <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.6}/>
          </linearGradient>
          <linearGradient id="colorEvolucao" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
          </linearGradient>
        </defs>
      </svg>

      <StatsGrid
        totalAlunos={totalAlunos}
        totalPresentes={totalPresentes}
        totalVisitantes={totalVisitantes}
        totalClasses={totalClasses}
        totalProfessores={totalProfessores}
        percentualPresenca={percentualPresenca}
      />

      <DashboardCharts
        frequenciaClasseData={frequenciaClasseData}
        distribuicaoData={distribuicaoData}
        presencaAulaData={presencaAulaData}
        evolucaoSemanasData={evolucaoSemanasData}
      />
    </div>
  );
}