import type { ClassItem } from '../../hooks/useAlunos';
import type { Aluno } from '../../lib/ebd';
import { ChevronDown, Edit2, X, Calendar, MapPin, Loader2, Eye } from 'lucide-react';

interface AlunoModalProps {
  editandoId: string | null;
  modoConferencia: boolean;
  selectedAlunoId: string | null;
  nome: string;
  setNome: (v: string) => void;
  classe: string;
  setClasse: (v: string) => void;
  classesDisponiveis: ClassItem[];
  nascimento: string;
  setNascimento: (v: string) => void;
  casamento: string;
  setCasamento: (v: string) => void;
  telefone: string;
  setTelefone: (v: string) => void;
  cep: string;
  setCep: (v: string) => void;
  rua: string;
  setRua: (v: string) => void;
  numero: string;
  setNumero: (v: string) => void;
  complemento: string;
  setComplemento: (v: string) => void;
  bairro: string;
  setBairro: (v: string) => void;
  cidade: string;
  setCidade: (v: string) => void;
  eProfessor: boolean;
  setEProfessor: (v: boolean) => void;
  classeLeciona: string;
  setClasseLeciona: (v: string) => void;
  buscandoCep: boolean;
  mascaraTelefone: (v: string) => string;
  mascaraCep: (v: string) => string;
  handleCepBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  handleSalvar: (e: React.FormEvent) => void;
  handleEditar: (aluno: Aluno) => void;
  limparFormulario: () => void;
  alunosFiltrados: Aluno[];
}

