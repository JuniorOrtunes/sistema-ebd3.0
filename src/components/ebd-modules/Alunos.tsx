import React, { useState, useEffect } from 'react';
import { ALUNOS_INICIAIS, type Aluno } from '../../lib/ebd';
import { UserPlus, Search, ChevronDown, Edit2, X, Calendar, MapPin, Loader2, Trash2, Power, Shield } from 'lucide-react';
import { db } from '../../firebase'; 
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

interface ClassItem {
  id: number | string;
  nome: string;
  faixaEtaria: string;
  sala: string;
  ativa: boolean;
}

export function Alunos() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filtroClasse, setFiltroClasse] = useState('Todas');
  const [filtroTipo, setFiltroTipo] = useState('todos'); // 'todos' | 'professores' | 'superintendentes' | 'alunos'
  const [busca, setBusca] = useState('');

  const [classesDisponiveis, setClassesDisponiveis] = useState<ClassItem[]>([]);

  // Carregar Classes do Firestore ou localStorage
  useEffect(() => {
    const carregarClasses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'classes'));
        if (!querySnapshot.empty) {
          const listaClasses = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as ClassItem[];
          listaClasses.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));
          setClassesDisponiveis(listaClasses);
          return;
        }
      } catch (e) {
        console.error('Erro ao buscar classes do Firestore:', e);
      }

      const savedClasses = localStorage.getItem('ebd_classes');
      if (savedClasses) {
        const parsed: ClassItem[] = JSON.parse(savedClasses);
        parsed.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));
        setClassesDisponiveis(parsed);
      }
    };

    carregarClasses();
  }, []);

  // Carregar Alunos e Superintendentes do Firestore com cruzamento flexível
  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // 1. Carregar Alunos
      const snapshotAlunos = await getDocs(collection(db, 'alunos'));
      let listaAlunos: Aluno[] = [];
      if (!snapshotAlunos.empty) {
        listaAlunos = snapshotAlunos.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        })) as Aluno[];
      } else {
        listaAlunos = [...ALUNOS_INICIAIS];
      }

      // 2. Carregar Superintendentes
      const snapshotSuper = await getDocs(collection(db, 'superintendentes'));
      const listaSuperintendentes: { nome: string; dados: any; id: string }[] = [];

      if (!snapshotSuper.empty) {
        snapshotSuper.docs.forEach(docSup => {
          const dadosSup = docSup.data();
          if (dadosSup.nome) {
            listaSuperintendentes.push({
              id: docSup.id,
              nome: dadosSup.nome.trim().toLowerCase(),
              dados: dadosSup
            });
          }
        });
      }

      // 3. Cruzamento inteligente por correspondência
      listaAlunos = listaAlunos.map(aluno => {
        const nomeAluno = aluno.nome?.trim().toLowerCase() || '';
        
        const ehSuper = listaSuperintendentes.some(sup => {
          return nomeAluno === sup.nome || nomeAluno.includes(sup.nome) || sup.nome.includes(nomeAluno);
        });

        if (ehSuper) {
          return { ...aluno, eSuperintendente: true };
        }
        return aluno;
      });

      // 4. Adicionar superintendentes que não existem na lista de alunos
      listaSuperintendentes.forEach(sup => {
        const jaExiste = listaAlunos.some(a => {
          const nomeA = a.nome?.trim().toLowerCase() || '';
          return nomeA === sup.nome || nomeA.includes(sup.nome) || sup.nome.includes(nomeA);
        });

        if (!jaExiste) {
          listaAlunos.push({
            id: `sup_${sup.id}`,
            nome: sup.dados.nome,
            classe: sup.dados.classe || 'Geral',
            turma: sup.dados.turma || 'Geral',
            telefone: sup.dados.telefone || '',
            situacao: sup.dados.situacao || 'Ativo',
            ativo: sup.dados.ativo !== false,
            eSuperintendente: true,
            eProfessor: sup.dados.eProfessor || false,
          } as any);
        }
      });

      listaAlunos.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));
      setAlunos(listaAlunos);

    } catch (e) {
      console.error('Erro ao carregar dados do Firestore:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Estados do formulário
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [classe, setClasse] = useState('Sem Classe');
  const [nascimento, setNascimento] = useState('');
  const [casamento, setCasamento] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cep, setCep] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [eProfessor, setEProfessor] = useState(false);
  const [classeLeciona, setClasseLeciona] = useState('Selecione uma classe');
  const [buscandoCep, setBuscandoCep] = useState(false);

  // Máscaras de entrada
  const mascaraTelefone = (v: string) => v.replace(/\D/g, '').replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3').slice(0, 15);
  const mascaraCep = (v: string) => v.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2').slice(0, 9);

  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cepLimpo = e.target.value.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;

    try {
      setBuscandoCep(true);
      const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const dados = await resposta.json();

      if (!dados.erro) {
        setRua(dados.logradouro || '');
        setBairro(dados.bairro || '');
        setCidade(dados.localidade || '');
      }
    } catch (erro) {
      console.error('Erro ao buscar CEP:', erro);
    } finally {
      setBuscandoCep(false);
    }
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      alert('O nome do aluno é obrigatório.');
      return;
    }

    const classeFinal = classe === 'Sem Classe' ? 'Geral' : classe;
    const dataAtual = new Date().toISOString().split('T')[0];

    try {
      const isEditando = editandoId !== null && !editandoId.startsWith('sup_');

      if (isEditando) {
        const alunoRef = doc(db, 'alunos', editandoId as string);
        const dadosAtualizados = {
          nome,
          turma: classeFinal,
          classe: classeFinal,
          telefone,
          nascimento,
          casamento,
          cep,
          rua,
          numero,
          complemento,
          bairro,
          cidade,
          eProfessor,
          classeLeciona: eProfessor ? classeLeciona : ''
        };

        await updateDoc(alunoRef, dadosAtualizados);
        
        setAlunos(prev => 
          prev.map(a => a.id === editandoId ? { ...a, ...dadosAtualizados } : a)
              .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }))
        );
        alert('Registro atualizado com sucesso!');
      } else {
        const novoAlunoPayload = {
          nome,
          turma: classeFinal,
          classe: classeFinal,
          ativo: true,
          situacao: 'Ativo',
          dataCadastro: dataAtual,
          telefone,
          nascimento,
          casamento,
          cep,
          rua,
          numero,
          complemento,
          bairro,
          cidade,
          eProfessor,
          classeLeciona: eProfessor ? classeLeciona : ''
        };

        const docRef = await addDoc(collection(db, 'alunos'), novoAlunoPayload);
        
        const novoAlunoComId = {
          id: docRef.id,
          ...novoAlunoPayload
        } as unknown as Aluno;

        setAlunos(prev => 
          [...prev, novoAlunoComId]
            .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }))
        );
        alert('Registro criado com sucesso!');
      }

      limparFormulario();
    } catch (error) {
      console.error('Erro ao salvar no Firestore:', error);
      alert('Erro ao salvar registro. Verifique o console.');
    }
  };

  const handleEditar = (aluno: Aluno) => {
    setEditandoId(aluno.id);
    setNome(aluno.nome || '');
    setClasse(aluno.classe || aluno.turma || 'Sem Classe');
    setNascimento(aluno.nascimento || '');
    setCasamento(aluno.casamento || '');
    setTelefone(aluno.telefone || '');
    setCep(aluno.cep || '');
    setRua(aluno.rua || '');
    setNumero(aluno.numero || '');
    setComplemento(aluno.complemento || '');
    setBairro(aluno.bairro || '');
    setCidade(aluno.cidade || '');
    setEProfessor(aluno.eProfessor || false);
    setClasseLeciona(aluno.classeLeciona || 'Selecione uma classe');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAlternarStatus = async (id: string, situacaoAtual: string) => {
    const novaSituacao = situacaoAtual === 'Ativo' ? 'Inativo' : 'Ativo';
    const novoAtivo = novaSituacao === 'Ativo';

    try {
      if (!id.startsWith('sup_')) {
        const alunoRef = doc(db, 'alunos', id);
        await updateDoc(alunoRef, { situacao: novaSituacao, ativo: novoAtivo });
      }

      setAlunos(prev => 
        prev.map(a => a.id === id ? { ...a, situacao: novaSituacao as any, ativo: novoAtivo } : a)
      );
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      alert('Erro ao atualizar status.');
    }
  };

  const handleRemover = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este registro?')) {
      try {
        if (!id.startsWith('sup_')) {
          await deleteDoc(doc(db, 'alunos', id));
        }
        setAlunos(prev => prev.filter(a => a.id !== id));
      } catch (error) {
        console.error('Erro ao excluir:', error);
        alert('Erro ao excluir registro.');
      }
    }
  };

  const limparFormulario = () => {
    setEditandoId(null);
    setNome('');
    setClasse('Sem Classe');
    setNascimento('');
    setCasamento('');
    setTelefone('');
    setCep('');
    setRua('');
    setNumero('');
    setComplemento('');
    setBairro('');
    setCidade('');
    setEProfessor(false);
    setClasseLeciona('Selecione uma classe');
  };

  const alunosFiltrados = alunos
    .filter(a => {
      const matchBusca = a.nome?.toLowerCase().includes(busca.toLowerCase());
      const matchClasse = filtroClasse === 'Todas' || a.classe === filtroClasse || a.turma === filtroClasse;
      
      let matchTipo = true;
      if (filtroTipo === 'professores') {
        matchTipo = !!a.eProfessor;
      } else if (filtroTipo === 'superintendentes') {
        matchTipo = !!(a as any).eSuperintendente;
      } else if (filtroTipo === 'alunos') {
        matchTipo = !a.eProfessor && !(a as any).eSuperintendente;
      }

      return matchBusca && matchClasse && matchTipo;
    })
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gray-50/50 min-h-screen">
      
      {/* Container Superior Fixo (Sticky Header contendo Título + Formulário) */}
      <div className="sticky top-0 z-30 bg-gray-50/95 backdrop-blur-md pt-2 pb-4 space-y-4 border-b border-gray-200/60">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">
            {editandoId ? 'Editar Aluno / Cadastro' : 'Alunos e Corpo Docente'}
          </h1>
        </div>

        {/* Formulário de Cadastro / Edição */}
        <form onSubmit={handleSalvar} className={`bg-white p-6 rounded-2xl border shadow-md space-y-5 transition-all ${editandoId ? 'border-indigo-300 ring-2 ring-indigo-100' : 'border-gray-100'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-gray-600 tracking-wider">NOME *</label>
              <input 
                type="text" 
                required
                value={nome}
                onChange={e => setNome(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none text-sm bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 tracking-wider">CLASSE</label>
              <div className="relative">
                <select 
                  value={classe}
                  onChange={e => setClasse(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none text-sm bg-white appearance-none cursor-pointer"
                >
                  <option value="Sem Classe">Sem Classe</option>
                  {classesDisponiveis.map(c => (
                    <option key={c.id} value={c.nome}>{c.nome}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" /> NASCIMENTO
              </label>
              <input 
                type="date" 
                value={nascimento}
                onChange={e => setNascimento(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none text-sm bg-white cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" /> CASAMENTO
              </label>
              <input 
                type="date" 
                value={casamento}
                onChange={e => setCasamento(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none text-sm bg-white cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-2">
            <div className="space-y-1 lg:col-span-1">
              <label className="text-xs font-semibold text-gray-600 tracking-wider">TELEFONE</label>
              <input 
                type="text" 
                placeholder="(00) 00000-0000"
                value={telefone}
                onChange={e => setTelefone(mascaraTelefone(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none text-sm bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 tracking-wider flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-500" /> CEP {buscandoCep && <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />}
              </label>
              <input 
                type="text" 
                placeholder="00000-000"
                value={cep}
                onChange={e => setCep(mascaraCep(e.target.value))}
                onBlur={handleCepBlur}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none text-sm bg-white"
              />
            </div>

            <div className="space-y-1 lg:col-span-2">
              <label className="text-xs font-semibold text-gray-600 tracking-wider">RUA</label>
              <input 
                type="text" 
                value={rua}
                onChange={e => setRua(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none text-sm bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 tracking-wider">NÚMERO</label>
              <input 
                type="text" 
                value={numero}
                onChange={e => setNumero(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none text-sm bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 tracking-wider">COMPLEMENTO</label>
              <input 
                type="text" 
                value={complemento}
                onChange={e => setComplemento(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none text-sm bg-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 tracking-wider">BAIRRO</label>
              <input 
                type="text" 
                value={bairro}
                onChange={e => setBairro(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none text-sm bg-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 tracking-wider">CIDADE</label>
              <input 
                type="text" 
                value={cidade}
                onChange={e => setCidade(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none text-sm bg-white"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/70 space-y-3">
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                id="profCheck"
                checked={eProfessor}
                onChange={e => setEProfessor(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="profCheck" className="text-sm font-semibold text-gray-800 cursor-pointer">
                É professor(a)?
              </label>
            </div>

            {eProfessor && (
              <div className="space-y-1 pt-2">
                <label className="text-xs font-semibold text-gray-600 tracking-wider">CLASSE QUE LECIONA</label>
                <div className="relative">
                  <select 
                    value={classeLeciona}
                    onChange={e => setClasseLeciona(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none text-sm bg-white appearance-none cursor-pointer"
                  >
                    <option value="Selecione uma classe">Selecione uma classe</option>
                    {classesDisponiveis.map(c => (
                      <option key={c.id} value={c.nome}>{c.nome}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button 
              type="submit"
              className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              {editandoId ? 'Salvar Alterações' : 'Salvar'}
            </button>
            
            {editandoId && (
              <button 
                type="button"
                onClick={limparFormulario}
                className="px-5 py-2.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm font-medium hover:bg-rose-100 transition-all shadow-sm flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancelar Edição
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Seção inferior: Filtros e Tabela (rolam livremente abaixo do cabeçalho fixo) */}
      <div className="space-y-4 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 tracking-wider">FILTRAR POR CLASSE</label>
            <div className="relative">
              <select 
                value={filtroClasse}
                onChange={e => setFiltroClasse(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none text-sm bg-white appearance-none cursor-pointer"
              >
                <option value="Todas">Todas as Classes</option>
                {classesDisponiveis.map(c => (
                  <option key={c.id} value={c.nome}>{c.nome}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 tracking-wider">TIPO DE PERFIL</label>
            <div className="relative">
              <select 
                value={filtroTipo}
                onChange={e => setFiltroTipo(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none text-sm bg-white appearance-none cursor-pointer"
              >
                <option value="todos">Todos os cadastros</option>
                <option value="superintendentes">Superintendência</option>
                <option value="professores">Professores</option>
                <option value="alunos">Alunos</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 tracking-wider">BUSCAR NOME</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Pesquisar por nome..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none text-sm bg-white"
              />
            </div>
          </div>

        </div>

        {/* Tabela */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-500 text-sm gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
              Carregando cadastros do sistema...
            </div>
          ) : alunosFiltrados.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-100 text-xs font-semibold text-gray-600 tracking-wider">
                    <th className="p-4">Nome</th>
                    <th className="p-4">Classe</th>
                    <th className="p-4">Telefone</th>
                    <th className="p-4">Situação</th>
                    <th className="p-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                  {alunosFiltrados.map((a) => {
                    const situacaoTexto = a.situacao || (a.ativo ? 'Ativo' : 'Inativo');
                    const isSup = (a as any).eSuperintendente;
                    return (
                      <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 font-medium text-gray-900 flex items-center gap-2 flex-wrap">
                          {a.nome}
                          {isSup && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                              <Shield className="w-3 h-3" /> Superintendente
                            </span>
                          )}
                          {a.eProfessor && !isSup && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                              Professor
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-gray-600">{a.classe || a.turma || '-'}</td>
                        <td className="p-4 text-gray-600">{a.telefone || '-'}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            situacaoTexto === 'Ativo' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                              : 'bg-rose-50 text-rose-700 border-rose-100'
                          }`}>
                            {situacaoTexto}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleAlternarStatus(a.id, situacaoTexto)}
                              className={`p-2 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-medium ${
                                situacaoTexto === 'Ativo' 
                                  ? 'text-amber-600 hover:bg-amber-50' 
                                  : 'text-emerald-600 hover:bg-emerald-50'
                              }`}
                              title={situacaoTexto === 'Ativo' ? 'Desativar Registro' : 'Ativar Registro'}
                            >
                              <Power className="w-4 h-4" />
                              {situacaoTexto === 'Ativo' ? 'Desativar' : 'Ativar'}
                            </button>

                            <button 
                              onClick={() => handleEditar(a)}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-medium"
                              title="Editar Registro"
                            >
                              <Edit2 className="w-4 h-4" />
                              Editar
                            </button>

                            <button 
                              onClick={() => handleRemover(a.id)}
                              className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-medium"
                              title="Excluir Registro"
                            >
                              <Trash2 className="w-4 h-4" />
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 text-sm">
              Nenhum registro encontrado.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}