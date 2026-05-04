# Precifica

**Precifica** é uma aplicação web para ajudar a definir o **preço de venda sugerido** de itens a partir do **custo** e de uma **margem percentual**. O objetivo é um fluxo simples e rápido no navegador: cadastrar itens, ver o preço calculado e evoluir depois para um produto mais completo.

Hoje o repositório contém o **esqueleto inicial** (Vue 3 com Vite e TypeScript), testes e lint já configurados; as telas de precificação e a lógica de negócio vêm nas próximas entregas.

## Rodar localmente

```bash
npm install
npm run dev
```

Outros scripts úteis: `npm run build`, `npm run test`, `npm run lint`, `npm run preview` (pré-visualiza o build de produção).

## Como a IA apoiou

A IA foi usada como **apoio estrutural e de texto**, não como substituto de revisão humana:

- **Planejamento**: ajuda a organizar o MVP em fases, backlog por épicos e mensagens de commit no padrão *Conventional Commits*.
- **Boilerplate**: sugestão de comandos e estrutura inicial do projeto (por exemplo separação entre `vite.config.ts` e `vitest.config.ts` para evitar conflitos de tipos entre Vite e Vitest).
- **Documentação**: rascunho de README e descrição do repositório; o conteúdo foi **lido e ajustado** para refletir o que de fato foi feito e como o trabalho foi validado (`npm run build`, `npm run test`, `npm run lint`).

O que a IA **não** substitui: decisões de produto (regra de margem, limites de campos), revisão de fórmulas e garantia de que o código atende ao que você precisa entregar — isso continua sendo da sua validação e dos testes.
