import { useState, useEffect } from 'react';
import { collection, doc, setDoc, deleteDoc, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { obterNomeBodas } from '../utils/bodas';
import { calcularFrequenciaGeral } from '../services/frequenciaService';

export interface ClasseItem {
  id: string;
  nome: string;
  matriculados: number;
  presentes: number;
  visitantes: number;
}

export interface VisitanteItem {
  nome: string;
  classe: string;
}

export interface AniversarianteItem {
  id: string;
  nome: string;
  classe: string;
  tipo: 'Nascimento' | 'Casamento';
  dataStr: string;
  detalheAnos?: string;
}

export function useEncerramento() {
  const [dataSelecionada, setDataSelecionada] = useState(new Date().toISOString().split('T')[0]);
  const [ebdEncerrada, setEbdEncerrada] = useState(false);
  const [classesEBD, setClassesEBD] = useState<ClasseItem[]>([]);
  const [visitantesDia, setVisitantesDia] = useState<VisitanteItem[]>([]);
  const [aniversariantesSemana, setAniversariantesSemana] = useState<AniversarianteItem[]>([]);
  const [percentualFrequencia, setPercentualFrequencia] = useState(0);
  const [loading, setLoading] = useState(true);

  // 1. REALTIME: Sincronização em tempo real de Classes, Chamadas, Fechamentos e Frequência Centralizada
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const atualizarFrequenciaGlobal = async () => {
      try {
        const resultado = await calcularFrequenciaGeral(dataSelecionada);
        if (isMounted) {
          setPercentualFrequencia(resultado.percentualFrequencia);
        }
      } catch (error) {
        console.error('Erro ao calcular frequência geral:', error);
      }
    };

    atualizarFrequenciaGlobal();

    let classesMap: Record<string, ClasseItem> = {};
    let chamadasList: any[] = [];

    const unsubClasses = onSnapshot(collection(db, 'classes'), (classesSnap) => {
      classesMap = {};
      
      classesSnap.docs.forEach(docSnap => {
        const dados = docSnap.data();
        const nomeClasse = dados.nome || docSnap.id;
        const itemClasse: ClasseItem = {
          id: docSnap.id,
          nome: nomeClasse,
          matriculados: dados.matriculados || 0,
          presentes: 0,
          visitantes: 0,
        };
        classesMap[nomeClasse] = itemClasse;
      });

      processarDados(classesMap, chamadasList);
    });

    const unsubChamadas = onSnapshot(collection(db, 'chamadas'), (chamadasSnap) => {
      chamadasList = chamadasSnap.docs.map(doc => doc.data());
      processarDados(classesMap, chamadasList);
      atualizarFrequenciaGlobal();
    });

    const fechamentoRef = doc(db, 'ebd_fechamentos', dataSelecionada);
    const unsubFechamento = onSnapshot(fechamentoRef, (fechamentoSnap) => {
      if (isMounted) {
        setEbdEncerrada(fechamentoSnap.exists() ? (fechamentoSnap.data().encerrada || false) : false);
      }
    });

    function processarDados(mapa: Record<string, ClasseItem>, chamadas: any[]) {
      const mapaTemp: Record<string, ClasseItem> = {};
      const visitantesAcumulados: VisitanteItem[] = [];

      chamadas.forEach((dados: any) => {
        const nomeClasse = dados.classe;
        const dataChamada = dados.data; 

        if (dataChamada === dataSelecionada && nomeClasse) {
          const dadosCadastrados = mapa[nomeClasse];
          mapaTemp[nomeClasse] = {
            id: dadosCadastrados?.id || nomeClasse,
            nome: nomeClasse,
            matriculados: dados.totalMatriculados !== undefined ? dados.totalMatriculados : (dadosCadastrados?.matriculados || 0),
            presentes: dados.totalPresentesAlunos || 0,
            visitantes: (dados.visitantes || []).length
          };

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

      const listaConsolidada = Object.values(mapaTemp);
      listaConsolidada.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));

      if (isMounted) {
        setClassesEBD(listaConsolidada);
        setVisitantesDia(visitantesAcumulados);
        setLoading(false);
      }
    }

    return () => {
      isMounted = false;
      unsubClasses();
      unsubChamadas();
      unsubFechamento();
    };
  }, [dataSelecionada]);

  // 2. ALUNOS MATRICULADOS E ANIVERSARIANTES
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

      aniversariantesEncontrados.sort((a, b) => a.dataReal.getTime() - b.dataReal.getTime());
      setAniversariantesSemana(aniversariantesEncontrados.map(x => x.item));
    });

    return () => unsubAlunos();
  }, [dataSelecionada]);

  const handleEncerrarEBD = async () => {
    const novoStatus = !ebdEncerrada;
    const mensagemConfirmacao = novoStatus ? 'Deseja realmente encerrar a EBD e bloquear as edições?' : 'Deseja reabrir a EBD para edições?';
    
    if (window.confirm(mensagemConfirmacao)) {
      try {
        setEbdEncerrada(novoStatus);

        const dadosFechamento = {
          data: dataSelecionada,
          encerrada: novoStatus,
          classes: JSON.parse(JSON.stringify(classesEBD)),
          visitantes: JSON.parse(JSON.stringify(visitantesDia)),
          aniversariantes: JSON.parse(JSON.stringify(aniversariantesSemana)),
          atualizadoEm: new Date().toISOString()
        };

        await setDoc(doc(db, 'ebd_fechamentos', dataSelecionada), dadosFechamento, { merge: true });
      } catch (error) {
        console.error('Erro detalhado ao salvar encerramento da EBD:', error);
        setEbdEncerrada(!novoStatus);
        alert('Erro ao salvar alteração. Verifique o console para mais detalhes.');
      }
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
        
        const promessasExclusao = querySnapshot.docs.map((documento) => 
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

  const totalPresentesAlunos = classesEBD.reduce((acc, c) => acc + (c.presentes || 0), 0);
  const totalVisitantes = visitantesDia.length;
  const totalGeralPresenca = totalPresentesAlunos + totalVisitantes;
  
  const nascimentosSemana = aniversariantesSemana.filter((a: any) => a.tipo === 'Nascimento');
  const casamentosSemana = aniversariantesSemana.filter((a: any) => a.tipo === 'Casamento');

  return {
    dataSelecionada,
    setDataSelecionada,
    ebdEncerrada,
    classesEBD,
    visitantesDia,
    loading,
    totalGeralPresenca,
    percentualFrequencia,
    nascimentosSemana,
    casamentosSemana,
    handleEncerrarEBD,
    handleExcluirAulaData
  };
}