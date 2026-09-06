import { LayoutDashboard, Users, Layers, ShieldCheck, ClipboardCheck, TrendingUp, Music, FileText, Calendar, FolderKanban, BarChart3, LogOut, Menu, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  abaAtiva: string;
  setAbaAtiva: (aba: string) => void;
  usuarioLogadoNome?: string;
  onLogout: () => void;
}

export function Sidebar({ abaAtiva, setAbaAtiva, usuarioLogadoNome, onLogout }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [cadastrosOpen, setCadastrosOpen] = useState(
    ['alunos', 'superintendentes', 'hinos', 'classes'].includes(abaAtiva)
  );
  
  const [relatoriosOpen, setRelatoriosOpen] = useState(
    ['comparativos', 'relatorio-alunos', 'relatorio-aniversariantes'].includes(abaAtiva)
  );

  const handleSelectTab = (id: string) => {
    setAbaAtiva(id);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Botão Superior para Celular (Hamburguer) */}
      <div className="md:hidden flex items-center justify-between bg-blue-950 text-white px-4 py-3 border-b border-blue-900/50 sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-2">
          <img src="/logo-sibo.png" alt="Logo SIBO" className="w-8 h-8 object-contain" />
          <span className="font-bold text-sm tracking-wide text-white">Sistema EBD</span>
        </div>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-xl bg-blue-900/50 text-yellow-400 hover:bg-blue-900 transition-colors"
          aria-label="Abrir Menu"
        >
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 
        w-64 bg-blue-950 text-white flex flex-col h-full 
        border-r border-blue-900/50 shadow-xl shrink-0
        transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        
        <div className="p-6 border-b border-blue-900/40 bg-blue-900/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/logo-sibo.png" 
                alt="Logo SIBO" 
                className="w-11 h-11 object-contain" 
              />
              <div>
                <h1 className="font-bold text-base tracking-wide text-white">Sistema EBD</h1>
                <span className="text-xs font-medium text-yellow-400">Gestão Educacional</span>
              </div>
            </div>
            <button 
              onClick={() => setIsMobileOpen(false)}
              className="md:hidden text-blue-300 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {usuarioLogadoNome && (
            <div className="pt-2 border-t border-blue-900/40 flex items-center justify-between">
              <div className="truncate">
                <p className="text-[10px] uppercase tracking-wider text-blue-400 font-semibold">Conectado como</p>
                <p className="text-xs font-bold text-slate-100 truncate" title={usuarioLogadoNome}>
                  {usuarioLogadoNome}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navegação */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          
          {/* Dashboard */}
          <button
            onClick={() => handleSelectTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              abaAtiva === 'dashboard' 
                ? 'bg-yellow-400 text-blue-950 font-bold shadow-md shadow-yellow-400/10' 
                : 'text-blue-100/80 hover:bg-blue-900/50 hover:text-white'
            }`}
          >
            <LayoutDashboard className={`w-5 h-5 ${abaAtiva === 'dashboard' ? 'text-blue-950' : 'text-yellow-400'}`} />
            <span translate="no" className="notranslate">Dashboard</span>
          </button>

          {/* Menu Agrupado: Cadastros */}
          <div className="space-y-1">
            <button
              onClick={() => setCadastrosOpen(!cadastrosOpen)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-blue-100/80 hover:bg-blue-900/50 hover:text-white transition-all"
            >
              <div className="flex items-center gap-3">
                <FolderKanban className="w-5 h-5 text-yellow-400" />
                <span>Cadastros</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${cadastrosOpen ? 'rotate-180' : ''}`} />
            </button>

            {cadastrosOpen && (
              <div className="pl-4 space-y-1 border-l border-blue-900/60 ml-4 my-1">
                <button
                  onClick={() => handleSelectTab('alunos')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    abaAtiva === 'alunos' ? 'bg-yellow-400 text-blue-950 font-bold' : 'text-blue-200/70 hover:text-white hover:bg-blue-900/30'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Alunos</span>
                </button>

                <button
                  onClick={() => handleSelectTab('classes')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    abaAtiva === 'classes' ? 'bg-yellow-400 text-blue-950 font-bold' : 'text-blue-200/70 hover:text-white hover:bg-blue-900/30'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Classes</span>
                </button>

                <button
                  onClick={() => handleSelectTab('superintendentes')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    abaAtiva === 'superintendentes' ? 'bg-yellow-400 text-blue-950 font-bold' : 'text-blue-200/70 hover:text-white hover:bg-blue-900/30'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Superintendentes</span>
                </button>

                <button
                  onClick={() => handleSelectTab('hinos')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    abaAtiva === 'hinos' ? 'bg-yellow-400 text-blue-950 font-bold' : 'text-blue-200/70 hover:text-white hover:bg-blue-900/30'
                  }`}
                >
                  <Music className="w-4 h-4" />
                  <span>Hinos <span className="text-[9px] bg-yellow-500/20 text-yellow-300 px-1.5 py-0.5 rounded ml-auto">Em breve</span></span>
                </button>
              </div>
            )}
          </div>

          {/* Menu Agrupado: Relatórios */}
          <div className="space-y-1">
            <button
              onClick={() => setRelatoriosOpen(!relatoriosOpen)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-blue-100/80 hover:bg-blue-900/50 hover:text-white transition-all"
            >
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-yellow-400" />
                <span>Relatórios</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${relatoriosOpen ? 'rotate-180' : ''}`} />
            </button>

            {relatoriosOpen && (
              <div className="pl-4 space-y-1 border-l border-blue-900/60 ml-4 my-1">
                <button
                  onClick={() => handleSelectTab('relatorio-alunos')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  abaAtiva === 'relatorio-alunos' ? 'bg-yellow-400 text-blue-950 font-bold' : 'text-blue-200/70 hover:text-white hover:bg-blue-900/30'
               }`}
              >
                <FileText className="w-4 h-4" />
                <span>Geral de Alunos <span className="text-[9px] bg-yellow-500/20 text-yellow-300 px-1.5 py-0.5 rounded ml-auto">Em breve</span></span>
                </button>

                <button
                  onClick={() => handleSelectTab('relatorio-aniversariantes')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    abaAtiva === 'relatorio-aniversariantes' ? 'bg-yellow-400 text-blue-950 font-bold' : 'text-blue-200/70 hover:text-white hover:bg-blue-900/30'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Aniversariantes <span className="text-[9px] bg-yellow-500/20 text-yellow-300 px-1.5 py-0.5 rounded ml-auto">Em breve</span></span>
                </button>

                <button
                  onClick={() => handleSelectTab('comparativos')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    abaAtiva === 'comparativos' ? 'bg-yellow-400 text-blue-950 font-bold' : 'text-blue-200/70 hover:text-white hover:bg-blue-900/30'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Comparativos</span>
                </button>
              </div>
            )}
          </div>

          {/* Encerramento */}
          <button
            onClick={() => handleSelectTab('encerramento')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              abaAtiva === 'encerramento' 
                ? 'bg-yellow-400 text-blue-950 font-bold shadow-md shadow-yellow-400/10' 
                : 'text-blue-100/80 hover:bg-blue-900/50 hover:text-white'
            }`}
          >
            <ClipboardCheck className={`w-5 h-5 ${abaAtiva === 'encerramento' ? 'text-blue-950' : 'text-yellow-400'}`} />
            <span translate="no" className="notranslate">Encerramento</span>
          </button>

        </nav>

        {/* Rodapé da Sidebar */}
        <div className="p-4 border-t border-blue-900/40 space-y-3">
          <button
            onClick={() => {
              setIsMobileOpen(false);
              onLogout();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/30 rounded-xl text-xs font-bold transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair do Sistema</span>
          </button>

          <div className="flex flex-col items-center justify-center space-y-0.5">
            <p className="text-[10px] text-blue-400/60 font-medium text-center">© 2026 SIBO</p>
            <p className="text-[9px] text-blue-400/40 font-mono tracking-wider">v1.2.0</p>
          </div>
        </div>
      </aside>
    </>
  );
}