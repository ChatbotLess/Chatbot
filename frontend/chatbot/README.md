# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Testes E2E com Cypress

Instale as dependencias do frontend antes de rodar os testes:

```bash
npm install
```

Para executar a suite Cypress em modo headless:

```bash
npm run test:e2e
```

Esse comando sobe o Vite em `http://127.0.0.1:5173` com `VITE_E2E_AUTH=true` e executa os testes mockando backend e autenticacao.

Para abrir o Cypress em modo interativo, inicie o servidor E2E em um terminal:

```bash
npm run dev:e2e
```

Em outro terminal, abra o Cypress:

```bash
npm run cy:open
```

Use `npm run dev` para testar a aplicacao local normalmente com Firebase/backend reais. O comando `dev:e2e` e exclusivo para os testes automatizados.
