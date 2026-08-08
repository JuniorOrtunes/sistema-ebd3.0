import { useEffect, useState } from 'react';
import { Users, CheckSquare, UserPlus, Building2, GraduationCap, BarChart3, TrendingUp, PieChart, Activity } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart as RechartsPie, Pie, Cell } from 'recharts';
import { type Aluno } from '../../lib/ebd';

// --- Componente Auxiliar para Contador Animado ---
function AnimatedCounter({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const finalValue = value;
    if (finalValue === 0) {
      setCount(0);
      return;
    }

    const totalFrames = duration / (1000 / 60);
    const increment = finalValue / totalFrames;

    let currentFrame = 0;
    const timer = setInterval(() => {
      currentFrame++;
      start += increment;
      
      if (currentFrame >= totalFrames) {
        setCount(finalValue);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <>{count.toLocaleString('pt-BR')}</>;
}

interface ClassItem {
  id: number | string;
  nome: string;
  faixaEtaria?: string;
  sala?: string;
  ativa?: boolean;
  professor?: string;
  matriculados?: number;
  presentes?: number;
  visitantes?: number;
}

// --- Componente Principal do Dashboard ---
export function Dashboard() {
  const [totalAlunos, setTotalAlunos] = useState(0);
  const [totalClasses, setTotalClasses] = useState(0);
  const [totalProfessores, setTotalProfessores] = useState(0);
  const [totalPresentes, setTotalPresentes] = useState(0);
  const [totalVisitantes, setTotalVisitantes] = useState(0);
  const [percentualPresenca, setPercentualPresenca] = useState(0);

  const [presencaAulaData, setPresencaAulaData] = useState<any[]>([]);

  // Carrega e calcula os dados dinamicamente do localStorage
  useEffect(() => {
    // 1. Alunos Ativos
    const savedAlunos = localStorage.getItem('ebd_alunos');
    let listaAlunos: Aluno[] = [];
    if (savedAlunos) {
      try {
        listaAlunos = JSON.parse(savedAlunos);
      } catch (e) {
        console.error('Erro ao ler alunos:', e);
      }
    }
    const ativos = listaAlunos.filter(a => !a.situacao || a.situacao === 'Ativo').length;
    setTotalAlunos(ativos);

    // 2. Professores baseados nos alunos
    const profsNosAlunos = listaAlunos.filter(a => a.eProfessor).length;
    setTotalProfessores(profsNosAlunos);

    // 2.1. Contagem correta de Aulas/Classes Ativas (busca do cadastro oficial de turmas ou filtra por ativa === true)
    const savedClasses = localStorage.getItem('ebd_classes') || localStorage.getItem('ebd_turmas');
    if (savedClasses) {
      try {
        const listaClasses: ClassItem[] = JSON.parse(savedClasses);
        const classesAtivas = listaClasses.filter(c => c.ativa !== false);
        setTotalClasses(classesAtivas.length);
      } catch (e) {
        setTotalClasses(0);
      }
    } else {
      setTotalClasses(0);
    }

    // 3. Dados de Encerramento (Presentes, Visitantes e Gráficos da última sessão)
    const savedEncerramento = localStorage.getItem('ebd_encerramento_dados');
    if (savedEncerramento) {
      try {
        const dadosEncerramento: ClassItem[] = JSON.parse(savedEncerramento);

        let sumPresentes = 0;
        let sumVisitantes = 0;
        let sumMatriculados = 0;
        
        const chartData = dadosEncerramento.map(cls => {
          const presentes = cls.presentes || 0;
          const visitantes = cls.visitantes || 0;
          const matriculados = cls.matriculados || 0;
          
          sumPresentes += presentes;
          sumVisitantes += visitantes;
          sumMatriculados += matriculados;

          const taxa = matriculados > 0 ? Math.round((presentes / matriculados) * 100) : 0;

          return {
            aula: cls.nome,
            presenca: taxa,
            total: presentes + visitantes
          };
        });

        setTotalPresentes(sumPresentes);
        setTotalVisitantes(sumVisitantes);

        const geral = sumMatriculados > 0 ? Math.round((sumPresentes / sumMatriculados) * 100) : 0;
        setPercentualPresenca(geral);

        setPresencaAulaData(chartData);
      } catch (e) {
        console.error('Erro ao ler dados de encerramento:', e);
      }
    } else {
      setTotalPresentes(0);
      setTotalVisitantes(0);
      setPercentualPresenca(0);
      setPresencaAulaData([]);
    }
  }, []);

  const stats = [
    { label: 'ALUNOS MATRICULADOS', value: totalAlunos, icon: GraduationCap, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'PRESENTES HOJE', value: totalPresentes, icon: CheckSquare, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'VISITANTES', value: totalVisitantes, icon: UserPlus, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'CLASSES ATIVAS', value: totalClasses, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'PROFESSORES', value: totalProfessores, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'PRESENÇA GERAL', value: percentualPresenca, icon: BarChart3, color: 'text-cyan-600', bg: 'bg-cyan-50', isPercentage: true },
  ];

  const frequenciaClasseData: any[] = [];
  const distribuicaoData: any[] = [];
  const evolucaoSemanasData: any[] = [];

  return (
    <div className="space-y-6 pb-10">
      {/* Grid Superior de Cards Estatísticos */}
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
                  <AnimatedCounter value={stat.value} duration={1000} />
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

      {/* Grid de Gráficos Reais com Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Frequência por Classe */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-950" />
              Frequência por Classe — mês atual
            </h3>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            {frequenciaClasseData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={frequenciaClasseData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="dia" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400">Nenhum dado registrado ainda.</p>
            )}
          </div>
        </div>

        {/* 2. Distribuição por Faixa Etária */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <PieChart className="w-4 h-4 text-blue-950" />
              Distribuição por Categoria — última sessão
            </h3>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            {distribuicaoData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={distribuicaoData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label
                  >
                    {distribuicaoData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400">Nenhum dado registrado ainda.</p>
            )}
          </div>
        </div>

        {/* 3. % Presença por Aula */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-950" />
              % Presença por aula — última sessão
            </h3>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            {presencaAulaData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={presencaAulaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="aula" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="presenca" name="Presença (%)" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400">Nenhum dado registrado ainda.</p>
            )}
          </div>
        </div>

        {/* 4. Evolução de Frequência */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-950" />
              Evolução de Frequência — últimas semanas
            </h3>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            {evolucaoSemanasData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={evolucaoSemanasData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="semana" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip />
                  <Line type="monotone" dataKey="frequencia" name="Total Presentes" stroke="#f59e0b" strokeWidth={3} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400">Nenhum dado registrado ainda.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}