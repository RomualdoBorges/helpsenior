# HelpSenior

HelpSenior é uma aplicação Web e Mobile focada em acessibilidade para pessoas idosas. A proposta é ajudar o usuário a organizar atividades, tarefas, lembretes, perfil e preferências visuais de forma simples, clara e previsível.

O projeto está organizado como um monorepo com separação entre domínio, infraestrutura Firebase e aplicações Web e Mobile.

> Projeto acadêmico concluído no escopo descrito neste documento.

## Stack

```txt
pnpm
Turbo
TypeScript
React
Vite
Tailwind CSS
React Router
React Native
Expo
Firebase Authentication
Cloud Firestore
Vitest
```

## Arquitetura

```txt
@helpsenior/core
        ↓
@helpsenior/firebase
        ↓
@helpsenior/web e @helpsenior/mobile
```

- `@helpsenior/core`: entidades, contratos de repositório, casos de uso, regras de negócio e testes unitários.
- `@helpsenior/firebase`: serviços Firebase, repositórios Firestore e mappers entre Firestore e domínio.
- `@helpsenior/web`: interface React, rotas, hooks, componentes, autenticação e aplicação das preferências de acessibilidade.
- `@helpsenior/mobile`: aplicativo React Native com Expo para acesso às principais funcionalidades em dispositivos móveis.

## Decisão de produto

```txt
Tarefa = o que precisa ser feito
Lembrete = quando avisar e repetir
```

Por isso, tarefas não possuem recorrência. Recorrência existe apenas em lembretes.

## Funcionalidades atuais

### Autenticação

- cadastro com nome completo, e-mail, senha e confirmação de senha;
- login com e-mail e senha;
- logout;
- recuperação de senha por e-mail pelo Firebase Authentication;
- persistência de sessão;
- criação/atualização automática do perfil após cadastro;
- exibição do nome do usuário na barra superior;
- mensagens amigáveis para erros de autenticação.

### Atividades

- criar atividades como guias para situações do dia a dia;
- informar título e descrição;
- organizar cada atividade em etapas;
- listar, buscar, editar e excluir atividades;
- vincular atividades às tarefas;
- persistir atividades no Cloud Firestore.

### Tarefas

- criar tarefas com título obrigatório;
- informar descrição opcional;
- informar data opcional;
- listar tarefas do usuário logado;
- filtrar tarefas por todas, pendentes, concluídas e com data;
- exibir resumo de tarefas pendentes, concluídas e com data;
- editar tarefas pendentes;
- concluir tarefas;
- excluir tarefas;
- persistir tarefas no Cloud Firestore.

### Lembretes

- criar lembretes com título e data;
- informar descrição e horário opcionais;
- criar lembretes recorrentes;
- informar data final da recorrência;
- listar, ordenar e filtrar lembretes;
- exibir resumo de vencidos, pendentes, recorrentes e concluídos;
- editar lembretes pendentes;
- concluir lembretes;
- excluir lembretes;
- persistir lembretes no Cloud Firestore.

Recorrências disponíveis:

```txt
Sem recorrência
Todos os dias
Toda semana
Todo mês
```

Ao concluir um lembrete recorrente, o lembrete atual é marcado como concluído e o próximo lembrete é criado automaticamente quando ainda está dentro da data final configurada.

### Alertas e notificações

- alerta visual para lembretes vencidos dentro do app;
- notificação do navegador para lembretes vencidos com o app aberto;
- pedido de permissão de notificações no navegador;
- verificação automática de lembretes a cada minuto.

Ainda não há Service Worker nem Firebase Cloud Messaging, então as notificações não funcionam com o app fechado.

### Perfil

O perfil do usuário salva:

```txt
Nome
E-mail
Telefone
Data de nascimento
```

### Preferências de acessibilidade

Preferências persistidas por usuário:

```txt
Tamanho da fonte
Alto contraste
Modo simples
Redução de animações
Espaçamento maior
```

## Rotas Web

```txt
/               → Início
/atividades     → Atividades
/tarefas        → Tarefas
/lembretes      → Lembretes
/perfil         → Perfil do usuário
/configuracoes  → Preferências de acessibilidade
```

## Estrutura

