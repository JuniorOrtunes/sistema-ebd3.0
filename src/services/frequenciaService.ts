import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export interface DadosFrequenciaGeral {
  data: string;
  totalGeralMatriculados: number;
  totalPresentesAlunos: number;
  percentualFrequencia: number;
  classesConsultadas: string[];
}

export async function calcularFrequenciaGeral(dataSelecionada: string): Promise<DadosFrequenciaGeral> {
  // 1. Buscar total global de alunos ativos (Denominador fixo)
  const alunosRef = collection(db, 'alunos');
  const alunosSnap = await getDocs(alunosRef);
  const alunosAtivos = alunosSnap.docs
    .map(doc => ({ id: doc.id, ...doc.data() } as any))
    .filter(aluno => aluno.status !== 'Inativo');
  
  const totalGeralMatriculados = alunosAtivos.length;

  // 2. Buscar chamadas da data específica (Numerador com unicidade por ID)
  const chamadasQuery = query(collection(db, 'chamadas'), where('data', '==', dataSelecionada));
  const chamadasSnap = await getDocs(chamadasQuery);

  const presentesIdsSet = new Set<string>();
  const classesConsultadasSet = new Set<string>();

  chamadasSnap.docs.forEach(docSnap => {
    const dados = docSnap.data();
    if (dados.classe) {
      classesConsultadasSet.add(dados.classe);
    }
    
    // Se houver lista de IDs de alunos presentes na chamada
    if (Array.isArray(dados.alunosPresentesIds)) {
      dados.alunosPresentesIds.forEach((id: string) => presentesIdsSet.add(id));
    } else if (typeof dados.totalPresentesAlunos === 'number') {
      // Fallback caso a estrutura armazene apenas o número total na classe
      // (Nota: Idealmente usar IDs únicos para evitar duplicidade, mas respeita o acumulado se necessário)
    }
  });

  // Se a estrutura salva o total diretamente por classe nas chamadas:
  let totalPresentesAlunos = 0;
  chamadasSnap.docs.forEach(docSnap => {
    const dados = docSnap.data();
    if (typeof dados.totalPresentesAlunos === 'number') {
      totalPresentesAlunos += dados.totalPresentesAlunos;
    }
  });

  const percentualNum = totalGeralMatriculados > 0 ? (totalPresentesAlunos / totalGeralMatriculados) * 100 : 0;
  const percentualFrequencia = Number(percentualNum.toFixed(2));

  const resultado: DadosFrequenciaGeral = {
    data: dataSelecionada,
    totalGeralMatriculados,
    totalPresentesAlunos,
    percentualFrequencia,
    classesConsultadas: Array.from(classesConsultadasSet)
  };

  console.log('[ATENDIMENTO_FREQUENCIA]', {
    'Data selecionada': resultado.data,
    'Total geral matriculados': resultado.totalGeralMatriculados,
    'Total presentes': resultado.totalPresentesAlunos,
    'Classes consultadas': resultado.classesConsultadas.join(', '),
    'Registros de presença encontrados': chamadasSnap.size,
    'Percentual calculado': resultado.percentualFrequencia
  });

  return resultado;
}