export interface Aluno {
  id: string;
  nome: string;
  classe: string;
  idade?: number;
  situacao: 'Ativo' | 'Inativo' | 'Visitante';
  batizado: boolean;
  biblia: boolean;
  revista: boolean;
  oferta: number;
  // Campos adicionados para o formulário completo com máscaras e endereço
  telefone?: string;
  nascimento?: string;
  casamento?: string;
  cep?: string;
  rua?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  eProfessor?: boolean;
  classeLeciona?: string;
}

export interface ClasseEBD {
  id: string;
  nome: string;
  professor: string;
  sala: string;
  faixaEtaria: string;
}

export interface RegistroAula {
  id: string;
  data: string;
  trimestre: string;
  licao: number;
  totalPresentes: number;
  totalBiblia: number;
  totalRevista: number;
  totalVisitantes: number;
  ofertaTotal: number;
  observacoes?: string;
}

// Zerado para testes
export const CLASSES_INICIAIS: ClasseEBD[] = [];

// Zerado para testes
export const ALUNOS_INICIAIS: Aluno[] = [];

export interface Superintendente {
  id: string;
  nome: string;
  usuario: string;
  senha?: string;
  dataCadastro: string;
  isVoce?: boolean;
  ativo?: boolean;
}