import { useEffect, useState } from 'react';
import { Users, CheckSquare, UserPlus, Building2, GraduationCap, BarChart3, TrendingUp, Activity } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from 'recharts';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';

// Paleta oficial exata com 9 cores rigorosamente contrastantes por turma
const HEX_CORES_CLASSES = [
  '#4f46e5', // 01 - Indigo (indigo-600)
  '#059669', // 02 - Emerald (emerald-600)
  '#f59e0b', // 03 - Amber (amber-500)
  '#e11d48', // 04 - Rose (rose-600)
  '#2563eb', // 05 - Blue (blue-600)
  '#ea580c', // 06 - Orange (orange-600)
  '#0891b2', // 07 - Cyan (cyan-600)
  '#7c3aed', // 08 - Purple (purple-600)
  '#0f172a', // 09 - Slate/Preto (slate-900)
];

// Função para associar cor fixa e exclusiva baseada no número/índice da turma
const getTurmaColor = (nome: string, index: number) => {
  const numMatch = String(nome).match(/\d+/);
  if (numMatch) {
    const num = parseInt(numMatch[0], 10);
    if (num >= 1 && num <= 9) {
      return HEX_CORES_CLASSES[num - 1];
    }
  }
  return HEX_CORES_CLASSES[index % HEX_CORES_CLASSES.length];
};

// Ordenador numérico rigoroso para turmas (ex: "Classe 01", "Turma 2", etc.)
const ordenarTurmas = (a: any, b: any, key: string) => {
  const valA = String(a[key] || '');
  const valB = String(b[key] || '');
  const numA = parseInt(valA.replace(/\D/g, ''), 10);
  const numB = parseInt(valB.replace(/\D/g, ''), 10);

  if (!isNaN(numA) && !isNaN(numB)) {
    return numA - numB;
  }
  return valA.localeCompare(valB, 'pt-BR', { sensitivity: 'base' });
};

