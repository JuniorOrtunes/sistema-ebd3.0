import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { TrendingUp, BarChart2, Calendar, Layers, Activity } from 'lucide-react';

interface Classe {
  id: string;
  nome: string;
  [key: string]: any;
}

interface RegistroEncerramento {
  id: string;
  data?: any;
  classeId?: string;
  nomeClasse?: string;
  presentes?: number;
  matriculados?: number;
  dataNormalizada?: string;
  [key: string]: any;
}

const CORES_CLASSES = [
  { bg: 'bg-indigo-600', text: 'text-indigo-600' },
  { bg: 'bg-emerald-600', text: 'text-emerald-600' },
  { bg: 'bg-amber-500', text: 'text-amber-500' },
  { bg: 'bg-rose-600', text: 'text-rose-600' },
  { bg: 'bg-blue-600', text: 'text-blue-600' },
  { bg: 'bg-orange-600', text: 'text-orange-600' },
  { bg: 'bg-cyan-600', text: 'text-cyan-600' },
  { bg: 'bg-purple-600', text: 'text-purple-600' },
  { bg: 'bg-slate-900', text: 'text-slate-900' },
];

const NOMES_MESES: Record<string, string> = {
  '01': 'Janeiro', '02': 'Fevereiro', '03': 'Março', '04': 'Abril',
  '05': 'Maio', '06': 'Junho', '07': 'Julho', '08': 'Agosto',
  '09': 'Setembro', '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro',
};

