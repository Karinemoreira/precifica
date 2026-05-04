import type { ComponentesCusto } from './item'

/**
 * Margem percentual sobre o **custo total** (soma dos componentes), entre 0 e 100.
 * Preço sugerido = custoTotal × (1 + margem/100).
 */
export const MARGEM_PERCENTUAL_MIN = 0
export const MARGEM_PERCENTUAL_MAX = 100

export function somarComponentesCusto(c: ComponentesCusto): number {
  return c.materiaPrima + c.embalagem + c.taxasAdministrativas + c.transporte
}

export function calcularPrecoVenda(custoUnitario: number, margemPercentual: number): number {
  return custoUnitario * (1 + margemPercentual / 100)
}

export type ErrosFormularioItem = Partial<
  Record<
    | 'nome'
    | 'margemPercentual'
    | keyof ComponentesCusto,
    string
  >
>

const CHAVES_COMPONENTES: (keyof ComponentesCusto)[] = [
  'materiaPrima',
  'embalagem',
  'taxasAdministrativas',
  'transporte',
]

const MENSAGEM_COMPONENTE = 'Informe um número maior ou igual a zero.'

export function validarItemParaCadastro(input: {
  nome: string
  componentesCusto: ComponentesCusto
  margemPercentual: number
}): ErrosFormularioItem {
  const erros: ErrosFormularioItem = {}
  const nome = input.nome.trim()
  if (!nome) {
    erros.nome = 'Informe o nome do item.'
  }
  for (const chave of CHAVES_COMPONENTES) {
    const v = input.componentesCusto[chave]
    if (!Number.isFinite(v) || v < 0) {
      erros[chave] = MENSAGEM_COMPONENTE
    }
  }
  if (
    !Number.isFinite(input.margemPercentual) ||
    input.margemPercentual < MARGEM_PERCENTUAL_MIN ||
    input.margemPercentual > MARGEM_PERCENTUAL_MAX
  ) {
    erros.margemPercentual = `Margem deve estar entre ${MARGEM_PERCENTUAL_MIN} e ${MARGEM_PERCENTUAL_MAX}%.`
  }
  return erros
}

export function formularioTemErros(erros: ErrosFormularioItem): boolean {
  return Object.keys(erros).length > 0
}

/** Aceita vírgula ou ponto como separador decimal. String vazia → NaN (não confundir com 0). */
export function parseNumeroDecimal(valor: string): number {
  const s = String(valor).trim()
  if (s === '') return NaN
  return Number(s.replace(',', '.'))
}
