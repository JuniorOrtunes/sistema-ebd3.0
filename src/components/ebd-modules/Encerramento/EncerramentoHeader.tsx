import { Printer, Lock, CheckCircle2, Trash2 } from 'lucide-react';

interface EncerramentoHeaderProps {
  dataSelecionada: string;
  setDataSelecionada: (data: string) => void;
  ebdEncerrada: boolean;
  handleEncerrarEBD: () => void;
  handleExcluirAulaData: () => void;
}

export function EncerramentoHeader({
  dataSelecionada,
  setDataSelecionada,
  ebdEncerrada,
  handleEncerrarEBD,
  handleExcluirAulaData,
}: EncerramentoHeaderProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4 print:hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Domingo</label>
            <input 
              type="date" 
              value={dataSelecionada} 
              onChange={(e) => setDataSelecionada(e.target.value)} 
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-slate-700" 
            />
          </div>
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${ebdEncerrada ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
            {ebdEncerrada ? <Lock className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            {ebdEncerrada ? 'ENCERRADA' : 'ABERTA'}
          </span>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button onClick={() => window.print()} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold flex items-center gap-2">
            <Printer className="w-4 h-4" /> Imprimir
          </button>
          <button onClick={handleEncerrarEBD} className={`px-5 py-2 rounded-xl text-sm font-bold text-white ${ebdEncerrada ? 'bg-amber-600' : 'bg-rose-600'}`}>
            {ebdEncerrada ? 'Reabrir EBD' : 'Encerrar EBD'}
          </button>
          <button 
            onClick={handleExcluirAulaData} 
            className="px-4 py-2 bg-red-50 text-red-600 border border-red-200/60 hover:bg-red-100 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all"
          >
            <Trash2 className="w-4 h-4" /> Excluir Aula
          </button>
        </div>
      </div>
    </div>
  );
}