import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import App from '../App.vue'
import { ITENS_STORAGE_KEY } from '../storage/itensLocal'

async function preencherItemValido(wrapper: ReturnType<typeof mount>) {
  await wrapper.get('[data-testid="nome"]').setValue('Caneca')
  await wrapper.get('[data-testid="materia-prima"]').setValue('10')
  await wrapper.get('[data-testid="embalagem"]').setValue('3')
  await wrapper.get('[data-testid="taxas"]').setValue('1')
  await wrapper.get('[data-testid="transporte"]').setValue('1')
  await wrapper.get('[data-testid="margem"]').setValue('50')
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

  it('adiciona item válido à lista e limpa o formulário', async () => {
    const wrapper = mount(App)
    await preencherItemValido(wrapper)
    await wrapper.get('form').trigger('submit.prevent')

    expect(wrapper.find('[data-testid="lista-vazia"]').exists()).toBe(false)
    expect(wrapper.get('[data-testid="lista-itens"]').text()).toContain('Caneca')
    expect(wrapper.get('[data-testid="lista-itens"]').text()).toContain('Custo unitário total')
    expect(wrapper.get('[data-testid="lista-itens"]').text()).toContain('Preço sugerido')
    expect((wrapper.get('[data-testid="nome"]').element as HTMLInputElement).value).toBe('')
  })

  it('edita item e atualiza a lista', async () => {
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

  it('remove item após confirmação', async () => {
    const wrapper = mount(App)
    await preencherItemValido(wrapper)
    await wrapper.get('form').trigger('submit.prevent')

    await wrapper.get('[data-testid="remover-item"]').trigger('click')
    expect(globalThis.confirm).toHaveBeenCalled()
    expect(wrapper.find('[data-testid="lista-vazia"]').exists()).toBe(true)
  })

  it('persiste itens no localStorage entre montagens', async () => {
    const first = mount(App)
    await nextTick()
    await preencherItemValido(first)
    await first.get('form').trigger('submit.prevent')
    await nextTick()
    expect(first.text()).toContain('Caneca')
    const raw = localStorage.getItem(ITENS_STORAGE_KEY)
    expect(raw).toBeTruthy()
    expect(JSON.parse(raw as string).some((x: { nome: string }) => x.nome === 'Caneca')).toBe(true)
    first.unmount()

    const second = mount(App)
    await nextTick()
    expect(second.text()).toContain('Caneca')
    second.unmount()
  })
})
