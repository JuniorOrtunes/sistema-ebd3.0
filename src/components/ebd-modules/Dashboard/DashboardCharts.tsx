import { TrendingUp, BarChart3, Activity } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from 'recharts';
import { CustomTooltip } from './CustomTooltip';

interface DashboardChartsProps {
  frequenciaClasseData: any[];
  distribuicaoData: any[];
  presencaAulaData: any[];
  evolucaoSemanasData: any[];
}

export function DashboardCharts({
  frequenciaClasseData,
  distribuicaoData,
  presencaAulaData,
  evolucaoSemanasData,
}: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Gráfico 1: Frequência por Classe */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-950" />
            Frequência por Classe
          </h3>
        </div>
        <div className="h-64 w-full flex items-center justify-center">
          {frequenciaClasseData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={frequenciaClasseData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="classe" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="frequencia" 
                  name="Total Presenças" 
                  stroke="#2563eb" 
                  strokeWidth={3} 
                  dot={{ r: 5, fill: '#2563eb', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 7, strokeWidth: 2, stroke: '#ffffff' }}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-slate-400">Nenhum dado registrado ainda.</p>
          )}
        </div>
      </div>

      {/* Gráfico 2: Alunos por Classe */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-950" />
            Alunos por Classe
          </h3>
        </div>
        <div className="h-64 w-full flex items-center justify-center pt-2">
          {distribuicaoData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distribuicaoData} margin={{ top: 15, right: 10, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  fontSize={9} 
                  tickLine={false} 
                  interval={0} 
                  angle={-45}
                  textAnchor="end"
                  height={75}
                />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Alunos" radius={[6, 6, 0, 0]} animationDuration={1500}>
                  {distribuicaoData.map((entry, index) => (
                    <Cell key={`bar-cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-slate-400">Nenhum aluno cadastrado em classes ainda.</p>
          )}
        </div>
      </div>

      {/* Gráfico 3: % Presença por Aula */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-950" />
            % Presença por Aula
          </h3>
        </div>
        <div className="h-64 w-full flex items-center justify-center">
          {presencaAulaData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={presencaAulaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="aula" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="presenca" name="Presença (%)" fill="url(#colorPresenca)" radius={[8, 8, 0, 0]} animationDuration={1500} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-slate-400">Nenhum dado de chamada salvo ainda.</p>
          )}
        </div>
      </div>

      {/* Gráfico 4: Evolução de Frequência */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-950" />
            Evolução de Frequência
          </h3>
        </div>
        <div className="h-64 w-full flex items-center justify-center">
          {evolucaoSemanasData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolucaoSemanasData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="semana" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="frequencia" 
                  name="Total Presentes" 
                  stroke="#f59e0b" 
                  strokeWidth={3} 
                  dot={{ r: 5, fill: '#f59e0b', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 7, strokeWidth: 2, stroke: '#ffffff' }}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-slate-400">Nenhum dado registrado ainda.</p>
          )}
        </div>
      </div>

    </div>
  );
}