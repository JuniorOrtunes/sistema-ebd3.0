import { useState, useEffect } from 'react';
import { Printer, Lock, CheckCircle2, Trash2 } from 'lucide-react';
import { collection, getDocs, doc, setDoc, getDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../../firebase';

interface ClasseItem {
  id: string;
  nome: string;
  matriculados: number;
  presentes: number;
  visitantes: number;
}

export function Encerramento() {
  const [dataSelecionada, setDataSelecionada] = useState(new Date().toISOString().split('T')[0]);
  const [ebdEncerrada, setEbdEncerrada] = useState(false);
  const [classesEBD, setClassesEBD] = useState<ClasseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarBoletim() {
      try {
        setLoading(true);
        const classesSnap = await getDocs(collection(db, 'classes'));
        const mapaClasses: Record<string, ClasseItem> = {};

        classesSnap.docs.forEach(docSnap => {
          const dados = docSnap.data();
          const nomeClasse = dados.nome || docSnap.id;
          mapaClasses[nomeClasse] = {
            id: docSnap.id,
            nome: nomeClasse,
            matriculados: dados.matriculados || 0,
            presentes: 0,
            visitantes: 0,
          };
        });

        const chamadasSnap = await getDocs(collection(db, 'chamadas'));
        chamadasSnap.docs.forEach(docSnap => {
          const dados = docSnap.data();
          const nomeClasse = dados.classe;
          const dataChamada = dados.data; 

          if (dataChamada === dataSelecionada && nomeClasse && mapaClasses[nomeClasse]) {
            mapaClasses[nomeClasse].presentes = dados.totalPresentesAlunos || 0;
            mapaClasses[nomeClasse].visitantes = dados.totalVisitantes || 0;
            if (dados.totalMatriculados !== undefined) {
              mapaClasses[nomeClasse].matriculados = dados.totalMatriculados;
            }
          }
        });

        let listaConsolidada = Object.values(mapaClasses);
        listaConsolidada.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));

        const fechamentoRef = doc(db, 'ebd_fechamentos', dataSelecionada);
        const fechamentoSnap = await getDoc(fechamentoRef);
        
        setEbdEncerrada(fechamentoSnap.exists() ? (fechamentoSnap.data().encerrada || false) : false);
        setClassesEBD(listaConsolidada);
      } catch (error) {
        console.error('Erro ao carregar boletim:', error);
      } finally {
        setLoading(false);
      }
    }

    carregarBoletim();
  }, [dataSelecionada]);

  const totalMatriculados = classesEBD.reduce((acc, c) => acc + (c.matriculados || 0), 0);
  const totalPresentesAlunos = classesEBD.reduce((acc, c) => acc + (c.presentes || 0), 0);
  const totalVisitantes = classesEBD.reduce((acc, c) => acc + (c.visitantes || 0), 0);
  const totalGeralPresenca = totalPresentesAlunos + totalVisitantes;
  const percentualFrequencia = totalMatriculados > 0 ? Math.round((totalPresentesAlunos / totalMatriculados) * 100) : 0;

  const handleEncerrarEBD = async () => {
    const novoStatus = !ebdEncerrada;
    if (window.confirm(novoStatus ? 'Bloquear edições das chamadas?' : 'Reabrir EBD para edições?')) {
      try {
        setEbdEncerrada(novoStatus);
        await setDoc(doc(db, 'ebd_fechamentos', dataSelecionada), {
          data: dataSelecionada,
          encerrada: novoStatus,
          classes: classesEBD,
          atualizadoEm: new Date().toISOString()
        }, { merge: true });
      } catch (error) { alert('Erro ao salvar alteração.'); }
    }
  };

  const handleExcluirAulaData = async () => {
    const confirmado = window.confirm(`Tem certeza que deseja excluir todos os registros/chamadas e o encerramento da data ${dataSelecionada}? Esta ação não poderá ser desfeita.`);
    
    if (confirmado) {
      try {
        setLoading(true);

        // 1. Remove o documento de fechamento do dia, se existir
        const fechamentoRef = doc(db, 'ebd_fechamentos', dataSelecionada);
        await deleteDoc(fechamentoRef);

        // 2. Busca e remove todos os documentos da coleção 'chamadas' correspondentes a esta data
        const q = query(collection(db, 'chamadas'), where('data', '==', dataSelecionada));
        const querySnapshot = await getDocs(q);
        
        const promessasExclusao = querySnapshot.docs.map(documento => 
          deleteDoc(doc(db, 'chamadas', documento.id))
        );
        await Promise.all(promessasExclusao);

        // 3. Reseta o estado local para refletir a exclusão em tempo real
        setEbdEncerrada(false);
        setClassesEBD(prev => prev.map(c => ({ ...c, presentes: 0, visitantes: 0 })));

        alert('Registros da aula excluídos com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir aula:', error);
        alert('Erro ao excluir os registros da aula.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4 print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Domingo</label>
              <input type="date" value={dataSelecionada} onChange={(e) => setDataSelecionada(e.target.value)} className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-slate-700" />
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
              title="Excluir registros e chamadas desta data"
            >
              <Trash2 className="w-4 h-4" /> Excluir Aula
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 pb-6">
          <h2 className="text-lg font-bold text-slate-900">Boletim</h2>
          <div className="text-right bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Total Presentes</span>
            <span className="text-2xl font-black text-slate-900">{totalGeralPresenca}</span>
          </div>
        </div>

        {loading ? <p className="text-center py-8 text-slate-400">Carregando...</p> : (
          <div className="space-y-3">
            {/* Oculta tabela no mobile, mostra card */}
            <div className="hidden md:block">
              <table className="w-full text-left">
                <thead><tr className="text-slate-400 text-[11px] uppercase border-b border-slate-100"><th className="pb-3">Classe</th><th className="pb-3 text-center">Matr.</th><th className="pb-3 text-center">Pres.</th><th className="pb-3 text-center">Vis.</th></tr></thead>
                <tbody className="divide-y divide-slate-50">{classesEBD.map(c => <tr key={c.id}><td className="py-3 font-semibold">{c.nome}</td><td className="text-center">{c.matriculados}</td><td className="text-center">{c.presentes}</td><td className="text-center">{c.visitantes}</td></tr>)}</tbody>
              </table>
            </div>

            {/* Mostra cards no mobile */}
            <div className="md:hidden space-y-3">
              {classesEBD.map(c => (
                <div key={c.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-800">{c.nome}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Matr: {c.matriculados}</p>
                  </div>
                  <div className="flex gap-4 text-center">
                    <div><p className="text-[10px] text-slate-400 uppercase">Pres.</p><p className="font-bold text-slate-800">{c.presentes}</p></div>
                    <div><p className="text-[10px] text-slate-400 uppercase">Vis.</p><p className="font-bold text-slate-800">{c.visitantes}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">Frequência: {percentualFrequencia}%</p>
      </div>
    </div>
  );
}