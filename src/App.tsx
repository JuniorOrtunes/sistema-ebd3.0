import React, { useState, useEffect } from 'react';
import type { Superintendente } from './lib/ebd';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './components/ebd-modules/Dashboard';
import { ClassesModule } from './components/ebd-modules/Classes';
import { Alunos } from './components/ebd-modules/Alunos';
import { Encerramento } from './components/ebd-modules/Encerramento';
import { Comparativos } from './components/ebd-modules/Comparativos';
import { UserPlus, Key, Eye, EyeOff, X, Trash2 } from 'lucide-react';
import Login from './components/Login';
import Chamada from './components/Chamada';

export default function App() {
  // Controle de Perfis de Acesso persistido no localStorage
  const [perfilLogado, setPerfilLogado] = useState<'nenhum' | 'professor' | 'superintendencia'>(() => {
    return (localStorage.getItem('ebd_perfil_logado') as any) || 'nenhum';
  });
  
  const [classeAtivaProfessor, setClasseAtivaProfessor] = useState<string>(() => {
    return localStorage.getItem('ebd_classe_professor') || '';
  });

  // Efeitos para sincronizar com o localStorage sempre que os estados mudarem
  useEffect(() => {
    localStorage.setItem('ebd_perfil_logado', perfilLogado);
  }, [perfilLogado]);

  useEffect(() => {
    if (classeAtivaProfessor) {
      localStorage.setItem('ebd_classe_professor', classeAtivaProfessor);
    } else {
      localStorage.removeItem('ebd_classe_professor');
    }
  }, [classeAtivaProfessor]);

  // Estado para controlar a aba ativa na barra lateral
  const [abaAtiva, setAbaAtiva] = useState('dashboard');

  const [superintendentes, setSuperintendentes] = useState<Superintendente[]>([
    { id: '1', nome: 'Carlos Ortunes Junior', usuario: 'ortunes', dataCadastro: '05/08/2026', isVoce: true, ativo: true },
  ]);

  // Modais e Estados do Formulário de Superintendentes
  const [modalAberto, setModalAberto] = useState(false);
  const [modalSenhaAberto, setModalSenhaAberto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
 
  const [nome, setNome] = useState('');
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  // Estados para mostrar/ocultar senha
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  // Identificar o superintendente atual (marcado como 'isVoce' ou o primeiro ativo)
  const superintendenteAtual = superintendentes.find(s => s.isVoce) || superintendentes[0];

  // Abrir modal para novo
  const abrirNovo = () => {
    setEditandoId(null);
    setNome('');
    setUsuario('');
    setSenha('');
    setConfirmarSenha('');
    setModalAberto(true);
  };

  // Abrir modal para editar
  const abrirEditar = (sup: Superintendente) => {
    setEditandoId(sup.id);
    setNome(sup.nome);
    setUsuario(sup.usuario);
    setSenha('');
    setConfirmarSenha('');
    setModalAberto(true);
  };

  // Abrir modal de alterar senha
  const abrirAlterarSenha = (_id: string) => {
    setSenha('');
    setConfirmarSenha('');
    setModalSenhaAberto(true);
  };

  // Alternar Status Ativo / Inativo
  const toggleAtivo = (id: string, isVoce?: boolean) => {
    if (isVoce) {
      alert('Você não pode desativar seu próprio usuário ativo.');
      return;
    }
    setSuperintendentes(superintendentes.map(s => 
      s.id === id ? { ...s, ativo: !s.ativo } : s
    ));
  };

  // Salvar Novo ou Edição de Superintendente
  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !usuario.trim()) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    if (!editandoId && (!senha || senha.length < 6)) {
      alert('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (senha && senha !== confirmarSenha) {
      alert('As senhas não coincidem.');
      return;
    }

    if (editandoId) {
      setSuperintendentes(superintendentes.map(s => s.id === editandoId ? {
        ...s,
        nome,
        usuario
      } : s));
    } else {
      const novo: Superintendente = {
        id: Date.now().toString(),
        nome,
        usuario,
        dataCadastro: new Date().toLocaleDateString('pt-BR'),
        isVoce: false,
        ativo: true
      };
      setSuperintendentes([novo, ...superintendentes]);
    }

    setModalAberto(false);
  };

  // Salvar Alteração de Senha Isolada
  const handleSalvarSenha = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senha || senha.length < 6) {
      alert('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (senha !== confirmarSenha) {
      alert('As senhas não coincidem.');
      return;
    }

    alert('Senha alterada com sucesso!');
    setModalSenhaAberto(false);
  };

  // Excluir
  const handleExcluir = (id: string, isVoce?: boolean) => {
    if (isVoce) {
      alert('Você não pode excluir seu próprio usuário ativo.');
      return;
    }
    if (confirm('Tem certeza que deseja excluir permanentemente este superintendente?')) {
      setSuperintendentes(superintendentes.filter(s => s.id !== id));
    }
  };

  // 1. TELA DE LOGIN / SELEÇÃO DE PERFIL
  if (perfilLogado === 'nenhum') {
    return (
      <Login 
        superintendentes={superintendentes} 
        onLoginProfessor={(classe: string) => {
          setClasseAtivaProfessor(classe);
          setPerfilLogado('professor');
        }}
        onLoginSuperintendencia={() => {
          setPerfilLogado('superintendencia');
        }}
      />
    );
  }

  // 2. TELA DE CHAMADA DO PROFESSOR
  if (perfilLogado === 'professor') {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col">
        <header className="bg-[#0A192F] p-4 border-b border-slate-800 flex justify-between items-center shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-900/50 border border-blue-700/50 rounded-xl flex items-center justify-center p-1.5">
              <img src="/logo-sibo.png" alt="SIBO" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-white">Sistema EBD — Chamada · <span className="text-yellow-400">{classeAtivaProfessor}</span></h1>
              <p className="text-[11px] text-slate-400">Segunda Igreja Batista de Osasco</p>
            </div>
          </div>
          <button 
            onClick={() => setPerfilLogado('nenhum')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl border border-slate-700 transition-colors text-slate-200 shadow-sm"
          >
            Trocar classe / Sair
          </button>
        </header>

        <Chamada nomeClasse={classeAtivaProfessor} />
      </div>
    );
  }

  // 3. PAINEL DA SUPERINTENDÊNCIA
  return (
    <div className="flex h-screen bg-gray-50/50 overflow-hidden">
      {/* Barra Lateral Fixa com Nome do Usuário e Botão de Sair Integrados */}
      <Sidebar 
        abaAtiva={abaAtiva} 
        setAbaAtiva={setAbaAtiva} 
        usuarioLogadoNome={superintendenteAtual?.nome}
        onLogout={() => setPerfilLogado('nenhum')}
      />

      {/* Área de Conteúdo Principal */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">

        {/* Renderização condicional baseada na aba ativa */}
        {abaAtiva === 'dashboard' && <Dashboard />}
        {abaAtiva === 'alunos' && <Alunos />}
        {abaAtiva === 'classes' && <ClassesModule />}
        {abaAtiva === 'encerramento' && <Encerramento />}
        {abaAtiva === 'comparativos' && <Comparativos />}

        {abaAtiva === 'superintendentes' && (
          <div className="space-y-6">
            
            {/* Cabeçalho da Seção */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Superintendentes</h2>
                  <p className="text-sm text-slate-500">Integrantes com acesso ao painel da superintendência.</p>
                </div>
                <button 
                  onClick={abrirNovo}
                  className="px-4 py-2.5 bg-[#0A192F] text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  + Novo superintendente
                </button>
              </div>

              {/* Lista de Superintendentes */}
              <div className="divide-y divide-gray-100">
                {superintendentes.map((sup) => (
                  <div key={sup.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0 last:pb-0">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-sm">{sup.nome}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${sup.ativo !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {sup.ativo !== false ? 'ATIVO' : 'INATIVO'}
                        </span>
                        {sup.isVoce && (
                          <span className="px-2 py-0.5 bg-gray-100 text-slate-600 rounded-full text-[10px] font-medium">
                            você
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        usuário: {sup.usuario} · cadastrado em {sup.dataCadastro}
                      </p>
                    </div>

                    {/* Botões de Ação da Lista */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button 
                        onClick={() => toggleAtivo(sup.id, sup.isVoce)}
                        className={`px-3 py-2 border rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                          sup.ativo !== false 
                            ? 'border-amber-200 text-amber-700 hover:bg-amber-50' 
                            : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                        }`}
                        title={sup.ativo !== false ? "Desativar acesso" : "Ativar acesso"}
                      >
                        {sup.ativo !== false ? 'Desativar' : 'Ativar'}
                      </button>

                      <button 
                        onClick={() => abrirEditar(sup)}
                        className="px-4 py-2 border border-gray-200 text-slate-700 hover:bg-gray-50 rounded-xl text-xs font-medium transition-all"
                      >
                        Editar
                      </button>

                      <button 
                        onClick={() => abrirAlterarSenha(sup.id)}
                        className="px-4 py-2 border border-gray-200 text-slate-700 hover:bg-gray-50 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5"
                      >
                        <Key className="w-3.5 h-3.5 text-slate-500" />
                        Alterar senha
                      </button>

                      <button 
                        onClick={() => handleExcluir(sup.id, sup.isVoce)}
                        className={`p-2 rounded-xl text-xs font-medium transition-all ${
                          sup.isVoce 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-rose-50 hover:bg-rose-100 text-rose-600'
                        }`}
                        title="Excluir permanentemente"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: NOVO / EDITAR SUPERINTENDENTE */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-100 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {editandoId ? 'Editar Superintendente' : 'Novo Superintendente'}
              </h3>
              <button onClick={() => setModalAberto(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvar} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 tracking-wider">NOME COMPLETO *</label>
                <input 
                  type="text" 
                  required
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-slate-200 focus:border-slate-700 outline-none text-sm bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 tracking-wider">NOME DE USUÁRIO *</label>
                <input 
                  type="text" 
                  required
                  placeholder="ex.: joao.silva"
                  value={usuario}
                  onChange={e => setUsuario(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-slate-200 focus:border-slate-700 outline-none text-sm bg-white"
                />
              </div>

              {!editandoId && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 tracking-wider">SENHA * (MÍN. 6 CARACTERES)</label>
                    <div className="relative">
                      <input 
                        type={mostrarSenha ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={senha}
                        onChange={e => setSenha(e.target.value)}
                        className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-gray-200 focus:ring-2 focus:ring-slate-200 focus:border-slate-700 outline-none text-sm bg-white"
                      />
                      <button 
                        type="button"
                        onClick={() => setMostrarSenha(!mostrarSenha)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 tracking-wider">CONFIRMAR SENHA *</label>
                    <div className="relative">
                      <input 
                        type={mostrarConfirmarSenha ? 'text' : 'password'}
                        required
                        value={confirmarSenha}
                        onChange={e => setConfirmarSenha(e.target.value)}
                        className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-gray-200 focus:ring-2 focus:ring-slate-200 focus:border-slate-700 outline-none text-sm bg-white"
                      />
                      <button 
                        type="button"
                        onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {mostrarConfirmarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="px-5 py-2.5 border border-gray-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-[#0A192F] text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
                >
                  {editandoId ? 'Salvar Alterações' : 'Criar acesso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ALTERAR SENHA ISOLADA */}
      {modalSenhaAberto && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-100 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Alterar Senha</h3>
              <button onClick={() => setModalSenhaAberto(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarSenha} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 tracking-wider">NOVA SENHA * (MÍN. 6 CARACTERES)</label>
                <div className="relative">
                  <input 
                    type={mostrarSenha ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={senha}
                    onChange={e => setSenha(e.target.value)}
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-gray-200 focus:ring-2 focus:ring-slate-200 focus:border-slate-700 outline-none text-sm bg-white"
                  />
                  <button 
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 tracking-wider">CONFIRMAR NOVA SENHA *</label>
                <div className="relative">
                  <input 
                    type={mostrarConfirmarSenha ? 'text' : 'password'}
                    required
                    value={confirmarSenha}
                    onChange={e => setConfirmarSenha(e.target.value)}
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-gray-200 focus:ring-2 focus:ring-slate-200 focus:border-slate-700 outline-none text-sm bg-white"
                  />
                  <button 
                    type="button"
                    onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {mostrarConfirmarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setModalSenhaAberto(false)}
                  className="px-5 py-2.5 border border-gray-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-[#0A192F] text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
                >
                  Atualizar senha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}