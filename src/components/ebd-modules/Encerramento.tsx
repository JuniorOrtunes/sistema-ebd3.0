import { useState, useEffect } from 'react';
import { Printer, Lock, CheckCircle2 } from 'lucide-react';

export function Encerramento() {
  const [dataSelecionada, setDataSelecionada] = useState('2026-08-02');
  const [ebdEncerrada, setEbdEncerrada] = useState(false);

  // Carrega as classes reais do localStorage (ou inicia vazio se não houver nenhuma)
  const [classesEBD] = useState(() => {
    const saved = localStorage.getItem('ebd_classes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Mapeia para garantir que possua as propriedades numéricas necessárias para o boletim
        return parsed.map((c: any, index: number) => ({
          id: c.id || String(index + 1),
          nome: c.nome || `Classe ${index + 1}`,
          matriculados: c.matriculados || 0,
          presentes: c.presentes || 0,
          visitantes: c.visitantes || 0,
        }));
      } catch (e) {
        console.error('Erro ao carregar classes:', e);
      }
    }
    // Retorna vazio caso não haja classes cadastradas no sistema
    return [];
  });

  // Persiste os dados no localStorage para o Dashboard ler
  useEffect(() => {
    localStorage.setItem('ebd_encerramento_dados', JSON.stringify(classesEBD));
  }, [classesEBD]);

  // Cálculos gerais baseados nos dados dinâmicos
  const totalMatriculados = classesEBD.reduce((acc: number, c: any) => acc + (c.matriculados || 0), 0);
  const totalPresentesAlunos = classesEBD.reduce((acc: number, c: any) => acc + (c.presentes || 0), 0);
  const totalVisitantes = classesEBD.reduce((acc: number, c: any) => acc + (c.visitantes || 0), 0);
  const totalGeralPresenca = totalPresentesAlunos + totalVisitantes;

  const percentualFrequencia = totalMatriculados > 0 
    ? Math.round((totalPresentesAlunos / totalMatriculados) * 100) 
    : 0;

  const handleEncerrarEBD = () => {
    if (ebdEncerrada) {
      if (confirm('Deseja reabrir a EBD deste domingo para edições?')) {
        setEbdEncerrada(false);
      }
    } else {
      if (confirm('Tem certeza que deseja encerrar a EBD deste domingo? As chamadas dos professores serão bloqueadas para edição.')) {
        setEbdEncerrada(true);
      }
    }
  };

  const handleImprimir = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* HEADER / CONTROLE DE DATA E STATUS */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4 print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Domingo</label>
              <div className="flex items-center gap-2">
                <input 
                  type="date" 
                  value={dataSelecionada}
                  onChange={(e) => setDataSelecionada(e.target.value)}
                  disabled={ebdEncerrada}
                  className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-slate-700 disabled:opacity-60"
                />
                
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                  ebdEncerrada 
                    ? 'bg-rose-100 text-rose-700 border border-rose-200' 
                    : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                }`}>
                  {ebdEncerrada ? <Lock className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  {ebdEncerrada ? 'EBD ENCERRADA' : 'EBD ABERTA'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleImprimir}
              className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center gap-2"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              Imprimir
            </button>

            <button 
              onClick={handleEncerrarEBD}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2 ${
                ebdEncerrada 
                  ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                  : 'bg-rose-600 hover:bg-rose-700 text-white'
              }`}
            >
              <Lock className="w-4 h-4" />
              {ebdEncerrada ? 'Reabrir EBD' : 'Encerrar EBD'}
            </button>
          </div>
        </div>
      </div>

      {/* BOLETIM GERAL */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 md:p-8 space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 pb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Boletim Geral de Encerramento</h2>
            <p className="text-xs text-slate-500">
              Domingo, {new Date(dataSelecionada + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="text-right bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total de Presentes</span>
            <span className="text-3xl font-black text-slate-900">{totalGeralPresenca}</span>
          </div>
        </div>

        {classesEBD.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Classe</th>
                <th className="py-3 px-4 text-center">Matriculados</th>
                <th className="py-3 px-4 text-center">Presentes</th>
                <th className="py-3 px-4 text-center">Visitantes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {classesEBD.map((cls: any) => (
                <tr key={cls.id}>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{cls.nome}</td>
                  <td className="py-3.5 px-4 text-center text-slate-600">{cls.matriculados}</td>
                  <td className="py-3.5 px-4 text-center text-slate-600">{cls.presentes}</td>
                  <td className="py-3.5 px-4 text-center text-slate-600">{cls.visitantes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-slate-400 italic py-4 text-center">Nenhuma classe cadastrada no sistema ainda.</p>
        )}

        <p className="text-xs text-slate-500 pt-1">
          Frequência da EBD: <span className="font-semibold text-slate-700">{percentualFrequencia}%</span>
        </p>
      </div>
    </div>
  );
}