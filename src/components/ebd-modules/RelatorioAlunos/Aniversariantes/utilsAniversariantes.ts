// Interface para o Aniversariante
export interface Aniversariante {
  id: string;
  nome: string;
  classe: string;
  dataNascimento?: string; // Formato 'DD/MM/YYYY' ou 'DD/MM'
  dataCasamento?: string;
}

// Função auxiliar segura para extrair dia e mês da string de data
export const extrairDiaMes = (dataStr?: string) => {
  if (!dataStr || typeof dataStr !== 'string') return { dia: 0, mes: 0 };
  const partes = dataStr.split('/');
  if (partes.length < 2) return { dia: 0, mes: 0 };
  const dia = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10);
  return { dia: isNaN(dia) ? 0 : dia, mes: isNaN(mes) ? 0 : mes };
};

// Função de ordenação e filtragem reutilizável
export const filtrarESortAniversariantes = (
  dados: Aniversariante[],
  tipoRelatorio: 'nascimento' | 'casamento',
  classeSelecionada: string,
  mesSelecionado: string,
  verAnoInteiro: boolean
) => {
  return dados.filter((item) => {
    // Filtro por Classe
    if (classeSelecionada !== 'todas' && item.classe !== classeSelecionada) {
      return false;
    }

    const dataAlvo = tipoRelatorio === 'nascimento' ? item.dataNascimento : item.dataCasamento;
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
      // Critério 1: Mês | Critério 2: Dia
      if (dmA.mes !== dmB.mes) {
        return dmA.mes - dmB.mes;
      }
      return dmA.dia - dmB.dia;
    } else {
      // Critério único por Mês específico: Ordena apenas pelo Dia
      return dmA.dia - dmB.dia;
    }
  });
};

// Extrair classes ordenadas alfabeticamente/numericamente (removendo vazias)
export const obterClassesOrdenadas = (lista: Aniversariante[]): string[] => {
  const classesUnicas = Array.from(
    new Set(lista.map((item) => item.classe?.trim()).filter(Boolean))
  ) as string[];

  return classesUnicas.sort((a, b) => a.localeCompare(b, 'pt-BR', { numeric: true }));
};