import { useState, useEffect } from 'react';
import { Building2, Plus, Edit3, Trash2, CheckCircle, XCircle } from 'lucide-react';

interface ClassItem {
  id: number;
  nome: string;
  faixaEtaria: string;
  sala: string;
  ativa: boolean;
}

export function ClassesModule() {
  // Carrega as classes e já ordena em ordem alfabética
  const [classes, setClasses] = useState<ClassItem[]>(() => {
    const savedClasses = localStorage.getItem('ebd_classes');
    if (!savedClasses) return [];
    const parsed: ClassItem[] = JSON.parse(savedClasses);
    return parsed.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));
  });

  const [nome, setNome] = useState('');
  const [faixaEtaria, setFaixaEtaria] = useState('');
  const [sala, setSala] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  // Salva no navegador mantendo sempre a ordem alfabética
  useEffect(() => {
    const classesOrdenadas = [...classes].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));
    localStorage.setItem('ebd_classes', JSON.stringify(classesOrdenadas));
  }, [classes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !faixaEtaria.trim() || !sala.trim()) return;

    let novasClasses: ClassItem[];

    if (editingId !== null) {
      novasClasses = classes.map(c => c.id === editingId ? { ...c, nome, faixaEtaria, sala } : c);
      setEditingId(null);
    } else {
      const novaClasse: ClassItem = {
        id: Date.now(),
        nome,
        faixaEtaria,
        sala,
        ativa: true,
      };
      novasClasses = [...classes, novaClasse];
    }

    // Ordena imediatamente ao salvar/atualizar
    novasClasses.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));
    setClasses(novasClasses);

    setNome('');
    setFaixaEtaria('');
    setSala('');
  };

  const handleEdit = (item: ClassItem) => {
    setNome(item.nome);
    setFaixaEtaria(item.faixaEtaria);
    setSala(item.sala);
    setEditingId(item.id);
  };

  const toggleStatus = (id: number) => {
    const novasClasses = classes.map(c => c.id === id ? { ...c, ativa: !c.ativa } : c);
    novasClasses.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));
    setClasses(novasClasses);
  };

  const handleDelete = (id: number) => {
    const classeParaExcluir = classes.find(c => c.id === id);
    const nomeClasse = classeParaExcluir ? classeParaExcluir.nome : 'esta classe';

    const confirmado = window.confirm(`Tem certeza que deseja excluir a classe "${nomeClasse}"? Esta ação não poderá ser desfeita.`);

    if (confirmado) {
      const novasClasses = classes.filter(c => c.id !== id);
      novasClasses.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));
      setClasses(novasClasses);
      
      if (editingId === id) {
        setEditingId(null);
        setNome('');
        setFaixaEtaria('');
        setSala('');
      }
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-6">
        
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
          <Building2 className="w-5 h-5 text-blue-950" />
          <h2 className="font-bold text-slate-800 text-lg">Gerenciamento de Classes</h2>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-slate-50/70 p-4 rounded-xl border border-slate-200/60">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 tracking-wider">NOME</label>
            <input 
              type="text" 
              placeholder="Ex: Novos Fiéis"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-950/20 focus:border-blue-950 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 tracking-wider">FAIXA ETÁRIA</label>
            <input 
              type="text" 
              placeholder="Ex: Jovens Adultos"
              value={faixaEtaria}
              onChange={(e) => setFaixaEtaria(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-950/20 focus:border-blue-950 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 tracking-wider">SALA</label>
            <input 
              type="text" 
              placeholder="Ex: Sala 03"
              value={sala}
              onChange={(e) => setSala(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-950/20 focus:border-blue-950 transition-all"
            />
          </div>

          <div>
            <button 
              type="submit"
              className={`w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm ${
                editingId !== null 
                  ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                  : 'bg-blue-950 hover:bg-blue-900 text-white'
              }`}
            >
              <Plus className="w-4 h-4" />
              {editingId !== null ? 'Salvar Edição' : 'Adicionar classe'}
            </button>
          </div>
        </form>

        <div className="divide-y divide-slate-100">
          {classes.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              Nenhuma classe cadastrada no momento.
            </div>
          ) : (
            classes.map((item) => (
              <div key={item.id} className="py-4 flex items-center justify-between gap-4 transition-all hover:bg-slate-50/50 px-3 rounded-xl">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-base">{item.nome}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      item.ativa ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/50' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {item.ativa ? 'ativa' : 'inativa'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {item.faixaEtaria} · {item.sala}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    type="button"
                    onClick={() => handleEdit(item)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                    Editar
                  </button>

                  <button 
                    type="button"
                    onClick={() => toggleStatus(item.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      item.ativa 
                        ? 'border-amber-200 text-amber-700 hover:bg-amber-50' 
                        : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    {item.ativa ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                    {item.ativa ? 'Desativar' : 'Ativar'}
                  </button>

                  <button 
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-red-50 text-red-600 border border-red-200/60 hover:bg-red-100 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Excluir
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}