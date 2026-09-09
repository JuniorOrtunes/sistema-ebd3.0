export interface Aniversariante {
  id: string;
  nome: string;
  classe: string;
  dataNascimento?: string; // Formato 'DD/MM/YYYY' ou 'DD/MM'
  dataCasamento?: string;
}

export const extrairDiaMes = (dataStr?: string) => {
  if (!dataStr || typeof dataStr !== 'string') return { dia: 0, mes: 0, ano: null };
  
  let dia = 0;
  let mes = 0;
  let ano: number | null = null;

  if (dataStr.includes('-') && dataStr.split('-').length >= 3) {
    const partes = dataStr.split('-');
    ano = parseInt(partes[0], 10);
    mes = parseInt(partes[1], 10);
    dia = parseInt(partes[2], 10);
  } else if (dataStr.includes('/')) {
    const partes = dataStr.split('/');
    if (partes.length >= 2) {
      dia = parseInt(partes[0], 10);
      mes = parseInt(partes[1], 10);
    }
    if (partes.length >= 3) {
      ano = parseInt(partes[2], 10);
    }
  }

  return { 
    dia: isNaN(dia) ? 0 : dia, 
    mes: isNaN(mes) ? 0 : mes,
    ano: isNaN(ano as number) ? null : ano
  };
};

// Formata para exibição estrito 'dd/mm' (removendo o ano se houver)
export const formatarDataAniversario = (dataStr?: string): string => {
  const { dia, mes } = extrairDiaMes(dataStr);
  if (!dia || !mes) return dataStr || '-';
  const dStr = String(dia).padStart(2, '0');
  const mStr = String(mes).padStart(2, '0');
  return `${dStr}/${mStr}`;
};

// Calcula a idade com base na data de nascimento completa
export const calcularIdade = (dataStr?: string): string | number => {
  const { dia, mes, ano } = extrairDiaMes(dataStr);
  if (!ano || !dia || !mes) return '-';

  const hoje = new Date();
  let idade = hoje.getFullYear() - ano;
  const mesAtual = hoje.getMonth() + 1;
  const diaAtual = hoje.getDate();

  if (mesAtual < mes || (mesAtual === mes && diaAtual < dia)) {
    idade--;
  }

  return idade >= 0 ? idade : '-';
};

export const filtrarESortAniversariantes = (
  dados: Aniversariante[],
  tipoRelatorio: 'nascimento' | 'casamento',
  classeSelecionada: string,
  mesSelecionado: string,
  verAnoInteiro: boolean
) => {
  return dados.filter((item) => {
    // Filtro por Classe
    if (classeSelecionada !== 'todas' && item.classe?.trim() !== classeSelecionada.trim()) {
      return false;
    }

    const dataAlvo = tipoRelatorio === 'nascimento' ? item.dataNascimento : item.dataCasamento;
    if (!dataAlvo) return false;

    const { mes } = extrairDiaMes(dataAlvo);

    // Filtro por Mês (se não for ano inteiro)
    if (!verAnoInteiro) {
      const mesNum = parseInt(mesSelecionado, 10);
      if (mes !== mesNum) return false;
    }

    return true;
  }).sort((a, b) => {
    const dataA = tipoRelatorio === 'nascimento' ? a.dataNascimento : a.dataCasamento;
    const dataB = tipoRelatorio === 'nascimento' ? b.dataNascimento : b.dataCasamento;
    
    const dmA = extrairDiaMes(dataA);
    const dmB = extrairDiaMes(dataB);

    if (verAnoInteiro) {
      // 1º Critério: Mês
      if (dmA.mes !== dmB.mes) {
        return dmA.mes - dmB.mes;
      }
      // 2º Critério: Dia
      if (dmA.dia !== dmB.dia) {
        return dmA.dia - dmB.dia;
      }
    } else {
      // Apenas por Dia se for um mês específico
      if (dmA.dia !== dmB.dia) {
        return dmA.dia - dmB.dia;
      }
    }

    // 3º Critério: Nome (ordem alfabética caso o mês e o dia sejam iguais)
    const nomeA = (a.nome || '').toLowerCase();
    const nomeB = (b.nome || '').toLowerCase();
    return nomeA.localeCompare(nomeB, 'pt-BR');
  });
};

export const obterClassesOrdenadas = (lista: Aniversariante[]): string[] => {
  const classesUnicas = Array.from(
    new Set(lista.map((item) => item.classe?.trim()).filter(Boolean))
  ) as string[];

  return classesUnicas.sort((a, b) => a.localeCompare(b, 'pt-BR', { numeric: true }));
};

export const NOMES_MESES: Record<number, string> = {
  1: 'JANEIRO',
  2: 'FEVEREIRO',
  3: 'MARÇO',
  4: 'ABRIL',
  5: 'MAIO',
  6: 'JUNHO',
  7: 'JULHO',
  8: 'AGOSTO',
  9: 'SETEMBRO',
  10: 'OUTUBRO',
  11: 'NOVEMBRO',
  12: 'DEZEMBRO'
};