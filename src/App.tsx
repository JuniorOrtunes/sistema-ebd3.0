import { useState, useEffect } from 'react';
import type { Superintendente } from './lib/ebd';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './components/ebd-modules/Dashboard/Dashboard';
import { ClassesModule } from './components/ebd-modules/Classes';
import { Alunos } from './components/ebd-modules/Alunos';
import { Encerramento } from './components/ebd-modules/Encerramento/Encerramento';
import { Comparativos } from './components/ebd-modules/Comparativos';
import { Superintendentes } from './components/ebd-modules/Superintendentes';
import Login from './components/Login';
import Chamada from './components/Chamada';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import { EmConstrucao } from './components/EmConstrucao';

export default function App() {
  const [perfilLogado, setPerfilLogado] = useState<'nenhum' | 'professor' | 'superintendencia'>(() => {
    return (localStorage.getItem('ebd_perfil_logado') as any) || 'nenhum';
  });
  
  const [classeAtivaProfessor, setClasseAtivaProfessor] = useState<string>(() => {
    return localStorage.getItem('ebd_classe_professor') || '';
  });

  const [superintendentes, setSuperintendentes] = useState<Superintendente[]>([]);

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

  // Carregar superintendentes para permitir o login corretamente
  useEffect(() => {
    async function carregarSuperintendentes() {
      try {
        const querySnapshot = await getDocs(collection(db, 'superintendentes'));
        const lista: Superintendente[] = querySnapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        })) as Superintendente[];
        
        setSuperintendentes(lista);
      } catch (error) {
        console.error("Erro ao carregar superintendentes para login:", error);
      }
    }
    carregarSuperintendentes();
  }, []);

  const [abaAtiva, setAbaAtiva] = useState('dashboard');

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

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50/50 overflow-hidden relative">
      <Sidebar 
        abaAtiva={abaAtiva} 
        setAbaAtiva={setAbaAtiva} 
        onLogout={() => setPerfilLogado('nenhum')}
      />

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {abaAtiva === 'dashboard' && <Dashboard />}
        {abaAtiva === 'alunos' && <Alunos />}
        {abaAtiva === 'classes' && <ClassesModule />}
        {abaAtiva === 'encerramento' && <Encerramento />}
        {abaAtiva === 'comparativos' && <Comparativos />}
        {abaAtiva === 'superintendentes' && <Superintendentes />}
        
        {/* Abas utilizando o componente EmConstrucao */}
        {abaAtiva === 'hinos' && <EmConstrucao titulo="Cadastro de Hinos" onVoltarParaDashboard={() => setAbaAtiva('dashboard')} />}
        {abaAtiva === 'relatorio-alunos' && <EmConstrucao titulo="Relatório Geral de Alunos" onVoltarParaDashboard={() => setAbaAtiva('dashboard')} />}
        {abaAtiva === 'relatorio-aniversariantes' && <EmConstrucao titulo="Relatório de Aniversariantes" onVoltarParaDashboard={() => setAbaAtiva('dashboard')} />}
      </main>
    </div>
  );
}