/** Formatação monetária consistente em Real (pt-BR), via `Intl.NumberFormat`. */
const formatadorBrl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatarBrl(valor: number): string {
  return formatadorBrl.format(valor)
}
