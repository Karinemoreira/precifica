<script setup lang="ts">
import { ref } from 'vue'
import type { Item } from './domain/item'
import { novoIdItem } from './domain/item'
import {
  calcularPrecoVenda,
  validarItemParaCadastro,
  formularioTemErros,
  parseNumeroDecimal,
  type ErrosFormularioItem,
} from './domain/precificacao'

const itens = ref<Item[]>([])
const nome = ref('')
const custoStr = ref('')
const margemStr = ref('')
const erros = ref<ErrosFormularioItem>({})

function formatarMoedaSimples(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function adicionarItem(): void {
  erros.value = {}
  const custoUnitario = parseNumeroDecimal(custoStr.value)
  const margemPercentual = parseNumeroDecimal(margemStr.value)
  const validacao = validarItemParaCadastro({
    nome: nome.value,
    custoUnitario,
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
      custoUnitario,
      margemPercentual,
    },
  ]
  nome.value = ''
  custoStr.value = ''
  margemStr.value = ''
}

function precoExibicao(item: Item): string {
  return formatarMoedaSimples(calcularPrecoVenda(item.custoUnitario, item.margemPercentual))
}
</script>

<template>
  <main class="app">
    <header class="hero">
      <h1>Precifica</h1>
      <p class="tagline">
        Precificação por custo e margem — adicione itens e veja o preço sugerido.
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

      <p
        v-if="formularioTemErros(erros)"
        class="alert"
        role="alert"
      >
        Corrija os campos destacados.
      </p>

      <div class="field">
        <label for="item-nome">Nome</label>
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
          :aria-describedby="erros.nome ? 'err-nome' : undefined"
        >
        <span
          v-if="erros.nome"
          id="err-nome"
          class="field-error"
        >{{ erros.nome }}</span>
      </div>

      <div class="field-row">
        <div class="field">
          <label for="item-custo">Custo unitário</label>
          <input
            id="item-custo"
            v-model="custoStr"
            type="text"
            inputmode="decimal"
            name="custo"
            placeholder="0 ou 10,50"
            data-testid="custo"
            class="input"
            :class="{ invalid: Boolean(erros.custoUnitario) }"
            :aria-invalid="Boolean(erros.custoUnitario)"
            :aria-describedby="erros.custoUnitario ? 'err-custo' : undefined"
          >
          <span
            v-if="erros.custoUnitario"
            id="err-custo"
            class="field-error"
          >{{ erros.custoUnitario }}</span>
        </div>
        <div class="field">
          <label for="item-margem">Margem (%)</label>
          <input
            id="item-margem"
            v-model="margemStr"
            type="text"
            inputmode="decimal"
            name="margem"
            placeholder="0 a 100"
            data-testid="margem"
            class="input"
            :class="{ invalid: Boolean(erros.margemPercentual) }"
            :aria-invalid="Boolean(erros.margemPercentual)"
            :aria-describedby="erros.margemPercentual ? 'err-margem' : undefined"
          >
          <span
            v-if="erros.margemPercentual"
            id="err-margem"
            class="field-error"
          >{{ erros.margemPercentual }}</span>
        </div>
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
          <span class="lista-meta">
            Custo {{ formatarMoedaSimples(item.custoUnitario) }} · Margem {{ item.margemPercentual }}%
          </span>
          <span class="lista-preco"> Preço sugerido: {{ precoExibicao(item) }} </span>
        </li>
      </ul>
    </section>
  </main>
</template>

<style scoped>
.app {
  width: 100%;
  max-width: 36rem;
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

.alert p {
  margin: 0.2rem 0;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

@media (max-width: 520px) {
  .field-row {
    grid-template-columns: 1fr;
  }
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
  gap: 0.25rem;
}

.lista-nome {
  font-weight: 600;
  color: var(--text-h);
}

.lista-meta,
.lista-preco {
  font-size: 0.88rem;
  color: var(--text);
}

.lista-preco {
  font-weight: 600;
  color: var(--text-h);
}
</style>
