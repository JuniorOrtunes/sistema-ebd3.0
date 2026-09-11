// Adições para o Módulo de Hinos e Escala Semestral (Issue #29)

export type HinarioOrigem = 'Cantor Cristão' | 'HCC' | 'Avulso';

export interface Hino {
  id?: string;
  numero: number;
  titulo: string;
  hinario: HinarioOrigem;
  createdAt?: any;
}

export interface EscalaSemestralItem {
  id?: string;
  dataDomingo: string; // Formato ISO 'YYYY-MM-DD' ou 'DD/MM/YYYY' padronizado
  hinoId: string;      // Referência ao ID do Hino cadastrado
  updatedAt?: any;
}

// Extensão opcional para o tipo de Fechamento/Encerramento existente
export interface FechamentoEBD {
  // ... (propriedades existentes da aula)
  hinoRealizadoId?: string; // Hino efetivamente cantado no dia (permite auditoria/substituição)
}