// Tooltip Customizado Minimalista
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 text-white px-3.5 py-2.5 rounded-xl shadow-xl text-xs backdrop-blur-md border border-slate-700/50 space-y-1">
        {label && <p className="font-semibold text-slate-300 border-b border-slate-700 pb-1 mb-1">{label}</p>}
        {payload.map((item: any, index: number) => (
          <div key={`tooltip-${index}`} className="flex items-center justify-between gap-4">
            <span className="text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color || item.fill }} />
              {item.name}:
            </span>
            <span className="font-bold text-white">
              {item.value}{item.dataKey === 'presenca' ? '%' : ''}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

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
    let alunosAtivosCount = 0;
    let listaChamadasGlobal: any[] = [];

    // Função auxiliar para recalcular a presença geral com base nos dados mais recentes
    const recalcularMetricas = (totalAtivos: number, listaChamadas: any[]) => {
      if (listaChamadas.length > 0) {
        const datasUnicas = Array.from(new Set(listaChamadas.map((c: any) => c.data))).filter(Boolean) as string[];
        datasUnicas.sort().reverse();
        const ultimaData = datasUnicas[0];

        const chamadasUltimaAula = listaChamadas.filter((cls: any) => cls.data === ultimaData);

        let sumPresentesUltima = 0;
        let sumVisitantesUltima = 0;

        chamadasUltimaAula.forEach((cls: any) => {
          sumPresentesUltima += cls.totalPresentesAlunos || 0;
          sumVisitantesUltima += cls.totalVisitantes || 0;
        });

        setTotalPresentes(sumPresentesUltima);
        setTotalVisitantes(sumVisitantesUltima);

        // CORREÇÃO: Fórmula exata (Presentes / MatriculadosAtivos * 100)
        const geralUltima = totalAtivos > 0 ? Number(((sumPresentesUltima / totalAtivos) * 100).toFixed(1)) : 0;
        setPercentualPresenca(Math.round(geralUltima)); // ou manter arredondado / com decimal se preferir
      } else {
        setTotalPresentes(0);
        setTotalVisitantes(0);
        setPercentualPresenca(0);
      }
    };

    const unsubAlunos = onSnapshot(collection(db, 'alunos'), (snapshot) => {
      const listaAlunos = snapshot.docs.map(doc => doc.data());
      
      const alunosAtivos = listaAlunos.filter(a => !a.situacao || a.situacao === 'Ativo' || a.ativo === true);
      alunosAtivosCount = alunosAtivos.length;
      setTotalAlunos(alunosAtivosCount);

      const profsNosAlunos = listaAlunos.filter(a => a.eProfessor).length;
      setTotalProfessores(profsNosAlunos);

      const contagemClasses: Record<string, number> = {};
      alunosAtivos.forEach((aluno: any) => {
        const nomeClasse = aluno.classe || aluno.turma || 'Não definida';
        contagemClasses[nomeClasse] = (contagemClasses[nomeClasse] || 0) + 1;
      });

      let barData = Object.keys(contagemClasses).map((nome, index) => ({
        name: nome,
        value: contagemClasses[nome],
        color: getTurmaColor(nome, index)
      }));

      barData.sort((a, b) => ordenarTurmas(a, b, 'name'));
      setDistribuicaoData(barData);

      // Recalcula métricas dependentes de alunos caso as chamadas já tenham carregado
      if (listaChamadasGlobal.length > 0) {
        recalcularMetricas(alunosAtivosCount, listaChamadasGlobal);
      }
    });

    const unsubClasses = onSnapshot(collection(db, 'classes'), (snapshot) => {
      const listaClasses = snapshot.docs.map(doc => doc.data());
      const classesAtivasCount = listaClasses.filter(c => c.ativa !== false).length;
      setTotalClasses(classesAtivasCount);
    });

    const unsubChamadas = onSnapshot(collection(db, 'chamadas'), (snapshot) => {
      listaChamadasGlobal = snapshot.docs.map(doc => doc.data());

      recalcularMetricas(alunosAtivosCount, listaChamadasGlobal);

      let chartData = listaChamadasGlobal.map((cls: any) => {
        const presentes = cls.totalPresentesAlunos || 0;
        const matriculados = cls.totalMatriculados || 0;
        const visitantes = cls.totalVisitantes || 0;
        const taxa = matriculados > 0 ? Math.round((presentes / matriculados) * 100) : 0;

        return {
          aula: cls.classe || cls.turma || 'Classe',
          presenca: taxa,
          total: presentes + visitantes
        };
      });
      chartData.sort((a, b) => ordenarTurmas(a, b, 'aula'));
      setPresencaAulaData(chartData);

      const freqClasseMap = listaChamadasGlobal.reduce((acc: any, curr: any) => {
        const nomeClasse = curr.classe || curr.turma || 'Classe Geral';
        const totalAlunosPresentes = (curr.totalPresentesAlunos || 0) + (curr.totalVisitantes || 0);
        acc[nomeClasse] = (acc[nomeClasse] || 0) + totalAlunosPresentes;
        return acc;
      }, {});

      let freqClasseArray = Object.keys(freqClasseMap).map(classe => ({
        classe: classe,
        frequencia: freqClasseMap[classe]
      }));
      freqClasseArray.sort((a, b) => ordenarTurmas(a, b, 'classe'));
      setFrequenciaClasseData(freqClasseArray);

      const evolucaoMap = listaChamadasGlobal.reduce((acc: any, curr: any) => {
        const data = curr.data || 'Data';
        acc[data] = (acc[data] || 0) + (curr.totalPresentesAlunos || 0) + (curr.totalVisitantes || 0);
        return acc;
      }, {});

      let evolucaoArray = Object.keys(evolucaoMap).map(data => ({
        semana: data.split('-').reverse().slice(0, 2).join('/'),
        frequencia: evolucaoMap[data],
        rawDate: data
      }));
      evolucaoArray.sort((a, b) => a.rawDate.localeCompare(b.rawDate));
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

       {/* Gráfico 2: Alunos por Classe (Em Barras Ordenadas e Coloridas Oficialmente) */}
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
                  <Bar 
                    dataKey="value" 
                    name="Alunos" 
                    radius={[6, 6, 0, 0]} 
                    animationDuration={1500}
                  >
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
                  <Bar 
                    dataKey="presenca" 
                    name="Presença (%)" 
                    fill="url(#colorPresenca)" 
                    radius={[8, 8, 0, 0]} 
                    animationDuration={1500}
                  />
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
    </div>
  );
}