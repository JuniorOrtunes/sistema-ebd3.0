import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserCheck, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import type { Superintendente } from '../lib/ebd';

interface LoginProps {
  onLoginProfessor: (classeId: string) => void;
  onLoginSuperintendencia: () => void;
  superintendentes?: Superintendente[];
}

interface ClasseItem {
  id: string;
  nome: string;
}

export default function Login({ onLoginProfessor, onLoginSuperintendencia, superintendentes = [] }: LoginProps) {
  const [classeSelecionada, setClasseSelecionada] = useState('');
  const [mostrarFormSuper, setMostrarFormSuper] = useState(false);
  
  // Campos de login da superintendência
  const [usuarioSuper, setUsuarioSuper] = useState('');
  const [senhaSuper, setSenhaSuper] = useState('');
  const [mostrarSenhaSuper, setMostrarSenhaSuper] = useState(false);

  // Lista dinâmica de classes vindas do Firestore
  const [classesList, setClassesList] = useState<ClasseItem[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  // Carregar as classes cadastradas no Firestore ao abrir o login
  useEffect(() => {
    async function carregarClasses() {
      try {
        setLoadingClasses(true);
        const querySnapshot = await getDocs(collection(db, 'classes'));
        const lista: ClasseItem[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          nome: doc.data().nome || 'Classe Sem Nome'
        }));

        lista.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));
        setClassesList(lista);
      } catch (error) {
        console.error('Erro ao carregar classes para o login:', error);
      } finally {
        setLoadingClasses(false);
      }
    }

    carregarClasses();
  }, []);

  const handleEntrarChamada = () => {
    if (!classeSelecionada) {
      alert('Por favor, selecione uma classe para continuar.');
      return;
    }
    onLoginProfessor(classeSelecionada);
  };

  const handleValidarSuper = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioSuper.trim() || !senhaSuper.trim()) {
      alert('Preencha o usuário e a senha.');
      return;
    }
    
    const usuarioLimpo = usuarioSuper.trim().toLowerCase();
    const senhaLimpa = senhaSuper.trim();

    // Validação baseada na lista real de superintendentes (props ou fallback padrão)
    const listaAtiva = superintendentes.length > 0 
      ? superintendentes 
      : [
          { usuario: 'ortunes', senha: '123', ativo: true },
          { usuario: 'teste', senha: '123', ativo: true }
        ];

    const superintendenteEncontrado = listaAtiva.find(
      s => s.usuario.toLowerCase() === usuarioLimpo && 
           (s.senha ? s.senha === senhaLimpa : true) && 
           s.ativo !== false
    );

    if (superintendenteEncontrado) {
      onLoginSuperintendencia();
    } else {
      alert('Usuário ou senha incorretos!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Detalhe estético de fundo (glow profissional) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Cabeçalho / Logo Oficial */}
      <div className="text-center mb-10 z-10">
        <div className="w-20 h-20 bg-blue-900/40 border border-blue-800/50 rounded-2xl mx-auto flex items-center justify-center shadow-2xl mb-4 backdrop-blur-md p-3">
          <img 
            src="/logo-sibo.png" 
            alt="Logo SIBO" 
            className="w-full h-full object-contain drop-shadow-md" 
          />
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Sistema EBD</h1>
        <p className="text-xs font-medium text-yellow-400 tracking-wide mt-1 uppercase">Segunda Igreja Batista de Osasco</p>
      </div>

      {/* Grid / Container de Acessos */}
      <div className="w-full max-w-md space-y-5 z-10">
        
        {/* Card Professor */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-7 border border-white/20 transition-all">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Sou professor(a)</h2>
              <p className="text-xs text-slate-500">Registro rápido de chamada dominical.</p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Selecione sua Classe</label>
              <select
                value={classeSelecionada}
                onChange={(e) => setClasseSelecionada(e.target.value)}
                disabled={loadingClasses}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all disabled:opacity-60"
              >
                <option value="">{loadingClasses ? 'Carregando classes...' : 'Escolher classe...'}</option>
                {classesList.map((c) => (
                  <option key={c.id} value={c.nome}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleEntrarChamada}
              className="w-full py-3.5 bg-blue-950 text-white rounded-xl text-sm font-semibold hover:bg-blue-900 transition-all shadow-lg shadow-blue-950/20 flex items-center justify-center gap-2 group"
            >
              <span>Entrar na chamada</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Card Superintendência */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-7 border border-white/20 transition-all">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Superintendência</h2>
              <p className="text-xs text-slate-500">Gestão administrativa e relatórios gerais.</p>
            </div>
          </div>

          {!mostrarFormSuper ? (
            <div className="mt-5">
              <button
                type="button"
                onClick={() => setMostrarFormSuper(true)}
                className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-all border border-slate-200/60 shadow-sm"
              >
                Acessar com credenciais
              </button>
            </div>
          ) : (
            <form onSubmit={handleValidarSuper} className="mt-5 space-y-3.5 animate-fadeIn">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Usuário</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Digite seu usuário"
                    value={usuarioSuper}
                    onChange={(e) => setUsuarioSuper(e.target.value)}
                    autoComplete="off"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Senha</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={mostrarSenhaSuper ? 'text' : 'password'}
                    placeholder="Digite sua senha"
                    value={senhaSuper}
                    onChange={(e) => setSenhaSuper(e.target.value)}
                    autoComplete="new-password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenhaSuper(!mostrarSenhaSuper)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {mostrarSenhaSuper ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setMostrarFormSuper(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-colors"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20"
                >
                  Entrar no Painel
                </button>
              </div>
            </form>
          )}
        </div>

      </div>

      {/* Rodapé discreto */}
      <div className="mt-8 text-center text-xs text-slate-500 z-10">
        © 2026 SIBO · Todos os direitos reservados
      </div>
    </div>
  );
}