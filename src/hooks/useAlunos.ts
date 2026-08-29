import { useState, useEffect } from 'react';
import { ALUNOS_INICIAIS, type Aluno } from '../lib/ebd';
import { db } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

export interface ClassItem {
  id: number | string;
  nome: string;
  faixaEtaria: string;
  sala: string;
  ativa: boolean;
}

export function useAlunos() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filtroClasse, setFiltroClasse] = useState('Todas');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [busca, setBusca] = useState('');

  const [classesDisponiveis, setClassesDisponiveis] = useState<ClassItem[]>([]);
  const [selectedAlunoId, setSelectedAlunoId] = useState<string | null>(null);
  const [modoConferencia, setModoConferencia] = useState(false);

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

  // Carregar Classes
  useEffect(() => {
    const carregarClasses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'classes'));
        if (!querySnapshot.empty) {
          const listaClasses = querySnapshot.docs.map(d => ({
            id: d.id,
            ...d.data()
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

  // Carregar Alunos e Superintendentes
  const carregarDados = async () => {
    try {
      setLoading(true);
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

      listaAlunos = listaAlunos.map(aluno => {
        const nomeAluno = aluno.nome?.trim().toLowerCase() || '';
        const ehSuper = listaSuperintendentes.some(sup => 
          nomeAluno === sup.nome || nomeAluno.includes(sup.nome) || sup.nome.includes(nomeAluno)
        );
        if (ehSuper) return { ...aluno, eSuperintendente: true };
        return aluno;
      });

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
      console.error('Erro ao carregar dados:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    if (modoConferencia) return;
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
    if (modoConferencia) return;
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
    setModoConferencia(false);
    setSelectedAlunoId(aluno.id);
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

  const handleSelecionarParaConferencia = (aluno: Aluno) => {
    setSelectedAlunoId(aluno.id);
    setModoConferencia(true);
    setEditandoId(null);
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
        if (selectedAlunoId === id) {
          limparFormulario();
        }
      } catch (error) {
        console.error('Erro ao excluir:', error);
        alert('Erro ao excluir registro.');
      }
    }
  };

  const limparFormulario = () => {
    setSelectedAlunoId(null);
    setModoConferencia(false);
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
      if (filtroTipo === 'professores') matchTipo = !!a.eProfessor;
      else if (filtroTipo === 'superintendentes') matchTipo = !!(a as any).eSuperintendente;
      else if (filtroTipo === 'alunos') matchTipo = !a.eProfessor && !(a as any).eSuperintendente;

      return matchBusca && matchClasse && matchTipo;
    })
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));

  return {
    alunos,
    loading,
    filtroClasse, setFiltroClasse,
    filtroTipo, setFiltroTipo,
    busca, setBusca,
    classesDisponiveis,
    selectedAlunoId,
    modoConferencia, setModoConferencia,
    editandoId, setEditandoId,
    nome, setNome,
    classe, setClasse,
    nascimento, setNascimento,
    casamento, setCasamento,
    telefone, setTelefone,
    cep, setCep,
    rua, setRua,
    numero, setNumero,
    complemento, setComplemento,
    bairro, setBairro,
    cidade, setCidade,
    eProfessor, setEProfessor,
    classeLeciona, setClasseLeciona,
    buscandoCep,
    mascaraTelefone,
    mascaraCep,
    handleCepBlur,
    handleSalvar,
    handleEditar,
    handleSelecionarParaConferencia,
    handleAlternarStatus,
    handleRemover,
    limparFormulario,
    alunosFiltrados
  };
}