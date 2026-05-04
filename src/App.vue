<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Item } from './domain/item'
import { novoIdItem } from './domain/item'
import {
  calcularPrecoVenda,
  validarItemParaCadastro,
  formularioTemErros,
  parseNumeroDecimal,
  somarComponentesCusto,
  type ErrosFormularioItem,
} from './domain/precificacao'

const itens = ref<Item[]>([])
const nome = ref('')
const materiaPrimaStr = ref('')
const embalagemStr = ref('')
const taxasStr = ref('')
const transporteStr = ref('')
const margemStr = ref('')
const erros = ref<ErrosFormularioItem>({})

const custoPreview = computed<number | null>(() => {
  const materiaPrima = parseNumeroDecimal(materiaPrimaStr.value)
  const embalagem = parseNumeroDecimal(embalagemStr.value)
  const taxasAdministrativas = parseNumeroDecimal(taxasStr.value)
  const transporte = parseNumeroDecimal(transporteStr.value)
  const nums = [materiaPrima, embalagem, taxasAdministrativas, transporte]
  if (!nums.every((n) => Number.isFinite(n) && n >= 0)) return null
  return somarComponentesCusto({
    materiaPrima,
    embalagem,
    taxasAdministrativas,
    transporte,
  })
})

function ariaDesc(hintIds: string | string[], erroId?: string): string {
  const hints = Array.isArray(hintIds) ? hintIds : [hintIds]
  return [...hints, erroId].filter(Boolean).join(' ')
}

