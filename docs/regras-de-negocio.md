# Regras de Negócio e Glossário — Sistema EBD 3.0

**Versão:** 2.1

> **Nota de revisão:** este documento padroniza a nomenclatura de papéis de acesso (uso consistente de "Superintendente") e centraliza regras de cálculo antes dispersas em specs avulsas. Pontos sinalizados com ⚠️ indicam divergências observadas em QA que devem ser tratadas como prioridade de correção — não como mudança de regra.

---

## 1. Definições de Domínio (Glossário)

- **Aluno Ativo:** estudante regularmente matriculado que frequentou ou tem potencial de frequência no ciclo atual.
- **Aluno Inativo:** estudante que teve sua matrícula suspensa/encerrada. Seu histórico de presenças anteriores é preservado, mas ele deixa de ser contabilizado em novas chamadas.
- **Classe Ativa:** unidade de ensino operacional que possui horário, local e corpo docente designado. Uma classe só é considerada "Ativa" se tiver pelo menos um professor vinculado.
- **Encerramento de Aula:** procedimento administrativo que finaliza o registro de presença de uma data específica, travando novas edições e consolidando as estatísticas no Dashboard e nos Relatórios.
- **Superintendente:** papel de liderança com privilégios administrativos plenos sobre o sistema, incluindo reabertura de encerramentos e gestão de permissões.
- **Professor:** papel operacional restrito à sua(s) classe(s), com acesso à tela de chamada e ao lançamento de presenças.
- **Hino:** registro do repertório de cânticos utilizados nas aulas e cultos da EBD, gerenciado no módulo `Cadastros > Hinos` (cadastro, edição e exclusão pela liderança).

---

## 2. Papéis e Perfis de Acesso

O sistema distingue dois perfis principais de acesso, cada um com escopo de responsabilidade bem definido:

| Perfil | Escopo |
|---|---|
| **Professor** | Ministrar a aula e registrar a chamada da própria turma. Não acessa configurações estruturais (criação/edição de turmas, movimentação de alunos entre classes) nem relatórios consolidados da escola. |
| **Superintendente** | Acessa a visão completa da escola — Dashboard, todos os Relatórios, Comparativos, Cadastros e Encerramento — além de deter privilégios de auditoria, como a reabertura de um encerramento já realizado. |

Essa segregação de acesso não é uma limitação arbitrária: existe para manter o foco operacional do professor durante a aula e preservar a integridade dos dados estruturais da escola.

---

## 3. Regras Operacionais

**Controle de Status:** um aluno inativo não deve ser contabilizado nas métricas de "Matriculados Ativos" do Dashboard, mas seu histórico de presenças anteriores deve ser preservado e continuar visível nos relatórios já encerrados.

> ⚠️ **Ponto de atenção (QA):** foi observada, em teste de homologação, uma divergência em que um aluno marcado como "Inativo" no cadastro permaneceu aparecendo como "Ativo" no Relatório Geral de Alunos. A regra está corretamente definida aqui; a implementação deve ser validada/corrigida para garantir aderência a ela.

**Visitantes:** não são incluídos no registro de alunos matriculados, apenas na contagem estatística de presença do dia (indicador "Visitantes" do Dashboard).

**Privacidade e Acesso:** os dados são armazenados na nuvem (Google Firebase Firestore). O acesso ao sistema requer autenticação, e é restrito aos usuários da liderança da EBD (Professores e Superintendentes), seguindo as diretrizes de segurança configuradas nas regras do Firestore. O histórico operacional é centralizado, garantindo auditoria e integridade dos dados para todos os usuários autorizados.

---

## 4. Regras de Cálculo e Relatórios

Esta seção formaliza as regras de cálculo e apresentação usadas nos Relatórios e no Dashboard — referência única para desenvolvimento e QA.

### 4.1 Frequência (%)

```
Frequência (%) = (Total de Presentes ÷ Total de Matriculados) × 100
```

Aplica-se tanto ao indicador "Presença Geral" do Dashboard quanto às colunas "Frequência" das tabelas de Comparativos (Variação Semanal e Variação Mensal). Um valor de frequência não deve ser exibido de forma dissociada de seus componentes (Presentes/Matriculados); caso um dos dois seja zero, o percentual também deve refletir essa ausência de dados, e não um valor calculado incoerente.

### 4.2 Idade e Anos de Casados (Relatório de Aniversariantes)

A **Idade** exibida no Relatório de Aniversariantes é calculada a partir da data de nascimento do aluno em relação à data corrente (ou à data de referência do relatório, quando aplicável). O mesmo princípio se aplica a **Anos de Casados** na aba de Aniversariantes de Casamento, calculado a partir da data de casamento registrada.

### 4.3 Ordenação de Aniversariantes

- **Filtro por mês específico:** ordenação estrita pelo dia (1 a 31).
- **Filtro "Ver Ano Inteiro":** agrupamento primeiro por mês (Janeiro a Dezembro) e, dentro de cada mês, ordenação pelo dia (1 a 31).

### 4.4 Comparativos: Sala/Classe e Mês de Referência

- O filtro **Sala/Classe** permite alternar entre a visão consolidada (todas as salas) e a visão isolada de uma turma específica; quando uma turma é selecionada, todo o gráfico e a tabela devem refletir exclusivamente os dados dela.
- O filtro **Mês de Referência** deve atualizar instantaneamente o período analisado, tanto no gráfico quanto na tabela, com base nos dados sincronizados em tempo real com o Firebase.

---

## 5. Fluxos de Aprovação, Manutenção e Auditoria

**Alteração de Dados Históricos:** alterações retroativas em chamadas já encerradas devem ser feitas apenas por um **Superintendente** com privilégios de auditoria, através da reabertura formal do encerramento.

**Designação de Professores:** cada classe deve ter pelo menos um professor designado para ser considerada "Ativa" no sistema. Uma classe sem professor vinculado não deve ser contabilizada no indicador "Classes Ativas" do Dashboard.

**Critérios de Auditoria:**
- Toda alteração retroativa deve ficar restrita ao papel de Superintendente.
- A coleção `ebd_fechamentos` é a fonte oficial do histórico de encerramento; a coleção `ebd_encerramento_dados` é legado/compatibilidade e não deve ser usada como referência para novas funcionalidades.
- Presenças de alunos inativados não devem ser removidas do histórico — apenas o aluno deixa de ser elegível para novas chamadas.

---

## 6. Glossário de Módulos

- **Dashboard:** painel de indicadores e gráficos em tempo real.
- **Cadastros:** gestão de Alunos, Classes, Superintendentes e Hinos.
- **Relatórios:** Geral de Alunos, Aniversariantes e Comparativos.
- **Encerramento:** fechamento formal do registro de presença de uma aula/data.