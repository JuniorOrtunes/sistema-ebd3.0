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

    // Sincronização em tempo real da coleção de alunos para contagem estrita de ativos
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

  // Recalcula o denominador de matriculados considerando exclusivamente alunos com situacao === 'Ativo'
  const dadosEncerramentoComAlunosAtivos = useMemo(() => {
    return dadosEncerramento.map((registro) => {
      const ativosDaClasse = listaAlunos.filter((aluno) => {
        const isAtivo = aluno.situacao === 'Ativo';
        if (!isAtivo) return false;

        if (!registro.classeId) return true;
        return aluno.classeId === registro.classeId;
      });

      const matriculadosAtivos = registro.classeId 
        ? ativosDaClasse.length 
        : registro.matriculados;

      return {
        ...registro,
        matriculados: matriculadosAtivos,
      };
    });
  }, [dadosEncerramento, listaAlunos]);

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
        domingosDoMesMap.set(dataKey, { presentes: 0, matriculados: 0 });
      }
      const atual = domingosDoMesMap.get(dataKey)!;
      atual.presentes += Number(d.presentes) || 0;
      atual.matriculados += Number(d.matriculados) || 0;
    });

    return Array.from(domingosDoMesMap.entries())
      .sort(([dataA], [dataB]) => dataA.localeCompare(dataB))
      .map(([data, vals], index, arr) => {
        const temFrequenciaAtual = vals.matriculados > 0;
        const freqNum = temFrequenciaAtual ? Math.round((vals.presentes / vals.matriculados) * 100) : 0;
        let vsAnterior = '—';

        if (index > 0) {
          const prevVals = arr[index - 1][1];
          if (prevVals.matriculados > 0 && temFrequenciaAtual) {
            const prevFreq = Math.round((prevVals.presentes / prevVals.matriculados) * 100);
            const diff = freqNum - prevFreq;
            vsAnterior = diff > 0 ? `+${diff}%` : `${diff}%`;
          }
        }

        return {
          referencia: formatarDataBR(data),
          presentes: vals.presentes,
          matriculados: vals.matriculados,
          frequenciaNum: freqNum,
          frequencia: temFrequenciaAtual ? `${freqNum}%` : '—',
          vsAnterior,
          cor: CORES_CLASSES[index % CORES_CLASSES.length],
        };
      });
  }, [dadosFiltradosMes]);

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
      const matriculados = registrosMes.reduce((acc, cur) => acc + (Number(cur.matriculados) || 0), 0);
      const temFrequenciaAtual = matriculados > 0;
      const frequenciaNum = temFrequenciaAtual ? Math.round((presentes / matriculados) * 100) : 0;
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

        const matAnt = registrosMesAnt.reduce((acc, cur) => acc + (Number(cur.matriculados) || 0), 0);
        const presAnt = registrosMesAnt.reduce((acc, cur) => acc + (Number(cur.presentes) || 0), 0);

        if (matAnt > 0 && temFrequenciaAtual) {
          const freqAnt = Math.round((presAnt / matAnt) * 100);
          const diffFreq = frequenciaNum - freqAnt;
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
  }, [dadosEncerramentoComAlunosAtivos, mesesDisponiveis, classeFiltro]);

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