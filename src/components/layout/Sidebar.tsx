import { LayoutDashboard, Users, Layers, ShieldCheck, ClipboardCheck, TrendingUp, LogOut } from 'lucide-react';

interface SidebarProps {
  abaAtiva: string;
  setAbaAtiva: (aba: string) => void;
  usuarioLogadoNome?: string;
  onLogout: () => void;
}

export function Sidebar({ abaAtiva, setAbaAtiva, usuarioLogadoNome, onLogout }: SidebarProps) {
   const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'alunos', label: 'Alunos', icon: Users },
    { id: 'classes', label: 'Classes', icon: Layers },
    { id: 'comparativos', label: 'Comparativos', icon: TrendingUp },
    { id: 'superintendentes', label: 'Superintendentes', icon: ShieldCheck },
    { id: 'encerramento', label: 'Encerramento', icon: ClipboardCheck },
  ];

  return (
    <aside className="w-64 bg-blue-950 text-white flex flex-col h-screen border-r border-blue-900/50 shadow-xl shrink-0">
      
      {/* Cabeçalho com o Logo SIBO e Nome do Usuário */}
      <div className="p-6 border-b border-blue-900/40 bg-blue-900/20 space-y-3">
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

        {/* Nome do Usuário Logado */}
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
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = abaAtiva === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setAbaAtiva(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-yellow-400 text-blue-950 font-bold shadow-md shadow-yellow-400/10' 
                  : 'text-blue-100/80 hover:bg-blue-900/50 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-950' : 'text-yellow-400'}`} />
              <span translate="no" className="notranslate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Rodapé da Sidebar com Botão de Sair e Versão */}
      <div className="p-4 border-t border-blue-900/40 space-y-3">
        <button
          onClick={onLogout}
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
  );
}