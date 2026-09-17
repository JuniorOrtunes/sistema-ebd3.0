import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../../firebase';
import type { Classe, RegistroEncerramento } from './type';
import { CORES_CLASSES } from './type';
import { formatarDataBR, formatarMesBR } from '../../../utils/dateUtils';
import { ComparativosFiltros } from './ComparativosFiltros';
import { ComparativosGrafico } from './ComparativosGrafico';
import { ComparativosTabela } from './ComparativosTabela';

interface AlunoFirestore {
  id: string;
  classeId?: string;
  classe?: string;
  situacao?: string;
}

export function Comparativos() {
  const [tipoVisualizacao, setTipoVisualizacao] = useState<'semana' | 'mes'>('semana');
  const [classeFiltro, setClasseFiltro] = useState('todas');
  const [mesFiltro, setMesFiltro] = useState('2026-08');

  const [listaClasses, setListaClasses] = useState<Classe[]>([]);
  const [dadosEncerramento, setDadosEncerramento] = useState<RegistroEncerramento[]>([]);
  const [listaAlunos, setListaAlunos] = useState<AlunoFirestore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const unsubClasses = onSnapshot(collection(db, 'classes'), (snapshot) => {
      const classes = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Classe[];

      classes.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { numeric: true }));
      setListaClasses(classes);
    });

    // Sincronização em tempo real da coleção de alunos (situação oficial: situacao === 'Ativo')
    const unsubAlunos = onSnapshot(collection(db, 'alunos'), (snapshot) => {
      const alunos = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as AlunoFirestore[];
      setListaAlunos(alunos);
    });

    const unsubEncerramento = onSnapshot(
      collection(db, 'ebd_fechamentos'),
      (snapshot) => {
        const encerramento: RegistroEncerramento[] = [];

        snapshot.docs.forEach((docDoc) => {
          const docData = docDoc.data();
          const dataStr = docDoc.id;
          
          if (docData.classes && Array.isArray(docData.classes)) {
            docData.classes.forEach((cls: any) => {
              encerramento.push({
                id: `${dataStr}-${cls.id || cls.nome}`,
                data: dataStr,
                classeId: cls.id,
                nomeClasse: cls.nome,
                presentes: Number(cls.presentes) || 0,
                matriculados: Number(cls.matriculados) || 0,
                dataNormalizada: dataStr,
              });
            });
          } else {
            encerramento.push({
              id: docDoc.id,
              data: dataStr,
              presentes: Number(docData.presentes) || 0,
              matriculados: Number(docData.matriculados) || 0,
              dataNormalizada: dataStr,
            });
          }
        });

        setDadosEncerramento(encerramento);
        setLoading(false);
      },
      (error) => {
        console.error('Erro ao sincronizar dados comparativos:', error);
        setLoading(false);
      }
    );

    return () => {
      unsubClasses();
      unsubAlunos();
      unsubEncerramento();
    };
  }, []);

  // Total geral de alunos com situacao === 'Ativo' na escola inteira
  const ativosTotaisCount = useMemo(() => {
    return listaAlunos.filter((a) => a.situacao === 'Ativo').length;
  }, [listaAlunos]);

  // Função auxiliar para obter o total real de ativos de uma turma específica
  const getAtivosDaClasse = (classeIdParam?: string, nomeClasseParam?: string) => {
    const ativos = listaAlunos.filter((a) => {
      if (a.situacao !== 'Ativo') return false;
      if (!classeIdParam && !nomeClasseParam) return true;

      const matchId = classeIdParam && (a.classeId === classeIdParam || a.id === classeIdParam);
      const matchNome = nomeClasseParam && (a.classe === nomeClasseParam || a.classeId === classeIdParam);
      return matchId || matchNome;
    });
    return ativos.length;
  };

  // Ajusta o denominador de cada registro com base estrita no filtro selecionado ("todas" ou classe específica)
  const dadosEncerramentoComAlunosAtivos = useMemo(() => {
    return dadosEncerramento.map((registro) => {
      let matriculadosReais = ativosTotaisCount;

      if (classeFiltro !== 'todas') {
        const classeAlvo = listaClasses.find(c => c.id === classeFiltro || c.nome === classeFiltro);
        matriculadosReais = getAtivosDaClasse(classeFiltro, classeAlvo?.nome);
      } else if (registro.classeId || registro.nomeClasse) {
        const countTurma = getAtivosDaClasse(registro.classeId, registro.nomeClasse);
        if (countTurma > 0) {
          matriculadosReais = countTurma;
        }
      }

      return {
        ...registro,
        matriculados: matriculadosReais,
      };
    });
  }, [dadosEncerramento, listaAlunos, ativosTotaisCount, classeFiltro, listaClasses]);

  const mesesDisponiveis = useMemo(() => {
    return Array.from(
      new Set(
        dadosEncerramentoComAlunosAtivos
          .map((d) => d.dataNormalizada?.substring(0, 7))
          .filter(Boolean)
      )
    ).sort() as string[];
  }, [dadosEncerramentoComAlunosAtivos]);

  useEffect(() => {
    if (mesesDisponiveis.length > 0 && !mesesDisponiveis.includes(mesFiltro)) {
      setMesFiltro(mesesDisponiveis[mesesDisponiveis.length - 1]);
    }
  }, [mesesDisponiveis, mesFiltro]);

  const dadosFiltradosMes = useMemo(() => {
    return dadosEncerramentoComAlunosAtivos.filter((d) => {
      if (!d.dataNormalizada) return false;
      const pertenceMes = d.dataNormalizada.startsWith(mesFiltro);
      const atendeClasse =
        classeFiltro === 'todas' ||
        d.classeId === classeFiltro ||
        d.nomeClasse === classeFiltro;
      return pertenceMes && atendeClasse;
    });
  }, [dadosEncerramentoComAlunosAtivos, mesFiltro, classeFiltro]);

  const domingosEvolucao = useMemo(() => {
    const domingosDoMesMap = new Map<string, { presentes: number; matriculados: number }>();

    dadosFiltradosMes.forEach((d) => {
      const dataKey = d.dataNormalizada!;
      if (!domingosDoMesMap.has(dataKey)) {
        domingosDoMesMap.set(dataKey, { presentes: 0, matriculados: classeFiltro === 'todas' ? ativosTotaisCount : d.matriculados });
      }
      const atual = domingosDoMesMap.get(dataKey)!;
      atual.presentes += Number(d.presentes) || 0;
    });

    return Array.from(domingosDoMesMap.entries())
      .sort(([dataA], [dataB]) => dataA.localeCompare(dataB))
      .map(([data, vals], index, arr) => {
        const matriculadosFinal = classeFiltro === 'todas' ? ativosTotaisCount : vals.matriculados;
        const temFrequenciaAtual = matriculadosFinal > 0;
        const freqNum = temFrequenciaAtual ? Math.round((vals.presentes / matriculadosFinal) * 100) : 0;
        let vsAnterior = '—';

        if (index > 0) {
          const prevVals = arr[index - 1][1];
          const prevMatriculados = classeFiltro === 'todas' ? ativosTotaisCount : prevVals.matriculados;
          if (prevMatriculados > 0 && temFrequenciaAtual) {
            const prevFreq = Math.round((prevVals.presentes / prevMatriculados) * 100);
            const diff = freqNum - prevFreq;
            vsAnterior = diff > 0 ? `+${diff}%` : `${diff}%`;
          }
        }

        return {
          referencia: formatarDataBR(data),
          presentes: vals.presentes,
          matriculados: matriculadosFinal,
          frequenciaNum: freqNum,
          frequencia: temFrequenciaAtual ? `${freqNum}%` : '—',
          vsAnterior,
          cor: CORES_CLASSES[index % CORES_CLASSES.length],
        };
      });
  }, [dadosFiltradosMes, classeFiltro, ativosTotaisCount]);

  const mesesEvolucao = useMemo(() => {
    return mesesDisponiveis.map((mes, index, arr) => {
      const registrosMes = dadosEncerramentoComAlunosAtivos.filter((d) => {
        const atendeClasse =
          classeFiltro === 'todas' ||
          d.classeId === classeFiltro ||
          d.nomeClasse === classeFiltro;
        return d.dataNormalizada?.startsWith(mes) && atendeClasse;
      });

      const presentes = registrosMes.reduce((acc, cur) => acc + (Number(cur.presentes) || 0), 0);
      
      let matriculados = 0;
      if (classeFiltro === 'todas') {
        matriculados = ativosTotaisCount;
      } else {
        const classeAlvo = listaClasses.find(c => c.id === classeFiltro || c.nome === classeFiltro);
        matriculados = getAtivosDaClasse(classeFiltro, classeAlvo?.nome);
      }
      if (matriculados === 0 && registrosMes.length > 0) {
        matriculados = registrosMes[0].matriculados;
      }

      // Calcula a frequência mensal baseada na média dos domingos do mês para evitar distorções acima de 100%
      const domingosDoMesMap = new Map<string, { presentes: number }>();
      registrosMes.forEach((d) => {
        const dataKey = d.dataNormalizada!;
        if (!domingosDoMesMap.has(dataKey)) {
          domingosDoMesMap.set(dataKey, { presentes: 0 });
        }
        domingosDoMesMap.get(dataKey)!.presentes += Number(d.presentes) || 0;
      });

      const frequenciasDomingos: number[] = [];
      domingosDoMesMap.forEach((vals) => {
        if (matriculados > 0) {
          frequenciasDomingos.push(Math.round((vals.presentes / matriculados) * 100));
        }
      });

      const frequenciaNum = frequenciasDomingos.length > 0
        ? Math.round(frequenciasDomingos.reduce((a, b) => a + b, 0) / frequenciasDomingos.length)
        : 0;

      const temFrequenciaAtual = matriculados > 0 && frequenciasDomingos.length > 0;
      let vsAnterior = '—';

      if (index > 0) {
        const mesAnterior = arr[index - 1];
        const registrosMesAnt = dadosEncerramentoComAlunosAtivos.filter((d) => {
          const atendeClasse =
            classeFiltro === 'todas' ||
            d.classeId === classeFiltro ||
            d.nomeClasse === classeFiltro;
          return d.dataNormalizada?.startsWith(mesAnterior) && atendeClasse;
        });

        const domingosMesAntMap = new Map<string, { presentes: number }>();
        registrosMesAnt.forEach((d) => {
          const dataKey = d.dataNormalizada!;
          if (!domingosMesAntMap.has(dataKey)) {
            domingosMesAntMap.set(dataKey, { presentes: 0 });
          }
          domingosMesAntMap.get(dataKey)!.presentes += Number(d.presentes) || 0;
        });

        let matAnt = 0;
        if (classeFiltro === 'todas') {
          matAnt = ativosTotaisCount;
        } else {
          const classeAlvo = listaClasses.find(c => c.id === classeFiltro || c.nome === classeFiltro);
          matAnt = getAtivosDaClasse(classeFiltro, classeAlvo?.nome);
        }
        if (matAnt === 0 && registrosMesAnt.length > 0) {
          matAnt = registrosMesAnt[0].matriculados;
        }

        const freqAnts: number[] = [];
        domingosMesAntMap.forEach((vals) => {
          if (matAnt > 0) {
            freqAnts.push(Math.round((vals.presentes / matAnt) * 100));
          }
        });

        if (freqAnts.length > 0 && temFrequenciaAtual) {
          const freqAntMedia = Math.round(freqAnts.reduce((a, b) => a + b, 0) / freqAnts.length);
          const diffFreq = frequenciaNum - freqAntMedia;
          vsAnterior = diffFreq > 0 ? `+${diffFreq}%` : `${diffFreq}%`;
        }
      }

      return {
        referencia: formatarMesBR(mes),
        mesCodigo: mes,
        presentes,
        matriculados,
        frequenciaNum,
        frequencia: temFrequenciaAtual ? `${frequenciaNum}%` : '—',
        vsAnterior,
        cor: CORES_CLASSES[index % CORES_CLASSES.length],
      };
    });
  }, [dadosEncerramentoComAlunosAtivos, mesesDisponiveis, classeFiltro, ativosTotaisCount, listaClasses, listaAlunos]);

  const dadosTabela = useMemo(() => {
    return tipoVisualizacao === 'semana' ? domingosEvolucao : [...mesesEvolucao].reverse();
  }, [tipoVisualizacao, domingosEvolucao, mesesEvolucao]);

  const dadosGraficoAtivo = useMemo(() => {
    return tipoVisualizacao === 'semana' ? domingosEvolucao : mesesEvolucao;
  }, [tipoVisualizacao, domingosEvolucao, mesesEvolucao]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fadeIn">
      <ComparativosFiltros
        tipoVisualizacao={tipoVisualizacao}
        setTipoVisualizacao={setTipoVisualizacao}
        classeFiltro={classeFiltro}
        setClasseFiltro={setClasseFiltro}
        mesFiltro={mesFiltro}
        setMesFiltro={setMesFiltro}
        listaClasses={listaClasses}
        mesesDisponiveis={mesesDisponiveis}
      />

      <ComparativosGrafico
        tipoVisualizacao={tipoVisualizacao}
        mesFiltro={mesFiltro}
        loading={loading}
        dadosGraficoAtivo={dadosGraficoAtivo}
      />

      <ComparativosTabela
        tipoVisualizacao={tipoVisualizacao}
        dadosTabela={dadosTabela}
      />
    </div>
  );
}