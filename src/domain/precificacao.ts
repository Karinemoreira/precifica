/**
 * Política do MVP: margem é percentual **sobre o custo** (markup), entre 0 e 100 inclusive.
 * Preço sugerido = custo × (1 + margem/100).
 */
export const MARGEM_PERCENTUAL_MIN = 0
export const MARGEM_PERCENTUAL_MAX = 100

export function calcularPrecoVenda(custoUnitario: number, margemPercentual: number): number {
  return custoUnitario * (1 + margemPercentual / 100)
}

export type ErrosFormularioItem = Partial<
  Record<'nome' | 'custoUnitario' | 'margemPercentual', string>
>

export function validarItemParaCadastro(input: {
  nome: string
  custoUnitario: number
  margemPercentual: number
}): ErrosFormularioItem {
  const erros: ErrosFormularioItem = {}
  const nome = input.nome.trim()
  if (!nome) {
    erros.nome = 'Informe o nome do item.'
  }
  if (!Number.isFinite(input.custoUnitario) || input.custoUnitario < 0) {
    erros.custoUnitario = 'Custo deve ser um número maior ou igual a zero.'
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
