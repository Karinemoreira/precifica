import { describe, it, expect, beforeEach } from 'vitest'
import {
  ITENS_STORAGE_KEY,
  carregarItensSalvos,
  itemValido,
  persistirItens,
} from './itensLocal'
import type { Item } from '../domain/item'

const exemploItem: Item = {
  id: 'a',
  nome: 'X',
  margemPercentual: 10,
  componentesCusto: {
    materiaPrima: 1,
    embalagem: 2,
    taxasAdministrativas: 3,
    transporte: 4,
  },
}

describe('itemValido', () => {
  it('aceita item bem formado', () => {
    expect(itemValido(exemploItem)).toBe(true)
  })

  it('rejeita objetos incompletos', () => {
    expect(itemValido(null)).toBe(false)
    expect(itemValido({ id: 'a' })).toBe(false)
    expect(
      itemValido({
        ...exemploItem,
        componentesCusto: { materiaPrima: -1, embalagem: 0, taxasAdministrativas: 0, transporte: 0 },
      }),
    ).toBe(false)
  })
})

describe('persistirItens / carregarItensSalvos', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('salva e recupera array válido', () => {
    persistirItens([exemploItem])
    expect(localStorage.getItem(ITENS_STORAGE_KEY)).toBeTruthy()
    expect(carregarItensSalvos()).toEqual([exemploItem])
  })

  it('retorna vazio com JSON inválido ou formato errado', () => {
    localStorage.setItem(ITENS_STORAGE_KEY, 'not-json')
    expect(carregarItensSalvos()).toEqual([])
    localStorage.setItem(ITENS_STORAGE_KEY, JSON.stringify({}))
    expect(carregarItensSalvos()).toEqual([])
  })

  it('filtra entradas inválidas no array', () => {
    localStorage.setItem(ITENS_STORAGE_KEY, JSON.stringify([exemploItem, { id: 1 }]))
    expect(carregarItensSalvos()).toEqual([exemploItem])
  })
})
