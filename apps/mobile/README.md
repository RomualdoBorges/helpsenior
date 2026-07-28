# HelpSenior Mobile

Aplicativo mobile do HelpSenior, desenvolvido com Expo e React Native.

## Executar

Na raiz do monorepo, instale as dependências:

```bash
pnpm install
```

Inicie o aplicativo:

```bash
pnpm --filter @helpsenior/mobile start
```

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
