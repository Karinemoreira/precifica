import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App', () => {
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
    await wrapper.get('[data-testid="nome"]').setValue('Caneca')
    await wrapper.get('[data-testid="custo"]').setValue('20')
    await wrapper.get('[data-testid="margem"]').setValue('50')
    await wrapper.get('form').trigger('submit.prevent')

    expect(wrapper.find('[data-testid="lista-vazia"]').exists()).toBe(false)
    expect(wrapper.get('[data-testid="lista-itens"]').text()).toContain('Caneca')
    expect(wrapper.get('[data-testid="lista-itens"]').text()).toContain('Preço sugerido')
    expect((wrapper.get('[data-testid="nome"]').element as HTMLInputElement).value).toBe('')
  })
})