function formatarMoedaSimples(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function adicionarItem(): void {
  erros.value = {}
  const componentesCusto = {
    materiaPrima: parseNumeroDecimal(materiaPrimaStr.value),
    embalagem: parseNumeroDecimal(embalagemStr.value),
    taxasAdministrativas: parseNumeroDecimal(taxasStr.value),
    transporte: parseNumeroDecimal(transporteStr.value),
  }
  const margemPercentual = parseNumeroDecimal(margemStr.value)
  const validacao = validarItemParaCadastro({
    nome: nome.value,
    componentesCusto,
    margemPercentual,
  })
  if (formularioTemErros(validacao)) {
    erros.value = validacao
    return
  }
  itens.value = [
    ...itens.value,
    {
      id: novoIdItem(),
      nome: nome.value.trim(),
      componentesCusto,
      margemPercentual,
    },
  ]
  nome.value = ''
  materiaPrimaStr.value = ''
  embalagemStr.value = ''
  taxasStr.value = ''
  transporteStr.value = ''
  margemStr.value = ''
}

function custoTotalItem(item: Item): number {
  return somarComponentesCusto(item.componentesCusto)
}

function precoExibicao(item: Item): string {
  const custo = custoTotalItem(item)
  return formatarMoedaSimples(calcularPrecoVenda(custo, item.margemPercentual))
}
</script>

<template>
  <main class="app">
    <header class="hero">
      <h1>Precifica</h1>
      <p class="tagline">
        Monte o custo unitário por componentes, defina a margem e veja o preço sugerido.
      </p>
    </header>

    <form
      class="form"
      novalidate
      @submit.prevent="adicionarItem"
    >
      <h2 class="section-title">
        Novo item
      </h2>

      <div
        class="formula-box"
        role="note"
      >
        <strong class="formula-titulo">Como o preço é formado</strong>
        <p class="formula-texto">
          O <strong>custo unitário</strong> é a soma de matéria-prima, embalagem, taxas administrativas e
          transporte (todos em reais por unidade). O <strong>preço sugerido</strong> aplica a margem sobre esse
          total: custo × (1 + margem ÷ 100).
        </p>
      </div>

      <p
        v-if="formularioTemErros(erros)"
        class="alert"
        role="alert"
      >
        Corrija os campos destacados.
      </p>

      <div class="field">
        <label for="item-nome">Nome do item</label>
        <input
          id="item-nome"
          v-model="nome"
          type="text"
          name="nome"
          autocomplete="off"
          data-testid="nome"
          class="input"
          :class="{ invalid: Boolean(erros.nome) }"
          :aria-invalid="Boolean(erros.nome)"
          :aria-describedby="ariaDesc('hint-nome', erros.nome ? 'err-nome' : undefined)"
        >
        <p
          id="hint-nome"
          class="field-hint"
        >
          Nome para identificar o produto na lista.
        </p>
        <span
          v-if="erros.nome"
          id="err-nome"
          class="field-error"
        >{{ erros.nome }}</span>
      </div>

      <fieldset class="custo-fieldset">
        <legend class="fieldset-legend">
          Composição do custo unitário (R$)
        </legend>
        <p
          id="hint-custo-grupo"
          class="field-hint field-hint-grupo"
        >
          Preencha cada parte do que custa uma unidade do item. Use zero quando não houver aquele custo.
        </p>

        <div class="grid-custo">
          <div class="field">
            <label for="item-mp">Matéria-prima / ingredientes</label>
            <input
              id="item-mp"
              v-model="materiaPrimaStr"
              type="text"
              inputmode="decimal"
              data-testid="materia-prima"
              class="input"
              :class="{ invalid: Boolean(erros.materiaPrima) }"
              :aria-invalid="Boolean(erros.materiaPrima)"
              :aria-describedby="ariaDesc(['hint-custo-grupo', 'hint-mp'], erros.materiaPrima ? 'err-mp' : undefined)"
            >
            <p
              id="hint-mp"
              class="field-hint"
            >
              Insumos por unidade (R$).
            </p>
            <span
              v-if="erros.materiaPrima"
              id="err-mp"
              class="field-error"
            >{{ erros.materiaPrima }}</span>
          </div>

          <div class="field">
            <label for="item-embalagem">Embalagem</label>
            <input
              id="item-embalagem"
              v-model="embalagemStr"
              type="text"
              inputmode="decimal"
              data-testid="embalagem"
              class="input"
              :class="{ invalid: Boolean(erros.embalagem) }"
              :aria-invalid="Boolean(erros.embalagem)"
              :aria-describedby="ariaDesc(['hint-custo-grupo', 'hint-embalagem'], erros.embalagem ? 'err-embalagem' : undefined)"
            >
            <p
              id="hint-embalagem"
              class="field-hint"
            >
              Sacolas, caixas, rótulos etc. por unidade (R$).
            </p>
            <span
              v-if="erros.embalagem"
              id="err-embalagem"
              class="field-error"
            >{{ erros.embalagem }}</span>
          </div>

          <div class="field">
            <label for="item-taxas">Taxas administrativas</label>
            <input
              id="item-taxas"
              v-model="taxasStr"
              type="text"
              inputmode="decimal"
              data-testid="taxas"
              class="input"
              :class="{ invalid: Boolean(erros.taxasAdministrativas) }"
              :aria-invalid="Boolean(erros.taxasAdministrativas)"
              :aria-describedby="ariaDesc(['hint-custo-grupo', 'hint-taxas'], erros.taxasAdministrativas ? 'err-taxas' : undefined)"
            >
            <p
              id="hint-taxas"
              class="field-hint"
            >
              Rateio por unidade (ex.: parte fixa diluída na produção).
            </p>
            <span
              v-if="erros.taxasAdministrativas"
              id="err-taxas"
              class="field-error"
            >{{ erros.taxasAdministrativas }}</span>
          </div>

          <div class="field">
            <label for="item-transporte">Transporte</label>
            <input
              id="item-transporte"
              v-model="transporteStr"
              type="text"
              inputmode="decimal"
              data-testid="transporte"
              class="input"
              :class="{ invalid: Boolean(erros.transporte) }"
              :aria-invalid="Boolean(erros.transporte)"
              :aria-describedby="ariaDesc(['hint-custo-grupo', 'hint-transporte'], erros.transporte ? 'err-transporte' : undefined)"
            >
            <p
              id="hint-transporte"
              class="field-hint"
            >
              Frete ou logística atribuída a cada unidade vendida.
            </p>
            <span
              v-if="erros.transporte"
              id="err-transporte"
              class="field-error"
            >{{ erros.transporte }}</span>
          </div>
        </div>

        <p
          v-if="custoPreview !== null"
          class="custo-preview"
          aria-live="polite"
        >
          Custo unitário (soma): <strong>{{ formatarMoedaSimples(custoPreview) }}</strong>
        </p>
      </fieldset>

      <div class="field">
        <label for="item-margem">Margem sobre o custo total (%)</label>
        <p
          id="hint-margem"
          class="field-hint"
        >
          Percentual aplicado sobre a soma dos custos acima (markup).
        </p>
        <input
          id="item-margem"
          v-model="margemStr"
          type="text"
          inputmode="decimal"
          name="margem"
          data-testid="margem"
          class="input"
          :class="{ invalid: Boolean(erros.margemPercentual) }"
          :aria-invalid="Boolean(erros.margemPercentual)"
          :aria-describedby="ariaDesc('hint-margem', erros.margemPercentual ? 'err-margem' : undefined)"
        >
        <span
          v-if="erros.margemPercentual"
          id="err-margem"
          class="field-error"
        >{{ erros.margemPercentual }}</span>
      </div>

      <button
        type="submit"
        class="btn-primary"
        data-testid="submit"
      >
        Adicionar à lista
      </button>
    </form>

    <section
      class="lista-section"
      aria-labelledby="lista-titulo"
    >
      <h2
        id="lista-titulo"
        class="section-title"
      >
        Itens cadastrados
      </h2>
      <p
        v-if="itens.length === 0"
        class="empty"
        data-testid="lista-vazia"
      >
        Nenhum item ainda. Preencha o formulário acima.
      </p>
      <ul
        v-else
        class="lista"
        data-testid="lista-itens"
      >
        <li
          v-for="item in itens"
          :key="item.id"
          class="lista-item"
        >
          <span class="lista-nome">{{ item.nome }}</span>
          <dl class="lista-detalhe">
            <div class="lista-dl-row">
              <dt>Matéria-prima</dt>
              <dd>{{ formatarMoedaSimples(item.componentesCusto.materiaPrima) }}</dd>
            </div>
            <div class="lista-dl-row">
              <dt>Embalagem</dt>
              <dd>{{ formatarMoedaSimples(item.componentesCusto.embalagem) }}</dd>
            </div>
            <div class="lista-dl-row">
              <dt>Taxas adm.</dt>
              <dd>{{ formatarMoedaSimples(item.componentesCusto.taxasAdministrativas) }}</dd>
            </div>
            <div class="lista-dl-row">
              <dt>Transporte</dt>
              <dd>{{ formatarMoedaSimples(item.componentesCusto.transporte) }}</dd>
            </div>
          </dl>
          <p class="lista-total">
            Custo unitário total: {{ formatarMoedaSimples(custoTotalItem(item)) }}
            · Margem {{ item.margemPercentual }}%
          </p>
          <p class="lista-preco">
            Preço sugerido: {{ precoExibicao(item) }}
          </p>
        </li>
      </ul>
    </section>
  </main>
</template>

<style scoped>
.app {
  width: 100%;
  max-width: 40rem;
  margin: 0 auto;
  padding: 1.25rem 1rem 2.5rem;
  text-align: left;
  box-sizing: border-box;
}

.hero {
  margin-bottom: 1.75rem;
}

.hero h1 {
  font-size: clamp(1.5rem, 4vw, 2rem);
  margin: 0 0 0.35rem;
  letter-spacing: -0.02em;
}

.tagline {
  margin: 0;
  color: var(--text);
  line-height: 1.45;
  font-size: 0.95rem;
}

.formula-box {
  padding: 0.75rem 0.9rem;
  border-radius: 8px;
  border: 1px dashed var(--accent-border);
  background: var(--accent-bg);
  font-size: 0.88rem;
  line-height: 1.45;
}

.formula-titulo {
  display: block;
  margin-bottom: 0.35rem;
  color: var(--text-h);
}

.formula-texto {
  margin: 0;
  color: var(--text);
}

.field-hint {
  margin: 0;
  font-size: 0.78rem;
  line-height: 1.35;
  color: var(--text);
}

.field-hint-grupo {
  margin-bottom: 0.5rem;
}

.section-title {
  font-size: 1.05rem;
  margin: 0 0 1rem;
  color: var(--text-h);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg);
  box-shadow: var(--shadow);
}

