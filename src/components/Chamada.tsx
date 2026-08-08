import { useState } from 'react';
import { Trash2, Plus, Save } from 'lucide-react';

interface ChamadaProps {
  nomeClasse: string;
}

export default function Chamada({ nomeClasse }: ChamadaProps) {
  // Estados da Chamada
  const [presencasAlunos, setPresencasAlunos] = useState<Record<string, boolean>>({});
  const [listaVisitantes, setListaVisitantes] = useState<string[]>([]);
  const [nomeVisitanteInput, setNomeVisitanteInput] = useState('');

  // Mock de alunos (No futuro, virá via props ou API)
  const alunosDaClasse = [
    { id: '1', nome: 'Ana Paula Souza' },
    { id: '2', nome: 'Lucas Gabriel Silva' },
    { id: '3', nome: 'Mariana Oliveira' },
  ];

  const handleAdicionarVisitante = () => {
    if (!nomeVisitanteInput.trim()) return;
    setListaVisitantes([...listaVisitantes, nomeVisitanteInput.trim()]);
    setNomeVisitanteInput('');
  };

  const togglePresencaAluno = (id: string) => {
    setPresencasAlunos(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const totalPresentes = Object.values(presencasAlunos).filter(Boolean).length + listaVisitantes.length;

  return (
    <div className="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Coluna Esquerda: Lista de Alunos */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Data</p>
              <p className="text-sm font-bold text-slate-900">{new Date().toLocaleDateString('pt-BR')}</p>
            </div>
            <h2 className="text-lg font-bold text-slate-800">Chamada — {nomeClasse}</h2>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 mb-4 uppercase tracking-wide border-b pb-2">Alunos ({alunosDaClasse.length})</h3>
            <div className="space-y-2">
              {alunosDaClasse.map(aluno => (
                <div key={aluno.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                  <span className="text-sm font-medium text-slate-700">{aluno.nome}</span>
                  <button
                    onClick={() => togglePresencaAluno(aluno.id)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${presencasAlunos[aluno.id] ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}
                  >
                    {presencasAlunos[aluno.id] ? 'Presente' : 'Ausente'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coluna Direita: Visitantes e Ações */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wide">Visitantes</h3>
              <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-bold">{listaVisitantes.length}</span>
            </div>
            
            <div className="flex gap-2 mb-4">
              <input 
                value={nomeVisitanteInput}
                onChange={(e) => setNomeVisitanteInput(e.target.value)}
                placeholder="Nome do visitante"
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm !text-slate-900 placeholder:!text-slate-400"
              />
              <button onClick={handleAdicionarVisitante} className="px-4 py-2 bg-[#0A192F] text-white rounded-lg text-xs font-semibold hover:bg-slate-800">
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto">
              {listaVisitantes.map((vis, i) => (
                <div key={i} className="flex justify-between items-center text-xs py-2 border-b border-slate-100">
                  <span className="!text-slate-900 font-semibold" style={{ color: '#0f172a' }}>{vis}</span>
                  <button onClick={() => setListaVisitantes(listaVisitantes.filter((_, idx) => idx !== i))} className="text-rose-500 hover:text-rose-700">
                    <Trash2 className="w-3 h-3"/>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-xs text-slate-500">Total de presentes na classe</p>
            <p className="text-4xl font-black text-[#0A192F] my-2">{totalPresentes}</p>
            <button 
              onClick={() => alert('Chamada salva com sucesso!')}
              className="w-full py-3 bg-[#0A192F] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-sm"
            >
              <Save className="w-4 h-4" /> Salvar chamada
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}