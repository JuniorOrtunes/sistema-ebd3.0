import { useState, useEffect } from 'react';
import { Building2, Plus, Edit3, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc as updateDocFn, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';

interface ClassItem {
  id: string;
  nome: string;
  faixaEtaria?: string;
  sala?: string;
  ativa: boolean;
}

export function ClassesModule() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [nome, setNome] = useState('');
  const [faixaEtaria, setFaixaEtaria] = useState('');
  const [sala, setSala] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    async function carregarClasses() {
      try {
        const querySnapshot = await getDocs(collection(db, 'classes'));
        const lista: ClassItem[] = querySnapshot.docs.map(docSnapshot => ({
          id: docSnapshot.id,
          ...(docSnapshot.data() as Omit<ClassItem, 'id'>)
        }));

        lista.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));
        setClasses(lista);
      } catch (error) {
        console.error('Erro ao carregar classes do Firestore:', error);
      }
    }

    carregarClasses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Apenas o nome é obrigatório agora
    if (!nome.trim()) {
      alert('Por favor, preencha o nome da classe.');
      return;
    }

    try {
      if (editingId !== null) {
        const classeRef = doc(db, 'classes', editingId);
        const dadosAtualizados = { 
          nome: nome.trim(), 
          faixaEtaria: faixaEtaria.trim(), 
          sala: sala.trim() 
        };

        await updateDocFn(classeRef, dadosAtualizados);

        setClasses(prev =>
          prev.map(c => c.id === editingId ? { ...c, ...dadosAtualizados } : c)
              .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }))
        );
        setEditingId(null);
      } else {
        const novaClassePayload = {
          nome: nome.trim(),
          faixaEtaria: faixaEtaria.trim(),
          sala: sala.trim(),
          ativa: true
        };

        const docRef = await addDoc(collection(db, 'classes'), novaClassePayload);
        const novaClasseComId: ClassItem = {
          id: docRef.id,
          ...novaClassePayload
        };

        setClasses(prev =>
          [...prev, novaClasseComId]
            .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }))
        );
      }

      setNome('');
      setFaixaEtaria('');
      setSala('');
    } catch (error) {
      console.error('Erro ao salvar classe no Firestore:', error);
      alert('Erro ao salvar classe. Verifique o console.');
    }
  };

  const handleEdit = (item: ClassItem) => {
    setNome(item.nome);
    setFaixaEtaria(item.faixaEtaria || '');
    setSala(item.sala || '');
    setEditingId(item.id);
  };

  const toggleStatus = async (item: ClassItem) => {
    try {
      const novoStatus = !item.ativa;
      const classeRef = doc(db, 'classes', item.id);
      await updateDocFn(classeRef, { ativa: novoStatus });

      setClasses(prev =>
        prev.map(c => c.id === item.id ? { ...c, ativa: novoStatus } : c)
            .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }))
      );
    } catch (error) {
      console.error('Erro ao alternar status da classe:', error);
      alert('Erro ao atualizar status.');
    }
  };

  const handleDelete = async (id: string) => {
    const classeParaExcluir = classes.find(c => c.id === id);
    const nomeClasse = classeParaExcluir ? classeParaExcluir.nome : 'esta classe';

    const confirmado = window.confirm(`Tem certeza que deseja excluir a classe "${nomeClasse}"? Esta ação não poderá ser desfeita.`);

    if (confirmado) {
      try {
        await deleteDoc(doc(db, 'classes', id));
        setClasses(prev => prev.filter(c => c.id !== id));

        if (editingId === id) {
          setEditingId(null);
          setNome('');
          setFaixaEtaria('');
          setSala('');
        }
      } catch (error) {
        console.error('Erro ao excluir classe:', error);
        alert('Erro ao excluir classe do Firestore.');
      }
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200/85 space-y-6">
        
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
          <Building2 className="w-5 h-5 text-blue-950" />
          <h2 className="font-bold text-slate-800 text-lg">Gerenciamento de Classes</h2>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-slate-50/70 p-4 rounded-xl border border-slate-200/60">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 tracking-wider">NOME <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              placeholder="Ex: Novos Fiéis"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-950/20 focus:border-blue-950 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 tracking-wider">FAIXA ETÁRIA <span className="text-slate-400 font-normal">(opcional)</span></label>
            <input 
              type="text" 
              placeholder="Ex: Jovens Adultos"
              value={faixaEtaria}
              onChange={(e) => setFaixaEtaria(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-950/20 focus:border-blue-950 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 tracking-wider">SALA <span className="text-slate-400 font-normal">(opcional)</span></label>
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
              <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:bg-slate-50/50 px-3 rounded-xl">
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
                    {item.faixaEtaria || 'Faixa etária não informada'} · {item.sala || 'Sala não informada'}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <button 
                    type="button"
                    onClick={() => handleEdit(item)}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                    Editar
                  </button>

                  <button 
                    type="button"
                    onClick={() => toggleStatus(item)}
                    className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
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
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-50 text-red-600 border border-red-200/60 hover:bg-red-100 transition-all"
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