```txt
apps/
├── mobile/
└── web/

packages/
├── core/
└── firebase/
```

## Firebase

O projeto usa:

```txt
Firebase Authentication
Cloud Firestore
```

Método de autenticação:

```txt
E-mail/senha
```

Coleções usadas:

```txt
activities
tasks
reminders
userPreferences
userProfiles
```

## Variáveis de ambiente

Crie o arquivo:

```txt
apps/web/.env
```

Com:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## Instalação

```bash
pnpm install
```

## Rodando o app Web

```bash
pnpm --filter @helpsenior/web dev
```

Por padrão, o Vite sobe em:

```txt
http://localhost:5173
```

## Rodando o app Mobile

O app Mobile é executado apenas pelo Expo Go durante o desenvolvimento:

```bash
pnpm --filter @helpsenior/mobile start
```

Depois de iniciar o Expo, leia o QR Code exibido no terminal com o aplicativo
Expo Go. Não fazem parte do escopo atual builds com EAS, geração de APK/AAB ou
publicação na Play Store e na App Store.

## Scripts principais

```bash
pnpm dev
pnpm build
pnpm lint
pnpm test
pnpm typecheck
pnpm --filter @helpsenior/core test
pnpm --filter @helpsenior/web dev
pnpm --filter @helpsenior/web build
pnpm --filter @helpsenior/web test
pnpm --filter @helpsenior/web test:integration
pnpm --filter @helpsenior/web test:e2e
pnpm --filter @helpsenior/firebase typecheck
```

## Testes

O pacote `@helpsenior/core` possui testes unitários com Vitest para:

- tarefas;
- lembretes;
- lembretes recorrentes;
- preferências de acessibilidade;
- perfil do usuário.

O app `@helpsenior/web` possui:

- testes unitários para utilitários, componentes e hooks;
- testes de integração para páginas de atividades, tarefas e lembretes;
- testes E2E com Playwright e Chromium, incluindo uma jornada autenticada com
  Firebase Emulator.

Para preparar e executar os testes E2E:

```bash
pnpm --filter @helpsenior/web exec playwright install chromium
pnpm test:e2e:emulator
```

Os testes E2E usam os emuladores locais do Firebase Authentication e Cloud
Firestore. É necessário ter Java 21 ou superior instalado. A jornada autenticada
cria uma conta, uma atividade, uma tarefa vinculada, um lembrete e uma
preferência de acessibilidade, depois entra novamente para confirmar a
persistência dos dados.

## Integração contínua

O workflow `.github/workflows/ci.yml` executa lint, typecheck, testes, build e E2E em pull requests e pushes para `main`. O relatório do Playwright fica disponível como artefato da execução.

## Entrega contínua

Depois que os jobs de qualidade e E2E terminam com sucesso em um push para
`main`, o mesmo workflow gera o build de produção e publica o app Web no canal
`live` do Firebase Hosting. O app Mobile não participa do CD e continua
disponível apenas pelo Expo Go.

Crie no GitHub o environment `production` e configure:

Secret:

```txt
FIREBASE_SERVICE_ACCOUNT
VITE_FIREBASE_API_KEY
```

Variables:

```txt
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

O valor de `FIREBASE_SERVICE_ACCOUNT` deve ser o JSON completo da conta de
serviço usada pelo GitHub Actions para publicar no Firebase Hosting. O Firebase
CLI pode criar a conta e cadastrar o secret com:

```bash
pnpm exec firebase init hosting:github
```

Ao executar o comando, mantenha a configuração de Hosting já existente e use o
mesmo nome de secret documentado acima no workflow.

## Status atual

O HelpSenior está concluído para o escopo acadêmico atual. A versão final inclui
os pacotes de domínio e Firebase, a aplicação Web com entrega contínua no
Firebase Hosting e a aplicação Mobile executada pelo Expo Go.

As limitações abaixo representam decisões de escopo da versão final, e não
funcionalidades pendentes para a conclusão do projeto.

## Limitações atuais

- não há notificações com app fechado;
- não há Service Worker;
- não há Firebase Cloud Messaging;
- não há login social;
- não há build EAS, APK/AAB ou publicação do Mobile em lojas.

## Licença

Este projeto foi criado para fins acadêmicos e de estudo.
