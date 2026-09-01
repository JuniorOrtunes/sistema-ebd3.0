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
  // 1. Buscar total global de alunos (Denominador fixo)
  const alunosRef = collection(db, 'alunos');
  const alunosSnap = await getDocs(alunosRef);
  
  // Diagnóstico para ver o que realmente está gravado no Firestore
  const statusContagem: Record<string, number> = {};
  
  const alunosAtivos = alunosSnap.docs
    .map(doc => ({ id: doc.id, ...doc.data() } as any))
    .filter(aluno => {
      const s = String(aluno.status || aluno.situacao || aluno.estado || 'SEM_STATUS').trim();
      statusContagem[s] = (statusContagem[s] || 0) + 1;

      const statusStr = String(aluno.status || '').trim().toLowerCase();
      const situacaoStr = String(aluno.situacao || '').trim().toLowerCase();
      
      const isInativo = 
        statusStr === 'inativo' || 
        statusStr === 'desligado' || 
        situacaoStr === 'inativo' || 
        situacaoStr === 'desligado' || 
        aluno.ativo === false;
      
      return !isInativo;
    });

  console.log('[DIAGNOSTICO_STATUS_ALUNOS]', statusContagem);
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
    
    if (Array.isArray(dados.alunosPresentesIds)) {
      dados.alunosPresentesIds.forEach((id: string) => presentesIdsSet.add(id));
    }
  });

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