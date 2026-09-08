import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { calcularFrequenciaGeral } from '../services/frequenciaService';

// Paleta oficial exata com 9 cores rigorosamente contrastantes por turma
const HEX_CORES_CLASSES = [
  '#4f46e5', // 01 - Indigo (indigo-600)
  '#059669', // 02 - Emerald (emerald-600)
  '#f59e0b', // 03 - Amber (amber-500)
  '#e11d48', // 04 - Rose (rose-600)
  '#2563eb', // 05 - Blue (blue-600)
  '#ea580c', // 06 - Orange (orange-600)
  '#0891b2', // 07 - Cyan (cyan-600)
  '#7c3aed', // 08 - Purple (purple-600)
  '#0f172a', // 09 - Slate/Preto (slate-900)
];

// Função para associar cor fixa e exclusiva baseada no número/índice da turma
export const getTurmaColor = (nome: string, index: number) => {
  const numMatch = String(nome).match(/\d+/);
  if (numMatch) {
    const num = parseInt(numMatch[0], 10);
    if (num >= 1 && num <= 9) {
      return HEX_CORES_CLASSES[num - 1];
    }
  }
  return HEX_CORES_CLASSES[index % HEX_CORES_CLASSES.length];
};

// Ordenador numérico rigoroso para turmas (ex: "Classe 01", "Turma 2", etc.)
export const ordenarTurmas = (a: any, b: any, key: string) => {
  const valA = String(a[key] || '');
  const valB = String(b[key] || '');
  const numA = parseInt(valA.replace(/\D/g, ''), 10);
  const numB = parseInt(valB.replace(/\D/g, ''), 10);

  if (!isNaN(numA) && !isNaN(numB)) {
    return numA - numB;
  }
  return valA.localeCompare(valB, 'pt-BR', { sensitivity: 'base' });
};

