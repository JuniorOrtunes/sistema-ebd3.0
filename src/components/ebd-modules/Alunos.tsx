import { useAlunos, type ClassItem } from '../../hooks/useAlunos';
import type { Aluno } from '../../lib/ebd';
import { Search, ChevronDown, Edit2, X, Calendar, MapPin, Loader2, Trash2, Power, Shield, Eye } from 'lucide-react';

export function Alunos() {
  const {
    loading,
    filtroClasse, setFiltroClasse,
    filtroTipo, setFiltroTipo,
    busca, setBusca,
    classesDisponiveis,
    selectedAlunoId,
    modoConferencia,
    editandoId,
    nome, setNome,
    classe, setClasse,
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
    handleSelecionarParaConferencia,
    handleAlternarStatus,
    handleRemover,
    limparFormulario,
    alunosFiltrados
  } = useAlunos();

  return (
    <div className="h-screen overflow-hidden p-4 md:p-8 flex flex-col bg-gray-50">
      
      {/* Bloco Superior */}
      <div className="flex-none bg-gray-50 pb-4 space-y-4">
        
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

        {/* Formulário de Cadastro / Edição / Conferência */}
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
                    {classesDisponiveis.map((c: ClassItem) => (
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
                      {classesDisponiveis.map((c: ClassItem) => (
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
                  const found = alunosFiltrados.find((a: Aluno) => a.id === selectedAlunoId);
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

        {/* Filtros */}
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
                {classesDisponiveis.map((c: ClassItem) => (
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

      </div>

      {/* Tabela Inferior */}
      <div className="flex-1 overflow-y-auto pt-4 pb-8 min-h-0">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-500 text-sm gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
              Carregando cadastros do sistema...
            </div>
          ) : alunosFiltrados.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-gray-50 border-b border-gray-100 z-10">
                  <tr className="text-xs font-semibold text-gray-600 tracking-wider">
                    <th className="p-4">Nome</th>
                    <th className="p-4">Classe</th>
                    <th className="p-4">Telefone</th>
                    <th className="p-4">Situação</th>
                    <th className="p-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                  {alunosFiltrados.map((a: Aluno) => {
                    const situacaoTexto = a.situacao || (a.ativo ? 'Ativo' : 'Inativo');
                    const isSup = (a as any).eSuperintendente;
                    const isSelected = selectedAlunoId === a.id;
                    return (
                      <tr 
                        key={a.id} 
                        onClick={() => handleSelecionarParaConferencia(a)}
                        className={`cursor-pointer transition-colors ${
                          isSelected 
                            ? 'bg-blue-50/80 border-l-4 border-blue-500 shadow-sm' 
                            : 'hover:bg-gray-50/70'
                        }`}
                        title="Clique para conferir os dados rapidamente"
                      >
                        <td className="p-4 font-medium text-gray-900 flex items-center gap-2 flex-wrap">
                          {a.nome}
                          {isSup && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                              <Shield className="w-3 h-3" /> Superintendente
                            </span>
                          )}
                          {a.eProfessor && !isSup && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                              Professor
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-gray-600">{a.classe || a.turma || '-'}</td>
                        <td className="p-4 text-gray-600">{a.telefone || '-'}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            situacaoTexto === 'Ativo' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                              : 'bg-rose-50 text-rose-700 border-rose-100'
                          }`}>
                            {situacaoTexto}
                          </span>
                        </td>
                        <td className="p-4 text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleAlternarStatus(a.id, situacaoTexto)}
                              className={`p-2 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-medium ${
                                situacaoTexto === 'Ativo' 
                                  ? 'text-amber-600 hover:bg-amber-50' 
                                  : 'text-emerald-600 hover:bg-emerald-50'
                              }`}
                              title={situacaoTexto === 'Ativo' ? 'Desativar Registro' : 'Ativar Registro'}
                            >
                              <Power className="w-4 h-4" />
                              {situacaoTexto === 'Ativo' ? 'Desativar' : 'Ativar'}
                            </button>
                            <button 
                              onClick={() => handleEditar(a)}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-medium"
                              title="Editar Registro"
                            >
                              <Edit2 className="w-4 h-4" />
                              Editar
                            </button>
                            <button 
                              onClick={() => handleRemover(a.id)}
                              className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-medium"
                              title="Excluir Registro"
                            >
                              <Trash2 className="w-4 h-4" />
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 text-sm">
              Nenhum registro encontrado.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}