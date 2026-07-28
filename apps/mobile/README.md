# HelpSenior Mobile

Aplicativo mobile do HelpSenior, desenvolvido com Expo e React Native.

## Funcionalidades

- autenticação com Firebase;
- início com resumo das informações;
- atividades;
- tarefas;
- lembretes;
- perfil;
- preferências de acessibilidade;
- persistência no Cloud Firestore.

## Executar

Na raiz do monorepo, instale as dependências:

```bash
pnpm install
```

Inicie o aplicativo:

```bash
pnpm --filter @helpsenior/mobile start
```

Leia o QR Code exibido no terminal com o aplicativo Expo Go. O Mobile é
executado apenas pelo Expo Go e não possui configuração de EAS Build, geração
de APK/AAB ou publicação na Play Store e na App Store.

## Variáveis de ambiente

Crie `apps/mobile/.env` com:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

## Notificações

O código possui suporte ao agendamento local de lembretes. No Android, as
notificações locais do `expo-notifications` não ficam disponíveis durante a
execução pelo Expo Go. Como o escopo atual usa somente o Expo Go, essa é uma
limitação conhecida da versão final.

## Testes e validação

Execute os testes automatizados do aplicativo:

```bash
pnpm --filter @helpsenior/mobile test
```

Durante o desenvolvimento, use o modo de observação:

```bash
pnpm --filter @helpsenior/mobile test:watch
```

Valide também os tipos e o lint:

```bash
pnpm --filter @helpsenior/mobile typecheck
pnpm --filter @helpsenior/mobile lint
```

## Entrega

O app Mobile não participa do CD. Não há build EAS nem publicação em lojas; a
entrega e a apresentação são feitas pelo Expo Go.

## Status

A aplicação Mobile está concluída para o escopo acadêmico atual.