export function useDashboard() {
  const [totalAlunos, setTotalAlunos] = useState(0);
  const [totalClasses, setTotalClasses] = useState(0);
  const [totalProfessores, setTotalProfessores] = useState(0);
  const [totalPresentes, setTotalPresentes] = useState(0);
  const [totalVisitantes, setTotalVisitantes] = useState(0);
  const [percentualPresenca, setPercentualPresenca] = useState(0);

  const [presencaAulaData, setPresencaAulaData] = useState<any[]>([]);
  const [frequenciaClasseData, setFrequenciaClasseData] = useState<any[]>([]);
  const [distribuicaoData, setDistribuicaoData] = useState<any[]>([]);
  const [evolucaoSemanasData, setEvolucaoSemanasData] = useState<any[]>([]);

  useEffect(() => {
    let listaChamadasGlobal: any[] = [];
    let listaAlunosGlobal: any[] = [];
    let listaClassesGlobal: any[] = [];

    const recalcularTudo = async () => {
      // 1. Alunos e Distribuição por Classe
      const alunosAtivos = listaAlunosGlobal.filter(aluno => {
        const situacaoStr = String(aluno.situacao || aluno.status || '').trim().toLowerCase();
        return situacaoStr !== 'inativo';
      });
      setTotalAlunos(alunosAtivos.length);

      const profsNosAlunos = listaAlunosGlobal.filter(a => a.eProfessor).length;
      setTotalProfessores(profsNosAlunos);

      const contagemClasses: Record<string, number> = {};
      alunosAtivos.forEach((aluno: any) => {
        const nomeClasse = aluno.classe || aluno.turma || 'Não definida';
        contagemClasses[nomeClasse] = (contagemClasses[nomeClasse] || 0) + 1;
      });

      let barData = Object.keys(contagemClasses).map((nome, index) => ({
        name: nome,
        value: contagemClasses[nome],
        color: getTurmaColor(nome, index)
      }));
      barData.sort((a, b) => ordenarTurmas(a, b, 'name'));
      setDistribuicaoData(barData);

      // 2. Classes Ativas Count
      const classesAtivasCount = listaClassesGlobal.filter(c => c.ativa !== false).length;
      setTotalClasses(classesAtivasCount);

      // Consolidar conjunto de todas as classes ativas para gráficos
      const classesAtivasSet = new Set<string>();
      listaClassesGlobal.forEach((c: any) => {
        if (c.ativa !== false && (c.nome || c.turma || c.name)) {
          classesAtivasSet.add(c.nome || c.turma || c.name);
        }
      });
      alunosAtivos.forEach((aluno: any) => {
        const nomeClasse = aluno.classe || aluno.turma;
        if (nomeClasse) classesAtivasSet.add(nomeClasse);
      });
      const todasClassesAtivas = Array.from(classesAtivasSet);
      todasClassesAtivas.sort((a, b) => ordenarTurmas({ classe: a }, { classe: b }, 'classe'));

      // 3. Métricas globais da última aula
      if (listaChamadasGlobal.length > 0) {
        const datasUnicas = Array.from(new Set(listaChamadasGlobal.map((c: any) => c.data))).filter(Boolean) as string[];
        datasUnicas.sort().reverse();
        const ultimaData = datasUnicas[0];

        const chamadasUltimaAula = listaChamadasGlobal.filter((cls: any) => cls.data === ultimaData);
        let sumPresentesUltima = 0;
        let sumVisitantesUltima = 0;

        chamadasUltimaAula.forEach((cls: any) => {
          sumPresentesUltima += cls.totalPresentesAlunos || 0;
          sumVisitantesUltima += cls.totalVisitantes || 0;
        });

        setTotalPresentes(sumPresentesUltima);
        setTotalVisitantes(sumVisitantesUltima);

        const resultadoFrequencia = await calcularFrequenciaGeral(ultimaData);
        setPercentualPresenca(resultadoFrequencia.percentualFrequencia);
      } else {
        setTotalPresentes(0);
        setTotalVisitantes(0);
        setPercentualPresenca(0);
      }

      // 4. Gráfico "% Presença por Aula" (Mês Vigente)
      const agora = new Date();
      const anoAtual = agora.getFullYear();
      const mesAtual = String(agora.getMonth() + 1).padStart(2, '0');
      const periodoVigente = `${anoAtual}-${mesAtual}`;

      const chamadasMesVigente = listaChamadasGlobal.filter((cls: any) => {
        const dataRaw = cls.data || '';
        return dataRaw.startsWith(periodoVigente);
      });

      let chartData = chamadasMesVigente.map((cls: any) => {
        const presentes = cls.totalPresentesAlunos || 0;
        const matriculados = cls.totalMatriculados || 0;
        const visitantes = cls.totalVisitantes || 0;
        const taxa = matriculados > 0 ? Math.round((presentes / matriculados) * 100) : 0;

        const nomeClasse = cls.classe || cls.turma || 'Classe';
        const dataRaw = cls.data || '';
        
        let dataFormatada = dataRaw;
        if (dataRaw && dataRaw.includes('-')) {
          const partes = dataRaw.split('-');
          if (partes.length === 3) {
            dataFormatada = `${partes[2]}/${partes[1]}/${partes[0]}`;
          }
        }

        return {
          aula: dataFormatada ? `${nomeClasse} - ${dataFormatada}` : nomeClasse,
          classeOriginal: nomeClasse,
          dataRaw: dataRaw,
          presenca: taxa,
          total: presentes + visitantes
        };
      });

      chartData.sort((a, b) => {
        if (a.dataRaw !== b.dataRaw) {
          return a.dataRaw.localeCompare(b.dataRaw);
        }
        return ordenarTurmas(a, b, 'classeOriginal');
      });

      setPresencaAulaData(chartData);

    // 5. Gráfico "Frequência por Classe" (Mês vigente, excluindo "Geral", com cálculo percentual)
      let classesValidasParaFreq = todasClassesAtivas.filter(nome => {
        const lower = String(nome).toLowerCase();
        return !lower.includes('geral');
      });

      let freqClasseArray = classesValidasParaFreq.map(nomeClasse => {
        const chamadasDaClasse = listaChamadasGlobal.filter((c: any) => {
          const clsNome = c.classe || c.turma || '';
          const dataRaw = c.data || '';
          return clsNome === nomeClasse && dataRaw.startsWith(periodoVigente);
        });

        let totalPres = 0;
        let totalMat = 0;
        chamadasDaClasse.forEach((c: any) => {
          totalPres += c.totalPresentesAlunos || 0;
          totalMat += c.totalMatriculados || 0;
        });

        const percentualFreq = totalMat > 0 ? Math.round((totalPres / totalMat) * 100) : 0;
        return {
          classe: nomeClasse,
          frequencia: percentualFreq
        };
      });

      setFrequenciaClasseData(freqClasseArray);

      // 6. Evolução Semanas
      const evolucaoMap = listaChamadasGlobal.reduce((acc: any, curr: any) => {
        const data = curr.data || 'Data';
        acc[data] = (acc[data] || 0) + (curr.totalPresentesAlunos || 0) + (curr.totalVisitantes || 0);
        return acc;
      }, {});

      let evolucaoArray = Object.keys(evolucaoMap).map(data => ({
        semana: data.split('-').reverse().slice(0, 2).join('/'),
        frequencia: evolucaoMap[data],
        rawDate: data
      }));
      evolucaoArray.sort((a, b) => a.rawDate.localeCompare(b.rawDate));
      setEvolucaoSemanasData(evolucaoArray);
    };

    const unsubAlunos = onSnapshot(collection(db, 'alunos'), (snapshot) => {
      listaAlunosGlobal = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      recalcularTudo();
    });

    const unsubClasses = onSnapshot(collection(db, 'classes'), (snapshot) => {
      listaClassesGlobal = snapshot.docs.map(doc => doc.data());
      recalcularTudo();
    });

    const unsubChamadas = onSnapshot(collection(db, 'chamadas'), (snapshot) => {
      listaChamadasGlobal = snapshot.docs.map(doc => doc.data());
      recalcularTudo();
    });

    return () => {
      unsubAlunos();
      unsubClasses();
      unsubChamadas();
    };
  }, []);

  return {
    totalAlunos,
    totalClasses,
    totalProfessores,
    totalPresentes,
    totalVisitantes,
    percentualPresenca,
    presencaAulaData,
    frequenciaClasseData,
    distribuicaoData,
    evolucaoSemanasData,
  };
}