import type { ClasseItem } from '../../../hooks/useEncerramento';

interface BoletimTableProps {
  classesEBD: ClasseItem[];
  totalGeralPresenca: number;
  loading: boolean;
  percentualFrequencia: number;
}

export function BoletimTable({
  classesEBD,
  totalGeralPresenca,
  loading,
  percentualFrequencia,
}: BoletimTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
      <div className="flex justify-between items-center border-b border-slate-100 pb-6">
        <h2 className="text-lg font-bold text-slate-900">Boletim</h2>
        <div className="text-right bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Total Presentes</span>
          <span className="text-2xl font-black text-slate-900">{totalGeralPresenca}</span>
        </div>
      </div>

      {loading ? (
        <p className="text-center py-8 text-slate-400">Carregando em tempo real...</p>
      ) : (
        <div className="space-y-6">
          <div>
            <div className="hidden md:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 text-[11px] uppercase border-b border-slate-100">
                    <th className="pb-3">Classe</th>
                    <th className="pb-3 text-center">Matr.</th>
                    <th className="pb-3 text-center">Pres.</th>
                    <th className="pb-3 text-center">Vis.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {classesEBD.map((c) => (
                    <tr key={c.id}>
                      <td className="py-3 font-semibold">{c.nome}</td>
                      <td className="text-center">{c.matriculados}</td>
                      <td className="text-center">{c.presentes}</td>
                      <td className="text-center">{c.visitantes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-3">
              {classesEBD.map((c) => (
                <div key={c.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-800">{c.nome}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Matr: {c.matriculados}</p>
                  </div>
                  <div className="flex gap-4 text-center">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase">Pres.</p>
                      <p className="font-bold text-slate-800">{c.presentes}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase">Vis.</p>
                      <p className="font-bold text-slate-800">{c.visitantes}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-slate-500 pt-4 border-t border-slate-100">
        Frequência: {percentualFrequencia}%
      </p>
    </div>
  );
}