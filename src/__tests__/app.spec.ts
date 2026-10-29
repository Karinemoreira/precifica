import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import App from '../App.vue'
import { ITENS_STORAGE_KEY } from '../storage/itensLocal'

async function preencherItemValido(
  wrapper: ReturnType<typeof mount>,
  valores = {
    nome: 'Caneca',
    materiaPrima: '10',
    embalagem: '3',
    taxas: '1',
    transporte: '1',
    margem: '50',
  },
) {
  await wrapper.get('[data-testid="nome"]').setValue(valores.nome)
  await wrapper.get('[data-testid="materia-prima"]').setValue(valores.materiaPrima)
  await wrapper.get('[data-testid="embalagem"]').setValue(valores.embalagem)
  await wrapper.get('[data-testid="taxas"]').setValue(valores.taxas)
  await wrapper.get('[data-testid="transporte"]').setValue(valores.transporte)
  await wrapper.get('[data-testid="margem"]').setValue(valores.margem)
}

function textoNormalizado(wrapper: ReturnType<typeof mount>): string {
  return wrapper.text().replace(/\u00a0/g, ' ')
}

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
    vi.spyOn(globalThis, 'confirm').mockReturnValue(true)
  })

  it('mostra o nome do produto', () => {
    const wrapper = mount(App)
    expect(wrapper.text()).toContain('Precifica')
  })

  it('mostra erros ao enviar formulário vazio', async () => {
    const wrapper = mount(App)
    await wrapper.get('form').trigger('submit.prevent')
    expect(wrapper.text()).toContain('Informe o nome do item.')
    expect(wrapper.text()).toContain('Corrija os campos destacados.')
  })

  it('INT-01 cadastra item, calcula o preço e limpa o formulário', async () => {
    const wrapper = mount(App)
    await preencherItemValido(wrapper)
    await wrapper.get('form').trigger('submit.prevent')

    expect(wrapper.find('[data-testid="lista-vazia"]').exists()).toBe(false)
    const lista = textoNormalizado(wrapper.get('[data-testid="lista-itens"]'))
    expect(lista).toContain('Caneca')
    expect(lista).toContain('Custo unitário total: R$ 15,00')
    expect(lista).toContain('Margem 50%')
    expect(lista).toContain('Preço sugerido: R$ 22,50')
    expect((wrapper.get('[data-testid="nome"]').element as HTMLInputElement).value).toBe('')
  })

  it('INT-02 aceita margem zero e exibe o custo como preço', async () => {
    const wrapper = mount(App)
    await preencherItemValido(wrapper, { nome: 'Caderno', materiaPrima: '10', embalagem: '2', taxas: '1', transporte: '2', margem: '0' })
    await wrapper.get('form').trigger('submit.prevent')

    expect(textoNormalizado(wrapper.get('[data-testid="lista-itens"]'))).toContain(
      'Preço sugerido: R$ 15,00',
    )
  })

  it('INT-03 aceita margem máxima de 100% e dobra o custo', async () => {
    const wrapper = mount(App)
    await preencherItemValido(wrapper, { nome: 'Kit', materiaPrima: '10', embalagem: '0', taxas: '0', transporte: '0', margem: '100' })
    await wrapper.get('form').trigger('submit.prevent')

    expect(textoNormalizado(wrapper.get('[data-testid="lista-itens"]'))).toContain(
      'Preço sugerido: R$ 20,00',
    )
  })

  it('INT-04 aceita custo zero e exibe preço zero', async () => {
    const wrapper = mount(App)
    await preencherItemValido(wrapper, { nome: 'Brinde', materiaPrima: '0', embalagem: '0', taxas: '0', transporte: '0', margem: '100' })
    await wrapper.get('form').trigger('submit.prevent')

    const lista = textoNormalizado(wrapper.get('[data-testid="lista-itens"]'))
    expect(lista).toContain('Custo unitário total: R$ 0,00')
    expect(lista).toContain('Preço sugerido: R$ 0,00')
  })

  it('INT-05 rejeita margem acima de 100% sem cadastrar item', async () => {
    const wrapper = mount(App)
    await preencherItemValido(wrapper, { nome: 'Produto inválido', materiaPrima: '10', embalagem: '0', taxas: '0', transporte: '0', margem: '100,01' })
    await wrapper.get('form').trigger('submit.prevent')

    expect(wrapper.text()).toContain('Margem deve estar entre 0 e 100%.')
    expect(wrapper.find('[data-testid="lista-vazia"]').exists()).toBe(true)
    expect(localStorage.getItem(ITENS_STORAGE_KEY)).toBe('[]')
  })

  it('INT-09 rejeita custos negativos, não numéricos e não finitos', async () => {
    const casos = [
      ['-1', 'Informe um número maior ou igual a zero.'],
      ['texto', 'Informe um número maior ou igual a zero.'],
      ['Infinity', 'Informe um número maior ou igual a zero.'],
    ]

    for (const [valor, mensagem] of casos) {
      localStorage.clear()
      const wrapper = mount(App)
      await preencherItemValido(wrapper, { nome: 'Item inválido', materiaPrima: valor, embalagem: '0', taxas: '0', transporte: '0', margem: '0' })
      await wrapper.get('form').trigger('submit.prevent')

      expect(wrapper.text()).toContain(mensagem)
      expect(wrapper.find('[data-testid="lista-vazia"]').exists()).toBe(true)
      wrapper.unmount()
    }
  })

  it('INT-10 rejeita margem abaixo de 0%', async () => {
    const wrapper = mount(App)
    await preencherItemValido(wrapper, { nome: 'Item inválido', materiaPrima: '10', embalagem: '0', taxas: '0', transporte: '0', margem: '-0,01' })
    await wrapper.get('form').trigger('submit.prevent')

    expect(wrapper.text()).toContain('Margem deve estar entre 0 e 100%.')
    expect(wrapper.find('[data-testid="lista-vazia"]').exists()).toBe(true)
  })

  it('INT-11 rejeita nome vazio ou composto apenas por espaços', async () => {
    for (const nome of ['', '   ']) {
      localStorage.clear()
      const wrapper = mount(App)
      await preencherItemValido(wrapper, { nome, materiaPrima: '10', embalagem: '0', taxas: '0', transporte: '0', margem: '0' })
      await wrapper.get('form').trigger('submit.prevent')

      expect(wrapper.text()).toContain('Informe o nome do item.')
      expect(wrapper.find('[data-testid="lista-vazia"]').exists()).toBe(true)
      wrapper.unmount()
    }
  })

  it('INT-12 interpreta valores monetários com vírgula e ponto decimal', async () => {
    const casos = [
      ['12,50', 'R$ 12,50'],
      ['12.50', 'R$ 12,50'],
    ]

    for (const [valor, custoFormatado] of casos) {
      localStorage.clear()
      const wrapper = mount(App)
      await preencherItemValido(wrapper, { nome: 'Decimal', materiaPrima: valor, embalagem: '0', taxas: '0', transporte: '0', margem: '0' })
      await wrapper.get('form').trigger('submit.prevent')

      expect(textoNormalizado(wrapper.get('[data-testid="lista-itens"]'))).toContain(
        `Custo unitário total: ${custoFormatado}`,
      )
      wrapper.unmount()
    }
  })

  it('INT-13 inicia com lista vazia quando a leitura do localStorage falha', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage indisponível')
    })

    const wrapper = mount(App)

    expect(wrapper.find('[data-testid="lista-vazia"]').exists()).toBe(true)
  })

  it('INT-06 edita item e atualiza a lista', async () => {
    const wrapper = mount(App)
    await preencherItemValido(wrapper)
    await wrapper.get('form').trigger('submit.prevent')

    await wrapper.get('[data-testid="editar-item"]').trigger('click')
    expect(wrapper.text()).toContain('Editar item')

    await wrapper.get('[data-testid="nome"]').setValue('Caneca especial')
    await wrapper.get('form').trigger('submit.prevent')

    expect(wrapper.text()).toContain('Caneca especial')
    expect(wrapper.text()).toContain('Novo item')
  })

  it('INT-07 remove item após confirmação', async () => {
    const wrapper = mount(App)
    await preencherItemValido(wrapper)
    await wrapper.get('form').trigger('submit.prevent')

    await wrapper.get('[data-testid="remover-item"]').trigger('click')
    expect(globalThis.confirm).toHaveBeenCalled()
    expect(wrapper.find('[data-testid="lista-vazia"]').exists()).toBe(true)
  })

  it('INT-08 persiste os dados necessários e recalcula o preço entre montagens', async () => {
    const first = mount(App)
    await nextTick()
    await preencherItemValido(first)
    await first.get('form').trigger('submit.prevent')
    await nextTick()
    expect(first.text()).toContain('Caneca')
    const raw = localStorage.getItem(ITENS_STORAGE_KEY)
    expect(raw).toBeTruthy()
    const itensSalvos = JSON.parse(raw as string)
    expect(itensSalvos.some((x: { nome: string }) => x.nome === 'Caneca')).toBe(true)
    expect(itensSalvos[0]).not.toHaveProperty('precoSugerido')
    first.unmount()

    const second = mount(App)
    await nextTick()
    expect(second.text()).toContain('Caneca')
    expect(textoNormalizado(second.get('[data-testid="lista-itens"]'))).toContain(
      'Preço sugerido: R$ 22,50',
    )
    second.unmount()
  })
})
