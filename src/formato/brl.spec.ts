import { describe, it, expect } from 'vitest'
import { formatarBrl } from './brl'

describe('formatarBrl', () => {
  it('formata em Real com duas casas decimais', () => {
    const s = formatarBrl(10.5)
    expect(s).toMatch(/10/)
    expect(s).toMatch(/50/)
    expect(s).toContain('R$')
  })

  it('formata zero', () => {
    expect(formatarBrl(0)).toContain('0')
  })
})
