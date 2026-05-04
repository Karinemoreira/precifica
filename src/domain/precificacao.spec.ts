import { describe, it, expect } from 'vitest'
import {
  calcularPrecoVenda,
  validarItemParaCadastro,
  formularioTemErros,
  parseNumeroDecimal,
  MARGEM_PERCENTUAL_MAX,
  MARGEM_PERCENTUAL_MIN,
} from './precificacao'

describe('calcularPrecoVenda', () => {
  it('aplica margem percentual sobre o custo', () => {
    expect(calcularPrecoVenda(100, 50)).toBe(150)
    expect(calcularPrecoVenda(10, 20)).toBe(12)
  })

  it('com custo zero o preço é zero para qualquer margem válida', () => {
    expect(calcularPrecoVenda(0, 10)).toBe(0)
    expect(calcularPrecoVenda(0, 0)).toBe(0)
  })

  it('com margem zero o preço iguala o custo', () => {
    expect(calcularPrecoVenda(99.5, 0)).toBe(99.5)
  })

  it('margem máxima (100%) dobra o custo', () => {
    expect(calcularPrecoVenda(80, 100)).toBe(160)
  })

  it('aceita decimais no custo e na margem', () => {
    expect(calcularPrecoVenda(10.5, 12.5)).toBeCloseTo(11.8125, 10)
  })
})

describe('validarItemParaCadastro', () => {
  it('aceita item válido', () => {
    const erros = validarItemParaCadastro({
      nome: 'Produto A',
      custoUnitario: 10,
      margemPercentual: 25,
    })
    expect(formularioTemErros(erros)).toBe(false)
  })

  it('rejeita nome vazio ou só espaços', () => {
    expect(validarItemParaCadastro({ nome: '', custoUnitario: 1, margemPercentual: 0 }).nome).toBe(
      'Informe o nome do item.',
    )
    expect(
      validarItemParaCadastro({ nome: '   ', custoUnitario: 1, margemPercentual: 0 }).nome,
    ).toBe('Informe o nome do item.')
  })

  it('rejeita custo negativo ou não finito', () => {
    expect(
      validarItemParaCadastro({ nome: 'x', custoUnitario: -1, margemPercentual: 0 }).custoUnitario,
    ).toBeTruthy()
    expect(
      validarItemParaCadastro({ nome: 'x', custoUnitario: NaN, margemPercentual: 0 }).custoUnitario,
    ).toBeTruthy()
    expect(
      validarItemParaCadastro({ nome: 'x', custoUnitario: Number.POSITIVE_INFINITY, margemPercentual: 0 })
        .custoUnitario,
    ).toBeTruthy()
  })

  it('aceita custo zero', () => {
    const erros = validarItemParaCadastro({
      nome: 'Brinde',
      custoUnitario: 0,
      margemPercentual: 10,
    })
    expect(erros.custoUnitario).toBeUndefined()
  })

  it('rejeita margem fora do intervalo', () => {
    expect(
      validarItemParaCadastro({ nome: 'x', custoUnitario: 1, margemPercentual: -0.01 })
        .margemPercentual,
    ).toContain(String(MARGEM_PERCENTUAL_MIN))
    expect(
      validarItemParaCadastro({
        nome: 'x',
        custoUnitario: 1,
        margemPercentual: MARGEM_PERCENTUAL_MAX + 1,
      }).margemPercentual,
    ).toBeTruthy()
    expect(
      validarItemParaCadastro({ nome: 'x', custoUnitario: 1, margemPercentual: NaN })
        .margemPercentual,
    ).toBeTruthy()
  })

  it('aceita margem nos limites', () => {
    expect(
      formularioTemErros(
        validarItemParaCadastro({ nome: 'a', custoUnitario: 1, margemPercentual: MARGEM_PERCENTUAL_MIN }),
      ),
    ).toBe(false)
    expect(
      formularioTemErros(
        validarItemParaCadastro({ nome: 'a', custoUnitario: 1, margemPercentual: MARGEM_PERCENTUAL_MAX }),
      ),
    ).toBe(false)
  })
})

describe('parseNumeroDecimal', () => {
  it('interpreta vírgula e ponto', () => {
    expect(parseNumeroDecimal('12,5')).toBe(12.5)
    expect(parseNumeroDecimal('12.5')).toBe(12.5)
    expect(parseNumeroDecimal('  3  ')).toBe(3)
  })

  it('string vazia vira NaN', () => {
    expect(parseNumeroDecimal('')).toBeNaN()
  })
})
