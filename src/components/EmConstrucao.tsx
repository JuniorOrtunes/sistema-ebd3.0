import { Wrench, HardHat, ArrowLeft } from 'lucide-react';

interface EmConstrucaoProps {
  titulo: string;
  onVoltarParaDashboard?: () => void;
}

export function EmConstrucao({ titulo, onVoltarParaDashboard }: EmConstrucaoProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] px-4 text-center">
      {/* Ilustração / Ícone animado */}
      <div className="relative mb-6">
        <div className="w-24 h-24 bg-amber-100 dark:bg-amber-950/40 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-inner animate-bounce">
          <HardHat className="w-12 h-12" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md">
          <Wrench className="w-5 h-5 animate-spin" style={{ animationDuration: '4s' }} />
        </div>
      </div>

      {/* Badge */}
      <span className="px-3.5 py-1 text-xs font-bold tracking-wider text-amber-700 dark:text-amber-300 uppercase bg-amber-100 dark:bg-amber-900/40 rounded-full mb-3 border border-amber-200 dark:border-amber-800/50">
        Página em Construção
      </span>

      {/* Título */}
      <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 dark:text-gray-100 mb-2">
        {titulo}
      </h1>

      {/* Descrição acolhedora */}
      <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8 text-sm md:text-base leading-relaxed">
        Estamos desenvolvendo esta funcionalidade com todo o capricho para trazer ainda mais agilidade para a gestão da nossa EBD. Em breve estará disponível!
      </p>

      {/* Botão para retornar ao Dashboard */}
      {onVoltarParaDashboard && (
        <button
          onClick={onVoltarParaDashboard}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Início
        </button>
      )}
    </div>
  );
}