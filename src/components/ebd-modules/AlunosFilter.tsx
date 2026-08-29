import { Search, ChevronDown } from 'lucide-react';
import type { ClassItem } from '../../hooks/useAlunos';

interface AlunosFilterProps {
  filtroClasse: string;
  setFiltroClasse: (v: string) => void;
  filtroTipo: string;
  setFiltroTipo: (v: string) => void;
  busca: string;
  setBusca: (v: string) => void;
  classesDisponiveis: ClassItem[];
}

export function AlunosFilter({
  filtroClasse,
  setFiltroClasse,
  filtroTipo,
  setFiltroTipo,
  busca,
  setBusca,
  classesDisponiveis
}: AlunosFilterProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-600 tracking-wider">FILTRAR POR CLASSE</label>
        <div className="relative">
          <select 
            value={filtroClasse}
            onChange={e => setFiltroClasse(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none text-sm bg-white appearance-none cursor-pointer"
          >
            <option value="Todas">Todas as Classes</option>
            {classesDisponiveis.map(c => (
              <option key={c.id} value={c.nome}>{c.nome}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-600 tracking-wider">TIPO DE PERFIL</label>
        <div className="relative">
          <select 
            value={filtroTipo}
            onChange={e => setFiltroTipo(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none text-sm bg-white appearance-none cursor-pointer"
          >
            <option value="todos">Todos os cadastros</option>
            <option value="superintendentes">Superintendência</option>
            <option value="professores">Professores</option>
            <option value="alunos">Alunos</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-600 tracking-wider">BUSCAR NOME</label>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Pesquisar por nome..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none text-sm bg-white"
          />
        </div>
      </div>
    </div>
  );
}