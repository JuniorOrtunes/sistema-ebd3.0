# Guia do Usuário — Sistema EBD 3.0

**Versão:** 2.1
**Público-alvo:** Liderança, Superintendentes e Professores da Escola Bíblica Dominical (EBD)

> **Nota de revisão:** alguns comportamentos aqui descritos representam o funcionamento pretendido/planejado das telas. Onde houver divergência entre o que está documentado e o que o sistema exibe em produção, trate como um ponto de atenção para validação de QA.
>
> **Atualização v2.1:** esta revisão incorpora a ativação oficial do módulo de Gestão de Hinos (`Cadastros > Hinos`) e a padronização de ícones de ação (Editar/Excluir) nas telas de Cadastros — entregas referentes à Issue #29 do repositório.

---

## 1. Introdução e Visão Geral

Este guia detalha a operação, a estratégia e a governança do Sistema EBD 3.0. O objetivo é garantir que cada funcionalidade seja utilizada em sua plenitude para a gestão de alta performance da Escola Bíblica Dominical.

Esta versão reflete a estrutura unificada de **Relatórios** (Geral de Alunos, Aniversariantes e Comparativos), os indicadores atuais do **Dashboard** e a ativação do módulo de **Hinos**.

---

## 2. Estrutura do Menu Principal

O menu lateral (Sidebar) organiza o sistema em quatro grandes áreas:

- **Dashboard** — painel inicial com indicadores e gráficos em tempo real.
- **Cadastros** — gestão de Alunos, Classes, Superintendentes e Hinos (módulo ativo).
- **Relatórios** — Geral de Alunos, Aniversariantes e Comparativos.
- **Encerramento** — fechamento formal das aulas/chamadas.

> 📷 `PRINT AQUI: menu lateral (Sidebar) completo, com todos os itens expandidos`
> `![Sidebar completa](./assets/sidebar-completa.png)`

---

## 3. O Dashboard: Anatomia dos Indicadores e Gráficos

O Dashboard não é apenas um painel de visualização — é a bússola da superintendência. Ele é dividido em dois blocos: **Cartões de Indicadores** (topo) e **Gráficos de Diagnóstico** (abaixo).

### 3.1 Cartões de Indicadores

- **Alunos Matriculados** — total de alunos cadastrados no sistema (ativos e inativos).
- **Presentes na Última Aula** — quantidade de presenças registradas na chamada mais recente.
- **Visitantes** — total de visitantes registrados no período.
- **Classes Ativas** — número de turmas em funcionamento.
- **Professores** — total de professores cadastrados.
- **Presença Geral (%)** — percentual consolidado de frequência da escola.

> 📷 `PRINT AQUI: linha de cartões de indicadores no topo do Dashboard`
> `![Cartões de indicadores](./assets/dashboard-cartoes.png)`

### 3.2 Gráficos de Diagnóstico

#### Frequência por Classe (superior esquerdo)
- **O que é:** gráfico de linha com o percentual de frequência de cada turma cadastrada (01 a 09).
- **Para que serve:** comparar rapidamente o desempenho relativo entre as classes.

#### Alunos por Classe (superior direito)
- **O que é:** gráfico de barras com a distribuição quantitativa de alunos matriculados por turma.
- **Para que serve:** visão imediata da lotação de cada classe.

#### % Presença por Aula (inferior esquerdo)
- **O que é:** gráfico de barras com a taxa percentual de assiduidade (comparecimento em relação ao total de matriculados) por aula/turma.
- **Para que serve:** termômetro de constância e engajamento em domingos específicos.

#### Evolução de Frequência (inferior direito)
- **O que é:** gráfico de linha temporal com a curva de presenças gerais ao longo das datas.
- **Para que serve:** analisar tendências de longo prazo (crescimento, sazonalidade).

> 📷 `PRINT AQUI: os quatro gráficos do Dashboard`
> `![Gráficos do Dashboard](./assets/dashboard-graficos.png)`

---

## 4. Módulo de Relatórios

### 4.1 Relatório Geral de Alunos

Lista completa de todos os alunos cadastrados, com filtros e ações de gestão rápida.

- **Colunas:** Nome do Aluno, Classe, Telefone, Status (Ativo/Inativo).
- **Filtros:** Classe, Tipo de Perfil, Busca por Nome.
- **Ações por linha:** Ativar/Desativar, Editar, Excluir.
- **Botão "Imprimir / Salvar PDF":** gera uma versão pronta para impressão em A4, com cabeçalho institucional.

> 📷 `PRINT AQUI: tela do Relatório Geral de Alunos`
> `![Relatório Geral de Alunos](./assets/relatorio-geral-alunos.png)`

### 4.2 Relatório de Aniversariantes

Acompanha aniversários de nascimento e casamento por classe e período, com duas abas: **Aniversariantes de Nascimento** e **Aniversariantes de Casamento**.

- **Filtros:** Classe (com opção "Todas as Classes"), Mês de referência, checkbox **"Ver Ano Inteiro"**.
- **Colunas:** Nome, Classe, Data de Aniversário, Idade (ou Anos de Casados, na aba de Casamento).
- **Resumo:** total de aniversariantes do período filtrado.
- **Botão "PDF / Imprimir":** layout A4 dedicado, com cabeçalho institucional, linhas zebradas e rodapé paginado.

**Critérios de ordenação:**
- Mês específico → ordenado estritamente pelo dia (1 a 31).
- "Ver Ano Inteiro" → agrupado por mês (Janeiro a Dezembro) e, dentro de cada mês, ordenado pelo dia.

