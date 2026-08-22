import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { TrendingUp, BarChart2, Calendar, Layers, Activity } from 'lucide-react';

// Paleta com 9 cores rigorosamente contrastantes e únicas para cada turma
const CORES_CLASSES = [
  { bg: 'bg-indigo-600', text: 'text-indigo-600' },   // 01
  { bg: 'bg-emerald-600', text: 'text-emerald-600' }, // 02
  { bg: 'bg-amber-500', text: 'text-amber-500' },     // 03
  { bg: 'bg-rose-600', text: 'text-rose-600' },       // 04
  { bg: 'bg-blue-600', text: 'text-blue-600' },       // 05
  { bg: 'bg-purple-600', text: 'text-purple-600' },   // 06
  { bg: 'bg-cyan-600', text: 'text-cyan-600' },       // 07
  { bg: 'bg-orange-600', text: 'text-orange-600' },   // 08
  { bg: 'bg-pink-600', text: 'text-pink-600' },       // 09
];

export function Comparativos() {
  const [tipoVisualizacao, setTipoVisualizacao] = useState<'semana' | 'mes'>('semana');
  const [classeFiltro, setClasseFiltro] = useState('todas');
  const [mesFiltro, setMesFiltro] = useState('2026-08');

  const [listaClasses, setListaClasses] = useState<any[]>([]);
  const [dadosEncerramento, setDadosEncerramento] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const formatarDataBR = (dataStr: string) => {
    if (!dataStr) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dataStr)) {
      const [ano, mes, dia] = dataStr.split('-');
      return `${dia}/${mes}/${ano}`;
    }
    return dataStr;
  };

  useEffect(() => {
    setLoading(true);

    const unsubClasses = onSnapshot(collection(db, 'classes'), (snapshot) => {
      const classes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      classes.sort((a: any, b: any) => a.nome.localeCompare(b.nome, 'pt-BR', { numeric: true }));
      setListaClasses(classes);
    });

    const unsubEncerramento = onSnapshot(collection(db, 'ebd_encerramento_dados'), (snapshot) => {
      const encerramento = snapshot.docs.map(doc => doc.data());
      setDadosEncerramento(encerramento);
      setLoading(false);
    }, (error) => {
      console.error('Erro ao sincronizar dados comparativos:', error);
      setLoading(false);
    });

    return () => {
      unsubClasses();
      unsubEncerramento();
    };
  }, []);

  const dadosGraficoClasses = listaClasses.map((cls, index) => {
    const registro = dadosEncerramento.find((d: any) => d.classeId === cls.id || d.nomeClasse === cls.nome);
    const presentes = registro?.presentes || 0;
    const matriculados = registro?.matriculados || cls.matriculados || 10;
    const frequenciaNum = matriculados > 0 ? Math.round((presentes / matriculados) * 100) : 0;
    
    return {
      id: cls.id,
      nome: cls.nome,
      presentes,
      matriculados,
      frequenciaNum,
      frequencia: `${frequenciaNum}%`,
      cor: CORES_CLASSES[index % CORES_CLASSES.length]
    };
  });

  const dadosProcessados = dadosEncerramento
    .map((cls: any) => {
      const presentes = cls.presentes || 0;
      const matriculados = cls.matriculados || 0;
      const frequencia = matriculados > 0 ? Math.round((presentes / matriculados) * 100) : 0;
      const dataFormatada = formatarDataBR(cls.data);

      return {
        referencia: dataFormatada || '—',
        presentes,
        matriculados,
        frequenciaNum: frequencia,
        frequencia: `${frequencia}%`,
        vsAnterior: '—'
      };
    })
    .filter(item => item.referencia !== '' && item.referencia !== '—');

  const dadosTabela = tipoVisualizacao === 'semana' ? dadosProcessados : [
    { referencia: 'Agosto/2026', presentes: dadosProcessados.reduce((acc, cur) => acc + cur.presentes, 0), matriculados: dadosProcessados.reduce((acc, cur) => acc + cur.matriculados, 0), frequenciaNum: 85, frequencia: '85%', vsAnterior: '+5%' }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fadeIn">
      
      {/* CABEÇALHO E FILTROS */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
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
                {listaClasses.map((c: any) => (
                  <option key={c.id} value={c.nome}>{c.nome}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Mês de Referência
              </label>
              <select
                value={mesFiltro}
                onChange={(e) => setMesFiltro(e.target.value)}
                className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-indigo-600 transition-colors"
              >
                <option value="2026-08">Ago/2026</option>
                <option value="2026-07">Jul/2026</option>
                <option value="2026-06">Jun/2026</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* PAINEL GRÁFICO POR CLASSE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 md:p-8 space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600" />
            Desempenho de Frequência por Classe — Ago/2026
          </h3>
          <p className="text-xs text-slate-500">Passe o mouse sobre as colunas para identificar a classe e o percentual exato.</p>
        </div>

        {/* Gráfico de Barras por Classe */}
        <div className="h-72 border-b border-l border-slate-200 relative flex items-end justify-around px-4 md:px-8 pb-4 bg-slate-50/50 rounded-xl overflow-x-auto">
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-25 p-4">
            <div className="border-b border-dashed border-slate-400 w-full text-[10px] text-right pr-2 text-slate-500 font-bold">100%</div>
            <div className="border-b border-dashed border-slate-400 w-full text-[10px] text-right pr-2 text-slate-500 font-bold">75%</div>
            <div className="border-b border-dashed border-slate-400 w-full text-[10px] text-right pr-2 text-slate-500 font-bold">50%</div>
            <div className="border-b border-dashed border-slate-400 w-full text-[10px] text-right pr-2 text-slate-500 font-bold">25%</div>
            <div className="border-b border-slate-300 w-full text-[10px] text-right pr-2 text-slate-500 font-bold">0%</div>
          </div>

          {loading ? (
            <span className="text-xs text-slate-400 pb-28 z-10 font-medium">Sincronizando dados em tempo real...</span>
          ) : dadosGraficoClasses.length > 0 ? (
            dadosGraficoClasses.map((item, idx) => (
              <div key={item.id || idx} className="flex flex-col items-center gap-2 z-10 h-full justify-end group px-1">
                {/* Tooltip com Nome da Classe e Frequência */}
                <div className="absolute -top-3 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-lg pointer-events-none whitespace-nowrap z-30">
                  {item.nome}: {item.frequencia}
                </div>

                <span className="text-[10px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.frequencia}
                </span>

                {/* Barra com a cor exclusiva da turma */}
                <div 
                  className={`w-8 md:w-10 rounded-t-xl transition-all duration-500 shadow-md group-hover:brightness-110 group-hover:scale-y-105 ${item.cor.bg}`} 
                  style={{ height: `${Math.max(item.frequenciaNum, 12)}%` }}
                ></div>

                {/* Sigla ou Número da Turma no eixo X */}
                <span className="text-[10px] font-bold text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-xs truncate max-w-[70px]" title={item.nome}>
                  {item.nome.split(' ')[0]} {item.nome.split(' ')[1] || ''}
                </span>
              </div>
            ))
          ) : (
            <span className="text-xs text-slate-400 pb-28 z-10">Nenhuma classe encontrada.</span>
          )}
        </div>

        {/* Legenda com Cores Altamente Distintas */}
        <div className="flex items-center justify-center gap-3 pt-3 flex-wrap">
          {listaClasses.length > 0 ? (
            listaClasses.map((c: any, index) => {
              const cor = CORES_CLASSES[index % CORES_CLASSES.length];
              return (
                <div key={c.id || index} className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 shadow-xs">
                  <span className={`w-3 h-3 rounded-md ${cor.bg}`}></span>
                  <span className="text-xs font-bold text-slate-700">{c.nome}</span>
                </div>
              );
            })
          ) : (
            <span className="text-xs text-slate-400">Nenhuma classe cadastrada.</span>
          )}
        </div>
      </div>

      {/* TABELA DE VARIAÇÃO */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 md:p-8 space-y-4">
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
                dadosTabela.map((item, index) => (
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