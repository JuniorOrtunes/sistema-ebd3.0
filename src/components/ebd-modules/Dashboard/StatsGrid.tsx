import { Users, CheckSquare, UserPlus, Building2, GraduationCap, BarChart3 } from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';

interface StatsGridProps {
  totalAlunos: number;
  totalPresentes: number;
  totalVisitantes: number;
  totalClasses: number;
  totalProfessores: number;
  percentualPresenca: number;
}

export function StatsGrid({
  totalAlunos,
  totalPresentes,
  totalVisitantes,
  totalClasses,
  totalProfessores,
  percentualPresenca,
}: StatsGridProps) {
  const stats = [
    { label: 'ALUNOS MATRICULADOS', value: totalAlunos, icon: GraduationCap, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'PRESENTES NA ÚLTIMA AULA', value: totalPresentes, icon: CheckSquare, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'VISITANTES', value: totalVisitantes, icon: UserPlus, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'CLASSES ATIVAS', value: totalClasses, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'PROFESSORES', value: totalProfessores, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'PRESENÇA GERAL', value: percentualPresenca, icon: BarChart3, color: 'text-cyan-600', bg: 'bg-cyan-50', isPercentage: true },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div 
            key={index} 
            className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex items-center justify-between 
                       transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-slate-300/50"
          >
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 tracking-wider" translate="no">
                {stat.label}
              </span>
             <div className="text-3xl font-extrabold text-slate-800">
                {stat.isPercentage ? (
                <span>{stat.value.toFixed(2)}</span>
            ) : (
                <AnimatedCounter value={stat.value} duration={1000} />
            )}
                {stat.isPercentage && <span className="text-lg font-bold text-slate-500 ml-1">%</span>}
            </div>
            </div>
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        );
      })}
    </div>
  );
}