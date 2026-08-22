import { useState, useEffect } from 'react';
import { Printer, Lock, CheckCircle2, Trash2, Users, Cake, Heart } from 'lucide-react';
import { collection, doc, setDoc, deleteDoc, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { obterNomeBodas } from '../../utils/bodas'; // Importando o utilitário limpo

interface ClasseItem {
  id: string;
  nome: string;
  matriculados: number;
  presentes: number;
  visitantes: number;
}

interface VisitanteItem {
  nome: string;
  classe: string;
}

interface AniversarianteItem {
  id: string;
  nome: string;
  classe: string;
  tipo: 'Nascimento' | 'Casamento';
  dataStr: string;
  detalheAnos?: string;
}

export function Encerramento() {
  const [dataSelecionada, setDataSelecionada] = useState(new Date().toISOString().split('T')[0]);
  const [ebdEncerrada, setEbdEncerrada] = useState(false);
  const [classesEBD, setClassesEBD] = useState<ClasseItem[]>([]);
  const [visitantesDia, setVisitantesDia] = useState<VisitanteItem[]>([]);
  const [aniversariantesSemana, setAniversariantesSemana] = useState<AniversarianteItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. REALTIME: Sincronização em tempo real de Classes, Chamadas e Fechamentos
  useEffect(() => {
    setLoading(true);

    let classesMap: Record<string, ClasseItem> = {};
    let chamadasList: any[] = [];

    const unsubClasses = onSnapshot(collection(db, 'classes'), (classesSnap) => {
      classesMap = {};
      classesSnap.docs.forEach(docSnap => {
        const dados = docSnap.data();
        const nomeClasse = dados.nome || docSnap.id;
        classesMap[nomeClasse] = {
          id: docSnap.id,
          nome: nomeClasse,
          matriculados: dados.matriculados || 0,
          presentes: 0,
          visitantes: 0,
        };
      });
      processarDados(classesMap, chamadasList);
    });

    const unsubChamadas = onSnapshot(collection(db, 'chamadas'), (chamadasSnap) => {
      chamadasList = chamadasSnap.docs.map(doc => doc.data());
      processarDados(classesMap, chamadasList);
    });

    const fechamentoRef = doc(db, 'ebd_fechamentos', dataSelecionada);
    const unsubFechamento = onSnapshot(fechamentoRef, (fechamentoSnap) => {
      setEbdEncerrada(fechamentoSnap.exists() ? (fechamentoSnap.data().encerrada || false) : false);
    });

    function processarDados(mapa: Record<string, ClasseItem>, chamadas: any[]) {
      const mapaTemp: Record<string, ClasseItem> = JSON.parse(JSON.stringify(mapa));
      const visitantesAcumulados: VisitanteItem[] = [];

      chamadas.forEach((dados: any) => {
        const nomeClasse = dados.classe;
        const dataChamada = dados.data; 

        if (dataChamada === dataSelecionada && nomeClasse) {
          if (!mapaTemp[nomeClasse]) {
            mapaTemp[nomeClasse] = {
              id: nomeClasse,
              nome: nomeClasse,
              matriculados: dados.totalMatriculados || 0,
              presentes: 0,
              visitantes: 0
            };
          }

          mapaTemp[nomeClasse].presentes = dados.totalPresentesAlunos || 0;
          mapaTemp[nomeClasse].visitantes = (dados.visitantes || []).length;
          if (dados.totalMatriculados !== undefined) {
            mapaTemp[nomeClasse].matriculados = dados.totalMatriculados;
          }

          if (Array.isArray(dados.visitantes)) {
            dados.visitantes.forEach((visNome: string) => {
              visitantesAcumulados.push({
                nome: visNome,
                classe: nomeClasse
              });
            });
          }
        }
      });

      let listaConsolidada = Object.values(mapaTemp);
      listaConsolidada.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));

      setClassesEBD(listaConsolidada);
      setVisitantesDia(visitantesAcumulados);
      setLoading(false);
    }

    return () => {
      unsubClasses();
      unsubChamadas();
      unsubFechamento();
    };
  }, [dataSelecionada]);

  // 2. ANIVERSARIANTES: Cálculo, Bodas e Ordenação Crescente
  useEffect(() => {
    const unsubAlunos = onSnapshot(collection(db, 'alunos'), (snapshot) => {
      const listaAlunos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      
      if (!dataSelecionada) return;

      const [anoStr, mesStr, diaStr] = dataSelecionada.split('-');
      const dataAula = new Date(parseInt(anoStr), parseInt(mesStr) - 1, parseInt(diaStr));
      
      const dataLimite = new Date(dataAula);
      dataLimite.setDate(dataAula.getDate() - 6);

      const aniversariantesEncontrados: { item: AniversarianteItem; dataReal: Date }[] = [];

      listaAlunos.forEach(aluno => {
        const nome = aluno.nome || 'Sem Nome';
        const classe = aluno.classe || aluno.turma || 'Sem Classe';

        checarEInserirData(aluno.nascimento, 'Nascimento', aluno.id, nome, classe);
        checarEInserirData(aluno.casamento, 'Casamento', aluno.id, nome, classe);
      });

      function checarEInserirData(dataStr: string, tipo: 'Nascimento' | 'Casamento', id: string, nome: string, classe: string) {
        if (!dataStr || typeof dataStr !== 'string') return;

        let anoOriginal: number | null = null;
        let mes: number | null = null;
        let dia: number | null = null;
        const limpa = dataStr.trim();

        if (limpa.includes('-')) {
          const partes = limpa.split('-');
          if (partes.length === 3) {
            if (partes[0].length === 4) {
              anoOriginal = parseInt(partes[0], 10);
              mes = parseInt(partes[1], 10) - 1;
              dia = parseInt(partes[2], 10);
            } else {
              dia = parseInt(partes[0], 10);
              mes = parseInt(partes[1], 10) - 1;
              anoOriginal = parseInt(partes[2], 10);
            }
          }
        } else if (limpa.includes('/')) {
          const partes = limpa.split('/');
          if (partes.length === 3) {
            dia = parseInt(partes[0], 10);
            mes = parseInt(partes[1], 10) - 1;
            anoOriginal = parseInt(partes[2], 10);
          }
        }

        if (mes === null || dia === null || isNaN(mes) || isNaN(dia)) return;

        const anoAtual = dataAula.getFullYear();
        const dataAniversarioEsteAno = new Date(anoAtual, mes, dia);

        if (dataAniversarioEsteAno >= dataLimite && dataAniversarioEsteAno <= dataAula) {
          let detalheAnos = undefined;
          if (tipo === 'Casamento' && anoOriginal && !isNaN(anoOriginal)) {
            const anosUniao = anoAtual - anoOriginal;
            if (anosUniao > 0) {
              detalheAnos = obterNomeBodas(anosUniao);
            }
          }

          aniversariantesEncontrados.push({
            dataReal: dataAniversarioEsteAno,
            item: {
              id: `${id}-${tipo}`,
              nome,
              classe,
              tipo,
              dataStr: `${String(dia).padStart(2, '0')}/${String(mes + 1).padStart(2, '0')}`,
              detalheAnos
            }
          });
        }
      }

      // Ordenar por ordem crescente de data (da mais antiga para a mais recente na semana)
      aniversariantesEncontrados.sort((a, b) => a.dataReal.getTime() - b.dataReal.getTime());

      setAniversariantesSemana(aniversariantesEncontrados.map(x => x.item));
    });

    return () => unsubAlunos();
  }, [dataSelecionada]);

  const totalMatriculados = classesEBD.reduce((acc, c) => acc + (c.matriculados || 0), 0);
  const totalPresentesAlunos = classesEBD.reduce((acc, c) => acc + (c.presentes || 0), 0);
  const totalVisitantes = visitantesDia.length;
  const totalGeralPresenca = totalPresentesAlunos + totalVisitantes;
  const percentualFrequencia = totalMatriculados > 0 ? Math.round((totalPresentesAlunos / totalMatriculados) * 100) : 0;

  const nascimentosSemana = aniversariantesSemana.filter(a => a.tipo === 'Nascimento');
  const casamentosSemana = aniversariantesSemana.filter(a => a.tipo === 'Casamento');

  const handleEncerrarEBD = async () => {
    const novoStatus = !ebdEncerrada;
    if (window.confirm(novoStatus ? 'Bloquear edições das chamadas?' : 'Reabrir EBD para edições?')) {
      try {
        setEbdEncerrada(novoStatus);
        await setDoc(doc(db, 'ebd_fechamentos', dataSelecionada), {
          data: dataSelecionada,
          encerrada: novoStatus,
          classes: classesEBD,
          visitantes: visitantesDia,
          aniversariantes: aniversariantesSemana,
          atualizadoEm: new Date().toISOString()
        }, { merge: true });
      } catch (error) { alert('Erro ao salvar alteração.'); }
    }
  };

  const handleExcluirAulaData = async () => {
    const confirmado = window.confirm(`Tem certeza que deseja excluir todos os registros/chamadas e o encerramento da data ${dataSelecionada}?`);
    
    if (confirmado) {
      try {
        setLoading(true);
        const fechamentoRef = doc(db, 'ebd_fechamentos', dataSelecionada);
        await deleteDoc(fechamentoRef);

        const q = query(collection(db, 'chamadas'), where('data', '==', dataSelecionada));
        const querySnapshot = await getDocs(q);
        
        const promessasExclusao = querySnapshot.docs.map((documento: any) => 
          deleteDoc(doc(db, 'chamadas', documento.id))
        );
        await Promise.all(promessasExclusao);

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

        {loading ? <p className="text-center py-8 text-slate-400">Carregando em tempo real...</p> : (
          <div className="space-y-6">
            <div>
              <div className="hidden md:block">
                <table className="w-full text-left">
                  <thead><tr className="text-slate-400 text-[11px] uppercase border-b border-slate-100"><th className="pb-3">Classe</th><th className="pb-3 text-center">Matr.</th><th className="pb-3 text-center">Pres.</th><th className="pb-3 text-center">Vis.</th></tr></thead>
                  <tbody className="divide-y divide-slate-50">{classesEBD.map(c => <tr key={c.id}><td className="py-3 font-semibold">{c.nome}</td><td className="text-center">{c.matriculados}</td><td className="text-center">{c.presentes}</td><td className="text-center">{c.visitantes}</td></tr>)}</tbody>
                </table>
              </div>
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

            {/* SEÇÃO EM 3 COLUNAS: VISITANTES, ANIVERSÁRIOS E CASAMENTOS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 border-t border-slate-100 pt-6">
              
              {/* VISITANTES DO DIA */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-600" /> Visitantes ({visitantesDia.length})
                </h3>
                {visitantesDia.length > 0 ? (
                  <div className="space-y-2">
                    {visitantesDia.map((vis, idx) => (
                      <div key={idx} className="bg-amber-50/50 p-3 rounded-xl border border-amber-100/60 flex justify-between items-center">
                        <span className="text-xs font-semibold text-slate-800">{vis.nome}</span>
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">{vis.classe}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Nenhum visitante registrado.</p>
                )}
              </div>

              {/* ANIVERSARIANTES DE NASCIMENTO */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <Cake className="w-4 h-4 text-indigo-600" /> Aniversários ({nascimentosSemana.length})
                </h3>
                {nascimentosSemana.length > 0 ? (
                  <div className="space-y-2">
                    {nascimentosSemana.map((aniv) => (
                      <div key={aniv.id} className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/60 flex justify-between items-center">
                        <div>
                          <p className="text-xs font-semibold text-slate-800">{aniv.nome}</p>
                          <p className="text-[10px] text-slate-500">{aniv.classe}</p>
                        </div>
                        <span className="text-xs font-bold bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-lg">{aniv.dataStr}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Nenhum aniversariante na semana.</p>
                )}
              </div>

              {/* ANIVERSÁRIOS DE CASAMENTO COM BODAS */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-600" /> Casamentos ({casamentosSemana.length})
                </h3>
                {casamentosSemana.length > 0 ? (
                  <div className="space-y-2">
                    {casamentosSemana.map((aniv) => (
                      <div key={aniv.id} className="bg-rose-50/50 p-3 rounded-xl border border-rose-100/60 flex justify-between items-center">
                        <div>
                          <p className="text-xs font-semibold text-slate-800">{aniv.nome}</p>
                          <p className="text-[10px] text-slate-500">
                            {aniv.classe} {aniv.detalheAnos && <span className="font-bold text-rose-600">• {aniv.detalheAnos}</span>}
                          </p>
                        </div>
                        <span className="text-xs font-bold bg-rose-100 text-rose-800 px-2.5 py-1 rounded-lg">{aniv.dataStr}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Nenhum aniversário de casamento.</p>
                )}
              </div>

            </div>

          </div>
        )}

        <p className="text-xs text-slate-500 pt-4 border-t border-slate-100">Frequência: {percentualFrequencia}%</p>
      </div>
    </div>
  );
}