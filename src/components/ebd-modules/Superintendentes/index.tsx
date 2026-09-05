import React, { useState, useEffect } from 'react';
import type { Superintendente } from '../../../lib/ebd';
import { UserPlus, Key, Eye, EyeOff, X } from 'lucide-react';
import { db } from '../../../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

export function Superintendentes() {
  const [superintendentes, setSuperintendentes] = useState<Superintendente[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Modais e Estados do Formulário
  const [modalAberto, setModalAberto] = useState(false);
  const [modalSenhaAberto, setModalSenhaAberto] = useState(false);
  
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [idSenhaSelecionada, setIdSenhaSelecionada] = useState<string | null>(null);

  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const [nome, setNome] = useState('');
  const [usuario, setUsuario] = useState('');

  // Estados para mostrar/ocultar senha
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  // Buscar superintendentes do Firebase ao carregar a tela
  const carregarSuperintendentes = async () => {
    try {
      setCarregando(true);
      const querySnapshot = await getDocs(collection(db, 'superintendentes'));
      const lista: Superintendente[] = [];
      querySnapshot.forEach((documento) => {
        const data = documento.data();
        lista.push({
          id: documento.id,
          nome: data.nome || '',
          usuario: data.usuario || '',
          dataCadastro: data.dataCadastro || new Date().toLocaleDateString('pt-BR'),
          isVoce: data.isVoce || false,
        });
      });
      setSuperintendentes(lista);
    } catch (error) {
      console.error('Erro ao carregar superintendentes:', error);
      alert('Erro ao carregar dados do Firebase.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarSuperintendentes();
  }, []);

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
  const abrirAlterarSenha = (id: string) => {
    setIdSenhaSelecionada(id);
    setSenha('');
    setConfirmarSenha('');
    setModalSenhaAberto(true);
  };

  // Salvar Novo ou Edição de Superintendente no Firebase
  const handleSalvar = async (e: React.FormEvent) => {
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

    try {
      if (editandoId) {
        const docRef = doc(db, 'superintendentes', editandoId);
        await updateDoc(docRef, {
          nome,
          usuario,
          ...(senha ? { senha } : {}) // Atualiza a senha se foi preenchida
        });
      } else {
        await addDoc(collection(db, 'superintendentes'), {
          nome,
          usuario,
          senha,
          dataCadastro: new Date().toLocaleDateString('pt-BR'),
          isVoce: false,
          ativo: true
        });
      }

      setModalAberto(false);
      await carregarSuperintendentes();
    } catch (error) {
      console.error('Erro ao salvar superintendente:', error);
      alert('Erro ao salvar no banco de dados.');
    }
  };

  // Salvar Alteração de Senha Isolada no Firebase
  const handleSalvarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senha || senha.length < 6) {
      alert('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (senha !== confirmarSenha) {
      alert('As senhas não coincidem.');
      return;
    }

    try {
      if (idSenhaSelecionada) {
        const docRef = doc(db, 'superintendentes', idSenhaSelecionada);
        await updateDoc(docRef, { senha });
      }

      alert('Senha alterada com sucesso!');
      setModalSenhaAberto(false);
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      alert('Erro ao atualizar a senha no banco.');
    }
  };

  // Excluir do Firebase
  const handleExcluir = async (id: string, isVoce?: boolean) => {
    if (isVoce) {
      alert('Você não pode excluir seu próprio usuário ativo.');
      return;
    }
    if (confirm('Tem certeza que deseja excluir este superintendente?')) {
      try {
        await deleteDoc(doc(db, 'superintendentes', id));
        await carregarSuperintendentes();
      } catch (error) {
        console.error('Erro ao excluir superintendente:', error);
        alert('Erro ao excluir o registro.');
      }
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gray-50/50 min-h-screen">
      
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
          {carregando ? (
            <p className="py-4 text-sm text-slate-500 text-center">Carregando superintendentes...</p>
          ) : superintendentes.length === 0 ? (
            <p className="py-4 text-sm text-slate-500 text-center">Nenhum superintendente cadastrado.</p>
          ) : (
            superintendentes.map((sup) => (
              <div key={sup.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0 last:pb-0">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 text-sm">{sup.nome}</span>
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
                    className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                      sup.isVoce 
                        ? 'bg-rose-300 text-white cursor-not-allowed' 
                        : 'bg-rose-400 hover:bg-rose-500 text-white shadow-sm'
                    }`}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL: NOVO / EDITAR SUPERINTENDENTE */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-100 p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
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
                  className="px-6 py-2.5 bg-slate-500 text-white rounded-xl text-sm font-medium hover:bg-slate-600 transition-colors shadow-sm"
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
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-100 p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
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
                  className="px-6 py-2.5 bg-slate-700 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
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