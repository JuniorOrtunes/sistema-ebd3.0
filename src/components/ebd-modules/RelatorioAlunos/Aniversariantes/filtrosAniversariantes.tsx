interface FiltrosAniversariantesProps {
  tipoRelatorio: 'nascimento' | 'casamento';
  setTipoRelatorio: (tipo: 'nascimento' | 'casamento') => void;
  classeSelecionada: string;
  setClasseSelecionada: (classe: string) => void;
  mesSelecionado: string;
  setMesSelecionado: (mes: string) => void;
  verAnoInteiro: boolean;
  setVerAnoInteiro: (ver: boolean) => void;
  classesDisponiveis: string[];
}

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
}: FiltrosAniversariantesProps) {
  return (
    <div className="space-y-4">
      {/* Abas de Tipo de Relatório */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setTipoRelatorio('nascimento')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            tipoRelatorio === 'nascimento'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Aniversariantes de Nascimento
        </button>
        <button
          onClick={() => setTipoRelatorio('casamento')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            tipoRelatorio === 'casamento'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Aniversariantes de Casamento
        </button>
      </div>

      {/* Painel de Filtros */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Filtro por Classe */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Classe</label>
          <select 
            value={classeSelecionada}
            onChange={(e) => setClasseSelecionada(e.target.value)}
            className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="todas">Todas as Classes</option>
            {classesDisponiveis.map((classe) => (
              <option key={classe} value={classe}>{classe}</option>
            ))}
          </select>
        </div>

        {/* Filtro por Mês */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Mês</label>
          <select 
            value={mesSelecionado}
            onChange={(e) => setMesSelecionado(e.target.value)}
            disabled={verAnoInteiro}
            className={`w-full border border-slate-300 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none ${
              verAnoInteiro ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''
            }`}
          >
            <option value="01">Janeiro</option>
            <option value="02">Fevereiro</option>
            <option value="03">Março</option>
            <option value="04">Abril</option>
            <option value="05">Maio</option>
            <option value="06">Junho</option>
            <option value="07">Julho</option>
            <option value="08">Agosto</option>
            <option value="09">Setembro</option>
            <option value="10">Outubro</option>
            <option value="11">Novembro</option>
            <option value="12">Dezembro</option>
          </select>
        </div>

        {/* Opção Ano Inteiro */}
        <div className="flex items-center pt-5">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input 
              type="checkbox"
              checked={verAnoInteiro}
              onChange={(e) => setVerAnoInteiro(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-slate-700">Ver Ano Inteiro</span>
          </label>
        </div>
      </div>
    </div>
  );
}