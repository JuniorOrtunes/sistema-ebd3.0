import { useEffect, useState } from 'react';
import { Users, CheckSquare, UserPlus, Building2, GraduationCap, BarChart3, TrendingUp, PieChart, Activity } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart as RechartsPie, Pie, Cell } from 'recharts';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';

const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

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

export function Dashboard() {
  const [totalAlunos, setTotalAlunos] = useState(0);
  const [totalClasses, setTotalClasses] = useState(0);
  const [totalProfessores, setTotalProfessores] = useState(0);
  const [totalPresentes, setTotalPresentes] = useState(0);
  const [totalVisitantes, setTotalVisitantes] = useState(0);
  const [percentualPresenca, setPercentualPresenca] = useState(0);

  const [presencaAulaData, setPresencaAulaData] = useState<any[]>([]);
  const [frequenciaClasseData, setFrequenciaClasseData] = useState<any[]>([]);
  const [distribuicaoData, setDistribuicaoData] = useState<any[]>([]);
  const [evolucaoSemanasData, setEvolucaoSemanasData] = useState<any[]>([]);

  useEffect(() => {
    const unsubAlunos = onSnapshot(collection(db, 'alunos'), (snapshot) => {
      const listaAlunos = snapshot.docs.map(doc => doc.data());
      const ativos = listaAlunos.filter(a => !a.situacao || a.situacao === 'Ativo' || a.ativo === true).length;
      setTotalAlunos(ativos);

      const profsNosAlunos = listaAlunos.filter(a => a.eProfessor).length;
      setTotalProfessores(profsNosAlunos);

      const contagemClasses: Record<string, number> = {};
      listaAlunos.forEach((aluno: any) => {
        const nomeClasse = aluno.classe || 'Não definida';
        contagemClasses[nomeClasse] = (contagemClasses[nomeClasse] || 0) + 1;
      });

      const pieData = Object.keys(contagemClasses).map((nome, index) => ({
        name: nome,
        value: contagemClasses[nome],
        color: COLORS[index % COLORS.length]
      }));
      setDistribuicaoData(pieData);
    });

    const unsubClasses = onSnapshot(collection(db, 'classes'), (snapshot) => {
      const listaClasses = snapshot.docs.map(doc => doc.data());
      const classesAtivasCount = listaClasses.filter(c => c.ativa !== false).length;
      setTotalClasses(classesAtivasCount);
    });

    const unsubChamadas = onSnapshot(collection(db, 'chamadas'), (snapshot) => {
      const listaChamadas = snapshot.docs.map(doc => doc.data());

      if (listaChamadas.length > 0) {
        const datasUnicas = Array.from(new Set(listaChamadas.map((c: any) => c.data))).filter(Boolean) as string[];
        datasUnicas.sort().reverse();
        const ultimaData = datasUnicas[0];

        const chamadasUltimaAula = listaChamadas.filter((cls: any) => cls.data === ultimaData);

        let sumPresentesUltima = 0;
        let sumVisitantesUltima = 0;
        let sumMatriculadosUltima = 0;

        chamadasUltimaAula.forEach((cls: any) => {
          sumPresentesUltima += cls.totalPresentesAlunos || 0;
          sumVisitantesUltima += cls.totalVisitantes || 0;
          sumMatriculadosUltima += cls.totalMatriculados || 0;
        });

        setTotalPresentes(sumPresentesUltima);
        setTotalVisitantes(sumVisitantesUltima);

        // CORREÇÃO: Presença geral calcula estritamente Alunos Presentes / Alunos Matriculados
        const geralUltima = sumMatriculadosUltima > 0 ? Math.round((sumPresentesUltima / sumMatriculadosUltima) * 100) : 0;
        
        setPercentualPresenca(geralUltima);
      } else {
        setTotalPresentes(0);
        setTotalVisitantes(0);
        setPercentualPresenca(0);
      }

      const chartData = listaChamadas.map((cls: any) => {
        const presentes = cls.totalPresentesAlunos || 0;
        const matriculados = cls.totalMatriculados || 0;
        const visitantes = cls.totalVisitantes || 0;
        const taxa = matriculados > 0 ? Math.round((presentes / matriculados) * 100) : 0;

        return {
          aula: cls.classe || 'Classe',
          presenca: taxa,
          total: presentes + visitantes
        };
      });
      setPresencaAulaData(chartData);

      const freqClasseMap = listaChamadas.reduce((acc: any, curr: any) => {
        const nomeClasse = curr.classe || 'Classe Geral';
        const totalAlunosPresentes = (curr.totalPresentesAlunos || 0) + (curr.totalVisitantes || 0);
        acc[nomeClasse] = (acc[nomeClasse] || 0) + totalAlunosPresentes;
        return acc;
      }, {});

      const freqClasseArray = Object.keys(freqClasseMap).map(classe => ({
        classe: classe,
        frequencia: freqClasseMap[classe]
      }));
      setFrequenciaClasseData(freqClasseArray);

      const evolucaoMap = listaChamadas.reduce((acc: any, curr: any) => {
        const data = curr.data || 'Data';
        acc[data] = (acc[data] || 0) + (curr.totalPresentesAlunos || 0) + (curr.totalVisitantes || 0);
        return acc;
      }, {});

      const evolucaoArray = Object.keys(evolucaoMap).map(data => ({
        semana: data.split('-').reverse().slice(0, 2).join('/'),
        frequencia: evolucaoMap[data]
      }));
      setEvolucaoSemanasData(evolucaoArray);
    });

    return () => {
      unsubAlunos();
      unsubClasses();
      unsubChamadas();
    };
  }, []);

  const stats = [
    { label: 'ALUNOS MATRICULADOS', value: totalAlunos, icon: GraduationCap, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'PRESENTES NA ÚLTIMA AULA', value: totalPresentes, icon: CheckSquare, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'VISITANTES', value: totalVisitantes, icon: UserPlus, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'CLASSES ATIVAS', value: totalClasses, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'PROFESSORES', value: totalProfessores, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'PRESENÇA GERAL', value: percentualPresenca, icon: BarChart3, color: 'text-cyan-600', bg: 'bg-cyan-50', isPercentage: true },
  ];

  return (
    <div className="space-y-6 pb-10">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  <XAxis dataKey="classe" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip />
                  <Line type="monotone" dataKey="frequencia" name="Total Presenças" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400">Nenhum dado registrado ainda.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <PieChart className="w-4 h-4 text-blue-950" />
              Alunos por Classe
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
              <p className="text-xs text-slate-400">Nenhum aluno cadastrado em classes ainda.</p>
            )}
          </div>
        </div>

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
                  <XAxis dataKey="aula" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="presenca" name="Presença (%)" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400">Nenhum dado de chamada salvo ainda.</p>
            )}
          </div>
        </div>

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