export function AlunoModal({
  editandoId,
  modoConferencia,
  selectedAlunoId,
  nome, setNome,
  classe, setClasse,
  classesDisponiveis,
  nascimento, setNascimento,
  casamento, setCasamento,
  telefone, setTelefone,
  cep, setCep,
  rua, setRua,
  numero, setNumero,
  complemento, setComplemento,
  bairro, setBairro,
  cidade, setCidade,
  eProfessor, setEProfessor,
  classeLeciona, setClasseLeciona,
  buscandoCep,
  mascaraTelefone,
  mascaraCep,
  handleCepBlur,
  handleSalvar,
  handleEditar,
  limparFormulario,
  alunosFiltrados
}: AlunoModalProps) {
  return (
   <div className="flex-none sticky top-0 z-20 bg-gray-50 dark:bg-slate-900 pb-4 space-y-4 shadow-sm">
      <div className="flex items-center justify-between pt-1">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          {editandoId ? 'Editar Aluno / Cadastro' : modoConferencia ? 'Conferência de Dados (Modo Leitura)' : 'Alunos e Corpo Docente'}
          {modoConferencia && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
              <Eye className="w-3 h-3" /> Visualizando Linha
            </span>
          )}
        </h1>
      </div>

      <form 
        onSubmit={handleSalvar} 
        className={`bg-white p-6 rounded-2xl border shadow-sm space-y-5 transition-all ${
          editandoId 
            ? 'border-indigo-300 ring-2 ring-indigo-100' 
            : modoConferencia 
            ? 'border-blue-300 ring-2 ring-blue-100 bg-blue-50/10' 
            : 'border-gray-100'
        }`}
      >
        <fieldset disabled={modoConferencia} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-gray-600 tracking-wider">NOME *</label>
              <input 
                type="text" 
                required
                value={nome}
                onChange={e => setNome(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none text-sm ${modoConferencia ? 'bg-gray-100 text-gray-700 cursor-not-allowed' : 'bg-white'}`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 tracking-wider">CLASSE</label>
              <div className="relative">
                <select 
                  value={classe}
                  onChange={e => setClasse(e.target.value)}
                  disabled={modoConferencia}
                  className={`w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none text-sm appearance-none ${modoConferencia ? 'bg-gray-100 text-gray-700 cursor-not-allowed' : 'bg-white cursor-pointer'}`}
                >
                  <option value="Sem Classe">Sem Classe</option>
                  {classesDisponiveis.map(c => (
                    <option key={c.id} value={c.nome}>{c.nome}</option>
                  ))}
                </select>
                {!modoConferencia && <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" /> NASCIMENTO
              </label>
              <input 
                type="date" 
                value={nascimento}
                onChange={e => setNascimento(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none text-sm ${modoConferencia ? 'bg-gray-100 text-gray-700 cursor-not-allowed' : 'bg-white cursor-pointer'}`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" /> CASAMENTO
              </label>
              <input 
                type="date" 
                value={casamento}
                onChange={e => setCasamento(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none text-sm ${modoConferencia ? 'bg-gray-100 text-gray-700 cursor-not-allowed' : 'bg-white cursor-pointer'}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-2">
            <div className="space-y-1 lg:col-span-1">
              <label className="text-xs font-semibold text-gray-600 tracking-wider">TELEFONE</label>
              <input 
                type="text" 
                placeholder="(00) 00000-0000"
                value={telefone}
                onChange={e => setTelefone(mascaraTelefone(e.target.value))}
                className={`w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none text-sm ${modoConferencia ? 'bg-gray-100 text-gray-700 cursor-not-allowed' : 'bg-white'}`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 tracking-wider flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-500" /> CEP {buscandoCep && <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />}
              </label>
              <input 
                type="text" 
                placeholder="00000-000"
                value={cep}
                onChange={e => setCep(mascaraCep(e.target.value))}
                onBlur={handleCepBlur}
                className={`w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none text-sm ${modoConferencia ? 'bg-gray-100 text-gray-700 cursor-not-allowed' : 'bg-white'}`}
              />
            </div>

            <div className="space-y-1 lg:col-span-2">
              <label className="text-xs font-semibold text-gray-600 tracking-wider">RUA</label>
              <input 
                type="text" 
                value={rua}
                onChange={e => setRua(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none text-sm ${modoConferencia ? 'bg-gray-100 text-gray-700 cursor-not-allowed' : 'bg-white'}`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 tracking-wider">NÚMERO</label>
              <input 
                type="text" 
                value={numero}
                onChange={e => setNumero(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none text-sm ${modoConferencia ? 'bg-gray-100 text-gray-700 cursor-not-allowed' : 'bg-white'}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 tracking-wider">COMPLEMENTO</label>
              <input 
                type="text" 
                value={complemento}
                onChange={e => setComplemento(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none text-sm ${modoConferencia ? 'bg-gray-100 text-gray-700 cursor-not-allowed' : 'bg-white'}`}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 tracking-wider">BAIRRO</label>
              <input 
                type="text" 
                value={bairro}
                onChange={e => setBairro(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none text-sm ${modoConferencia ? 'bg-gray-100 text-gray-700 cursor-not-allowed' : 'bg-white'}`}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 tracking-wider">CIDADE</label>
              <input 
                type="text" 
                value={cidade}
                onChange={e => setCidade(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none text-sm ${modoConferencia ? 'bg-gray-100 text-gray-700 cursor-not-allowed' : 'bg-white'}`}
              />
            </div>
          </div>

          <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/70 space-y-3">
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                id="profCheck"
                checked={eProfessor}
                onChange={e => setEProfessor(e.target.checked)}
                disabled={modoConferencia}
                className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="profCheck" className="text-sm font-semibold text-gray-800 cursor-pointer">
                É professor(a)?
              </label>
            </div>

            {eProfessor && (
              <div className="space-y-1 pt-2">
                <label className="text-xs font-semibold text-gray-600 tracking-wider">CLASSE QUE LECIONA</label>
                <div className="relative">
                  <select 
                    value={classeLeciona}
                    onChange={e => setClasseLeciona(e.target.value)}
                    disabled={modoConferencia}
                    className={`w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none text-sm appearance-none ${modoConferencia ? 'bg-gray-100 text-gray-700 cursor-not-allowed' : 'bg-white cursor-pointer'}`}
                  >
                    <option value="Selecione uma classe">Selecione uma classe</option>
                    {classesDisponiveis.map(c => (
                      <option key={c.id} value={c.nome}>{c.nome}</option>
                    ))}
                  </select>
                  {!modoConferencia && <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />}
                </div>
              </div>
            )}
          </div>
        </fieldset>

        <div className="flex items-center gap-3 flex-wrap pt-2">
          {!modoConferencia ? (
            <button 
              type="submit"
              className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2"
            >
              {editandoId ? 'Salvar Alterações' : 'Salvar'}
            </button>
          ) : (
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const found = alunosFiltrados.find(a => a.id === selectedAlunoId);
                if (found) handleEditar(found);
              }}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Editar Este Registro Agora
            </button>
          )}
          
          {(editandoId || modoConferencia) && (
            <button 
              type="button"
              onClick={limparFormulario}
              className="px-5 py-2.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm font-medium hover:bg-rose-100 transition-all shadow-sm flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              {modoConferencia ? 'Cancelar Seleção / Novo Cadastro' : 'Cancelar Edição'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}