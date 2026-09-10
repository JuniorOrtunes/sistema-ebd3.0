export interface Classe {
  id: string;
  nome: string;
  [key: string]: any;
}

export interface RegistroEncerramento {
  id: string;
  data?: any;
  classeId?: string;
  nomeClasse?: string;
  presentes?: number;
  matriculados?: number;
  dataNormalizada?: string;
  [key: string]: any;
}

export const CORES_CLASSES = [
  { bg: 'bg-indigo-600', text: 'text-indigo-600' },
  { bg: 'bg-emerald-600', text: 'text-emerald-600' },
  { bg: 'bg-amber-500', text: 'text-amber-500' },
  { bg: 'bg-rose-600', text: 'text-rose-600' },
  { bg: 'bg-blue-600', text: 'text-blue-600' },
  { bg: 'bg-orange-600', text: 'text-orange-600' },
  { bg: 'bg-cyan-600', text: 'text-cyan-600' },
  { bg: 'bg-purple-600', text: 'text-purple-600' },
  { bg: 'bg-slate-900', text: 'text-slate-900' },
];