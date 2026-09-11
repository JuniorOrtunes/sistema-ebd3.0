import React, { useState, useEffect } from 'react';
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
    setIdEmEdicao(item.id || null);
    setDataDomingo(item.dataDomingo);
    setHinoId(item.hinoId);
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
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Seção */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
        <h2 className="text-xl font-bold text-slate-800">Escala Semestral de Hinos</h2>
        <p className="text-sm text-slate-500 mt-1">
          {idEmEdicao ? 'Editando item da escala semestral' : 'Vincule os hinos oficiais aos domingos do semestre letivo da EBD'}
        </p>

        {/* Formulário de Cadastro / Edição */}
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

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Selecionar Hino
            </label>
            <select
              value={hinoId}
              onChange={(e) => setHinoId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">-- Escolha um hino --</option>
              {hinos.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.numero} - {h.titulo} ({h.hinario})
                </option>
              ))}
            </select>
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

      {/* Tabela de Escala */}
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
                  const [ano, mes, dia] = item.dataDomingo.split('-');
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
                      <td className="py-3.5 px-6 text-right space-x-2">
                        <button
                          onClick={() => handleEditar(item)}
                          className="px-2.5 py-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleExcluir(item.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition"
                        >
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