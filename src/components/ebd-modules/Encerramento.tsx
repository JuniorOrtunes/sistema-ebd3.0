import { useState, useEffect } from 'react';
import { Printer, Lock, CheckCircle2 } from 'lucide-react';
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
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

        // 1. Buscar todas as classes cadastradas no sistema
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

        // 2. Buscar TODAS as chamadas do Firestore para garantir que pegamos a data correta independentemente de formatação
        const chamadasSnap = await getDocs(collection(db, 'chamadas'));

        chamadasSnap.docs.forEach(docSnap => {
          const dados = docSnap.data();
          const nomeClasse = dados.classe;
          const dataChamada = dados.data; // formato YYYY-MM-DD salvo pelo Chamada.tsx

          // Compara se a data da chamada bate com a selecionada
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

        // 3. Verificar se a EBD deste dia já foi encerrada/travada
        const fechamentoRef = doc(db, 'ebd_fechamentos', dataSelecionada);
        const fechamentoSnap = await getDoc(fechamentoRef);
        
        if (fechamentoSnap.exists()) {
          const dadosFechamento = fechamentoSnap.data();
          setEbdEncerrada(dadosFechamento.encerrada || false);
          // Se quiser forçar atualizar com os dados novos mesmo se fechado, remova ou ajuste esta linha
        } else {
          setEbdEncerrada(false);
        }

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

  const percentualFrequencia = totalMatriculados > 0 
    ? Math.round((totalPresentesAlunos / totalMatriculados) * 100) 
    : 0;

  const handleEncerrarEBD = async () => {
    const novoStatus = !ebdEncerrada;
    const mensagem = novoStatus 
      ? 'Tem certeza que deseja encerrar a EBD deste domingo? As chamadas serão bloqueadas para edição.' 
      : 'Deseja reabrir a EBD deste domingo para edições?';

    if (window.confirm(mensagem)) {
      try {
        setEbdEncerrada(novoStatus);

        const docRef = doc(db, 'ebd_fechamentos', dataSelecionada);
        await setDoc(docRef, {
          data: dataSelecionada,
          encerrada: novoStatus,
          classes: classesEBD,
          atualizadoEm: new Date().toISOString()
        }, { merge: true });

        alert(novoStatus ? 'EBD encerrada com sucesso!' : 'EBD reaberta com sucesso!');
      } catch (error) {
        console.error('Erro ao atualizar status:', error);
        alert('Erro ao salvar alteração.');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
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
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center gap-2"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              Imprimir
            </button>

            <button 
              type="button"
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

        {loading ? (
          <div className="text-center py-8 text-slate-400 text-sm">Carregando dados...</div>
        ) : classesEBD.length > 0 ? (
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
              {classesEBD.map((cls) => (
                <tr key={cls.id || cls.nome}>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{cls.nome}</td>
                  <td className="py-3.5 px-4 text-center text-slate-600">{cls.matriculados}</td>
                  <td className="py-3.5 px-4 text-center text-slate-600">{cls.presentes}</td>
                  <td className="py-3.5 px-4 text-center text-slate-600">{cls.visitantes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-slate-400 italic py-4 text-center">Nenhuma classe cadastrada.</p>
        )}

        <p className="text-xs text-slate-500 pt-1">
          Frequência da EBD: <span className="font-semibold text-slate-700">{percentualFrequencia}%</span>
        </p>
      </div>
    </div>
  );
}