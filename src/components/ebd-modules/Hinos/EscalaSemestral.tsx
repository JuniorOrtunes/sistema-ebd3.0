import React, { useState, useEffect, useRef } from 'react';
import { listarHinos, listarEscalaSemestral, salvarItemEscala, excluirItemEscala } from './hinosService';
import type { Hino, EscalaSemestralItem } from './types';

export const EscalaSemestral: React.FC = () => {
  const [hinos, setHinos] = useState<Hino[]>([]);
  const [escala, setEscala] = useState<EscalaSemestralItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Estados do Formulário
  const [idEmEdicao, setIdEmEdicao] = useState<string | null>(null);
  const [dataDomingo, setDataDomingo] = useState<string>('');
  const [hinoId, setHinoId] = useState<string>('');
  const [salvando, setSalvando] = useState<boolean>(false);

  // Estados para o Autocomplete de Hinos
  const [termoBuscaHino, setTermoBuscaHino] = useState<string>('');
  const [mostrarDropdownHinos, setMostrarDropdownHinos] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [listaHinos, listaEscala] = await Promise.all([
        listarHinos(),
        listarEscalaSemestral()
      ]);
      setHinos(listaHinos);
      setEscala(listaEscala.sort((a, b) => a.dataDomingo.localeCompare(b.dataDomingo)));
    } catch (err) {
      console.error('Erro ao carregar dados da escala semestral:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMostrarDropdownHinos(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sincronizar termo de busca visual quando um hino já estiver selecionado
  useEffect(() => {
    if (hinoId) {
      const hinoSelecionado = hinos.find(h => h.id === hinoId);
      if (hinoSelecionado) {
        setTermoBuscaHino(`${hinoSelecionado.numero} - ${hinoSelecionado.titulo} (${hinoSelecionado.hinario})`);
      }
    } else {
      setTermoBuscaHino('');
    }
  }, [hinoId, hinos]);

  const hinosFiltrados = hinos.filter((h) => {
    const termo = termoBuscaHino.toLowerCase();
    const numeroStr = String(h.numero).toLowerCase();
    const tituloStr = h.titulo.toLowerCase();
    const hinarioStr = h.hinario.toLowerCase();
    return numeroStr.includes(termo) || tituloStr.includes(termo) || hinarioStr.includes(termo);
  });

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataDomingo || !hinoId) {
      alert('Preencha a data e selecione um hino.');
      return;
    }

    try {
      setSalvando(true);
      await salvarItemEscala({
        ...(idEmEdicao ? { id: idEmEdicao } : {}),
        dataDomingo,
        hinoId
      } as EscalaSemestralItem);

      setDataDomingo('');
      setHinoId('');
      setTermoBuscaHino('');
      setIdEmEdicao(null);
      await carregarDados();
    } catch (err) {
      console.error('Erro ao salvar escala:', err);
      alert('Erro ao salvar o item na escala.');
    } finally {
      setSalvando(false);
    }
  };

 const handleEditar = (item: EscalaSemestralItem) => {
    if (!item.id) return;
    setIdEmEdicao(item.id);
    setDataDomingo(item.dataDomingo);
    setHinoId(item.hinoId ?? '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExcluir = async (id?: string) => {
    if (!id) return;
    if (confirm('Deseja realmente remover este hino da escala semestral?')) {
      try {
        await excluirItemEscala(id);
        await carregarDados();
      } catch (err) {
        console.error('Erro ao excluir item da escala:', err);
        alert('Erro ao excluir item.');
      }
    }
  };

  const cancelarEdicao = () => {
    setIdEmEdicao(null);
    setDataDomingo('');
    setHinoId('');
    setTermoBuscaHino('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
        <h2 className="text-xl font-bold text-slate-800">Escala Semestral de Hinos</h2>
        <p className="text-sm text-slate-500 mt-1">
          {idEmEdicao ? 'Editando item da escala semestral' : 'Vincule os hinos oficiais aos domingos do semestre letivo da EBD'}
        </p>

        <form onSubmit={handleSalvar} className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Data do Domingo
            </label>
            <input
              type="date"
              value={dataDomingo}
              onChange={(e) => setDataDomingo(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Campo de Autocomplete de Hinos substituindo o select estático */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Buscar e Selecionar Hino
            </label>
            <input
              type="text"
              value={termoBuscaHino}
              onChange={(e) => {
                setTermoBuscaHino(e.target.value);
                setMostrarDropdownHinos(true);
                if (!e.target.value) setHinoId('');
              }}
              onFocus={() => setMostrarDropdownHinos(true)}
              placeholder="Digite o número ou título..."
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {mostrarDropdownHinos && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                {hinosFiltrados.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-slate-500 italic">Nenhum hino encontrado.</div>
                ) : (
                  hinosFiltrados.map((h) => (
                    <div
                      key={h.id}
                  onClick={() => {
                       if (!h.id) return;

                      setHinoId(h.id);
                      setTermoBuscaHino(`${h.numero} - ${h.titulo} (${h.hinario})`);
                      setMostrarDropdownHinos(false);
                  }}
                      className="px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition border-b border-slate-50 last:border-none"
                    >
                      <span className="font-bold text-slate-900">#{h.numero}</span> - {h.titulo} <span className="text-xs text-slate-400">({h.hinario})</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={salvando}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition shadow-sm disabled:opacity-50"
            >
              {salvando ? 'Salvando...' : idEmEdicao ? 'Atualizar Escala' : '+ Escalar Hino'}
            </button>
            {idEmEdicao && (
              <button
                type="button"
                onClick={cancelarEdicao}
                className="px-4 py-2.5 bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-300 transition"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Domingos Escalados</h3>
          <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full font-medium">
            {escala.length} domingos cadastrados
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Carregando escala...</div>
        ) : escala.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500 italic">Nenhum hino escalado até o momento.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-6">Data do Domingo</th>
                  <th className="py-3 px-6">Número</th>
                  <th className="py-3 px-6">Título do Hino</th>
                  <th className="py-3 px-6">Hinário</th>
                  <th className="py-3 px-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {escala.map((item) => {
                  const hinoEncontrado = hinos.find((h) => h.id === item.hinoId);
                  const partesData = item.dataDomingo ? item.dataDomingo.split('-') : [];
                  const [ano, mes, dia] = partesData;
                  const dataFormatada = ano && mes && dia ? `${dia}/${mes}/${ano}` : item.dataDomingo;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3.5 px-6 font-semibold text-slate-800">{dataFormatada}</td>
                      <td className="py-3.5 px-6 text-slate-600">
                        {hinoEncontrado ? hinoEncontrado.numero : <span className="text-amber-600 italic">Removido</span>}
                      </td>
                      <td className="py-3.5 px-6 font-medium text-slate-900">
                        {hinoEncontrado ? hinoEncontrado.titulo : <span className="text-amber-600 italic">Hino não encontrado no repertório</span>}
                      </td>
                      <td className="py-3.5 px-6 text-slate-500">
                        {hinoEncontrado ? hinoEncontrado.hinario : '-'}
                      </td>
                      <td className="py-3.5 px-6 text-right space-x-3">
                        <button
                          onClick={() => handleEditar(item)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 transition"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          Editar
                        </button>
                        <button
                          onClick={() => handleExcluir(item.id)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 hover:text-rose-800 transition"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2.002 2.002 0 0116.138 21H7.862a2.002 2.002 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Excluir
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};