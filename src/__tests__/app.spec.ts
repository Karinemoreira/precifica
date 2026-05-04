import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App', () => {
  it('mostra o nome do produto', () => {
    const wrapper = mount(App)
    expect(wrapper.text()).toContain('Precifica')
  })
})
