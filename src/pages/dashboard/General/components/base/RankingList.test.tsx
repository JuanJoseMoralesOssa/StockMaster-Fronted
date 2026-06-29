// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, it, expect } from 'vitest'
import RankingList from './RankingList'

afterEach(cleanup)

const fmt = (v: number) => `${v}`

describe('RankingList', () => {
  it('muestra compras (↑) y pagos (↓) por separado cuando ambos > 0', () => {
    const { container } = render(
      <RankingList
        title="Proveedores"
        valueFormatter={fmt}
        items={[
          { id: 1, name: 'Prov A', primaryValue: 100, purchaseValue: 100, paymentValue: 60, primaryLabel: 'kg' },
        ]}
      />,
    )
    const text = container.textContent ?? ''
    expect(text).toContain('↑')
    expect(text).toContain('↓')
    expect(text).toContain('100')
    expect(text).toContain('60')
  })

  it('cae al primaryValue (sin desglose) cuando compras y pagos son 0', () => {
    const { container } = render(
      <RankingList
        title="Proveedores"
        valueFormatter={(v) => `K${v}`}
        items={[
          { id: 1, name: 'Prov A', primaryValue: 42, purchaseValue: 0, paymentValue: 0, primaryLabel: 'kg' },
        ]}
      />,
    )
    const text = container.textContent ?? ''
    expect(text).toContain('K42')
    expect(text).not.toContain('↑')
    expect(text).not.toContain('↓')
  })

  it('no renderiza nada cuando no hay items', () => {
    const { container } = render(<RankingList title="x" items={[]} />)
    expect(container.firstChild).toBeNull()
  })
})
