# Testes de integração apoiados por GenAI

## Cenário escolhido

O cenário de integração do Precifica é o fluxo entre a interface Vue, as regras de
precificação e o adaptador de `localStorage`:

1. o usuário preenche o formulário;
2. `App.vue` valida e transforma os valores digitados;
3. o domínio calcula o custo e o preço sugerido;
4. a lista é atualizada;
5. o `watch` persiste os itens em `localStorage`;
6. uma nova montagem da aplicação recupera os itens salvos.

Esse cenário foi escolhido porque testa a comunicação entre componentes sem depender
de backend ou dados reais.

## Prompt 1: geração de cenários de integração

```text
Você é um engenheiro de testes trabalhando no Precifica, uma SPA Vue 3 + TypeScript.
Gere cenários de teste de integração para o fluxo formulário -> domínio ->
localStorage -> nova montagem da aplicação.

Considere somente estas regras:
- custos: matéria-prima, embalagem, taxas administrativas e transporte;
- cada custo deve ser finito e maior ou igual a zero;
- margem entre 0% e 100%, inclusive;
- preço sugerido = custo total * (1 + margem / 100);
- a chave do localStorage é "precifica-itens-v1";
- preço sugerido é derivado, não persistido;
- dados válidos devem reaparecer após desmontar e montar o App novamente.

Produza uma matriz com: ID, pré-condições, ações do usuário, componentes
envolvidos, resultado observável e risco coberto. Inclua casos normais,
limites, edição, remoção, formulário inválido e persistência entre montagens.
Não invente API, backend ou autenticação.
```

### Casos gerados e revisados

| ID | Cenário | Resultado esperado |
|---|---|---|
| INT-01 | Cadastrar item válido | Item aparece com custo total e preço sugerido |
| INT-02 | Margem 0% | Preço sugerido é igual ao custo |
| INT-03 | Margem 100% | Preço sugerido é o dobro do custo |
| INT-04 | Todos os custos 0 | Item é aceito e preço sugerido é `R$ 0,00` |
| INT-05 | Formulário vazio | Mensagens de erro aparecem e nenhum item é salvo |
| INT-06 | Custo negativo | Campo correspondente é rejeitado |
| INT-07 | Editar item salvo | Lista mostra os dados atualizados |
| INT-08 | Remover item confirmado | Item desaparece da lista |
| INT-09 | Remontar aplicação | Item salvo reaparece após nova montagem |
| INT-10 | JSON inválido no storage | Aplicação inicia com lista vazia sem quebrar |

## Prompt 2: matriz de contratos e falhas de integração

```text
Atue como revisor de testes de integração do Precifica. A integração é interna:
App.vue chama as funções do domínio e persiste uma lista de Item no localStorage.

Para cada caso, informe: ID, dado inicial, interação, fronteira exercitada,
resultado esperado e critério de falha. Priorize contratos entre módulos:
- strings decimais com vírgula e ponto devem virar números;
- o domínio rejeita custos negativos, NaN e Infinity;
- a margem aceita exatamente 0 e 100;
- localStorage usa a chave "precifica-itens-v1";
- JSON inválido ou itens malformados não podem derrubar a aplicação;
- editar e remover devem refletir na lista e na persistência.

Inclua falhas de entrada, estado persistido corrompido, confirmação de remoção
negada e regressões que poderiam passar em testes unitários isolados.
Não proponha mudanças de regra de negócio.
```

### Casos gerados e revisados

| ID | Falha/contrato | Resultado esperado |
|---|---|---|
| INT-11 | Digitar `12,50` em um custo | Valor é interpretado como `12.5` |
| INT-12 | Digitar margem acima de 100 | Formulário não é salvo |
| INT-13 | Storage contém objeto em vez de array | Lista inicia vazia |
| INT-14 | Array contém item válido e item inválido | Apenas item válido é carregado |
| INT-15 | Usuário cancela confirmação de remoção | Item permanece na lista |
| INT-16 | Alterar item e remontar aplicação | Nova versão permanece persistida |
| INT-17 | Storage indisponível no ambiente sem `localStorage` | Módulo não falha durante execução |

## Ajustes feitos nos prompts

O primeiro prompt, sem as fronteiras explícitas, sugeriu cenários de API REST,
autenticação e sincronização com servidor. Esses cenários não pertencem ao MVP.
Por isso, acrescentei:

- a arquitetura real e os módulos envolvidos;
- a chave exata do `localStorage`;
- a fórmula e os limites inclusivos;
- a distinção entre preço derivado e dado persistido;
- a proibição explícita de backend, API e autenticação.

O segundo prompt inicialmente gerava apenas casos de validação unitária. Para
obter testes de integração, passei a exigir uma fronteira entre módulos e um
resultado observável na interface ou no storage. Também incluí estado corrompido,
confirmação de remoção e remontagem do componente.

## Validação no repositório

Os casos principais já estão cobertos pela suíte de integração de `App.vue` em
`src/__tests__/app.spec.ts`, especialmente:

- cadastro e limpeza do formulário;
- edição;
- remoção com confirmação;
- persistência entre montagens.

Os contratos do adaptador estão cobertos por `src/storage/itensLocal.spec.ts`,
incluindo JSON inválido, formato incorreto e filtragem de itens malformados.

Comandos executados:

```text
npm test
npm run lint
npm run build
```

Os três comandos devem permanecer como critério de aceite para alterações nesse
fluxo. A GenAI foi usada como copiloto para ampliar a diversidade dos cenários,
mas os casos foram revisados contra o código e contra as regras documentadas antes
de serem aceitos.

## Conclusão

O prompt de geração de cenários foi melhor para ampliar a cobertura funcional,
produzindo jornadas completas. O prompt de contratos e falhas foi melhor para
encontrar estados persistidos inválidos e diferenças entre módulos. A combinação
foi mais útil do que pedir genericamente “gere testes de integração”, porque
delimitou as fronteiras, os dados fictícios, os resultados observáveis e as regras
que não poderiam ser inventadas.
