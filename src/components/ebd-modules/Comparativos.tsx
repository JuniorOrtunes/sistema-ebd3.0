import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

export function Comparativos() {
  const [tipoVisualizacao, setTipoVisualizacao] = useState<'semana' | 'mes'>('semana');
  const [classeFiltro, setClasseFiltro] = useState('todas');
  const [mesFiltro, setMesFiltro] = useState('2026-08');

  const [listaClasses, setListaClasses] = useState<any[]>([]);
  const [dadosEncerramento, setDadosEncerramento] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar classes e dados de chamadas/encerramento do Firestore
  useEffect(() => {
    async function carregarDados() {
      try {
        setLoading(true);
        
        // 1. Buscar Classes cadastradas para o filtro de salas
        const classesSnap = await getDocs(collection(db, 'classes'));
        const classes = classesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setListaClasses(classes);

        // 2. Buscar Dados de Encerramento / Frequência salvos no Firestore
        const encerramentoSnap = await getDocs(collection(db, 'ebd_encerramento_dados'));
        const encerramento = encerramentoSnap.docs.map(doc => doc.data());
        setDadosEncerramento(encerramento);

      } catch (error) {
        console.error('Erro ao carregar dados comparativos:', error);
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, []);

  // Processamento dos dados semanais baseados no Firestore
  const dadosSemanais = dadosEncerramento.length > 0 ? dadosEncerramento.map((cls: any) => {
    const presentes = cls.presentes || 0;
    const matriculados = cls.matriculados || 0;
    const frequencia = matriculados > 0 ? `${Math.round((presentes / matriculados) * 100)}%` : '0%';

    return {
      domingo: cls.data || '02/08/2026',
      presentes,
      matriculados,
      frequencia,
      vsAnterior: '—'
    };
  }) : [
    { domingo: '02/08/2026', presentes: 0, matriculados: 0, frequencia: '0%', vsAnterior: '—' }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fadeIn">
      
      {/* FILTROS E CONTROLES */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Relatórios comparativos de presença</h2>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2">
          
          {/* Alternador de Tipo */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setTipoVisualizacao('semana')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                tipoVisualizacao === 'semana'
                  ? 'bg-[#0A192F] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semana a semana
            </button>
            <button
              type="button"
              onClick={() => setTipoVisualizacao('mes')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                tipoVisualizacao === 'mes'
                  ? 'bg-[#0A192F] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mês a mês
            </button>
          </div>

          {/* Filtros de Sala e Mês */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sala / Classe</label>
              <select
                value={classeFiltro}
                onChange={(e) => setClasseFiltro(e.target.value)}
                className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-slate-700"
              >
                <option value="todas">Todas as salas</option>
                {listaClasses.map((c: any) => (
                  <option key={c.id} value={c.nome}>{c.nome}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mês</label>
              <select
                value={mesFiltro}
                onChange={(e) => setMesFiltro(e.target.value)}
                className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-slate-700"
              >
                <option value="2026-08">Ago/2026</option>
                <option value="2026-07">Jul/2026</option>
                <option value="2026-06">Jun/2026</option>
              </select>
            </div>
          </div>

        </div>
      </div>

      {/* GRÁFICO DE FREQUÊNCIA */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 md:p-8 space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900">Presença por domingo — Ago/2026</h3>
          <p className="text-xs text-slate-500">Percentual de frequência sobre os alunos ativos matriculados em cada classe.</p>
        </div>

        {/* Simulação Visual do Gráfico */}
        <div className="h-64 border-b border-l border-slate-200 relative flex items-end justify-around px-8 pb-4">
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
            <div className="border-b border-dashed border-slate-400 w-full text-[10px] text-right pr-2">100%</div>
            <div className="border-b border-dashed border-slate-400 w-full text-[10px] text-right pr-2">75%</div>
            <div className="border-b border-dashed border-slate-400 w-full text-[10px] text-right pr-2">50%</div>
            <div className="border-b border-dashed border-slate-400 w-full text-[10px] text-right pr-2">25%</div>
            <div className="border-b border-slate-400 w-full text-[10px] text-right pr-2">0%</div>
          </div>

          <div className="flex flex-col items-center gap-2 z-10">
            <div className="w-3 h-3 bg-slate-900 rounded-full shadow-sm ring-4 ring-slate-100"></div>
            <span className="text-[11px] font-semibold text-slate-600">02/08</span>
          </div>
        </div>

        {/* Legenda Dinâmica baseada nas Classes do Firebase */}
        <div className="flex items-center justify-center gap-6 pt-2 flex-wrap">
          {loading ? (
            <span className="text-xs text-slate-400">Carregando classes...</span>
          ) : listaClasses.length > 0 ? (
            listaClasses.map((c: any, index) => (
              <div key={c.id || index} className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-sm ${index % 2 === 0 ? 'bg-slate-900' : 'bg-blue-500'}`}></span>
                <span className="text-xs font-semibold text-slate-700">{c.nome}</span>
              </div>
            ))
          ) : (
            <span className="text-xs text-slate-400">Nenhuma classe cadastrada.</span>
          )}
        </div>
      </div>

      {/* TABELA DE VARIAÇÃO SEMANAL */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 md:p-8 space-y-4">
        <h3 className="text-base font-bold text-slate-900">Variação semanal</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Domingo</th>
                <th className="py-3 px-4">Presentes</th>
                <th className="py-3 px-4">Matriculados</th>
                <th className="py-3 px-4">Frequência</th>
                <th className="py-3 px-4">Vs. Domingo Anterior</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {dadosSemanais.map((item, index) => (
                <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{item.domingo}</td>
                  <td className="py-3.5 px-4 text-slate-600">{item.presentes}</td>
                  <td className="py-3.5 px-4 text-slate-600">{item.matriculados}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{item.frequencia}</td>
                  <td className="py-3.5 px-4 text-slate-500">{item.vsAnterior}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}