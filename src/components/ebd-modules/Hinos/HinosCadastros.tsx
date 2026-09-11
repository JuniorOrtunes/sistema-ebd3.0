import React, { useState, useEffect } from 'react';
import { listarHinos, cadastrarHino, atualizarHino, excluirHino } from './hinosService';
import type { Hino, HinarioOrigem } from './types';

export const HinosCadastros: React.FC = () => {
  const [hinos, setHinos] = useState<Hino[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);

  // Estados do Formulário / Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [hinoEmEdicao, setHinoEmEdicao] = useState<Hino | null>(null);
  
  const [numero, setNumero] = useState<string>('');
  const [titulo, setTitulo] = useState<string>('');
  const [hinario, setHinario] = useState<HinarioOrigem>('Cantor Cristão');

  // Carregar hinos ao montar o componente
  const carregarDados = async () => {
    try {
      setLoading(true);
      const dados = await listarHinos();
      setHinos(dados);
      setErro(null);
    } catch (err) {
      setErro('Erro ao carregar lista de hinos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Abrir modal para novo hino
  const handleNovoHino = () => {
    setHinoEmEdicao(null);
    setNumero('');
    setTitulo('');
    setHinario('Cantor Cristão');
    setIsModalOpen(true);
  };

  // Abrir modal para edição
  const handleEditarHino = (hino: Hino) => {
    setHinoEmEdicao(hino);
    setNumero(String(hino.numero));
    setTitulo(hino.titulo);
    setHinario(hino.hinario);
    setIsModalOpen(true);
  };

  // Salvar (Cadastrar ou Atualizar)
  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!numero || !titulo) {
      alert('Preencha o número e o título do hino.');
      return;
    }

    try {
      if (hinoEmEdicao && hinoEmEdicao.id) {
        // Atualizar
        await atualizarHino(hinoEmEdicao.id, {
          numero: Number(numero),
          titulo,
          hinario
        });
      } else {
        // Cadastrar novo
        await cadastrarHino({
          numero: Number(numero),
          titulo,
          hinario
        });
      }
      setIsModalOpen(false);
      carregarDados();
    } catch (err) {
      alert('Erro ao salvar o hino.');
    }
  };

  // Excluir hino
  const handleExcluir = async (id?: string) => {
    if (!id) return;
    if (confirm('Tem certeza que deseja excluir este hino do repertório?')) {
      try {
        await excluirHino(id);
        carregarDados();
      } catch (err) {
        alert('Erro ao excluir o hino.');
      }
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestão de Hinos</h2>
          <p className="text-sm text-gray-600">Cadastro e curadoria do repertório institucional</p>
        </div>
        <button
          onClick={handleNovoHino}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          + Novo Hino
        </button>
      </div>

      {erro && <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-md">{erro}</div>}

      {loading ? (
        <p className="text-center py-6 text-gray-500">Carregando hinos...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hinário / Origem</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {hinos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">Nenhum hino cadastrado.</td>
                </tr>
              ) : (
                hinos.map((hino) => (
                  <tr key={hino.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{hino.numero}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{hino.titulo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                        {hino.hinario}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right space-x-3 whitespace-nowrap">
                      <button
                        onClick={() => handleEditarHino(hino)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 transition"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Editar
                      </button>
                      <button
                        onClick={() => handleExcluir(hino.id)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 hover:text-rose-800 transition"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2.002 2.002 0 0116.138 21H7.862a2.002 2.002 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Cadastro / Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {hinoEmEdicao ? 'Editar Hino' : 'Cadastrar Novo Hino'}
            </h3>
            <form onSubmit={handleSalvar}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                <input
                  type="number"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Título do Hino</label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Hinário / Origem</label>
                <select
                  value={hinario}
                  onChange={(e) => setHinario(e.target.value as HinarioOrigem)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Cantor Cristão">Cantor Cristão</option>
                  <option value="HCC">HCC</option>
                  <option value="Avulso">Avulso</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};