import { useState, useEffect } from 'react';
import { Trash2, Plus, Save, Lock } from 'lucide-react';
import { collection, getDocs, doc, setDoc, getDoc, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

interface ChamadaProps {
  nomeClasse: string;
}

interface AlunoItem {
  id: string;
  nome: string;
  eProfessor?: boolean;
}

export default function Chamada({ nomeClasse }: ChamadaProps) {
  const [dataChamada] = useState(new Date().toISOString().split('T')[0]);
  const [alunosDaClasse, setAlunosDaClasse] = useState<AlunoItem[]>([]);
  const [presencasAlunos, setPresencasAlunos] = useState<Record<string, boolean>>({});
  const [listaVisitantes, setListaVisitantes] = useState<string[]>([]);
  const [nomeVisitanteInput, setNomeVisitanteInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [ebdEncerrada, setEbdEncerrada] = useState(false);

  // 1. Sincronização em tempo real do status de encerramento da EBD
  useEffect(() => {
    const fechamentoRef = doc(db, 'ebd_fechamentos', dataChamada);
    const unsubFechamento = onSnapshot(fechamentoRef, (fechamentoSnap) => {
      setEbdEncerrada(fechamentoSnap.exists() ? (fechamentoSnap.data().encerrada || false) : false);
    });

    return () => unsubFechamento();
  }, [dataChamada]);

  // Carregar alunos reais da classe do Firestore
  useEffect(() => {
    async function carregarAlunosEChamada() {
      try {
        setLoading(true);

        const alunosRef = collection(db, 'alunos');
        const q = query(alunosRef, where('classe', '==', nomeClasse));
        const querySnapshot = await getDocs(q);
        
        const lista: AlunoItem[] = [];
        querySnapshot.docs.forEach(docSnap => {
          const dados = docSnap.data();
          if (dados.situacao === 'Inativo') return;

          const eProfessor = Boolean(
            dados.eProfessor && 
            (dados.classe === nomeClasse || dados.turma === nomeClasse || dados.classeLeciona === nomeClasse)
          );

          lista.push({
            id: docSnap.id,
            nome: dados.nome || 'Aluno Sem Nome',
            eProfessor
          });
        });

        lista.sort((a, b) => {
          if (a.eProfessor && !b.eProfessor) return -1;
          if (!a.eProfessor && b.eProfessor) return 1;
          return a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' });
        });

        setAlunosDaClasse(lista);

        const estadoInicial: Record<string, boolean> = {};
        lista.forEach(aluno => {
          estadoInicial[aluno.id] = false;
        });

        const chamadaId = `${nomeClasse}_${dataChamada}`;
        const snap = await getDoc(doc(db, 'chamadas', chamadaId));
        
        if (snap.exists()) {
          const dados = snap.data();
          if (dados.presencas) setPresencasAlunos(dados.presencas);
          if (dados.visitantes) setListaVisitantes(dados.visitantes);
        } else {
          setPresencasAlunos(estadoInicial);
        }

      } catch (error) {
        console.error('Erro ao carregar dados da chamada:', error);
      } finally {
        setLoading(false);
      }
    }

    if (nomeClasse) {
      carregarAlunosEChamada();
    }
  }, [nomeClasse, dataChamada]);

  const handleAdicionarVisitante = () => {
    if (ebdEncerrada || !nomeVisitanteInput.trim()) return;
    setListaVisitantes([...listaVisitantes, nomeVisitanteInput.trim()]);
    setNomeVisitanteInput('');
  };

  const togglePresencaAluno = (id: string) => {
    if (ebdEncerrada) return;
    setPresencasAlunos(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const totalPresentesAlunosCount = Object.values(presencasAlunos).filter(Boolean).length;
  const totalPresentes = totalPresentesAlunosCount + listaVisitantes.length;

  const handleSalvarChamada = async () => {
    if (ebdEncerrada) return;
    try {
      setSalvando(true);
      const chamadaId = `${nomeClasse}_${dataChamada}`;

      await setDoc(doc(db, 'chamadas', chamadaId), {
        id: chamadaId,
        classe: nomeClasse,
        data: dataChamada,
        presencas: presencasAlunos,
        visitantes: listaVisitantes,
        totalMatriculados: alunosDaClasse.length,
        totalPresentesAlunos: totalPresentesAlunosCount,
        totalVisitantes: listaVisitantes.length,
        totalGeral: totalPresentes,
        atualizadoEm: new Date().toISOString()
      }, { merge: true });

      alert('Chamada salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar chamada:', error);
      alert('Erro ao salvar a chamada no banco de dados.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full animate-fadeIn">
      {ebdEncerrada && (
        <div className="mb-6 bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-center gap-3 text-rose-800">
          <Lock className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <div className="text-xs font-semibold">
            Esta EBD está <span className="font-bold">encerrada</span>. As chamadas encontram-se bloqueadas para edições.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Coluna Esquerda: Lista de Alunos */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Data</p>
              <p className="text-sm font-bold text-slate-900">{new Date().toLocaleDateString('pt-BR')}</p>
            </div>
            <h2 className="text-lg font-bold text-slate-800">Chamada — {nomeClasse}</h2>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 mb-4 uppercase tracking-wide border-b pb-2">
              Alunos ({alunosDaClasse.length})
            </h3>

            {loading ? (
              <p className="text-sm text-slate-400 text-center py-6">Carregando alunos da classe...</p>
            ) : alunosDaClasse.length > 0 ? (
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {alunosDaClasse.map(aluno => (
                  <div key={aluno.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-700">{aluno.nome}</span>
                      {aluno.eProfessor && (
                        <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Professor
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      disabled={ebdEncerrada}
                      onClick={() => togglePresencaAluno(aluno.id)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        presencasAlunos[aluno.id] 
                          ? 'bg-emerald-600 text-white shadow-sm' 
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      } ${ebdEncerrada ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      {presencasAlunos[aluno.id] ? 'Presente' : 'Ausente'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic text-center py-6">Nenhum aluno matriculado nesta classe ainda.</p>
            )}
          </div>
        </div>

        {/* Coluna Direita: Visitantes e Ações */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wide">Visitantes</h3>
              <span className="bg-yellow-100 text-yellow-800 px-2.5 py-0.5 rounded-full text-xs font-bold">{listaVisitantes.length}</span>
            </div>
            
            <div className="flex gap-2 mb-4">
              <input 
                value={nomeVisitanteInput}
                disabled={ebdEncerrada}
                onChange={(e) => setNomeVisitanteInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAdicionarVisitante(); }}
                placeholder="Nome do visitante"
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-700 disabled:opacity-60"
              />
              <button 
                type="button"
                disabled={ebdEncerrada}
                onClick={handleAdicionarVisitante} 
                className="px-4 py-2 bg-[#0A192F] text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors disabled:opacity-60"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto">
              {listaVisitantes.map((vis, i) => (
                <div key={i} className="flex justify-between items-center text-xs py-2 border-b border-slate-100">
                  <span className="text-slate-900 font-semibold">{vis}</span>
                  {!ebdEncerrada && (
                    <button 
                      type="button"
                      onClick={() => setListaVisitantes(listaVisitantes.filter((_, idx) => idx !== i))} 
                      className="text-rose-500 hover:text-rose-700 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5"/>
                    </button>
                  )}
                </div>
              ))}
              {listaVisitantes.length === 0 && (
                <p className="text-xs text-slate-400 italic text-center py-2">Nenhum visitante adicionado.</p>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-xs text-slate-500">Total de presentes na classe</p>
            <p className="text-4xl font-black text-[#0A192F] my-2">{totalPresentes}</p>
            <button 
              type="button"
              onClick={handleSalvarChamada}
              disabled={salvando || ebdEncerrada}
              className="w-full py-3 bg-[#0A192F] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-sm disabled:opacity-60"
            >
              <Save className="w-4 h-4" /> 
              {salvando ? 'Salvando...' : ebdEncerrada ? 'EBD Encerrada' : 'Salvar chamada'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}