.alert {
  padding: 0.65rem 0.85rem;
  border-radius: 8px;
  background: var(--accent-bg);
  border: 1px solid var(--accent-border);
  color: var(--text-h);
  font-size: 0.9rem;
}

.custo-fieldset {
  margin: 0;
  padding: 0.75rem 0 0;
  border: none;
  border-top: 1px solid var(--border);
}

.fieldset-legend {
  padding: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-h);
}

.grid-custo {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem;
  margin-top: 0.5rem;
}

@media (max-width: 560px) {
  .grid-custo {
    grid-template-columns: 1fr;
  }
}

.custo-preview {
  margin: 0.75rem 0 0;
  font-size: 0.9rem;
  color: var(--text-h);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-h);
}

.input {
  padding: 0.55rem 0.65rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  font: inherit;
  color: var(--text-h);
  background: var(--bg);
}

.input:focus {
  outline: 2px solid var(--accent);
  outline-offset: 1px;
}

.input.invalid {
  border-color: #c02626;
}

.field-error {
  font-size: 0.8rem;
  color: #b91c1c;
}

.btn-primary {
  margin-top: 0.25rem;
  padding: 0.65rem 1rem;
  border: none;
  border-radius: 8px;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  color: var(--text-h);
  background: var(--accent-bg);
  border: 2px solid var(--accent-border);
}

.btn-primary:hover {
  filter: brightness(1.05);
}

.btn-primary:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.lista-section {
  margin-top: 2rem;
}

.empty {
  margin: 0;
  font-size: 0.95rem;
  color: var(--text);
}

.lista {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.lista-item {
  padding: 0.85rem 1rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--code-bg);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.lista-nome {
  font-weight: 600;
  color: var(--text-h);
}

.lista-detalhe {
  margin: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.35rem 1rem;
  font-size: 0.82rem;
}

@media (max-width: 520px) {
  .lista-detalhe {
    grid-template-columns: 1fr;
  }
}

.lista-dl-row {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}

.lista-dl-row dt {
  margin: 0;
  color: var(--text);
  font-weight: 500;
}

.lista-dl-row dd {
  margin: 0;
  color: var(--text-h);
  font-variant-numeric: tabular-nums;
}

.lista-total,
.lista-preco {
  margin: 0;
  font-size: 0.88rem;
  color: var(--text);
}

.lista-preco {
  font-weight: 600;
  color: var(--text-h);
}
</style>
