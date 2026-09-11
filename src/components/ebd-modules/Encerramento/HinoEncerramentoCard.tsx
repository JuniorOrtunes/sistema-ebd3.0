import React, { useState, useEffect, useRef } from 'react';
import { listarEscalaSemestral, listarHinos, salvarItemEscala } from '../Hinos/hinosService';
import type { Hino, EscalaSemestralItem } from '../Hinos/types';

interface HinoEncerramentoCardProps {
  dataSelecionada: string; // Formato 'YYYY-MM-DD'
}

export const HinoEncerramentoCard: React.FC<HinoEncerramentoCardProps> = ({ dataSelecionada }) => {
  const [hinosDisponiveis, setHinosDisponiveis] = useState<Hino[]>([]);
  const [hinoDoDia, setHinoDoDia] = useState<Hino | null>(null);
  const [itemEscalaId, setItemEscalaId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [editando, setEditando] = useState<boolean>(false);
  
  // Estados para o campo de busca interativo
  const [termoBusca, setTermoBusca] = useState<string>('');
  const [hinoSelecionadoId, setHinoSelecionadoId] = useState<string>('');
  const [hinoSelecionadoLabel, setHinoSelecionadoLabel] = useState<string>('');
  const [mostrarDropdown, setMostrarDropdown] = useState<boolean>(false);
  const [salvando, setSalvando] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const carregarDadosDoHino = async () => {
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

      setHinosDisponiveis(hinos);

      const itemEscala = escala.find((e: EscalaSemestralItem) => e.dataDomingo === dataSelecionada);

      if (itemEscala) {
        setItemEscalaId(itemEscala.id);
        const hinoEncontrado = hinos.find((h: Hino) => h.id === itemEscala.hinoId);
        setHinoDoDia(hinoEncontrado || null);
        if (hinoEncontrado) {
          setHinoSelecionadoId(hinoEncontrado.id || '');
          setHinoSelecionadoLabel(`${hinoEncontrado.numero} - ${hinoEncontrado.titulo} (${hinoEncontrado.hinario})`);
        }
      } else {
        setItemEscalaId(undefined);
        setHinoDoDia(null);
        setHinoSelecionadoId('');
        setHinoSelecionadoLabel('');
      }
    } catch (err) {
      console.error('Erro ao buscar hino para a data de encerramento:', err);
      setHinoDoDia(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDadosDoHino();
  }, [dataSelecionada]);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMostrarDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtrar hinos pelo número ou pelo nome
  const hinosFiltrados = hinosDisponiveis.filter((h) => {
    const termo = termoBusca.toLowerCase();
    const numeroStr = String(h.numero).toLowerCase();
    const tituloStr = h.titulo.toLowerCase();
    const hinarioStr = h.hinario.toLowerCase();
    return numeroStr.includes(termo) || tituloStr.includes(termo) || hinarioStr.includes(termo);
  });

  const handleSalvarHinoDia = async () => {
    if (!hinoSelecionadoId) {
      alert('Selecione ou busque um hino válido.');
      return;
    }

    try {
      setSalvando(true);
      await salvarItemEscala({
        ...(itemEscalaId ? { id: itemEscalaId } : {}),
        dataDomingo: dataSelecionada,
        hinoId: hinoSelecionadoId
      } as EscalaSemestralItem);
      
      setEditando(false);
      await carregarDadosDoHino();
    } catch (err) {
      console.error('Erro ao salvar hino do dia:', err);
      alert('Erro ao atualizar o hino do encerramento.');
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm text-sm text-slate-500 flex items-center justify-center">
        Carregando hino escalado...
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-600 text-white rounded-xl shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">Hino Oficial do Domingo</span>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${hinoDoDia ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {hinoDoDia ? 'Validado na Escala' : 'Pendente / Avulso'}
              </span>
            </div>

            {!editando ? (
              <h3 className="text-lg font-bold text-slate-800 mt-0.5">
                {hinoDoDia ? (
                  <>{hinoDoDia.numero} - {hinoDoDia.titulo} <span className="text-xs font-normal text-slate-600">({hinoDoDia.hinario})</span></>
                ) : (
                  <span className="text-slate-500 italic">Nenhum hino escalado para esta data.</span>
                )}
              </h3>
            ) : (
              <div className="mt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 relative" ref={dropdownRef}>
                {/* Campo de Busca Unificada */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Digite o número ou nome do hino..."
                    value={termoBusca}
                    onChange={(e) => {
                      setTermoBusca(e.target.value);
                      setMostrarDropdown(true);
                    }}
                    onFocus={() => setMostrarDropdown(true)}
                    className="w-72 px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  />

                  {/* Lista Suspensa (Dropdown de Resultados) */}
                  {mostrarDropdown && (
                    <div className="absolute z-50 left-0 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {hinosFiltrados.length > 0 ? (
                        hinosFiltrados.map((h) => (
                          <div
                            key={h.id}
                            onClick={() => {
                              setHinoSelecionadoId(h.id || '');
                              setHinoSelecionadoLabel(`${h.numero} - ${h.titulo} (${h.hinario})`);
                              setTermoBusca(`${h.numero} - ${h.titulo}`);
                              setMostrarDropdown(false);
                            }}
                            className="px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer border-b border-slate-100 last:border-none flex justify-between items-center"
                          >
                            <span className="font-medium text-slate-800">
                              <strong className="text-blue-600">#{h.numero}</strong> - {h.titulo}
                            </span>
                            <span className="text-slate-400 text-[10px]">{h.hinario}</span>
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-3 text-xs text-slate-500 text-center">
                          Nenhum hino encontrado.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {hinoSelecionadoLabel && (
                  <span className="text-xs text-slate-600 italic hidden lg:inline">
                    Selecionado: {hinoSelecionadoLabel}
                  </span>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSalvarHinoDia}
                    disabled={salvando}
                    className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 shadow-sm"
                  >
                    {salvando ? 'Salvando...' : 'Salvar'}
                  </button>
                  <button
                    onClick={() => {
                      setEditando(false);
                      setTermoBusca('');
                      setMostrarDropdown(false);
                    }}
                    className="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-300 transition"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          {!editando && (
            <button
              onClick={() => {
                setEditando(true);
                setTermoBusca('');
                setMostrarDropdown(true);
              }}
              className="px-3 py-1.5 bg-white border border-blue-200 text-blue-700 text-xs font-semibold rounded-lg hover:bg-blue-50 transition shadow-sm"
            >
              {hinoDoDia ? 'Alterar Hino' : 'Definir Hino'}
            </button>
          )}
          <span className="text-xs text-slate-500 bg-white/80 px-3 py-1.5 rounded-lg border border-blue-100 hidden md:inline-block">
            Escala Semestral EBD
          </span>
        </div>
      </div>
    </div>
  );
};