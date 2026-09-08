interface FiltrosProps {
  tipoRelatorio: 'nascimento' | 'casamento';
  setTipoRelatorio: (val: 'nascimento' | 'casamento') => void;
  classeSelecionada: string;
  setClasseSelecionada: (val: string) => void;
  mesSelecionado: string;
  setMesSelecionado: (val: string) => void;
  verAnoInteiro: boolean;
  setVerAnoInteiro: (val: boolean) => void;
  classesDisponiveis: string[];
}

const MESES = [
  { valor: '01', nome: 'Janeiro' },
  { valor: '02', nome: 'Fevereiro' },
  { valor: '03', nome: 'Março' },
  { valor: '04', nome: 'Abril' },
  { valor: '05', nome: 'Maio' },
  { valor: '06', nome: 'Junho' },
  { valor: '07', nome: 'Julho' },
  { valor: '08', nome: 'Agosto' },
  { valor: '09', nome: 'Setembro' },
  { valor: '10', nome: 'Outubro' },
  { valor: '11', nome: 'Novembro' },
  { valor: '12', nome: 'Dezembro' },
];

export function FiltrosAniversariantes({
  tipoRelatorio,
  setTipoRelatorio,
  classeSelecionada,
  setClasseSelecionada,
  mesSelecionado,
  setMesSelecionado,
  verAnoInteiro,
  setVerAnoInteiro,
  classesDisponiveis,
}: FiltrosProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
      {/* Abas de Tipo de Relatório */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setTipoRelatorio('nascimento')}
          className={`pb-3 px-4 font-medium text-sm transition-colors border-b-2 ${
            tipoRelatorio === 'nascimento'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Aniversariantes de Nascimento
        </button>
        <button
          type="button"
          onClick={() => setTipoRelatorio('casamento')}
          className={`pb-3 px-4 font-medium text-sm transition-colors border-b-2 ${
            tipoRelatorio === 'casamento'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Aniversariantes de Casamento
        </button>
      </div>

      {/* Grid de Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Filtro por Classe */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Classe</label>
          <select
            value={classeSelecionada}
            onChange={(e) => setClasseSelecionada(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="todas">Todas as Classes</option>
            {classesDisponiveis.map((classe) => (
              <option key={classe} value={classe}>
                {classe}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Mês */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Mês</label>
          <select
            value={mesSelecionado}
            onChange={(e) => setMesSelecionado(e.target.value)}
            disabled={verAnoInteiro}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              verAnoInteiro
                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                : 'bg-white text-slate-800 border-slate-300'
            }`}
          >
            {MESES.map((m) => (
              <option key={m.valor} value={m.valor}>
                {m.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Checkbox Ver Ano Inteiro */}
        <div className="flex items-center h-full pt-5">
          <label className="flex items-center space-x-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={verAnoInteiro}
              onChange={(e) => setVerAnoInteiro(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-slate-700">Ver Ano Inteiro</span>
          </label>
        </div>
      </div>
    </div>
  );
}