# Painel administrativo

Acesse `/admin` com um usuário de perfil `admin`. O login desse perfil abre o painel automaticamente, e o menu Administração permite voltar a ele.

- **Usuários:** busca, filtro por perfil, ordenação e paginação.
- **Veículos e remessas:** busca, ordenação, ações em menu e confirmação de exclusão; remessas também têm filtros de status e período e um painel lateral de detalhes.
- **Visão geral:** indicadores calculados sobre todas as páginas da API, distribuição de status e remessas recentes. Falhas de carregamento aparecem como dados indisponíveis, sem simular totais.
- **Layout:** menu recolhível no desktop, menu móvel, listas em cartões em telas menores e temas claro/escuro com preferência salva neste navegador.
- Os detalhes mostram os dados disponíveis de motorista e veículo, criação e última atualização. A API atual não fornece um histórico completo de eventos nem um estado de disponibilidade da frota.
- A rota verifica a autorização em `GET /api/admin/session` antes de exibir o painel. O backend valida o JWT e consulta o perfil atual no banco. `/api/users` também exige essa autorização.

O backend na porta 3000 deve ter a proteção administrativa. Nesta configuração, a cópia ativa é `../logistics-backend.worktrees/resumo-completo-opiniao`. A API usa `vehicleModel`, status de remessa em inglês e cadastro de remessa por referência, cliente e endereço. A listagem aceita respostas em array ou envelope paginado. Os testes usam as dependências instaladas em `../logistics-backend`:

```sh
node --import ../logistics-backend/node_modules/tsx/dist/loader.mjs --test tests/admin-access.test.mjs tests/collections.test.mjs
npm run build
```

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
