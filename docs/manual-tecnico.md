# Manual Técnico e Visão Geral — Sistema EBD 3.0

**Versão:** Profissional 2.1
**Repositório:** [github.com/JuniorOrtunes/sistema-ebd3.0](https://github.com/JuniorOrtunes/sistema-ebd3.0)

> **Correção desta revisão:** a versão anterior mencionava "armazenamento local" na introdução, o que contradizia as seções de Stack Tecnológica e Fluxo de Dados do próprio documento. Esta versão corrige a inconsistência: o sistema usa **Firebase Firestore em nuvem**, com sincronização em tempo real.

---

## 1. Introdução

O **Sistema EBD 3.0** é uma solução de gestão voltada para a Escola Bíblica Dominical, focada em controle de alunos, turmas e métricas de frequência, com arquitetura moderna baseada em React e persistência em nuvem via Firebase Firestore, com sincronização de dados em tempo real.

---

## 2. Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Linguagem | TypeScript, React 19 |
| Build tool | Vite |
| Estilização | Tailwind CSS |
| Visualização de Dados | Recharts |
| Ícones | Lucide React |
| Banco de Dados | Firebase Firestore (NoSQL, tempo real via `onSnapshot`) |
| Autenticação e SDK | Firebase |

> Dependências confirmadas em `package.json` (raiz do repositório): `firebase ^12.17.1`, `recharts ^3.10.1`, `lucide-react`, `react ^19.2.8`, `react-dom ^19.2.8`, `clsx`, `tailwind-merge`.
>
> **Observação de arquitetura:** não há `react-router-dom` (ou equivalente) entre as dependências — a navegação entre telas é feita por **estado interno da aplicação**, não por rotas de URL. Isso é relevante para depurar comportamentos de navegação (ex.: sincronização do item ativo no menu lateral).

---

## 3. Guia de Instalação e Execução

1. **Pré-requisitos:** Node.js (v18+) e NPM/Yarn instalados.
2. **Clone o repositório:**
   ```bash
   git clone https://github.com/JuniorOrtunes/sistema-ebd3.0.git
   ```
3. **Instalar dependências:**
   ```bash
   npm install
   ```
4. **Executar em desenvolvimento:**
   ```bash
   npm run dev
   ```

---

## 4. Estrutura de Pastas (Arquitetura)

```
/src
  /components   # Componentes reutilizáveis (UI, Dashboards)
  /lib          # Lógica de negócio e tipos (ex: ebd.ts)
  /hooks        # Hooks customizados
  /pages        # Definições de páginas do sistema
```

> ⚠️ **Validação recomendada:** confirme esta estrutura diretamente no repositório antes de publicar. O acesso automatizado usado nesta revisão não permite navegar pastas internas do GitHub (robots.txt bloqueia `/tree/` e `/commits/`) — apenas arquivos individuais na raiz (`README.md`, `package.json`, `firestore.rules` etc.) puderam ser confirmados diretamente.

---

## 5. Fluxo de Dados e Persistência

O sistema utiliza o **Firebase Firestore** para sincronização em tempo real. A persistência é gerenciada via `onSnapshot`, garantindo que qualquer alteração nos módulos (Chamada, Classes, Alunos) reflita instantaneamente no Dashboard e nos Relatórios.

### 5.1 Coleções Firestore (confirmadas em `firestore.rules`)

| Coleção | Descrição |
|---|---|
| `alunos` | Cadastro de alunos |
| `classes` | Cadastro de turmas |
| `chamadas` | Registros de presença |
| `superintendentes` | Cadastro de superintendentes |
| `ebd_fechamentos` | **Fonte oficial** do histórico de Encerramento |
| `ebd_encerramento_dados` | Legado/Compatibilidade (não usar como fonte de verdade) |

> ⚠️ **Ponto de atenção:** não há uma coleção `hinos` explicitamente declarada em `firestore.rules` no momento da última verificação. Isso pode significar que ela está coberta pela regra genérica (`match /{document=**}`, que exige autenticação), ou que o arquivo de regras do repositório está desatualizado em relação à funcionalidade já publicada. Recomenda-se validar e, se necessário, adicionar uma regra dedicada para `hinos`, seguindo o mesmo padrão das demais coleções.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /chamadas/{document} { allow read, write: if true; }
    match /alunos/{document} { allow read, write: if true; }
    match /classes/{document} { allow read, write: if true; }
    match /superintendentes/{document} { allow read, write: if true; }

    // FONTE OFICIAL DO HISTÓRICO DE ENCERRAMENTO
    match /ebd_fechamentos/{document} { allow read, write: if true; }

    // Legado/Compatibilidade
    match /ebd_encerramento_dados/{document} { allow read, write: if true; }

    match /{document=**} { allow read, write: if request.auth != null; }
  }
}
```

> **Nota:** o LocalStorage é mantido apenas para estados temporários de interface e cache de login.

---

## 6. Padrões de Desenvolvimento (Git Flow)

- **Commits:** padrão `tipo(escopo): descrição` (ex: `fix(dashboard): corrige label`).
- **Branches:** manter a `main` estável. Funcionalidades devem ser desenvolvidas em branches separadas.

### Checklist de Desenvolvimento (antes de abrir PR)

- [ ] Segue o padrão de commits `tipo(escopo): descrição`.
- [ ] Não introduz nova coleção Firestore sem regra correspondente em `firestore.rules`.
- [ ] Novos ícones de ação usam `lucide-react`, consistentes com os já padronizados (Editar/Excluir).
- [ ] Cálculos de frequência/percentuais seguem a fórmula oficial (ver `regras-de-negocio.md`).
- [ ] Alterações em telas de Relatórios foram validadas contra os critérios de ordenação documentados.
- [ ] Testado o comportamento de navegação (sem `react-router-dom`, o estado de tela ativa deve ser tratado manualmente).

---

## 7. Estado Atual e Roadmap

### 7.1 Já Implementado

- ✅ Banco de dados e autenticação em nuvem via Firebase Firestore, com sincronização em tempo real (`onSnapshot`).
- ✅ Exportação de relatórios (Geral de Alunos e Aniversariantes) para PDF/impressão, via botão dedicado em cada tela.
- ✅ Módulo de Gestão de Hinos (`Cadastros > Hinos`), com listagem, cadastro, edição e exclusão — entrega referente à **Issue #29**.
- ✅ Padronização de ícones de ação (Editar/Excluir) via **Lucide React** nos componentes de listagem de Cadastros (Alunos, Classes, Superintendentes e Hinos).

### 7.2 Débito Técnico Conhecido (Issues abertas no repositório)

- Padronizar campos de referência de turmas (`classe` vs `turma`) no Firestore, evitando inconsistência de nomenclatura entre coleções.
- Implementar memoização nos cálculos dos gráficos do Dashboard, evitando re-renders desnecessários.
- Refatorar o processamento de dados do Dashboard para funções utilitárias puras, facilitando testes e manutenção.
- Adicionar tratamento de exceções e estados de erro nas escutas em tempo real (`onSnapshot`), melhorando a robustez em conexões instáveis.

### 7.3 Roadmap — Curto Prazo

- Exportação de relatórios para Excel (o PDF já está implementado; falta o formato Excel).
- Refinamento geral das telas de Relatórios (Geral de Alunos, Aniversariantes e Comparativos).

### 7.4 Roadmap — Médio Prazo

- **Escala Semestral:** geração e validação de escalas semestrais de professores e hinos, integrada ao fluxo de Encerramento.

### 7.5 Roadmap — Longo Prazo

- Integração com dispositivos móveis (PWA).

---

## 8. Manutenção e Suporte

Em caso de erros, inspecione o console do navegador (F12) para mensagens de erro do Firebase. Verifique também o painel do projeto no **Console do Firebase** para monitorar o status do banco de dados e as regras de segurança (Security Rules).