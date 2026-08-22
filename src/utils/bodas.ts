// src/utils/bodas.ts

const bodasMap: Record<number, string> = {
  1: 'Bodas de Papel',
  2: 'Bodas de Algodão',
  3: 'Bodas de Trigo / Couro',
  4: 'Bodas de Flores / Frutas',
  5: 'Bodas de Madeira / Ferro',
  6: 'Bodas de Açúcar / Perfume',
  7: 'Bodas de Latão / Lã',
  8: 'Bodas de Barro / Papoula',
  9: 'Bodas de Cerâmica / Vime',
  10: 'Bodas de Estanho / Zinco',
  11: 'Bodas de Aço',
  12: 'Bodas de Ônix',
  13: 'Bodas de Renda / Linho',
  14: 'Bodas de Marfim',
  15: 'Bodas de Cristal',
  20: 'Bodas de Porcelana',
  25: 'Bodas de Prata',
  30: 'Bodas de Pérola',
  35: 'Bodas de Coral',
  40: 'Bodas de RubI',
  45: 'Bodas de Safira',
  50: 'Bodas de Ouro',
  55: 'Bodas de Esmeralda',
  60: 'Bodas de Diamante',
  65: 'Bodas de Ferro',
  70: 'Bodas de Vinho',
  75: 'Bodas de Brilhante',
  80: 'Bodas de Carvalho'
};

export function obterNomeBodas(anos: number): string {
  if (anos <= 0) return 'Casamento';
  return bodasMap[anos] || `${anos} anos de casados`;
}