> 📷 `PRINT AQUI: Aniversariantes com um mês específico selecionado`
> `![Aniversariantes por mês](./assets/aniversariantes-mes.png)`
>
> 📷 `PRINT AQUI: Aniversariantes com "Ver Ano Inteiro" marcado`
> `![Aniversariantes ano inteiro](./assets/aniversariantes-ano.png)`

### 4.3 Comparativos: Inteligência de Dados

Enquanto o Dashboard mostra o hoje, os "Comparativos" analisam o histórico, com duas visões: **Semana a Semana** e **Mês a Mês**.

**Visão "Semana a Semana" (foco nos domingos do mês):**
- Gráfico de colunas por turma (01 a 09), cada uma com cor exclusiva.
- Tooltip revela nome completo da turma e percentual exato.
- Tabela de Variação Semanal: Presentes, Matriculados, Frequência e "Vs. Domingo Anterior" por domingo.

**Visão "Mês a Mês" (foco na tendência de longo prazo):**
- Gráfico de colunas mensais, comparando blocos de meses (ex: Junho, Julho, Agosto).
- Tabela de Variação Mensal: acumulado histórico por mês.

**Governança dos filtros:**
- **Sala / Classe:** alterna entre visão consolidada e isolamento de uma turma específica.
- **Mês de Referência:** atualiza instantaneamente gráfico e tabela, com dados sincronizados em tempo real via Firebase.

> 📷 `PRINT AQUI: Comparativos — Semana a Semana`
> `![Comparativos semanal](./assets/comparativos-semanal.png)`
>
> 📷 `PRINT AQUI: Comparativos — Mês a Mês`
> `![Comparativos mensal](./assets/comparativos-mensal.png)`

---

## 5. Gestão de Cadastros

### 5.1 Alunos: o Ciclo de Vida

1. **Novo Cadastro:** nome completo, data de nascimento e classe inicial.
2. **Manutenção:** ao inativar um aluno, o histórico de presenças passadas é preservado — o aluno não "some" dos relatórios antigos.

> 📷 `PRINT AQUI: formulário de cadastro/edição de aluno`
> `![Cadastro de aluno](./assets/cadastro-aluno.png)`
>
> 📷 `PRINT AQUI: listagem de alunos, com ações de Ativar/Desativar`
> `![Listagem de alunos](./assets/listagem-alunos.png)`

### 5.2 Classes: Estrutura Escolar

Cada classe precisa estar vinculada a pelo menos um professor. O sistema usa essa vinculação para o professor localizar sua turma automaticamente na tela de chamada.

> 📷 `PRINT AQUI: tela de gestão de Classes`
> `![Gestão de Classes](./assets/gestao-classes.png)`

### 5.3 Superintendentes

Cadastro dos superintendentes responsáveis pela gestão administrativa da EBD, com controle de permissões de acesso.

> 📷 `PRINT AQUI: tela de Superintendentes`
> `![Superintendentes](./assets/superintendentes.png)`

### 5.4 Hinos (módulo ativo)

Módulo para gestão do repertório de hinos utilizados nas aulas e cultos da EBD, acessível em `Cadastros > Hinos`.

- **Listagem:** exibe todos os hinos cadastrados.
- **Cadastro:** adiciona um novo hino ao repertório.
- **Edição e Exclusão:** ações rápidas por linha, com ícones padronizados (Lucide React), seguindo o mesmo padrão visual das demais telas de Cadastros.

> 📷 `PRINT AQUI: listagem de Hinos, com as ações de Editar e Excluir visíveis`
> `![Listagem de Hinos](./assets/listagem-hinos.png)`
>
> 📷 `PRINT AQUI: formulário de cadastro/edição de um Hino`
> `![Cadastro de Hino](./assets/cadastro-hino.png)`

---

## 6. O Encerramento: Fluxo Detalhado e Segurança

O "Encerramento" é o evento que sela a integridade dos dados:

- **Sincronização:** ao clicar em "Encerrar Aula", os dados saem do estado "editável" e são movidos para o banco de dados oficial de relatórios.
- **Bloqueio de Edição:** uma vez encerrada, a chamada é bloqueada para o professor — vital para auditoria, pois evita alterações após o fechamento do dia.

> 📷 `PRINT AQUI: tela de Encerramento de Aula, antes e depois de encerrada`
> `![Encerramento de Aula](./assets/encerramento-aula.png)`

---

## 7. Governança e Acessos

### Por que professores não acessam tudo?

- **Foco Operacional:** o professor se concentra em ministrar a aula e registrar a chamada, não em configurar turmas ou analisar relatórios globais.
- **Integridade de Dados:** evita que configurações estruturais (deletar turma, mover aluno de classe) sejam feitas por acidente durante o uso diário.

### Tela Superintendente

Centraliza os ajustes finos (permissões e gestão de usuários), garantindo à superintendência o controle total da EBD.

> 📷 `PRINT AQUI: tela de permissões/gestão de usuários do Superintendente`
> `![Permissões do Superintendente](./assets/permissoes-superintendente.png)`

---

## 8. Roadmap: Próximas Funcionalidades

- **Escala Semestral:** geração e validação de escalas semestrais de professores e hinos, integrada ao fluxo de Encerramento.
- **Melhorias de estabilidade:** tratamento de exceções e estados de erro nas sincronizações em tempo real, para maior robustez em conexões instáveis.

---

## 9. FAQ de Excelência

**Como corrigir algo após encerrar?**
Apenas um Superintendente com privilégios de auditoria pode reabrir um encerramento.

**A internet caiu?**
O sistema é robusto, mas precisa de sinal para salvar o "encerramento". O cache local mantém o que foi marcado até a reconexão.

**Onde vejo o histórico de um aluno inativado?**
O histórico de presenças de um aluno inativado permanece disponível nos relatórios já encerrados; a inativação apenas remove o aluno das chamadas futuras.