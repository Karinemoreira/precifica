import type { ComponentesCusto, Item } from '../domain/item'

export const ITENS_STORAGE_KEY = 'precifica-itens-v1'

function componentesValidos(o: unknown): o is ComponentesCusto {
  if (!o || typeof o !== 'object') return false
  const c = o as Record<string, unknown>
  const keys: (keyof ComponentesCusto)[] = [
    'materiaPrima',
    'embalagem',
    'taxasAdministrativas',
    'transporte',
  ]
  return keys.every((k) => {
    const v = c[k]
    return typeof v === 'number' && Number.isFinite(v) && v >= 0
  })
}

/** Valida estrutura vinda do JSON (ex.: localStorage). */
export function itemValido(o: unknown): o is Item {
  if (!o || typeof o !== 'object') return false
  const x = o as Record<string, unknown>
  return (
    typeof x.id === 'string' &&
    typeof x.nome === 'string' &&
    typeof x.margemPercentual === 'number' &&
    Number.isFinite(x.margemPercentual) &&
    componentesValidos(x.componentesCusto)
  )
}

export function carregarItensSalvos(): Item[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(ITENS_STORAGE_KEY)
    if (!raw) return []
    const data = JSON.parse(raw) as unknown
    if (!Array.isArray(data)) return []
    return data.filter(itemValido)
  } catch {
    return []
  }
}

export function persistirItens(itens: Item[]): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(ITENS_STORAGE_KEY, JSON.stringify(itens))
}
