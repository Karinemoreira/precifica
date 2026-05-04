/** Item cadastrado para precificação (valores já validados). */
export type Item = {
  id: string
  nome: string
  custoUnitario: number
  margemPercentual: number
}

export function novoIdItem(): string {
  return crypto.randomUUID()
}