const extrairDataStr = (val: any): string => {
  if (!val) return '';
  if (typeof val === 'string') return val.split('T')[0];
  if (typeof val.toDate === 'function') {
    const d = val.toDate();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  if (val.seconds) {
    const d = new Date(val.seconds * 1000);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  return String(val);
};

const formatarDataBR = (dataStr: string): string => {
  if (!dataStr) return '';
  const limpa = extrairDataStr(dataStr);
  if (/^\d{4}-\d{2}-\d{2}$/.test(limpa)) {
    const [ano, mes, dia] = limpa.split('-');
    return `${dia}/${mes}/${ano}`;
  }
  return limpa;
};

const formatarMesBR = (mesCodigo: string): string => {
  if (!mesCodigo || !/^\d{4}-\d{2}$/.test(mesCodigo)) return mesCodigo;
  const [ano, mes] = mesCodigo.split('-');
  return `${NOMES_MESES[mes] || mes}/${ano}`;
};

export function Comparativos() {
  const [tipoVisualizacao, setTipoVisualizacao] = useState<'semana' | 'mes'>('semana');
  const [classeFiltro, setClasseFiltro] = useState('todas');
  const [mesFiltro, setMesFiltro] = useState('2026-08');

  const [listaClasses, setListaClasses] = useState<Classe[]>([]);
  const [dadosEncerramento, setDadosEncerramento] = useState<RegistroEncerramento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const unsubClasses = onSnapshot(collection(db, 'classes'), (snapshot) => {
      const classes = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Classe[];

      classes.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { numeric: true }));
      setListaClasses(classes);
    });

    const unsubEncerramento = onSnapshot(
      collection(db, 'ebd_encerramento_dados'),
      (snapshot) => {
        const encerramento = snapshot.docs.map((doc) => {
          const dataDoc = doc.data();
          return {
            id: doc.id,
            ...dataDoc,
            dataNormalizada: extrairDataStr(dataDoc.data),
          };
        }) as RegistroEncerramento[];

        setDadosEncerramento(encerramento);
        setLoading(false);
      },
      (error) => {
        console.error('Erro ao sincronizar dados comparativos:', error);
        setLoading(false);
      }
    );

    return () => {
      unsubClasses();
      unsubEncerramento();
    };
  }, []);

  const mesesDisponiveis = useMemo(() => {
    return Array.from(
      new Set(
        dadosEncerramento
          .map((d) => d.dataNormalizada?.substring(0, 7))
          .filter(Boolean)
      )
    ).sort() as string[];
  }, [dadosEncerramento]);

  useEffect(() => {
    if (mesesDisponiveis.length > 0 && !mesesDisponiveis.includes(mesFiltro)) {
      setMesFiltro(mesesDisponiveis[mesesDisponiveis.length - 1]);
    }
  }, [mesesDisponiveis, mesFiltro]);

  const dadosFiltradosMes = useMemo(() => {
    return dadosEncerramento.filter((d) => {
      if (!d.dataNormalizada) return false;
      const pertenceMes = d.dataNormalizada.startsWith(mesFiltro);
      const atendeClasse =
        classeFiltro === 'todas' ||
        d.classeId === classeFiltro ||
        d.nomeClasse === classeFiltro;
      return pertenceMes && atendeClasse;
    });
  }, [dadosEncerramento, mesFiltro, classeFiltro]);

  const domingosEvolucao = useMemo(() => {
    const domingosDoMesMap = new Map<string, { presentes: number; matriculados: number }>();

    dadosFiltradosMes.forEach((d) => {
      const dataKey = d.dataNormalizada!;
      if (!domingosDoMesMap.has(dataKey)) {
        domingosDoMesMap.set(dataKey, { presentes: 0, matriculados: 0 });
      }
      const atual = domingosDoMesMap.get(dataKey)!;
      atual.presentes += Number(d.presentes) || 0;
      atual.matriculados += Number(d.matriculados) || 0;
    });

    return Array.from(domingosDoMesMap.entries())
      .sort(([dataA], [dataB]) => dataA.localeCompare(dataB))
      .map(([data, vals], index, arr) => {
        const temFrequenciaAtual = vals.matriculados > 0;
        const freqNum = temFrequenciaAtual ? Math.round((vals.presentes / vals.matriculados) * 100) : 0;
        let vsAnterior = '—';

        if (index > 0) {
          const prevVals = arr[index - 1][1];
          if (prevVals.matriculados > 0 && temFrequenciaAtual) {
            const prevFreq = Math.round((prevVals.presentes / prevVals.matriculados) * 100);
            const diff = freqNum - prevFreq;
            vsAnterior = diff > 0 ? `+${diff}%` : `${diff}%`;
          }
        }

        return {
          referencia: formatarDataBR(data),
          presentes: vals.presentes,
          matriculados: vals.matriculados,
          frequenciaNum: freqNum,
          frequencia: temFrequenciaAtual ? `${freqNum}%` : '—',
          vsAnterior,
          cor: CORES_CLASSES[index % CORES_CLASSES.length],
        };
      });
  }, [dadosFiltradosMes]);

  const mesesEvolucao = useMemo(() => {
    return mesesDisponiveis.map((mes, index, arr) => {
      const registrosMes = dadosEncerramento.filter((d) => {
        const atendeClasse =
          classeFiltro === 'todas' ||
          d.classeId === classeFiltro ||
          d.nomeClasse === classeFiltro;
        return d.dataNormalizada?.startsWith(mes) && atendeClasse;
      });

      const presentes = registrosMes.reduce((acc, cur) => acc + (Number(cur.presentes) || 0), 0);
      const matriculados = registrosMes.reduce((acc, cur) => acc + (Number(cur.matriculados) || 0), 0);
      const temFrequenciaAtual = matriculados > 0;
      const frequenciaNum = temFrequenciaAtual ? Math.round((presentes / matriculados) * 100) : 0;
      let vsAnterior = '—';

      if (index > 0) {
        const mesAnterior = arr[index - 1];
        const registrosMesAnt = dadosEncerramento.filter((d) => {
          const atendeClasse =
            classeFiltro === 'todas' ||
            d.classeId === classeFiltro ||
            d.nomeClasse === classeFiltro;
          return d.dataNormalizada?.startsWith(mesAnterior) && atendeClasse;
        });

        const matAnt = registrosMesAnt.reduce((acc, cur) => acc + (Number(cur.matriculados) || 0), 0);
        const presAnt = registrosMesAnt.reduce((acc, cur) => acc + (Number(cur.presentes) || 0), 0);

        if (matAnt > 0 && temFrequenciaAtual) {
          const freqAnt = Math.round((presAnt / matAnt) * 100);
          const diffFreq = frequenciaNum - freqAnt;
          vsAnterior = diffFreq > 0 ? `+${diffFreq}%` : `${diffFreq}%`;
        }
      }

      return {
        referencia: formatarMesBR(mes),
        mesCodigo: mes,
        presentes,
        matriculados,
        frequenciaNum,
        frequencia: temFrequenciaAtual ? `${frequenciaNum}%` : '—',
        vsAnterior,
        cor: CORES_CLASSES[index % CORES_CLASSES.length],
      };
    });
  }, [dadosEncerramento, mesesDisponiveis, classeFiltro]);

  const dadosTabela = useMemo(() => {
    return tipoVisualizacao === 'semana' ? domingosEvolucao : [...mesesEvolucao].reverse();
  }, [tipoVisualizacao, domingosEvolucao, mesesEvolucao]);

  const dadosGraficoAtivo = useMemo(() => {
    return tipoVisualizacao === 'semana' ? domingosEvolucao : mesesEvolucao;
  }, [tipoVisualizacao, domingosEvolucao, mesesEvolucao]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fadeIn">
      
      {/* CABEÇALHO E FILTROS */}
      <div className="bg-white rounded-2xl border border-slate-200/85 shadow-sm p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-600" /> Relatórios Comparativos
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Análise de frequência e desempenho em tempo real</p>
          </div>
          
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-200/60 text-xs font-bold w-fit">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Tempo Real Ativo
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2 border-t border-slate-100">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setTipoVisualizacao('semana')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                tipoVisualizacao === 'semana' ? 'bg-[#0A192F] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semana a semana
            </button>
            <button
              type="button"
              onClick={() => setTipoVisualizacao('mes')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                tipoVisualizacao === 'mes' ? 'bg-[#0A192F] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mês a mês
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3 h-3" /> Sala / Classe
              </label>
              <select
                value={classeFiltro}
                onChange={(e) => setClasseFiltro(e.target.value)}
                className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-indigo-600 transition-colors"
              >
                <option value="todas">Todas as salas</option>
                {listaClasses.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>

            {tipoVisualizacao === 'semana' && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Mês de Referência
                </label>
                <select
                  value={mesFiltro}
                  onChange={(e) => setMesFiltro(e.target.value)}
                  className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-indigo-600 transition-colors"
                >
                  {mesesDisponiveis.map((mes) => (
                    <option key={mes} value={mes}>
                      {formatarMesBR(mes)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PAINEL GRÁFICO DINÂMICO */}
      <div className="bg-white rounded-2xl border border-slate-200/85 shadow-sm p-6 md:p-8 space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600" />
            {tipoVisualizacao === 'semana' 
              ? `Evolução Semanal — ${formatarMesBR(mesFiltro)}` 
              : 'Comparativo Histórico Mês a Mês'}
          </h3>
          <p className="text-xs text-slate-500">Passe o mouse sobre as colunas para identificar o período e o percentual exato.</p>
        </div>

        {/* Gráfico de Barras */}
        <div className="h-72 border-b border-l border-slate-200 relative flex items-end justify-around px-4 md:px-8 pb-4 pt-10 bg-slate-50/50 rounded-xl overflow-x-visible">
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-25 p-4 pt-10">
            <div className="border-b border-dashed border-slate-400 w-full text-[10px] text-right pr-2 text-slate-500 font-bold">100%</div>
            <div className="border-b border-dashed border-slate-400 w-full text-[10px] text-right pr-2 text-slate-500 font-bold">75%</div>
            <div className="border-b border-dashed border-slate-400 w-full text-[10px] text-right pr-2 text-slate-500 font-bold">50%</div>
            <div className="border-b border-dashed border-slate-400 w-full text-[10px] text-right pr-2 text-slate-500 font-bold">25%</div>
            <div className="border-b border-slate-300 w-full text-[10px] text-right pr-2 text-slate-500 font-bold">0%</div>
          </div>

          {loading ? (
            <span className="text-xs text-slate-400 pb-28 z-10 font-medium">Sincronizando dados em tempo real...</span>
          ) : dadosGraficoAtivo.length > 0 ? (
            dadosGraficoAtivo.map((item: any, idx: number) => (
              <div key={idx} className="flex flex-col items-center gap-2 z-10 h-full justify-end group px-2 relative">
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-xl pointer-events-none whitespace-nowrap z-50">
                  <span>{item.referencia}</span>
                  <span>Frequência: {item.frequencia}</span>
                  <span className="text-slate-300 font-normal">({item.presentes} presentes / {item.matriculados} matriculados)</span>
                </div>

                <span className="text-[10px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.frequencia}
                </span>

                <div 
                  className={`w-10 md:w-14 rounded-t-xl transition-all duration-500 shadow-md group-hover:brightness-110 ${item.cor?.bg || 'bg-indigo-600'}`} 
                  style={{ height: `${item.frequenciaNum}%` }}
                ></div>

                <span className="text-[10px] font-bold text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-xs truncate max-w-[90px]" title={item.referencia}>
                  {item.referencia}
                </span>
              </div>
            ))
          ) : (
            <span className="text-xs text-slate-400 pb-28 z-10">Nenhum registro encontrado para os filtros selecionados.</span>
          )}
        </div>
      </div>

      {/* TABELA DE VARIAÇÃO */}
      <div className="bg-white rounded-2xl border border-slate-200/85 shadow-sm p-6 md:p-8 space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-600" />
          {tipoVisualizacao === 'semana' ? 'Detalhamento e Variação Semanal' : 'Detalhamento e Variação Mensal'}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">{tipoVisualizacao === 'semana' ? 'Domingo' : 'Mês'}</th>
                <th className="py-3 px-4">Presentes</th>
                <th className="py-3 px-4">Matriculados</th>
                <th className="py-3 px-4">Frequência</th>
                <th className="py-3 px-4">{tipoVisualizacao === 'semana' ? 'Vs. Domingo Anterior' : 'Vs. Mês Anterior'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {dadosTabela.length > 0 ? (
                dadosTabela.map((item: any, index: number) => (
                  <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-800">{item.referencia}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">{item.presentes}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">{item.matriculados}</td>
                    <td className="py-3.5 px-4">
                      <span className="bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-lg text-xs border border-indigo-100">
                        {item.frequencia}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-semibold">{item.vsAnterior}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                    Nenhum dado encontrado para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}