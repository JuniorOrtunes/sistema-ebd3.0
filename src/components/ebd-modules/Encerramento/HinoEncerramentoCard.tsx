import React, { useState, useEffect } from 'react';
import { listarEscalaSemestral, listarHinos } from '../Hinos/hinosService';
import type { Hino, EscalaSemestralItem } from '../Hinos/types';

interface HinoEncerramentoCardProps {
  dataSelecionada: string; // Formato esperado 'YYYY-MM-DD'
}

export const HinoEncerramentoCard: React.FC<HinoEncerramentoCardProps> = ({ dataSelecionada }) => {
  const [hinoDoDia, setHinoDoDia] = useState<Hino | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const buscarHinoDoDomingo = async () => {
      if (!dataSelecionada) {
        setHinoDoDia(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [escala, hinos] = await Promise.all([
          listarEscalaSemestral(),
          listarHinos()
        ]);

        // Encontra o item na escala correspondente à data selecionada
        const itemEscala = escala.find((e: EscalaSemestralItem) => e.dataDomingo === dataSelecionada);

        if (itemEscala) {
          const hinoEncontrado = hinos.find((h: Hino) => h.id === itemEscala.hinoId);
          setHinoDoDia(hinoEncontrado || null);
        } else {
          setHinoDoDia(null);
        }
      } catch (err) {
        console.error('Erro ao buscar hino para a data de encerramento:', err);
        setHinoDoDia(null);
      } finally {
        setLoading(false);
      }
    };

    buscarHinoDoDomingo();
  }, [dataSelecionada]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm text-sm text-slate-500 flex items-center justify-center">
        Carregando hino escalado...
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-blue-600 text-white rounded-xl shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </div>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">Hino Oficial do Domingo</span>
          {hinoDoDia ? (
            <h3 className="text-lg font-bold text-slate-800">
              {hinoDoDia.numero} - {hinoDoDia.titulo} <span className="text-xs font-normal text-slate-600">({hinoDoDia.hinario})</span>
            </h3>
          ) : (
            <p className="text-sm text-slate-500 italic">Nenhum hino escalado para esta data.</p>
          )}
        </div>
      </div>
      <div className="text-xs text-slate-500 bg-white/80 px-3 py-1.5 rounded-lg border border-blue-100">
        Escala Semestral EBD
      </div>
    </div>
  );
};