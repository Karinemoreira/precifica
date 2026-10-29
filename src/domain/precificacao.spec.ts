import { describe, it, expect } from 'vitest'
import {
  calcularPrecoVenda,
  validarItemParaCadastro,
  formularioTemErros,
  parseNumeroDecimal,
  somarComponentesCusto,
} from './precificacao'

const componentesOk = {
  materiaPrima: 10,
  embalagem: 2,
  taxasAdministrativas: 1,
  transporte: 2,
}

describe('somarComponentesCusto', () => {
  it('soma os quatro componentes', () => {
    expect(somarComponentesCusto(componentesOk)).toBe(15)
  })

  it('aceita zeros', () => {
    expect(
      somarComponentesCusto({
        materiaPrima: 0,
        embalagem: 0,
        taxasAdministrativas: 0,
        transporte: 5,
      }),
    ).toBe(5)
  })
})

describe('calcularPrecoVenda', () => {
  it('aplica margem percentual sobre o custo total', () => {
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
      componentesCusto: componentesOk,
      margemPercentual: 25,
    })
    expect(formularioTemErros(erros)).toBe(false)
  })

  it('rejeita nome vazio ou só espaços', () => {
    expect(
      validarItemParaCadastro({
        nome: '',
        componentesCusto: componentesOk,
        margemPercentual: 0,
      }).nome,
    ).toBe('Informe o nome do item.')
    expect(
      validarItemParaCadastro({
        nome: '   ',
        componentesCusto: componentesOk,
        margemPercentual: 0,
      }).nome,
    ).toBe('Informe o nome do item.')
  })

  it('rejeita componente negativo ou não finito', () => {
    const casos = [
      ['materiaPrima', -1],
      ['embalagem', NaN],
      ['taxasAdministrativas', Infinity],
      ['transporte', -Infinity],
    ] as const

    for (const [campo, valor] of casos) {
      const erros = validarItemParaCadastro({
        nome: 'x',
        componentesCusto: { ...componentesOk, [campo]: valor },
        margemPercentual: 0,
      })

      expect(erros[campo]).toBe('Informe um número maior ou igual a zero.')
    }
  })

  it('aceita todos os componentes zero', () => {
    const erros = validarItemParaCadastro({
      nome: 'Brinde',
      componentesCusto: {
        materiaPrima: 0,
        embalagem: 0,
        taxasAdministrativas: 0,
        transporte: 0,
      },
      margemPercentual: 10,
    })
    expect(erros.materiaPrima).toBeUndefined()
    expect(erros.embalagem).toBeUndefined()
  })

  it('rejeita margem fora do intervalo', () => {
    expect(
      validarItemParaCadastro({
        nome: 'x',
        componentesCusto: componentesOk,
        margemPercentual: -0.01,
      }).margemPercentual,
    ).toBe('Margem deve estar entre 0 e 100%.')
    expect(
      validarItemParaCadastro({
        nome: 'x',
        componentesCusto: componentesOk,
        margemPercentual: 100.01,
      }).margemPercentual,
    ).toBe('Margem deve estar entre 0 e 100%.')
    expect(
      validarItemParaCadastro({
        nome: 'x',
        componentesCusto: componentesOk,
        margemPercentual: NaN,
      }).margemPercentual,
    ).toBe('Margem deve estar entre 0 e 100%.')
  })

  it('aceita margem nos limites', () => {
    expect(
      formularioTemErros(
        validarItemParaCadastro({
          nome: 'a',
          componentesCusto: componentesOk,
          margemPercentual: 0,
        }),
      ),
    ).toBe(false)
    expect(
      formularioTemErros(
        validarItemParaCadastro({
          nome: 'a',
          componentesCusto: componentesOk,
          margemPercentual: 100,
        }),
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
