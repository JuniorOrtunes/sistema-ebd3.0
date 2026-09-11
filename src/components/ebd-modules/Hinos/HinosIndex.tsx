import React, { useState } from 'react';
import { HinosCadastros } from './HinosCadastros';
import { EscalaSemestral } from './EscalaSemestral';

export const HinosIndex: React.FC = () => {
  const [abaAtiva, setAbaAtiva] = useState<'cadastro' | 'escala'>('escala');

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Cabeçalho do Módulo */}
      <div className="mb-6 border-b border-gray-200 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Gestão e Escala de Hinos</h1>
          <p className="text-sm text-gray-600 mt-1">
            Módulo oficial de curadoria, repertório e planejamento semestral da EBD 3.0
          </p>
        </div>

        {/* Sistema de Abas */}
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setAbaAtiva('escala')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition ${
              abaAtiva === 'escala'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Escala Semestral
          </button>
          <button
            onClick={() => setAbaAtiva('cadastro')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition ${
              abaAtiva === 'cadastro'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Cadastro de Hinos
          </button>
        </div>
      </div>

      {/* Renderização Condicional da Aba Ativa */}
      <div className="transition-all duration-200">
        {abaAtiva === 'escala' ? (
          <EscalaSemestral />
        ) : (
          <HinosCadastros />
        )}
      </div>
    </div>
  );
};