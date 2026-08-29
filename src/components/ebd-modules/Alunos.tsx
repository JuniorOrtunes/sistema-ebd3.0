import { useAlunos } from '../../hooks/useAlunos';
import { AlunoModal } from './AlunoModal';
import { AlunosFilter } from './AlunosFilter';
import { AlunosTable } from './AlunosTable';

export function Alunos() {
  const {
    loading,
    alunosFiltrados,
    classesDisponiveis,
    filtroClasse, setFiltroClasse,
    filtroTipo, setFiltroTipo,
    busca, setBusca,
    editandoId,
    modoConferencia,
    selectedAlunoId,
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
    handleRemover,
    handleAlternarStatus,
    handleSelecionarParaConferencia,
    limparFormulario
  } = useAlunos();

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden">
      <AlunoModal 
        editandoId={editandoId}
        modoConferencia={modoConferencia}
        selectedAlunoId={selectedAlunoId}
        nome={nome} setNome={setNome}
        classe={classe} setClasse={setClasse}
        classesDisponiveis={classesDisponiveis}
        nascimento={nascimento} setNascimento={setNascimento}
        casamento={casamento} setCasamento={setCasamento}
        telefone={telefone} setTelefone={setTelefone}
        cep={cep} setCep={setCep}
        rua={rua} setRua={setRua}
        numero={numero} setNumero={setNumero}
        complemento={complemento} setComplemento={setComplemento}
        bairro={bairro} setBairro={setBairro}
        cidade={cidade} setCidade={setCidade}
        eProfessor={eProfessor} setEProfessor={setEProfessor}
        classeLeciona={classeLeciona} setClasseLeciona={setClasseLeciona}
        buscandoCep={buscandoCep}
        mascaraTelefone={mascaraTelefone}
        mascaraCep={mascaraCep}
        handleCepBlur={handleCepBlur}
        handleSalvar={handleSalvar}
        handleEditar={handleEditar}
        limparFormulario={limparFormulario}
        alunosFiltrados={alunosFiltrados}
      />

      <div className="flex-none pb-2">
        <AlunosFilter 
          filtroClasse={filtroClasse}
          setFiltroClasse={setFiltroClasse}
          filtroTipo={filtroTipo}
          setFiltroTipo={setFiltroTipo}
          busca={busca}
          setBusca={setBusca}
          classesDisponiveis={classesDisponiveis}
        />
      </div>

      <AlunosTable 
        loading={loading}
        alunosFiltrados={alunosFiltrados}
        selectedAlunoId={selectedAlunoId}
        handleSelecionarParaConferencia={handleSelecionarParaConferencia}
        handleAlternarStatus={handleAlternarStatus}
        handleEditar={handleEditar}
        handleRemover={handleRemover}
      />
    </div>
  );
}