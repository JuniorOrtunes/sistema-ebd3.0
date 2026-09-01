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

    const atualizarMetricasDashboard = async (listaChamadas: any[]) => {
      if (listaChamadas.length > 0) {
        const datasUnicas = Array.from(new Set(listaChamadas.map((c: any) => c.data))).filter(Boolean) as string[];
        datasUnicas.sort().reverse();
        const ultimaData = datasUnicas[0];

        // Chamadas da última aula para somar presentes e visitantes locais
        const chamadasUltimaAula = listaChamadas.filter((cls: any) => cls.data === ultimaData);
        let sumPresentesUltima = 0;
        let sumVisitantesUltima = 0;

        chamadasUltimaAula.forEach((cls: any) => {
          sumPresentesUltima += cls.totalPresentesAlunos || 0;
          sumVisitantesUltima += cls.totalVisitantes || 0;
        });

        setTotalPresentes(sumPresentesUltima);
        setTotalVisitantes(sumVisitantesUltima);

        // Utilizando o serviço unificado para obter o percentual exato com o denominador global (222)
        const resultadoFrequencia = await calcularFrequenciaGeral(ultimaData);
        setPercentualPresenca(resultadoFrequencia.percentualFrequencia);
      } else {
        setTotalPresentes(0);
        setTotalVisitantes(0);
        setPercentualPresenca(0);
      }
    };

  const unsubAlunos = onSnapshot(collection(db, 'alunos'), (snapshot) => {
      const listaAlunos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      
      // Filtrando pelo campo correto 'situacao' (mesmo padrão do AlunosTable e Chamada)
      const alunosAtivos = listaAlunos.filter(aluno => {
        const situacaoStr = String(aluno.situacao || aluno.status || '').trim().toLowerCase();
        return situacaoStr !== 'inativo';
      });
      setTotalAlunos(alunosAtivos.length);

      const profsNosAlunos = listaAlunos.filter(a => a.eProfessor).length;
      setTotalProfessores(profsNosAlunos);

      const contagemClasses: Record<string, number> = {};
      alunosAtivos.forEach((aluno: any) => {
        const nomeClasse = aluno.classe || aluno.turma || 'Não definida';
        contagemClasses[nomeClasse] = (contagemClasses[nomeClasse] || 0) + 1;
      });
      // ... resto do código

      let barData = Object.keys(contagemClasses).map((nome, index) => ({
        name: nome,
        value: contagemClasses[nome],
        color: getTurmaColor(nome, index)
      }));

      barData.sort((a, b) => ordenarTurmas(a, b, 'name'));
      setDistribuicaoData(barData);
    });

    const unsubClasses = onSnapshot(collection(db, 'classes'), (snapshot) => {
      const listaClasses = snapshot.docs.map(doc => doc.data());
      const classesAtivasCount = listaClasses.filter(c => c.ativa !== false).length;
      setTotalClasses(classesAtivasCount);
    });

    const unsubChamadas = onSnapshot(collection(db, 'chamadas'), (snapshot) => {
      listaChamadasGlobal = snapshot.docs.map(doc => doc.data());

      atualizarMetricasDashboard(listaChamadasGlobal);

      let chartData = listaChamadasGlobal.map((cls: any) => {
        const presentes = cls.totalPresentesAlunos || 0;
        const matriculados = cls.totalMatriculados || 0;
        const visitantes = cls.totalVisitantes || 0;
        const taxa = matriculados > 0 ? Math.round((presentes / matriculados) * 100) : 0;

        return {
          aula: cls.classe || cls.turma || 'Classe',
          presenca: taxa,
          total: presentes + visitantes
        };
      });
      chartData.sort((a, b) => ordenarTurmas(a, b, 'aula'));
      setPresencaAulaData(chartData);

      const freqClasseMap = listaChamadasGlobal.reduce((acc: any, curr: any) => {
        const nomeClasse = curr.classe || curr.turma || 'Classe Geral';
        const totalAlunosPresentes = (curr.totalPresentesAlunos || 0) + (curr.totalVisitantes || 0);
        acc[nomeClasse] = (acc[nomeClasse] || 0) + totalAlunosPresentes;
        return acc;
      }, {});

      let freqClasseArray = Object.keys(freqClasseMap).map(classe => ({
        classe: classe,
        frequencia: freqClasseMap[classe]
      }));
      freqClasseArray.sort((a, b) => ordenarTurmas(a, b, 'classe'));
      setFrequenciaClasseData(freqClasseArray);

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