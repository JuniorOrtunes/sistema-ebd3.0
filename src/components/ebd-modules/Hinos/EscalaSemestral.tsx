import React, { useState, useEffect } from 'react';
import { listarHinos, listarEscalaSemestral, salvarItemEscala } from './hinosService';
import type { Hino, EscalaSemestralItem } from './types';

export const EscalaSemestral: React.FC = () => {
  const [hinos, setHinos] = useState<Hino[]>([]);
  const [escala, setEscala] = useState<EscalaSemestralItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);

  // Estados do formulário de associação
  const [dataDomingo, setDataDomingo] = useState<string>('');
  const [hinoSelecionadoId, setHinoSelecionadoId] = useState<string>('');
  const [salvando, setSalvando] = useState<boolean>(false);

  // Carregar dados iniciais (Hinos e Escala)
  const carregarDados = async () => {
    try {
      setLoading(true);
      const [listaHinos, listaEscala] = await Promise.all([
        listarHinos(),
        listarEscalaSemestral()
      ]);
      setHinos(listaHinos);
      setEscala(listaEscala);
      setErro(null);
    } catch (err) {
      setErro('Erro ao carregar dados da escala semestral.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Salvar associação de hino ao domingo
  const handleSalvarEscala = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataDomingo || !hinoSelecionadoId) {
      alert('Selecione a data do domingo e o hino correspondente.');
      return;
    }

    try {
      setSalvando(true);
      await salvarItemEscala({
        dataDomingo,
        hinoId: hinoSelecionadoId
      });
      setDataDomingo('');
      setHinoSelecionadoId('');
      await carregarDados();
      alert('Hino escalado com sucesso para o domingo!');
    } catch (err) {
      alert('Erro ao salvar item na escala.');
    } finally {
      setSalvando(false);
    }
  };

  // Helper para buscar detalhes do hino pelo ID na escala
  const getHinoDetalhes = (hinoId: string): Hino | undefined => {
    return hinos.find(h => h.id === hinoId);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md mt-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Escala Semestral de Hinos</h2>
        <p className="text-sm text-gray-600">Vincule os hinos oficiais aos domingos do semestre letivo da EBD</p>
      </div>

      {erro && <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-md">{erro}</div>}

      {/* Formulário para escalar hino */}
      <form onSubmit={handleSalvarEscala} className="bg-gray-50 p-4 rounded-md mb-6 border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data do Domingo</label>
          <input
            type="date"
            value={dataDomingo}
            onChange={(e) => setDataDomingo(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Selecionar Hino</label>
          <select
            value={hinoSelecionadoId}
            onChange={(e) => setHinoSelecionadoId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            required
          >
            <option value="">-- Escolha um hino --</option>
            {hinos.map((hino) => (
              <option key={hino.id} value={hino.id}>
                {hino.numero} - {hino.titulo} ({hino.hinario})
              </option>
            ))}
          </select>
        </div>

        <div>
          <button
            type="submit"
            disabled={salvando}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
          >
            {salvando ? 'Salvando...' : '+ Escalar Hino'}
          </button>
        </div>
      </form>

      {/* Listagem da Escala */}
      {loading ? (
        <p className="text-center py-6 text-gray-500">Carregando escala...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data do Domingo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número do Hino</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título do Hino</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hinário</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {escala.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">Nenhum hino escalado para o semestre.</td>
                </tr>
              ) : (
                escala.map((item) => {
                  const hinoInfo = getHinoDetalhes(item.hinoId);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {item.dataDomingo.split('-').reverse().join('/')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        {hinoInfo ? hinoInfo.numero : 'Hino removido'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">
                        {hinoInfo ? hinoInfo.titulo : 'Hino não encontrado no repertório'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {hinoInfo && (
                          <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                            {hinoInfo.hinario}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};