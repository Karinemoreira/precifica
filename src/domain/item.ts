/** Valores por unidade que compõem o custo antes da margem de venda. */
export type ComponentesCusto = {
  materiaPrima: number
  embalagem: number
  taxasAdministrativas: number
  transporte: number
}

export type Item = {
  id: string
  nome: string
  componentesCusto: ComponentesCusto
  margemPercentual: number
}

export function novoIdItem(): string {
  return crypto.randomUUID()
}
