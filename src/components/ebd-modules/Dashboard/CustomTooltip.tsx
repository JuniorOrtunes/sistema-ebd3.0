export const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 text-white px-3.5 py-2.5 rounded-xl shadow-xl text-xs backdrop-blur-md border border-slate-700/50 space-y-1">
        {label && <p className="font-semibold text-slate-300 border-b border-slate-700 pb-1 mb-1">{label}</p>}
        {payload.map((item: any, index: number) => (
          <div key={`tooltip-${index}`} className="flex items-center justify-between gap-4">
            <span className="text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color || item.fill }} />
              {item.name}:
            </span>
            <span className="font-bold text-white">
              {item.value}{item.dataKey === 'presenca' ? '%' : ''}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};