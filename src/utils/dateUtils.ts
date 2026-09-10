// src/utils/dateUtils.ts
const NOMES_MESES: Record<string, string> = {
  '01': 'Janeiro', '02': 'Fevereiro', '03': 'Março', '04': 'Abril',
  '05': 'Maio', '06': 'Junho', '07': 'Julho', '08': 'Agosto',
  '09': 'Setembro', '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro',
};

export const extrairDataStr = (val: any): string => {
  if (!val) return '';
  if (typeof val === 'string') return val.split('T')[0];
  if (typeof val.toDate === 'function') {
    const d = val.toDate();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  if (val.seconds) {
    const d = new Date(val.seconds * 1000);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  return String(val);
};

export const formatarDataBR = (dataStr: string): string => {
  if (!dataStr) return '';
  const limpa = extrairDataStr(dataStr);
  if (/^\d{4}-\d{2}-\d{2}$/.test(limpa)) {
    const [ano, mes, dia] = limpa.split('-');
    return `${dia}/${mes}/${ano}`;
  }
  return limpa;
};

export const formatarMesBR = (mesCodigo: string): string => {
  if (!mesCodigo || !/^\d{4}-\d{2}$/.test(mesCodigo)) return mesCodigo;
  const [ano, mes] = mesCodigo.split('-');
  return `${NOMES_MESES[mes] || mes}/${ano}`;
};